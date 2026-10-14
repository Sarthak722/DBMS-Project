package com.escaperoom.config;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Database connection manager using JDBC.
 * Reads configuration from db.properties or system environment variables.
 */
public class DatabaseConfig {

    private static String url;
    private static String user;
    private static String password;
    private static String driver;
    private static int port = 8080;
    private static boolean initialized = false;

    static {
        loadConfig();
    }

    public static void loadConfig() {
        Properties props = new Properties();

        // 1. Try loading from working directory db.properties
        File localFile = new File("db.properties");
        if (localFile.exists()) {
            try (InputStream in = new FileInputStream(localFile)) {
                props.load(in);
            } catch (Exception ignored) {}
        }

        // 2. Try loading from classpath
        if (props.isEmpty()) {
            try (InputStream in = DatabaseConfig.class.getClassLoader().getResourceAsStream("db.properties")) {
                if (in != null) {
                    props.load(in);
                }
            } catch (Exception ignored) {}
        }

        // Resolve with fallback environment variables or defaults
        url = props.getProperty("db.url", System.getenv().getOrDefault("DB_URL", "jdbc:mysql://localhost:3306/escape_room_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"));
        user = props.getProperty("db.user", System.getenv().getOrDefault("DB_USER", "root"));
        password = props.getProperty("db.password", System.getenv().getOrDefault("DB_PASSWORD", ""));
        driver = props.getProperty("db.driver", "com.mysql.cj.jdbc.Driver");
        
        try {
            port = Integer.parseInt(props.getProperty("server.port", "8080"));
        } catch (NumberFormatException e) {
            port = 8080;
        }

        try {
            Class.forName(driver);
        } catch (ClassNotFoundException e) {
            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
            } catch (ClassNotFoundException e2) {
                try {
                    Class.forName("com.mysql.jdbc.Driver");
                } catch (Exception e3) {
                    System.err.println("[WARN] MySQL Driver not found on classpath: " + driver + ". Ensure lib/mysql-connector-j.jar is included in classpath.");
                }
            }
        }
        initialized = true;
    }

    public static Connection getConnection() throws SQLException {
        if (!initialized) {
            loadConfig();
        }
        return DriverManager.getConnection(url, user, password);
    }

    public static boolean testConnection() {
        try (Connection conn = getConnection()) {
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            System.err.println("[DB CONNECTION ERROR] " + e.getMessage());
            return false;
        }
    }

    public static String getUrl() { return url; }
    public static String getUser() { return user; }
    public static int getServerPort() { return port; }
}
