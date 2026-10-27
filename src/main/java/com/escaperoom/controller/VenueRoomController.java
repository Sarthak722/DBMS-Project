package com.escaperoom.controller;

import com.escaperoom.dao.VenueRoomDAO;
import com.escaperoom.model.Branch;
import com.escaperoom.model.Clue;
import com.escaperoom.model.Room;
import com.escaperoom.model.Staff;
import com.escaperoom.util.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Part 1: Venues & Mystery Rooms
 * Handles Branches, Rooms, Staff, and Clues/Puzzles.
 */
public class VenueRoomController implements HttpHandler {

    private final VenueRoomDAO dao = new VenueRoomDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.handleCorsPreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> params = HttpHelper.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            if (path.startsWith("/api/part1/branches")) {
                handleBranches(exchange, method, params);
            } else if (path.startsWith("/api/part1/staff")) {
                handleStaff(exchange, method, params);
            } else if (path.startsWith("/api/part1/rooms")) {
                handleRooms(exchange, method, params);
            } else if (path.startsWith("/api/part1/clues")) {
                handleClues(exchange, method, params);
            } else {
                HttpHelper.sendError(exchange, 404, "Endpoint not found: " + path);
            }
        } catch (Exception e) {
            HttpHelper.handleException(exchange, e);
        }
    }

    private void handleBranches(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Branch> branches = dao.getAllBranches();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Branch b : branches) mapped.add(b.toMap());
            HttpHelper.sendSuccess(exchange, "Branches fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Branch b = new Branch();
            b.setName((String) req.get("name"));
            b.setCity((String) req.get("city"));
            b.setStreet((String) req.get("street"));
            b.setState((String) req.get("state"));
            b.setZip((String) req.get("zip"));
            b.setPhone((String) req.get("phone"));
            int id = dao.createBranch(b);
            HttpHelper.sendSuccess(exchange, "Branch created with ID: " + id, id);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deleteBranch(id);
            HttpHelper.sendSuccess(exchange, "Branch deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleStaff(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Staff> staffList = dao.getAllStaff();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Staff s : staffList) mapped.add(s.toMap());
            HttpHelper.sendSuccess(exchange, "Staff list fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Staff s = new Staff();
            s.setBranchId(Integer.parseInt(String.valueOf(req.get("branchId"))));
            s.setName((String) req.get("name"));
            s.setRole((String) req.get("role"));
            s.setPayTime((String) req.getOrDefault("payTime", "Monthly"));
            s.setInTime((String) req.get("inTime"));
            s.setOutTime((String) req.get("outTime"));
            int id = dao.createStaff(s);
            HttpHelper.sendSuccess(exchange, "Staff added with ID: " + id, id);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deleteStaff(id);
            HttpHelper.sendSuccess(exchange, "Staff deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleRooms(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Room> rooms = dao.getAllRooms();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Room r : rooms) mapped.add(r.toMap());
            HttpHelper.sendSuccess(exchange, "Rooms fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Room r = new Room();
            r.setBranchId(Integer.parseInt(String.valueOf(req.get("branchId"))));
            r.setThemeName((String) req.get("themeName"));
            r.setDifficulty((String) req.getOrDefault("difficulty", "Medium"));
            r.setCapacity(Integer.parseInt(String.valueOf(req.getOrDefault("capacity", 6))));
            r.setStatus((String) req.getOrDefault("status", "Available"));
            r.setBasePrice(new BigDecimal(String.valueOf(req.getOrDefault("basePrice", 100.00))));
            r.setDuration(Integer.parseInt(String.valueOf(req.getOrDefault("duration", 60))));
            int id = dao.createRoom(r);
            HttpHelper.sendSuccess(exchange, "Escape room created with ID: " + id, id);
        } else if ("PUT".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            int roomId = Integer.parseInt(String.valueOf(req.get("roomId")));
            String status = (String) req.get("status");
            boolean updated = dao.updateRoomStatus(roomId, status);
            HttpHelper.sendSuccess(exchange, "Room status updated", updated);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deleteRoom(id);
            HttpHelper.sendSuccess(exchange, "Room deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleClues(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Clue> clues = dao.getAllClues();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Clue c : clues) mapped.add(c.toMap());
            HttpHelper.sendSuccess(exchange, "Clues fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Clue c = new Clue();
            c.setRoomId(Integer.parseInt(String.valueOf(req.get("roomId"))));
            c.setDescription((String) req.get("description"));
            c.setHint((String) req.get("hint"));
            Object prereq = req.get("prereqClueId");
            if (prereq != null && !String.valueOf(prereq).trim().isEmpty()) {
                c.setPrereqClueId(Integer.parseInt(String.valueOf(prereq)));
            }
            c.setPoints(Integer.parseInt(String.valueOf(req.getOrDefault("points", 10))));
            int id = dao.createClue(c);
            HttpHelper.sendSuccess(exchange, "Clue added with ID: " + id, id);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deleteClue(id);
            HttpHelper.sendSuccess(exchange, "Clue deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }
}
