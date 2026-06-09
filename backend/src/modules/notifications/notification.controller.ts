import { Request, Response } from 'express';
import * as service from './notification.service';

export async function list(req: Request, res: Response) {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const unreadOnly = req.query.unreadOnly === 'true';
  const data = await service.listNotifications(req.user!.id, { page, limit, unreadOnly });
  res.json({ success: true, data });
}

export async function markRead(req: Request, res: Response) {
  const data = await service.markRead(req.user!.id, req.params.id);
  res.json({ success: true, data });
}

export async function markAllRead(req: Request, res: Response) {
  const data = await service.markAllRead(req.user!.id);
  res.json({ success: true, data });
}

export async function remove(req: Request, res: Response) {
  const data = await service.remove(req.user!.id, req.params.id);
  res.json({ success: true, data });
}
