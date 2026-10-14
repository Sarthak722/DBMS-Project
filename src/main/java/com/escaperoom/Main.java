package com.escaperoom;

import com.escaperoom.config.DatabaseConfig;
import com.escaperoom.controller.*;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

/**
 * Entry point for the Escape Room Management System.
 * Initializes JDBC database connection, registers modular REST controllers for the 4 parts,
 * and starts the embedded HTTP server serving the modern frontend.
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("==================================================================");
        System.out.println("   ESCAPE ROOM & PUZZLE HUNT MANAGEMENT SYSTEM");
        System.out.println("   DBMS Project | MySQL JDBC + Modular 4-Part Architecture");
        System.out.println("==================================================================");

        // 1. Initialize and test Database Connection
        DatabaseConfig.loadConfig();
        System.out.println("[*] Connecting to Database: " + DatabaseConfig.getUrl());
        System.out.println("[*] Database User: " + DatabaseConfig.getUser());

        boolean dbOk = DatabaseConfig.testConnection();
        if (dbOk) {
            System.out.println("[+] MySQL JDBC Connection established successfully!");
        } else {
            System.err.println("------------------------------------------------------------------");
            System.err.println("[!] WARNING: Could not connect to MySQL server at the specified URL.");
            System.err.println("    Please ensure:");
            System.err.println("    1. MySQL is running (e.g. systemctl start mysql)");
            System.err.println("    2. 'escape_room_db' database is created using sql/01_schema.sql");
            System.err.println("    3. Update credentials in db.properties (user/password)");
            System.err.println("    The web server will still launch so you can view the UI.");
            System.err.println("------------------------------------------------------------------");
        }

        // 2. Locate frontend directory
        String frontendDir = "frontend";
        File dir = new File(frontendDir);
        if (!dir.exists()) {
            // Check parent or working directory
            File alt = new File("../frontend");
            if (alt.exists()) {
                frontendDir = "../frontend";
            }
        }

        // 3. Start Embedded HTTP Server
        int port = DatabaseConfig.getServerPort();
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

            // Register 4 Modular API Part Controllers
            server.createContext("/api/part1", new VenueRoomController());
            server.createContext("/api/part2", new TeamPlayerController());
            server.createContext("/api/part3", new BookingController());
            server.createContext("/api/part4", new PaymentAnalyticsController());

            // Static Web Frontend Handler
            server.createContext("/", new StaticFileHandler(frontendDir));

            // Thread pool for concurrent requests
            server.setExecutor(Executors.newFixedThreadPool(16));
            server.start();

            System.out.println("==================================================================");
            System.out.println(" Server started successfully!");
            System.out.println(" Access Application: http://localhost:" + port + "/");
            System.out.println(" REST Endpoints:");
            System.out.println("   - Part 1 (Venues & Rooms):       http://localhost:" + port + "/api/part1/rooms");
            System.out.println("   - Part 2 (Teams & Players):      http://localhost:" + port + "/api/part2/teams");
            System.out.println("   - Part 3 (Bookings & Ops):       http://localhost:" + port + "/api/part3/bookings");
            System.out.println("   - Part 4 (Billing & Analytics):  http://localhost:" + port + "/api/part4/analytics");
            System.out.println("==================================================================");

        } catch (Exception e) {
            System.err.println("[-] Failed to start HTTP server: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
