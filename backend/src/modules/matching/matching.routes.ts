import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import * as service from './matching.service';

export const matchingRouter = Router();
matchingRouter.use(authenticate);

// Job seeker: recommended jobs
matchingRouter.get(
  '/recommended-jobs',
  authorize('JOB_SEEKER'),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.recommendedJobs(req.user!.id) });
  }),
);

// Company: recommended candidates for a job
matchingRouter.get(
  '/jobs/:jobId/candidates',
  authorize('COMPANY'),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.recommendedCandidates(req.user!.id, req.params.jobId) });
  }),
);

// Company: invite candidate to apply
matchingRouter.post(
  '/jobs/:jobId/invite/:jobSeekerId',
  authorize('COMPANY'),
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.inviteToApply(req.user!.id, req.params.jobId, req.params.jobSeekerId) });
  }),
);
