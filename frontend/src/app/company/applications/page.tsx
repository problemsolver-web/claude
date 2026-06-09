'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageLoader, EmptyState, StatusBadge, Avatar, MatchScore } from '@/components/ui';

function ApplicationsInner() {
  const params = useSearchParams();
  const jobId = params.get('jobId') ?? '';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const qp = new URLSearchParams();
    if (jobId) qp.set('jobId', jobId);
    if (status) qp.set('status', status);
    qp.set('sort', sort);
    const data = await api<{ items: any[] }>(`/api/applications/company?${qp.toString()}`).catch(() => ({ items: [] }));
    setItems(data.items);
    setSelected([]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sort, jobId]);

  async function bulk(newStatus: string) {
    if (selected.length === 0) return;
    await api('/api/applications/bulk-status', { method: 'PATCH', body: { ids: selected, status: newStatus } }).catch(() => undefined);
    load();
  }

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Applications</h1>

      <div className="flex flex-wrap items-center gap-3">
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['NEW', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input w-40" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="score">Match score</option>
        </select>
        {selected.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-slate-500">{selected.length} selected</span>
            <button className="btn-secondary py-1.5" onClick={() => bulk('SHORTLISTED')}>Shortlist</button>
            <button className="btn-secondary py-1.5" onClick={() => bulk('REJECTED')}>Reject</button>
          </div>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No applications" subtitle="Applications matching these filters will appear here" />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card flex items-center gap-3 p-4">
              <input type="checkbox" checked={selected.includes(a.id)} onChange={() => toggle(a.id)} className="h-4 w-4" />
              <Avatar name={a.jobSeeker.user.name} src={a.jobSeeker.profilePicture} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">{a.jobSeeker.user.name}</p>
                <p className="truncate text-sm text-slate-500">{a.jobSeeker.headline || a.jobPosting.title}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {a.jobSeeker.skills?.slice(0, 4).map((s: any) => (
                    <span key={s.id} className="badge bg-slate-100 text-slate-600">{s.skillName}</span>
                  ))}
                </div>
              </div>
              {typeof a.matchScore === 'number' && <MatchScore score={a.matchScore} />}
              <StatusBadge status={a.status} />
              <Link href={`/company/applications/${a.id}`} className="btn-secondary py-1.5">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CompanyApplications() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ApplicationsInner />
    </Suspense>
  );
}
