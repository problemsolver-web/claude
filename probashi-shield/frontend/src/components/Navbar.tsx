import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            PS
          </span>
          <span className="text-lg font-bold text-brand-dark">
            Probashi Shield
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/" className="hover:text-brand">Verify Agency</Link>
          <Link href="/destinations" className="hover:text-brand">Country Fees</Link>
          <Link href="/safety" className="hover:text-brand">Safety Guide</Link>
          <Link href="/sms" className="hover:text-brand">SMS Demo</Link>
          <Link href="/track" className="hover:text-brand">Track Report</Link>
          <Link href="/report" className="btn-primary">Report Fraud</Link>
        </nav>
        <Link href="/report" className="btn-primary md:hidden">Report</Link>
      </div>
    </header>
  );
}
