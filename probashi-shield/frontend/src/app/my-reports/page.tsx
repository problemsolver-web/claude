"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const statusLabels: Record<string, { label: string; color: string }> = {
  submitted: { label: "Submitted", color: "bg-slate-100 text-slate-700" },
  under_review: { label: "Under review", color: "bg-blue-100 text-blue-700" },
  contacted_for_info: { label: "Contacted", color: "bg-blue-100 text-blue-700" },
  investigating: { label: "Investigating", color: "bg-amber-100 text-amber-700" },
  verified_fraud: { label: "Verified fraud", color: "bg-red-100 text-red-700" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
  dismissed: { label: "Dismissed", color: "bg-slate-100 text-slate-500" },
};

export default function MyReportsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [reports, setReports] = useState<any[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    api
      .myReports()
      .then((d) => setReports(d.complaints))
      .catch((e) => setError(e.message));
  }, [user, loading, router]);

  return (
    <div className="container-page max-w-3xl">
      <h1 className="mb-1 text-2xl font-extrabold text-slate-800">My reports</h1>
      <p className="mb-6 text-sm text-slate-500">
        Every fraud report you&apos;ve filed while signed in, with its current status.
      </p>

      {error && <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>}

      {reports && reports.length === 0 && (
        <div className="card text-center">
          <p className="text-slate-600">You haven&apos;t filed any reports yet.</p>
          <Link href="/report" className="btn-primary mt-3 inline-flex">
            Report a fraud
          </Link>
        </div>
      )}

      {reports && reports.length > 0 && (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/agency/${r.agency.id}`}
                  className="font-bold text-slate-800 hover:text-brand"
                >
                  {r.agency.agencyName}
                </Link>
                <span className={`badge ${statusLabels[r.status]?.color}`}>
                  {statusLabels[r.status]?.label || r.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.description}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>Tracking: {r.trackingNumber}</span>
                {r.amountLost ? <span>Loss: ৳{Number(r.amountLost).toLocaleString()}</span> : null}
                <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
