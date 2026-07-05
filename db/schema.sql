-- Desired-state schema (DDL only — no seed data).
-- Atlas uses this file as the source of truth for `atlas migrate diff`.
-- Do NOT add SET search_path here; the search path is set via the connection URL.

CREATE TYPE "sex" AS ENUM (
  'male',
  'female'
);

CREATE TYPE "adventurer_class" AS ENUM (
  'little_lambs',
  'eager_beavers',
  'busy_bees',
  'sunbeams',
  'builders',
  'helping_hands'
);

CREATE TYPE "award_type" AS ENUM (
  'star',
  'chip',
  'award',
  'florida',
  'chesapeake',
  'patch',
  'pin',
  'other'
);

CREATE TYPE "grade_level" AS ENUM (
  'pre-k',
  'k',
  '1st',
  '2nd',
  '3rd',
  '4th',
  '5th'
);

CREATE TYPE "staff_role" AS ENUM (
  'director',
  'associate_director',
  'instructor',
  'secretary',
  'treasurer',
  'chaplain',
  'counselor',
  'cook',
  'general_staff'
);

CREATE TABLE "staff" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "email" varchar,
  "phone" varchar,
  "background_check_expiration" timestamp,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "parents" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "email" varchar,
  "phone" varchar,
  "address" varchar,
  "is_emergency_contact" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "children" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "allergies" varchar,
  "medical_conditions" varchar,
  "physical_restrictions" varchar,
  "sex" sex,
  "date_of_birth" timestamp,
  "grade" grade_level,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "parents_children" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "parent_id" integer NOT NULL,
  "child_id" integer NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "awards" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "name" varchar,
  "level" adventurer_class,
  "patch_image_url" varchar,
  "link" varchar,
  "type" award_type,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "club_years" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "start_date" timestamp,
  "club_name" varchar,
  "church_name" varchar,
  "end_date" timestamp,
  "label" varchar UNIQUE,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "club_years_staff" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "club_year_id" integer NOT NULL,
  "staff_id" integer NOT NULL,
  "staff_role" staff_role,
  "created_at" timestamp DEFAULT (now()),
  UNIQUE ("club_year_id", "staff_id")
);

CREATE TABLE "classes" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "class" adventurer_class,
  "club_year_id" integer NOT NULL,
  "instructor_id" integer NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "events" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "club_year_id" integer NOT NULL,
  "title" varchar,
  "award_ceremony" boolean NOT NULL DEFAULT false,
  "event_date" timestamp,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "events_awards" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "award_id" integer NOT NULL,
  "event_id" integer NOT NULL,
  "class_id" integer NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "classes_children" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "club_year_id" integer NOT NULL,
  "class_id" integer NOT NULL,
  "child_id" integer NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "events_children" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "event_id" integer NOT NULL,
  "child_id" integer NOT NULL,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "awards_children" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "award_id" integer NOT NULL,
  "child_id" integer NOT NULL,
  "event_id" integer,
  "award_ceremony_id" integer,
  "awarded_on" timestamp,
  "created_at" timestamp DEFAULT (now())
);

-- Better Auth tables

CREATE TABLE "user" (
  "id"            text PRIMARY KEY,
  "name"          text NOT NULL,
  "email"         text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image"         text,
  "createdAt"     timestamp NOT NULL DEFAULT now(),
  "updatedAt"     timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "session" (
  "id"        text PRIMARY KEY,
  "token"     text NOT NULL UNIQUE,
  "expiresAt" timestamp NOT NULL,
  "ipAddress" text,
  "userAgent" text,
  "userId"    text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "account" (
  "id"           text PRIMARY KEY,
  "accountId"    text NOT NULL,
  "providerId"   text NOT NULL,
  "userId"       text NOT NULL REFERENCES "user" ("id") ON DELETE CASCADE,
  "accessToken"            text,
  "refreshToken"           text,
  "idToken"                text,
  "expiresAt"              timestamp,
  "accessTokenExpiresAt"   timestamp,
  "refreshTokenExpiresAt"  timestamp,
  "scope"                  text,
  "password"               text,
  "createdAt"    timestamp NOT NULL DEFAULT now(),
  "updatedAt"    timestamp NOT NULL DEFAULT now()
);

CREATE TABLE "verification" (
  "id"         text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value"      text NOT NULL,
  "expiresAt"  timestamp NOT NULL,
  "createdAt"  timestamp NOT NULL DEFAULT now(),
  "updatedAt"  timestamp NOT NULL DEFAULT now()
);

ALTER TABLE "parents_children" ADD FOREIGN KEY ("parent_id") REFERENCES "parents" ("id");

ALTER TABLE "parents_children" ADD FOREIGN KEY ("child_id") REFERENCES "children" ("id");

ALTER TABLE "club_years_staff" ADD FOREIGN KEY ("club_year_id") REFERENCES "club_years" ("id");

ALTER TABLE "club_years_staff" ADD FOREIGN KEY ("staff_id") REFERENCES "staff" ("id");

ALTER TABLE "classes" ADD CONSTRAINT "classes_class_club_year_id_key" UNIQUE ("class", "club_year_id");

ALTER TABLE "classes" ADD FOREIGN KEY ("club_year_id") REFERENCES "club_years" ("id");

ALTER TABLE "classes_children" ADD CONSTRAINT "classes_children_club_year_id_child_id_key" UNIQUE ("club_year_id", "child_id");

ALTER TABLE "classes" ADD FOREIGN KEY ("instructor_id") REFERENCES "staff" ("id");

ALTER TABLE "events" ADD FOREIGN KEY ("club_year_id") REFERENCES "club_years" ("id");

ALTER TABLE "events_awards" ADD FOREIGN KEY ("award_id") REFERENCES "awards" ("id");

ALTER TABLE "events_awards" ADD FOREIGN KEY ("event_id") REFERENCES "events" ("id");

ALTER TABLE "events_awards" ADD FOREIGN KEY ("class_id") REFERENCES "classes" ("id");

ALTER TABLE "classes_children" ADD FOREIGN KEY ("club_year_id") REFERENCES "club_years" ("id");

ALTER TABLE "classes_children" ADD FOREIGN KEY ("class_id") REFERENCES "classes" ("id");

ALTER TABLE "classes_children" ADD FOREIGN KEY ("child_id") REFERENCES "children" ("id");

ALTER TABLE "events_children" ADD FOREIGN KEY ("event_id") REFERENCES "events" ("id");

ALTER TABLE "events_children" ADD FOREIGN KEY ("child_id") REFERENCES "children" ("id");

ALTER TABLE "events_children" ADD UNIQUE ("event_id", "child_id");

ALTER TABLE "awards_children" ADD FOREIGN KEY ("award_id") REFERENCES "awards" ("id");

ALTER TABLE "awards_children" ADD FOREIGN KEY ("child_id") REFERENCES "children" ("id");

ALTER TABLE "awards_children" ADD FOREIGN KEY ("event_id") REFERENCES "events" ("id");

ALTER TABLE "awards_children" ADD FOREIGN KEY ("award_ceremony_id") REFERENCES "events" ("id");

ALTER TABLE "awards_children" ADD UNIQUE ("award_id", "child_id");
