// Lightweight API client for the Probashi Shield backend.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export interface RiskVerdict {
  level: "safe" | "caution" | "danger";
  label: string;
  emoji: string;
}

export interface AgencySearchResult {
  id: string;
  agencyName: string;
  bmetLicenseNumber: string;
  licenseStatus: string;
  blacklistStatus: string;
  headOfficeLocation?: string | null;
  phonePrimary: string;
  verificationBadge: string;
  destinationCountries: string[];
  complaintCount: number;
  verifiedComplaintCount: number;
  risk: RiskVerdict;
}

export interface AgencyDetail extends AgencySearchResult {
  ownerName?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  licenseExpiryDate?: string | null;
  officeDivision?: string | null;
  isVerified: boolean;
  complaints: {
    total: number;
    verified: number;
    unverified: number;
    recent: Array<{
      id: string;
      complaintType: string;
      description: string;
      reporterLocation?: string | null;
      status: string;
      isVerified: boolean;
      severityLevel: string;
      createdAt: string;
    }>;
  };
}

function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("ps_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as any)?.error || "Request failed");
  }
  return data as T;
}

export const api = {
  searchAgencies: (q: string, type = "name") =>
    request<{ results: AgencySearchResult[]; count: number }>(
      `/agencies/search?q=${encodeURIComponent(q)}&type=${type}`
    ),
  getAgency: (id: string) => request<AgencyDetail>(`/agencies/${id}`),
  submitComplaint: (body: unknown) =>
    request<{ trackingNumber: string; message: string }>(`/complaints`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  trackComplaint: (trackingNumber: string) =>
    request<any>(`/complaints/track/${encodeURIComponent(trackingNumber)}`),
  getDestinations: () => request<{ destinations: any[]; count: number }>(`/destinations`),
  getPublicStats: () => request<any>(`/stats/public`),
  smsVerify: (message: string) =>
    request<{ reply: string }>(`/sms/verify`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  adminDashboard: () => request<any>(`/admin/dashboard`),
  adminComplaints: (params = "") => request<any>(`/admin/complaints${params}`),
  updateComplaint: (id: string, body: unknown) =>
    request<any>(`/admin/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  blacklistAgency: (id: string, body: unknown) =>
    request<any>(`/admin/agencies/${id}/blacklist`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
};
