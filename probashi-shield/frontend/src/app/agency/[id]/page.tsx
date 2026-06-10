"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, AgencyDetail } from "@/lib/api";
import RiskBadge, { StatusPill } from "@/components/RiskBadge";
import ShareAgency from "@/components/ShareAgency";

const typeLabels: Record<string, string> = {
  money_fraud: "Money fraud",
  job_mismatch: "Job mismatch",
  visa_false: "Fake visa",
  salary_wrong: "Wrong salary",
  missing_contact: "Agent disappeared",
  other: "Other",
};

export default function AgencyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [agency, setAgency] = useState<AgencyDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAgency(id)
      .then(setAgency)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container-page"><div className="card border-red-200 bg-red-50 text-red-700">{error}</div></div>;
  if (!agency) return <div className="container-page"><div className="card">Loading...</div></div>;

  return (
    <div className="container-page space-y-6">
      <Link href="/" className="text-sm text-brand hover:underline">&larr; Back to search</Link>

      {/* Verdict banner */}
      <div
        className={`rounded-xl p-6 ${
          agency.risk.level === "danger"
            ? "bg-red-50 border border-red-200"
            : agency.risk.level === "caution"
            ? "bg-amber-50 border border-amber-200"
            : "bg-green-50 border border-green-200"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800">{agency.agencyName}</h1>
            <p className="text-sm text-slate-500">
              BMET License #{agency.bmetLicenseNumber}
            </p>
          </div>
          <RiskBadge risk={agency.risk} large />
        </div>
        {agency.blacklistStatus !== "none" && (
          <p className="mt-3 rounded-lg bg-red-100 p-3 text-sm font-semibold text-red-800">
            ⚠ This agency is BLACKLISTED by authorities
            {agency.blacklistReason ? `: ${agency.blacklistReason}` : "."} Do NOT
            pay any money.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Details */}
        <div className="card md:col-span-2">
          <h2 className="mb-3 font-bold text-slate-800">Agency Details</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <Detail label="License status"><StatusPill status={agency.licenseStatus} /></Detail>
            <Detail label="Owner">{agency.ownerName || "N/A"}</Detail>
            <Detail label="Phone">{agency.phonePrimary}</Detail>
            <Detail label="Email">{agency.email || "N/A"}</Detail>
            <Detail label="Office">{agency.headOfficeLocation || "N/A"}</Detail>
            <Detail label="Division">{agency.officeDivision || "N/A"}</Detail>
            <Detail label="License expiry">
              {agency.licenseExpiryDate
                ? new Date(agency.licenseExpiryDate).toLocaleDateString()
                : "N/A"}
            </Detail>
            <Detail label="Verification">
              {agency.verificationBadge === "none" ? "Not verified" : agency.verificationBadge + " badge"}
            </Detail>
          </dl>
          {agency.destinationCountries.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase text-slate-400">Destinations</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {agency.destinationCountries.map((c) => (
                  <span key={c} className="badge bg-brand-light text-brand-dark">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
        <div className="card">
          <h2 className="mb-3 font-bold text-slate-800">Fraud Reports</h2>
          <div className="space-y-2 text-sm">
            <Stat label="Total reports" value={agency.complaints.total} />
            <Stat label="Verified by Ministry" value={agency.complaints.verified} danger={agency.complaints.verified > 0} />
            <Stat label="Crowd reports" value={agency.complaints.unverified} />
          </div>
          <Link href={`/report?agencyId=${agency.id}`} className="btn-primary mt-4 w-full">
            Report this agency
          </Link>
        </div>
        <ShareAgency agencyName={agency.agencyName} />
        </div>
      </div>

      {/* Recent complaints */}
      {agency.complaints.recent.length > 0 && (
        <div className="card">
          <h2 className="mb-3 font-bold text-slate-800">Recent Reports</h2>
          <div className="space-y-3">
            {agency.complaints.recent.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-700">
                    {typeLabels[c.complaintType] || c.complaintType}
                  </span>
                  {c.isVerified && (
                    <span className="badge bg-red-100 text-red-700">Verified fraud</span>
                  )}
                  <span className="text-xs text-slate-400">
                    {c.reporterLocation || "Bangladesh"} ·{" "}
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-slate-700">{children}</dd>
    </div>
  );
}

function Stat({ label, value, danger }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`text-lg font-bold ${danger ? "text-red-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
