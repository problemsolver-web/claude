import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getApplicantProfile } from '@/lib/actions/employer-applications'
import { getEmployerJobById } from '@/lib/actions/employer-jobs'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusActions } from '../status-actions'
import type { ScoreBreakdown } from '@/lib/matching/engine'

export default async function ApplicantProfilePage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>
}) {
  const { id, applicationId } = await params

  const [job, applicant] = await Promise.all([
    getEmployerJobById(id),
    getApplicantProfile(id, applicationId),
  ])

  if (!job || !applicant) {
    notFound()
  }

  const breakdown = applicant.score_breakdown as unknown as ScoreBreakdown | null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/employer/jobs/${id}/applicants`}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          &larr; Back to Applicants
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {applicant.user.full_name}
            </h1>
            <p className="text-gray-600 mt-1">
              Applied for: {job.title}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={applicant.status}>{applicant.status}</Badge>
            <StatusActions
              applicationId={applicant.id}
              currentStatus={applicant.status}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Email</p>
                  <p className="text-sm text-gray-900 mt-1">{applicant.user.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Phone</p>
                  <p className="text-sm text-gray-900 mt-1">{applicant.user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Location</p>
                  <p className="text-sm text-gray-900 mt-1">{applicant.user.location || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Experience</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {applicant.user.experience_years !== null
                      ? `${applicant.user.experience_years} years`
                      : 'Not specified'}
                  </p>
                </div>
              </div>

              {applicant.user.bio && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">About</p>
                  <p className="text-sm text-gray-700">{applicant.user.bio}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Degree</p>
                  <p className="text-sm text-gray-900 mt-1">{applicant.user.degree || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Field of Study</p>
                  <p className="text-sm text-gray-900 mt-1">{applicant.user.degree_field || 'Not specified'}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
            </CardHeader>
            <CardBody>
              {applicant.user.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {applicant.user.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills listed</p>
              )}

              {applicant.user.languages.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-2">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {applicant.user.languages.map((lang, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cover Letter */}
          {applicant.cover_letter && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Cover Letter</h2>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {applicant.cover_letter}
                </p>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Sidebar - Match Score */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Match Score</h2>
            </CardHeader>
            <CardBody>
              {applicant.match_score !== null ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                      applicant.match_score >= 70
                        ? 'bg-green-100 text-green-700'
                        : applicant.match_score >= 50
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span className="text-2xl font-bold">{applicant.match_score}%</span>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  {breakdown && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700">Score Breakdown</h3>
                      <ScoreBar label="Degree Relevance" value={breakdown.degree_relevance} weight={30} />
                      <ScoreBar label="Skill Overlap" value={breakdown.skill_overlap} weight={30} />
                      <ScoreBar label="Category Alignment" value={breakdown.job_category_alignment} weight={20} />
                      <ScoreBar label="Experience" value={breakdown.experience_compatibility} weight={15} />
                      <ScoreBar label="Language" value={breakdown.language_match} weight={5} />

                      {breakdown.capped && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-700">
                            Score was capped: {breakdown.cap_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center">No match score available</p>
              )}
            </CardBody>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Application Details</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Applied On</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(applicant.applied_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                  <div className="mt-1">
                    <Badge variant={applicant.status}>{applicant.status}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Last Updated</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(applicant.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ScoreBar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const percentage = Math.round(value * 100)
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-500">{percentage}% (weight: {weight}%)</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-gray-200">
        <div
          className={`h-2 rounded-full ${
            percentage >= 70 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
