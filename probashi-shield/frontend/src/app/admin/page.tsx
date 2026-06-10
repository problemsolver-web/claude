"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const statusOptions = [
  "submitted",
  "under_review",
  "contacted_for_info",
  "investigating",
  "verified_fraud",
  "resolved",
  "dismissed",
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");

  async function load() {
    try {
      const [dash, comp] = await Promise.all([
        api.adminDashboard(),
        api.adminComplaints(filter ? `?status=${filter}` : ""),
      ]);
      setStats(dash);
      setComplaints(comp.complaints);
    } catch (err: any) {
      setError(err.message);
      if (err.message.toLowerCase().includes("auth")) router.push("/admin/login");
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("ps_token")) {
      router.push("/admin/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function updateStatus(id: string, status: string) {
    try {
      await api.updateComplaint(id, {
        status,
        isVerified: status === "verified_fraud",
      });
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function blacklist(agencyId: string) {
    if (!confirm("Permanently blacklist this agency?")) return;
    try {
      await api.blacklistAgency(agencyId, {
        blacklistStatus: "permanent_blacklist",
        reason: "Confirmed fraud by Ministry review",
      });
      alert("Agency blacklisted.");
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function logout() {
    localStorage.removeItem("ps_token");
    localStorage.removeItem("ps_user");
    router.push("/admin/login");
  }

  if (error && !stats) {
    return (
      <div className="container-page">
        <div className="card border-red-200 bg-red-50 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-page space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-800">Ministry dashboard</h1>
        <button onClick={logout} className="btn-outline">Logout</button>
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Agencies tracked" value={stats.agencies.total} />
          <StatCard label="Blacklisted" value={stats.agencies.blacklisted} danger />
          <StatCard label="Open complaints" value={stats.complaints.open} />
          <StatCard label="Verified fraud" value={stats.complaints.verifiedFraud} danger />
          <StatCard label="Total searches" value={stats.searches.total} />
          <StatCard label="Via SMS" value={stats.searches.viaSms} />
          <StatCard
            label="Loss reported (BDT)"
            value={Number(stats.estimatedLossReported).toLocaleString()}
            danger
          />
          <StatCard label="Active agencies" value={stats.agencies.active} />
        </div>
      )}

      {/* Complaints table */}
      <div className="card overflow-x-auto">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Complaints</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
              <th className="py-2">Agency</th>
              <th className="py-2">Type</th>
              <th className="py-2">Loss</th>
              <th className="py-2">Status</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 align-top">
                <td className="py-3 pr-2">
                  <p className="font-medium text-slate-800">{c.agency?.agencyName}</p>
                  <p className="text-xs text-slate-400">{c.reporterLocation || "—"}</p>
                </td>
                <td className="py-3 pr-2 text-slate-600">{c.complaintType}</td>
                <td className="py-3 pr-2 text-slate-600">
                  {c.amountLost ? `৳${Number(c.amountLost).toLocaleString()}` : "—"}
                </td>
                <td className="py-3 pr-2">
                  <select
                    value={c.status}
                    onChange={(e) => updateStatus(c.id, e.target.value)}
                    className="rounded border border-slate-300 px-1.5 py-1 text-xs"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3">
                  <button
                    onClick={() => blacklist(c.agencyId)}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Blacklist agency
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {complaints.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">No complaints found.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, danger }: { label: string; value: string | number; danger?: boolean }) {
  return (
    <div className="card">
      <p className="text-xs uppercase text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${danger ? "text-red-600" : "text-brand-dark"}`}>
        {value}
      </p>
    </div>
  );
}
