import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './job.controller';
import { createJobSchema, extendSchema, statusSchema, updateJobSchema } from './job.validation';

export const jobRouter = Router();

// Public browse/search + single job (place specific routes before param routes)
jobRouter.get('/search', asyncHandler(ctrl.search));

// Company-owned management
jobRouter.get('/mine', authenticate, authorize('COMPANY'), asyncHandler(ctrl.listMine));
jobRouter.post('/', authenticate, authorize('COMPANY'), validate(createJobSchema), asyncHandler(ctrl.create));
jobRouter.patch('/:id', authenticate, authorize('COMPANY'), validate(updateJobSchema), asyncHandler(ctrl.update));
jobRouter.delete('/:id', authenticate, authorize('COMPANY'), asyncHandler(ctrl.remove));
jobRouter.patch('/:id/status', authenticate, authorize('COMPANY'), validate(statusSchema), asyncHandler(ctrl.changeStatus));
jobRouter.patch('/:id/extend', authenticate, authorize('COMPANY'), validate(extendSchema), asyncHandler(ctrl.extend));

// Public single job by id or slug (keep last)
jobRouter.get('/:idOrSlug', asyncHandler(ctrl.getOne));
