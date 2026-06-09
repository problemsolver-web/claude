import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as service from './message.service';

export const messageRouter = Router();
messageRouter.use(authenticate);

const sendSchema = z.object({
  body: z.object({ recipientId: z.string().min(1), content: z.string().min(1).max(4000) }),
});

messageRouter.get(
  '/conversations',
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: await service.listConversations(req.user!.id) });
  }),
);

messageRouter.get(
  '/conversations/:otherUserId',
  asyncHandler(async (req, res) => {
    const data = await service.getConversation(
      req.user!.id,
      req.params.otherUserId,
      Number(req.query.page ?? 1),
      Number(req.query.limit ?? 50),
    );
    res.json({ success: true, data });
  }),
);

messageRouter.post(
  '/',
  validate(sendSchema),
  asyncHandler(async (req, res) => {
    const data = await service.sendMessage(req.user!.id, req.body.recipientId, req.body.content);
    res.status(201).json({ success: true, data });
  }),
);
