# Chronomail

An AI-assisted job outreach tool. Upload a resume and a job description, and Chronomail parses both, builds a candidate/job context, generates a tailored outreach email, and schedules delivery through the user's own Gmail account — with per-sender rate limiting and retry-safe background processing.

## What it does

1. **Parse** — extracts structured data from an uploaded resume (PDF) and a job description (file or pasted text).
2. **Build context** — combines the parsed resume and job into a candidate-to-role context object.
3. **Generate** — an LLM (Groq or Gemini) writes a tailored outreach email from that context.
4. **Schedule & send** — emails are queued and sent via the Gmail API (OAuth), staggered across recipients with an hourly per-sender rate limit, automatic retry on failure, and Gmail token invalidation handling.
5. **Track** — scheduled, sent, and failed emails are queryable per user.

## Architecture

```
frontend/   React + TypeScript + Vite, Tailwind CSS
backend/    Node.js + Express + TypeScript
            PostgreSQL   — users, email_batches, email_jobs
            Redis        — BullMQ queue + per-sender hourly rate counters
            Supabase     — resume file storage
            Groq / Gemini — email generation, resume & job parsing
            Gmail API + OAuth2 (Passport) — sending mail as the user
```

Backend is layered as `router → controller → service`, with Zod schemas for request validation.

### Background worker

Scheduled emails are processed by a BullMQ worker (`npm run worker`) that:
- enforces a per-sender, per-hour send limit via Redis counters, auto-rescheduling overflow to the next hour
- locks each job (`status = 'scheduled' → 'processing'`) to prevent double-sends under concurrency
- retries transient failures with exponential backoff, and clears a user's Gmail refresh token if it's revoked/invalid
- attaches the candidate's resume (pulled from Supabase storage) to the outgoing email when provided

## API overview

| Route | Description |
|---|---|
| `POST /auth/register`, `/auth/login`, `/auth/logout` | Email/password auth |
| `GET /auth/google`, `/auth/google/callback` | Google OAuth login |
| `GET /auth/me` | Current session user |
| `GET /gmail/connect`, `/gmail/callback` | Connect a Gmail account for sending |
| `POST /ai/resume-parser` | Parse an uploaded resume |
| `POST /ai/job-parser` | Parse a job description (file or text) |
| `POST /ai/parse` | Parse resume + job in one call |
| `POST /ai/context` | Build candidate/job context from parsed data |
| `POST /emails/generate` | Generate an outreach email from context |
| `POST /emails/schedule` | Schedule a batch send to one or more recipients |
| `GET /emails/scheduled`, `/emails/sent`, `/emails/:id` | Query email status |

All routes except auth/OAuth entry points require a valid session cookie.

## Tech stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, `@react-oauth/google`

**Backend:** Node.js, Express, TypeScript, PostgreSQL (`pg`), Redis (`ioredis`), BullMQ, Passport (Google OAuth2), JWT, bcrypt, Zod, Multer, Groq SDK, Google Gemini SDK, Google APIs (Gmail), Supabase (storage)

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Redis

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm run build
npm start               # API server
npm run worker          # in a separate process — the email queue worker
```

Or for local development:
```bash
npm run dev             # ts-node-dev with auto-restart
```

**Environment variables (`backend/.env`):**

```
# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database & queue
DATABASE_URL=postgres://user:password@localhost:5432/chronomail
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
JWT_COOKIE_MAX_AGE=604800000

# Google OAuth (login)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/auth/google/callback

# Google OAuth (Gmail send scope)
GOOGLE_GMAIL_CALLBACK_URL=http://localhost:4000/gmail/callback

# LLM providers
GROQ_API_KEY=
GROQ_MODEL=
GEMINI_API_KEY=

# Supabase (resume storage)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_RESUME_BUCKET=
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

**Environment variables (`frontend/.env`):**

```
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=
```

### Production notes
- Update `FRONTEND_URL`, `GOOGLE_CALLBACK_URL`, and `GOOGLE_GMAIL_CALLBACK_URL` to your deployed domains (Google OAuth callback URLs must be registered in the Google Cloud Console to match exactly).
- `NODE_ENV=production` enables secure, cross-site cookies (`secure: true`, `sameSite: none`) — required if frontend and backend are on different domains.
- The API and worker are separate processes (`npm start` / `npm run worker`) and should be deployed/run independently.

## Known limitations
- Resume/job parsing accuracy depends on the underlying LLM and is not guaranteed for unusual document formats.
- No automated test suite yet.