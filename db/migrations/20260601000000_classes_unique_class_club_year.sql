-- Migration: add unique constraint on (class, club_year_id) to support upsert
SET search_path TO adv_db;

ALTER TABLE "classes" ADD CONSTRAINT "classes_class_club_year_id_key" UNIQUE ("class", "club_year_id");
