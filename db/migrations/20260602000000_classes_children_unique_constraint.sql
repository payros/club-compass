-- Migration: add unique constraint on (club_year_id, child_id) to prevent duplicate enrollments
SET search_path TO adv_db;

ALTER TABLE "classes_children" ADD CONSTRAINT "classes_children_club_year_id_child_id_key" UNIQUE ("club_year_id", "child_id");
