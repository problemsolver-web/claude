"use client";

import Link from "next/link";
import { useState } from "react";
import { useI18n, LanguageToggle } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function Navbar() {
  const { t } = useI18n();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("nav.verify") },
    { href: "/destinations", label: t("nav.fees") },
    { href: "/safety", label: t("nav.safety") },
    { href: "/sms", label: t("nav.sms") },
    { href: "/impact", label: t("nav.impact") },
    { href: "/track", label: t("nav.track") },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            PS
          </span>
          <span className="text-lg font-bold text-brand-dark">{t("brand.name")}</span>
        </Link>

        <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand">
              {l.label}
            </Link>
          ))}
          <LanguageToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                Hi, {user.name || user.email.split("@")[0]}
              </span>
              <button onClick={logout} className="btn-outline">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-outline">
              Sign in
            </Link>
          )}
          <Link href="/report" className="btn-primary">
            {t("nav.report")}
          </Link>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageToggle />
          <Link href="/report" className="btn-primary">
            {t("nav.report.short")}
          </Link>
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-md border border-slate-300 px-2 py-1 text-slate-600"
            aria-label="Menu"
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white lg:hidden">
          <div className="container-page flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-slate-600 hover:text-brand"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-2">
              {user ? (
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="py-2 text-sm font-medium text-slate-600 hover:text-brand"
                >
                  Logout ({user.name || user.email.split("@")[0]})
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="block py-2 text-sm font-medium text-slate-600 hover:text-brand"
                >
                  Sign in / Create account
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
