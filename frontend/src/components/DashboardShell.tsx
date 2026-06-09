'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useAuth, UserType } from '@/lib/auth';
import { PageLoader, Avatar } from '@/components/ui';
import { NotificationBell } from '@/components/NotificationBell';

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Authenticated dashboard layout with a sidebar, top bar (notifications +
 * user menu) and a client-side role guard.
 */
export function DashboardShell({ nav, requiredType, children }: { nav: NavItem[]; requiredType: UserType; children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && user.userType !== requiredType) {
      router.replace(user.userType === 'COMPANY' ? '/company' : '/seeker');
    }
  }, [loading, user, requiredType, router]);

  if (loading || !user || user.userType !== requiredType) return <PageLoader />;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="px-6 py-5 text-lg font-bold text-brand-700">
          JobMatch<span className="text-slate-800">BD</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'block rounded-lg px-3 py-2 text-sm font-medium',
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="m-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-500 hover:bg-slate-50">
          Log out
        </button>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          {/* Mobile nav */}
          <div className="flex items-center gap-2 md:hidden">
            <select
              className="input py-1.5"
              value={pathname}
              onChange={(e) => router.push(e.target.value)}
            >
              {nav.map((item) => (
                <option key={item.href} value={item.href}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <Avatar name={user.name} src={user.jobSeeker?.profilePicture || user.company?.logo} size={34} />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-400">{user.userType === 'COMPANY' ? 'Company' : 'Job Seeker'}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
