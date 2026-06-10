import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/error";
import { generateTrackingNumber } from "../utils/helpers";
import { optionalAuth, requireAuth } from "../middleware/auth";

const router = Router();

const complaintSchema = z.object({
  agencyId: z.string().uuid().optional(),
  // If reporting an unlicensed agency not in DB, the user can give a free-text name
  agencyName: z.string().min(2).optional(),
  reporterName: z.string().optional(),
  reporterPhone: z.string().optional(),
  reporterEmail: z.string().email().optional().or(z.literal("")),
  reporterLocation: z.string().optional(),
  complaintType: z.enum([
    "money_fraud",
    "job_mismatch",
    "visa_false",
    "salary_wrong",
    "missing_contact",
    "other",
  ]),
  description: z.string().min(10, "Please describe what happened (at least 10 characters)"),
  amountLost: z.number().nonnegative().optional(),
  incidentDate: z.string().optional(),
  proofDocuments: z.array(z.string()).optional(),
});

// POST /api/v1/complaints  -> submit a fraud report (public, optional auth)
router.post(
  "/",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const data = complaintSchema.parse(req.body);

    let agencyId = data.agencyId;

    // If no agencyId but a name was provided, find or create a placeholder
    // "unlicensed/unverified" agency record so the report attaches to something.
    if (!agencyId && data.agencyName) {
      const existing = await prisma.agency.findFirst({
        where: { agencyName: { contains: data.agencyName } },
      });
      if (existing) {
        agencyId = existing.id;
      } else {
        const placeholder = await prisma.agency.create({
          data: {
            bmetLicenseNumber: `UNREGISTERED-${Date.now()}`,
            agencyName: data.agencyName,
            phonePrimary: data.reporterPhone || "unknown",
            licenseStatus: "revoked", // unknown/unlicensed -> treat as not safe
            headOfficeLocation: data.reporterLocation || null,
          },
        });
        agencyId = placeholder.id;
      }
    }

    if (!agencyId) {
      throw new AppError("Either agencyId or agencyName is required", 400);
    }

    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency) throw new AppError("Agency not found", 404);

    // crude severity heuristic based on reported loss
    let severity = "medium";
    if (data.amountLost && data.amountLost >= 300000) severity = "critical";
    else if (data.amountLost && data.amountLost >= 100000) severity = "high";
    else if (data.complaintType === "money_fraud") severity = "high";

    const trackingNumber = generateTrackingNumber();

    const complaint = await prisma.complaint.create({
      data: {
        agencyId,
        userId: req.user?.userId ?? null,
        reporterName: data.reporterName || null,
        reporterPhone: data.reporterPhone || null,
        reporterEmail: data.reporterEmail || null,
        reporterLocation: data.reporterLocation || null,
        complaintType: data.complaintType,
        description: data.description,
        amountLost: data.amountLost ?? null,
        proofDocuments: data.proofDocuments ? JSON.stringify(data.proofDocuments) : null,
        incidentDate: data.incidentDate ? new Date(data.incidentDate) : null,
        severityLevel: severity,
        status: "submitted",
        trackingNumber,
      },
    });

    res.status(201).json({
      message: "Report submitted. Keep your tracking number to check status.",
      trackingNumber: complaint.trackingNumber,
      complaintId: complaint.id,
      status: complaint.status,
    });
  })
);

// GET /api/v1/complaints/mine -> reports filed by the logged-in user
router.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const complaints = await prisma.complaint.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      include: { agency: { select: { id: true, agencyName: true } } },
    });
    res.json({ count: complaints.length, complaints });
  })
);

// GET /api/v1/complaints/track/:trackingNumber -> public status check
router.get(
  "/track/:trackingNumber",
  asyncHandler(async (req, res) => {
    const complaint = await prisma.complaint.findUnique({
      where: { trackingNumber: req.params.trackingNumber },
      include: { agency: { select: { agencyName: true } } },
    });
    if (!complaint) throw new AppError("No report found with that tracking number", 404);

    res.json({
      trackingNumber: complaint.trackingNumber,
      agencyName: complaint.agency.agencyName,
      complaintType: complaint.complaintType,
      status: complaint.status,
      severityLevel: complaint.severityLevel,
      isVerified: complaint.isVerified,
      submittedAt: complaint.createdAt,
      lastUpdated: complaint.updatedAt,
      resolutionDate: complaint.resolutionDate,
    });
  })
);

export default router;
