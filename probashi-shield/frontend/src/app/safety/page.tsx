import Link from "next/link";

export default function SafetyPage() {
  return (
    <div className="container-page max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">
          Safety guide for migrant workers
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Follow these steps before you pay any money to a recruiting agent.
        </p>
      </div>

      <section className="card">
        <h2 className="mb-3 font-bold text-brand-dark">✅ Before you pay - checklist</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          {[
            "Verify the agency on Probashi Shield (search by name or BMET license number).",
            "Confirm the BMET license is active and not expired or suspended.",
            "Get the job offer and contract in writing - including salary and job type.",
            "Compare the fee against the official government fee for that country.",
            "Never pay cash without an official receipt. Use bank or mobile transfer with records.",
            "Confirm the employer name matches your visa and contract.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-safe">✔</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card border-red-200">
        <h2 className="mb-3 font-bold text-danger">🚩 Red flags - walk away if you see these</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          {[
            "Agent demands large cash upfront with no receipt.",
            "Promises of very high salary without any interview or test.",
            "Pressure to decide quickly or keep it secret from family.",
            "No written contract, or contract differs from verbal promises.",
            "Agent is not in the BMET licensed list.",
            "Office address cannot be verified or keeps changing.",
            "'Free visa' offers - these are illegal and dangerous.",
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-danger">✕</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-3 font-bold text-brand-dark">📞 If you have been defrauded</h2>
        <ul className="space-y-2 text-sm text-slate-700">
          <li>1. Keep all evidence: receipts, messages, contracts, the agent&apos;s number.</li>
          <li>2. File a report on this platform to warn others.</li>
          <li>3. Call the Ministry / BMET hotline: <strong>16135</strong>.</li>
          <li>4. Visit your nearest District Employment and Manpower Office (DEMO).</li>
        </ul>
        <Link href="/report" className="btn-primary mt-4 inline-flex">Report a fraud now</Link>
      </section>
    </div>
  );
}
