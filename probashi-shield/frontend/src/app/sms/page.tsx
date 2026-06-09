"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

interface Msg {
  from: "user" | "system";
  text: string;
}

export default function SmsPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      from: "system",
      text:
        "PROBASHI SHIELD\nSend: VERIFY <agency>, FEE <country>, TIPS, or HELP",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(text?: string) {
    const message = (text ?? input).trim();
    if (!message) return;
    setMessages((m) => [...m, { from: "user", text: message }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sms/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { from: "system", text: data.reply || data.error }]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "system", text: "Could not reach the service. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-md">
      <h1 className="mb-1 text-2xl font-extrabold text-slate-800">SMS verification demo</h1>
      <p className="mb-6 text-sm text-slate-500">
        This simulates the SMS / USSD experience for workers with basic phones -
        no internet needed. The same logic powers the real SMS gateway.
      </p>

      {/* Phone mockup */}
      <div className="mx-auto w-full rounded-3xl border-8 border-slate-800 bg-slate-800 shadow-xl">
        <div className="rounded-2xl bg-slate-100">
          <div className="rounded-t-2xl bg-brand px-4 py-2 text-center text-sm font-semibold text-white">
            1234 · Probashi Shield
          </div>
          <div className="flex h-[380px] flex-col gap-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm ${
                  m.from === "user"
                    ? "self-end bg-brand text-white"
                    : "self-start bg-white text-slate-700 shadow-sm"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="self-start rounded-2xl bg-white px-3 py-2 text-sm text-slate-400 shadow-sm">
                ...
              </div>
            )}
          </div>
          <div className="flex gap-2 border-t border-slate-200 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-slate-300 px-3 py-1.5 text-sm outline-none"
            />
            <button onClick={() => send()} className="btn-primary rounded-full px-4">
              Send
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {["VERIFY Dubai Dream", "VERIFY Al-Amin", "FEE Malaysia", "TIPS", "HELP"].map((q) => (
          <button key={q} onClick={() => send(q)} className="btn-outline text-xs">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
