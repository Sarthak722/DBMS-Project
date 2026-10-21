package com.escaperoom.controller;

import com.escaperoom.dao.BookingDAO;
import com.escaperoom.model.Booking;
import com.escaperoom.model.HintUsage;
import com.escaperoom.util.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Part 3: Bookings & Live Game Operations
 * Handles Game Sessions, Real-time Slot scheduling, Hint tracking, and Game Outcomes.
 */
public class BookingController implements HttpHandler {

    private final BookingDAO dao = new BookingDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.handleCorsPreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> params = HttpHelper.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            if (path.startsWith("/api/part3/bookings/status")) {
                handleUpdateStatus(exchange, method);
            } else if (path.startsWith("/api/part3/bookings/complete")) {
                handleCompleteSession(exchange, method);
            } else if (path.startsWith("/api/part3/bookings")) {
                handleBookings(exchange, method, params);
            } else if (path.startsWith("/api/part3/hints")) {
                handleHints(exchange, method, params);
            } else {
                HttpHelper.sendError(exchange, 404, "Endpoint not found: " + path);
            }
        } catch (Exception e) {
            e.printStackTrace();
            HttpHelper.sendError(exchange, 500, "Database Error: " + e.getMessage());
        }
    }

    private void handleBookings(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            String sessionId = params.get("session");
            if (sessionId != null && !sessionId.trim().isEmpty()) {
                Booking b = dao.getBookingBySessionId(sessionId);
                if (b != null) {
                    HttpHelper.sendSuccess(exchange, "Booking session retrieved", b.toMap());
                } else {
                    HttpHelper.sendError(exchange, 404, "Session not found: " + sessionId);
                }
            } else {
                List<Booking> list = dao.getAllBookings();
                List<Map<String, Object>> mapped = new ArrayList<>();
                for (Booking b : list) mapped.add(b.toMap());
                HttpHelper.sendSuccess(exchange, "Bookings fetched successfully", mapped);
            }
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Booking b = new Booking();
            b.setSessionId((String) req.get("sessionId"));
            b.setStaffId(Integer.parseInt(String.valueOf(req.get("staffId"))));
            b.setRoomId(Integer.parseInt(String.valueOf(req.get("roomId"))));
            b.setTeamId(Integer.parseInt(String.valueOf(req.get("teamId"))));
            b.setStartTime((String) req.get("startTime"));
            b.setSlotEndTime((String) req.get("slotEndTime"));
            b.setStatus((String) req.getOrDefault("status", "Scheduled"));
            b.setOutcome((String) req.getOrDefault("outcome", "Pending"));
            int id = dao.createBooking(b);
            HttpHelper.sendSuccess(exchange, "Booking created with ID: " + id, id);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deleteBooking(id);
            HttpHelper.sendSuccess(exchange, "Booking cancelled/deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleUpdateStatus(HttpExchange exchange, String method) throws Exception {
        if ("PUT".equals(method) || "POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            String sessionId = (String) req.get("sessionId");
            String status = (String) req.get("status");
            boolean ok = dao.updateBookingStatus(sessionId, status);
            HttpHelper.sendSuccess(exchange, "Booking status updated to: " + status, ok);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleCompleteSession(HttpExchange exchange, String method) throws Exception {
        if ("POST".equals(method) || "PUT".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            String sessionId = (String) req.get("sessionId");
            String completeTime = (String) req.get("completeTime");
            String outcome = (String) req.get("outcome");
            boolean ok = dao.completeGameSession(sessionId, completeTime, outcome);
            HttpHelper.sendSuccess(exchange, "Game session completed with outcome: " + outcome, ok);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleHints(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            String sessionId = params.get("session");
            if (sessionId == null || sessionId.trim().isEmpty()) {
                HttpHelper.sendError(exchange, 400, "Query param 'session' is required");
                return;
            }
            List<HintUsage> list = dao.getHintsBySession(sessionId);
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (HintUsage h : list) mapped.add(h.toMap());
            HttpHelper.sendSuccess(exchange, "Hints retrieved for session " + sessionId, mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            int clueId = Integer.parseInt(String.valueOf(req.get("clueId")));
            String sessionId = (String) req.get("sessionId");
            int id = dao.logHintUsage(clueId, sessionId);
            HttpHelper.sendSuccess(exchange, "Hint usage recorded", id);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }
}
