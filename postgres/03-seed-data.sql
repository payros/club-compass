-- Insert read-only seed data for static tables such as awards, principal user, etc
SET search_path  TO adv_db;

INSERT INTO awards  (name, level, "link", type) 
VALUES ('ABC''s','little_lambs',null,'star'),
    ('Alphabet Fun','eager_beavers','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Alphabet_Fun','chip'),
    ('Artist','busy_bees','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Artist','award'),
    ('Acts of Kindness','sunbeams','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Acts_of_Kindness','award'),
    ('Astronomer','builders','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Astronomer','award'),
    ('Basket Maker','helping_hands','https://en.wikibooks.org/wiki/Adventist_Adventurer_Awards_and_Answers/Basket_Maker','award');