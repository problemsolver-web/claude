import { ApplicationStatus, NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';
import { createNotification } from '../notifications/notification.service';
import { scoreMatch } from '../matching/matching.engine';

async function getJobSeeker(userId: string) {
  const js = await prisma.jobSeeker.findUnique({
    where: { userId },
    include: { skills: true, experiences: true, resumes: true, projects: true },
  });
  if (!js) throw ApiError.forbidden('Only job seekers can apply');
  return js;
}

async function getCompanyId(userId: string) {
  const c = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
  if (!c) throw ApiError.forbidden('Only companies can manage applications');
  return c.id;
}

/** Job seeker applies to a job. Computes match score + notifies the company. */
export async function apply(userId: string, jobPostingId: string, coverLetter?: string) {
  const seeker = await getJobSeeker(userId);
  const job = await prisma.jobPosting.findUnique({ where: { id: jobPostingId }, include: { company: true } });
  if (!job) throw ApiError.notFound('Job not found');
  if (job.status !== 'ACTIVE') throw ApiError.badRequest('This job is no longer accepting applications');

  const existing = await prisma.application.findUnique({
    where: { jobSeekerId_jobPostingId: { jobSeekerId: seeker.id, jobPostingId } },
  });
  if (existing) throw ApiError.conflict('You have already applied to this job');

  const { score } = scoreMatch(
    {
      title: job.title,
      description: job.description,
      skillsRequired: job.skillsRequired,
      experienceLevel: job.experienceLevel,
      location: job.location,
      isRemote: job.jobType === 'REMOTE',
    },
    {
      skills: seeker.skills.map((s) => s.skillName),
      experienceLevel: seeker.experiences.length >= 3 ? 'MID' : seeker.experiences.length ? 'JUNIOR' : 'ENTRY',
      location: seeker.location,
      preferredLocations: seeker.preferredLocations,
      profileText: [seeker.headline, seeker.bio, ...seeker.skills.map((s) => s.skillName)].filter(Boolean).join(' '),
    },
  );

  const application = await prisma.application.create({
    data: { jobSeekerId: seeker.id, jobPostingId, coverLetter, matchScore: score },
  });

  await createNotification({
    userId: job.company.userId,
    type: NotificationType.APPLICATION_RECEIVED,
    title: 'New application received',
    message: `New application for "${job.title}"`,
    relatedEntityId: application.id,
    relatedEntityType: 'application',
  });

  return application;
}

/** Job seeker's own applications. */
export async function listMyApplications(userId: string, opts: { status?: ApplicationStatus; page: number; limit: number }) {
  const seeker = await prisma.jobSeeker.findUnique({ where: { userId }, select: { id: true } });
  if (!seeker) throw ApiError.forbidden();
  const where: Prisma.ApplicationWhereInput = { jobSeekerId: seeker.id, ...(opts.status ? { status: opts.status } : {}) };
  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: { appliedAt: 'desc' },
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: { jobPosting: { include: { company: { select: { companyName: true, logo: true } } } } },
    }),
    prisma.application.count({ where }),
  ]);
  return { items, total, page: opts.page, limit: opts.limit };
}

/** Company view of applications, filterable by job/status, sortable by score. */
export async function listCompanyApplications(
  userId: string,
  opts: { jobId?: string; status?: ApplicationStatus; sort?: string; search?: string; page: number; limit: number },
) {
  const companyId = await getCompanyId(userId);
  const where: Prisma.ApplicationWhereInput = {
    jobPosting: { companyId },
    ...(opts.jobId ? { jobPostingId: opts.jobId } : {}),
    ...(opts.status ? { status: opts.status } : {}),
    ...(opts.search
      ? { jobSeeker: { user: { OR: [{ name: { contains: opts.search, mode: 'insensitive' } }, { email: { contains: opts.search, mode: 'insensitive' } }] } } }
      : {}),
  };
  const orderBy: Prisma.ApplicationOrderByWithRelationInput =
    opts.sort === 'score' ? { matchScore: 'desc' } : opts.sort === 'oldest' ? { appliedAt: 'asc' } : { appliedAt: 'desc' };

  const [items, total] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy,
      skip: (opts.page - 1) * opts.limit,
      take: opts.limit,
      include: {
        jobPosting: { select: { id: true, title: true } },
        jobSeeker: { include: { user: { select: { name: true } }, skills: true } },
      },
    }),
    prisma.application.count({ where }),
  ]);
  return { items, total, page: opts.page, limit: opts.limit };
}

/** Full application detail (company). */
export async function getApplicationDetail(userId: string, id: string) {
  const companyId = await getCompanyId(userId);
  const application = await prisma.application.findFirst({
    where: { id, jobPosting: { companyId } },
    include: {
      jobPosting: true,
      jobSeeker: {
        include: { user: { select: { name: true, email: true } }, skills: true, experiences: true, education: true, certifications: true, resumes: true, projects: true },
      },
    },
  });
  if (!application) throw ApiError.notFound('Application not found');
  return application;
}

const NEXT_STATUS_MESSAGE: Record<ApplicationStatus, string> = {
  NEW: 'Your application is now under review',
  REVIEWED: 'Your application has been reviewed',
  SHORTLISTED: "Great news — you've been shortlisted!",
  ACCEPTED: 'Congratulations! Your application was accepted',
  REJECTED: 'Thank you for applying. The company has decided to move forward with other candidates',
};

/** Company changes an application's status; notifies the job seeker. */
export async function updateStatus(userId: string, id: string, status: ApplicationStatus) {
  const companyId = await getCompanyId(userId);
  const application = await prisma.application.findFirst({
    where: { id, jobPosting: { companyId } },
    include: { jobPosting: { select: { title: true } }, jobSeeker: { select: { userId: true } } },
  });
  if (!application) throw ApiError.notFound('Application not found');

  const updated = await prisma.application.update({ where: { id }, data: { status } });

  await createNotification({
    userId: application.jobSeeker.userId,
    type: NotificationType.APPLICATION_STATUS_CHANGED,
    title: `Application update: ${application.jobPosting.title}`,
    message: NEXT_STATUS_MESSAGE[status],
    relatedEntityId: id,
    relatedEntityType: 'application',
  });

  return updated;
}

/** Bulk status change (company dashboard bulk action). */
export async function bulkUpdateStatus(userId: string, ids: string[], status: ApplicationStatus) {
  for (const id of ids) await updateStatus(userId, id, status);
  return { message: `${ids.length} application(s) updated`, status };
}
