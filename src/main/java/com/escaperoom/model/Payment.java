package com.escaperoom.model;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class Payment {
    private int paymentId;
    private String sessionId;
    private BigDecimal amount;
    private String paymentMode;    // Cash, Credit Card, Debit Card, UPI, Net Banking
    private String paymentStatus;  // Pending, Completed, Failed, Refunded
    private String timestamp;
    private String teamName;
    private String roomTheme;

    public Payment() {}

    public int getPaymentId() { return paymentId; }
    public void setPaymentId(int paymentId) { this.paymentId = paymentId; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getRoomTheme() { return roomTheme; }
    public void setRoomTheme(String roomTheme) { this.roomTheme = roomTheme; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("paymentId", paymentId);
        map.put("sessionId", sessionId);
        map.put("amount", amount != null ? amount.doubleValue() : 0.0);
        map.put("paymentMode", paymentMode);
        map.put("paymentStatus", paymentStatus);
        map.put("timestamp", timestamp);
        map.put("teamName", teamName);
        map.put("roomTheme", roomTheme);
        return map;
    }
}
