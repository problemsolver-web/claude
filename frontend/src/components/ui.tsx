'use client';

import clsx from 'clsx';
import { ReactNode } from 'react';

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={clsx('h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-brand-600', className)} />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  REVIEWED: 'bg-amber-100 text-amber-700',
  SHORTLISTED: 'bg-violet-100 text-violet-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-slate-200 text-slate-600',
  EXPIRED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-slate-100 text-slate-500',
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={clsx('badge', STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600')}>{status}</span>;
}

export function MatchScore({ score }: { score: number }) {
  const color = score >= 75 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600';
  return <span className={clsx('badge', color)}>{score}% Match</span>;
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center p-10 text-center">
      <p className="font-medium text-slate-700">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={size} height={size} className="rounded-full object-cover" style={{ width: size, height: size }} />;
  }
  return (
    <div
      className="flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
