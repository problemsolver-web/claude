'use client';

import { Messenger } from '@/components/Messenger';

export default function SeekerMessages() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      <Messenger />
    </div>
  );
}
