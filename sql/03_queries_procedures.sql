-- =====================================================================
-- ADVANCED PROCEDURES, COMPLEX QUERIES & ANALYTICAL JOINS
-- Author: Team Member 4 (Database Optimization & Analytics Specialist)
-- Project: Escape Room & Puzzle Hunt Management System (escape_room_db)
-- =====================================================================

USE escape_room_db;

-- 1. COMPLEX JOIN: Room details along with branch info and assigned clue counts
SELECT 
    r.room_id,
    r.theme_name,
    r.difficulty,
    r.capacity,
    r.base_price,
    b.name AS branch_name,
    b.city,
    COUNT(c.clue_id) AS total_clues,
    COALESCE(SUM(c.points), 0) AS max_puzzle_points
FROM rooms r
JOIN branches b ON r.branch_id = b.branch_id
LEFT JOIN clues c ON r.room_id = c.room_id
GROUP BY r.room_id, r.theme_name, r.difficulty, r.capacity, r.base_price, b.name, b.city
ORDER BY r.room_id;

-- 2. ESCAPE LEADERBOARD QUERY (Rank teams by fastest escape time)
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

-- 3. REVENUE SUMMARY BY BRANCH & PAYMENT MODE
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

-- 4. NESTED QUERY / AGGREGATION: Find rooms that have higher than average booking frequency
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

-- 5. STORED PROCEDURE: Complete a Game Session with Outcome and Time
DELIMITER $$
DROP PROCEDURE IF EXISTS sp_complete_game_session$$
CREATE PROCEDURE sp_complete_game_session(
    IN in_session_id VARCHAR(50),
    IN in_completion_time TIME,
    IN in_outcome VARCHAR(20)
)
BEGIN
    UPDATE bookings 
    SET 
        status = 'Completed',
        complete_time = in_completion_time,
        outcome = in_outcome
    WHERE session_id = in_session_id;
    
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
