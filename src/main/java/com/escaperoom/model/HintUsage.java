package com.escaperoom.model;

import java.util.HashMap;
import java.util.Map;

public class HintUsage {
    private int hintUsageId;
    private int clueId;
    private String clueDescription;
    private String hintText;
    private String sessionId;
    private String requestedTime;
    private int hintNo;

    public HintUsage() {}

    public int getHintUsageId() { return hintUsageId; }
    public void setHintUsageId(int hintUsageId) { this.hintUsageId = hintUsageId; }

    public int getClueId() { return clueId; }
    public void setClueId(int clueId) { this.clueId = clueId; }

    public String getClueDescription() { return clueDescription; }
    public void setClueDescription(String clueDescription) { this.clueDescription = clueDescription; }

    public String getHintText() { return hintText; }
    public void setHintText(String hintText) { this.hintText = hintText; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getRequestedTime() { return requestedTime; }
    public void setRequestedTime(String requestedTime) { this.requestedTime = requestedTime; }

    public int getHintNo() { return hintNo; }
    public void setHintNo(int hintNo) { this.hintNo = hintNo; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("hintUsageId", hintUsageId);
        map.put("clueId", clueId);
        map.put("clueDescription", clueDescription);
        map.put("hintText", hintText);
        map.put("sessionId", sessionId);
        map.put("requestedTime", requestedTime);
        map.put("hintNo", hintNo);
        return map;
    }
}
