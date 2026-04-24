#!/bin/bash
# ---------------------------------------------------------------------------
# Runs all numbered SQL migration and seed files in order.
# The postgres Docker entrypoint does NOT recurse into subdirectories, so this
# wrapper script handles it.
# ---------------------------------------------------------------------------
set -euo pipefail

echo "=== Running database migrations ==="
for f in /docker-entrypoint-initdb.d/10-migrations/*.sql; do
  [ -f "$f" ] || continue
  echo "  -> $(basename "$f")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done

echo "=== Running seed data ==="
for f in /docker-entrypoint-initdb.d/20-seeds/*.sql; do
  [ -f "$f" ] || continue
  echo "  -> $(basename "$f")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$f"
done

echo "=== Database init complete ==="
