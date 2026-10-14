package com.escaperoom.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Team {
    private int teamId;
    private String teamName;
    private int teamSize;
    private String createdAt;
    private List<Player> members = new ArrayList<>();

    public Team() {}

    public Team(int teamId, String teamName, int teamSize) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamSize = teamSize;
    }

    public int getTeamId() { return teamId; }
    public void setTeamId(int teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public int getTeamSize() { return teamSize; }
    public void setTeamSize(int teamSize) { this.teamSize = teamSize; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<Player> getMembers() { return members; }
    public void setMembers(List<Player> members) { this.members = members; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("teamId", teamId);
        map.put("teamName", teamName);
        map.put("teamSize", teamSize);
        map.put("createdAt", createdAt);
        List<Map<String, Object>> memberList = new ArrayList<>();
        if (members != null) {
            for (Player p : members) {
                memberList.add(p.toMap());
            }
        }
        map.put("members", memberList);
        return map;
    }
}
