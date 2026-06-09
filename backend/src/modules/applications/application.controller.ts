import { Request, Response } from 'express';
import * as service from './application.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });

export const apply = async (req: Request, res: Response) =>
  ok(res, await service.apply(req.user!.id, req.body.jobPostingId, req.body.coverLetter), 201);

export const listMine = async (req: Request, res: Response) =>
  ok(res, await service.listMyApplications(req.user!.id, {
    status: req.query.status as any,
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 20),
  }));

export const listForCompany = async (req: Request, res: Response) =>
  ok(res, await service.listCompanyApplications(req.user!.id, {
    jobId: req.query.jobId as string | undefined,
    status: req.query.status as any,
    sort: req.query.sort as string | undefined,
    search: req.query.search as string | undefined,
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 20),
  }));

export const detail = async (req: Request, res: Response) =>
  ok(res, await service.getApplicationDetail(req.user!.id, req.params.id));

export const updateStatus = async (req: Request, res: Response) =>
  ok(res, await service.updateStatus(req.user!.id, req.params.id, req.body.status));

export const bulkUpdate = async (req: Request, res: Response) =>
  ok(res, await service.bulkUpdateStatus(req.user!.id, req.body.ids, req.body.status));
