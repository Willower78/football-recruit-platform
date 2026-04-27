# Testing Apex Draft Platform

## Environment Setup

### Start All Services
```bash
cd /home/ubuntu/repos/football-recruit-platform
docker-compose up --build -d
```

Wait ~30s for all services to be healthy. Verify with:
```bash
docker-compose ps
```

All 5 services should be running:
- `frp-postgres` (port 5432)
- `frp-redis` (port 6379)
- `frp-minio` (ports 9000, 9001)
- `frp-backend` (port 3001)
- `frp-frontend` (port 3000)

### Verify Backend
```bash
curl -s http://localhost:3001/social/feed | jq .
```
Should return `{"items": [...], "total": N, "page": 1, "limit": 20}`

### Reset Database (if needed)
```bash
docker-compose down -v && docker-compose up --build -d
```
This wipes all data and re-runs migrations + seeds.

## Credentials

- **Admin login:** `admin@footballrecruit.com` / `ChangeMe123!`
- **MinIO console:** `minioadmin` / `minioadmin` at http://localhost:9001
- **Swagger docs:** http://localhost:3001/api/docs

## Devin Secrets Needed

No external secrets required for local testing. All credentials are seeded defaults.

## Key URLs

| Page | URL | Auth Required |
|------|-----|---------------|
| Landing | http://localhost:3000 | No |
| Feed | http://localhost:3000/feed | No (read), Yes (post) |
| Chat | http://localhost:3000/chat | Yes |
| Search | http://localhost:3000/search | No |
| Login | http://localhost:3000/auth/login | No |
| Admin Dashboard | http://localhost:3000/dashboard/admin | Yes (admin) |
| API Docs | http://localhost:3001/api/docs | No |

## Testing Flows

### Social Feed
1. Navigate to `/feed` — unauthenticated users see posts but NO creation form
2. Log in → textarea "Share an update with the community..." appears
3. Type content + click "Post" → post appears at top of feed
4. Click ♡ → toggles to ♥ with count +1; click again → reverts
5. Click 💬 → expands comment section with input field
6. Type comment + "Send" → comment appears with author email

### Chat
1. Navigate to `/chat` unauthenticated → shows "Please log in to access chat."
2. Navigate logged in → two-panel layout:
   - Left: "No conversations yet. Visit a profile and send a message!"
   - Right: "Select a conversation to start chatting"
3. Chat uses Socket.io on `/chat` namespace with JWT auth via `tokenStore.access`

### Navigation
Header always shows: Feed, Chat, Search links. When logged in, avatar dropdown appears with Dashboard + Log out.

## Known Issues / Gotchas

- **JWT env var:** Backend uses `JWT_ACCESS_SECRET` (default: `dev_access_secret_change_me`). If chat WebSocket auth fails, check this is consistent across all modules.
- **Comment count:** The 💬 counter on post cards may not update in real-time after adding a comment within the same page view. It updates correctly on page reload. This is a minor client-side UX issue.
- **TypeORM queries:** Use TypeORM property names (e.g. `createdAt`) not column names (e.g. `created_at`) in query builder `orderBy` calls.
- **Docker init:** Postgres entrypoint doesn't recurse subdirectories. The `database/docker-init.sh` script handles running migrations from `database/migrations/`.
- **Auth state:** The frontend stores tokens in a `tokenStore` object (not cookies). Navigating between pages preserves auth state via React context + localStorage.
