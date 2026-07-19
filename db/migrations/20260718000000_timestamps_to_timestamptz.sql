-- Migration: convert all timestamp columns to timestamptz
-- User-populated date values are interpreted as America/New_York (DST-aware)
-- System timestamps (created_at, updated_at, expiresAt, etc.) are interpreted as UTC
SET search_path TO adv_db;

-- User-populated dates (re-interpret as Eastern)
ALTER TABLE "staff"
  ALTER COLUMN "background_check_expiration" TYPE timestamptz
  USING "background_check_expiration" AT TIME ZONE 'America/New_York';

ALTER TABLE "children"
  ALTER COLUMN "date_of_birth" TYPE timestamptz
  USING "date_of_birth" AT TIME ZONE 'America/New_York';

ALTER TABLE "club_years"
  ALTER COLUMN "start_date" TYPE timestamptz
  USING "start_date" AT TIME ZONE 'America/New_York';

ALTER TABLE "club_years"
  ALTER COLUMN "end_date" TYPE timestamptz
  USING "end_date" AT TIME ZONE 'America/New_York';

ALTER TABLE "events"
  ALTER COLUMN "event_date" TYPE timestamptz
  USING "event_date" AT TIME ZONE 'America/New_York';

ALTER TABLE "awards_children"
  ALTER COLUMN "awarded_on" TYPE timestamptz
  USING "awarded_on" AT TIME ZONE 'America/New_York';

-- System timestamps (keep as UTC)
ALTER TABLE "staff"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "parents"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "children"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "parents_children"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "awards"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "club_years"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "club_years_staff"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "classes"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "events"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "events_awards"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "classes_children"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "events_children"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

ALTER TABLE "awards_children"
  ALTER COLUMN "created_at" TYPE timestamptz
  USING "created_at" AT TIME ZONE 'UTC';

-- Better Auth tables
ALTER TABLE "user"
  ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC';

ALTER TABLE "session"
  ALTER COLUMN "expiresAt"  TYPE timestamptz USING "expiresAt"  AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt"  TYPE timestamptz USING "createdAt"  AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt"  TYPE timestamptz USING "updatedAt"  AT TIME ZONE 'UTC';

ALTER TABLE "account"
  ALTER COLUMN "expiresAt"             TYPE timestamptz USING "expiresAt"             AT TIME ZONE 'UTC',
  ALTER COLUMN "accessTokenExpiresAt"  TYPE timestamptz USING "accessTokenExpiresAt"  AT TIME ZONE 'UTC',
  ALTER COLUMN "refreshTokenExpiresAt" TYPE timestamptz USING "refreshTokenExpiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt"             TYPE timestamptz USING "createdAt"             AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt"             TYPE timestamptz USING "updatedAt"             AT TIME ZONE 'UTC';

ALTER TABLE "verification"
  ALTER COLUMN "expiresAt" TYPE timestamptz USING "expiresAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "createdAt" TYPE timestamptz USING "createdAt" AT TIME ZONE 'UTC',
  ALTER COLUMN "updatedAt" TYPE timestamptz USING "updatedAt" AT TIME ZONE 'UTC';
