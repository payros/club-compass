SET search_path TO adv_db;

-- Add grade to classes_children so it can be tracked per club year
ALTER TABLE "classes_children" ADD COLUMN "grade" grade_level NULL;

-- Migrate existing grade data from children to classes_children
UPDATE classes_children cc
SET grade = ch.grade
FROM children ch
WHERE cc.child_id = ch.id
  AND ch.grade IS NOT NULL;

-- Remove grade from children
ALTER TABLE "children" DROP COLUMN "grade";
