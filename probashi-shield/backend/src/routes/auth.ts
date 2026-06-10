import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { asyncHandler, AppError } from "../middleware/error";
import { signToken } from "../utils/helpers";
import { requireAuth } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().optional(),
  userType: z.enum(["agency", "public"]).default("public"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/v1/auth/register
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError("An account with this email already exists", 409);

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        userType: data.userType,
      },
    });

    const token = signToken({
      userId: user.id,
      userType: user.userType,
      managedAgencyId: user.managedAgencyId,
    });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, userType: user.userType },
    });
  })
);

// POST /api/v1/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError("Invalid email or password", 401);

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) throw new AppError("Invalid email or password", 401);

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = signToken({
      userId: user.id,
      userType: user.userType,
      managedAgencyId: user.managedAgencyId,
    });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        managedAgencyId: user.managedAgencyId,
      },
    });
  })
);

// GET /api/v1/auth/me
router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new AppError("User not found", 404);
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      managedAgencyId: user.managedAgencyId,
    });
  })
);

export default router;
