import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEmployerJobById } from '@/lib/actions/employer-jobs'
import { getJobApplicants } from '@/lib/actions/employer-applications'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplicantFilters } from './applicant-filters'
import { StatusActions } from './status-actions'
import type { ApplicationStatus } from '@/types/database'

export default async function ApplicantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { id } = await params
  const filters = await searchParams

  const job = await getEmployerJobById(id)

  if (!job) {
    notFound()
  }

  const applicants = await getJobApplicants(id, {
    status: (filters.status as ApplicationStatus) || undefined,
    minScore: filters.minScore ? parseInt(filters.minScore as string, 10) : undefined,
    degree: (filters.degree as string) || undefined,
    skill: (filters.skill as string) || undefined,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/employer/jobs"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            &larr; Back to Jobs
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Applicants for: {job.title}
          </h1>
          <p className="text-gray-600 mt-1">
            {applicants.length} {applicants.length === 1 ? 'applicant' : 'applicants'} found
          </p>
        </div>
        <Link href={`/dashboard/employer/jobs/${id}/edit`}>
          <Button variant="outline">Edit Job</Button>
        </Link>
      </div>

      {/* Filters */}
      <ApplicantFilters
        jobId={id}
        currentStatus={(filters.status as string) || ''}
        currentMinScore={(filters.minScore as string) || ''}
        currentDegree={(filters.degree as string) || ''}
        currentSkill={(filters.skill as string) || ''}
      />

      {/* Applicants List */}
      {applicants.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants yet</h3>
              <p className="text-gray-500">When candidates apply, they will appear here.</p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
              <div className="col-span-3">Candidate</div>
              <div className="col-span-2">Match Score</div>
              <div className="col-span-2">Degree</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-gray-100">
              {applicants.map((applicant) => (
                <div key={applicant.id} className="py-3 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <Link
                      href={`/dashboard/employer/jobs/${id}/applicants/${applicant.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {applicant.user.full_name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {applicant.user.location || 'No location'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    {applicant.match_score !== null ? (
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${
                              applicant.match_score >= 70
                                ? 'bg-green-500'
                                : applicant.match_score >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${applicant.match_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {applicant.match_score}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-600">
                      {applicant.user.degree || 'Not specified'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={applicant.status}>{applicant.status}</Badge>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <StatusActions
                      applicationId={applicant.id}
                      currentStatus={applicant.status}
                    />
                    <Link href={`/dashboard/employer/jobs/${id}/applicants/${applicant.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
