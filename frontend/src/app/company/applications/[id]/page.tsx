'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PageLoader, StatusBadge, MatchScore, Avatar } from '@/components/ui';

const STATUSES = ['NEW', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED'];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const data = await api(`/api/applications/${id}`).catch(() => null);
    setApp(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(status: string) {
    await api(`/api/applications/${id}/status`, { method: 'PATCH', body: { status } }).catch(() => undefined);
    load();
  }

  async function message() {
    // open messages with this candidate
    router.push('/company/messages');
  }

  if (loading) return <PageLoader />;
  if (!app) return <p className="text-slate-500">Application not found.</p>;

  const js = app.jobSeeker;
  const reason = app.matchScore;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <button onClick={() => router.back()} className="text-sm text-brand-600 hover:underline">← Back</button>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={js.user.name} src={js.profilePicture} size={56} />
            <div>
              <h1 className="text-xl font-bold text-slate-900">{js.user.name}</h1>
              <p className="text-sm text-slate-500">{js.headline || 'Job Seeker'} · {js.location || 'Location N/A'}</p>
              <p className="text-sm text-slate-400">Applied to {app.jobPosting.title}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {typeof reason === 'number' && <MatchScore score={reason} />}
            <StatusBadge status={app.status} />
          </div>
        </div>

        {js.bio && <p className="mt-4 text-sm text-slate-700">{js.bio}</p>}

        {app.coverLetter && (
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase text-slate-400">Cover letter</p>
            <p className="mt-1 text-sm text-slate-700">{app.coverLetter}</p>
          </div>
        )}

        {/* Status workflow */}
        <div className="mt-6">
          <p className="label">Update status</p>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`badge ${app.status === s ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={message} className="btn-secondary mt-4">Message candidate</button>
        </div>
      </div>

      {/* Skills */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800">Skills</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {js.skills?.length ? js.skills.map((s: any) => (
            <span key={s.id} className="badge bg-brand-50 text-brand-700">{s.skillName} · {s.proficiencyLevel}</span>
          )) : <p className="text-sm text-slate-400">None listed</p>}
        </div>
      </div>

      {/* Education + Experience */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800">Education</h2>
          {js.education?.length ? js.education.map((e: any) => (
            <div key={e.id} className="mt-2 text-sm">
              <p className="font-medium text-slate-700">{e.degree}{e.field ? `, ${e.field}` : ''}</p>
              <p className="text-slate-500">{e.university} {e.graduationYear ? `· ${e.graduationYear}` : ''}</p>
            </div>
          )) : <p className="mt-2 text-sm text-slate-400">None listed</p>}
        </div>
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800">Experience</h2>
          {js.experiences?.length ? js.experiences.map((e: any) => (
            <div key={e.id} className="mt-2 text-sm">
              <p className="font-medium text-slate-700">{e.position}</p>
              <p className="text-slate-500">{e.company}</p>
            </div>
          )) : <p className="mt-2 text-sm text-slate-400">None listed</p>}
        </div>
      </div>

      {/* Resumes */}
      {js.resumes?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800">Resumes</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {js.resumes.map((r: any) => (
              <li key={r.id}>
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">{r.fileName}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
