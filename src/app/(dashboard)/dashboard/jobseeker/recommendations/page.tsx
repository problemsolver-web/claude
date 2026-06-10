import { createClient } from '@/lib/supabase/server'
import { calculateMatchScores } from '@/lib/matching/engine'
import { JobCard } from '@/components/ui/job-card'
import { EmptyState } from '@/components/ui/empty-state'
import { MatchScoreBar } from '@/components/ui/match-score'
import type { User, Job } from '@/types/database'

export default async function RecommendationsPage() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return (
      <EmptyState
        title="Sign in required"
        description="Please sign in to view your personalized recommendations."
      />
    )
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  const userProfile = profile as User | null

  if (!userProfile) {
    return (
      <EmptyState
        title="Complete your profile"
        description="Please complete your profile to get personalized job recommendations."
      />
    )
  }

  // Fetch all active jobs
  const { data: jobsData } = await supabase
    .from('jobs')
    .select('*, companies(name)')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const jobs = (jobsData || []).map((item: Record<string, unknown>) => {
    const { companies, ...job } = item
    return {
      ...job,
      company_name: (companies as { name: string } | null)?.name || 'Unknown Company',
    }
  }) as (Job & { company_name?: string })[]

  // Calculate match scores and filter to only show score > 40%
  const scoredJobs = calculateMatchScores(userProfile, jobs)
    .filter(({ match }) => match.percentage > 40)

  const hasSkills = userProfile.skills.length > 0
  const hasPreferences = userProfile.preferred_job_categories.length > 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recommended Jobs</h1>
        <p className="text-gray-600 mt-1">
          Jobs matched to your profile using our AI matching algorithm.
          {scoredJobs.length > 0 && (
            <> Showing {scoredJobs.length} recommended {scoredJobs.length === 1 ? 'job' : 'jobs'}.</>
          )}
        </p>
      </div>

      {!hasSkills || !hasPreferences ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="font-medium text-yellow-800">Improve your recommendations</h4>
              <p className="text-sm text-yellow-700 mt-1">
                {!hasSkills && 'Add skills to your profile. '}
                {!hasPreferences && 'Set your preferred job categories. '}
                A complete profile helps us find better matches for you.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {scoredJobs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
          title="No recommendations yet"
          description="We could not find jobs matching your profile with sufficient confidence. Try updating your skills and preferences, or browse all available jobs."
        />
      ) : (
        <div className="space-y-4">
          {scoredJobs.map(({ job, match }) => (
            <div key={job.id} className="relative">
              <JobCard
                job={job as Job & { company_name?: string }}
                matchPercentage={match.percentage}
                matchLabel={match.label}
              />
              <div className="absolute bottom-4 right-6 w-32">
                <MatchScoreBar percentage={match.percentage} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
