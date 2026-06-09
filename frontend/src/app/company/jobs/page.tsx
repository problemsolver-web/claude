'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PageLoader, EmptyState, StatusBadge } from '@/components/ui';

export default function CompanyJobs() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    const data = await api<{ items: any[] }>(`/api/jobs/mine?${params.toString()}`).catch(() => ({ items: [] }));
    setItems(data.items);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function changeStatus(id: string, newStatus: string) {
    await api(`/api/jobs/${id}/status`, { method: 'PATCH', body: { status: newStatus } }).catch(() => undefined);
    load();
  }
  async function remove(id: string) {
    if (!confirm('Delete this job posting?')) return;
    await api(`/api/jobs/${id}`, { method: 'DELETE' }).catch(() => undefined);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Job postings</h1>
        <Link href="/company/jobs/new" className="btn-primary">New posting</Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
        className="flex flex-wrap gap-3"
      >
        <input className="input max-w-xs" placeholder="Search by title" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['ACTIVE', 'CLOSED', 'EXPIRED', 'DRAFT'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button className="btn-secondary">Search</button>
      </form>

      {loading ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState title="No job postings" subtitle="Create your first posting to get started" />
      ) : (
        <div className="overflow-hidden card">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applications</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((j) => (
                <tr key={j.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{j.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={j.status} /></td>
                  <td className="px-4 py-3">{j._count?.applications ?? 0}</td>
                  <td className="px-4 py-3">{j.viewsCount}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(j.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/company/applications?jobId=${j.id}`} className="text-brand-600 hover:underline">Applications</Link>
                      <Link href={`/company/candidates?jobId=${j.id}`} className="text-brand-600 hover:underline">Candidates</Link>
                      {j.status === 'ACTIVE' ? (
                        <button onClick={() => changeStatus(j.id, 'CLOSED')} className="text-slate-500 hover:underline">Close</button>
                      ) : (
                        <button onClick={() => changeStatus(j.id, 'ACTIVE')} className="text-slate-500 hover:underline">Reopen</button>
                      )}
                      <button onClick={() => remove(j.id)} className="text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
