import { Request, Response } from 'express';
import * as service from './job.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });

export const create = async (req: Request, res: Response) => ok(res, await service.createJob(req.user!.id, req.body), 201);
export const update = async (req: Request, res: Response) => ok(res, await service.updateJob(req.user!.id, req.params.id, req.body));
export const remove = async (req: Request, res: Response) => ok(res, await service.deleteJob(req.user!.id, req.params.id));
export const changeStatus = async (req: Request, res: Response) => ok(res, await service.changeStatus(req.user!.id, req.params.id, req.body.status));
export const extend = async (req: Request, res: Response) => ok(res, await service.extendDeadline(req.user!.id, req.params.id, req.body.deadline));

export const listMine = async (req: Request, res: Response) => {
  const data = await service.listMyJobs(req.user!.id, {
    status: req.query.status as any,
    search: req.query.search as string | undefined,
    sort: req.query.sort as string | undefined,
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 20),
  });
  ok(res, data);
};

export const search = async (req: Request, res: Response) => {
  const skills = typeof req.query.skills === 'string' ? (req.query.skills as string).split(',').filter(Boolean) : undefined;
  const data = await service.searchJobs({
    search: req.query.search as string | undefined,
    location: req.query.location as string | undefined,
    jobType: req.query.jobType as string | undefined,
    category: req.query.category as string | undefined,
    experienceLevel: req.query.experienceLevel as string | undefined,
    salaryMin: req.query.salaryMin ? Number(req.query.salaryMin) : undefined,
    skills,
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 20),
  });
  ok(res, data);
};

export const getOne = async (req: Request, res: Response) => ok(res, await service.getJob(req.params.idOrSlug));
