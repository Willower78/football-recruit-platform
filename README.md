# Football Recruit Platform

A modern recruitment platform that connects football talent with clubs and
scouts. Goes beyond highlight reels with psychometric assessments, coach
recommendations, and AI-assisted scouting.

> **Status:** Step 1 (project scaffold + database) and Step 2 (auth +
> profiles) are implemented. Steps 3+ (needs/applications, media uploads,
> psych assessment runner, AI scouting, verification workflows) arrive in
> subsequent PRs.

## Tech stack

| Layer       | Tech |
| ----------- | ---- |
| Frontend    | Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, Inter |
| Backend     | NestJS modular monolith, TypeScript, TypeORM |
| Database    | PostgreSQL 16 + PostGIS + pg_trgm |
| Cache/queue | Redis 7 |
| Storage     | MinIO (S3-compatible) |
| AI workers  | Python placeholder (torch/ultralytics/ByteTrack land later) |
| Auth        | JWT (access 15 min, refresh 7 d), bcrypt passwords |

## Architecture

```
┌────────────┐       ┌────────────┐       ┌────────────────┐
│  Next.js   │──────▶│  NestJS    │──────▶│  Postgres +    │
│ frontend   │       │  backend   │       │  PostGIS       │
└────────────┘       │            │       └────────────────┘
                     │            │──────▶┌────────────────┐
                     │            │       │  Redis         │
                     │            │       └────────────────┘
                     │            │──────▶┌────────────────┐
                     └────────────┘       │  MinIO (S3)    │
                                          └────────────────┘
                                                 ▲
                                                 │
                                          ┌────────────────┐
                                          │  ai-workers    │
                                          │  (python)      │
                                          └────────────────┘
```

## Getting started

1. Copy the example env file and tweak as needed:

   ```bash
   cp .env.example .env
   ```

2. Boot the full stack:

   ```bash
   docker-compose up --build
   ```

   On first run Postgres auto-applies every SQL file in `database/migrations/`
   and then `database/seeds/` (including 100 psych-assessment questions and a
   default admin user).

3. Open:

   - Frontend:     http://localhost:3000
   - Backend API:  http://localhost:3001
   - Swagger UI:   http://localhost:3001/api/docs
   - MinIO console:http://localhost:9001  (login: `minioadmin` / `minioadmin`)

## Default accounts

| Role  | Email                           | Password       |
| ----- | ------------------------------- | -------------- |
| admin | `admin@footballrecruit.com`     | `ChangeMe123!` |

Change the admin password immediately in any non-dev environment.

## Repository layout

```
football-recruit-platform/
├── docker-compose.yml
├── .env.example
├── frontend/                 # Next.js 14 App Router UI
│   ├── src/app/              # routes (public, auth, onboarding, dashboards)
│   ├── src/components/       # shared + shadcn/ui primitives
│   └── src/lib/              # api client, auth context, utils
├── backend/                  # NestJS API (modular monolith)
│   └── src/
│       ├── auth/             # register/login/refresh/me + JWT + roles guard
│       ├── player-profiles/  # GET/PATCH /players/me, /:id, search w/ PostGIS
│       ├── club-profiles/    # GET/PATCH /clubs/me, /:id, search
│       ├── consent/          # terms / privacy consent tracking
│       ├── audit/            # AuditService + global AuditInterceptor
│       ├── health/           # GET /health
│       └── entities/         # TypeORM entity definitions
├── database/
│   ├── migrations/           # 26 numbered SQL files (tables + indexes)
│   └── seeds/                # psych questions + admin user
└── ai-workers/               # Python placeholder (torch/opencv land later)
```

## Database

Migrations are plain numbered SQL files in `database/migrations/`. The
Docker Postgres image applies them automatically on a fresh volume; to re-run
from scratch, drop the `pgdata` volume.

Key tables:

- `users` (auth + role)
- `player_profiles` / `club_profiles` (with PostGIS `geo_point`)
- `club_needs`, `applications`, `interests`, `shortlists`
- `media_assets`, `player_videos`
- `scouting_reports`, `tracked_events`, `player_tracking_frames`
- `psych_assessments` / `psych_questions` / `psych_responses` / `psych_scores`
- `coach_ratings`, `recommendations`, `recommendation_requests`
- `consents`, `audit_logs`, `subscriptions`
- `verification_requests`, `verification_badges`

Indexes include: `idx_player_position`, `idx_player_geo` (GiST),
`idx_club_geo` (GiST), `idx_need_status_position`, `idx_application_status`,
`idx_tracking_report_ts`, `idx_events_report_ts`, `idx_users_email`,
`idx_users_role`, `idx_psych_questions_domain`,
`idx_psych_responses_assessment`, `idx_recommendations_player`,
`idx_verification_status`.

## Backend modules

| Module            | Purpose |
| ----------------- | ------- |
| `auth`            | Register (player/club), login, refresh rotation, `GET /auth/me`. |
| `player-profiles` | `GET/PATCH /players/me`, `GET /players/:id` (visibility-aware), `GET /players?position=...&radiusKm=...` (PostGIS `ST_DWithin`). |
| `club-profiles`   | `GET/PATCH /clubs/me`, `GET /clubs/:id`, `GET /clubs` (country / level / age-group / geo). |
| `consent`         | `POST /consents`, `GET /consents/me`. |
| `audit`           | `AuditService` + global `AuditInterceptor` (auto-logs POST/PATCH/DELETE). |
| `health`          | `GET /health` (liveness + uptime). |

Everything is guarded by a global `JwtAuthGuard`. Opt out of auth with the
`@Public()` decorator. Role-based access uses `@Roles()` + `RolesGuard`.

## Frontend surface

- `/` — landing page with role-based CTAs.
- `/auth/login`, `/auth/register` — 3-step registration wizard.
- `/onboarding/player` — 4-step wizard (basics → football → status → bio).
- `/onboarding/club` — 2-step wizard (club info → details).
- `/dashboard/player`, `/dashboard/club`, `/dashboard/admin` — role-scoped
  dashboards with completion, quick stats, and quick actions.
- `/players/[id]` — tabbed public profile (Overview / Videos / Stats /
  Assessment / Recommendations — the last four are empty-state stubs for now).
- `/clubs/[id]` — public club page with verification badges and (future) needs.
- `/search` — filter sidebar + results grid, toggles between players and clubs.

## Environment variables

See `.env.example` for the full list. Critical ones:

- `DATABASE_URL` — Postgres connection string used by the backend.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — must be changed in production.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — seeded on first migration run.

## Development workflow

```bash
# Backend (outside docker)
cd backend && npm install && npm run start:dev

# Frontend (outside docker)
cd frontend && npm install && npm run dev

# Lint
(cd backend && npm run lint)
(cd frontend && npm run lint)

# Typecheck
(cd frontend && npm run typecheck)
```

## Compliance notes

- Terms-of-service and privacy consent are captured at registration and
  written to the `consents` table.
- Under-18 profiles can be flagged as `guardian_required` and hidden via
  `visibility_level`.
- Every mutating request is audited into `audit_logs` via
  `AuditInterceptor` for GDPR / safeguarding reviews.
- Psychometric responses are private by default; the user controls
  `visibility` on their `psych_assessments` row.

## Roadmap

1. ~~Project scaffold + database (25+ tables, 100 psych questions, indexes).~~
2. ~~Auth + profiles (this PR).~~
3. Needs / applications / shortlists.
4. Media uploads (MinIO + signed URLs) + psych assessment runner.
5. AI scouting (video ingest → tracking → events → reports).
6. Verification workflows + Stripe subscriptions.
