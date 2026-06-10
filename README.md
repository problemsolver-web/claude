# BDJobs AI - Smart Job Marketplace for Bangladesh

An AI-powered job marketplace connecting talented professionals with top employers in Bangladesh. Features intelligent match scoring, real-time messaging, and comprehensive dashboards for both job seekers and employers.

## Table of Contents

- [Architecture](#architecture)
- [Matching Engine Algorithm](#matching-engine-algorithm)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Guide](#setup-guide)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Seed Data](#seed-data)
- [Deployment Guide](#deployment-guide)
- [Key Features](#key-features)

## Architecture

BDJobs AI uses a modern full-stack architecture built on Next.js App Router with Supabase as the backend:

```
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
|   Client (SSR    |---->|   Next.js App    |---->|   Supabase       |
|   + CSR)         |     |   Router         |     |   (PostgreSQL)   |
|                  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
                                |
                                v
                         +------------------+
                         |                  |
                         |  Matching Engine |
                         |  (Pure TS)       |
                         |                  |
                         +------------------+
```

### Key Architectural Decisions

- **Server Components by default**: Pages and layouts are Server Components for optimal performance
- **Client Components for interactivity**: Only used where user interaction is needed (forms, modals, real-time features)
- **Server Actions for mutations**: All data mutations go through server actions with proper validation
- **Middleware for auth**: Session refresh handled in middleware before every request
- **Row Level Security (RLS)**: Database-level access control ensures data isolation between users
- **Deterministic matching**: Pure TypeScript scoring engine with no external API dependencies

### Request Flow

1. User navigates to a page
2. Middleware refreshes the Supabase auth session
3. Server Component renders, fetching data via Supabase client
4. For mutations, Client Components call Server Actions
5. Server Actions validate input and perform database operations
6. The matching engine runs as a pure computation when scoring is needed

## Matching Engine Algorithm

The AI matching engine is a deterministic scoring system that computes compatibility between job seeker profiles and job listings. It produces consistent, reproducible results with no external API calls.

### Scoring Components

| Component | Weight | Description |
|-----------|--------|-------------|
| Degree Relevance | 30% | Evaluates if the candidate's degree field matches the job category |
| Skill Overlap | 30% | Compares candidate skills against required (70%) and preferred (30%) job skills |
| Category Alignment | 20% | Checks if the job category matches the candidate's preferences |
| Experience Compatibility | 15% | Assesses if years of experience fall within the job's range |
| Language Match | 5% | Evaluates language proficiency (English + Bengali valued highest) |

### Score Interpretation

- **85-100%**: Excellent Match - Strong alignment across all dimensions
- **70-84%**: Strong Match - Good fit with minor gaps
- **55-69%**: Good Match - Solid potential with some development areas
- **40-54%**: Fair Match - Partial alignment, worth considering
- **Below 40%**: Filtered out from recommendations

### Special Rules

- **Fresh Graduate Cap**: Candidates with 0-1 years experience are capped at 20% match score for senior roles (5+ years required or senior titles)
- **Irrelevant Degree Penalty**: Business/commerce degrees receive a significant penalty (0.1) for technical roles
- **Flexible Matching**: Skills are matched using substring comparison to handle variations (e.g., "React.js" matches "React")

### Algorithm Location

```
src/lib/matching/
  engine.ts      - Main scoring orchestration and match label generation
  scoring.ts     - Individual scoring functions (pure, side-effect free)
  constants.ts   - Weights, thresholds, and category mappings
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Server Components + Server Actions (no client-side state library)
- **Authentication**: Supabase Auth with SSR cookie-based sessions

## Project Structure

```
src/
  app/
    (auth)/              # Authentication pages (login, register)
    (dashboard)/         # Protected dashboard routes
      dashboard/
        employer/        # Employer dashboard
          company/       # Company profile management
          jobs/          # Job CRUD operations
          messages/      # Employer messaging
        jobseeker/       # Job seeker dashboard
          applications/  # Application tracking
          jobs/          # Job browsing with match scores
          messages/      # Job seeker messaging
          profile/       # Profile management
          recommendations/ # AI-powered job recommendations
    not-found.tsx        # Global 404 page
    layout.tsx           # Root layout
    page.tsx             # Landing page
  components/
    forms/               # Reusable form components
    layout/              # Navigation and layout components
    messaging/           # Chat and conversation components
    ui/                  # Base UI components (button, card, badge, etc.)
  lib/
    actions/             # Server actions for data mutations
    matching/            # AI matching engine (pure TypeScript)
    seed/                # Seed data definitions
    supabase/            # Supabase client configurations
  types/
    database.ts          # TypeScript type definitions
supabase/
  migrations/            # SQL migration files
```

## Setup Guide

### Prerequisites

- Node.js 18+ (v22 recommended)
- npm 9+
- A Supabase project (free tier works)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd bdjobs-ai
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your Supabase credentials (see [Environment Variables](#environment-variables)).

4. **Set up the database**:

   Run the migration files in order against your Supabase project:
   - `supabase/migrations/00001_initial_schema.sql` - Tables and types
   - `supabase/migrations/00002_rls_policies.sql` - Row Level Security
   - `supabase/migrations/00003_indexes.sql` - Performance indexes
   - `supabase/migrations/00004_seed_data.sql` - Sample data (optional)

   You can run these via the Supabase Dashboard SQL Editor or using the Supabase CLI:

   ```bash
   npx supabase db push
   ```

5. **Start the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Yes |

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Database Schema

### Tables

- **users** - Extends Supabase auth.users with profile data (skills, experience, preferences)
- **companies** - Employer company profiles
- **jobs** - Job listings with requirements and skill arrays
- **applications** - Job applications with match scores
- **conversations** - Messaging threads between employers and candidates
- **messages** - Individual messages within conversations

### Key Design Decisions

- Arrays (skills, languages, categories) stored as PostgreSQL `TEXT[]` for efficient querying
- Match scores stored as JSONB for flexible breakdown data
- UUID primary keys throughout for Supabase compatibility
- `updated_at` triggers ensure timestamp consistency
- Unique constraint on (job_id, user_id) in applications prevents duplicate submissions

## Seed Data

The project includes seed data with realistic Bangladeshi names and companies for development and testing:

- **10 job seekers** with diverse backgrounds (developers, designers, marketers, analysts)
- **5 employers** representing different companies
- **5 companies** across tech, logistics, and e-commerce sectors
- **15 job listings** covering entry-level to senior positions

Salary ranges follow Bangladeshi market standards:
- Entry level (0-1 years): BDT 15,000 - 30,000/month
- Mid level (2-4 years): BDT 30,000 - 60,000/month
- Senior level (5+ years): BDT 60,000 - 120,000/month

To load seed data, run `supabase/migrations/00004_seed_data.sql` against your database. Note: seed data requires the auth.users foreign key constraint to be satisfied (create auth users first or temporarily disable the FK constraint).

## Deployment Guide

### Deploying to Vercel

1. **Push to GitHub**:

   ```bash
   git push origin main
   ```

2. **Import on Vercel**:
   - Go to [vercel.com](https://vercel.com) and click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js and configures the build

3. **Set environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy**: Vercel builds and deploys automatically on every push to main.

### Supabase Setup for Production

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run migrations** via the SQL Editor or Supabase CLI:

   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

3. **Configure authentication**:
   - Enable Email/Password sign-in in Authentication > Providers
   - Set Site URL to your Vercel domain (e.g., `https://your-app.vercel.app`)
   - Add redirect URLs for auth callbacks

4. **Enable Row Level Security**: The migration files include RLS policies. Verify they are active in the Supabase Dashboard under Authentication > Policies.

5. **Set up Realtime** (for messaging): Enable Realtime on the `messages` table in Database > Replication.

### Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase project created and migrations run
- [ ] RLS policies verified and active
- [ ] Auth redirect URLs configured
- [ ] Realtime enabled for messaging tables
- [ ] Custom domain configured (optional)

## Key Features

### For Job Seekers
- **AI-Powered Recommendations**: Personalized job matches based on profile analysis
- **Smart Search**: Browse and filter jobs by category, type, and keywords
- **Application Tracking**: Monitor application status in real-time
- **Direct Messaging**: Communicate with employers after acceptance
- **Profile Management**: Skills, experience, and preferences management

### For Employers
- **Company Dashboard**: Manage company profile and job postings
- **Job Management**: Create, edit, and deactivate job listings
- **Applicant Scoring**: AI-computed match scores for every applicant
- **Application Management**: Review, shortlist, accept, or reject candidates
- **Messaging**: Direct communication with accepted candidates

### Platform Features
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Skeleton UIs for smooth navigation experience
- **Error Boundaries**: Graceful error recovery with retry functionality
- **Type Safety**: Full TypeScript coverage with strict mode
- **Performance**: Server-side rendering with streaming support
