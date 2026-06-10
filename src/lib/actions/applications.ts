'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateMatchScore } from '@/lib/matching/engine'
import type { Application, Job, User } from '@/types/database'

export interface ApplicationWithJob extends Application {
  job_title?: string
  company_name?: string
}

/**
 * Apply to a job. Prevents duplicate applications (same user + same job).
 * Calculates and stores the match score at application time.
 */
export async function applyToJob(
  jobId: string,
  coverLetter?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current user
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { success: false, error: 'You must be logged in to apply' }
  }

  // Check if user already applied (duplicate prevention)
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', authUser.id)
    .single()

  if (existingApplication) {
    return { success: false, error: 'You have already applied to this job' }
  }

  // Get user profile for match scoring
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!userProfile) {
    return { success: false, error: 'User profile not found' }
  }

  // Get job details for match scoring
  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (!job) {
    return { success: false, error: 'Job not found' }
  }

  // Calculate match score
  const matchResult = calculateMatchScore(userProfile as User, job as Job)

  // Create the application
  const { error } = await supabase.from('applications').insert({
    job_id: jobId,
    user_id: authUser.id,
    cover_letter: coverLetter || null,
    match_score: matchResult.percentage,
    score_breakdown: matchResult.breakdown as unknown as Record<string, unknown>,
  })

  if (error) {
    // Handle unique constraint violation (duplicate application)
    if (error.code === '23505') {
      return { success: false, error: 'You have already applied to this job' }
    }
    console.error('Error applying to job:', error)
    return { success: false, error: 'Failed to submit application. Please try again.' }
  }

  return { success: true }
}

/**
 * Get all applications for the current user with job details.
 */
export async function getUserApplications(): Promise<ApplicationWithJob[]> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return []
  }

  const { data, error } = await supabase
    .from('applications')
    .select('*, jobs(title, companies(name))')
    .eq('user_id', authUser.id)
    .order('applied_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return []
  }

  return (data || []).map((item: Record<string, unknown>) => {
    const { jobs, ...application } = item
    const jobInfo = jobs as { title: string; companies: { name: string } | null } | null

    return {
      ...application,
      job_title: jobInfo?.title || 'Unknown Job',
      company_name: jobInfo?.companies?.name || 'Unknown Company',
    }
  }) as ApplicationWithJob[]
}

/**
 * Check if the current user has already applied to a specific job.
 */
export async function hasAppliedToJob(jobId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return false
  }

  const { data } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', jobId)
    .eq('user_id', authUser.id)
    .single()

  return !!data
}
