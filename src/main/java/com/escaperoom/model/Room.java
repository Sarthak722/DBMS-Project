package com.escaperoom.model;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class Room {
    private int roomId;
    private int branchId;
    private String branchName;
    private String themeName;
    private String difficulty; // Easy, Medium, Hard, Expert
    private int capacity;
    private String status;     // Available, Occupied, Maintenance, Inactive
    private BigDecimal basePrice;
    private int duration;      // minutes
    private int clueCount;
    private String createdAt;

    public Room() {}

    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }

    public int getBranchId() { return branchId; }
    public void setBranchId(int branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getThemeName() { return themeName; }
    public void setThemeName(String themeName) { this.themeName = themeName; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public int getClueCount() { return clueCount; }
    public void setClueCount(int clueCount) { this.clueCount = clueCount; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("roomId", roomId);
        map.put("branchId", branchId);
        map.put("branchName", branchName);
        map.put("themeName", themeName);
        map.put("difficulty", difficulty);
        map.put("capacity", capacity);
        map.put("status", status);
        map.put("basePrice", basePrice != null ? basePrice.doubleValue() : 0.0);
        map.put("duration", duration);
        map.put("clueCount", clueCount);
        map.put("createdAt", createdAt);
        return map;
    }
}
