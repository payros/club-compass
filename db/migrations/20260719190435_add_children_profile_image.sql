SET search_path TO adv_db;

-- Modify "children" table
ALTER TABLE "children" ADD COLUMN "profile_image_url" character varying NULL;
