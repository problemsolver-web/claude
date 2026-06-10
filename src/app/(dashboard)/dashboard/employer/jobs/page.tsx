import Link from 'next/link'
import { getEmployerJobs } from '@/lib/actions/employer-jobs'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function EmployerJobsPage() {
  const { jobs, total } = await getEmployerJobs()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Postings</h1>
          <p className="text-gray-600 mt-1">
            Manage your {total} job {total === 1 ? 'posting' : 'postings'}.
          </p>
        </div>
        <Link href="/dashboard/employer/jobs/new">
          <Button variant="primary">Post New Job</Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
              <p className="text-gray-500 mb-4">Start attracting candidates by posting your first job.</p>
              <Link href="/dashboard/employer/jobs/new">
                <Button variant="primary">Post Your First Job</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase">
              <div className="col-span-5">Job Title</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job.id} className="py-3 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <Link
                      href={`/dashboard/employer/jobs/${job.id}/applicants`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600"
                    >
                      {job.title}
                    </Link>
                    <p className="text-xs text-gray-500">{job.location || 'Remote'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-gray-600 capitalize">{job.employment_type}</span>
                  </div>
                  <div className="col-span-2">
                    <Badge variant={job.is_active ? 'accepted' : 'rejected'}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <Link href={`/dashboard/employer/jobs/${job.id}/applicants`}>
                      <Button variant="ghost" size="sm">Applicants</Button>
                    </Link>
                    <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
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
