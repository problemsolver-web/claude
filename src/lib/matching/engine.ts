/**
 * Deterministic AI Matching Engine.
 * Computes a match score between a job seeker profile and a job listing.
 *
 * Key properties:
 * - Completely deterministic: same inputs always produce same output
 * - No external API calls
 * - Pure TypeScript computation with weighted scoring
 * - Fresh graduates (0-1 years) capped at 20% for senior roles
 *
 * Scoring weights:
 * - degree_relevance: 30%
 * - skill_overlap: 30%
 * - job_category_alignment: 20%
 * - experience_compatibility: 15%
 * - language_match: 5%
 */

import type { Job, User } from '@/types/database'
import { FRESH_GRAD_SENIOR_CAP, SCORING_WEIGHTS } from './constants'
import {
  isFreshGraduate,
  isSeniorRole,
  scoreDegreeRelevance,
  scoreExperienceCompatibility,
  scoreJobCategoryAlignment,
  scoreLanguageMatch,
  scoreSkillOverlap,
} from './scoring'

export interface ScoreBreakdown {
  degree_relevance: number
  skill_overlap: number
  job_category_alignment: number
  experience_compatibility: number
  language_match: number
  total: number
  capped: boolean
  cap_reason?: string
}

export interface MatchResult {
  score: number
  percentage: number
  breakdown: ScoreBreakdown
  label: string
}

/**
 * Get a human-readable label for the match score.
 */
function getMatchLabel(percentage: number): string {
  if (percentage >= 85) return 'Excellent Match'
  if (percentage >= 70) return 'Strong Match'
  if (percentage >= 55) return 'Good Match'
  if (percentage >= 40) return 'Fair Match'
  if (percentage >= 25) return 'Weak Match'
  return 'Poor Match'
}

/**
 * Calculate the match score between a user profile and a job listing.
 * Returns a deterministic score between 0 and 100.
 */
export function calculateMatchScore(user: User, job: Job): MatchResult {
  // Calculate individual component scores (each 0 to 1)
  const degreeRelevance = scoreDegreeRelevance(
    user.degree,
    user.degree_field,
    job.job_category,
    job.degree_requirement
  )

  const skillOverlap = scoreSkillOverlap(
    user.skills,
    job.required_skills,
    job.preferred_skills
  )

  const jobCategoryAlignment = scoreJobCategoryAlignment(
    user.preferred_job_categories,
    job.job_category
  )

  const experienceCompatibility = scoreExperienceCompatibility(
    user.experience_years,
    job.experience_min,
    job.experience_max
  )

  const languageMatch = scoreLanguageMatch(user.languages)

  // Calculate weighted total (0 to 1)
  let total =
    degreeRelevance * SCORING_WEIGHTS.degree_relevance +
    skillOverlap * SCORING_WEIGHTS.skill_overlap +
    jobCategoryAlignment * SCORING_WEIGHTS.job_category_alignment +
    experienceCompatibility * SCORING_WEIGHTS.experience_compatibility +
    languageMatch * SCORING_WEIGHTS.language_match

  // Apply cap for fresh graduates on senior roles
  let capped = false
  let capReason: string | undefined

  if (isFreshGraduate(user.experience_years) && isSeniorRole(job.experience_min, job.title)) {
    if (total > FRESH_GRAD_SENIOR_CAP) {
      total = FRESH_GRAD_SENIOR_CAP
      capped = true
      capReason = 'Fresh graduate applying to senior-level role'
    }
  }

  // Convert to percentage (0 to 100), round to integer for consistency
  const percentage = Math.round(total * 100)

  return {
    score: total,
    percentage,
    breakdown: {
      degree_relevance: Math.round(degreeRelevance * 100) / 100,
      skill_overlap: Math.round(skillOverlap * 100) / 100,
      job_category_alignment: Math.round(jobCategoryAlignment * 100) / 100,
      experience_compatibility: Math.round(experienceCompatibility * 100) / 100,
      language_match: Math.round(languageMatch * 100) / 100,
      total: Math.round(total * 100) / 100,
      capped,
      cap_reason: capReason,
    },
    label: getMatchLabel(percentage),
  }
}

/**
 * Calculate match scores for a user against multiple jobs.
 * Returns jobs sorted by match score (highest first).
 */
export function calculateMatchScores(
  user: User,
  jobs: Job[]
): Array<{ job: Job; match: MatchResult }> {
  return jobs
    .map(job => ({
      job,
      match: calculateMatchScore(user, job),
    }))
    .sort((a, b) => b.match.percentage - a.match.percentage)
}
