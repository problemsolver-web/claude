"use client";

import { useState } from "react";
import Link from "next/link";
import { api, AgencySearchResult } from "@/lib/api";
import RiskBadge, { StatusPill } from "@/components/RiskBadge";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("name");
  const [results, setResults] = useState<AgencySearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const data = await api.searchAgencies(query.trim(), type);
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || "Search failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-6 py-12 text-center text-white shadow-lg">
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Before you pay, verify the agent.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-light/90">
          Every year thousands of Bangladeshi workers lose 3-5 lakh taka to fake
          recruiting agents. Check any agency against the official BMET licensed
          list in seconds - free.
        </p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-3 shadow-md sm:flex-row"
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="name">By Name</option>
            <option value="license">By License #</option>
            <option value="phone">By Phone</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Gulf Gateway, RL-1024, 01711..."
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Searching..." : "Verify"}
          </button>
        </form>
        <p className="mt-3 text-xs text-brand-light/80">
          Try: <button onClick={() => setQuery("Dubai Dream")} className="underline">Dubai Dream</button>
          {" · "}
          <button onClick={() => setQuery("Al-Amin")} className="underline">Al-Amin</button>
          {" · "}
          <button onClick={() => setQuery("Gulf Gateway")} className="underline">Gulf Gateway</button>
        </p>
      </section>

      {/* Results */}
      <section className="mt-8">
        {error && (
          <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>
        )}

        {results && results.length === 0 && (
          <div className="card border-amber-200 bg-amber-50">
            <p className="font-semibold text-amber-800">
              🟡 No licensed agency found matching &quot;{query}&quot;.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              This agency is NOT in the BMET licensed list. Do not send money
              until you verify. If someone is using this name to collect money,{" "}
              <Link href="/report" className="font-semibold underline">
                report it here
              </Link>
              .
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {results.length} result{results.length > 1 ? "s" : ""} found
            </p>
            {results.map((a) => (
              <Link
                key={a.id}
                href={`/agency/${a.id}`}
                className="card block transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-800">
                        {a.agencyName}
                      </h3>
                      {a.verificationBadge === "premium" && (
                        <span className="badge bg-blue-100 text-blue-700">
                          ✓ Premium Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      License #{a.bmetLicenseNumber} ·{" "}
                      {a.headOfficeLocation || "Location N/A"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill status={a.licenseStatus} />
                      {a.complaintCount > 0 && (
                        <span className="badge bg-slate-100 text-slate-600">
                          {a.complaintCount} report
                          {a.complaintCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <RiskBadge risk={a.risk} large />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { t: "1. Search", d: "Enter the agency name, BMET license number, or phone number." },
          { t: "2. See the verdict", d: "Instantly know if they are licensed and how many fraud reports exist." },
          { t: "3. Decide safely", d: "Never hand over your land money to an unverified agent again." },
        ].map((s) => (
          <div key={s.t} className="card">
            <h3 className="font-bold text-brand-dark">{s.t}</h3>
            <p className="mt-1 text-sm text-slate-600">{s.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
