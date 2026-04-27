# Testing Apex Draft Platform

## Devin Secrets Needed
No external secrets required — all credentials are local/seeded.

## Local Environment

### Starting Services
```bash
cd /home/ubuntu/repos/football-recruit-platform
cp -n .env.example .env || true
docker-compose up --build -d
```

Wait ~30s for all 5 services to become healthy (postgres, redis, minio, backend, frontend).

### Service URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Swagger docs:** http://localhost:3001/api/docs
- **MinIO console:** http://localhost:9001

### Credentials
- **Admin login:** admin@footballrecruit.com / ChangeMe123!
- **MinIO:** minioadmin / minioadmin

### Key Pages to Test
| Page | URL | What to verify |
|------|-----|----------------|
| Landing | / | Logo, motto, heading, CTA buttons, feature cards |
| Login | /auth/login | Logo above form, sign-in button styling |
| Register | /auth/register | Role selection (player/club), form flow |
| Admin dashboard | /dashboard/admin | Sidebar branding, stat cards, quick links |
| Player dashboard | /dashboard/player | After player registration + onboarding |
| Club dashboard | /dashboard/club | After club registration + onboarding |
| Search | /search | Filter UI (currently has pre-existing auth bug on API calls) |
| Swagger | localhost:3001/api/docs | API title, endpoint groups |

## Testing Tips

- If redirected to /auth/login unexpectedly, clear localStorage: `localStorage.clear()` in browser console, then navigate to `/`
- The search page (`/search`) has a known pre-existing issue: the `/players` and `/clubs` API endpoints require auth but the search page calls them without tokens. This is NOT a regression — it existed before the rebrand.
- After system restarts, Docker services auto-restart (restart: unless-stopped). If they don't come up, run `docker-compose up -d`.
- The frontend uses Next.js dev mode — first page load after container start may take 5-10s to compile.
- Logo file is at `frontend/public/logo.png` (1.3MB PNG with transparent background).

## Branding (as of Apex Draft rebrand)
- **Primary color (navy):** HSL 211 55% 23% (~#1B3A5C)
- **Accent color (gold):** HSL 38 79% 56% (~#E8A838)
- **Site name:** "Apex Draft" (appears in header, sidebar, browser tab)
- **Motto:** "Talent is everywhere, opportunity is not" (gold badge on landing page)
- **No remaining references** to "Football Recruit" in the UI

## Reset Database
```bash
docker-compose down -v && docker-compose up --build -d
```
This re-runs all migrations and seeds from scratch.

## Lint & Typecheck
```bash
(cd backend && npm run lint)
(cd frontend && npm run lint)
(cd frontend && npm run typecheck)
```
