'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageLoader } from '@/components/ui';

export default function CompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    companyName: '',
    description: '',
    website: '',
    location: '',
    industry: '',
    companySize: '',
    logo: '',
  });

  useEffect(() => {
    api('/api/profiles/company')
      .then((p: any) =>
        setForm({
          companyName: p.companyName ?? '',
          description: p.description ?? '',
          website: p.website ?? '',
          location: p.location ?? '',
          industry: p.industry ?? '',
          companySize: p.companySize ?? '',
          logo: p.logo ?? '',
        }),
      )
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    await api('/api/profiles/company', { method: 'PATCH', body: form }).catch(() => undefined);
    setSaving(false);
    setMsg('Saved');
    setTimeout(() => setMsg(''), 2000);
  }

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Company profile</h1>
      {msg && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

      <form onSubmit={save} className="card space-y-4 p-6">
        <div>
          <label className="label">Company name</label>
          <input className="input" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input" rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Website</label>
            <input className="input" value={form.website} onChange={(e) => set('website', e.target.value)} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Industry</label>
            <input className="input" value={form.industry} onChange={(e) => set('industry', e.target.value)} />
          </div>
          <div>
            <label className="label">Company size</label>
            <input className="input" placeholder="e.g. 11-50" value={form.companySize} onChange={(e) => set('companySize', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Logo URL</label>
            <input className="input" value={form.logo} onChange={(e) => set('logo', e.target.value)} />
          </div>
        </div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  );
}
