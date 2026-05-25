-- Clear all rows in adv_db schema

SET search_path TO adv_db;

TRUNCATE TABLE
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
  account,
  session,
  "user"
RESTART IDENTITY CASCADE;
