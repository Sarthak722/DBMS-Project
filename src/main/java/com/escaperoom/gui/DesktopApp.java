package com.escaperoom.gui;

import com.escaperoom.config.DatabaseConfig;
import com.escaperoom.dao.BookingDAO;
import com.escaperoom.dao.PaymentAnalyticsDAO;
import com.escaperoom.dao.TeamPlayerDAO;
import com.escaperoom.dao.VenueRoomDAO;
import com.escaperoom.model.Booking;
import com.escaperoom.model.Payment;
import com.escaperoom.model.Player;
import com.escaperoom.model.Room;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.util.List;

/**
 * Bonus Desktop GUI Client (Swing) with 4-Section Tabbed Interface.
 * Demonstrates direct JDBC table views and operations inside standard Java Desktop GUI.
 */
public class DesktopApp extends JFrame {

    private final VenueRoomDAO venueDAO = new VenueRoomDAO();
    private final TeamPlayerDAO teamDAO = new TeamPlayerDAO();
    private final BookingDAO bookingDAO = new BookingDAO();
    private final PaymentAnalyticsDAO paymentDAO = new PaymentAnalyticsDAO();

    public DesktopApp() {
        super("Escape Room Management System - DBMS Lab Client (Swing)");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(1000, 650);
        setLocationRelativeTo(null);

        JTabbedPane tabbedPane = new JTabbedPane();
        tabbedPane.setFont(new Font("SansSerif", Font.BOLD, 14));

        tabbedPane.addTab("1. Venues & Rooms", createPart1Panel());
        tabbedPane.addTab("2. Teams & Players", createPart2Panel());
        tabbedPane.addTab("3. Bookings & Operations", createPart3Panel());
        tabbedPane.addTab("4. Billing & Analytics", createPart4Panel());

        add(tabbedPane, BorderLayout.CENTER);

        // Status bar
        JPanel statusBar = new JPanel(new FlowLayout(FlowLayout.LEFT));
        statusBar.setBorder(BorderFactory.createEtchedBorder());
        boolean connected = DatabaseConfig.testConnection();
        JLabel statusLbl = new JLabel(connected ? 
            "Connected to MySQL DB: " + DatabaseConfig.getUrl() : 
            "Database Disconnected (Check db.properties)");
        statusLbl.setForeground(connected ? new Color(0, 140, 60) : Color.RED);
        statusBar.add(statusLbl);
        add(statusBar, BorderLayout.SOUTH);
    }

    private JPanel createPart1Panel() {
        JPanel p = new JPanel(new BorderLayout());
        String[] cols = {"Room ID", "Branch", "Theme Name", "Difficulty", "Capacity", "Status", "Base Price ($)"};
        DefaultTableModel model = new DefaultTableModel(cols, 0);
        JTable table = new JTable(model);
        p.add(new JScrollPane(table), BorderLayout.CENTER);

        JButton refreshBtn = new JButton("Refresh Rooms");
        refreshBtn.addActionListener(e -> {
            model.setRowCount(0);
            try {
                List<Room> rooms = venueDAO.getAllRooms();
                for (Room r : rooms) {
                    model.addRow(new Object[]{
                        r.getRoomId(), r.getBranchName(), r.getThemeName(),
                        r.getDifficulty(), r.getCapacity(), r.getStatus(), r.getBasePrice()
                    });
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error fetching rooms: " + ex.getMessage(), "DB Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(refreshBtn);
        p.add(top, BorderLayout.NORTH);
        return p;
    }

    private JPanel createPart2Panel() {
        JPanel p = new JPanel(new BorderLayout());
        String[] cols = {"Player ID", "Name", "Email", "Phone", "Age", "Assigned Team", "Joined Date"};
        DefaultTableModel model = new DefaultTableModel(cols, 0);
        JTable table = new JTable(model);
        p.add(new JScrollPane(table), BorderLayout.CENTER);

        JButton refreshBtn = new JButton("Refresh Players");
        refreshBtn.addActionListener(e -> {
            model.setRowCount(0);
            try {
                List<Player> players = teamDAO.getAllPlayers();
                for (Player pl : players) {
                    model.addRow(new Object[]{
                        pl.getPlayerId(), pl.getName(), pl.getEmail(),
                        pl.getPhone(), pl.getAge(), pl.getTeamName() != null ? pl.getTeamName() : "None", pl.getJoinedDate()
                    });
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage(), "DB Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(refreshBtn);
        p.add(top, BorderLayout.NORTH);
        return p;
    }

    private JPanel createPart3Panel() {
        JPanel p = new JPanel(new BorderLayout());
        String[] cols = {"Booking ID", "Session ID", "Room Theme", "Team Name", "Host Staff", "Start Time", "Status", "Outcome"};
        DefaultTableModel model = new DefaultTableModel(cols, 0);
        JTable table = new JTable(model);
        p.add(new JScrollPane(table), BorderLayout.CENTER);

        JButton refreshBtn = new JButton("Refresh Bookings");
        refreshBtn.addActionListener(e -> {
            model.setRowCount(0);
            try {
                List<Booking> bookings = bookingDAO.getAllBookings();
                for (Booking b : bookings) {
                    model.addRow(new Object[]{
                        b.getBookingId(), b.getSessionId(), b.getRoomTheme(),
                        b.getTeamName(), b.getStaffName(), b.getStartTime(), b.getStatus(), b.getOutcome()
                    });
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage(), "DB Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(refreshBtn);
        p.add(top, BorderLayout.NORTH);
        return p;
    }

    private JPanel createPart4Panel() {
        JPanel p = new JPanel(new BorderLayout());
        String[] cols = {"Payment ID", "Session ID", "Amount ($)", "Mode", "Status", "Timestamp", "Team Name"};
        DefaultTableModel model = new DefaultTableModel(cols, 0);
        JTable table = new JTable(model);
        p.add(new JScrollPane(table), BorderLayout.CENTER);

        JButton refreshBtn = new JButton("Refresh Payments");
        refreshBtn.addActionListener(e -> {
            model.setRowCount(0);
            try {
                List<Payment> payments = paymentDAO.getAllPayments();
                for (Payment py : payments) {
                    model.addRow(new Object[]{
                        py.getPaymentId(), py.getSessionId(), py.getAmount(),
                        py.getPaymentMode(), py.getPaymentStatus(), py.getTimestamp(), py.getTeamName()
                    });
                }
            } catch (Exception ex) {
                JOptionPane.showMessageDialog(this, "Error: " + ex.getMessage(), "DB Error", JOptionPane.ERROR_MESSAGE);
            }
        });

        JPanel top = new JPanel(new FlowLayout(FlowLayout.LEFT));
        top.add(refreshBtn);
        p.add(top, BorderLayout.NORTH);
        return p;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            DesktopApp app = new DesktopApp();
            app.setVisible(true);
        });
    }
}
