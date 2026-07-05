-- Migration: insert class pin awards for each adventurer class level.

INSERT INTO adv_db.awards (name, type, level, link, patch_image_url) VALUES
  ('Little Lambs Pin', 'pin', 'little_lambs',  NULL, '/img/pins/LittleLambPin.jpg'),
  ('Eager Beaver Pin', 'pin', 'eager_beavers', NULL, '/img/pins/EagerBeaverPin.jpg'),
  ('Busy Bee Pin',     'pin', 'busy_bees',     NULL, '/img/pins/BusyBeePin.jpg'),
  ('Sunbeam Pin',      'pin', 'sunbeams',      NULL, '/img/pins/SunbeamPin.jpg'),
  ('Builders Pin',     'pin', 'builders',      NULL, '/img/pins/BuilderPin.jpg'),
  ('Helping Hand Pin', 'pin', 'helping_hands', NULL, '/img/pins/HelpingHandPin.jpg');
