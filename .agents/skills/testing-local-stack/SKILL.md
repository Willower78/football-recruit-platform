# Testing: Football Recruit Platform Local Stack

## Overview
The platform runs 5 Docker services: Postgres (PostGIS), Redis, MinIO, NestJS backend, Next.js frontend.

## Prerequisites
- Docker and Docker Compose installed
- `.env` file at repo root (copy from `.env.example`)

## Starting the Stack
```bash
cp -n .env.example .env || true
docker-compose up --build -d
```
First build takes ~2 minutes. Subsequent builds use cache (~10s).

## Service URLs
| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:3000 | Next.js dev server |
| Backend API | http://localhost:3001 | NestJS |
| Swagger docs | http://localhost:3001/api/docs | Interactive API explorer |
| MinIO console | http://localhost:9001 | S3-compatible storage UI |
| Health check | http://localhost:3001/health | Returns `{"status":"ok"}` |

## Default Credentials
| Service | Username/Email | Password |
|---------|---------------|----------|
| Admin user | `admin@footballrecruit.com` | `ChangeMe123!` |
| MinIO console | `minioadmin` | `minioadmin` |

## Devin Secrets Needed
No external secrets required — all credentials are local dev defaults in `.env.example`.

## Key Test Flows

### 1. Verify migrations and seeds ran
```bash
docker exec frp-postgres psql -U frp -d football_recruit -c "SELECT count(*) FROM psych_questions;"
# Expected: 100
docker exec frp-postgres psql -U frp -d football_recruit -c "SELECT email, role FROM users WHERE role='admin';"
# Expected: admin@footballrecruit.com | admin
```

### 2. Admin login flow
1. Navigate to http://localhost:3000/auth/login
2. Enter `admin@footballrecruit.com` / `ChangeMe123!`
3. Click "Sign in"
4. Should redirect to `/dashboard/admin` with "Admin" heading and stat cards

### 3. Registration flow
1. Navigate to http://localhost:3000/auth/register (or click "I'm a player" / "I'm a club" on landing)
2. Fill in email, password, name, accept terms
3. Should redirect to role-specific onboarding

### 4. Search page
1. Navigate to http://localhost:3000/search
2. Toggle between Players/Clubs
3. Use position and country filters
4. Click Search — results come from backend API

## Reset Everything
```bash
docker-compose down -v
docker-compose up --build -d
```
The `-v` flag removes all volumes (DB data, Redis, MinIO files, node_modules caches).

## Troubleshooting
- **Backend won't start:** Check `docker-compose logs backend` — often a TypeORM connection issue. Ensure Postgres health check passes first.
- **Frontend shows blank page:** Check `docker-compose logs frontend` for Next.js compilation errors.
- **Database has no tables:** The `database/docker-init.sh` script might not be mounted correctly. Check `docker-compose logs postgres` for init output. The Postgres entrypoint does NOT recurse into subdirectories — the init script handles this.
- **Port conflicts:** Stop conflicting services or edit ports in `docker-compose.yml`.
