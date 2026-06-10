import Link from 'next/link'
import { getUserApplications } from '@/lib/actions/applications'
import { Card, CardBody } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MatchScore } from '@/components/ui/match-score'

export default async function ApplicationsPage() {
  const applications = await getUserApplications()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600 mt-1">
          Track the status of all your job applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No applications yet</h3>
              <p className="text-gray-500">
                Start browsing jobs and submit your first application.
              </p>
              <Link
                href="/dashboard/jobseeker/jobs"
                className="inline-flex items-center mt-4 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Browse Jobs &rarr;
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {app.job_title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">{app.company_name}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied {new Date(app.applied_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={app.status}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                    {app.match_score !== null && (
                      <MatchScore percentage={app.match_score} showLabel={false} size="sm" />
                    )}
                  </div>
                </div>

                {app.cover_letter && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Cover Letter</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{app.cover_letter}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
