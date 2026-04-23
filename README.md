# Football Recruit Platform

A football recruitment marketplace with AI-powered scouting. Connects players
with clubs through rich profiles, psychological readiness assessments, coach
recommendations, and (in future steps) AI-generated scouting reports from match
video.

This repository is a **monorepo** containing the full platform scaffold for
**Step 1 (project scaffold + database)** and **Step 2 (auth + profiles)**.

## Tech stack

| Layer        | Tooling                                                    |
| ------------ | ---------------------------------------------------------- |
| Frontend     | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn-style primitives, react-hook-form + zod, next-themes |
| Backend      | NestJS 10, TypeScript strict, TypeORM, PostgreSQL + PostGIS, JWT (passport-jwt), class-validator, Swagger |
| Database     | PostgreSQL 16 with `postgis` and `pg_trgm` extensions, numbered SQL migrations, psych-question seed |
| Object store | MinIO (S3-compatible) — used in later steps for video/media |
| Cache/queue  | Redis 7 — used in later steps for rate limiting and jobs  |
| AI workers   | Python placeholder in `ai-workers/` — built in Step 3+    |

## Getting started

```bash
cp .env.example .env
docker-compose up
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:3001
- Swagger:  http://localhost:3001/api/docs
- MinIO UI: http://localhost:9001 (user: `minioadmin`, pass: `minioadmin`)
- Postgres: `postgresql://postgres:postgres@localhost:5432/football_recruit`

The first time Postgres comes up, the contents of `database/migrations/` are
applied by the official Postgres image's `/docker-entrypoint-initdb.d`
mechanism, followed by the seed files in `database/seeds/`. Subsequent starts
re-use the existing volume, so migrations only run once per `postgres-data`
volume.

### Running services individually

```bash
# backend
cd backend && npm install && npm run start:dev

# frontend
cd frontend && npm install && npm run dev
```

## Architecture

```
  ┌────────────┐      HTTPS       ┌────────────┐    TypeORM    ┌──────────────┐
  │  Next.js   │ ───────────────▶ │   NestJS   │ ────────────▶ │ PostgreSQL 16 │
  │  frontend  │   /api/*         │  backend   │               │   + PostGIS   │
  └────────────┘                  └─────┬──────┘               └──────────────┘
                                        │
                                        ├─── Redis 7 (cache / rate limits)
                                        └─── MinIO (S3-compatible object store)
```

## Module overview

### Backend (`backend/src/`)

| Module              | Responsibility                                                              |
| ------------------- | --------------------------------------------------------------------------- |
| `auth/`             | Register, login, refresh, `/auth/me` (JWT access + refresh, bcrypt hashing) |
| `users/`            | Thin repository wrapper around the `users` table                            |
| `player-profiles/`  | Player CRUD + PostGIS radius search with visibility filtering               |
| `club-profiles/`    | Club CRUD + PostGIS radius search + verification tiering                    |
| `consent/`          | Record and list consent events (terms, privacy, scouting_ai, etc.)          |
| `audit/`            | `AuditService` + global interceptor that logs POST/PATCH/DELETE mutations   |
| `health/`           | `GET /health` — liveness + DB connectivity check                            |
| `entities/`         | TypeORM entities for every table (users, profiles, consents, audit_logs…)   |
| `common/`           | Global `@Public()`, `@Roles()`, `@CurrentUser()`, JWT and Roles guards      |

Global setup in `backend/src/main.ts`:
- `ValidationPipe` (whitelist, transform, forbidNonWhitelisted)
- Global `JwtAuthGuard` — all routes protected unless marked `@Public()`
- Global `AuditInterceptor` — logs all mutations
- Swagger at `/api/docs` with Bearer auth

### Frontend (`frontend/`)

| Route                     | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `/`                       | Landing page with hero, role-selection CTAs, feature grid  |
| `/auth/login`             | Email + password login (zod-validated form)                |
| `/auth/register`          | Role selection → details → consent checkboxes              |
| `/onboarding/player`      | 4-step onboarding wizard (basic info → football → status → bio) |
| `/onboarding/club`        | 2-step club onboarding wizard                              |
| `/dashboard/player`       | Profile completion bar + quick stats + actions             |
| `/dashboard/club`         | Recruitment stats + quick actions                          |
| `/dashboard/admin`        | Admin overview + shortcuts                                 |
| `/players/[id]`           | Public player profile with tabbed sections                 |
| `/clubs/[id]`             | Public club profile with verification badge                |
| `/search`                 | Filterable player search grid with PostGIS radius, paginated |

Auth state lives in `AuthProvider` (`components/auth-provider.tsx`): access
token in memory, refresh token in `localStorage`, auto-refresh on mount.
`ProtectedRoute` redirects unauthenticated users to `/auth/login` and enforces
role-based access on dashboards.

## Environment variables

See `.env.example`. Key variables:

| Variable                  | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `DATABASE_URL`            | Postgres connection string                      |
| `REDIS_URL`               | Redis connection string                         |
| `JWT_SECRET`              | HMAC secret for JWT signing (change in prod!)   |
| `JWT_EXPIRY`              | Access token lifetime (default `15m`)           |
| `JWT_REFRESH_EXPIRY`      | Refresh token lifetime (default `7d`)           |
| `S3_ENDPOINT`             | MinIO/S3 endpoint                               |
| `S3_ACCESS_KEY`           | MinIO/S3 access key                             |
| `S3_SECRET_KEY`           | MinIO/S3 secret key                             |
| `S3_BUCKET`               | Primary bucket name                             |
| `STRIPE_SECRET_KEY`       | Stripe key (used in billing step, later)        |
| `STRIPE_WEBHOOK_SECRET`   | Stripe webhook signing secret                   |

Frontend reads `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).

## Database

### Migrations (`database/migrations/`)

Numbered SQL files from `0001_extensions.sql` through `0027_indexes.sql`.
`0001` enables `pgcrypto`, `postgis`, and `pg_trgm`. `0002`–`0026` create the 26
domain tables (users, player/club profiles, club_needs, player_stats,
media_assets, player_videos, applications, interests, shortlists,
scouting_reports, tracked_events, player_tracking_frames, consents, audit_logs,
subscriptions, psych_assessments, psych_questions, psych_responses, psych_scores,
coach_ratings, recommendation_requests, recommendations, verification_requests,
verification_badges). `0027` creates 13 supporting indexes including GiST
indexes on `geo_point` columns for PostGIS radius queries.

### Seeds (`database/seeds/`)

- `01_psych_questions.sql` — 100 psychological assessment questions across 10
  domains (self-regulation, resilience, commitment_and_discipline,
  achievement_motivation, emotional_control, confidence_and_self_belief,
  coachability, team_communication, focus_under_pressure, professional_habits).
- `02_admin_user.sql` — a seed admin user.

### Default admin credentials

> **Change this immediately on first login.**

- email: `admin@footballrecruit.com`
- password: `ChangeMeNow!2024`

## API documentation

Live Swagger UI at http://localhost:3001/api/docs when the backend is running.

Key endpoints:

| Method | Path                 | Auth   | Description                                 |
| ------ | -------------------- | ------ | ------------------------------------------- |
| POST   | `/auth/register`     | public | Create player or club account               |
| POST   | `/auth/login`        | public | Login → JWT access + refresh tokens         |
| POST   | `/auth/refresh`      | public | Exchange refresh token for a new pair       |
| GET    | `/auth/me`           | JWT    | Current user + player/club profile          |
| GET    | `/players`           | public | Paginated search with PostGIS radius + filters |
| GET    | `/players/:id`       | JWT    | View single player (visibility-aware)       |
| GET    | `/players/me`        | player | Own player profile                          |
| PATCH  | `/players/me`        | player | Update own player profile (handles geo)     |
| GET    | `/clubs`             | public | Paginated club search                       |
| GET    | `/clubs/:id`         | public | Single club profile                         |
| GET    | `/clubs/me`          | club   | Own club profile                            |
| PATCH  | `/clubs/me`          | club   | Update own club profile                     |
| POST   | `/consents`          | JWT    | Record a consent grant                      |
| GET    | `/consents/me`       | JWT    | List own consents                           |
| GET    | `/health`            | public | Liveness + DB connectivity                  |

## What's next

Step 1 and Step 2 are complete. Future steps will add:

- Step 3: Video upload + AI scouting pipeline (ingest → tracking → scouting reports)
- Step 4: Psychological assessment flow (take, score, interpret, visibility)
- Step 5: Coach recommendations + verification badges
- Step 6: Club needs + applications + shortlists
- Step 7: Billing (Stripe) and verification workflows
