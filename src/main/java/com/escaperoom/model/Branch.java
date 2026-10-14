package com.escaperoom.model;

import java.util.HashMap;
import java.util.Map;

public class Branch {
    private int branchId;
    private String name;
    private String city;
    private String street;
    private String state;
    private String zip;
    private String phone;
    private String createdAt;

    public Branch() {}

    public Branch(int branchId, String name, String city, String street, String state, String zip, String phone) {
        this.branchId = branchId;
        this.name = name;
        this.city = city;
        this.street = street;
        this.state = state;
        this.zip = zip;
        this.phone = phone;
    }

    public int getBranchId() { return branchId; }
    public void setBranchId(int branchId) { this.branchId = branchId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZip() { return zip; }
    public void setZip(String zip) { this.zip = zip; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("branchId", branchId);
        map.put("name", name);
        map.put("city", city);
        map.put("street", street);
        map.put("state", state);
        map.put("zip", zip);
        map.put("phone", phone);
        map.put("createdAt", createdAt);
        return map;
    }
}
