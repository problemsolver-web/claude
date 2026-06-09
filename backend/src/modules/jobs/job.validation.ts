import { z } from 'zod';

const experienceLevel = z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']);
const jobType = z.enum(['REMOTE', 'ONSITE', 'HYBRID']);
const jobStatus = z.enum(['ACTIVE', 'CLOSED', 'EXPIRED', 'DRAFT']);

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(160),
    description: z.string().min(10),
    skillsRequired: z.array(z.string()).default([]),
    experienceLevel: experienceLevel.optional(),
    salaryMin: z.number().int().nonnegative().optional(),
    salaryMax: z.number().int().nonnegative().optional(),
    location: z.string().max(160).optional(),
    jobType: jobType.optional(),
    category: z.string().max(120).optional(),
    benefits: z.array(z.string()).optional(),
    deadline: z.string().datetime().optional(),
    status: jobStatus.optional(),
  }),
});

export const updateJobSchema = z.object({
  body: createJobSchema.shape.body.partial(),
});

export const statusSchema = z.object({
  body: z.object({ status: jobStatus }),
});

export const extendSchema = z.object({
  body: z.object({ deadline: z.string().datetime() }),
});
