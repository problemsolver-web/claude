# 🚀 Deploy Probashi Shield to the internet (free)

Goal: a public link anyone can open (and install as an app) like
`https://probashi-shield.vercel.app`, backed by a shared cloud database where
**all reports from all users land in one place**.

You'll use three free services:
1. **Neon** — cloud Postgres database (where all data lives)
2. **Render** — hosts the backend API
3. **Vercel** — hosts the frontend (the app people open)

Budget ~30 minutes the first time. You need a GitHub account (you have one).

---

## Part 1 — Create the cloud database (Neon)

1. Go to <https://neon.tech> → **Sign up** (use your GitHub account).
2. Click **Create project**. Name it `probashi-shield`. Leave defaults.
3. After it's created, find the **Connection string** (looks like
   `postgresql://user:password@ep-xxxx.neon.tech/dbname?sslmode=require`).
4. **Copy it** and paste it somewhere safe — you'll need it twice.

---

## Part 2 — Switch the app to Postgres (one-line change)

Locally on your computer, open this file:
```
probashi-shield/backend/prisma/schema.prisma
```
Near the top, change the database provider from `sqlite` to `postgresql`:

```prisma
datasource db {
  provider = "postgresql"     // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Save it, then commit and push so the deploy uses it:
```cmd
cd %USERPROFILE%\claude\probashi-shield
git add backend/prisma/schema.prisma
git commit -m "Use PostgreSQL for production"
git push
```

> Tip: if you also want your **local** app to use the same cloud database (so
> local and live share data), put the Neon connection string in
> `backend/.env` as `DATABASE_URL="...your neon string..."`. Otherwise local
> stays on SQLite — but then you must keep the provider on `postgresql` only on
> the deployed copy. Easiest path: use Neon everywhere.

---

## Part 3 — Deploy the backend (Render)

1. Go to <https://render.com> → sign up with GitHub.
2. Click **New +** → **Web Service**.
3. Connect your `problemsolver-web/claude` repository.
4. Fill in:
   - **Name:** `probashi-shield-api`
   - **Branch:** `probashi-shield-app`
   - **Root Directory:** `probashi-shield/backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build && npx prisma db push`
   - **Start Command:** `npm start`
   - **Instance type:** Free
5. Click **Advanced → Add Environment Variable** and add:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *(paste your Neon connection string)* |
   | `JWT_SECRET` | *(any long random text, e.g. mash your keyboard)* |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | `*` *(we'll tighten this in Part 5)* |
   | `MINISTRY_HOTLINE` | `16135` |
6. Click **Create Web Service**. Wait for it to build (a few minutes).
7. When it's live, copy its URL, e.g. `https://probashi-shield-api.onrender.com`.
8. **Seed the database once:** open the Render **Shell** tab and run:
   ```bash
   npm run db:seed
   ```
   (This loads the sample agencies so search works. Run it only once.)

Test it: open `https://probashi-shield-api.onrender.com/health` → you should see
`{"status":"ok"}`.

---

## Part 4 — Deploy the frontend (Vercel)

1. Go to <https://vercel.com> → sign up with GitHub.
2. Click **Add New → Project** → import `problemsolver-web/claude`.
3. Configure:
   - **Root Directory:** click **Edit** → choose `probashi-shield/frontend`
   - **Framework Preset:** Next.js (auto-detected)
   - **Branch:** `probashi-shield-app`
4. Expand **Environment Variables** and add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://probashi-shield-api.onrender.com/api/v1` |
   *(use YOUR Render URL, and keep the `/api/v1` at the end)*
5. Click **Deploy**. After a minute you'll get a public URL like
   `https://probashi-shield.vercel.app`.

---

## Part 5 — Connect the two (CORS)

1. Back in **Render** → your service → **Environment** → edit `FRONTEND_URL`
   and set it to your Vercel URL, e.g. `https://probashi-shield.vercel.app`
   (no trailing slash). Save — Render redeploys automatically.

Done! 🎉 Open your Vercel URL on your phone:
- Search "Dubai Dream" → red result.
- Submit a test report → it lands in the **shared Neon database**, visible in
  the admin dashboard at `/admin/login` and in the reporter's "My Reports".
- Tap browser menu → **Add to Home Screen** → the app icon installs.

---

## Where do reports go now?

Every report from every visitor is saved in your **one Neon cloud database**.
You (admin) see them all at `https://<your-vercel-url>/admin` after logging in
with `admin@probashishield.gov.bd` / `admin123`.
**Change that admin password before sharing the link publicly** (create a new
admin or update the seed).

---

## Troubleshooting
- **Search returns nothing on the live site:** you forgot Part 3 step 8 (seed).
- **Frontend loads but every action errors:** `NEXT_PUBLIC_API_URL` is wrong, or
  `FRONTEND_URL` on Render doesn't match your Vercel domain (CORS).
- **Render free instance is slow on first load:** free instances sleep when idle
  and take ~30s to wake. Fine for a demo; mention it or open the site a minute
  before presenting.
- **Build fails on Render:** make sure Root Directory is `probashi-shield/backend`
  and the schema provider is `postgresql`.
