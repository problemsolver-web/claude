"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function ReportForm() {
  const searchParams = useSearchParams();
  const prefillAgencyId = searchParams.get("agencyId") || "";

  const [form, setForm] = useState({
    agencyId: prefillAgencyId,
    agencyName: "",
    complaintType: "money_fraud",
    description: "",
    amountLost: "",
    reporterName: "",
    reporterPhone: "",
    reporterLocation: "",
    incidentDate: "",
  });
  const [result, setResult] = useState<{ trackingNumber: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.agencyId && !form.agencyName.trim()) {
      setError("Please enter the agency name you are reporting.");
      return;
    }
    if (form.description.trim().length < 10) {
      setError("Please describe what happened (at least 10 characters).");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        complaintType: form.complaintType,
        description: form.description.trim(),
        reporterName: form.reporterName || undefined,
        reporterPhone: form.reporterPhone || undefined,
        reporterLocation: form.reporterLocation || undefined,
        incidentDate: form.incidentDate || undefined,
      };
      if (form.agencyId) payload.agencyId = form.agencyId;
      else payload.agencyName = form.agencyName.trim();
      if (form.amountLost) payload.amountLost = Number(form.amountLost);

      const res = await api.submitComplaint(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="card border-green-200 bg-green-50 text-center">
        <h2 className="text-xl font-bold text-green-800">Report submitted</h2>
        <p className="mt-2 text-sm text-green-700">
          Thank you for protecting others. Save this tracking number to check
          your report status:
        </p>
        <p className="my-4 text-2xl font-extrabold tracking-wider text-slate-800">
          {result.trackingNumber}
        </p>
        <div className="flex justify-center gap-3">
          <Link href={`/track?ref=${result.trackingNumber}`} className="btn-outline">
            Track status
          </Link>
          <Link href="/" className="btn-primary">Done</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {!prefillAgencyId && (
        <div>
          <label className="label">Agency / agent name being reported *</label>
          <input
            className="input"
            value={form.agencyName}
            onChange={(e) => update("agencyName", e.target.value)}
            placeholder="Name of the agent or agency"
          />
        </div>
      )}
      {prefillAgencyId && (
        <p className="rounded-lg bg-brand-light p-3 text-sm text-brand-dark">
          Reporting a known agency. Your report will be linked to it.
        </p>
      )}

      <div>
        <label className="label">Type of fraud *</label>
        <select
          className="input"
          value={form.complaintType}
          onChange={(e) => update("complaintType", e.target.value)}
        >
          <option value="money_fraud">Took money / disappeared</option>
          <option value="job_mismatch">Job was different than promised</option>
          <option value="visa_false">Fake or wrong visa</option>
          <option value="salary_wrong">Salary was wrong</option>
          <option value="missing_contact">Cannot contact agent anymore</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div>
        <label className="label">What happened? *</label>
        <textarea
          className="input min-h-[120px]"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Describe what the agent promised, what you paid, and what went wrong."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Amount lost (BDT)</label>
          <input
            type="number"
            className="input"
            value={form.amountLost}
            onChange={(e) => update("amountLost", e.target.value)}
            placeholder="e.g. 350000"
          />
        </div>
        <div>
          <label className="label">Date of incident</label>
          <input
            type="date"
            className="input"
            value={form.incidentDate}
            onChange={(e) => update("incidentDate", e.target.value)}
          />
        </div>
      </div>

      <details className="rounded-lg border border-slate-200 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-600">
          Your contact info (optional - reports can be anonymous)
        </summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <input className="input" placeholder="Your name" value={form.reporterName} onChange={(e) => update("reporterName", e.target.value)} />
          <input className="input" placeholder="Phone" value={form.reporterPhone} onChange={(e) => update("reporterPhone", e.target.value)} />
          <input className="input sm:col-span-2" placeholder="District / location" value={form.reporterLocation} onChange={(e) => update("reporterLocation", e.target.value)} />
        </div>
      </details>

      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Submitting..." : "Submit report"}
      </button>
      <p className="text-center text-xs text-slate-400">
        Your report helps warn other families. False reports may be removed by
        the Ministry review team.
      </p>
    </form>
  );
}

export default function ReportPage() {
  return (
    <div className="container-page max-w-2xl">
      <h1 className="mb-1 text-2xl font-extrabold text-slate-800">Report a fraudulent agent</h1>
      <p className="mb-6 text-sm text-slate-500">
        Help protect others. Reports are reviewed by the Ministry team before
        being marked verified.
      </p>
      <Suspense fallback={<div className="card">Loading...</div>}>
        <ReportForm />
      </Suspense>
    </div>
  );
}
