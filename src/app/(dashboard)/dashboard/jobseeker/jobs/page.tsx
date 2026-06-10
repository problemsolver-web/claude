import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getJobs } from '@/lib/actions/jobs'
import { calculateMatchScore } from '@/lib/matching/engine'
import { JobCard } from '@/components/ui/job-card'
import { JobFilters } from '@/components/ui/job-filters'
import { Pagination } from '@/components/ui/pagination'
import type { User } from '@/types/database'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1
  const category = typeof params.category === 'string' ? params.category : undefined
  const type = typeof params.type === 'string' ? params.type : undefined
  const search = typeof params.search === 'string' ? params.search : undefined

  const { jobs, total, totalPages } = await getJobs(page, 10, {
    category,
    employmentType: type,
    search,
  })

  // Get current user for match scoring
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let userProfile: User | null = null

  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    userProfile = profile as User | null
  }

  // Calculate match scores if user profile is available
  const jobsWithScores = jobs.map(job => {
    if (userProfile) {
      const match = calculateMatchScore(userProfile, job)
      return { ...job, matchPercentage: match.percentage, matchLabel: match.label }
    }
    return { ...job, matchPercentage: undefined, matchLabel: undefined }
  })

  // Build search params for pagination
  const paginationParams: Record<string, string> = {}
  if (category) paginationParams.category = category
  if (type) paginationParams.type = type
  if (search) paginationParams.search = search

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600 mt-1">
          {total} active {total === 1 ? 'job' : 'jobs'} available
        </p>
      </div>

      <Suspense fallback={<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6 h-20 animate-pulse" />}>
        <JobFilters />
      </Suspense>

      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobsWithScores.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              matchPercentage={job.matchPercentage}
              matchLabel={job.matchLabel}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          basePath="/dashboard/jobseeker/jobs"
          searchParams={paginationParams}
        />
      </div>
    </div>
  )
}
