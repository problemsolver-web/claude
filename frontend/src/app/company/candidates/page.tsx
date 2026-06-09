'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { PageLoader, EmptyState, MatchScore, Avatar } from '@/components/ui';

function CandidatesInner() {
  const params = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobId, setJobId] = useState(params.get('jobId') ?? '');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api<{ items: any[] }>('/api/jobs/mine?status=ACTIVE')
      .then((d) => {
        setJobs(d.items);
        if (!jobId && d.items.length) setJobId(d.items[0].id);
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    api<any[]>(`/api/matching/jobs/${jobId}/candidates`)
      .then((d) => setCandidates(d))
      .catch(() => setCandidates([]))
      .finally(() => setLoading(false));
  }, [jobId]);

  async function invite(jobSeekerId: string) {
    await api(`/api/matching/jobs/${jobId}/invite/${jobSeekerId}`, { method: 'POST' }).catch(() => undefined);
    setInvited((prev) => ({ ...prev, [jobSeekerId]: true }));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Recommended candidates</h1>
      <p className="text-sm text-slate-500">AI-ranked matches for each active job posting.</p>

      <select className="input max-w-md" value={jobId} onChange={(e) => setJobId(e.target.value)}>
        {jobs.length === 0 && <option value="">No active jobs</option>}
        {jobs.map((j) => (
          <option key={j.id} value={j.id}>{j.title}</option>
        ))}
      </select>

      {loading ? (
        <PageLoader />
      ) : candidates.length === 0 ? (
        <EmptyState title="No candidate matches yet" subtitle="As job seekers join and complete profiles, matches will appear here" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {candidates.map((m) => {
            const js = m.jobSeeker;
            const reason = m.reason ?? {};
            return (
              <div key={m.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={js.user.name} src={js.profilePicture} size={48} />
                    <div>
                      <p className="font-semibold text-slate-900">{js.user.name}</p>
                      <p className="text-sm text-slate-500">{js.headline || 'Job Seeker'}</p>
                      <p className="text-xs text-slate-400">{js.location || 'Location N/A'}{reason.locationMatch ? ' · location match' : ''}</p>
                    </div>
                  </div>
                  <MatchScore score={m.matchScore} />
                </div>

                {reason.matchedSkills?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-slate-400">Matching skills</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {reason.matchedSkills.map((s: string) => (
                        <span key={s} className="badge bg-green-100 text-green-700">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {invited[js.id] || m.invited ? (
                    <span className="badge bg-green-100 text-green-700">Invited</span>
                  ) : (
                    <button className="btn-primary py-1.5" onClick={() => invite(js.id)}>Invite to apply</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function CompanyCandidates() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CandidatesInner />
    </Suspense>
  );
}
