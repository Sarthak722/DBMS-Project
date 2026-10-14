package com.escaperoom.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AnalyticsSummary {
    private double totalRevenue;
    private int totalBookings;
    private int totalRooms;
    private int totalTeams;
    private int totalPlayers;
    private double escapeRate;
    private List<Map<String, Object>> revenueByMode = new ArrayList<>();
    private List<Map<String, Object>> revenueByBranch = new ArrayList<>();
    private List<Map<String, Object>> leaderboard = new ArrayList<>();
    private List<Map<String, Object>> difficultyStats = new ArrayList<>();

    public AnalyticsSummary() {}

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

    public int getTotalRooms() { return totalRooms; }
    public void setTotalRooms(int totalRooms) { this.totalRooms = totalRooms; }

    public int getTotalTeams() { return totalTeams; }
    public void setTotalTeams(int totalTeams) { this.totalTeams = totalTeams; }

    public int getTotalPlayers() { return totalPlayers; }
    public void setTotalPlayers(int totalPlayers) { this.totalPlayers = totalPlayers; }

    public double getEscapeRate() { return escapeRate; }
    public void setEscapeRate(double escapeRate) { this.escapeRate = escapeRate; }

    public List<Map<String, Object>> getRevenueByMode() { return revenueByMode; }
    public void setRevenueByMode(List<Map<String, Object>> revenueByMode) { this.revenueByMode = revenueByMode; }

    public List<Map<String, Object>> getRevenueByBranch() { return revenueByBranch; }
    public void setRevenueByBranch(List<Map<String, Object>> revenueByBranch) { this.revenueByBranch = revenueByBranch; }

    public List<Map<String, Object>> getLeaderboard() { return leaderboard; }
    public void setLeaderboard(List<Map<String, Object>> leaderboard) { this.leaderboard = leaderboard; }

    public List<Map<String, Object>> getDifficultyStats() { return difficultyStats; }
    public void setDifficultyStats(List<Map<String, Object>> difficultyStats) { this.difficultyStats = difficultyStats; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalRevenue", totalRevenue);
        map.put("totalBookings", totalBookings);
        map.put("totalRooms", totalRooms);
        map.put("totalTeams", totalTeams);
        map.put("totalPlayers", totalPlayers);
        map.put("escapeRate", escapeRate);
        map.put("revenueByMode", revenueByMode);
        map.put("revenueByBranch", revenueByBranch);
        map.put("leaderboard", leaderboard);
        map.put("difficultyStats", difficultyStats);
        return map;
    }
}
