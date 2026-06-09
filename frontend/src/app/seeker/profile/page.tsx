'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageLoader } from '@/components/ui';

export default function SeekerProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // form state
  const [form, setForm] = useState({ headline: '', bio: '', location: '', githubUrl: '' });
  const [newSkill, setNewSkill] = useState('');
  const [edu, setEdu] = useState({ university: '', degree: '', field: '', graduationYear: '' });

  async function load() {
    const p = await api('/api/profiles/job-seeker').catch(() => null);
    setProfile(p);
    if (p) setForm({ headline: p.headline ?? '', bio: p.bio ?? '', location: p.location ?? '', githubUrl: p.githubUrl ?? '' });
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveBasics(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    await api('/api/profiles/job-seeker', { method: 'PATCH', body: form }).catch(() => undefined);
    setSaving(false);
    setMsg('Profile saved');
    setTimeout(() => setMsg(''), 2000);
  }

  async function addSkill() {
    if (!newSkill.trim()) return;
    await api('/api/profiles/job-seeker/skills', { method: 'POST', body: { skillName: newSkill.trim() } }).catch(() => undefined);
    setNewSkill('');
    load();
  }
  async function removeSkill(id: string) {
    await api(`/api/profiles/job-seeker/skills/${id}`, { method: 'DELETE' }).catch(() => undefined);
    load();
  }
  async function addEducation() {
    if (!edu.university || !edu.degree) return;
    await api('/api/profiles/job-seeker/education', {
      method: 'POST',
      body: { ...edu, graduationYear: edu.graduationYear ? Number(edu.graduationYear) : undefined },
    }).catch(() => undefined);
    setEdu({ university: '', degree: '', field: '', graduationYear: '' });
    load();
  }
  async function removeEducation(id: string) {
    await api(`/api/profiles/job-seeker/education/${id}`, { method: 'DELETE' }).catch(() => undefined);
    load();
  }

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
      {msg && <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{msg}</div>}

      {/* Basics */}
      <form onSubmit={saveBasics} className="card space-y-4 p-5">
        <h2 className="font-semibold text-slate-800">Basic information</h2>
        <div>
          <label className="label">Headline</label>
          <input className="input" placeholder="e.g. Junior Frontend Developer" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Location</label>
            <input className="input" placeholder="Dhaka" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input className="input" placeholder="https://github.com/…" value={form.githubUrl} onChange={(e) => setForm({ ...form, githubUrl: e.target.value })} />
          </div>
        </div>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </form>

      {/* Skills */}
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-800">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {profile?.skills?.map((s: any) => (
            <span key={s.id} className="badge bg-brand-50 text-brand-700">
              {s.skillName}
              <button onClick={() => removeSkill(s.id)} className="ml-1.5 text-brand-400 hover:text-red-500">×</button>
            </span>
          ))}
          {profile?.skills?.length === 0 && <p className="text-sm text-slate-400">No skills added yet.</p>}
        </div>
        <div className="flex gap-2">
          <input className="input" placeholder="Add a skill (e.g. React)" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} />
          <button className="btn-secondary" onClick={addSkill}>Add</button>
        </div>
      </div>

      {/* Education */}
      <div className="card space-y-3 p-5">
        <h2 className="font-semibold text-slate-800">Education</h2>
        {profile?.education?.map((ed: any) => (
          <div key={ed.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-800">{ed.degree}{ed.field ? `, ${ed.field}` : ''}</p>
              <p className="text-xs text-slate-500">{ed.university}{ed.graduationYear ? ` · ${ed.graduationYear}` : ''}</p>
            </div>
            <button onClick={() => removeEducation(ed.id)} className="text-sm text-red-500 hover:underline">Remove</button>
          </div>
        ))}
        <div className="grid gap-2 sm:grid-cols-2">
          <input className="input" placeholder="University" value={edu.university} onChange={(e) => setEdu({ ...edu, university: e.target.value })} />
          <input className="input" placeholder="Degree" value={edu.degree} onChange={(e) => setEdu({ ...edu, degree: e.target.value })} />
          <input className="input" placeholder="Field" value={edu.field} onChange={(e) => setEdu({ ...edu, field: e.target.value })} />
          <input className="input" placeholder="Graduation year" value={edu.graduationYear} onChange={(e) => setEdu({ ...edu, graduationYear: e.target.value })} />
        </div>
        <button className="btn-secondary" onClick={addEducation}>Add education</button>
      </div>
    </div>
  );
}
