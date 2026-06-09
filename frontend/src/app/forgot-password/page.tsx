'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api('/api/auth/forgot-password', { method: 'POST', auth: false, body: { email } }).catch(() => undefined);
    setSent(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-slate-600">
            If an account exists for <strong>{email}</strong>, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="btn-primary w-full">Send reset link</button>
          </form>
        )}
        <Link href="/login" className="mt-4 block text-center text-sm text-brand-600 hover:underline">Back to login</Link>
      </div>
    </div>
  );
}
