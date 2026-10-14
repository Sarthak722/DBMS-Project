package com.escaperoom.dao;

import com.escaperoom.config.DatabaseConfig;
import com.escaperoom.model.Player;
import com.escaperoom.model.Team;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Section 2: Teams & Players DAO
 * Handles Teams, Player Registrations, Roster assignments and views.
 */
public class TeamPlayerDAO {

    // --- TEAMS ---
    public List<Team> getAllTeams() throws SQLException {
        List<Team> list = new ArrayList<>();
        String sql = "SELECT team_id, team_name, team_size, created_at FROM teams ORDER BY team_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Team t = new Team(
                    rs.getInt("team_id"),
                    rs.getString("team_name"),
                    rs.getInt("team_size")
                );
                t.setCreatedAt(rs.getString("created_at"));
                list.add(t);
            }
        }

        // Fetch team members for each team
        for (Team t : list) {
            t.setMembers(getPlayersByTeam(t.getTeamId()));
        }
        return list;
    }

    public int createTeam(String teamName) throws SQLException {
        String sql = "INSERT INTO teams (team_name, team_size) VALUES (?, 0)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, teamName);
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public boolean deleteTeam(int teamId) throws SQLException {
        // Disassociate players first or rely on FK cascade
        String sql = "DELETE FROM teams WHERE team_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, teamId);
            return ps.executeUpdate() > 0;
        }
    }

    // --- PLAYERS ---
    public List<Player> getAllPlayers() throws SQLException {
        List<Player> list = new ArrayList<>();
        String sql = "SELECT p.player_id, p.name, p.email, p.phone, p.age, p.team_id, t.team_name, p.joined_date, p.created_at " +
                     "FROM players p LEFT JOIN teams t ON p.team_id = t.team_id ORDER BY p.player_id ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                list.add(mapPlayer(rs));
            }
        }
        return list;
    }

    public List<Player> getPlayersByTeam(int teamId) throws SQLException {
        List<Player> list = new ArrayList<>();
        String sql = "SELECT p.player_id, p.name, p.email, p.phone, p.age, p.team_id, t.team_name, p.joined_date, p.created_at " +
                     "FROM players p LEFT JOIN teams t ON p.team_id = t.team_id WHERE p.team_id = ? ORDER BY p.name ASC";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, teamId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    list.add(mapPlayer(rs));
                }
            }
        }
        return list;
    }

    public int createPlayer(Player p) throws SQLException {
        String sql = "INSERT INTO players (name, email, phone, age, team_id, joined_date) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, p.getName());
            ps.setString(2, p.getEmail());
            ps.setString(3, p.getPhone());
            if (p.getAge() != null && p.getAge() > 0) {
                ps.setInt(4, p.getAge());
            } else {
                ps.setNull(4, Types.INTEGER);
            }
            if (p.getTeamId() != null && p.getTeamId() > 0) {
                ps.setInt(5, p.getTeamId());
                ps.setDate(6, new java.sql.Date(System.currentTimeMillis()));
            } else {
                ps.setNull(5, Types.INTEGER);
                ps.setNull(6, Types.DATE);
            }
            ps.executeUpdate();
            try (ResultSet rs = ps.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        return -1;
    }

    public boolean assignPlayerToTeam(int playerId, Integer teamId) throws SQLException {
        String sql = "UPDATE players SET team_id = ?, joined_date = ? WHERE player_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (teamId != null && teamId > 0) {
                ps.setInt(1, teamId);
                ps.setDate(2, new java.sql.Date(System.currentTimeMillis()));
            } else {
                ps.setNull(1, Types.INTEGER);
                ps.setNull(2, Types.DATE);
            }
            ps.setInt(3, playerId);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deletePlayer(int playerId) throws SQLException {
        String sql = "DELETE FROM players WHERE player_id = ?";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, playerId);
            return ps.executeUpdate() > 0;
        }
    }

    // --- QUERY BACKWARD-COMPATIBLE VIEWS ---
    public List<Map<String, Object>> getTeamMembersView() throws SQLException {
        List<Map<String, Object>> list = new ArrayList<>();
        String sql = "SELECT tm.team_id, t.team_name, tm.player_id, p.name AS player_name, tm.joined_date " +
                     "FROM team_members tm " +
                     "JOIN teams t ON tm.team_id = t.team_id " +
                     "JOIN players p ON tm.player_id = p.player_id ORDER BY tm.team_id, tm.player_id";
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> map = new HashMap<>();
                map.put("teamId", rs.getInt("team_id"));
                map.put("teamName", rs.getString("team_name"));
                map.put("playerId", rs.getInt("player_id"));
                map.put("playerName", rs.getString("player_name"));
                map.put("joinedDate", rs.getString("joined_date"));
                list.add(map);
            }
        }
        return list;
    }

    private Player mapPlayer(ResultSet rs) throws SQLException {
        Player p = new Player();
        p.setPlayerId(rs.getInt("player_id"));
        p.setName(rs.getString("name"));
        p.setEmail(rs.getString("email"));
        p.setPhone(rs.getString("phone"));
        int age = rs.getInt("age");
        p.setAge(rs.wasNull() ? null : age);
        int teamId = rs.getInt("team_id");
        p.setTeamId(rs.wasNull() ? null : teamId);
        p.setTeamName(rs.getString("team_name"));
        p.setJoinedDate(rs.getString("joined_date"));
        p.setCreatedAt(rs.getString("created_at"));
        return p;
    }
}
