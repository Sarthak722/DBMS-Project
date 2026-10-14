package com.escaperoom.model;

import java.util.HashMap;
import java.util.Map;

public class Staff {
    private int staffId;
    private int branchId;
    private String branchName;
    private String name;
    private String role;
    private String payTime;
    private String inTime;
    private String outTime;
    private String createdAt;

    public Staff() {}

    public int getStaffId() { return staffId; }
    public void setStaffId(int staffId) { this.staffId = staffId; }

    public int getBranchId() { return branchId; }
    public void setBranchId(int branchId) { this.branchId = branchId; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPayTime() { return payTime; }
    public void setPayTime(String payTime) { this.payTime = payTime; }

    public String getInTime() { return inTime; }
    public void setInTime(String inTime) { this.inTime = inTime; }

    public String getOutTime() { return outTime; }
    public void setOutTime(String outTime) { this.outTime = outTime; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("staffId", staffId);
        map.put("branchId", branchId);
        map.put("branchName", branchName);
        map.put("name", name);
        map.put("role", role);
        map.put("payTime", payTime);
        map.put("inTime", inTime);
        map.put("outTime", outTime);
        map.put("createdAt", createdAt);
        return map;
    }
}
