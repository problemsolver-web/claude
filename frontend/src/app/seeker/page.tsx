'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageLoader, StatCard, StatusBadge, EmptyState } from '@/components/ui';

export default function SeekerOverview() {
  const [data, setData] = useState<any>(null);
  const [completion, setCompletion] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/analytics/job-seeker/overview').catch(() => null),
      api<{ completion: number }>('/api/profiles/job-seeker/completion').catch(() => ({ completion: 0 })),
    ]).then(([overview, comp]) => {
      setData(overview);
      setCompletion((comp as any).completion);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageLoader />;

  const stats = data?.stats ?? {};
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back 👋</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={stats.totalApplications ?? 0} />
        <StatCard label="Shortlisted" value={stats.shortlisted ?? 0} />
        <StatCard label="Accepted" value={stats.accepted ?? 0} />
        <StatCard label="Success rate" value={`${stats.successRate ?? 0}%`} />
      </div>

      {/* Profile completion */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <p className="font-medium text-slate-800">Profile completion</p>
          <Link href="/seeker/profile" className="text-sm text-brand-600 hover:underline">Complete profile</Link>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-600" style={{ width: `${completion}%` }} />
        </div>
        <p className="mt-2 text-sm text-slate-500">{completion}% complete — a stronger profile improves your match scores.</p>
      </div>

      {/* Recent applications */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Recent applications</h2>
        {data?.recentApplications?.length ? (
          <div className="space-y-3">
            {data.recentApplications.map((a: any) => (
              <div key={a.id} className="card flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-slate-800">{a.jobPosting.title}</p>
                  <p className="text-sm text-slate-500">{a.jobPosting.company.companyName}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No applications yet" subtitle="Browse jobs and apply to get started" />
        )}
      </div>
    </div>
  );
}
