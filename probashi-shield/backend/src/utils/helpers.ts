import jwt from "jsonwebtoken";
import { config } from "../config";

export interface JwtPayload {
  userId: string;
  userType: string;
  managedAgencyId?: string | null;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

// Generate a human-friendly complaint tracking number e.g. PS-2026-AB12CD
export function generateTrackingNumber(): string {
  const year = new Date().getFullYear();
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PS-${year}-${suffix}`;
}

// Safely parse a JSON-encoded string field into an array.
export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Compute a public-facing risk verdict for an agency based on license + complaints + blacklist.
export function computeRisk(opts: {
  licenseStatus: string;
  blacklistStatus: string;
  verifiedComplaints: number;
  totalComplaints: number;
}): { level: "safe" | "caution" | "danger"; label: string; emoji: string } {
  const { licenseStatus, blacklistStatus, verifiedComplaints, totalComplaints } = opts;

  if (blacklistStatus !== "none" || licenseStatus === "revoked") {
    return { level: "danger", label: "DANGER - Do not send money", emoji: "🔴" };
  }
  if (licenseStatus === "expired" || licenseStatus === "suspended") {
    return { level: "danger", label: "DANGER - License not active", emoji: "🔴" };
  }
  if (verifiedComplaints >= 1 || totalComplaints >= 3) {
    return { level: "caution", label: "CAUTION - Reports filed against this agency", emoji: "🟡" };
  }
  if (totalComplaints >= 1) {
    return { level: "caution", label: "CAUTION - Verify carefully", emoji: "🟡" };
  }
  return { level: "safe", label: "Licensed & no reports", emoji: "🟢" };
}
