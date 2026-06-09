import { prisma } from "../lib/prisma";
import { computeRisk, parseJsonArray } from "../utils/helpers";

// Build a public-facing, enriched view of an agency including complaint counts
// and a computed risk verdict. Used by both web and SMS endpoints.
export async function buildAgencyView(agencyId: string) {
  const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
  if (!agency) return null;

  const [total, verified, recent] = await Promise.all([
    prisma.complaint.count({ where: { agencyId } }),
    prisma.complaint.count({ where: { agencyId, isVerified: true } }),
    prisma.complaint.findMany({
      where: { agencyId, status: { not: "dismissed" } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        complaintType: true,
        description: true,
        reporterLocation: true,
        status: true,
        isVerified: true,
        severityLevel: true,
        createdAt: true,
      },
    }),
  ]);

  const risk = computeRisk({
    licenseStatus: agency.licenseStatus,
    blacklistStatus: agency.blacklistStatus,
    verifiedComplaints: verified,
    totalComplaints: total,
  });

  return {
    id: agency.id,
    bmetLicenseNumber: agency.bmetLicenseNumber,
    agencyName: agency.agencyName,
    ownerName: agency.ownerName,
    phonePrimary: agency.phonePrimary,
    phoneSecondary: agency.phoneSecondary,
    email: agency.email,
    websiteUrl: agency.websiteUrl,
    headOfficeLocation: agency.headOfficeLocation,
    officeDivision: agency.officeDivision,
    licenseIssueDate: agency.licenseIssueDate,
    licenseExpiryDate: agency.licenseExpiryDate,
    licenseStatus: agency.licenseStatus,
    destinationCountries: parseJsonArray(agency.destinationCountries),
    isVerified: agency.isVerified,
    verificationBadge: agency.verificationBadge,
    blacklistStatus: agency.blacklistStatus,
    blacklistReason: agency.blacklistReason,
    complaints: {
      total,
      verified,
      unverified: total - verified,
      recent,
    },
    risk,
  };
}
