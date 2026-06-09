import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './application.controller';
import { applySchema, bulkStatusSchema, statusSchema } from './application.validation';

export const applicationRouter = Router();
applicationRouter.use(authenticate);

// Job seeker
applicationRouter.post('/', authorize('JOB_SEEKER'), validate(applySchema), asyncHandler(ctrl.apply));
applicationRouter.get('/mine', authorize('JOB_SEEKER'), asyncHandler(ctrl.listMine));

// Company
applicationRouter.get('/company', authorize('COMPANY'), asyncHandler(ctrl.listForCompany));
applicationRouter.patch('/bulk-status', authorize('COMPANY'), validate(bulkStatusSchema), asyncHandler(ctrl.bulkUpdate));
applicationRouter.get('/:id', authorize('COMPANY'), asyncHandler(ctrl.detail));
applicationRouter.patch('/:id/status', authorize('COMPANY'), validate(statusSchema), asyncHandler(ctrl.updateStatus));
