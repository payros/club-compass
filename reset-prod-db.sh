#!/bin/bash
set -e

# ---------------------------------------------------------------------------
# reset-prod-db.sh
#
# 1. Drops the adv_db schema.
# 2. Re-runs the four SQL init scripts in order:
#      01-configuration.sql
#      02-schema.sql
#      03-seed-data.sql
#      04-sample-data.sql
#
# Runs non-interactively inside the prod Docker build.
# DATABASE_URL must be set as a build ARG / ENV.
# ---------------------------------------------------------------------------

if [ -z "$DATABASE_URL" ]; then
  echo "❌  DATABASE_URL is not set."
  exit 1
fi

SQL_DIR="/app/postgres"

# ---------------------------------------------------------------------------
# Step 1 — Drop the existing schema
# ---------------------------------------------------------------------------
echo ""
echo "🗑️   Dropping adv_db schema..."
psql "$DATABASE_URL" -c "DROP SCHEMA IF EXISTS adv_db CASCADE;"
echo "✅  Schema dropped."

# ---------------------------------------------------------------------------
# Step 2 — Re-run init scripts in order
# ---------------------------------------------------------------------------
echo ""
echo "🚀  Running init scripts..."

for FILE in \
  "$SQL_DIR/01-configuration.sql" \
  "$SQL_DIR/02-schema.sql" \
  "$SQL_DIR/03-seed-data.sql"
do
  echo "   ▶  $(basename "$FILE")"
  psql "$DATABASE_URL" -f "$FILE"
done

echo ""
echo "✅  Database reset complete."
