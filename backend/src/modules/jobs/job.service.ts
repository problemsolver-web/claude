import { JobStatus, Prisma } from '@prisma/client';
import slugify from 'slugify';
import { randomBytes } from 'crypto';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { generateMatchesForJob } from '../matching/matching.service';
import { logger } from '../../config/logger';

async function getCompany(userId: string) {
  const company = await prisma.company.findUnique({ where: { userId } });
  if (!company) throw ApiError.forbidden('Only companies can manage job postings');
  return company;
}

function makeSlug(title: string): string {
  return `${slugify(title, { lower: true, strict: true })}-${randomBytes(4).toString('hex')}`;
}

/** Fire-and-forget match generation so job creation stays fast. */
function triggerMatching(jobId: string) {
  generateMatchesForJob(jobId).catch((err) => logger.error({ err, jobId }, 'match generation failed'));
}

export async function createJob(userId: string, data: any) {
  const company = await getCompany(userId);
  const job = await prisma.jobPosting.create({
    data: {
      companyId: company.id,
      title: data.title,
      slug: makeSlug(data.title),
      description: data.description,
      skillsRequired: data.skillsRequired ?? [],
      experienceLevel: data.experienceLevel ?? 'ENTRY',
      salaryMin: data.salaryMin,
      salaryMax: data.salaryMax,
      location: data.location,
      jobType: data.jobType ?? 'ONSITE',
      category: data.category,
      benefits: data.benefits ?? [],
      deadline: data.deadline ? new Date(data.deadline) : null,
      status: data.status ?? 'ACTIVE',
    },
  });
  if (job.status === 'ACTIVE') triggerMatching(job.id);
  return job;
}

export async function updateJob(userId: string, id: string, data: any) {
  const company = await getCompany(userId);
  const existing = await prisma.jobPosting.findFirst({ where: { id, companyId: company.id } });
  if (!existing) throw ApiError.notFound('Job not found');

  const job = await prisma.jobPosting.update({
    where: { id },
    data: {
      ...data,
      deadline: data.deadline !== undefined ? (data.deadline ? new Date(data.deadline) : null) : undefined,
    },
  });
  if (job.status === 'ACTIVE') triggerMatching(job.id);
  return job;
}

export async function deleteJob(userId: string, id: string) {
  const company = await getCompany(userId);
  const existing = await prisma.jobPosting.findFirst({ where: { id, companyId: company.id } });
  if (!existing) throw ApiError.notFound('Job not found');
  await prisma.jobPosting.delete({ where: { id } });
  return { message: 'Job deleted' };
}

export async function changeStatus(userId: string, id: string, status: JobStatus) {
  return updateJob(userId, id, { status });
}

export async function extendDeadline(userId: string, id: string, deadline: string) {
  return updateJob(userId, id, { deadline, status: 'ACTIVE' });
}

/** Company's own postings with application counts + filters. */
export async function listMyJobs(userId: string, opts: { status?: JobStatus; search?: string; sort?: string; page: number; limit: number }) {
  const company = await getCompany(userId);
  const where: Prisma.JobPostingWhereInput = {
    companyId: company.id,
    ...(opts.status ? { status: opts.status } : {}),
    ...(opts.search ? { title: { contains: opts.search, mode: 'insensitive' } } : {}),
  };
  const orderBy: Prisma.JobPostingOrderByWithRelationInput =
    opts.sort === 'applications' ? { applications: { _count: 'desc' } } : { createdAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy,
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: { _count: { select: { applications: true } } },
    }),
    prisma.jobPosting.count({ where }),
  ]);
  return { items, total, page: opts.page, limit: opts.limit };
}

/** Public job search/browse with filters. */
export async function searchJobs(opts: {
  search?: string;
  location?: string;
  jobType?: string;
  category?: string;
  experienceLevel?: string;
  salaryMin?: number;
  skills?: string[];
  page: number;
  limit: number;
}) {
  const where: Prisma.JobPostingWhereInput = {
    status: 'ACTIVE',
    ...(opts.search
      ? { OR: [{ title: { contains: opts.search, mode: 'insensitive' } }, { description: { contains: opts.search, mode: 'insensitive' } }] }
      : {}),
    ...(opts.location ? { location: { contains: opts.location, mode: 'insensitive' } } : {}),
    ...(opts.jobType ? { jobType: opts.jobType as any } : {}),
    ...(opts.category ? { category: { contains: opts.category, mode: 'insensitive' } } : {}),
    ...(opts.experienceLevel ? { experienceLevel: opts.experienceLevel as any } : {}),
    ...(opts.salaryMin ? { salaryMax: { gte: opts.salaryMin } } : {}),
    ...(opts.skills?.length ? { skillsRequired: { hasSome: opts.skills } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.jobPosting.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: { company: { select: { companyName: true, logo: true, location: true } }, _count: { select: { applications: true } } },
    }),
    prisma.jobPosting.count({ where }),
  ]);
  return { items, total, page: opts.page, limit: opts.limit };
}

/** Public single job (by id or slug); increments views. */
export async function getJob(idOrSlug: string) {
  const job = await prisma.jobPosting.findFirst({
    where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
    include: { company: { select: { id: true, companyName: true, logo: true, location: true, website: true, industry: true, description: true } } },
  });
  if (!job) throw ApiError.notFound('Job not found');
  await prisma.jobPosting.update({ where: { id: job.id }, data: { viewsCount: { increment: 1 } } });
  return job;
}
