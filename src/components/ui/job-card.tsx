import Link from 'next/link'
import type { Job } from '@/types/database'
import { Badge } from './badge'
import { MatchScore } from './match-score'

interface JobCardProps {
  job: Job & { company_name?: string }
  matchPercentage?: number
  matchLabel?: string
}

function formatEmploymentType(type: string): string {
  return type
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-')
}

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return 'Not specified'
  if (min && max) return `BDT ${min.toLocaleString()} - ${max.toLocaleString()}`
  if (min) return `BDT ${min.toLocaleString()}+`
  return `Up to BDT ${max!.toLocaleString()}`
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function JobCard({ job, matchPercentage, matchLabel }: JobCardProps) {
  return (
    <Link href={`/dashboard/jobseeker/jobs/${job.id}`} className="block">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-primary-200 transition-all">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {job.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {job.company_name || 'Company'}
            </p>
          </div>
          {matchPercentage !== undefined && (
            <MatchScore percentage={matchPercentage} label={matchLabel} size="sm" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3">
          {job.location && (
            <span className="inline-flex items-center text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </span>
          )}
          <Badge variant="default">{formatEmploymentType(job.employment_type)}</Badge>
          {job.job_category && (
            <span className="text-xs text-gray-500">{job.job_category.replace(/-/g, ' ')}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            {formatSalary(job.salary_min, job.salary_max)}
          </span>
          <span className="text-xs text-gray-400">
            {timeAgo(job.created_at)}
          </span>
        </div>

        {job.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.required_skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {skill}
              </span>
            ))}
            {job.required_skills.length > 5 && (
              <span className="text-xs text-gray-400">
                +{job.required_skills.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
