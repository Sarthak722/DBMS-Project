package com.escaperoom.model;

import java.util.HashMap;
import java.util.Map;

public class Clue {
    private int clueId;
    private int roomId;
    private String roomTheme;
    private String hint;
    private String description;
    private Integer prereqClueId;
    private int points;
    private String createdAt;

    public Clue() {}

    public int getClueId() { return clueId; }
    public void setClueId(int clueId) { this.clueId = clueId; }

    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }

    public String getRoomTheme() { return roomTheme; }
    public void setRoomTheme(String roomTheme) { this.roomTheme = roomTheme; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPrereqClueId() { return prereqClueId; }
    public void setPrereqClueId(Integer prereqClueId) { this.prereqClueId = prereqClueId; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("clueId", clueId);
        map.put("roomId", roomId);
        map.put("roomTheme", roomTheme);
        map.put("hint", hint);
        map.put("description", description);
        map.put("prereqClueId", prereqClueId);
        map.put("points", points);
        map.put("createdAt", createdAt);
        return map;
    }
}
