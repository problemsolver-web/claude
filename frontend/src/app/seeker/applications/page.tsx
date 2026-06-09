'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageLoader, EmptyState, StatusBadge, Avatar } from '@/components/ui';

export default function SeekerApplications() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    const params = status ? `?status=${status}` : '';
    const data = await api<{ items: any[] }>(`/api/applications/mine${params}`).catch(() => ({ items: [] }));
    setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My applications</h1>
        <select className="input w-44" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['NEW', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No applications" subtitle="Applications you submit will appear here" />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar name={a.jobPosting.company.companyName} src={a.jobPosting.company.logo} />
                <div>
                  <p className="font-medium text-slate-800">{a.jobPosting.title}</p>
                  <p className="text-sm text-slate-500">
                    {a.jobPosting.company.companyName} · Applied {new Date(a.appliedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
