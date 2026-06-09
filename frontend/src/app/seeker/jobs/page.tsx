'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { PageLoader, EmptyState, MatchScore, StatusBadge } from '@/components/ui';

interface Job {
  id: string;
  title: string;
  description: string;
  location?: string;
  jobType: string;
  salaryMin?: number;
  salaryMax?: number;
  skillsRequired: string[];
  company?: { companyName: string };
  matchScore?: number;
}

export default function SeekerJobs() {
  const [tab, setTab] = useState<'recommended' | 'all'>('recommended');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [applied, setApplied] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Job | null>(null);

  async function load() {
    setLoading(true);
    try {
      if (tab === 'recommended') {
        const data = await api<Job[]>('/api/matching/recommended-jobs');
        setJobs(data);
      } else {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (jobType) params.set('jobType', jobType);
        const data = await api<{ items: Job[] }>(`/api/jobs/search?${params.toString()}`);
        setJobs(data.items);
      }
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function apply(job: Job) {
    try {
      await api('/api/applications', { method: 'POST', body: { jobPostingId: job.id } });
      setApplied((prev) => ({ ...prev, [job.id]: 'Applied' }));
      setSelected(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to apply';
      setApplied((prev) => ({ ...prev, [job.id]: message }));
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Find your next role</h1>

      <div className="flex gap-2">
        {(['recommended', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            {t === 'recommended' ? 'Recommended for you' : 'Browse all'}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="card flex flex-wrap items-end gap-3 p-4"
        >
          <div className="flex-1">
            <label className="label">Keyword</label>
            <input className="input" placeholder="Title or description" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="label">Job type</label>
            <select className="input" value={jobType} onChange={(e) => setJobType(e.target.value)}>
              <option value="">Any</option>
              <option value="REMOTE">Remote</option>
              <option value="ONSITE">Onsite</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </div>
          <button className="btn-primary">Search</button>
        </form>
      )}

      {loading ? (
        <PageLoader />
      ) : jobs.length === 0 ? (
        <EmptyState title="No jobs found" subtitle={tab === 'recommended' ? 'Complete your profile to get better matches' : 'Try adjusting your search'} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{job.title}</h3>
                  <p className="text-sm text-slate-500">{job.company?.companyName}</p>
                </div>
                {typeof job.matchScore === 'number' && <MatchScore score={job.matchScore} />}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{job.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skillsRequired.slice(0, 5).map((s) => (
                  <span key={s} className="badge bg-slate-100 text-slate-600">{s}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                <span>{job.location || 'Flexible'} · {job.jobType}</span>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary py-1.5" onClick={() => setSelected(job)}>Details</button>
                  {applied[job.id] ? (
                    <span className="badge bg-green-100 text-green-700">{applied[job.id]}</span>
                  ) : (
                    <button className="btn-primary py-1.5" onClick={() => apply(job)}>Apply</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="card max-h-[80vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900">{selected.title}</h2>
            <p className="text-sm text-slate-500">{selected.company?.companyName}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{selected.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {selected.skillsRequired.map((s) => (
                <span key={s} className="badge bg-brand-50 text-brand-700">{s}</span>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setSelected(null)}>Close</button>
              {!applied[selected.id] && <button className="btn-primary" onClick={() => apply(selected)}>Apply now</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
