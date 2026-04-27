# Testing the Apex Draft Platform Locally

## Prerequisites

All 5 services must be running via Docker Compose:
```bash
cd /home/ubuntu/repos/football-recruit-platform
docker-compose up -d --build
```

Verify with: `docker-compose ps` — expect: frp-postgres, frp-redis, frp-minio, frp-backend, frp-frontend all "Up".

## Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger docs | http://localhost:3001/api/docs |
| MinIO console | http://localhost:9001 |

## Devin Secrets Needed

None — all credentials are local development defaults hardcoded in the seed data.

## Credentials

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin/Owner | admin@footballrecruit.com | ChangeMe123! | admin |
| MinIO | minioadmin | minioadmin | storage admin |

Additional test accounts can be created via `/auth/register` — use role `player` or `club`.

## Key Pages to Test

- **Landing page**: `/` — Logo, motto badge, hero text, CTAs
- **Login**: `/auth/login` — Logo, form, navy button
- **Registration**: `/auth/register` — Player or Club signup
- **Search**: `/search` — Players/Clubs toggle, filters, search button. Works WITHOUT auth.
- **Admin/Owner Dashboard**: `/dashboard/admin` — Requires admin login. Shows analytics stats, registration chart, recent users.
- **Player Dashboard**: `/dashboard/player` — Requires player login
- **Club Dashboard**: `/dashboard/club` — Requires club login

## Testing Patterns

### Testing unauthenticated flows
Clear browser storage before testing public pages:
```javascript
localStorage.clear(); sessionStorage.clear(); window.location.href = '/';
```

### Testing the search page
The search page (`/search`) calls `/players` and `/clubs` with `skipAuth: true`. To verify the search fix works:
1. Clear localStorage (remove any stale tokens)
2. Navigate to `/search`
3. Click "Search" — should show player results
4. Switch to "Clubs" tab, click "Search" — should show club results

**Known behavior**: Switching between Players/Clubs tabs does NOT auto-search. You must click "Search" again after switching tabs. Stale results from the previous mode may display with wrong formatting until you re-search.

### Testing the Owner Dashboard
1. Log in with admin credentials
2. Auto-redirects to `/dashboard/admin`
3. Verify stat values against known DB state
4. Check that the registration chart shows formatted dates (not ISO timestamps)
5. Recent Users table should show all users sorted by newest first

### Testing analytics API security
```bash
# Should return 401 (not 200)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/analytics/overview

# Should return 200 with data
TOKEN=$(curl -s http://localhost:3001/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@footballrecruit.com","password":"ChangeMe123!"}' | \
  python3 -c "import sys,json;print(json.load(sys.stdin)['accessToken'])")
curl -s http://localhost:3001/analytics/overview -H "Authorization: Bearer $TOKEN"
```

## Rebuilding After Code Changes

```bash
# Backend only
docker-compose up -d --build backend

# Frontend only
docker-compose up -d --build frontend

# Full rebuild
docker-compose up -d --build
```

Wait ~10 seconds after rebuild for NestJS to connect to Postgres and Redis.

## Reset Database

```bash
docker-compose down -v
docker-compose up -d --build
```

This re-runs all migrations and seeds (admin user + 100 psych questions).

## Common Issues

- **Browser redirects to /auth/login unexpectedly**: Stale auth token in localStorage. Clear storage.
- **Search returns empty results**: Check that `@Public()` decorator is on the `GET /players` and `GET /clubs` controller methods. The global `JwtAuthGuard` blocks everything without it.
- **Analytics returns 500**: Check backend logs with `docker logs frp-backend`. Common cause: SQL syntax errors in TypeORM query builder (especially INTERVAL queries).
- **Frontend shows old code after rebuild**: Next.js may cache. Try `docker-compose down` then `up --build` for a clean start.
