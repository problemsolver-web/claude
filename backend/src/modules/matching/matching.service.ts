import { ExperienceLevel, NotificationType } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { logger } from '../../config/logger';
import { ApiError } from '../../utils/ApiError';
import { createNotification } from '../notifications/notification.service';
import { JobInput, SeekerInput, scoreMatch } from './matching.engine';

const MIN_SCORE = 30; // don't persist weak matches
const TOP_N = 10;

function buildSeekerInput(seeker: any): SeekerInput {
  const topExperience: ExperienceLevel | null = seeker.experiences?.length
    ? seeker.experiences.length >= 3
      ? 'MID'
      : 'JUNIOR'
    : 'ENTRY';
  return {
    skills: seeker.skills.map((s: any) => s.skillName),
    experienceLevel: topExperience,
    location: seeker.location ?? null,
    preferredLocations: seeker.preferredLocations ?? [],
    profileText: [
      seeker.headline,
      seeker.bio,
      ...seeker.skills.map((s: any) => s.skillName),
      ...(seeker.resumes ?? []).map((r: any) => r.parsedText ?? ''),
      ...(seeker.projects ?? []).map((p: any) => `${p.title} ${p.description ?? ''} ${(p.technologies ?? []).join(' ')}`),
    ]
      .filter(Boolean)
      .join(' '),
  };
}

function buildJobInput(job: any): JobInput {
  return {
    title: job.title,
    description: job.description,
    skillsRequired: job.skillsRequired,
    experienceLevel: job.experienceLevel,
    location: job.location ?? null,
    isRemote: job.jobType === 'REMOTE',
  };
}

/**
 * Run the matching engine for a single job against all job seekers and persist
 * the top matches. Called automatically when a job is created/updated.
 */
export async function generateMatchesForJob(jobId: string): Promise<number> {
  const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
  if (!job) return 0;

  const seekers = await prisma.jobSeeker.findMany({
    include: { skills: true, experiences: true, resumes: true, projects: true },
  });

  const jobInput = buildJobInput(job);
  const scored = seekers
    .map((seeker) => ({ seeker, result: scoreMatch(jobInput, buildSeekerInput(seeker)) }))
    .filter((x) => x.result.score >= MIN_SCORE)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, TOP_N);

  await prisma.$transaction(
    scored.map((x) =>
      prisma.match.upsert({
        where: { jobPostingId_jobSeekerId: { jobPostingId: jobId, jobSeekerId: x.seeker.id } },
        create: {
          jobPostingId: jobId,
          jobSeekerId: x.seeker.id,
          matchScore: x.result.score,
          reason: x.result.reason as any,
        },
        update: { matchScore: x.result.score, reason: x.result.reason as any },
      }),
    ),
  );

  logger.info({ jobId, count: scored.length }, 'matches generated');
  return scored.length;
}

/** Top recommended candidates for a job (company view). */
export async function recommendedCandidates(companyUserId: string, jobId: string) {
  const job = await prisma.jobPosting.findUnique({ where: { id: jobId }, include: { company: true } });
  if (!job) throw ApiError.notFound('Job not found');
  if (job.company.userId !== companyUserId) throw ApiError.forbidden();

  // Generate on demand if none exist yet.
  const existing = await prisma.match.count({ where: { jobPostingId: jobId } });
  if (existing === 0) await generateMatchesForJob(jobId);

  return prisma.match.findMany({
    where: { jobPostingId: jobId },
    orderBy: { matchScore: 'desc' },
    take: TOP_N,
    include: {
      jobSeeker: {
        include: { user: { select: { name: true } }, skills: true },
      },
    },
  });
}

/** Recommended jobs for the logged-in job seeker. */
export async function recommendedJobs(userId: string) {
  const seeker = await prisma.jobSeeker.findUnique({
    where: { userId },
    include: { skills: true, experiences: true, resumes: true, projects: true },
  });
  if (!seeker) throw ApiError.forbidden('Only job seekers have recommendations');

  const jobs = await prisma.jobPosting.findMany({
    where: { status: 'ACTIVE' },
    include: { company: { select: { companyName: true, logo: true } } },
    take: 200,
  });

  const seekerInput = buildSeekerInput(seeker);
  return jobs
    .map((job) => ({ job, result: scoreMatch(buildJobInput(job), seekerInput) }))
    .filter((x) => x.result.score >= MIN_SCORE)
    .sort((a, b) => b.result.score - a.result.score)
    .slice(0, 20)
    .map((x) => ({ ...x.job, matchScore: x.result.score, matchReason: x.result.reason }));
}

/** Company invites a recommended candidate to apply. */
export async function inviteToApply(companyUserId: string, jobId: string, jobSeekerId: string) {
  const job = await prisma.jobPosting.findUnique({ where: { id: jobId }, include: { company: true } });
  if (!job) throw ApiError.notFound('Job not found');
  if (job.company.userId !== companyUserId) throw ApiError.forbidden();

  const seeker = await prisma.jobSeeker.findUnique({ where: { id: jobSeekerId }, select: { userId: true } });
  if (!seeker) throw ApiError.notFound('Candidate not found');

  await prisma.match.updateMany({
    where: { jobPostingId: jobId, jobSeekerId },
    data: { invited: true },
  });

  await createNotification({
    userId: seeker.userId,
    type: NotificationType.INVITE_TO_APPLY,
    title: 'You have an invitation to apply',
    message: `${job.company.companyName} thinks you'd be great for "${job.title}"`,
    relatedEntityId: jobId,
    relatedEntityType: 'job_posting',
  });

  return { message: 'Invitation sent' };
}
