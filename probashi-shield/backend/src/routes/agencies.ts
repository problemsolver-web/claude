import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/error";
import { buildAgencyView } from "../services/agencyView";
import { computeRisk, parseJsonArray } from "../utils/helpers";

const router = Router();

// GET /api/v1/agencies/search?q=...&type=name|license|phone
router.get(
  "/search",
  asyncHandler(async (req, res) => {
    const q = String(req.query.q || "").trim();
    const type = String(req.query.type || "name");
    if (!q) throw new AppError("Search query 'q' is required", 400);

    let where: any;
    let searchType = "by_name";
    if (type === "license") {
      where = { bmetLicenseNumber: { contains: q } };
      searchType = "by_license";
    } else if (type === "phone") {
      const digits = q.replace(/\D/g, "");
      where = {
        OR: [{ phonePrimary: { contains: digits } }, { phoneSecondary: { contains: digits } }],
      };
      searchType = "by_phone";
    } else {
      where = { agencyName: { contains: q } };
      searchType = "by_name";
    }

    const agencies = await prisma.agency.findMany({
      where,
      take: 25,
      orderBy: { agencyName: "asc" },
    });

    // Log the search (fire and forget)
    prisma.verificationLog
      .create({
        data: {
          agencyId: agencies[0]?.id ?? null,
          searchQuery: q,
          searchType,
          channel: "web",
          resultFound: agencies.length > 0,
        },
      })
      .catch(() => undefined);

    // Enrich each result with complaint counts + risk
    const results = await Promise.all(
      agencies.map(async (a) => {
        const total = await prisma.complaint.count({ where: { agencyId: a.id } });
        const verified = await prisma.complaint.count({
          where: { agencyId: a.id, isVerified: true },
        });
        const risk = computeRisk({
          licenseStatus: a.licenseStatus,
          blacklistStatus: a.blacklistStatus,
          verifiedComplaints: verified,
          totalComplaints: total,
        });
        return {
          id: a.id,
          agencyName: a.agencyName,
          bmetLicenseNumber: a.bmetLicenseNumber,
          licenseStatus: a.licenseStatus,
          blacklistStatus: a.blacklistStatus,
          headOfficeLocation: a.headOfficeLocation,
          phonePrimary: a.phonePrimary,
          verificationBadge: a.verificationBadge,
          destinationCountries: parseJsonArray(a.destinationCountries),
          complaintCount: total,
          verifiedComplaintCount: verified,
          risk,
        };
      })
    );

    res.json({ query: q, type, count: results.length, results });
  })
);

// GET /api/v1/agencies/:id  -> full public view
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const view = await buildAgencyView(req.params.id);
    if (!view) throw new AppError("Agency not found", 404);
    res.json(view);
  })
);

// GET /api/v1/agencies/:id/complaints -> public complaint list (sanitized)
router.get(
  "/:id/complaints",
  asyncHandler(async (req, res) => {
    const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
    if (!agency) throw new AppError("Agency not found", 404);

    const complaints = await prisma.complaint.findMany({
      where: { agencyId: agency.id, status: { not: "dismissed" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        complaintType: true,
        description: true,
        reporterLocation: true,
        amountLost: true,
        status: true,
        isVerified: true,
        severityLevel: true,
        createdAt: true,
      },
    });
    res.json({ count: complaints.length, complaints });
  })
);

export default router;
