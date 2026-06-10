'use server'

import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/types/database'

export interface JobsFilter {
  category?: string
  location?: string
  employmentType?: string
  search?: string
}

export interface PaginatedJobs {
  jobs: (Job & { company_name?: string })[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * Fetch paginated active jobs with optional filters.
 */
export async function getJobs(
  page: number = 1,
  pageSize: number = 10,
  filters: JobsFilter = {}
): Promise<PaginatedJobs> {
  const supabase = await createClient()

  const offset = (page - 1) * pageSize

  let query = supabase
    .from('jobs')
    .select('*, companies(name)', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (filters.category) {
    query = query.eq('job_category', filters.category)
  }

  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }

  if (filters.employmentType) {
    query = query.eq('employment_type', filters.employmentType)
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  query = query.range(offset, offset + pageSize - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching jobs:', error)
    return { jobs: [], total: 0, page, pageSize, totalPages: 0 }
  }

  const jobs = (data || []).map((item: Record<string, unknown>) => {
    const { companies, ...job } = item
    return {
      ...job,
      company_name: (companies as { name: string } | null)?.name || 'Unknown Company',
    }
  }) as (Job & { company_name?: string })[]

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return { jobs, total, page, pageSize, totalPages }
}

/**
 * Fetch a single job by ID with company details.
 */
export async function getJobById(jobId: string): Promise<(Job & { company_name?: string; company_location?: string }) | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select('*, companies(name, location)')
    .eq('id', jobId)
    .single()

  if (error || !data) {
    return null
  }

  const { companies, ...job } = data as Record<string, unknown>
  const companyInfo = companies as { name: string; location: string | null } | null

  return {
    ...job,
    company_name: companyInfo?.name || 'Unknown Company',
    company_location: companyInfo?.location || undefined,
  } as Job & { company_name?: string; company_location?: string }
}
