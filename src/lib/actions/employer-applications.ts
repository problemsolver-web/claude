'use server'

import { createClient } from '@/lib/supabase/server'
import type { Application, ApplicationStatus, User } from '@/types/database'

export interface ApplicantWithProfile extends Application {
  user: User
}

export interface ApplicantsFilter {
  status?: ApplicationStatus
  minScore?: number
  degree?: string
  skill?: string
}

/**
 * Get all applicants for a specific job, with user profile data.
 * Only accessible by the employer who owns the job.
 */
export async function getJobApplicants(
  jobId: string,
  filters: ApplicantsFilter = {}
): Promise<ApplicantWithProfile[]> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return []
  }

  // Verify employer owns the job
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (!company) {
    return []
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!job) {
    return []
  }

  // Get applications with user profiles
  let query = supabase
    .from('applications')
    .select('*, users(*)')
    .eq('job_id', jobId)
    .order('match_score', { ascending: false, nullsFirst: false })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.minScore) {
    query = query.gte('match_score', filters.minScore)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching applicants:', error)
    return []
  }

  let applicants = (data || []).map((item: Record<string, unknown>) => {
    const { users, ...application } = item
    return {
      ...application,
      user: users as User,
    }
  }) as ApplicantWithProfile[]

  // Client-side filters for array fields
  if (filters.degree) {
    applicants = applicants.filter(a => a.user.degree === filters.degree)
  }

  if (filters.skill) {
    applicants = applicants.filter(a =>
      a.user.skills.some(s => s.toLowerCase().includes(filters.skill!.toLowerCase()))
    )
  }

  return applicants
}

/**
 * Get a single applicant's full profile for a specific job.
 * Only accessible by the employer who owns the job.
 */
export async function getApplicantProfile(
  jobId: string,
  applicationId: string
): Promise<ApplicantWithProfile | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return null
  }

  // Verify employer owns the job
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (!company) {
    return null
  }

  const { data: job } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!job) {
    return null
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*, users(*)')
    .eq('id', applicationId)
    .eq('job_id', jobId)
    .single()

  if (error || !data) {
    return null
  }

  const { users, ...application } = data as Record<string, unknown>
  return {
    ...application,
    user: users as User,
  } as ApplicantWithProfile
}

/**
 * Valid status transitions:
 * - pending -> shortlisted
 * - pending -> rejected
 * - shortlisted -> accepted
 * - shortlisted -> rejected
 *
 * Cannot go from pending directly to accepted.
 * Cannot change status from accepted or rejected.
 */
function isValidTransition(currentStatus: ApplicationStatus, newStatus: ApplicationStatus): boolean {
  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    pending: ['shortlisted', 'rejected'],
    shortlisted: ['accepted', 'rejected'],
    accepted: [],
    rejected: [],
  }

  return validTransitions[currentStatus]?.includes(newStatus) ?? false
}

/**
 * Update an application's status with validation.
 * When accepting a candidate, also creates a conversation record.
 */
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: ApplicationStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'Not authenticated' }
  }

  // Get employer's company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (!company) {
    return { success: false, error: 'Company not found' }
  }

  // Get the application and verify ownership through job -> company chain
  const { data: application } = await supabase
    .from('applications')
    .select('*, jobs(company_id)')
    .eq('id', applicationId)
    .single()

  if (!application) {
    return { success: false, error: 'Application not found' }
  }

  const appData = application as Record<string, unknown>
  const jobInfo = appData.jobs as { company_id: string } | null

  if (!jobInfo || jobInfo.company_id !== company.id) {
    return { success: false, error: 'You do not have permission to update this application' }
  }

  const currentStatus = appData.status as ApplicationStatus

  // Validate state transition
  if (!isValidTransition(currentStatus, newStatus)) {
    return {
      success: false,
      error: `Cannot change status from "${currentStatus}" to "${newStatus}". ${
        currentStatus === 'pending' && newStatus === 'accepted'
          ? 'You must shortlist a candidate before accepting them.'
          : 'This status transition is not allowed.'
      }`,
    }
  }

  // Update the application status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status: newStatus })
    .eq('id', applicationId)

  if (updateError) {
    console.error('Error updating application status:', updateError)
    return { success: false, error: 'Failed to update application status.' }
  }

  // If accepting, create a conversation for messaging
  if (newStatus === 'accepted') {
    const userId = appData.user_id as string

    const { error: convError } = await supabase
      .from('conversations')
      .insert({
        application_id: applicationId,
        company_id: company.id,
        user_id: userId,
      })

    if (convError) {
      // Log but don't fail the status update
      console.error('Error creating conversation:', convError)
    }
  }

  return { success: true }
}
