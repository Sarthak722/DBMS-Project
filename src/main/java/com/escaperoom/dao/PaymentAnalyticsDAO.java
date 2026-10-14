package com.escaperoom.dao;

import com.escaperoom.config.DatabaseConfig;
import com.escaperoom.model.AnalyticsSummary;
import com.escaperoom.model.Payment;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Section 4: Billing, Payments & Analytics DAO
 * Handles Financial Transactions, Revenue Summaries, Leaderboards, and Analytical Queries.
 */
public class PaymentAnalyticsDAO {

    // --- PAYMENTS ---
    public List<Payment> getAllPayments() throws SQLException {
        List<Payment> list = new ArrayList<>();
        String sql = "SELECT p.payment_id, p.session_id, p.amount, p.payment_mode, p.payment_status, p.timestamp, " +
                     "t.team_name, r.theme_name " +
                     "FROM payments p " +
                     "JOIN bookings b ON p.session_id = b.session_id " +
                     "JOIN teams t ON b.team_id = t.team_id " +
                     "JOIN rooms r ON b.room_id = r.room_id " +
                     "ORDER BY p.timestamp DESC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Payment p = new Payment();
                p.setPaymentId(rs.getInt("payment_id"));
                p.setSessionId(rs.getString("session_id"));
                p.setAmount(rs.getBigDecimal("amount"));
                p.setPaymentMode(rs.getString("payment_mode"));
                p.setPaymentStatus(rs.getString("payment_status"));
                p.setTimestamp(rs.getString("timestamp"));
                p.setTeamName(rs.getString("team_name"));
                p.setRoomTheme(rs.getString("theme_name"));
                list.add(p);
            }
        }
        return list;
    }

    public boolean updatePaymentStatus(int paymentId, String status, String mode) throws SQLException {
        String sql = "UPDATE payments SET payment_status = ?, payment_mode = ? WHERE payment_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setString(2, mode);
            ps.setInt(3, paymentId);
            return ps.executeUpdate() > 0;
        }
    }

    public int createPayment(Payment p) throws SQLException {
        String sql = "INSERT INTO payments (session_id, amount, payment_mode, payment_status) VALUES (?, ?, ?, ?) " +
                     "ON DUPLICATE KEY UPDATE amount = VALUES(amount), payment_mode = VALUES(payment_mode), payment_status = VALUES(payment_status)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, p.getSessionId());
            ps.setBigDecimal(2, p.getAmount() != null ? p.getAmount() : new BigDecimal("100.00"));
            ps.setString(3, p.getPaymentMode() != null ? p.getPaymentMode() : "UPI");
            ps.setString(4, p.getPaymentStatus() != null ? p.getPaymentStatus() : "Completed");
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    // --- LEADERBOARD ---
    public List<Map<String, Object>> getEscapeLeaderboard() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT t.team_name, r.theme_name, bk.session_id, bk.complete_time, bk.outcome, " +
                     "COUNT(h.hint_usage_id) AS hints_used, s.name AS host_staff " +
                     "FROM bookings bk " +
                     "JOIN teams t ON bk.team_id = t.team_id " +
                     "JOIN rooms r ON bk.room_id = r.room_id " +
                     "JOIN staff s ON bk.staff_id = s.staff_id " +
                     "LEFT JOIN hint_usage h ON bk.session_id = h.session_id " +
                     "WHERE bk.outcome = 'Escaped' " +
                     "GROUP BY t.team_name, r.theme_name, bk.session_id, bk.complete_time, bk.outcome, s.name " +
                     "ORDER BY bk.complete_time ASC LIMIT 10";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            int rank = 1;
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("rank", rank++);
                map.put("teamName", rs.getString("team_name"));
                map.put("themeName", rs.getString("theme_name"));
                map.put("sessionId", rs.getString("session_id"));
                map.put("completeTime", rs.getString("complete_time"));
                map.put("hintsUsed", rs.getInt("hints_used"));
                map.put("hostStaff", rs.getString("host_staff"));
                list.add(map);
            }
        }
        return list;
    }

    // --- COMPREHENSIVE ANALYTICS SUMMARY ---
    public AnalyticsSummary getAnalyticsSummary() throws SQLException {
        AnalyticsSummary summary = new AnalyticsSummary();

        try (Connection conn = DatabaseConfig.getConnection()) {
            // 1. Total Revenue
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'Completed'")) {
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) summary.setTotalRevenue(rs.getDouble(1));
                }
            }

            // 2. Counts
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM bookings")) {
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) summary.setTotalBookings(rs.getInt(1));
                }
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM rooms")) {
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) summary.setTotalRooms(rs.getInt(1));
                }
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM teams")) {
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) summary.setTotalTeams(rs.getInt(1));
                }
            }
            try (PreparedStatement ps = conn.prepareStatement("SELECT COUNT(*) FROM players")) {
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) summary.setTotalPlayers(rs.getInt(1));
                }
            }

            // 3. Escape Rate Percentage
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT " +
                    "  ROUND((COUNT(CASE WHEN outcome = 'Escaped' THEN 1 END) * 100.0) / " +
                    "  NULLIF(COUNT(CASE WHEN status = 'Completed' THEN 1 END), 0), 1) AS escape_rate " +
                    "FROM bookings")) {
                try (ResultSet rs = ps.executeQuery()) {
                    if (rs.next()) {
                        double rate = rs.getDouble("escape_rate");
                        summary.setEscapeRate(rs.wasNull() ? 0.0 : rate);
                    }
                }
            }

            // 4. Revenue By Payment Mode
            List<Map<String, Object>> revByMode = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT payment_mode, COUNT(*) as tx_count, SUM(amount) as total_amt " +
                    "FROM payments WHERE payment_status = 'Completed' GROUP BY payment_mode")) {
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("mode", rs.getString("payment_mode"));
                        m.put("count", rs.getInt("tx_count"));
                        m.put("amount", rs.getDouble("total_amt"));
                        revByMode.add(m);
                    }
                }
            }
            summary.setRevenueByMode(revByMode);

            // 5. Revenue By Branch
            List<Map<String, Object>> revByBranch = new ArrayList<>();
            String branchSql = "SELECT b.name AS branch_name, COUNT(p.payment_id) AS transactions, COALESCE(SUM(p.amount), 0) AS revenue " +
                               "FROM branches b " +
                               "JOIN rooms r ON b.branch_id = r.branch_id " +
                               "JOIN bookings bk ON r.room_id = bk.room_id " +
                               "JOIN payments p ON bk.session_id = p.session_id " +
                               "WHERE p.payment_status = 'Completed' " +
                               "GROUP BY b.branch_id, b.name";
            try (PreparedStatement ps = conn.prepareStatement(branchSql)) {
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("branchName", rs.getString("branch_name"));
                        m.put("transactions", rs.getInt("transactions"));
                        m.put("revenue", rs.getDouble("revenue"));
                        revByBranch.add(m);
                    }
                }
            }
            summary.setRevenueByBranch(revByBranch);

            // 6. Difficulty Distribution
            List<Map<String, Object>> diffStats = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT difficulty, COUNT(*) as room_count FROM rooms GROUP BY difficulty")) {
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("difficulty", rs.getString("difficulty"));
                        m.put("count", rs.getInt("room_count"));
                        diffStats.add(m);
                    }
                }
            }
            summary.setDifficultyStats(diffStats);

            // 7. Escape Leaderboard
            summary.setLeaderboard(getEscapeLeaderboard());
        }

        return summary;
    }

    // --- VIEW QUERIES (Phone directories) ---
    public List<Map<String, Object>> getBranchPhonesView() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT bp.branch_id, b.name, bp.phone FROM branch_phones bp JOIN branches b ON bp.branch_id = b.branch_id";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> m = new HashMap<>();
                m.put("branchId", rs.getInt("branch_id"));
                m.put("name", rs.getString("name"));
                m.put("phone", rs.getString("phone"));
                list.add(m);
            }
        }
        return list;
    }

    public List<Map<String, Object>> getPlayerPhonesView() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT pp.player_id, p.name, pp.phone FROM player_phones pp JOIN players p ON pp.player_id = p.player_id";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> m = new HashMap<>();
                m.put("playerId", rs.getInt("player_id"));
                m.put("name", rs.getString("name"));
                m.put("phone", rs.getString("phone"));
                list.add(m);
            }
        }
        return list;
    }
}
