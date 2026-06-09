import { Request, Response } from 'express';
import * as service from './profile.service';

const ok = (res: Response, data: unknown, status = 200) => res.status(status).json({ success: true, data });

// Job seeker
export const getMyJobSeekerProfile = async (req: Request, res: Response) =>
  ok(res, await service.getJobSeekerProfile(req.user!.id));
export const updateMyJobSeekerProfile = async (req: Request, res: Response) =>
  ok(res, await service.updateJobSeekerProfile(req.user!.id, req.body));
export const getCompletion = async (req: Request, res: Response) =>
  ok(res, await service.profileCompletion(req.user!.id));

export const addSkill = async (req: Request, res: Response) => ok(res, await service.addSkill(req.user!.id, req.body), 201);
export const removeSkill = async (req: Request, res: Response) => ok(res, await service.removeSkill(req.user!.id, req.params.id));
export const addExperience = async (req: Request, res: Response) => ok(res, await service.addExperience(req.user!.id, req.body), 201);
export const removeExperience = async (req: Request, res: Response) => ok(res, await service.removeExperience(req.user!.id, req.params.id));
export const addEducation = async (req: Request, res: Response) => ok(res, await service.addEducation(req.user!.id, req.body), 201);
export const removeEducation = async (req: Request, res: Response) => ok(res, await service.removeEducation(req.user!.id, req.params.id));
export const addCertification = async (req: Request, res: Response) => ok(res, await service.addCertification(req.user!.id, req.body), 201);
export const removeCertification = async (req: Request, res: Response) => ok(res, await service.removeCertification(req.user!.id, req.params.id));
export const addProject = async (req: Request, res: Response) => ok(res, await service.addProject(req.user!.id, req.body), 201);
export const removeProject = async (req: Request, res: Response) => ok(res, await service.removeProject(req.user!.id, req.params.id));
export const addResume = async (req: Request, res: Response) => ok(res, await service.addResume(req.user!.id, req.body), 201);
export const removeResume = async (req: Request, res: Response) => ok(res, await service.removeResume(req.user!.id, req.params.id));

export const getPublicJobSeeker = async (req: Request, res: Response) =>
  ok(res, await service.getPublicJobSeeker(req.params.id));

// Company
export const getMyCompanyProfile = async (req: Request, res: Response) =>
  ok(res, await service.getCompanyProfile(req.user!.id));
export const updateMyCompanyProfile = async (req: Request, res: Response) =>
  ok(res, await service.updateCompanyProfile(req.user!.id, req.body));
