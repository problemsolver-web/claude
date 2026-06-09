import { z } from 'zod';

const status = z.enum(['NEW', 'REVIEWED', 'SHORTLISTED', 'ACCEPTED', 'REJECTED']);

export const applySchema = z.object({
  body: z.object({
    jobPostingId: z.string().min(1),
    coverLetter: z.string().max(4000).optional(),
  }),
});

export const statusSchema = z.object({
  body: z.object({ status }),
});

export const bulkStatusSchema = z.object({
  body: z.object({ ids: z.array(z.string().min(1)).min(1), status }),
});
