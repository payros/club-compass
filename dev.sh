#!/bin/bash
set -e

# Usage: ./dev.sh [--sample-data|-s]
#   --sample-data  Load dev sample data after migrations (db/sample-data.sql)

# Parse flags
SAMPLE_DATA=false
for arg in "$@"; do
  case $arg in
    --sample-data|-s) SAMPLE_DATA=true ;;
  esac
done

# Load .env so we can reference POSTGRES_USER / POSTGRES_DATABASE for health checks
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Stop all running containers
docker kill $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Create the Docker network if it doesn't exist
docker network create my_network 2>/dev/null || true

# Build and start containers in detached mode.
# --renew-anon-volumes ensures postgres starts with a clean volume.
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d --renew-anon-volumes

# Wait for postgres to be ready
echo "Waiting for postgres..."
until docker exec postgres pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DATABASE}" -q 2>/dev/null; do
  sleep 1
done
echo "Postgres is ready."

# Apply all pending migrations
atlas migrate apply --dir "file://db/migrations" --url "$ATLAS_DB_URL"

# Optionally load sample data
if [ "$SAMPLE_DATA" = true ]; then
  echo "Loading sample data..."
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h localhost -p 5433 -U "$POSTGRES_USER" -d "$POSTGRES_DATABASE" -f db/sample-data.sql
fi

# Follow logs (Ctrl+C detaches; containers keep running)
docker compose -f docker-compose.dev.yml logs -f
