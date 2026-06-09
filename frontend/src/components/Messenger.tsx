'use client';

import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useSocket } from '@/lib/socket';
import { useAuth } from '@/lib/auth';
import { Avatar, EmptyState } from '@/components/ui';

interface Conversation {
  userId: string;
  name: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}
interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

export function Messenger() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadConversations() {
    const data = await api<Conversation[]>('/api/messages/conversations').catch(() => []);
    setConversations(data);
    if (!active && data.length) setActive(data[0].userId);
  }

  async function loadThread(otherId: string) {
    const data = await api<{ items: Message[] }>(`/api/messages/conversations/${otherId}`).catch(() => ({ items: [] }));
    setMessages(data.items);
  }

  useEffect(() => {
    loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (active) loadThread(active);
  }, [active]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Live incoming messages for the open thread.
  useSocket({
    message: (m: Message) => {
      const otherId = m.senderId === user?.id ? m.recipientId : m.senderId;
      if (otherId === active) setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      loadConversations();
    },
  });

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    const content = draft.trim();
    setDraft('');
    await api('/api/messages', { method: 'POST', body: { recipientId: active, content } }).catch(() => undefined);
  }

  return (
    <div className="card grid h-[70vh] grid-cols-1 overflow-hidden md:grid-cols-[280px_1fr]">
      {/* Conversation list */}
      <div className="border-r border-slate-200">
        <div className="border-b border-slate-100 px-4 py-3 font-semibold text-slate-800">Conversations</div>
        <div className="overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-400">No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.userId}
                onClick={() => setActive(c.userId)}
                className={`flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50 ${active === c.userId ? 'bg-brand-50/50' : ''}`}
              >
                <Avatar name={c.name} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="truncate text-xs text-slate-500">{c.lastMessage}</p>
                </div>
                {c.unreadCount > 0 && <span className="badge bg-brand-600 text-white">{c.unreadCount}</span>}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex flex-col">
        {active ? (
          <>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      {m.content}
                      <div className={`mt-0.5 text-[10px] ${mine ? 'text-white/70' : 'text-slate-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
              <input className="input" placeholder="Type a message…" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <button className="btn-primary">Send</button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <EmptyState title="Select a conversation" subtitle="Your messages will appear here" />
          </div>
        )}
      </div>
    </div>
  );
}
