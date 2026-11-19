SET search_path TO adv_db;

-- Modify "staff" table
ALTER TABLE "staff" ADD COLUMN "certificate_url" character varying NULL;
