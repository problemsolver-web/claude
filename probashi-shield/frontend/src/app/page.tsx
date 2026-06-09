"use client";

import { useState } from "react";
import Link from "next/link";
import { api, AgencySearchResult } from "@/lib/api";
import RiskBadge, { StatusPill } from "@/components/RiskBadge";
import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();
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
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t("home.title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-brand-light/90">{t("home.subtitle")}</p>

        <form
          onSubmit={handleSearch}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-xl bg-white p-3 shadow-md sm:flex-row"
        >
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            <option value="name">{t("home.byName")}</option>
            <option value="license">{t("home.byLicense")}</option>
            <option value="phone">{t("home.byPhone")}</option>
          </select>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("home.placeholder")}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand"
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t("home.searching") : t("home.verify")}
          </button>
        </form>
        <p className="mt-3 text-xs text-brand-light/80">
          {t("home.try")}{" "}
          <button onClick={() => setQuery("Dubai Dream")} className="underline">Dubai Dream</button>
          {" · "}
          <button onClick={() => setQuery("Al-Amin")} className="underline">Al-Amin</button>
          {" · "}
          <button onClick={() => setQuery("Gulf Gateway")} className="underline">Gulf Gateway</button>
        </p>
      </section>

      {/* Results */}
      <section className="mt-8">
        {error && <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>}

        {results && results.length === 0 && (
          <div className="card border-amber-200 bg-amber-50">
            <p className="font-semibold text-amber-800">
              🟡 {t("home.noResultTitle")} &quot;{query}&quot;.
            </p>
            <p className="mt-1 text-sm text-amber-700">
              {t("home.noResultBody")}{" "}
              <Link href="/report" className="font-semibold underline">
                {t("home.reportItHere")}
              </Link>
              .
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              {results.length} {t("home.resultsFound")}
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
                      <h3 className="text-lg font-bold text-slate-800">{a.agencyName}</h3>
                      {a.verificationBadge === "premium" && (
                        <span className="badge bg-blue-100 text-blue-700">✓ Premium Verified</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      License #{a.bmetLicenseNumber} · {a.headOfficeLocation || "Location N/A"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill status={a.licenseStatus} />
                      {a.complaintCount > 0 && (
                        <span className="badge bg-slate-100 text-slate-600">
                          {a.complaintCount} {t("home.reports")}
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
          { t: t("home.step1.t"), d: t("home.step1.d") },
          { t: t("home.step2.t"), d: t("home.step2.d") },
          { t: t("home.step3.t"), d: t("home.step3.d") },
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
