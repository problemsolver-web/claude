'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui';

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    api('/api/auth/verify-email', { method: 'POST', auth: false, body: { token } })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8 text-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3">
            <Spinner className="h-8 w-8" />
            <p className="text-sm text-slate-500">Verifying your email…</p>
          </div>
        )}
        {status === 'ok' && (
          <>
            <h1 className="text-2xl font-bold text-green-700">Email verified!</h1>
            <p className="mt-2 text-sm text-slate-600">Your account is now fully active.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-2xl font-bold text-red-700">Verification failed</h1>
            <p className="mt-2 text-sm text-slate-600">This link may be invalid or expired.</p>
          </>
        )}
        <Link href="/login" className="btn-primary mt-6 inline-flex">Go to login</Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
