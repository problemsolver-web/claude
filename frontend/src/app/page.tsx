import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-xl font-bold text-brand-700">JobMatch<span className="text-slate-800">BD</span></span>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary">Log in</Link>
          <Link href="/register" className="btn-primary">Get started</Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 text-center">
        <span className="badge bg-brand-100 text-brand-700">AI-powered matching</span>
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Where Bangladesh&apos;s talent meets opportunity
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          We intelligently connect companies with fresh graduates and job seekers — matching on skills,
          experience, and location so the right people find the right roles, faster.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/register?type=JOB_SEEKER" className="btn-primary px-6 py-3 text-base">Find a job</Link>
          <Link href="/register?type=COMPANY" className="btn-secondary px-6 py-3 text-base">Hire talent</Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 sm:grid-cols-3">
        {[
          { title: 'Smart matching', body: 'A transparent scoring engine ranks candidates and jobs by skills, experience and location fit.' },
          { title: 'Real-time updates', body: 'Instant in-app notifications and messaging keep applications moving without the wait.' },
          { title: 'Built for growth', body: 'Dashboards and analytics give companies and job seekers a clear view of every stage.' },
        ].map((f) => (
          <div key={f.title} className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} JobMatch BD. Connecting talent with opportunity.
      </footer>
    </div>
  );
}
