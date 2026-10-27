-- =====================================================================
-- ESCAPE ROOM & PUZZLE HUNT MANAGEMENT SYSTEM (escape_room_db)
-- Full-Stack Database Schema Definition (DDL)
-- =====================================================================
-- COLLABORATIVE 4-STUDENT TEAM ARCHITECTURE:
--   • Lead Authors (Core Entities & Schema):
--       - Member 1: Physical Venues Domain (branches, staff, rooms, clues)
--       - Member 2: Transactional Domain (teams, players, bookings, hint_usage, payments)
--   • Incremental Advanced Enhancements:
--       - Member 3: Reactive Automation (4 Dynamic Triggers, 3 Abstraction Views)
--       - Member 4: Optimization & Procedures (Performance B-Tree Indexes, Stored Procedures)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS escape_room_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE escape_room_db;

-- Drop existing views and tables in reverse dependency order
DROP VIEW IF EXISTS team_members;
DROP VIEW IF EXISTS player_phones;
DROP VIEW IF EXISTS branch_phones;

DROP TABLE IF EXISTS hint_usage;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS clues;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS branches;

-- =====================================================================
-- PART A: PHYSICAL VENUES ARCHITECTURE (Designed by Team Member 1)
-- =====================================================================
-- 1. BRANCH ENTITY
-- Physical escape room locations.
-- Address is a composite attribute (Street, State, ZIP) flattened into columns.
 CREATE TABLE branches (
    branch_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    street VARCHAR(150) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_branch PRIMARY KEY (branch_id)
);

 -- 2. STAFF ENTITY
-- Staff members employed at branches (1:N from BRANCH).
-- Includes Pay_Time, shift timings (In_Time, Out_Time), and assigned branch.
 CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT,
    branch_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    pay_time VARCHAR(50) NOT NULL DEFAULT 'Monthly' COMMENT 'Staff payment timing / rate schedule (e.g. Hourly, Monthly)',
    in_time TIME NOT NULL,
    out_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_staff PRIMARY KEY (staff_id),
    CONSTRAINT fk_staff_branch 
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

 -- 3. ROOM ENTITY
-- Puzzle rooms located at branches (1:N from BRANCH).
-- Includes theme name, difficulty, capacity, status, and base price.
 CREATE TABLE rooms (
    room_id INT AUTO_INCREMENT,
    branch_id INT NOT NULL,
    theme_name VARCHAR(100) NOT NULL,
    difficulty ENUM('Easy', 'Medium', 'Hard', 'Expert') NOT NULL DEFAULT 'Medium',
    capacity INT NOT NULL DEFAULT 6 COMMENT 'Maximum allowed team size',
    status ENUM('Available', 'Occupied', 'Maintenance', 'Inactive') NOT NULL DEFAULT 'Available',
    base_price DECIMAL(10, 2) NOT NULL,
    duration INT NOT NULL DEFAULT 60 COMMENT 'Default duration in minutes',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_rooms PRIMARY KEY (room_id),
    CONSTRAINT fk_rooms_branch 
        FOREIGN KEY (branch_id) REFERENCES branches(branch_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_room_price CHECK (base_price >= 0),
    CONSTRAINT chk_room_duration CHECK (duration > 0),
    CONSTRAINT chk_room_capacity CHECK (capacity > 0)
);

 -- 4. CLUE ENTITY
-- Individual clues/puzzles inside each escape room (1:N from ROOM).
 CREATE TABLE clues (
    clue_id INT AUTO_INCREMENT,
    room_id INT NOT NULL,
    hint TEXT NOT NULL COMMENT 'Default hint text associated with this clue',
    description TEXT NOT NULL COMMENT 'Clue or puzzle objective description',
    prereq_clue_id INT NULL COMMENT 'Optional self-referencing relationship: prereq_of',
    points INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_clues PRIMARY KEY (clue_id),
    CONSTRAINT fk_clues_room 
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_clues_prereq 
        FOREIGN KEY (prereq_clue_id) REFERENCES clues(clue_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_clue_points CHECK (points >= 0)
);

-- =====================================================================
-- PART B: TEAMS, BOOKINGS & BILLING ARCHITECTURE (Designed by Team Member 2)
-- =====================================================================
-- 5. TEAM ENTITY
-- Player teams that participate in escape room bookings.
-- team_size is a derived attribute maintained automatically via triggers.
 CREATE TABLE teams (
    team_id INT AUTO_INCREMENT,
    team_name VARCHAR(100) NOT NULL,
    team_size INT NOT NULL DEFAULT 0 COMMENT 'Derived attribute: updated via trigger on member join/leave',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_teams PRIMARY KEY (team_id),
    CONSTRAINT chk_team_size CHECK (team_size >= 0)
);

 -- 6. PLAYERS ENTITY
-- Registered customers/players.
-- Relationship: PLAYERS member of TEAM (N : 1) with relationship attribute joined_date.
 CREATE TABLE players (
    player_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    age INT NULL COMMENT 'Player age',
    team_id INT NULL COMMENT 'FK referencing TEAM for N:1 member_of relationship',
    joined_date DATE NULL COMMENT 'Relationship attribute of member_of relationship',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_players PRIMARY KEY (player_id),
    CONSTRAINT fk_players_team 
        FOREIGN KEY (team_id) REFERENCES teams(team_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_player_age CHECK (age IS NULL OR (age >= 5 AND age <= 120))
);

 -- 7. BOOKING ENTITY
-- Represents game bookings taken by a Team, hosted by Staff in a Room.
-- Important: Session_ID is an attribute of BOOKING (not a separate entity).
 CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT,
    session_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique session code / identifier attribute of booking',
    staff_id INT NOT NULL,
    room_id INT NOT NULL,
    forum_id INT NULL COMMENT 'Discussion / session review forum identifier',
    team_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    slot_end_time DATETIME NOT NULL,
    complete_time TIME NULL COMMENT 'Actual completion time taken by the team',
    status ENUM('Scheduled', 'In-Progress', 'Completed', 'Cancelled', 'No-Show') NOT NULL DEFAULT 'Scheduled',
    outcome ENUM('Pending', 'Escaped', 'Failed', 'Timeout') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_bookings PRIMARY KEY (booking_id),
    CONSTRAINT uq_bookings_session_id UNIQUE (session_id),
    CONSTRAINT fk_bookings_staff 
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_room 
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_team 
        FOREIGN KEY (team_id) REFERENCES teams(team_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_booking_slots CHECK (slot_end_time > start_time)
);

 -- 8. HINT_USAGE ENTITY
-- Tracks hints requested during a game session for a clue.
-- Relationships: CLUE delays HINT_USAGE (1:N), HINT_USAGE logged in BOOKING (N:1).
 CREATE TABLE hint_usage (
    hint_usage_id INT AUTO_INCREMENT,
    clue_id INT NOT NULL,
    session_id VARCHAR(50) NOT NULL COMMENT 'FK referencing bookings(session_id)',
    requested_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hint_no INT NOT NULL DEFAULT 1,
    CONSTRAINT pk_hint_usage PRIMARY KEY (hint_usage_id),
    CONSTRAINT fk_hint_usage_clue 
        FOREIGN KEY (clue_id) REFERENCES clues(clue_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_hint_usage_session 
        FOREIGN KEY (session_id) REFERENCES bookings(session_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_hint_no CHECK (hint_no > 0)
);

 -- 9. PAYMENT ENTITY
-- Billing transaction for a booking session.
-- Relationship: BOOKING HAS PAYMENT PAYMENT (1 : 1).
-- Enforced via UNIQUE constraint on session_id referencing bookings(session_id).
 CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT,
    session_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Strict 1:1 relationship with BOOKING via session_id',
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking') NOT NULL,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_payments PRIMARY KEY (payment_id),
    CONSTRAINT uq_payments_session UNIQUE (session_id),
    CONSTRAINT fk_payments_session 
        FOREIGN KEY (session_id) REFERENCES bookings(session_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amount CHECK (amount >= 0)
);

-- =====================================================================
-- PART C: REACTIVE AUTOMATION & VIEWS (Designed by Team Member 3)
-- =====================================================================
-- 10. BACKWARD-COMPATIBLE VIEWS
-- Provides seamless compatibility for legacy queries and multiview requirements.
 CREATE OR REPLACE VIEW team_members AS
SELECT 
    team_id, 
    player_id, 
    joined_date 
FROM players 
WHERE team_id IS NOT NULL;

CREATE OR REPLACE VIEW branch_phones AS
SELECT 
    branch_id, 
    phone 
FROM branches;

CREATE OR REPLACE VIEW player_phones AS
SELECT 
    player_id, 
    phone 
FROM players;


 -- 11. TRIGGERS
-- Trigger 1: Increment team_size when a player is assigned to a team
DELIMITER $$
CREATE TRIGGER trg_player_add_team_size
AFTER INSERT ON players
FOR EACH ROW
BEGIN
    IF NEW.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = NEW.team_id)
        WHERE team_id = NEW.team_id;
    END IF;
END$$

-- Trigger 2: Maintain team_size when a player changes team or leaves
CREATE TRIGGER trg_player_update_team_size
AFTER UPDATE ON players
FOR EACH ROW
BEGIN
    IF OLD.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = OLD.team_id)
        WHERE team_id = OLD.team_id;
    END IF;
    IF NEW.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = NEW.team_id)
        WHERE team_id = NEW.team_id;
    END IF;
END$$

-- Trigger 3: Decrement team_size when a player is removed
CREATE TRIGGER trg_player_delete_team_size
AFTER DELETE ON players
FOR EACH ROW
BEGIN
    IF OLD.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = OLD.team_id)
        WHERE team_id = OLD.team_id;
    END IF;
END$$

-- Trigger 4: Automatically initialize payment record upon new booking
CREATE TRIGGER trg_booking_auto_payment
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE room_price DECIMAL(10,2);
    SELECT base_price INTO room_price FROM rooms WHERE room_id = NEW.room_id;
    IF room_price IS NULL THEN
        SET room_price = 100.00;
    END IF;
    
    INSERT INTO payments (session_id, amount, payment_mode, payment_status)
    VALUES (NEW.session_id, room_price, 'UPI', 'Pending')
    ON DUPLICATE KEY UPDATE amount = room_price;
END$$
DELIMITER ;

-- =====================================================================
-- PART D: PERFORMANCE OPTIMIZATION INDEXES (Designed by Team Member 4)
-- =====================================================================
-- 12. PERFORMANCE INDEXES
CREATE INDEX idx_bookings_timeslot ON bookings(room_id, start_time, slot_end_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_players_email ON players(email);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_rooms_branch ON rooms(branch_id, status);
CREATE INDEX idx_clues_room ON clues(room_id);
CREATE INDEX idx_hint_session ON hint_usage(session_id);
CREATE INDEX idx_payments_status ON payments(payment_status);
 
-- =====================================================================
-- MODULE 2: TEAMS, PLAYERS, BOOKINGS & BILLING SCHEMA
-- Author: Team Member 2 (Lead Database Architect - Transactional Domain)
-- Project: Escape Room & Puzzle Hunt Management System (escape_room_db)
-- Scope: Teams, Players, Game Bookings, Hint Usage, and 1:1 Payments
-- =====================================================================

USE escape_room_db;

-- 5. TEAM ENTITY
-- Squads participating in escape room sessions.
-- 'team_size' is a derived attribute, initialized here and automated later via triggers.
CREATE TABLE IF NOT EXISTS teams (
    team_id INT AUTO_INCREMENT,
    team_name VARCHAR(100) NOT NULL,
    team_size INT NOT NULL DEFAULT 0 COMMENT 'Derived attribute: reflects count of active players',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_teams PRIMARY KEY (team_id),
    CONSTRAINT chk_team_size CHECK (team_size >= 0)
);

-- 6. PLAYERS ENTITY
-- Customer accounts participating in escape rooms.
-- N:1 member_of relationship with TEAM, including 'joined_date' relationship attribute.
CREATE TABLE IF NOT EXISTS players (
    player_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    age INT NULL COMMENT 'Player age',
    team_id INT NULL COMMENT 'FK referencing TEAM for member_of relationship',
    joined_date DATE NULL COMMENT 'Relationship attribute of member_of relationship',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_players PRIMARY KEY (player_id),
    CONSTRAINT fk_players_team 
        FOREIGN KEY (team_id) REFERENCES teams(team_id) 
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_player_age CHECK (age IS NULL OR (age >= 5 AND age <= 120))
);

-- 7. BOOKING ENTITY
-- Represents a game booking session taken by a Team, hosted by Staff in a Room.
-- session_id is a unique code attribute of the booking.
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INT AUTO_INCREMENT,
    session_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Unique session code / identifier',
    staff_id INT NOT NULL,
    room_id INT NOT NULL,
    forum_id INT NULL COMMENT 'Optional discussion / session review forum identifier',
    team_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    slot_end_time DATETIME NOT NULL,
    complete_time TIME NULL COMMENT 'Actual completion time taken by the team',
    status ENUM('Scheduled', 'In-Progress', 'Completed', 'Cancelled', 'No-Show') NOT NULL DEFAULT 'Scheduled',
    outcome ENUM('Pending', 'Escaped', 'Failed', 'Timeout') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_bookings PRIMARY KEY (booking_id),
    CONSTRAINT uq_bookings_session_id UNIQUE (session_id),
    CONSTRAINT fk_bookings_staff 
        FOREIGN KEY (staff_id) REFERENCES staff(staff_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_room 
        FOREIGN KEY (room_id) REFERENCES rooms(room_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_team 
        FOREIGN KEY (team_id) REFERENCES teams(team_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_booking_slots CHECK (slot_end_time > start_time)
);

-- 8. HINT_USAGE ENTITY
-- Tracks hints requested by a team during an active game session for a specific clue.
CREATE TABLE IF NOT EXISTS hint_usage (
    hint_usage_id INT AUTO_INCREMENT,
    clue_id INT NOT NULL,
    session_id VARCHAR(50) NOT NULL COMMENT 'FK referencing bookings(session_id)',
    requested_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hint_no INT NOT NULL DEFAULT 1,
    CONSTRAINT pk_hint_usage PRIMARY KEY (hint_usage_id),
    CONSTRAINT fk_hint_usage_clue 
        FOREIGN KEY (clue_id) REFERENCES clues(clue_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_hint_usage_session 
        FOREIGN KEY (session_id) REFERENCES bookings(session_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_hint_no CHECK (hint_no > 0)
);

-- 9. PAYMENT ENTITY
-- Financial transaction ledger.
-- Enforces strict 1:1 relationship with BOOKING via UNIQUE constraint on session_id.
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT,
    session_id VARCHAR(50) NOT NULL UNIQUE COMMENT 'Strict 1:1 relationship with bookings(session_id)',
    amount DECIMAL(10, 2) NOT NULL,
    payment_mode ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking') NOT NULL,
    payment_status ENUM('Pending', 'Completed', 'Failed', 'Refunded') NOT NULL DEFAULT 'Pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_payments PRIMARY KEY (payment_id),
    CONSTRAINT uq_payments_session UNIQUE (session_id),
    CONSTRAINT fk_payments_session 
        FOREIGN KEY (session_id) REFERENCES bookings(session_id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_payment_amount CHECK (amount >= 0)
);



-- =====================================================================
-- MODULE 3: AUTOMATION TRIGGERS & ABSTRACTION VIEWS (PATCH)
-- Author: Team Member 3 (Database Engineer - Triggers & Views Specialist)
-- Project: Escape Room & Puzzle Hunt Management System (escape_room_db)
-- Scope: Reactive Triggers for team_size & Auto-Payment, plus Views
-- =====================================================================

USE escape_room_db;

-- 1. DATABASE VIEWS FOR ABSTRACTION & ACCESS CONTROL
-- View 1: Legacy team membership query abstraction
CREATE OR REPLACE VIEW team_members AS
SELECT 
    team_id, 
    player_id, 
    joined_date 
FROM players 
WHERE team_id IS NOT NULL;

-- View 2: Flattened contact directory for physical branches
CREATE OR REPLACE VIEW branch_phones AS
SELECT 
    branch_id, 
    phone 
FROM branches;

-- View 3: Contact directory for players
CREATE OR REPLACE VIEW player_phones AS
SELECT 
    player_id, 
    phone 
FROM players;

-- 2. DYNAMIC BUSINESS LOGIC TRIGGERS
-- Trigger 1: Increment/sync team_size when a new player joins a team
DELIMITER $$
DROP TRIGGER IF EXISTS trg_player_add_team_size$$
CREATE TRIGGER trg_player_add_team_size
AFTER INSERT ON players
FOR EACH ROW
BEGIN
    IF NEW.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = NEW.team_id)
        WHERE team_id = NEW.team_id;
    END IF;
END$$

-- Trigger 2: Maintain team_size when a player changes team or leaves
DROP TRIGGER IF EXISTS trg_player_update_team_size$$
CREATE TRIGGER trg_player_update_team_size
AFTER UPDATE ON players
FOR EACH ROW
BEGIN
    IF OLD.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = OLD.team_id)
        WHERE team_id = OLD.team_id;
    END IF;
    IF NEW.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = NEW.team_id)
        WHERE team_id = NEW.team_id;
    END IF;
END$$

-- Trigger 3: Decrement team_size when a player record is deleted
DROP TRIGGER IF EXISTS trg_player_delete_team_size$$
CREATE TRIGGER trg_player_delete_team_size
AFTER DELETE ON players
FOR EACH ROW
BEGIN
    IF OLD.team_id IS NOT NULL THEN
        UPDATE teams 
        SET team_size = (SELECT COUNT(*) FROM players WHERE team_id = OLD.team_id)
        WHERE team_id = OLD.team_id;
    END IF;
END$$

-- Trigger 4: Automatically initialize pending payment transaction on new booking
DROP TRIGGER IF EXISTS trg_booking_auto_payment$$
CREATE TRIGGER trg_booking_auto_payment
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE room_price DECIMAL(10,2);
    SELECT base_price INTO room_price FROM rooms WHERE room_id = NEW.room_id;
    IF room_price IS NULL THEN
        SET room_price = 100.00;
    END IF;
    
    INSERT INTO payments (session_id, amount, payment_mode, payment_status)
    VALUES (NEW.session_id, room_price, 'UPI', 'Pending')
    ON DUPLICATE KEY UPDATE amount = room_price;
END$$
DELIMITER ;

-- =====================================================================
-- MODULE 4: PROCEDURES, PERFORMANCE INDEXES & ANALYTICS (PATCH)
-- Author: Team Member 4 (Database Engineer - Optimization & Analytics Specialist)
-- Project: Escape Room & Puzzle Hunt Management System (escape_room_db)
-- Scope: Stored Procedures, B-Tree Indexes & Complex Analytical Joins
-- =====================================================================

USE escape_room_db;

-- 1. STORED PROCEDURE FOR ATOMIC SESSION CONCLUSION
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_complete_game_session$$
CREATE PROCEDURE sp_complete_game_session(
    IN in_session_id VARCHAR(50),
    IN in_completion_time TIME,
    IN in_outcome VARCHAR(20)
)
BEGIN
    -- Atomically update booking status, actual time taken, and escape outcome
    UPDATE bookings 
    SET 
        status = 'Completed',
        complete_time = in_completion_time,
        outcome = in_outcome
    WHERE session_id = in_session_id;
    
    -- Return joined session summary including payment status
    SELECT 
        b.session_id,
        b.status,
        b.complete_time,
        b.outcome,
        p.amount,
        p.payment_status
    FROM bookings b
    LEFT JOIN payments p ON b.session_id = p.session_id
    WHERE b.session_id = in_session_id;
END$$
DELIMITER ;

-- 2. HIGH-PERFORMANCE B-TREE INDEXES
-- Index 1: Fast collision detection during booking scheduling
CREATE INDEX IF NOT EXISTS idx_bookings_timeslot ON bookings(room_id, start_time, slot_end_time);
-- Index 2: Filter bookings by operational status
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
-- Index 3: Rapid lookup by player email
CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
-- Index 4: Fast joins on player team membership
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
-- Index 5: Composite index on branch rooms and room availability
CREATE INDEX IF NOT EXISTS idx_rooms_branch ON rooms(branch_id, status);
-- Index 6: Fast retrieval of clues by chamber
CREATE INDEX IF NOT EXISTS idx_clues_room ON clues(room_id);
-- Index 7: Hint logger retrieval for Game Master console
CREATE INDEX IF NOT EXISTS idx_hint_session ON hint_usage(session_id);
-- Index 8: Financial ledger filtering by settlement status
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);

-- 3. ANALYTICAL QUERIES FOR REPORTING

-- A. Fastest Escape Leaderboard (Hall of Fame)
-- Ranks teams that escaped by fastest completion time, joined with staff and hint penalties.
SELECT 
    t.team_name,
    r.theme_name,
    bk.session_id,
    bk.complete_time,
    bk.outcome,
    COUNT(h.hint_usage_id) AS hints_used,
    s.name AS host_staff
FROM bookings bk
JOIN teams t ON bk.team_id = t.team_id
JOIN rooms r ON bk.room_id = r.room_id
JOIN staff s ON bk.staff_id = s.staff_id
LEFT JOIN hint_usage h ON bk.session_id = h.session_id
WHERE bk.outcome = 'Escaped'
GROUP BY t.team_name, r.theme_name, bk.session_id, bk.complete_time, bk.outcome, s.name
ORDER BY bk.complete_time ASC;

-- B. Multi-Table Revenue Aggregation by Branch and Payment Mode
SELECT 
    b.name AS branch_name,
    p.payment_mode,
    COUNT(p.payment_id) AS total_transactions,
    SUM(p.amount) AS total_revenue
FROM payments p
JOIN bookings bk ON p.session_id = bk.session_id
JOIN rooms r ON bk.room_id = r.room_id
JOIN branches b ON r.branch_id = b.branch_id
WHERE p.payment_status = 'Completed'
GROUP BY b.name, p.payment_mode
ORDER BY b.name, total_revenue DESC;

-- C. Nested Query: Rooms with Above-Average Booking Demand
SELECT 
    r.room_id,
    r.theme_name,
    r.difficulty,
    COUNT(b.booking_id) AS booking_count
FROM rooms r
LEFT JOIN bookings b ON r.room_id = b.room_id
GROUP BY r.room_id, r.theme_name, r.difficulty
HAVING COUNT(b.booking_id) >= (
    SELECT AVG(room_bookings) 
    FROM (
        SELECT COUNT(booking_id) AS room_bookings 
        FROM rooms rm 
        LEFT JOIN bookings bk ON rm.room_id = bk.room_id 
        GROUP BY rm.room_id
    ) AS avg_tbl
);
