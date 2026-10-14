package com.escaperoom.controller;

import com.escaperoom.dao.PaymentAnalyticsDAO;
import com.escaperoom.model.AnalyticsSummary;
import com.escaperoom.model.Payment;
import com.escaperoom.util.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Part 4: Billing, Payments & Analytics
 * Handles Financial Transactions, Analytics KPIs, Escape Leaderboard, and Schema Views.
 */
public class PaymentAnalyticsController implements HttpHandler {

    private final PaymentAnalyticsDAO dao = new PaymentAnalyticsDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.handleCorsPreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> params = HttpHelper.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            if (path.startsWith("/api/part4/payments/status")) {
                handleUpdatePaymentStatus(exchange, method);
            } else if (path.startsWith("/api/part4/payments")) {
                handlePayments(exchange, method, params);
            } else if (path.startsWith("/api/part4/analytics")) {
                handleAnalytics(exchange, method);
            } else if (path.startsWith("/api/part4/leaderboard")) {
                handleLeaderboard(exchange, method);
            } else if (path.startsWith("/api/part4/views/phones")) {
                handlePhoneViews(exchange, method);
            } else {
                HttpHelper.sendError(exchange, 404, "Endpoint not found: " + path);
            }
        } catch (Exception e) {
            e.printStackTrace();
            HttpHelper.sendError(exchange, 500, "Database Error: " + e.getMessage());
        }
    }

    private void handlePayments(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Payment> list = dao.getAllPayments();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Payment p : list) mapped.add(p.toMap());
            HttpHelper.sendSuccess(exchange, "Payments fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Payment p = new Payment();
            p.setSessionId((String) req.get("sessionId"));
            p.setAmount(new BigDecimal(String.valueOf(req.getOrDefault("amount", 100.00))));
            p.setPaymentMode((String) req.getOrDefault("paymentMode", "UPI"));
            p.setPaymentStatus((String) req.getOrDefault("paymentStatus", "Completed"));
            int id = dao.createPayment(p);
            HttpHelper.sendSuccess(exchange, "Payment transaction recorded", id);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleUpdatePaymentStatus(HttpExchange exchange, String method) throws Exception {
        if ("PUT".equals(method) || "POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            int paymentId = Integer.parseInt(String.valueOf(req.get("paymentId")));
            String status = (String) req.getOrDefault("paymentStatus", "Completed");
            String mode = (String) req.getOrDefault("paymentMode", "UPI");
            boolean ok = dao.updatePaymentStatus(paymentId, status, mode);
            HttpHelper.sendSuccess(exchange, "Payment updated to " + status + " (" + mode + ")", ok);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleAnalytics(HttpExchange exchange, String method) throws Exception {
        if ("GET".equals(method)) {
            AnalyticsSummary summary = dao.getAnalyticsSummary();
            HttpHelper.sendSuccess(exchange, "Analytics summary calculated", summary.toMap());
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleLeaderboard(HttpExchange exchange, String method) throws Exception {
        if ("GET".equals(method)) {
            List<Map<String, Object>> lb = dao.getEscapeLeaderboard();
            HttpHelper.sendSuccess(exchange, "Leaderboard retrieved", lb);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handlePhoneViews(HttpExchange exchange, String method) throws Exception {
        if ("GET".equals(method)) {
            Map<String, Object> result = new HashMap<>();
            result.put("branchPhones", dao.getBranchPhonesView());
            result.put("playerPhones", dao.getPlayerPhonesView());
            HttpHelper.sendSuccess(exchange, "Phone Views retrieved", result);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }
}
