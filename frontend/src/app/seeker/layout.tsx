'use client';

import { DashboardShell, NavItem } from '@/components/DashboardShell';

const nav: NavItem[] = [
  { label: 'Overview', href: '/seeker' },
  { label: 'Find Jobs', href: '/seeker/jobs' },
  { label: 'My Applications', href: '/seeker/applications' },
  { label: 'My Profile', href: '/seeker/profile' },
  { label: 'Messages', href: '/seeker/messages' },
];

export default function SeekerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={nav} requiredType="JOB_SEEKER">
      {children}
    </DashboardShell>
  );
}
