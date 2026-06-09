# 🛡️ Probashi Shield

**Verify recruiting agents before you pay. Stop migration fraud in Bangladesh.**

A full-stack web + SMS platform that lets any worker or family check whether an
overseas recruiting agency is **BMET-licensed**, see **fraud reports** against
it, **report fraud**, and look up **official recruitment fees** for destination
countries — before handing over their life savings.

> Every year thousands of Bangladeshi workers lose 3–5 lakh taka to fake
> *dalals*. Probashi Shield turns the official licensed-agency list + crowd
> reports into an instant verdict: 🟢 Safe / 🟡 Caution / 🔴 Danger.

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Prisma ORM + SQLite (dev) → PostgreSQL (production) |
| Auth | JWT + bcrypt |
| SMS | Built-in simulator + Twilio webhook endpoint (optional) |

The repo is a monorepo with two apps:

```
probashi-shield/
├── backend/    # Express REST API (port 4000)
└── frontend/   # Next.js app (port 3000)
```

---

## 🚀 Quick Start (local, ~5 minutes)

You need **Node.js 18+** installed.

### 1. Backend

```bash
cd backend
cp .env.example .env          # default values work out of the box
npm install
npm run db:push               # create the SQLite schema
npm run db:seed               # load sample BMET agencies + complaints
npm run dev                   # API on http://localhost:4000
```

Health check: open <http://localhost:4000/health> → `{"status":"ok"}`

### 2. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev                   # app on http://localhost:3000
```

Open <http://localhost:3000> and try searching **"Dubai Dream"** (🔴 blacklisted),
**"Gulf Gateway"** (🟡 caution), or **"Al-Amin"** (🟢 verified).

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Ministry admin | `admin@probashishield.gov.bd` | `admin123` |
| Agency owner | `owner@alaminoverseas.example` | `agency123` |

Admin dashboard: <http://localhost:3000/admin/login>

---

## 🧭 Feature Tour (for the demo / pitch)

1. **Home / Verify** (`/`) — search by name, BMET license #, or phone. Get an
   instant risk verdict.
2. **Agency detail** (`/agency/[id]`) — full license info + every fraud report.
3. **SMS demo** (`/sms`) — phone mockup showing how a basic-phone user texts
   `VERIFY Dubai Dream` and gets a warning. No internet needed in real use.
4. **Report fraud** (`/report`) — anonymous report form with tracking number.
5. **Track report** (`/track`) — check a report's status by tracking number.
6. **Country fees** (`/destinations`) — official government fees + salaries, so
   workers spot overcharging.
7. **Safety guide** (`/safety`) — pre-departure checklist + red flags.
8. **Ministry dashboard** (`/admin`) — metrics, complaint management, one-click
   blacklist.

---

## 🔌 API Overview (base `/api/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/agencies/search?q=&type=name\|license\|phone` | Search agencies |
| GET | `/agencies/:id` | Agency detail + risk + complaints |
| GET | `/agencies/:id/complaints` | Public complaint list |
| POST | `/complaints` | Submit a fraud report |
| GET | `/complaints/track/:trackingNumber` | Report status |
| GET | `/destinations` | Country fee/salary guides |
| POST | `/sms/verify` | SMS command handler (`VERIFY`, `FEE`, `TIPS`, `HELP`) |
| POST | `/sms/twilio-webhook` | TwiML webhook for real Twilio SMS |
| POST | `/auth/login` · `/auth/register` · GET `/auth/me` | Auth |
| GET | `/admin/dashboard` | Metrics (admin only) |
| GET/PUT | `/admin/complaints` · `/admin/complaints/:id` | Manage complaints |
| PUT | `/admin/agencies/:id/blacklist` | Blacklist an agency |

---

## 📲 Enabling real SMS (optional)

The platform works fully with the built-in **SMS simulator**. To wire up real
SMS via Twilio:

1. Add your credentials to `backend/.env` (`TWILIO_*`).
2. Point your Twilio number's "A message comes in" webhook to
   `https://your-api-domain/api/v1/sms/twilio-webhook`.
3. Workers text `VERIFY <agency>` to your number and get the verdict back.

For production in Bangladesh, the same webhook pattern works with local
aggregators (Grameenphone / Banglalink / Robi shortcode + USSD).

---

## 🌐 Deployment

### Database: move from SQLite to PostgreSQL
1. In `backend/prisma/schema.prisma`, change the datasource provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set `DATABASE_URL` to your Postgres connection string (e.g. from
   [Neon](https://neon.tech), [Supabase](https://supabase.com), or Railway).
3. Run `npm run db:push && npm run db:seed`.

### Backend → Railway / Render / Fly.io
- Build: `npm install && npm run build`
- Start: `npm start`
- Set env vars: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`.

### Frontend → Vercel
- Import the `frontend/` directory.
- Set env var `NEXT_PUBLIC_API_URL` to your deployed API URL
  (e.g. `https://your-api.up.railway.app/api/v1`).
- Deploy. Vercel auto-builds Next.js.

---

## 📊 Sample data

Seed data is **illustrative** and lives in `backend/prisma/seed.ts`. Agency
names are fictional. In production, the `agencies` table is populated by syncing
BMET's official licensed-agency list (a scheduled scraper/import job).

---

## ⚠️ Note

This is a hackathon/competition MVP. The data shown is sample data for
demonstration. Before any real deployment, integrate the official BMET data
source and have the Ministry validate complaint moderation workflows.
