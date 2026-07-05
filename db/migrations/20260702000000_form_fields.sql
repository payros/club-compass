-- Migration: add church_name to club_years, grade/physical_restrictions to children, is_emergency_contact to parents
SET search_path TO adv_db;

CREATE TYPE "grade_level" AS ENUM ('pre-k', 'k', '1st', '2nd', '3rd', '4th', '5th');

ALTER TABLE "club_years" ADD COLUMN "church_name" varchar;
ALTER TABLE "children" ADD COLUMN "grade" grade_level;
ALTER TABLE "children" ADD COLUMN "physical_restrictions" varchar;
ALTER TABLE "parents" ADD COLUMN "is_emergency_contact" boolean NOT NULL DEFAULT false;
