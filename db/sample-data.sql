-- Dev-only sample data. Applied via: ./dev.sh --sample-data
-- Never runs in production.
SET search_path TO adv_db;

INSERT INTO club_years (label, club_name, start_date, end_date) 
VALUES ('25-26', 'Little Eagles', '2025-08-15', '2026-05-28');

INSERT INTO children (first_name, last_name, allergies, medical_conditions, sex, date_of_birth) 
VALUES ('John', 'Doe', 'Peanuts', 'Asthma', 'male', '2015-03-10'),
       ('Jane', 'Smith', 'Dairy', 'Eczema', 'female', '2016-07-22'),
       ('Alex', 'Johnson', 'Wheat', 'Allergies', 'male', '2014-11-05'),
       ('Emily', 'Brown', 'Shellfish', 'Hypertension', 'female', '2017-02-18'),
       ('Michael', 'Davis', 'Eggs', 'Diabetes', 'male', '2013-09-30'),
       ('Sarah', 'Miller', 'Peanuts', 'Asthma', 'female', '2018-05-12'),
       ('David', 'Wilson', 'Dairy', 'Eczema', 'male', '2019-08-25'),
       ('Laura', 'Moore', 'Wheat', 'Allergies', 'female', '2016-04-08'),
       ('James', 'Taylor', 'Shellfish', 'Hypertension', 'male', '2017-01-15'),
       ('Mia', 'Anderson', 'Eggs', 'Diabetes', 'female', '2018-06-20');

INSERT INTO staff (first_name, last_name, email, phone, background_check_expiration)
VALUES ('Alice', 'Johnson', 'alice.johnson@example.com', '555-1234', '2024-08-15'),
       ('Bob', 'Smith', 'bob.smith@example.com', '555-5678', '2024-09-20'),
       ('Charlie', 'Brown', 'charlie.brown@example.com', '555-9012', '2024-10-10'),
       ('Diana', 'Wilson', 'diana.wilson@example.com', '555-3456', '2024-11-05'),
       ('Ethan', 'Moore', 'ethan.moore@example.com', '555-7890', '2024-12-10'),
       ('Fiona', 'Taylor', 'fiona.taylor@example.com', '555-2345', '2024-07-15');

INSERT INTO club_years_staff (club_year_id, staff_id, staff_role)
VALUES (1, 1, 'instructor'),
       (1, 2, 'instructor'),
       (1, 3, 'instructor'),
       (1, 4, 'instructor'),
       (1, 5, 'instructor'),
       (1, 6, 'instructor');

INSERT INTO classes (class, club_year_id, instructor_id)
VALUES ('little_lambs', 1, 1),
       ('eager_beavers', 1, 2),
       ('busy_bees', 1, 3),
       ('sunbeams', 1, 4),
       ('builders', 1, 5),
       ('helping_hands', 1, 6);

INSERT INTO classes_children (club_year_id, class_id, child_id)
VALUES (1, 1, 1),
       (1, 2, 2),
       (1, 3, 3),
       (1, 4, 4),
       (1, 5, 5),
       (1, 6, 6),
       (1, 1, 7),
       (1, 2, 8),
       (1, 3, 9),
       (1, 4, 10);

INSERT INTO parents (first_name, last_name, email, phone, address)
VALUES ('Robert', 'Doe', 'robert.doe@example.com', '555-1001', '123 Maple St, Springfield'),
       ('Susan', 'Smith', 'susan.smith@example.com', '555-1002', '456 Oak Ave, Shelbyville'),
       ('Mark', 'Johnson', 'mark.johnson@example.com', '555-1003', '789 Pine Rd, Springfield'),
       ('Linda', 'Brown', 'linda.brown@example.com', '555-1004', '321 Elm St, Shelbyville'),
       ('Thomas', 'Davis', 'thomas.davis@example.com', '555-1005', '654 Cedar Ln, Springfield'),
       ('Karen', 'Miller', 'karen.miller@example.com', '555-1006', '987 Birch Blvd, Shelbyville'),
       ('Patricia', 'Wilson', 'patricia.wilson@example.com', '555-1007', '111 Walnut Dr, Springfield'),
       ('Steven', 'Taylor', 'steven.taylor@example.com', '555-1008', '222 Spruce Ct, Shelbyville');

-- parent_id → child_id
-- Robert Doe → John Doe (1)
-- Susan Smith → Jane Smith (2)
-- Mark Johnson → Alex Johnson (3)
-- Linda Brown → Emily Brown (4)
-- Thomas Davis → Michael Davis (5), Sarah Miller (6)  [blended family]
-- Karen Miller → Sarah Miller (6)
-- Patricia Wilson → David Wilson (7), Laura Moore (8)  [blended family]
-- Steven Taylor → James Taylor (9), Mia Anderson (10)  [blended family]
INSERT INTO parents_children (parent_id, child_id)
VALUES (1, 1),
       (2, 2),
       (3, 3),
       (4, 4),
       (5, 5),
       (5, 6),
       (6, 6),
       (7, 7),
       (7, 8),
       (8, 9),
       (8, 10);

INSERT INTO events (club_year_id, title, event_date)
VALUES (1, 'Summer Picnic', '2025-07-15'),
       (1, 'Fall Festival', '2025-10-05'),
       (1, 'Winter Wonderland', '2025-12-20'),
       (1, 'Spring Cleanup', '2026-03-10'),
       (1, 'Regular Meeting', '2025-09-01'),
       (1, 'Easter Egg Hunt', '2026-04-05');
