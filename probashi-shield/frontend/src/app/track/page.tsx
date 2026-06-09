"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-slate-100 text-slate-700" },
  under_review: { label: "Under review", color: "bg-blue-100 text-blue-700" },
  contacted_for_info: { label: "Contacted for info", color: "bg-blue-100 text-blue-700" },
  investigating: { label: "Investigating", color: "bg-amber-100 text-amber-700" },
  verified_fraud: { label: "Verified fraud", color: "bg-red-100 text-red-700" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
  dismissed: { label: "Dismissed", color: "bg-slate-100 text-slate-500" },
};

function TrackInner() {
  const searchParams = useSearchParams();
  const [ref, setRef] = useState(searchParams.get("ref") || "");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function check(e?: React.FormEvent) {
    e?.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await api.trackComplaint(ref.trim());
      setData(res);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get("ref")) check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-page max-w-xl">
      <h1 className="mb-1 text-2xl font-extrabold text-slate-800">Track your report</h1>
      <p className="mb-6 text-sm text-slate-500">
        Enter the tracking number you received when you submitted a report.
      </p>

      <form onSubmit={check} className="flex gap-2">
        <input
          className="input"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="e.g. PS-2026-AB12CD"
        />
        <button className="btn-primary" disabled={loading}>
          {loading ? "..." : "Check"}
        </button>
      </form>

      {error && <div className="card mt-4 border-red-200 bg-red-50 text-red-700">{error}</div>}

      {data && (
        <div className="card mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">{data.agencyName}</h2>
            <span className={`badge ${statusLabels[data.status]?.color}`}>
              {statusLabels[data.status]?.label || data.status}
            </span>
          </div>
          <Row label="Tracking number" value={data.trackingNumber} />
          <Row label="Type" value={data.complaintType} />
          <Row label="Verified by Ministry" value={data.isVerified ? "Yes" : "Not yet"} />
          <Row label="Submitted" value={new Date(data.submittedAt).toLocaleString()} />
          <Row label="Last updated" value={new Date(data.lastUpdated).toLocaleString()} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-2 text-sm last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="container-page"><div className="card">Loading...</div></div>}>
      <TrackInner />
    </Suspense>
  );
}
