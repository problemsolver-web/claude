import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/error";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// GET /api/v1/admin/dashboard -> summary metrics
router.get(
  "/dashboard",
  asyncHandler(async (_req, res) => {
    const [
      totalAgencies,
      activeAgencies,
      blacklisted,
      totalComplaints,
      openComplaints,
      verifiedFraud,
      totalSearches,
      smsSearches,
    ] = await Promise.all([
      prisma.agency.count(),
      prisma.agency.count({ where: { licenseStatus: "active", blacklistStatus: "none" } }),
      prisma.agency.count({ where: { blacklistStatus: { not: "none" } } }),
      prisma.complaint.count(),
      prisma.complaint.count({
        where: { status: { in: ["submitted", "under_review", "investigating"] } },
      }),
      prisma.complaint.count({ where: { status: "verified_fraud" } }),
      prisma.verificationLog.count(),
      prisma.verificationLog.count({ where: { channel: "sms" } }),
    ]);

    // estimated money protected = sum of amountLost on verified fraud reports
    const lossAgg = await prisma.complaint.aggregate({
      where: { isVerified: true },
      _sum: { amountLost: true },
    });

    // complaint type breakdown
    const byTypeRaw = await prisma.complaint.groupBy({
      by: ["complaintType"],
      _count: { complaintType: true },
    });
    const complaintsByType = byTypeRaw.map((r) => ({
      type: r.complaintType,
      count: r._count.complaintType,
    }));

    res.json({
      agencies: { total: totalAgencies, active: activeAgencies, blacklisted },
      complaints: { total: totalComplaints, open: openComplaints, verifiedFraud },
      searches: { total: totalSearches, viaSms: smsSearches },
      estimatedLossReported: lossAgg._sum.amountLost || 0,
      complaintsByType,
    });
  })
);

// GET /api/v1/admin/complaints?status=&type=&agencyId=
router.get(
  "/complaints",
  asyncHandler(async (req, res) => {
    const { status, type, agencyId } = req.query;
    const where: any = {};
    if (status) where.status = String(status);
    if (type) where.complaintType = String(type);
    if (agencyId) where.agencyId = String(agencyId);

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { agency: { select: { agencyName: true, bmetLicenseNumber: true } } },
    });
    res.json({ count: complaints.length, complaints });
  })
);

const updateComplaintSchema = z.object({
  status: z
    .enum([
      "submitted",
      "under_review",
      "contacted_for_info",
      "investigating",
      "verified_fraud",
      "resolved",
      "dismissed",
    ])
    .optional(),
  adminNotes: z.string().optional(),
  isVerified: z.boolean().optional(),
  severityLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
});

// PUT /api/v1/admin/complaints/:id
router.put(
  "/complaints/:id",
  asyncHandler(async (req, res) => {
    const data = updateComplaintSchema.parse(req.body);
    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!complaint) throw new AppError("Complaint not found", 404);

    const updated = await prisma.complaint.update({
      where: { id: req.params.id },
      data: {
        ...data,
        resolutionDate:
          data.status === "resolved" || data.status === "verified_fraud"
            ? new Date()
            : complaint.resolutionDate,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: req.user!.userId,
        actionType: "update_complaint",
        targetEntityId: complaint.id,
        details: JSON.stringify(data),
      },
    });

    res.json(updated);
  })
);

const blacklistSchema = z.object({
  blacklistStatus: z.enum(["none", "temporary_blacklist", "permanent_blacklist"]),
  reason: z.string().optional(),
  temporaryUntil: z.string().optional(),
});

// PUT /api/v1/admin/agencies/:id/blacklist
router.put(
  "/agencies/:id/blacklist",
  asyncHandler(async (req, res) => {
    const data = blacklistSchema.parse(req.body);
    const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
    if (!agency) throw new AppError("Agency not found", 404);

    const updated = await prisma.agency.update({
      where: { id: agency.id },
      data: {
        blacklistStatus: data.blacklistStatus,
        blacklistReason: data.reason || null,
        blacklistExpiryDate: data.temporaryUntil ? new Date(data.temporaryUntil) : null,
      },
    });

    await prisma.blacklistHistory.create({
      data: {
        agencyId: agency.id,
        reason: data.reason || "No reason provided",
        temporaryUntil: data.temporaryUntil ? new Date(data.temporaryUntil) : null,
        addedByAdminId: req.user!.userId,
        action: data.blacklistStatus === "none" ? "removed" : "added",
      },
    });

    await prisma.auditLog.create({
      data: {
        adminUserId: req.user!.userId,
        actionType: "update_blacklist",
        targetEntityId: agency.id,
        details: JSON.stringify(data),
      },
    });

    res.json(updated);
  })
);

// PUT /api/v1/admin/agencies/:id/verify-badge
router.put(
  "/agencies/:id/verify-badge",
  asyncHandler(async (req, res) => {
    const level = z
      .object({ verificationBadge: z.enum(["none", "basic", "premium"]) })
      .parse(req.body);
    const agency = await prisma.agency.findUnique({ where: { id: req.params.id } });
    if (!agency) throw new AppError("Agency not found", 404);

    const updated = await prisma.agency.update({
      where: { id: agency.id },
      data: {
        verificationBadge: level.verificationBadge,
        isVerified: level.verificationBadge !== "none",
      },
    });
    res.json(updated);
  })
);

export default router;
