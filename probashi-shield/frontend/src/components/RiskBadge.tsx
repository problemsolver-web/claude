import { RiskVerdict } from "@/lib/api";

const styles: Record<string, string> = {
  safe: "bg-green-100 text-green-800 border border-green-200",
  caution: "bg-amber-100 text-amber-800 border border-amber-200",
  danger: "bg-red-100 text-red-800 border border-red-200",
};

export default function RiskBadge({ risk, large }: { risk: RiskVerdict; large?: boolean }) {
  return (
    <span
      className={`badge ${styles[risk.level]} ${large ? "px-3 py-1 text-sm" : ""}`}
    >
      <span>{risk.emoji}</span>
      <span>{risk.label}</span>
    </span>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
    suspended: "bg-red-100 text-red-700",
    revoked: "bg-red-100 text-red-700",
  };
  return (
    <span className={`badge ${map[status] || "bg-slate-100 text-slate-700"}`}>
      {status.toUpperCase()}
    </span>
  );
}
