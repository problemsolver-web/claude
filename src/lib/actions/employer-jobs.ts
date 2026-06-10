'use server'

import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/types/database'

export interface EmployerJobsResult {
  jobs: Job[]
  total: number
}

/**
 * Get all jobs posted by the current employer's company.
 */
export async function getEmployerJobs(): Promise<EmployerJobsResult> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return { jobs: [], total: 0 }
  }

  // Get employer's company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (!company) {
    return { jobs: [], total: 0 }
  }

  const { data, count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employer jobs:', error)
    return { jobs: [], total: 0 }
  }

  return {
    jobs: (data || []) as Job[],
    total: count || 0,
  }
}

/**
 * Get a single job by ID, verifying ownership by the current employer.
 */
export async function getEmployerJobById(jobId: string): Promise<Job | null> {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) {
    return null
  }

  // Get employer's company
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', authUser.id)
    .single()

  if (!company) {
    return null
  }

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Job
}

/**
 * Create a new job posting for the employer's company.
 */
export async function createJob(
  formData: FormData
): Promise<{ success: boolean; error?: string; jobId?: string }> {
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
    return { success: false, error: 'You must create a company before posting jobs' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const requirements = formData.get('requirements') as string
  const requiredSkillsRaw = formData.get('required_skills') as string
  const preferredSkillsRaw = formData.get('preferred_skills') as string
  const degreeRequirement = formData.get('degree_requirement') as string
  const experienceMin = formData.get('experience_min') as string
  const experienceMax = formData.get('experience_max') as string
  const jobCategory = formData.get('job_category') as string
  const location = formData.get('location') as string
  const salaryMin = formData.get('salary_min') as string
  const salaryMax = formData.get('salary_max') as string
  const employmentType = formData.get('employment_type') as string

  if (!title || !description) {
    return { success: false, error: 'Title and description are required' }
  }

  const requiredSkills = requiredSkillsRaw
    ? requiredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const preferredSkills = preferredSkillsRaw
    ? preferredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const { data, error } = await supabase
    .from('jobs')
    .insert({
      company_id: company.id,
      title,
      description,
      requirements: requirements || null,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      degree_requirement: degreeRequirement || null,
      experience_min: experienceMin ? parseInt(experienceMin, 10) : null,
      experience_max: experienceMax ? parseInt(experienceMax, 10) : null,
      job_category: jobCategory || null,
      location: location || null,
      salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
      salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
      employment_type: (employmentType || 'full-time') as Job['employment_type'],
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating job:', error)
    return { success: false, error: 'Failed to create job posting. Please try again.' }
  }

  return { success: true, jobId: data?.id }
}

/**
 * Update an existing job posting.
 */
export async function updateJob(
  jobId: string,
  formData: FormData
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

  // Verify ownership
  const { data: existingJob } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!existingJob) {
    return { success: false, error: 'Job not found or you do not have permission to edit it' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const requirements = formData.get('requirements') as string
  const requiredSkillsRaw = formData.get('required_skills') as string
  const preferredSkillsRaw = formData.get('preferred_skills') as string
  const degreeRequirement = formData.get('degree_requirement') as string
  const experienceMin = formData.get('experience_min') as string
  const experienceMax = formData.get('experience_max') as string
  const jobCategory = formData.get('job_category') as string
  const location = formData.get('location') as string
  const salaryMin = formData.get('salary_min') as string
  const salaryMax = formData.get('salary_max') as string
  const employmentType = formData.get('employment_type') as string
  const isActive = formData.get('is_active') as string

  if (!title || !description) {
    return { success: false, error: 'Title and description are required' }
  }

  const requiredSkills = requiredSkillsRaw
    ? requiredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const preferredSkills = preferredSkillsRaw
    ? preferredSkillsRaw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('jobs')
    .update({
      title,
      description,
      requirements: requirements || null,
      required_skills: requiredSkills,
      preferred_skills: preferredSkills,
      degree_requirement: degreeRequirement || null,
      experience_min: experienceMin ? parseInt(experienceMin, 10) : null,
      experience_max: experienceMax ? parseInt(experienceMax, 10) : null,
      job_category: jobCategory || null,
      location: location || null,
      salary_min: salaryMin ? parseInt(salaryMin, 10) : null,
      salary_max: salaryMax ? parseInt(salaryMax, 10) : null,
      employment_type: (employmentType || 'full-time') as Job['employment_type'],
      is_active: isActive === 'true',
    })
    .eq('id', jobId)

  if (error) {
    console.error('Error updating job:', error)
    return { success: false, error: 'Failed to update job posting. Please try again.' }
  }

  return { success: true }
}

/**
 * Delete a job posting (soft delete by deactivating, or hard delete).
 */
export async function deleteJob(
  jobId: string
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

  // Verify ownership
  const { data: existingJob } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', jobId)
    .eq('company_id', company.id)
    .single()

  if (!existingJob) {
    return { success: false, error: 'Job not found or you do not have permission to delete it' }
  }

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId)

  if (error) {
    console.error('Error deleting job:', error)
    return { success: false, error: 'Failed to delete job posting. Please try again.' }
  }

  return { success: true }
}
