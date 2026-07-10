-- Migration: add unique constraint on parents_children (parent_id, child_id)
-- to prevent duplicate parent-child relationship records.

ALTER TABLE adv_db.parents_children
  ADD CONSTRAINT parents_children_parent_id_child_id_key UNIQUE (parent_id, child_id);
