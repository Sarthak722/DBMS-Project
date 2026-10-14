-- =====================================================================
-- COMPREHENSIVE SEED DATA FOR ESCAPE ROOM MANAGEMENT SYSTEM
-- Collaborative Dataset: Seeded by Team Members 1, 2, 3 & 4
-- Database: escape_room_db
-- =====================================================================

USE escape_room_db;

-- 1. Insert Branches
INSERT INTO branches (name, city, street, state, zip, phone) VALUES
('Downtown Enigma Hub', 'Metropolis', '104 Baker Street', 'NY', '10001', '+1-212-555-0199'),
('Silicon Cyber Crypt', 'Tech City', '404 Innovation Way', 'CA', '94016', '+1-415-555-0144'),
('Old Town Mystery Manor', 'Arkham', '13 Shadow Grove Road', 'MA', '01970', '+1-617-555-0177');

-- 2. Insert Staff
INSERT INTO staff (branch_id, name, role, pay_time, in_time, out_time) VALUES
(1, 'Victor Vance', 'Game Master', 'Monthly', '09:00:00', '17:00:00'),
(1, 'Elena Rostova', 'Operations Lead', 'Monthly', '12:00:00', '20:00:00'),
(2, 'Marcus Brody', 'Game Master & Technician', 'Hourly', '10:00:00', '18:00:00'),
(2, 'Sarah Connor', 'Security & Safety Officer', 'Monthly', '14:00:00', '22:00:00'),
(3, 'Arthur Pendelton', 'Head Game Master', 'Monthly', '08:00:00', '16:00:00'),
(3, 'Diana Prince', 'Puzzle Designer', 'Monthly', '11:00:00', '19:00:00');

-- 3. Insert Rooms
INSERT INTO rooms (branch_id, theme_name, difficulty, capacity, status, base_price, duration) VALUES
(1, 'The Pharaoh\'s Lost Tomb', 'Medium', 6, 'Available', 120.00, 60),
(1, 'Cyberpunk 2099: Neon Data Heist', 'Hard', 5, 'Available', 150.00, 75),
(2, 'Submarine Reactor Lockdown', 'Expert', 8, 'Available', 180.00, 90),
(2, 'The Alchemist\'s Secret Lab', 'Easy', 4, 'Available', 90.00, 45),
(3, 'Haunted Victorian Asylum', 'Hard', 6, 'Available', 140.00, 60),
(3, 'Sherlock\'s Final Case', 'Medium', 5, 'Available', 110.00, 60);

-- 4. Insert Clues (with prerequisites demonstrating tree/DAG relationships)
INSERT INTO clues (room_id, hint, description, prereq_clue_id, points) VALUES
-- Room 1: Pharaoh's Lost Tomb
(1, 'Count the golden scarabs etched on the northern sarcophagus.', 'Decipher the Hieroglyphic Cartouche on the wall', NULL, 15),
(1, 'Align the sun medallion rays with the hieroglyphs revealed earlier.', 'Align the solar mirror mechanism to open the secret door', 1, 25),
(1, 'Look beneath the Canopic jar labeled with the falcon head of Horus.', 'Retrieve the Golden Ankh Key from the altar pedestal', 2, 30),

-- Room 2: Neon Data Heist
(2, 'The terminal password is hidden in the blinking binary LED strips.', 'Bypass the biometric subnet terminal', NULL, 20),
(2, 'Route the fiber optic jumper cables to match the server floor grid.', 'Connect the quantum decryption switchboard', 4, 30),
(2, 'Extract the encrypted hardware token before the ICE lockdown timer expires.', 'Download the AI mainframe root key', 5, 40),

-- Room 3: Submarine Lockdown
(3, 'Match the hydrostatic pressure gauges to 3.5 atmospheres.', 'Stabilize the main ballast pressure valves', NULL, 20),
(3, 'Follow the emergency Morse code sequence sounding on the speaker.', 'Unlock the sonar communication cabinet', 7, 25),
(3, 'Insert both emergency keys simultaneously into the bridge console.', 'Override the emergency reactor scram lock', 8, 45),

-- Room 4: Alchemist Lab
(4, 'Colors follow the visible spectrum: red, yellow, blue.', 'Mix the herbal reagents in the brass crucible', NULL, 10),
(4, 'The secret formula reflects in the copper looking-glass.', 'Unlock the philosopher\'s stone lockbox', 10, 20),

-- Room 5: Haunted Victorian Asylum
(5, 'Inspect the psychiatric patient logs dated 1898 on the desk.', 'Identify the order of the padded cell door switches', NULL, 20),
(5, 'Play the nursery rhyme on the vintage gramophone in reverse.', 'Find the hidden passage behind the portrait', 12, 35),

-- Room 6: Sherlock's Final Case
(6, 'Examine the violin strings under the ultraviolet lamp.', 'Uncover the cipher inside the Stradivarius violin', NULL, 15),
(6, 'The chemical reagents react with tea leaves left in the cup.', 'Disclose Moriarty\'s encrypted ledger', 14, 25);

-- 5. Insert Teams
INSERT INTO teams (team_name, team_size) VALUES
('The Code Breakers', 0),
('Shadow Infiltrators', 0),
('Puzzle Prowlers', 0),
('Mystery Inc.', 0),
('Quantum Escapers', 0);

-- 6. Insert Players (Triggers will automatically increment team_size)
INSERT INTO players (name, email, phone, age, team_id, joined_date) VALUES
('Alice Walker', 'alice.walker@example.com', '+1-555-1011', 24, 1, '2026-01-15'),
('Bob Martinez', 'bob.martinez@example.com', '+1-555-1012', 27, 1, '2026-01-15'),
('Charlie Kim', 'charlie.kim@example.com', '+1-555-1013', 22, 1, '2026-01-18'),
('Devon Vance', 'devon.vance@example.com', '+1-555-2011', 29, 2, '2026-02-01'),
('Evelyn Reed', 'evelyn.reed@example.com', '+1-555-2012', 26, 2, '2026-02-01'),
('Frank Castle', 'frank.castle@example.com', '+1-555-2013', 31, 2, '2026-02-05'),
('Grace Hopper', 'grace.hopper@example.com', '+1-555-3011', 28, 3, '2026-02-10'),
('Henry Cavill', 'henry.cavill@example.com', '+1-555-3012', 32, 3, '2026-02-10'),
('Iris West', 'iris.west@example.com', '+1-555-4011', 23, 4, '2026-02-20'),
('Jack Ryan', 'jack.ryan@example.com', '+1-555-4012', 30, 4, '2026-02-20'),
('Kiran Rao', 'kiran.rao@example.com', '+1-555-5011', 25, 5, '2026-03-01'),
('Liam Neeson', 'liam.neeson@example.com', '+1-555-5012', 35, 5, '2026-03-01'),
('Solo Sherlock', 'lone.player@example.com', '+1-555-9000', 29, NULL, NULL);

-- 7. Insert Bookings (Active, Completed, and Scheduled)
INSERT INTO bookings (session_id, staff_id, room_id, forum_id, team_id, start_time, slot_end_time, complete_time, status, outcome) VALUES
('SESS-2026-001', 1, 1, 101, 1, '2026-03-10 14:00:00', '2026-03-10 15:00:00', '00:48:22', 'Completed', 'Escaped'),
('SESS-2026-002', 3, 2, 102, 2, '2026-03-11 16:00:00', '2026-03-11 17:15:00', '01:05:14', 'Completed', 'Escaped'),
('SESS-2026-003', 4, 3, 103, 3, '2026-03-12 18:00:00', '2026-03-12 19:30:00', '01:30:00', 'Completed', 'Timeout'),
('SESS-2026-004', 5, 5, 104, 4, '2026-03-15 15:00:00', '2026-03-15 16:00:00', NULL, 'In-Progress', 'Pending'),
('SESS-2026-005', 2, 4, 105, 5, '2026-03-25 11:00:00', '2026-03-25 11:45:00', NULL, 'Scheduled', 'Pending');

-- 8. Insert Hint Usage (clues delayed / requested during sessions)
INSERT INTO hint_usage (clue_id, session_id, requested_time, hint_no) VALUES
(1, 'SESS-2026-001', '2026-03-10 14:15:30', 1),
(2, 'SESS-2026-001', '2026-03-10 14:32:10', 1),
(4, 'SESS-2026-002', '2026-03-11 16:22:45', 1),
(5, 'SESS-2026-002', '2026-03-11 16:40:15', 2),
(7, 'SESS-2026-003', '2026-03-12 18:25:00', 1),
(8, 'SESS-2026-003', '2026-03-12 18:55:00', 1),
(9, 'SESS-2026-003', '2026-03-12 19:18:00', 2),
(12, 'SESS-2026-004', '2026-03-15 15:18:20', 1);

-- 9. Update/Insert Payments (Ensuring 1:1 with bookings)
-- Note: Trigger trg_booking_auto_payment automatically created pending payments, so we update the actual status & modes
UPDATE payments SET amount = 120.00, payment_mode = 'Credit Card', payment_status = 'Completed' WHERE session_id = 'SESS-2026-001';
UPDATE payments SET amount = 150.00, payment_mode = 'UPI', payment_status = 'Completed' WHERE session_id = 'SESS-2026-002';
UPDATE payments SET amount = 180.00, payment_mode = 'Debit Card', payment_status = 'Completed' WHERE session_id = 'SESS-2026-003';
UPDATE payments SET amount = 140.00, payment_mode = 'UPI', payment_status = 'Completed' WHERE session_id = 'SESS-2026-004';
UPDATE payments SET amount = 90.00, payment_mode = 'Cash', payment_status = 'Pending' WHERE session_id = 'SESS-2026-005';
