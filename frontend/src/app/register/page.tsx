'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Spinner } from '@/components/ui';

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const initialType = params.get('type') === 'COMPANY' ? 'COMPANY' : 'JOB_SEEKER';

  const [userType, setUserType] = useState<'COMPANY' | 'JOB_SEEKER'>(initialType);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({ name, email, password, userType, companyName: userType === 'COMPANY' ? companyName : undefined });
      router.push(user.userType === 'COMPANY' ? '/company' : '/seeker');
    } catch (err: any) {
      const details = err.details ? ' ' + Object.values(err.details).flat().join(', ') : '';
      setError((err.message || 'Registration failed') + details);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <Link href="/" className="text-lg font-bold text-brand-700">JobMatch<span className="text-slate-800">BD</span></Link>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Create your account</h1>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {(['JOB_SEEKER', 'COMPANY'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setUserType(t)}
              className={`rounded-md py-2 text-sm font-medium transition ${userType === t ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
            >
              {t === 'JOB_SEEKER' ? 'Job Seeker' : 'Company'}
            </button>
          ))}
        </div>

        {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="label">{userType === 'COMPANY' ? 'Contact name' : 'Full name'}</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          {userType === 'COMPANY' && (
            <div>
              <label className="label">Company name</label>
              <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <p className="mt-1 text-xs text-slate-400">Min 8 chars with upper, lower &amp; a number.</p>
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4 border-white/40 border-t-white" /> : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
