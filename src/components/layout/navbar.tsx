'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { logout } from '@/lib/actions/auth'
import type { User } from '@/types/database'

interface NavbarProps {
  user?: User | null
}

export function Navbar({ user }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const dashboardPath = user?.role === 'employer'
    ? '/dashboard/employer'
    : '/dashboard/jobseeker'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary-600">BDJobs</span>
            <span className="text-xl font-bold text-secondary-600">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href={dashboardPath}
                  className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                >
                  Dashboard
                </Link>
                {user.role === 'jobseeker' && (
                  <Link
                    href="/dashboard/jobseeker/jobs"
                    className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                  >
                    Browse Jobs
                  </Link>
                )}
                {user.role === 'employer' && (
                  <>
                    <Link
                      href="/dashboard/employer/jobs"
                      className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                    >
                      My Jobs
                    </Link>
                    <Link
                      href="/dashboard/employer/company"
                      className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                    >
                      Company
                    </Link>
                  </>
                )}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-xs">
                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span>{user.full_name}</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                      <Link
                        href={dashboardPath}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <form action={logout}>
                        <button
                          type="submit"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Sign Out
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-2">
          {user ? (
            <>
              <Link
                href={dashboardPath}
                className="block py-2 text-gray-600 hover:text-primary-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="block w-full text-left py-2 text-gray-600 hover:text-primary-600 font-medium"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block py-2 text-gray-600 hover:text-primary-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="block py-2 text-primary-600 font-medium"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
