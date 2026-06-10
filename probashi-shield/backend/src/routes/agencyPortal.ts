import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/error";
import { requireAuth, requireRole } from "../middleware/auth";
import { parseJsonArray } from "../utils/helpers";

const router = Router();

router.use(requireAuth, requireRole("agency"));

function getMyAgencyId(req: any): string {
  const id = req.user?.managedAgencyId;
  if (!id) throw new AppError("Your account is not linked to an agency yet", 403);
  return id;
}

// GET /api/v1/agency-portal/my-profile
router.get(
  "/my-profile",
  asyncHandler(async (req, res) => {
    const agencyId = getMyAgencyId(req);
    const agency = await prisma.agency.findUnique({ where: { id: agencyId } });
    if (!agency) throw new AppError("Agency not found", 404);

    const [total, complaints, searches] = await Promise.all([
      prisma.complaint.count({ where: { agencyId } }),
      prisma.complaint.findMany({ where: { agencyId }, orderBy: { createdAt: "desc" } }),
      prisma.verificationLog.count({ where: { agencyId } }),
    ]);

    res.json({
      agency: { ...agency, destinationCountries: parseJsonArray(agency.destinationCountries) },
      stats: { totalComplaints: total, timesSearched: searches },
      complaints,
    });
  })
);

const profileSchema = z.object({
  phonePrimary: z.string().optional(),
  phoneSecondary: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  websiteUrl: z.string().optional(),
  headOfficeLocation: z.string().optional(),
  destinationCountries: z.array(z.string()).optional(),
});

// PUT /api/v1/agency-portal/my-profile
router.put(
  "/my-profile",
  asyncHandler(async (req, res) => {
    const agencyId = getMyAgencyId(req);
    const data = profileSchema.parse(req.body);
    const updated = await prisma.agency.update({
      where: { id: agencyId },
      data: {
        phonePrimary: data.phonePrimary,
        phoneSecondary: data.phoneSecondary,
        email: data.email || null,
        websiteUrl: data.websiteUrl,
        headOfficeLocation: data.headOfficeLocation,
        destinationCountries: data.destinationCountries
          ? JSON.stringify(data.destinationCountries)
          : undefined,
      },
    });
    res.json({ ...updated, destinationCountries: parseJsonArray(updated.destinationCountries) });
  })
);

// POST /api/v1/agency-portal/complaints/:id/respond
router.post(
  "/complaints/:id/respond",
  asyncHandler(async (req, res) => {
    const agencyId = getMyAgencyId(req);
    const { response } = z.object({ response: z.string().min(2) }).parse(req.body);

    const complaint = await prisma.complaint.findUnique({ where: { id: req.params.id } });
    if (!complaint || complaint.agencyId !== agencyId) {
      throw new AppError("Complaint not found for your agency", 404);
    }

    const stamped = `[Agency response ${new Date().toISOString().slice(0, 10)}]: ${response}`;
    const updated = await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        adminNotes: complaint.adminNotes ? `${complaint.adminNotes}\n${stamped}` : stamped,
      },
    });
    res.json({ message: "Response recorded", complaint: updated });
  })
);

export default router;
