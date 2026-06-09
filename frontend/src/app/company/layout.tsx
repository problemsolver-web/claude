'use client';

import { DashboardShell, NavItem } from '@/components/DashboardShell';

const nav: NavItem[] = [
  { label: 'Overview', href: '/company' },
  { label: 'Job Postings', href: '/company/jobs' },
  { label: 'Applications', href: '/company/applications' },
  { label: 'Recommended Candidates', href: '/company/candidates' },
  { label: 'Analytics', href: '/company/analytics' },
  { label: 'Messages', href: '/company/messages' },
  { label: 'Company Profile', href: '/company/profile' },
];

export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell nav={nav} requiredType="COMPANY">
      {children}
    </DashboardShell>
  );
}
