# JobMatch BD

An AI-powered job matching platform connecting companies in Bangladesh with fresh graduates and unemployed youth. The system intelligently matches job seekers with opportunities using transparent, skill-based recommendations.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + TypeScript + Recharts + socket.io-client
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Prisma ORM) + Redis (caching)
- **Auth:** JWT (access + refresh), email verification, password reset, bcrypt
- **Real-time:** Socket.io (notifications + messaging)
- **AI Matching:** TF-IDF / cosine similarity engine (dependency-free, OpenAI-swappable)

## Monorepo Layout

```
.
├── backend/            # Express + TypeScript API
├── frontend/           # Next.js website + dashboards
├── docker-compose.yml  # Local Postgres + Redis
└── README.md
```

## Quick Start

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Backend  → http://localhost:4000
cd backend
cp .env.example .env
npm install
npm run prisma:migrate     # create tables
npm run dev

# 3. Frontend → http://localhost:3000   (in a second terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open http://localhost:3000, register as a **Company** or **Job Seeker**, and the
relevant dashboard loads automatically. (With no SMTP configured, verification &
reset emails are logged to the backend console in dev.)

## Features

### Authentication
Email/password registration & login, JWT access + refresh tokens, email
verification, password reset. Two roles: **Company** and **Job Seeker**.

### Job Seeker
- Profile management (bio, headline, location, skills, education, experience, projects, resumes)
- Profile-completion meter
- AI-recommended jobs + full search/browse with filters
- One-click apply with automatic match scoring
- Application tracking with live status updates
- Real-time messaging with companies

### Company
- Dashboard overview (active postings, applications, shortlisted, views)
- Job postings CRUD (create/edit/close/reopen/delete, search & filter)
- Applications management (filter by job/status, sort by match score, bulk shortlist/reject)
- Full application detail with candidate profile + status workflow (new → reviewed → shortlisted → accepted/rejected)
- AI-recommended candidates per job with "Invite to Apply"
- Analytics: hiring funnel chart + per-job performance & conversion
- Company profile management
- Real-time messaging with candidates

### AI Matching Engine
Transparent 0–100 scoring blending skill overlap (55%), resume/description text
similarity via TF-IDF cosine (20%), experience-level alignment (15%) and location
fit (10%). Returns a breakdown explaining *why* each match was made. See
`backend/src/modules/matching/matching.engine.ts`.

### Notifications
Real-time (Socket.io) in-app notifications with an unread badge + dropdown, plus
email notifications, all persisted to the database with read/unread state.

## Verification status

- Backend: `npm run typecheck` ✓, boots with all routes ✓, matching engine sanity-checked ✓
- Frontend: `npm run typecheck` ✓, `npm run build` ✓ (22 routes)
- Live DB integration requires Postgres + Redis (provided via `docker compose`); run `npm run prisma:migrate` then the smoke flow above.

See `backend/README.md` for the full REST API reference.
