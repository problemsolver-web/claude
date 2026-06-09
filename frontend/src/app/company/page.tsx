'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageLoader, StatCard, StatusBadge, EmptyState, Avatar, MatchScore } from '@/components/ui';

export default function CompanyOverview() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/analytics/company/overview')
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  const stats = data?.stats ?? {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <Link href="/company/jobs/new" className="btn-primary">Post a job</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active postings" value={stats.activeJobs ?? 0} />
        <StatCard label="Total applications" value={stats.totalApplications ?? 0} />
        <StatCard label="Shortlisted" value={stats.shortlisted ?? 0} />
        <StatCard label="Total views" value={stats.totalViews ?? 0} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent applications</h2>
        {data?.recentApplications?.length ? (
          <div className="space-y-3">
            {data.recentApplications.map((a: any) => (
              <Link key={a.id} href={`/company/applications/${a.id}`} className="card flex items-center justify-between p-4 hover:border-brand-300">
                <div className="flex items-center gap-3">
                  <Avatar name={a.jobSeeker.user.name} src={a.jobSeeker.profilePicture} />
                  <div>
                    <p className="font-medium text-slate-800">{a.jobSeeker.user.name}</p>
                    <p className="text-sm text-slate-500">{a.jobPosting.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {typeof a.matchScore === 'number' && <MatchScore score={a.matchScore} />}
                  <StatusBadge status={a.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No applications yet" subtitle="Post a job to start receiving applications" />
        )}
      </div>
    </div>
  );
}
