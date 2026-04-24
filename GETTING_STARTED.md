# Getting Started

## Prerequisites
- Docker and Docker Compose installed ([Install Docker](https://docs.docker.com/get-docker/))
- Git

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/Willower78/football-recruit-platform.git
   cd football-recruit-platform
   ```

2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

3. Start all services:
   ```bash
   docker-compose up --build
   ```

4. Wait for all services to start (first build takes longer), then open:
   - **Frontend:** http://localhost:3000
   - **API docs:** http://localhost:3001/api/docs
   - **MinIO console:** http://localhost:9001 (login: `minioadmin` / `minioadmin`)

5. Default admin login:
   - **Email:** `admin@footballrecruit.com`
   - **Password:** `ChangeMe123!`

## What happens on first boot

| Step | What runs |
| ---- | --------- |
| **Postgres** | Starts, then executes `database/docker-init.sh` which applies all 26 SQL migration files from `database/migrations/` and seeds from `database/seeds/` (100 psych questions + admin user). |
| **Redis** | Starts on port 6379. |
| **MinIO** | Starts S3-compatible storage (API on 9000, console on 9001). |
| **Backend** | Waits for Postgres & Redis health checks, then starts NestJS in watch mode on port 3001. |
| **Frontend** | Waits for the backend, then starts Next.js dev server on port 3000. |

## What you can do
- Register as a **Player** → complete onboarding → see your dashboard
- Register as a **Club** → complete onboarding → see your dashboard
- Log in as **admin** → see the admin dashboard
- Browse `/search` to see the search/filter page
- Visit `/api/docs` to explore all API endpoints

## Stopping

```bash
docker-compose down
```

## Reset database (start fresh)

```bash
docker-compose down -v
docker-compose up --build
```

The `-v` flag removes all named volumes (Postgres data, Redis data, MinIO files, and `node_modules` caches), so the next `up --build` re-runs migrations and seeds from scratch.

## Troubleshooting

- **Port conflicts** — If ports 3000, 3001, 5432, 6379, 9000, or 9001 are already in use, stop the conflicting services or change the ports in `docker-compose.yml` and `.env`.
- **Database has no tables** — Check that `database/docker-init.sh` is mounted correctly in the postgres service. Run `docker-compose logs postgres` to see init output.
- **Backend/frontend errors** — Run `docker-compose logs backend` or `docker-compose logs frontend` to see service logs.
- **Stale data after schema changes** — Run `docker-compose down -v && docker-compose up --build` to reset everything.
