import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { User, Application } from '@/types/database'

export default async function JobSeekerDashboard() {
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()

  let userProfile: User | null = null
  let recentApplications: (Application & { job_title?: string; company_name?: string })[] = []
  let applicationStats = { total: 0, pending: 0, shortlisted: 0, accepted: 0 }

  if (authUser) {
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    userProfile = profile as User | null

    // Get recent applications
    const { data: apps } = await supabase
      .from('applications')
      .select('*, jobs(title, companies(name))')
      .eq('user_id', authUser.id)
      .order('applied_at', { ascending: false })
      .limit(5)

    if (apps) {
      recentApplications = apps.map((item: Record<string, unknown>) => {
        const { jobs, ...application } = item
        const jobInfo = jobs as { title: string; companies: { name: string } | null } | null
        return {
          ...application,
          job_title: jobInfo?.title || 'Unknown Job',
          company_name: jobInfo?.companies?.name || 'Unknown Company',
        }
      }) as (Application & { job_title?: string; company_name?: string })[]
    }

    // Get application stats
    const { count: totalCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)

    const { count: pendingCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('status', 'pending')

    const { count: shortlistedCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('status', 'shortlisted')

    const { count: acceptedCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', authUser.id)
      .eq('status', 'accepted')

    applicationStats = {
      total: totalCount || 0,
      pending: pendingCount || 0,
      shortlisted: shortlistedCount || 0,
      accepted: acceptedCount || 0,
    }
  }

  const profileComplete = userProfile &&
    userProfile.skills.length > 0 &&
    userProfile.degree &&
    userProfile.experience_years !== null

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {userProfile?.full_name || 'Job Seeker'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here is an overview of your job search activity.
          </p>
        </div>
        <Link href="/dashboard/jobseeker/jobs">
          <Button variant="primary">Browse Jobs</Button>
        </Link>
      </div>

      {/* Profile Completion Alert */}
      {!profileComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Complete Your Profile</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Add your skills, education, and experience to get better job matches.
              </p>
              <Link
                href="/dashboard/jobseeker/profile"
                className="inline-flex items-center mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Update Profile &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Total Applications</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{applicationStats.total}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{applicationStats.pending}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Shortlisted</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{applicationStats.shortlisted}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-gray-500">Accepted</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{applicationStats.accepted}</p>
          </CardBody>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
            <Link
              href="/dashboard/jobseeker/applications"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              View All
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">You have not applied to any jobs yet.</p>
              <Link href="/dashboard/jobseeker/jobs" className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
                Start browsing jobs
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentApplications.map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.job_title}</p>
                    <p className="text-xs text-gray-500">{app.company_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.match_score !== null && (
                      <span className="text-xs text-gray-500">{app.match_score}% match</span>
                    )}
                    <Badge variant={app.status}>{app.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
