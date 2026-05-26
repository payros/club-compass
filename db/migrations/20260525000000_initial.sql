-- Initial migration: full schema + seed data
-- Generated: 2026-05-25
CREATE SCHEMA IF NOT EXISTS adv_db;
SET search_path TO adv_db;

-- Types

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

-- Tables

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
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "children" (
  "id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  "first_name" varchar NOT NULL,
  "last_name" varchar NOT NULL,
  "allergies" varchar,
  "medical_conditions" varchar,
  "sex" sex,
  "date_of_birth" timestamp,
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

-- Foreign keys

ALTER TABLE "parents_children" ADD FOREIGN KEY ("parent_id") REFERENCES "parents" ("id");

ALTER TABLE "parents_children" ADD FOREIGN KEY ("child_id") REFERENCES "children" ("id");

ALTER TABLE "club_years_staff" ADD FOREIGN KEY ("club_year_id") REFERENCES "club_years" ("id");

ALTER TABLE "club_years_staff" ADD FOREIGN KEY ("staff_id") REFERENCES "staff" ("id");

ALTER TABLE "classes" ADD FOREIGN KEY ("club_year_id") REFERENCES "club_years" ("id");

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

-- Seed data

INSERT INTO awards (name, level, "link", type) 
VALUES
    -- Little Lamb Stars
    ('ABC''s','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/ABC%27s','star'),
    ('Bible Friends','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bible_Friends','star'),
    ('Bodies of Water','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bodies_of_Water','star'),
    ('Colors','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Colors','star'),
    ('Community Helper','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Community_Helper','star'),
    ('Finger Play','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Finger_Play','star'),
    ('Healthy Food','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Healthy_Food','star'),
    ('Healthy Me','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Healthy_Me','star'),
    ('Insects','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Insects','star'),
    ('Little Boy Jesus','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Little_Boy_Jesus','star'),
    ('Music','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Music','star'),
    ('My Friend Jesus','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/My_Friend_Jesus','star'),
    ('Numbers','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Numbers','star'),
    ('Sharing','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Sharing','star'),
    ('Special Helper','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Special_Helper','star'),
    ('Stars','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Stars','star'),
    ('Trains And Trucks','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Trains_And_Trucks','star'),
    ('Trikes & Bikes','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Trikes_%26_Bikes','star'),
    ('Weather','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Weather','star'),
    ('Wooly Lamb','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Wooly_Lamb','star'),
    ('Zoo Animals','little_lambs','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Zoo_Animals','star'),
    -- Eager Beaver Chips
    ('Alphabet Fun','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Alphabet_Fun','chip'),
    ('Animal Homes','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Animal_Homes','chip'),
    ('Animals','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Animals','chip'),
    ('Beaver','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Beaver','chip'),
    ('Beginning Biking','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Beginning_Biking','chip'),
    ('Beginning Swimming','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Beginning_Swimming','chip'),
    ('Bible Friends (EB)','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bible_Friends_(EB)','chip'),
    ('Birds','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Birds','chip'),
    ('Crayons And Markers','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Crayons_And_Markers','chip'),
    ('Fire Safety','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Fire_Safety','chip'),
    ('Gadgets And Sand','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Gadgets_And_Sand','chip'),
    ('God''s World','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/God%27s_World','chip'),
    ('Helping at Home','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Helping_at_Home','chip'),
    ('Jesus'' Special Helper','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Jesus%27_Special_Helper','chip'),
    ('Jesus''s Special Supper','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Jesus%E2%80%99s_Special_Supper','chip'),
    ('Jesus'' Star','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Jesus%27_Star','chip'),
    ('Jigsaw Puzzle','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Jigsaw_Puzzle','chip'),
    ('Know Your Body','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Know_Your_Body','chip'),
    ('Left And Right','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Left_And_Right','chip'),
    ('Manners Fun','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Manners_Fun','chip'),
    ('My Community Friends','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/My_Community_Friends','chip'),
    ('Pets','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Pets','chip'),
    ('Playing With Friends','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Playing_With_Friends','chip'),
    ('Scavenger Hunt','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Scavenger_Hunt','chip'),
    ('Shapes And Sizes','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Shapes_And_Sizes','chip'),
    ('Sponge Art','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Sponge_Art','chip'),
    ('Stamping Fun','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Stamping_Fun','chip'),
    ('Thankful Heart','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Thankful_Heart','chip'),
    ('Toys','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Toys','chip'),
    -- Busy Bee Awards
    ('Artist','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Artist','award'),
    ('Bible I','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bible_I','award'),
    ('Butterfly','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Butterfly','award'),
    ('Buttons','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Buttons','award'),
    ('Fish','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Fish','award'),
    ('Flowers','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Flowers','award'),
    ('Friend of Animals','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Friend_of_Animals','award'),
    ('Guide','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Guide','award'),
    ('Health Specialist','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Health_Specialist','award'),
    ('Home Helper','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Home_Helper','award'),
    ('Music Maker','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Music_Maker','award'),
    ('Potato','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Potato','award'),
    ('Reading I','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Reading_I','award'),
    ('Safety Specialist','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Safety_Specialist','award'),
    ('Sand Art','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Sand_Art','award'),
    ('Spotter','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Spotter','award'),
    ('Swimmer I','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Swimmer_I','award'),
    -- Sunbeam Awards
    ('Acts of Kindness','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Acts_of_Kindness','award'),
    ('Baking','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Baking','award'),
    ('Camper','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Camper','award'),
    ('Collector','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Collector','award'),
    ('Cooking Fun','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Cooking_Fun','award'),
    ('Courtesy','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Courtesy','award'),
    ('Feathered Friends','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Feathered_Friends','award'),
    ('Fitness Fun','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Fitness_Fun','award'),
    ('Friend of Jesus','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Friend_of_Jesus','award'),
    ('Friend of Nature','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Friend_of_Nature','award'),
    ('Gardener','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Gardener','award'),
    ('Glue Right','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Glue_Right','award'),
    ('Handicraft','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Handicraft','award'),
    ('Ladybugs','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Ladybugs','award'),
    ('Missionaries','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Missionaries','award'),
    ('Reading II','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Reading_II','award'),
    ('Road Safety','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Road_Safety','award'),
    ('Seasons','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Seasons','award'),
    ('Seeds','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Seeds','award'),
    ('Trees','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Trees','award'),
    ('Whales','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Whales','award'),
    -- Builder Awards
    ('Astronomer','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Astronomer','award'),
    ('Bead Craft','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bead_Craft','award'),
    ('Build & Fly','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Build_%26_Fly','award'),
    ('Building Blocks','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Building_Blocks','award'),
    ('Cyclist','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Cyclist','award'),
    ('Disciples','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Disciples','award'),
    ('Early Adventist Pioneer','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Early_Adventist_Pioneer','award'),
    ('Family Helper','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Family_Helper','award'),
    ('First Aid Helper','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/First_Aid_Helper','award'),
    ('Gymnast','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Gymnast','award'),
    ('Hand Shadows','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Hand_Shadows','award'),
    ('Homecraft','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Homecraft','award'),
    ('Honey','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Honey','award'),
    ('Lizards','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Lizards','award'),
    ('Magnet Fun','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Magnet_Fun','award'),
    ('Magnet Fun II','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Magnet_Fun_II','award'),
    ('Media Critic','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Media_Critic','award'),
    ('Olympics','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Olympics','award'),
    ('Postcards','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Postcards','award'),
    ('Prayer','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Prayer','award'),
    ('Reading III','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Reading_III','award'),
    ('Saving Animals','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Saving_Animals','award'),
    ('Sewing Fun','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Sewing_Fun','award'),
    ('Swimmer II','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Swimmer_II','award'),
    ('Temperance','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Temperance','award'),
    ('Tin Can Fun','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Tin_Can_Fun','award'),
    ('Troubadour','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Troubadour','award'),
    ('Wise Steward','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Wise_Steward','award'),
    -- Helping Hand Awards
    ('Basket Maker','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Basket_Maker','award'),
    ('Bible II','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bible_II','award'),
    ('Bible Royalty','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bible_Royalty','award'),
    ('Caring Friend','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Caring_Friend','award'),
    ('Carpenter','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Carpenter','award'),
    ('Technology (formerly Computer Skills)','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Technology_(formerly_Computer_Skills)','award'),
    ('Country Fun','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Country_Fun','award'),
    ('Environmentalist','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Environmentalist','award'),
    ('Fruits of the Spirit','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Fruits_of_the_Spirit','award'),
    ('Geologist','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Geologist','award'),
    ('Habitat','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Habitat','award'),
    ('Honey Bee','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Honey_Bee','award'),
    ('Hygiene','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Hygiene','award'),
    ('My Church','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/My_Church','award'),
    ('My Picture Book','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/My_Picture_Book','award'),
    ('Outdoor Explorer','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Outdoor_Explorer','award'),
    ('Pearly Gates','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Pearly_Gates','award'),
    ('Prayer Warrior','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Prayer_Warrior','award'),
    ('Purity','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Purity','award'),
    ('Rainbow Promise','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Rainbow_Promise','award'),
    ('Reading IV','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Reading_IV','award'),
    ('Reporter','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Reporter','award'),
    ('Safe Water','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Safe_Water','award'),
    ('Sign Language','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Sign_Language','award'),
    ('Skater','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Skater','award'),
    ('Stamping Fun Art','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Stamping_Fun_Art','award'),
    ('Steps to Jesus','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Steps_to_Jesus','award'),
    ('Tabernacle','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Tabernacle','award'),
    ('Weather (HH)','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Weather_(HH)','award'),
    -- Multi-Level Awards
    ('Bible Storytelling',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bible_Storytelling','award'),
    ('Bread of Life',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Bread_of_Life','award'),
    ('Cooperation',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Cooperation','award'),
    ('Delightful Sabbath',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Delightful_Sabbath','award'),
    ('Dogs',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Dogs','award'),
    ('Good Samaritan',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Good_Samaritan','award'),
    ('Listening',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Listening','award'),
    ('Parables of Jesus',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Parables_of_Jesus','award'),
    ('Photo Fun',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Photo_Fun','award'),
    ('Stay Safe',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Stay_Safe','award'),
    ('Talent',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Talent','award'),
    -- Special Award Patches
    ('Adventurer''s Evangelism Patch',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Adventurer%27s_Evangelism_Patch','patch'),
    ('Adventurer''s Excellence in Reading Patch',null,'https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Adventurer%27s_Excellence_in_Reading_Patch','patch');
