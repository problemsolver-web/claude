'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';

export default function NewJob() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    skills: '',
    experienceLevel: 'ENTRY',
    jobType: 'ONSITE',
    location: '',
    category: '',
    salaryMin: '',
    salaryMax: '',
    deadline: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api('/api/jobs', {
        method: 'POST',
        body: {
          title: form.title,
          description: form.description,
          skillsRequired: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          experienceLevel: form.experienceLevel,
          jobType: form.jobType,
          location: form.location || undefined,
          category: form.category || undefined,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        },
      });
      router.push('/company/jobs');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create job');
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Create job posting</h1>
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div>
          <label className="label">Job title *</label>
          <input className="input" value={form.title} onChange={(e) => set('title', e.target.value)} required />
        </div>
        <div>
          <label className="label">Description *</label>
          <textarea className="input" rows={6} value={form.description} onChange={(e) => set('description', e.target.value)} required />
        </div>
        <div>
          <label className="label">Required skills (comma-separated)</label>
          <input className="input" placeholder="React, TypeScript, Node.js" value={form.skills} onChange={(e) => set('skills', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Experience level</label>
            <select className="input" value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
              {['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Job type</label>
            <select className="input" value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
              {['ONSITE', 'REMOTE', 'HYBRID'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} />
          </div>
          <div>
            <label className="label">Category</label>
            <input className="input" placeholder="Engineering" value={form.category} onChange={(e) => set('category', e.target.value)} />
          </div>
          <div>
            <label className="label">Salary min (BDT)</label>
            <input className="input" type="number" value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
          </div>
          <div>
            <label className="label">Salary max (BDT)</label>
            <input className="input" type="number" value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
          </div>
          <div>
            <label className="label">Application deadline</label>
            <input className="input" type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button className="btn-primary" disabled={saving}>{saving ? 'Publishing…' : 'Publish job'}</button>
        </div>
      </form>
    </div>
  );
}
