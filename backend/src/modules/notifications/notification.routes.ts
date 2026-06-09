import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import * as ctrl from './notification.controller';

export const notificationRouter = Router();

notificationRouter.use(authenticate);
notificationRouter.get('/', asyncHandler(ctrl.list));
notificationRouter.patch('/read-all', asyncHandler(ctrl.markAllRead));
notificationRouter.patch('/:id/read', asyncHandler(ctrl.markRead));
notificationRouter.delete('/:id', asyncHandler(ctrl.remove));
