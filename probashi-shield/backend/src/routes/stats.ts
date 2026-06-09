import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../middleware/error";

const router = Router();

// GET /api/v1/stats/public -> non-sensitive aggregate metrics for the public
// transparency / impact page. No authentication required.
router.get(
  "/public",
  asyncHandler(async (_req, res) => {
    const [
      totalAgencies,
      activeAgencies,
      blacklisted,
      totalReports,
      verifiedFraud,
      totalSearches,
      smsSearches,
    ] = await Promise.all([
      prisma.agency.count(),
      prisma.agency.count({ where: { licenseStatus: "active", blacklistStatus: "none" } }),
      prisma.agency.count({ where: { blacklistStatus: { not: "none" } } }),
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: "verified_fraud" } }),
      prisma.verificationLog.count(),
      prisma.verificationLog.count({ where: { channel: "sms" } }),
    ]);

    const lossAgg = await prisma.complaint.aggregate({
      where: { isVerified: true },
      _sum: { amountLost: true },
    });

    const byTypeRaw = await prisma.complaint.groupBy({
      by: ["complaintType"],
      _count: { complaintType: true },
    });
    const complaintsByType = byTypeRaw
      .map((r) => ({ type: r.complaintType, count: r._count.complaintType }))
      .sort((a, b) => b.count - a.count);

    res.json({
      agencies: { total: totalAgencies, active: activeAgencies, blacklisted },
      reports: { total: totalReports, verifiedFraud },
      searches: { total: totalSearches, viaSms: smsSearches },
      moneyLossReported: lossAgg._sum.amountLost || 0,
      complaintsByType,
    });
  })
);

export default router;
