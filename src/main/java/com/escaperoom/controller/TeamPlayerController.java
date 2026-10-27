package com.escaperoom.controller;

import com.escaperoom.dao.TeamPlayerDAO;
import com.escaperoom.model.Player;
import com.escaperoom.model.Team;
import com.escaperoom.util.JsonUtils;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Part 2: Teams & Players
 * Handles Teams, Player registrations, Roster assignments and team_members view.
 */
public class TeamPlayerController implements HttpHandler {

    private final TeamPlayerDAO dao = new TeamPlayerDAO();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (HttpHelper.handleCorsPreflight(exchange)) return;

        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod().toUpperCase();
        Map<String, String> params = HttpHelper.parseQueryParams(exchange.getRequestURI().getQuery());

        try {
            if (path.startsWith("/api/part2/teams")) {
                handleTeams(exchange, method, params);
            } else if (path.startsWith("/api/part2/players/assign")) {
                handleAssignPlayer(exchange, method);
            } else if (path.startsWith("/api/part2/players")) {
                handlePlayers(exchange, method, params);
            } else if (path.startsWith("/api/part2/rosters")) {
                handleRostersView(exchange, method);
            } else {
                HttpHelper.sendError(exchange, 404, "Endpoint not found: " + path);
            }
        } catch (Exception e) {
            HttpHelper.handleException(exchange, e);
        }
    }

    private void handleTeams(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Team> teams = dao.getAllTeams();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Team t : teams) mapped.add(t.toMap());
            HttpHelper.sendSuccess(exchange, "Teams fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            String name = (String) req.get("teamName");
            int id = dao.createTeam(name);
            HttpHelper.sendSuccess(exchange, "Team created with ID: " + id, id);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deleteTeam(id);
            HttpHelper.sendSuccess(exchange, "Team deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handlePlayers(HttpExchange exchange, String method, Map<String, String> params) throws Exception {
        if ("GET".equals(method)) {
            List<Player> players = dao.getAllPlayers();
            List<Map<String, Object>> mapped = new ArrayList<>();
            for (Player p : players) mapped.add(p.toMap());
            HttpHelper.sendSuccess(exchange, "Players fetched successfully", mapped);
        } else if ("POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            Player p = new Player();
            p.setName((String) req.get("name"));
            p.setEmail((String) req.get("email"));
            p.setPhone((String) req.get("phone"));
            Object age = req.get("age");
            if (age != null && !String.valueOf(age).trim().isEmpty()) {
                p.setAge(Integer.parseInt(String.valueOf(age)));
            }
            Object teamId = req.get("teamId");
            if (teamId != null && !String.valueOf(teamId).trim().isEmpty()) {
                p.setTeamId(Integer.parseInt(String.valueOf(teamId)));
            }
            int id = dao.createPlayer(p);
            HttpHelper.sendSuccess(exchange, "Player registered with ID: " + id, id);
        } else if ("DELETE".equals(method)) {
            int id = Integer.parseInt(params.getOrDefault("id", "0"));
            boolean deleted = dao.deletePlayer(id);
            HttpHelper.sendSuccess(exchange, "Player deleted: " + deleted, deleted);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleAssignPlayer(HttpExchange exchange, String method) throws Exception {
        if ("PUT".equals(method) || "POST".equals(method)) {
            String body = HttpHelper.readRequestBody(exchange);
            Map<String, Object> req = JsonUtils.parseJsonObject(body);
            int playerId = Integer.parseInt(String.valueOf(req.get("playerId")));
            Integer teamId = null;
            if (req.get("teamId") != null && !String.valueOf(req.get("teamId")).trim().isEmpty()) {
                teamId = Integer.parseInt(String.valueOf(req.get("teamId")));
            }
            boolean ok = dao.assignPlayerToTeam(playerId, teamId);
            HttpHelper.sendSuccess(exchange, "Player assigned to team successfully (team_size trigger executed)", ok);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }

    private void handleRostersView(HttpExchange exchange, String method) throws Exception {
        if ("GET".equals(method)) {
            List<Map<String, Object>> rosters = dao.getTeamMembersView();
            HttpHelper.sendSuccess(exchange, "Team Members View fetched successfully", rosters);
        } else {
            HttpHelper.sendError(exchange, 405, "Method Not Allowed");
        }
    }
}
