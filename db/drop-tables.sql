-- Drop all tables in the adv_db schema.
-- This is a utility script. Not being loaded automatically by anything. Use with caution.

SET search_path TO adv_db;

DROP TABLE IF EXISTS
  awards_children,
  events_children,
  events_awards,
  classes_children,
  classes,
  events,
  club_years_staff,
  club_years,
  parents_children,
  children,
  parents,
  staff,
  verification,
  awards,
  account,
  session,
  "user"
CASCADE;
