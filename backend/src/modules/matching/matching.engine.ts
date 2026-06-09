/**
 * Lightweight, dependency-free matching engine.
 *
 * Scores a job seeker against a job posting on a 0-100 scale using a weighted
 * blend of:
 *   - skill overlap (Jaccard-style, the dominant signal)         55%
 *   - text similarity between resume/bio and job description (TF-IDF cosine) 20%
 *   - experience-level alignment                                 15%
 *   - location preference match                                  10%
 *
 * It is intentionally transparent: `explainMatch` returns a breakdown so the UI
 * can show "why" a candidate matched. The cosine/TF-IDF helpers can later be
 * swapped for embeddings from the OpenAI API without changing callers.
 */

const EXPERIENCE_ORDER = ['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD'] as const;
type ExperienceLevel = (typeof EXPERIENCE_ORDER)[number];

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'for', 'with', 'on', 'at', 'is',
  'are', 'be', 'as', 'by', 'we', 'you', 'your', 'our', 'will', 'this', 'that', 'from',
]);

export function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));
}

function termFreq(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
}

/** Cosine similarity between two documents using TF weighting (0-1). */
export function cosineSimilarity(a: string, b: string): number {
  const tfA = termFreq(tokenize(a));
  const tfB = termFreq(tokenize(b));
  if (tfA.size === 0 || tfB.size === 0) return 0;

  let dot = 0;
  for (const [term, freq] of tfA) {
    const other = tfB.get(term);
    if (other) dot += freq * other;
  }
  const magA = Math.sqrt([...tfA.values()].reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt([...tfB.values()].reduce((s, v) => s + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

function normalizeSkill(s: string): string {
  return s.trim().toLowerCase();
}

/** Fraction of required skills the candidate possesses (0-1). */
function skillScore(required: string[], candidate: string[]): { score: number; matched: string[] } {
  if (required.length === 0) return { score: 0.5, matched: [] };
  const candSet = new Set(candidate.map(normalizeSkill));
  const matched = required.filter((r) => candSet.has(normalizeSkill(r)));
  return { score: matched.length / required.length, matched };
}

function experienceScore(required: ExperienceLevel, candidate: ExperienceLevel | null): number {
  if (!candidate) return 0.5; // unknown — neutral
  const diff = Math.abs(EXPERIENCE_ORDER.indexOf(required) - EXPERIENCE_ORDER.indexOf(candidate));
  return Math.max(0, 1 - diff * 0.25);
}

function locationScore(jobLocation: string | null, isRemote: boolean, preferred: string[], seekerLocation: string | null): boolean {
  if (isRemote) return true;
  if (!jobLocation) return true;
  const target = jobLocation.toLowerCase();
  const pool = [...preferred, seekerLocation ?? ''].map((l) => l.toLowerCase());
  return pool.some((l) => l && (l.includes(target) || target.includes(l)));
}

export interface JobInput {
  title: string;
  description: string;
  skillsRequired: string[];
  experienceLevel: ExperienceLevel;
  location: string | null;
  isRemote: boolean;
}

export interface SeekerInput {
  skills: string[];
  experienceLevel: ExperienceLevel | null;
  location: string | null;
  preferredLocations: string[];
  profileText: string; // bio + headline + resume parsed text
}

export interface MatchResult {
  score: number; // 0-100
  reason: {
    skillMatch: number;
    matchedSkills: string[];
    textSimilarity: number;
    experienceMatch: number;
    locationMatch: boolean;
  };
}

const WEIGHTS = { skills: 0.55, text: 0.2, experience: 0.15, location: 0.1 };

export function scoreMatch(job: JobInput, seeker: SeekerInput): MatchResult {
  const { score: skill, matched } = skillScore(job.skillsRequired, seeker.skills);
  const text = cosineSimilarity(
    `${job.title} ${job.description} ${job.skillsRequired.join(' ')}`,
    seeker.profileText,
  );
  const experience = experienceScore(job.experienceLevel, seeker.experienceLevel);
  const location = locationScore(job.location, job.isRemote, seeker.preferredLocations, seeker.location);

  const composite =
    skill * WEIGHTS.skills +
    text * WEIGHTS.text +
    experience * WEIGHTS.experience +
    (location ? 1 : 0) * WEIGHTS.location;

  return {
    score: Math.round(composite * 100),
    reason: {
      skillMatch: Math.round(skill * 100),
      matchedSkills: matched,
      textSimilarity: Math.round(text * 100),
      experienceMatch: Math.round(experience * 100),
      locationMatch: location,
    },
  };
}
