# JobMatch BD — Backend API

Express + TypeScript + Prisma (PostgreSQL) + Redis. Phase 1 delivers the full
database schema and authentication for **Companies** and **Job Seekers**.

## Setup

```bash
# From the repo root, start Postgres + Redis:
docker compose up -d

cd backend
cp .env.example .env        # fill in secrets (JWT_* are pre-set for dev)
npm install
npm run prisma:migrate      # apply schema to the database
npm run dev                 # http://localhost:4000
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start API with hot reload (tsx) |
| `npm run build` / `npm start` | Compile to `dist/` and run |
| `npm run typecheck` | Type-check without emitting |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:studio` | Browse the database |

## Project Structure

```
src/
├── config/      env (zod-validated), logger (pino), prisma, redis
├── middleware/  auth, validate (zod), rateLimit, error handling
├── services/    token (JWT + secure tokens), email (nodemailer)
├── modules/
│   └── auth/    routes · controller · service · validation
├── utils/       ApiError, asyncHandler
├── app.ts       Express app factory
└── server.ts    bootstrap + graceful shutdown
```

## Auth API

Base path: `/api/auth`. All responses use `{ success, data }` or `{ success: false, error }`.

| Method | Endpoint | Body | Description |
| --- | --- | --- | --- |
| POST | `/register` | `name, email, password, userType (COMPANY\|JOB_SEEKER), companyName?` | Create account + profile, send verification email, return tokens |
| POST | `/login` | `email, password` | Authenticate, return tokens |
| POST | `/verify-email` | `token` | Confirm email address |
| POST | `/resend-verification` | `email` | Re-send verification email |
| POST | `/forgot-password` | `email` | Send password reset email |
| POST | `/reset-password` | `token, password` | Set a new password |
| POST | `/refresh` | `refreshToken` | Issue a new access token |
| GET | `/me` | — (Bearer token) | Current user + profile |

### Token model

- **Access token** (`JWT_ACCESS_EXPIRES_IN`, default 15m) — sent as `Authorization: Bearer <token>`.
- **Refresh token** (`JWT_REFRESH_EXPIRES_IN`, default 7d) — exchanged at `/refresh`.
- Email/reset tokens are random 32-byte values; only their SHA-256 hash is stored.

### Security notes

- Passwords hashed with bcrypt (cost 12) and require upper/lower/number, min 8 chars.
- Login, register, and email-sending endpoints are rate limited (10 / 15 min / IP);
  all `/api` routes limited to 100 / 15 min / IP.
- `forgot-password` / `resend-verification` give identical responses regardless of
  whether the account exists (prevents account enumeration).
- `helmet`, CORS locked to `CLIENT_URL`, and server-side zod validation on every input.

## Example

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Acme Ltd","email":"hr@acme.com","password":"Passw0rd!","userType":"COMPANY","companyName":"Acme Ltd"}'
```


## Full API Surface (Phases 2–4)

All routes are under `/api` and (except public job browsing) require a Bearer access token.

### Profiles — `/api/profiles`
| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET/PATCH | `/job-seeker` | Job Seeker | Get / update profile |
| GET | `/job-seeker/completion` | Job Seeker | Profile completion % |
| POST/DELETE | `/job-seeker/skills[/:id]` | Job Seeker | Add / remove skill |
| POST/DELETE | `/job-seeker/experiences[/:id]` | Job Seeker | Add / remove experience |
| POST/DELETE | `/job-seeker/education[/:id]` | Job Seeker | Add / remove education |
| POST/DELETE | `/job-seeker/certifications[/:id]` | Job Seeker | Add / remove certification |
| POST/DELETE | `/job-seeker/projects[/:id]` | Job Seeker | Add / remove portfolio project |
| POST/DELETE | `/job-seeker/resumes[/:id]` | Job Seeker | Register / remove resume (URL) |
| GET/PATCH | `/company` | Company | Get / update company profile |
| GET | `/candidates/:id` | Company | View a candidate's public profile |

### Jobs — `/api/jobs`
| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET | `/search` | Public | Browse/search active jobs (filters: search, location, jobType, category, experienceLevel, salaryMin, skills) |
| GET | `/:idOrSlug` | Public | Single job (increments views) |
| GET | `/mine` | Company | Company's own postings |
| POST | `/` | Company | Create posting (auto-triggers matching) |
| PATCH/DELETE | `/:id` | Company | Update / delete posting |
| PATCH | `/:id/status` | Company | Change status (ACTIVE/CLOSED/EXPIRED/DRAFT) |
| PATCH | `/:id/extend` | Company | Extend deadline |

### Applications — `/api/applications`
| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| POST | `/` | Job Seeker | Apply (computes match score, notifies company) |
| GET | `/mine` | Job Seeker | Own applications |
| GET | `/company` | Company | All applications (filter by job/status, sort by score) |
| GET | `/:id` | Company | Full application + candidate detail |
| PATCH | `/:id/status` | Company | Change status (notifies seeker) |
| PATCH | `/bulk-status` | Company | Bulk status change |

### Matching — `/api/matching`
| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET | `/recommended-jobs` | Job Seeker | AI-recommended jobs |
| GET | `/jobs/:jobId/candidates` | Company | Top recommended candidates |
| POST | `/jobs/:jobId/invite/:jobSeekerId` | Company | Invite candidate to apply |

### Messages — `/api/messages`
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/conversations` | Conversation list with unread counts |
| GET | `/conversations/:otherUserId` | Thread (marks incoming as read) |
| POST | `/` | Send message (real-time + notification) |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | List (`?unreadOnly=true`, paginated) + unread count |
| PATCH | `/:id/read` / `/read-all` | Mark read |
| DELETE | `/:id` | Delete |

### Analytics — `/api/analytics`
| Method | Endpoint | Role | Description |
| --- | --- | --- | --- |
| GET | `/company/overview` | Company | Quick stats + recent applications |
| GET | `/company/insights` | Company | Hiring funnel + per-job performance |
| GET | `/job-seeker/overview` | Job Seeker | Stats + recent applications |

## Real-time (Socket.io)

Connect with `auth: { token: <accessToken> }`. Each user joins room `user:<id>`.
Server emits:
- `notification` — new notification object
- `message` — new message object (to both sender and recipient)
