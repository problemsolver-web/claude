"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@probashishield.gov.bd");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.login(email, password);
      if (!["admin", "super_admin"].includes(res.user.userType)) {
        throw new Error("This account is not an admin account.");
      }
      localStorage.setItem("ps_token", res.token);
      localStorage.setItem("ps_user", JSON.stringify(res.user));
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page max-w-sm">
      <div className="card">
        <h1 className="text-xl font-extrabold text-slate-800">Admin / Ministry login</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to manage complaints and blacklists.</p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-3 text-center text-xs text-slate-400">
          Demo: admin@probashishield.gov.bd / admin123
        </p>
      </div>
    </div>
  );
}
