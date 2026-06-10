/**
 * Constants for the deterministic AI matching engine.
 * Scoring weights must sum to 1.0 (100%).
 */

export const SCORING_WEIGHTS = {
  degree_relevance: 0.30,
  skill_overlap: 0.30,
  job_category_alignment: 0.20,
  experience_compatibility: 0.15,
  language_match: 0.05,
} as const

/**
 * Experience level thresholds used for seniority classification.
 */
export const EXPERIENCE_LEVELS = {
  entry: { min: 0, max: 1 },
  junior: { min: 1, max: 3 },
  mid: { min: 3, max: 5 },
  senior: { min: 5, max: 100 },
} as const

/**
 * Maximum match score for fresh graduates applying to senior roles.
 * Fresh graduates (0-1 years experience) cannot exceed 20% on senior-level roles.
 */
export const FRESH_GRAD_SENIOR_CAP = 0.20

/**
 * Degree fields grouped by relevance to job categories.
 * Used to determine degree_relevance scoring.
 */
export const DEGREE_FIELD_CATEGORIES: Record<string, string[]> = {
  technology: [
    'computer science',
    'software engineering',
    'information technology',
    'computer engineering',
    'data science',
    'artificial intelligence',
    'cybersecurity',
    'information systems',
    'electrical engineering',
    'electronics',
  ],
  business: [
    'business administration',
    'management',
    'marketing',
    'finance',
    'accounting',
    'economics',
    'commerce',
    'international business',
    'human resource management',
    'supply chain management',
  ],
  engineering: [
    'mechanical engineering',
    'civil engineering',
    'chemical engineering',
    'industrial engineering',
    'electrical engineering',
    'electronics',
    'biomedical engineering',
  ],
  healthcare: [
    'medicine',
    'pharmacy',
    'nursing',
    'public health',
    'dentistry',
    'physiotherapy',
    'biomedical science',
  ],
  creative: [
    'graphic design',
    'fine arts',
    'multimedia',
    'animation',
    'film studies',
    'architecture',
    'interior design',
  ],
  education: [
    'education',
    'teaching',
    'english literature',
    'linguistics',
    'bengali literature',
  ],
}

/**
 * Job category to relevant degree field category mapping.
 */
export const JOB_CATEGORY_DEGREE_MAP: Record<string, string[]> = {
  'software-engineering': ['technology'],
  'web-development': ['technology'],
  'mobile-development': ['technology'],
  'data-science': ['technology'],
  'cybersecurity': ['technology'],
  'it-support': ['technology'],
  'devops': ['technology'],
  'ui-ux-design': ['technology', 'creative'],
  'project-management': ['technology', 'business'],
  'digital-marketing': ['business', 'creative'],
  'marketing': ['business'],
  'sales': ['business'],
  'finance': ['business'],
  'accounting': ['business'],
  'human-resources': ['business'],
  'operations': ['business', 'engineering'],
  'engineering': ['engineering'],
  'healthcare': ['healthcare'],
  'education': ['education'],
  'graphic-design': ['creative'],
  'content-writing': ['education', 'creative'],
  'customer-service': ['business'],
  'administrative': ['business'],
  'general': ['technology', 'business', 'engineering', 'healthcare', 'creative', 'education'],
}

/**
 * Degree levels ranked by advancement (higher = more advanced).
 */
export const DEGREE_LEVELS: Record<string, number> = {
  'ssc': 1,
  'hsc': 2,
  'diploma': 3,
  'bachelors': 4,
  'masters': 5,
  'phd': 6,
}

/**
 * Common job categories for the marketplace.
 */
export const JOB_CATEGORIES = [
  { value: 'software-engineering', label: 'Software Engineering' },
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'it-support', label: 'IT Support' },
  { value: 'devops', label: 'DevOps' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'project-management', label: 'Project Management' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'human-resources', label: 'Human Resources' },
  { value: 'operations', label: 'Operations' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'education', label: 'Education' },
  { value: 'graphic-design', label: 'Graphic Design' },
  { value: 'content-writing', label: 'Content Writing' },
  { value: 'customer-service', label: 'Customer Service' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'general', label: 'General' },
] as const
