import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getJobById } from '@/lib/actions/jobs'
import { hasAppliedToJob } from '@/lib/actions/applications'
import { calculateMatchScore } from '@/lib/matching/engine'
import { Badge } from '@/components/ui/badge'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { MatchScoreBar } from '@/components/ui/match-score'
import { ApplyButton } from './apply-button'
import type { User } from '@/types/database'

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const job = await getJobById(id)

  if (!job) {
    notFound()
  }

  // Get current user for match scoring
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  let userProfile: User | null = null
  let matchResult = null
  let alreadyApplied = false

  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    userProfile = profile as User | null

    if (userProfile) {
      matchResult = calculateMatchScore(userProfile, job)
    }

    alreadyApplied = await hasAppliedToJob(id)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/dashboard/jobseeker/jobs"
        className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <Card>
            <CardBody>
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <p className="text-lg text-gray-600 mt-1">{job.company_name}</p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                {job.location && (
                  <span className="inline-flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {job.location}
                  </span>
                )}
                <Badge variant="default">
                  {job.employment_type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}
                </Badge>
                {job.job_category && (
                  <span className="text-sm text-gray-500">
                    {job.job_category.replace(/-/g, ' ')}
                  </span>
                )}
              </div>

              {(job.salary_min || job.salary_max) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Salary: </span>
                  <span className="text-sm text-gray-600">
                    {job.salary_min && job.salary_max
                      ? `BDT ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}/month`
                      : job.salary_min
                        ? `BDT ${job.salary_min.toLocaleString()}+/month`
                        : `Up to BDT ${job.salary_max!.toLocaleString()}/month`
                    }
                  </span>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Job Description</h2>
            </CardHeader>
            <CardBody>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {job.description}
              </div>
            </CardBody>
          </Card>

          {/* Requirements */}
          {job.requirements && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Requirements</h2>
              </CardHeader>
              <CardBody>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                  {job.requirements}
                </div>
              </CardBody>
            </Card>
          )}

          {/* Skills */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            </CardHeader>
            <CardBody>
              {job.required_skills.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.required_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.preferred_skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Preferred Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferred_skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Match Score */}
          {matchResult && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-900">Your Match Score</h3>
              </CardHeader>
              <CardBody>
                <MatchScoreBar percentage={matchResult.percentage} />
                <p className="text-sm text-gray-600 mt-2">{matchResult.label}</p>

                {matchResult.breakdown.capped && (
                  <p className="text-xs text-orange-600 mt-2">
                    Score capped: {matchResult.breakdown.cap_reason}
                  </p>
                )}

                <div className="mt-4 space-y-2">
                  <ScoreItem label="Degree Relevance" value={matchResult.breakdown.degree_relevance} weight={30} />
                  <ScoreItem label="Skill Overlap" value={matchResult.breakdown.skill_overlap} weight={30} />
                  <ScoreItem label="Category Alignment" value={matchResult.breakdown.job_category_alignment} weight={20} />
                  <ScoreItem label="Experience" value={matchResult.breakdown.experience_compatibility} weight={15} />
                  <ScoreItem label="Languages" value={matchResult.breakdown.language_match} weight={5} />
                </div>
              </CardBody>
            </Card>
          )}

          {/* Apply Section */}
          <Card>
            <CardBody>
              <ApplyButton jobId={id} alreadyApplied={alreadyApplied} />
            </CardBody>
          </Card>

          {/* Job Details Sidebar */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-gray-900">Job Details</h3>
            </CardHeader>
            <CardBody>
              <dl className="space-y-3">
                {job.experience_min !== null && (
                  <div>
                    <dt className="text-xs text-gray-500">Experience</dt>
                    <dd className="text-sm text-gray-900">
                      {job.experience_min}{job.experience_max ? `-${job.experience_max}` : '+'} years
                    </dd>
                  </div>
                )}
                {job.degree_requirement && (
                  <div>
                    <dt className="text-xs text-gray-500">Degree Required</dt>
                    <dd className="text-sm text-gray-900 capitalize">{job.degree_requirement}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-gray-500">Posted</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(job.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ScoreItem({ label, value, weight }: { label: string; value: number; weight: number }) {
  const percentage = Math.round(value * 100)
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-600">{label} ({weight}%)</span>
      <span className="font-medium text-gray-800">{percentage}%</span>
    </div>
  )
}
