import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

/** Resolve the JobSeeker row for a user, or throw. */
async function getJobSeekerId(userId: string): Promise<string> {
  const js = await prisma.jobSeeker.findUnique({ where: { userId }, select: { id: true } });
  if (!js) throw ApiError.forbidden('Only job seekers can perform this action');
  return js.id;
}

async function getCompanyId(userId: string): Promise<string> {
  const c = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
  if (!c) throw ApiError.forbidden('Only companies can perform this action');
  return c.id;
}

// ----- Job seeker profile -----

export async function getJobSeekerProfile(userId: string) {
  const profile = await prisma.jobSeeker.findUnique({
    where: { userId },
    include: {
      skills: true,
      experiences: { orderBy: { startDate: 'desc' } },
      education: true,
      certifications: true,
      resumes: true,
      projects: true,
      user: { select: { name: true, email: true } },
    },
  });
  if (!profile) throw ApiError.notFound('Job seeker profile not found');
  return profile;
}

export async function updateJobSeekerProfile(userId: string, data: Prisma.JobSeekerUpdateInput) {
  await getJobSeekerId(userId);
  return prisma.jobSeeker.update({ where: { userId }, data });
}

// ----- Skills / education / experience / certifications / projects -----

export async function addSkill(userId: string, data: { skillName: string; proficiencyLevel?: any }) {
  const jobSeekerId = await getJobSeekerId(userId);
  return prisma.skill.create({ data: { jobSeekerId, skillName: data.skillName, proficiencyLevel: data.proficiencyLevel } });
}

export async function removeSkill(userId: string, id: string) {
  const jobSeekerId = await getJobSeekerId(userId);
  await prisma.skill.deleteMany({ where: { id, jobSeekerId } });
  return { message: 'Skill removed' };
}

export async function addExperience(userId: string, data: any) {
  const jobSeekerId = await getJobSeekerId(userId);
  return prisma.experience.create({ data: { ...data, jobSeekerId } });
}

export async function removeExperience(userId: string, id: string) {
  const jobSeekerId = await getJobSeekerId(userId);
  await prisma.experience.deleteMany({ where: { id, jobSeekerId } });
  return { message: 'Experience removed' };
}

export async function addEducation(userId: string, data: any) {
  const jobSeekerId = await getJobSeekerId(userId);
  return prisma.education.create({ data: { ...data, jobSeekerId } });
}

export async function removeEducation(userId: string, id: string) {
  const jobSeekerId = await getJobSeekerId(userId);
  await prisma.education.deleteMany({ where: { id, jobSeekerId } });
  return { message: 'Education removed' };
}

export async function addCertification(userId: string, data: any) {
  const jobSeekerId = await getJobSeekerId(userId);
  return prisma.certification.create({ data: { ...data, jobSeekerId } });
}

export async function removeCertification(userId: string, id: string) {
  const jobSeekerId = await getJobSeekerId(userId);
  await prisma.certification.deleteMany({ where: { id, jobSeekerId } });
  return { message: 'Certification removed' };
}

export async function addProject(userId: string, data: any) {
  const jobSeekerId = await getJobSeekerId(userId);
  return prisma.portfolioProject.create({ data: { ...data, jobSeekerId } });
}

export async function removeProject(userId: string, id: string) {
  const jobSeekerId = await getJobSeekerId(userId);
  await prisma.portfolioProject.deleteMany({ where: { id, jobSeekerId } });
  return { message: 'Project removed' };
}

/**
 * Register an uploaded resume. File storage (S3/Cloudinary) is out of scope for
 * now; the client uploads elsewhere and posts the resulting URL here.
 */
export async function addResume(userId: string, data: { fileUrl: string; fileName: string; isPrimary?: boolean; parsedText?: string }) {
  const jobSeekerId = await getJobSeekerId(userId);
  if (data.isPrimary) {
    await prisma.resume.updateMany({ where: { jobSeekerId }, data: { isPrimary: false } });
  }
  return prisma.resume.create({ data: { ...data, jobSeekerId } });
}

export async function removeResume(userId: string, id: string) {
  const jobSeekerId = await getJobSeekerId(userId);
  await prisma.resume.deleteMany({ where: { id, jobSeekerId } });
  return { message: 'Resume removed' };
}

/** Profile completion percentage — drives the job seeker dashboard widget. */
export async function profileCompletion(userId: string) {
  const p = await getJobSeekerProfile(userId);
  const checks = [
    Boolean(p.bio),
    Boolean(p.headline),
    Boolean(p.location),
    p.skills.length > 0,
    p.education.length > 0,
    p.experiences.length > 0,
    p.resumes.length > 0,
    p.projects.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  return { completion: Math.round((completed / checks.length) * 100) };
}

// ----- Company profile -----

export async function getCompanyProfile(userId: string) {
  const company = await prisma.company.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } }, _count: { select: { jobPostings: true } } },
  });
  if (!company) throw ApiError.notFound('Company profile not found');
  return company;
}

export async function updateCompanyProfile(userId: string, data: Prisma.CompanyUpdateInput) {
  await getCompanyId(userId);
  return prisma.company.update({ where: { userId }, data });
}

/** Public job-seeker profile view (used by companies viewing candidates). */
export async function getPublicJobSeeker(jobSeekerId: string) {
  const profile = await prisma.jobSeeker.findUnique({
    where: { id: jobSeekerId },
    include: {
      skills: true,
      experiences: { orderBy: { startDate: 'desc' } },
      education: true,
      certifications: true,
      resumes: { select: { id: true, fileUrl: true, fileName: true, isPrimary: true } },
      projects: true,
      user: { select: { name: true } },
    },
  });
  if (!profile) throw ApiError.notFound('Candidate not found');
  return profile;
}
