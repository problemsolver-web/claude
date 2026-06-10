import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { User, Job } from '@/types/database'

export default async function EmployerDashboard() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  let userProfile: User | null = null
  let recentJobs: Job[] = []
  let stats = { totalJobs: 0, activeJobs: 0, totalApplications: 0, pendingApplications: 0 }
  let hasCompany = false

  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    userProfile = profile as User | null

    // Check if employer has a company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authUser.id)
      .single()

    if (company) {
      hasCompany = true

      // Get job stats
      const { count: totalJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)

      const { count: activeJobs } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', company.id)
        .eq('is_active', true)

      // Get recent jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false })
        .limit(5)

      recentJobs = (jobs || []) as Job[]

      // Get application stats across all company jobs
      const { data: companyJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', company.id)

      if (companyJobs && companyJobs.length > 0) {
        const jobIds = companyJobs.map((j: { id: string }) => j.id)

        const { count: totalApps } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds)

        const { count: pendingApps } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds)
          .eq('status', 'pending')

        stats = {
          totalJobs: totalJobs || 0,
          activeJobs: activeJobs || 0,
          totalApplications: totalApps || 0,
          pendingApplications: pendingApps || 0,
        }
      } else {
        stats = {
          totalJobs: totalJobs || 0,
          activeJobs: activeJobs || 0,
          totalApplications: 0,
          pendingApplications: 0,
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userProfile?.full_name || 'Employer'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your job postings and review applicants.
          </p>
        </div>
        {hasCompany && (
          <Link href="/dashboard/employer/jobs/new">
            <Button variant="primary">Post New Job</Button>
          </Link>
        )}
      </div>

      {/* No Company Alert */}
      {!hasCompany && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Create Your Company Profile</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You need to set up your company profile before you can post jobs and manage applicants.
              </p>
              <Link
                href="/dashboard/employer/company"
                className="inline-flex items-center mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Set Up Company &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {hasCompany && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalJobs}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Active Jobs</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.activeJobs}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Total Applicants</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.totalApplications}</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingApplications}</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Recent Jobs */}
      {hasCompany && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Job Postings</h2>
              <Link
                href="/dashboard/employer/jobs"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All
              </Link>
            </div>
          </CardHeader>
          <CardBody>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You have not posted any jobs yet.</p>
                <Link href="/dashboard/employer/jobs/new" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                  Post your first job
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentJobs.map((job) => (
                  <div key={job.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        href={`/dashboard/employer/jobs/${job.id}/applicants`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600"
                      >
                        {job.title}
                      </Link>
                      <p className="text-xs text-gray-500">{job.location || 'Remote'} &middot; {job.employment_type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={job.is_active ? 'accepted' : 'rejected'}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Link href={`/dashboard/employer/jobs/${job.id}/edit`}>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
