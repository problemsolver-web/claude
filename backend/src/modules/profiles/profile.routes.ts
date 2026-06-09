import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from './profile.controller';
import {
  certificationSchema,
  educationSchema,
  experienceSchema,
  projectSchema,
  resumeSchema,
  skillSchema,
  updateCompanySchema,
  updateJobSeekerSchema,
} from './profile.validation';

export const profileRouter = Router();

// ----- Job seeker self-service -----
const js = Router();
js.use(authenticate, authorize('JOB_SEEKER'));
js.get('/', asyncHandler(ctrl.getMyJobSeekerProfile));
js.patch('/', validate(updateJobSeekerSchema), asyncHandler(ctrl.updateMyJobSeekerProfile));
js.get('/completion', asyncHandler(ctrl.getCompletion));
js.post('/skills', validate(skillSchema), asyncHandler(ctrl.addSkill));
js.delete('/skills/:id', asyncHandler(ctrl.removeSkill));
js.post('/experiences', validate(experienceSchema), asyncHandler(ctrl.addExperience));
js.delete('/experiences/:id', asyncHandler(ctrl.removeExperience));
js.post('/education', validate(educationSchema), asyncHandler(ctrl.addEducation));
js.delete('/education/:id', asyncHandler(ctrl.removeEducation));
js.post('/certifications', validate(certificationSchema), asyncHandler(ctrl.addCertification));
js.delete('/certifications/:id', asyncHandler(ctrl.removeCertification));
js.post('/projects', validate(projectSchema), asyncHandler(ctrl.addProject));
js.delete('/projects/:id', asyncHandler(ctrl.removeProject));
js.post('/resumes', validate(resumeSchema), asyncHandler(ctrl.addResume));
js.delete('/resumes/:id', asyncHandler(ctrl.removeResume));
profileRouter.use('/job-seeker', js);

// ----- Company self-service -----
const company = Router();
company.use(authenticate, authorize('COMPANY'));
company.get('/', asyncHandler(ctrl.getMyCompanyProfile));
company.patch('/', validate(updateCompanySchema), asyncHandler(ctrl.updateMyCompanyProfile));
profileRouter.use('/company', company);

// ----- Public candidate view (companies viewing candidates) -----
profileRouter.get('/candidates/:id', authenticate, authorize('COMPANY'), asyncHandler(ctrl.getPublicJobSeeker));
