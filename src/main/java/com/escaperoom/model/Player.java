package com.escaperoom.model;

import java.util.HashMap;
import java.util.Map;

public class Player {
    private int playerId;
    private String name;
    private String email;
    private String phone;
    private Integer age;
    private Integer teamId;
    private String teamName;
    private String joinedDate;
    private String createdAt;

    public Player() {}

    public int getPlayerId() { return playerId; }
    public void setPlayerId(int playerId) { this.playerId = playerId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Integer getTeamId() { return teamId; }
    public void setTeamId(Integer teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getJoinedDate() { return joinedDate; }
    public void setJoinedDate(String joinedDate) { this.joinedDate = joinedDate; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("playerId", playerId);
        map.put("name", name);
        map.put("email", email);
        map.put("phone", phone);
        map.put("age", age);
        map.put("teamId", teamId);
        map.put("teamName", teamName);
        map.put("joinedDate", joinedDate);
        map.put("createdAt", createdAt);
        return map;
    }
}
