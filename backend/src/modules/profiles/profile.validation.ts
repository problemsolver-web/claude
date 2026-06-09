import { z } from 'zod';

const proficiency = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

export const updateJobSeekerSchema = z.object({
  body: z.object({
    headline: z.string().max(160).optional(),
    bio: z.string().max(2000).optional(),
    location: z.string().max(160).optional(),
    preferredLocations: z.array(z.string()).optional(),
    githubUrl: z.string().url().optional().or(z.literal('')),
    profilePicture: z.string().url().optional().or(z.literal('')),
    expectedSalaryMin: z.number().int().nonnegative().optional(),
    expectedSalaryMax: z.number().int().nonnegative().optional(),
  }),
});

export const skillSchema = z.object({
  body: z.object({ skillName: z.string().min(1).max(80), proficiencyLevel: proficiency.optional() }),
});

export const experienceSchema = z.object({
  body: z.object({
    company: z.string().min(1),
    position: z.string().min(1),
    description: z.string().max(2000).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    current: z.boolean().optional(),
  }),
});

export const educationSchema = z.object({
  body: z.object({
    university: z.string().min(1),
    degree: z.string().min(1),
    field: z.string().optional(),
    graduationYear: z.number().int().min(1950).max(2100).optional(),
  }),
});

export const certificationSchema = z.object({
  body: z.object({
    certificationName: z.string().min(1),
    issuer: z.string().optional(),
    date: z.coerce.date().optional(),
  }),
});

export const projectSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().max(2000).optional(),
    link: z.string().url().optional().or(z.literal('')),
    technologies: z.array(z.string()).optional(),
  }),
});

export const resumeSchema = z.object({
  body: z.object({
    fileUrl: z.string().url(),
    fileName: z.string().min(1),
    isPrimary: z.boolean().optional(),
    parsedText: z.string().optional(),
  }),
});

export const updateCompanySchema = z.object({
  body: z.object({
    companyName: z.string().min(2).max(160).optional(),
    logo: z.string().url().optional().or(z.literal('')),
    description: z.string().max(4000).optional(),
    website: z.string().url().optional().or(z.literal('')),
    location: z.string().max(160).optional(),
    industry: z.string().max(120).optional(),
    companySize: z.string().max(60).optional(),
  }),
});
