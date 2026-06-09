import { ApplicationStatus } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { ApiError } from '../../utils/ApiError';

async function getCompanyId(userId: string) {
  const c = await prisma.company.findUnique({ where: { userId }, select: { id: true } });
  if (!c) throw ApiError.forbidden('Companies only');
  return c.id;
}

/** Company dashboard overview: quick stats + recent applications. */
export async function companyOverview(userId: string) {
  const companyId = await getCompanyId(userId);
  const jobIdsRows = await prisma.jobPosting.findMany({ where: { companyId }, select: { id: true } });
  const jobIds = jobIdsRows.map((j) => j.id);

  const [activeJobs, totalApplications, shortlisted, recentApplications, totalViews] = await Promise.all([
    prisma.jobPosting.count({ where: { companyId, status: 'ACTIVE' } }),
    prisma.application.count({ where: { jobPostingId: { in: jobIds } } }),
    prisma.application.count({ where: { jobPostingId: { in: jobIds }, status: 'SHORTLISTED' } }),
    prisma.application.findMany({
      where: { jobPostingId: { in: jobIds } },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: { jobPosting: { select: { title: true } }, jobSeeker: { include: { user: { select: { name: true } } } } },
    }),
    prisma.jobPosting.aggregate({ where: { companyId }, _sum: { viewsCount: true } }),
  ]);

  return {
    stats: {
      activeJobs,
      totalApplications,
      shortlisted,
      totalViews: totalViews._sum.viewsCount ?? 0,
    },
    recentApplications,
  };
}

/** Hiring funnel + per-job performance + candidate metrics. */
export async function companyAnalytics(userId: string) {
  const companyId = await getCompanyId(userId);
  const jobs = await prisma.jobPosting.findMany({
    where: { companyId },
    include: { _count: { select: { applications: true } } },
  });
  const jobIds = jobs.map((j) => j.id);

  const statusCounts = await prisma.application.groupBy({
    by: ['status'],
    where: { jobPostingId: { in: jobIds } },
    _count: true,
  });
  const byStatus = (s: ApplicationStatus) => statusCounts.find((c) => c.status === s)?._count ?? 0;

  const total = statusCounts.reduce((sum, c) => sum + c._count, 0);
  const reviewed = byStatus('REVIEWED') + byStatus('SHORTLISTED') + byStatus('ACCEPTED') + byStatus('REJECTED');
  const shortlisted = byStatus('SHORTLISTED') + byStatus('ACCEPTED');
  const accepted = byStatus('ACCEPTED');

  const funnel = [
    { stage: 'Applied', count: total },
    { stage: 'Reviewed', count: reviewed },
    { stage: 'Shortlisted', count: shortlisted },
    { stage: 'Accepted', count: accepted },
  ];

  const jobPerformance = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    views: j.viewsCount,
    applications: j._count.applications,
    conversionRate: j.viewsCount ? Math.round((j._count.applications / j.viewsCount) * 100) : 0,
  }));

  return { funnel, jobPerformance, totalApplications: total };
}

/** Job seeker dashboard overview. */
export async function jobSeekerOverview(userId: string) {
  const seeker = await prisma.jobSeeker.findUnique({ where: { userId }, select: { id: true } });
  if (!seeker) throw ApiError.forbidden('Job seekers only');

  const [total, byStatus, recent] = await Promise.all([
    prisma.application.count({ where: { jobSeekerId: seeker.id } }),
    prisma.application.groupBy({ by: ['status'], where: { jobSeekerId: seeker.id }, _count: true }),
    prisma.application.findMany({
      where: { jobSeekerId: seeker.id },
      orderBy: { appliedAt: 'desc' },
      take: 5,
      include: { jobPosting: { include: { company: { select: { companyName: true, logo: true } } } } },
    }),
  ]);

  const get = (s: ApplicationStatus) => byStatus.find((c) => c.status === s)?._count ?? 0;
  const interviews = get('SHORTLISTED') + get('ACCEPTED');

  return {
    stats: {
      totalApplications: total,
      shortlisted: get('SHORTLISTED'),
      accepted: get('ACCEPTED'),
      successRate: total ? Math.round((interviews / total) * 100) : 0,
    },
    recentApplications: recent,
  };
}
