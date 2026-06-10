/**
 * Scoring functions for the deterministic AI matching engine.
 * Each function returns a score between 0 and 1.
 * All functions are pure - no side effects, no external calls.
 */

import {
  DEGREE_FIELD_CATEGORIES,
  DEGREE_LEVELS,
  EXPERIENCE_LEVELS,
  JOB_CATEGORY_DEGREE_MAP,
} from './constants'

/**
 * Normalize a string for comparison: lowercase, trim, remove extra spaces.
 */
function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Calculate degree relevance score (0 to 1).
 * Checks if the candidate's degree field is relevant to the job category.
 * B.Com graduates get very low scores for software engineering roles.
 */
export function scoreDegreeRelevance(
  candidateDegree: string | null,
  candidateDegreeField: string | null,
  jobCategory: string | null,
  jobDegreeRequirement: string | null
): number {
  // If job has no degree requirement and no category, give neutral score
  if (!jobCategory && !jobDegreeRequirement) {
    return 0.5
  }

  // If candidate has no degree info, low score
  if (!candidateDegreeField && !candidateDegree) {
    return 0.1
  }

  const normalizedField = candidateDegreeField ? normalize(candidateDegreeField) : ''
  const normalizedDegree = candidateDegree ? normalize(candidateDegree) : ''
  const normalizedCategory = jobCategory ? normalize(jobCategory) : ''

  // Check degree level requirement
  let degreeLevelScore = 1.0
  if (jobDegreeRequirement && candidateDegree) {
    const requiredLevel = DEGREE_LEVELS[normalize(jobDegreeRequirement)] || 0
    const candidateLevel = DEGREE_LEVELS[normalizedDegree] || 0
    if (candidateLevel >= requiredLevel) {
      degreeLevelScore = 1.0
    } else if (candidateLevel === requiredLevel - 1) {
      degreeLevelScore = 0.6
    } else {
      degreeLevelScore = 0.3
    }
  }

  // Check field relevance to job category
  let fieldRelevanceScore = 0.3 // default for unknown fields

  if (normalizedField && normalizedCategory) {
    const relevantCategories = JOB_CATEGORY_DEGREE_MAP[normalizedCategory] || ['general']

    // Check if candidate's field belongs to any relevant category
    let isRelevant = false
    for (const categoryGroup of relevantCategories) {
      const fieldsInGroup = DEGREE_FIELD_CATEGORIES[categoryGroup] || []
      if (fieldsInGroup.some(f => normalizedField.includes(f) || f.includes(normalizedField))) {
        isRelevant = true
        break
      }
    }

    if (isRelevant) {
      fieldRelevanceScore = 1.0
    } else {
      // Specifically penalize irrelevant degrees for technical roles
      // B.Com/Commerce for software engineering -> very low
      const isTechRole = normalizedCategory.includes('software') ||
        normalizedCategory.includes('web-development') ||
        normalizedCategory.includes('mobile-development') ||
        normalizedCategory.includes('data-science') ||
        normalizedCategory.includes('devops') ||
        normalizedCategory.includes('cybersecurity')

      const isBusinessDegree = normalizedField.includes('commerce') ||
        normalizedField.includes('accounting') ||
        normalizedField.includes('marketing') ||
        normalizedField.includes('business')

      if (isTechRole && isBusinessDegree) {
        fieldRelevanceScore = 0.1
      } else {
        fieldRelevanceScore = 0.3
      }
    }
  }

  return Math.min(1, degreeLevelScore * fieldRelevanceScore)
}

/**
 * Calculate skill overlap score (0 to 1).
 * Compares candidate skills against required and preferred skills.
 * Required skills have more weight than preferred skills.
 */
export function scoreSkillOverlap(
  candidateSkills: string[],
  requiredSkills: string[],
  preferredSkills: string[]
): number {
  if (requiredSkills.length === 0 && preferredSkills.length === 0) {
    return 0.5 // neutral if no skills specified
  }

  const normalizedCandidateSkills = candidateSkills.map(normalize)

  // Score required skills (weight: 70% of skill score)
  let requiredScore = 0
  if (requiredSkills.length > 0) {
    const normalizedRequired = requiredSkills.map(normalize)
    const matchedRequired = normalizedRequired.filter(reqSkill =>
      normalizedCandidateSkills.some(candSkill =>
        candSkill.includes(reqSkill) || reqSkill.includes(candSkill)
      )
    )
    requiredScore = matchedRequired.length / normalizedRequired.length
  } else {
    requiredScore = 0.5
  }

  // Score preferred skills (weight: 30% of skill score)
  let preferredScore = 0
  if (preferredSkills.length > 0) {
    const normalizedPreferred = preferredSkills.map(normalize)
    const matchedPreferred = normalizedPreferred.filter(prefSkill =>
      normalizedCandidateSkills.some(candSkill =>
        candSkill.includes(prefSkill) || prefSkill.includes(candSkill)
      )
    )
    preferredScore = matchedPreferred.length / normalizedPreferred.length
  } else {
    preferredScore = 0.5
  }

  return requiredScore * 0.7 + preferredScore * 0.3
}

/**
 * Calculate job category alignment score (0 to 1).
 * Checks if the job category matches candidate's preferred categories.
 */
export function scoreJobCategoryAlignment(
  candidatePreferredCategories: string[],
  jobCategory: string | null
): number {
  if (!jobCategory) {
    return 0.5 // neutral if job has no category
  }

  if (candidatePreferredCategories.length === 0) {
    return 0.5 // neutral if candidate has no preferences
  }

  const normalizedJobCategory = normalize(jobCategory)
  const normalizedPreferences = candidatePreferredCategories.map(normalize)

  // Direct match
  if (normalizedPreferences.includes(normalizedJobCategory)) {
    return 1.0
  }

  // Check if they are in similar groups
  const jobCategoryGroups = JOB_CATEGORY_DEGREE_MAP[normalizedJobCategory] || []

  for (const pref of normalizedPreferences) {
    const prefGroups = JOB_CATEGORY_DEGREE_MAP[pref] || []
    // Check if they share a common group
    const hasCommonGroup = jobCategoryGroups.some(g => prefGroups.includes(g))
    if (hasCommonGroup) {
      return 0.6
    }
  }

  return 0.2
}

/**
 * Calculate experience compatibility score (0 to 1).
 * Checks if candidate's experience matches the job requirements.
 */
export function scoreExperienceCompatibility(
  candidateExperienceYears: number | null,
  jobExperienceMin: number | null,
  jobExperienceMax: number | null
): number {
  const candidateExp = candidateExperienceYears ?? 0

  // If job has no experience requirements, give good score
  if (jobExperienceMin === null && jobExperienceMax === null) {
    return 0.8
  }

  const minExp = jobExperienceMin ?? 0
  const maxExp = jobExperienceMax ?? 100

  // Perfect fit: within range
  if (candidateExp >= minExp && candidateExp <= maxExp) {
    return 1.0
  }

  // Slightly under (within 1 year of min)
  if (candidateExp < minExp) {
    const gap = minExp - candidateExp
    if (gap <= 1) {
      return 0.7
    }
    if (gap <= 2) {
      return 0.4
    }
    return 0.1
  }

  // Over-qualified (above max)
  const overBy = candidateExp - maxExp
  if (overBy <= 2) {
    return 0.7
  }
  if (overBy <= 5) {
    return 0.5
  }
  return 0.3
}

/**
 * Calculate language match score (0 to 1).
 * Checks overlap between candidate's languages and common requirements.
 * In Bangladesh, Bengali and English are primary.
 */
export function scoreLanguageMatch(
  candidateLanguages: string[]
): number {
  if (candidateLanguages.length === 0) {
    return 0.3
  }

  const normalizedLanguages = candidateLanguages.map(normalize)

  let score = 0.3 // base score

  // English is highly valued in the job market
  if (normalizedLanguages.some(l => l.includes('english'))) {
    score += 0.4
  }

  // Bengali is expected for local roles
  if (normalizedLanguages.some(l => l.includes('bengali') || l.includes('bangla'))) {
    score += 0.2
  }

  // Additional languages are a bonus
  if (normalizedLanguages.length > 2) {
    score += 0.1
  }

  return Math.min(1, score)
}

/**
 * Determine if a role is senior-level based on experience requirements.
 */
export function isSeniorRole(
  jobExperienceMin: number | null,
  jobTitle: string
): boolean {
  const normalizedTitle = normalize(jobTitle)

  // Check title for senior indicators
  if (
    normalizedTitle.includes('senior') ||
    normalizedTitle.includes('lead') ||
    normalizedTitle.includes('principal') ||
    normalizedTitle.includes('staff') ||
    normalizedTitle.includes('architect') ||
    normalizedTitle.includes('director') ||
    normalizedTitle.includes('head of') ||
    normalizedTitle.includes('manager')
  ) {
    return true
  }

  // Check experience requirement
  if (jobExperienceMin !== null && jobExperienceMin >= EXPERIENCE_LEVELS.senior.min) {
    return true
  }

  return false
}

/**
 * Determine if a candidate is a fresh graduate (0-1 years experience).
 */
export function isFreshGraduate(experienceYears: number | null): boolean {
  const exp = experienceYears ?? 0
  return exp <= EXPERIENCE_LEVELS.entry.max
}
