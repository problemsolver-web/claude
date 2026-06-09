import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/error";
import { parseJsonArray } from "../utils/helpers";

const router = Router();

// GET /api/v1/destinations -> list all destination country guides
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const countries = await prisma.destinationCountry.findMany({
      orderBy: { countryName: "asc" },
    });
    res.json({
      count: countries.length,
      destinations: countries.map((c) => ({
        ...c,
        commonJobTypes: parseJsonArray(c.commonJobTypes),
      })),
    });
  })
);

// GET /api/v1/destinations/:countryName
router.get(
  "/:countryName",
  asyncHandler(async (req, res) => {
    const country = await prisma.destinationCountry.findFirst({
      where: { countryName: { equals: req.params.countryName } },
    });
    if (!country) throw new AppError("Destination country not found", 404);
    res.json({ ...country, commonJobTypes: parseJsonArray(country.commonJobTypes) });
  })
);

export default router;
