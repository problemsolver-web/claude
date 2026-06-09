import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import * as service from './analytics.service';

export const analyticsRouter = Router();
analyticsRouter.use(authenticate);

analyticsRouter.get(
  '/company/overview',
  authorize('COMPANY'),
  asyncHandler(async (req, res) => res.json({ success: true, data: await service.companyOverview(req.user!.id) })),
);

analyticsRouter.get(
  '/company/insights',
  authorize('COMPANY'),
  asyncHandler(async (req, res) => res.json({ success: true, data: await service.companyAnalytics(req.user!.id) })),
);

analyticsRouter.get(
  '/job-seeker/overview',
  authorize('JOB_SEEKER'),
  asyncHandler(async (req, res) => res.json({ success: true, data: await service.jobSeekerOverview(req.user!.id) })),
);
