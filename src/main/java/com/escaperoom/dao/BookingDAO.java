package com.escaperoom.dao;

import com.escaperoom.config.DatabaseConfig;
import com.escaperoom.model.Booking;
import com.escaperoom.model.HintUsage;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Section 3: Bookings & Live Game Operations DAO
 * Handles Game Sessions, Scheduling, Hints Dispatching, and Outcomes via JDBC.
 */
public class BookingDAO {

    public List<Booking> getAllBookings() throws SQLException {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT b.booking_id, b.session_id, b.staff_id, s.name AS staff_name, " +
                     "b.room_id, r.theme_name AS room_theme, b.forum_id, b.team_id, t.team_name, " +
                     "b.start_time, b.slot_end_time, b.complete_time, b.status, b.outcome, b.created_at, " +
                     "(SELECT COUNT(*) FROM hint_usage h WHERE h.session_id = b.session_id) AS hints_used, " +
                     "p.amount AS payment_amount, p.payment_status " +
                     "FROM bookings b " +
                     "JOIN staff s ON b.staff_id = s.staff_id " +
                     "JOIN rooms r ON b.room_id = r.room_id " +
                     "JOIN teams t ON b.team_id = t.team_id " +
                     "LEFT JOIN payments p ON b.session_id = p.session_id " +
                     "ORDER BY b.start_time DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Booking b = new Booking();
                b.setBookingId(rs.getInt("booking_id"));
                b.setSessionId(rs.getString("session_id"));
                b.setStaffId(rs.getInt("staff_id"));
                b.setStaffName(rs.getString("staff_name"));
                b.setRoomId(rs.getInt("room_id"));
                b.setRoomTheme(rs.getString("room_theme"));
                int forumId = rs.getInt("forum_id");
                b.setForumId(rs.wasNull() ? null : forumId);
                b.setTeamId(rs.getInt("team_id"));
                b.setTeamName(rs.getString("team_name"));
                b.setStartTime(rs.getString("start_time"));
                b.setSlotEndTime(rs.getString("slot_end_time"));
                b.setCompleteTime(rs.getString("complete_time"));
                b.setStatus(rs.getString("status"));
                b.setOutcome(rs.getString("outcome"));
                b.setCreatedAt(rs.getString("created_at"));
                b.setHintsUsed(rs.getInt("hints_used"));
                double amt = rs.getDouble("payment_amount");
                b.setPaymentAmount(rs.wasNull() ? null : amt);
                b.setPaymentStatus(rs.getString("payment_status"));
                list.add(b);
            }
        }
        return list;
    }

    public Booking getBookingBySessionId(String sessionId) throws SQLException {
        String sql = "SELECT b.booking_id, b.session_id, b.staff_id, s.name AS staff_name, " +
                     "b.room_id, r.theme_name AS room_theme, b.forum_id, b.team_id, t.team_name, " +
                     "b.start_time, b.slot_end_time, b.complete_time, b.status, b.outcome, b.created_at, " +
                     "(SELECT COUNT(*) FROM hint_usage h WHERE h.session_id = b.session_id) AS hints_used, " +
                     "p.amount AS payment_amount, p.payment_status " +
                     "FROM bookings b " +
                     "JOIN staff s ON b.staff_id = s.staff_id " +
                     "JOIN rooms r ON b.room_id = r.room_id " +
                     "JOIN teams t ON b.team_id = t.team_id " +
                     "LEFT JOIN payments p ON b.session_id = p.session_id " +
                     "WHERE b.session_id = ?";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, sessionId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Booking b = new Booking();
                    b.setBookingId(rs.getInt("booking_id"));
                    b.setSessionId(rs.getString("session_id"));
                    b.setStaffId(rs.getInt("staff_id"));
                    b.setStaffName(rs.getString("staff_name"));
                    b.setRoomId(rs.getInt("room_id"));
                    b.setRoomTheme(rs.getString("room_theme"));
                    int forumId = rs.getInt("forum_id");
                    b.setForumId(rs.wasNull() ? null : forumId);
                    b.setTeamId(rs.getInt("team_id"));
                    b.setTeamName(rs.getString("team_name"));
                    b.setStartTime(rs.getString("start_time"));
                    b.setSlotEndTime(rs.getString("slot_end_time"));
                    b.setCompleteTime(rs.getString("complete_time"));
                    b.setStatus(rs.getString("status"));
                    b.setOutcome(rs.getString("outcome"));
                    b.setCreatedAt(rs.getString("created_at"));
                    b.setHintsUsed(rs.getInt("hints_used"));
                    double amt = rs.getDouble("payment_amount");
                    b.setPaymentAmount(rs.wasNull() ? null : amt);
                    b.setPaymentStatus(rs.getString("payment_status"));
                    return b;
                }
            }
        }
        return null;
    }

    public int createBooking(Booking b) throws SQLException {
        // Generate unique session_id if absent
        if (b.getSessionId() == null || b.getSessionId().trim().isEmpty()) {
            b.setSessionId("SESS-" + System.currentTimeMillis() % 1000000);
        }

        String sql = "INSERT INTO bookings (session_id, staff_id, room_id, forum_id, team_id, start_time, slot_end_time, status, outcome) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, b.getSessionId());
            ps.setInt(2, b.getStaffId());
            ps.setInt(3, b.getRoomId());
            if (b.getForumId() != null && b.getForumId() > 0) {
                ps.setInt(4, b.getForumId());
            } else {
                ps.setNull(4, Types.INTEGER);
            }
            ps.setInt(5, b.getTeamId());
            ps.setString(6, b.getStartTime());
            ps.setString(7, b.getSlotEndTime());
            ps.setString(8, b.getStatus() != null ? b.getStatus() : "Scheduled");
            ps.setString(9, b.getOutcome() != null ? b.getOutcome() : "Pending");
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    // =========================================================================
    // MISSION STATUS & LIFECYCLE MANAGEMENT
    // =========================================================================

    /**
     * Updates the status of an ongoing booking session (e.g., from 'Scheduled' to 'In-Progress').
     * Used by the Game Master when players physically enter the chamber and start their timer.
     */
    public boolean updateBookingStatus(String sessionId, String status) throws SQLException {
        String sql = "UPDATE bookings SET status = ? WHERE session_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setString(2, sessionId);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Finalizes a game session once the team either escapes, fails, or runs out of time.
     * Sets status to 'Completed', records the exact completion timestamp, and saves the outcome
     * ('Escaped', 'Failed', or 'Timeout').
     */
    public boolean completeGameSession(String sessionId, String completeTime, String outcome) throws SQLException {
        String sql = "UPDATE bookings SET status = 'Completed', complete_time = ?, outcome = ? WHERE session_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, completeTime);
            ps.setString(2, outcome);
            ps.setString(3, sessionId);
            return ps.executeUpdate() > 0;
        }
    }

    /**
     * Cancels/deletes a booking record by its primary key ID.
     * Note: Cascading foreign keys or constraints ensure related child entries are handled cleanly.
     */
    public boolean deleteBooking(int bookingId) throws SQLException {
        String sql = "DELETE FROM bookings WHERE booking_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, bookingId);
            return ps.executeUpdate() > 0;
        }
    }

    // =========================================================================
    // HINT DISPATCHING & LIVE CLUE USAGE TRACKING
    // =========================================================================

    /**
     * Retrieves the chronological timeline of all hints requested by a team during their session.
     * Joins with the clues table so the Game Master UI can display the full clue description 
     * alongside the exact hint text delivered to the players.
     */
    public List<HintUsage> getHintsBySession(String sessionId) throws SQLException {
        List<HintUsage> list = new ArrayList<>();
        String sql = "SELECT h.hint_usage_id, h.clue_id, c.description, c.hint, h.session_id, h.requested_time, h.hint_no " +
                     "FROM hint_usage h JOIN clues c ON h.clue_id = c.clue_id WHERE h.session_id = ? ORDER BY h.requested_time ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, sessionId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    HintUsage hu = new HintUsage();
                    hu.setHintUsageId(rs.getInt("hint_usage_id"));
                    hu.setClueId(rs.getInt("clue_id"));
                    hu.setClueDescription(rs.getString("description"));
                    hu.setHintText(rs.getString("hint"));
                    hu.setSessionId(rs.getString("session_id"));
                    hu.setRequestedTime(rs.getString("requested_time"));
                    hu.setHintNo(rs.getInt("hint_no"));
                    list.add(hu);
                }
            }
        }
        return list;
    }

    /**
     * Logs whenever the Game Master sends a clue hint to players inside the room.
     * 1. Checks previous hints used for this clue in this session to compute an incremental hint number (1, 2, 3...).
     * 2. Inserts an audit trail into `hint_usage` with automatic timestamping.
     * Returns the auto-generated hint_usage_id.
     */
    public int logHintUsage(int clueId, String sessionId) throws SQLException {
        // Step 1: Count previous hints for this clue in this session to calculate sequential hint_no
        int hintNo = 1;
        String countSql = "SELECT COUNT(*) FROM hint_usage WHERE clue_id = ? AND session_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(countSql)) {
            ps.setInt(1, clueId);
            ps.setString(2, sessionId);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    hintNo = rs.getInt(1) + 1;
                }
            }
        }

        // Step 2: Record the hint dispatch event in the audit table
        String insertSql = "INSERT INTO hint_usage (clue_id, session_id, hint_no) VALUES (?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, clueId);
            ps.setString(2, sessionId);
            ps.setInt(3, hintNo);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }
}
