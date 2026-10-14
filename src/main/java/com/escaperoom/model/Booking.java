package com.escaperoom.model;

import java.util.HashMap;
import java.util.Map;

public class Booking {
    private int bookingId;
    private String sessionId;
    private int staffId;
    private String staffName;
    private int roomId;
    private String roomTheme;
    private Integer forumId;
    private int teamId;
    private String teamName;
    private String startTime;
    private String slotEndTime;
    private String completeTime;
    private String status;  // Scheduled, In-Progress, Completed, Cancelled, No-Show
    private String outcome; // Pending, Escaped, Failed, Timeout
    private String createdAt;
    private int hintsUsed;
    private Double paymentAmount;
    private String paymentStatus;

    public Booking() {}

    public int getBookingId() { return bookingId; }
    public void setBookingId(int bookingId) { this.bookingId = bookingId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public int getStaffId() { return staffId; }
    public void setStaffId(int staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public int getRoomId() { return roomId; }
    public void setRoomId(int roomId) { this.roomId = roomId; }

    public String getRoomTheme() { return roomTheme; }
    public void setRoomTheme(String roomTheme) { this.roomTheme = roomTheme; }

    public Integer getForumId() { return forumId; }
    public void setForumId(Integer forumId) { this.forumId = forumId; }

    public int getTeamId() { return teamId; }
    public void setTeamId(int teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getSlotEndTime() { return slotEndTime; }
    public void setSlotEndTime(String slotEndTime) { this.slotEndTime = slotEndTime; }

    public String getCompleteTime() { return completeTime; }
    public void setCompleteTime(String completeTime) { this.completeTime = completeTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public int getHintsUsed() { return hintsUsed; }
    public void setHintsUsed(int hintsUsed) { this.hintsUsed = hintsUsed; }

    public Double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(Double paymentAmount) { this.paymentAmount = paymentAmount; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("bookingId", bookingId);
        map.put("sessionId", sessionId);
        map.put("staffId", staffId);
        map.put("staffName", staffName);
        map.put("roomId", roomId);
        map.put("roomTheme", roomTheme);
        map.put("forumId", forumId);
        map.put("teamId", teamId);
        map.put("teamName", teamName);
        map.put("startTime", startTime);
        map.put("slotEndTime", slotEndTime);
        map.put("completeTime", completeTime);
        map.put("status", status);
        map.put("outcome", outcome);
        map.put("createdAt", createdAt);
        map.put("hintsUsed", hintsUsed);
        map.put("paymentAmount", paymentAmount != null ? paymentAmount : 0.0);
        map.put("paymentStatus", paymentStatus);
        return map;
    }
}
