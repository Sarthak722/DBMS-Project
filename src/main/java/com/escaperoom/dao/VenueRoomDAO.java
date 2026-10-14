package com.escaperoom.dao;

import com.escaperoom.config.DatabaseConfig;
import com.escaperoom.model.Branch;
import com.escaperoom.model.Clue;
import com.escaperoom.model.Room;
import com.escaperoom.model.Staff;

import java.math.BigDecimal;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Section 1: Venue & Escape Room DAO
 * Handles Branches, Rooms, Staff, and Clues via JDBC.
 */
public class VenueRoomDAO {

    // --- BRANCHES ---
    public List<Branch> getAllBranches() throws SQLException {
        List<Branch> list = new ArrayList<>();
        String sql = "SELECT branch_id, name, city, street, state, zip, phone, created_at FROM branches ORDER BY branch_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Branch b = new Branch(
                    rs.getInt("branch_id"),
                    rs.getString("name"),
                    rs.getString("city"),
                    rs.getString("street"),
                    rs.getString("state"),
                    rs.getString("zip"),
                    rs.getString("phone")
                );
                b.setCreatedAt(rs.getString("created_at"));
                list.add(b);
            }
        }
        return list;
    }

    public int createBranch(Branch b) throws SQLException {
        String sql = "INSERT INTO branches (name, city, street, state, zip, phone) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, b.getName());
            ps.setString(2, b.getCity());
            ps.setString(3, b.getStreet());
            ps.setString(4, b.getState());
            ps.setString(5, b.getZip());
            ps.setString(6, b.getPhone());
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public boolean deleteBranch(int branchId) throws SQLException {
        String sql = "DELETE FROM branches WHERE branch_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, branchId);
            return ps.executeUpdate() > 0;
        }
    }

    // --- STAFF ---
    public List<Staff> getAllStaff() throws SQLException {
        List<Staff> list = new ArrayList<>();
        String sql = "SELECT s.staff_id, s.branch_id, b.name AS branch_name, s.name, s.role, s.pay_time, s.in_time, s.out_time, s.created_at " +
                     "FROM staff s JOIN branches b ON s.branch_id = b.branch_id ORDER BY s.staff_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Staff s = new Staff();
                s.setStaffId(rs.getInt("staff_id"));
                s.setBranchId(rs.getInt("branch_id"));
                s.setBranchName(rs.getString("branch_name"));
                s.setName(rs.getString("name"));
                s.setRole(rs.getString("role"));
                s.setPayTime(rs.getString("pay_time"));
                s.setInTime(rs.getString("in_time"));
                s.setOutTime(rs.getString("out_time"));
                s.setCreatedAt(rs.getString("created_at"));
                list.add(s);
            }
        }
        return list;
    }

    public int createStaff(Staff s) throws SQLException {
        String sql = "INSERT INTO staff (branch_id, name, role, pay_time, in_time, out_time) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, s.getBranchId());
            ps.setString(2, s.getName());
            ps.setString(3, s.getRole());
            ps.setString(4, s.getPayTime() != null ? s.getPayTime() : "Monthly");
            ps.setTime(5, Time.valueOf(s.getInTime().length() == 5 ? s.getInTime() + ":00" : s.getInTime()));
            ps.setTime(6, Time.valueOf(s.getOutTime().length() == 5 ? s.getOutTime() + ":00" : s.getOutTime()));
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public boolean deleteStaff(int staffId) throws SQLException {
        String sql = "DELETE FROM staff WHERE staff_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, staffId);
            return ps.executeUpdate() > 0;
        }
    }

    // --- ROOMS ---
    public List<Room> getAllRooms() throws SQLException {
        List<Room> list = new ArrayList<>();
        String sql = "SELECT r.room_id, r.branch_id, b.name AS branch_name, r.theme_name, r.difficulty, r.capacity, " +
                     "r.status, r.base_price, r.duration, r.created_at, COUNT(c.clue_id) AS clue_count " +
                     "FROM rooms r " +
                     "JOIN branches b ON r.branch_id = b.branch_id " +
                     "LEFT JOIN clues c ON r.room_id = c.room_id " +
                     "GROUP BY r.room_id, r.branch_id, b.name, r.theme_name, r.difficulty, r.capacity, r.status, r.base_price, r.duration, r.created_at " +
                     "ORDER BY r.room_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Room r = new Room();
                r.setRoomId(rs.getInt("room_id"));
                r.setBranchId(rs.getInt("branch_id"));
                r.setBranchName(rs.getString("branch_name"));
                r.setThemeName(rs.getString("theme_name"));
                r.setDifficulty(rs.getString("difficulty"));
                r.setCapacity(rs.getInt("capacity"));
                r.setStatus(rs.getString("status"));
                r.setBasePrice(rs.getBigDecimal("base_price"));
                r.setDuration(rs.getInt("duration"));
                r.setClueCount(rs.getInt("clue_count"));
                r.setCreatedAt(rs.getString("created_at"));
                list.add(r);
            }
        }
        return list;
    }

    public int createRoom(Room r) throws SQLException {
        String sql = "INSERT INTO rooms (branch_id, theme_name, difficulty, capacity, status, base_price, duration) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, r.getBranchId());
            ps.setString(2, r.getThemeName());
            ps.setString(3, r.getDifficulty());
            ps.setInt(4, r.getCapacity());
            ps.setString(5, r.getStatus() != null ? r.getStatus() : "Available");
            ps.setBigDecimal(6, r.getBasePrice() != null ? r.getBasePrice() : new BigDecimal("100.00"));
            ps.setInt(7, r.getDuration() > 0 ? r.getDuration() : 60);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public boolean updateRoomStatus(int roomId, String status) throws SQLException {
        String sql = "UPDATE rooms SET status = ? WHERE room_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, roomId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteRoom(int roomId) throws SQLException {
        String sql = "DELETE FROM rooms WHERE room_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, roomId);
            return ps.executeUpdate() > 0;
        }
    }

    // --- CLUES ---
    public List<Clue> getAllClues() throws SQLException {
        List<Clue> list = new ArrayList<>();
        String sql = "SELECT c.clue_id, c.room_id, r.theme_name AS room_theme, c.hint, c.description, c.prereq_clue_id, c.points, c.created_at " +
                     "FROM clues c JOIN rooms r ON c.room_id = r.room_id ORDER BY c.room_id ASC, c.clue_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Clue c = new Clue();
                c.setClueId(rs.getInt("clue_id"));
                c.setRoomId(rs.getInt("room_id"));
                c.setRoomTheme(rs.getString("room_theme"));
                c.setHint(rs.getString("hint"));
                c.setDescription(rs.getString("description"));
                int prereq = rs.getInt("prereq_clue_id");
                c.setPrereqClueId(rs.wasNull() ? null : prereq);
                c.setPoints(rs.getInt("points"));
                c.setCreatedAt(rs.getString("created_at"));
                list.add(c);
            }
        }
        return list;
    }

    public int createClue(Clue c) throws SQLException {
        String sql = "INSERT INTO clues (room_id, hint, description, prereq_clue_id, points) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, c.getRoomId());
            ps.setString(2, c.getHint());
            ps.setString(3, c.getDescription());
            if (c.getPrereqClueId() != null && c.getPrereqClueId() > 0) {
                ps.setInt(4, c.getPrereqClueId());
            } else {
                ps.setNull(4, Types.INTEGER);
            }
            ps.setInt(5, c.getPoints() > 0 ? c.getPoints() : 10);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public boolean deleteClue(int clueId) throws SQLException {
        String sql = "DELETE FROM clues WHERE clue_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, clueId);
            return ps.executeUpdate() > 0;
        }
    }
}
