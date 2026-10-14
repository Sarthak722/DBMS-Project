# 🗝️ Escape Room & Puzzle Hunt Management System

A full-stack, modular DBMS lab project built with **MySQL 8.0+**, **Java (JDBC)**, and a **Modern 4-Part Web Interface** (plus a bonus Java Swing GUI client).

---

## 🏛️ System Architecture: Split into 4 Modular Parts

The system is organized into **4 distinct, decoupled functional modules** across the database, backend DAO/Controllers, and frontend views:

```
                                  ┌────────────────────────┐
                                  │   Web Frontend / GUI   │
                                  │   (4 Modular Parts)    │
                                  └───────────┬────────────┘
                                              │ REST (JSON)
                                  ┌───────────▼────────────┐
                                  │   Java HTTP Backend    │
                                  │  (Embedded / Port 8080)│
                                  └───────────┬────────────┘
                                              │ JDBC
                     ┌────────────────────────┼────────────────────────┐
                     │                        │                        │
            ┌────────▼───────┐       ┌────────▼───────┐       ┌────────▼───────┐
            │ Part 1: Venues │       │ Part 2: Teams  │       │ Part 3: Bookings│
            │   & Rooms DAO  │       │ & Players DAO  │       │ & Operations   │
            └────────┬───────┘       └────────┬───────┘       └────────┬───────┘
                     │                        │                        │
                     └────────────────────────┼────────────────────────┘
                                              │
                                     ┌────────▼───────┐
                                     │ Part 4: Billing│
                                     │  & Analytics   │
                                     └────────┬───────┘
                                              │
                                  ┌───────────▼────────────┐
                                  │     MySQL Database     │
                                  │    escape_room_db      │
                                  └────────────────────────┘
```

| Part | Functional Domain | Database Entities & Views | Key Operations & Features |
| :--- | :--- | :--- | :--- |
| **Part 1** | **Venues & Mystery Rooms** | `branches`, `rooms`, `staff`, `clues` | Multi-branch venue management, room themes, difficulty, pricing, clue prerequisites hierarchy (self-referencing FK), staff shift rosters. |
| **Part 2** | **Teams & Players** | `teams`, `players`, View `team_members` | Player registration, team assembly, **automated `team_size` maintenance via 3 SQL Triggers** (INSERT/UPDATE/DELETE), roster management. |
| **Part 3** | **Bookings & Live Game Operations** | `bookings`, `hint_usage` | Time-slot scheduling, Game Master Live Control Room with live stopwatch countdown timer, hint dispatcher logger, outcome recorder (Escaped/Failed/Timeout). |
| **Part 4** | **Billing, Payments & Analytics** | `payments`, Views `branch_phones`, `player_phones` | 1:1 Booking Payment processing, settlement status, Revenue analytics by branch & payment mode, **Hall of Fame Escape Leaderboard**, direct view queries. |

---

## 📁 Repository Structure

```
DBMS-Project/
├── pom.xml                               # Maven project configuration (mysql-connector-j)
├── db.properties                         # MySQL database connection configuration
├── run.sh                                # 1-click build and execution script
├── setup_mysql.sh                        # Database setup script (runs all 3 SQL scripts)
│
├── sql/
│   ├── 01_schema.sql                     # DDL: Tables, FK constraints, Triggers, Views, Indexes
│   ├── 02_seed.sql                       # DML: Realistic escape rooms, branches, clues, teams & games
│   └── 03_queries_procedures.sql         # Complex joins, escape leaderboard query, stored procedure
│
├── src/main/java/com/escaperoom/
│   ├── Main.java                         # Server bootstrap (registers 4 part controllers & static files)
│   ├── config/
│   │   └── DatabaseConfig.java           # JDBC Connection Manager (reads db.properties)
│   ├── model/                            # POJO models for the 4 parts
│   │   ├── Branch.java, Staff.java, Room.java, Clue.java   (Part 1)
│   │   ├── Team.java, Player.java                          (Part 2)
│   │   ├── Booking.java, HintUsage.java                    (Part 3)
│   │   └── Payment.java, AnalyticsSummary.java             (Part 4)
│   ├── dao/                              # JDBC Data Access Objects
│   │   ├── VenueRoomDAO.java             (Part 1 JDBC CRUD)
│   │   ├── TeamPlayerDAO.java            (Part 2 JDBC CRUD)
│   │   ├── BookingDAO.java               (Part 3 JDBC CRUD)
│   │   └── PaymentAnalyticsDAO.java      (Part 4 JDBC CRUD & Analytics)
│   ├── controller/                       # Modular REST API Handlers
│   │   ├── HttpHelper.java               (CORS, JSON serialization, query parsing)
│   │   ├── VenueRoomController.java      (/api/part1/...)
│   │   ├── TeamPlayerController.java     (/api/part2/...)
│   │   ├── BookingController.java        (/api/part3/...)
│   │   ├── PaymentAnalyticsController.java (/api/part4/...)
│   │   └── StaticFileHandler.java        (Serves frontend/ assets)
│   ├── util/
│   │   └── JsonUtils.java                (Zero-dependency JSON parser & serializer)
│   └── gui/
│       └── DesktopApp.java               (Bonus 4-Tab Swing Desktop GUI Client)
│
└── frontend/                             # Modern Web Frontend
    ├── index.html                        # Application shell with 4 modular sections & control room
    ├── css/
    │   └── style.css                     # Dark mystery theme, glassmorphism, responsive grids
    └── js/
        ├── api.js                        # Centralized async fetch client to Java backend
        ├── part1_venues.js               # Part 1 UI logic (Venues, Rooms, Clues, Staff)
        ├── part2_teams.js                # Part 2 UI logic (Teams, Players, Trigger team size)
        ├── part3_bookings.js             # Part 3 UI logic (Bookings & Live Game Control Room)
        ├── part4_analytics.js            # Part 4 UI logic (Payments, Leaderboard, SQL views)
        └── app.js                        # Application coordinator & toast notifications
```

---

## ⚡ Quick Start Guide

### Step 1: Configure Database Credentials
Edit [`db.properties`](file:///home/sarthak/Documents/5_sem/LABS/DBMS/DBMS-Project/db.properties):
```properties
db.url=jdbc:mysql://localhost:3306/escape_room_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=root
db.password=YOUR_PASSWORD
server.port=8080
```

### Step 2: Initialize Database Schema & Seed Data
Run the setup script:
```bash
./setup_mysql.sh root
```
*Or execute manually in MySQL:*
```sql
SOURCE sql/01_schema.sql;
SOURCE sql/02_seed.sql;
SOURCE sql/03_queries_procedures.sql;
```

### Step 3: Run the Application
Execute the runner script:
```bash
./run.sh
```
*Or using Maven directly:*
```bash
mvn clean compile exec:java
```

Once started, open your web browser at:
👉 **`http://localhost:8080/`**

---

## 🖥️ Bonus: Java Desktop GUI (Swing)
If your lab evaluator requires a pure Java Desktop application instead of the web browser, launch the included Swing client:
```bash
# Compile and run DesktopApp
mvn exec:java -Dexec.mainClass="com.escaperoom.gui.DesktopApp"
```

---

## 🔌 Modular REST API Specification

### Part 1: Venues & Mystery Rooms
- `GET /api/part1/rooms` : List all escape rooms with assigned branch & clue count
- `POST /api/part1/rooms` : Create a new escape room chamber
- `PUT /api/part1/rooms/status` : Change status (`Available`, `Occupied`, `Maintenance`, `Inactive`)
- `GET /api/part1/branches` : List all physical branches
- `POST /api/part1/branches` : Register a new branch location
- `GET /api/part1/staff` : List staff and game masters
- `POST /api/part1/staff` : Register a new staff member with shift timings
- `GET /api/part1/clues` : List clues and self-referencing prerequisite puzzles
- `POST /api/part1/clues` : Add a new clue

### Part 2: Teams & Players
- `GET /api/part2/teams` : List teams with dynamic `team_size` and rosters
- `POST /api/part2/teams` : Register a new team
- `GET /api/part2/players` : List all registered players
- `POST /api/part2/players` : Register a new player
- `PUT /api/part2/players/assign` : Assign player to team (triggers update `team_size`)
- `GET /api/part2/rosters` : Query SQL View `team_members`

### Part 3: Bookings & Operations
- `GET /api/part3/bookings` : List all game bookings
- `POST /api/part3/bookings` : Schedule a new booking session
- `PUT /api/part3/bookings/status` : Update booking status (`Scheduled`, `In-Progress`, `Completed`, `Cancelled`)
- `POST /api/part3/bookings/complete` : Finalize session with completion time and outcome (`Escaped`, `Failed`, `Timeout`)
- `GET /api/part3/hints?session=SESS-ID` : Get all hints requested during a session
- `POST /api/part3/hints` : Dispatch a hint (logs to `hint_usage`)

### Part 4: Billing, Payments & Analytics
- `GET /api/part4/payments` : List all 1:1 booking payments
- `PUT /api/part4/payments/status` : Update payment status (`Completed`, `Pending`, `Refunded`)
- `GET /api/part4/analytics` : Summary KPIs, realized revenue, revenue by mode and branch
- `GET /api/part4/leaderboard` : Fastest escape records ranked by completion time
- `GET /api/part4/views/phones` : Direct query of SQL views `branch_phones` and `player_phones`

---

## 🧩 DBMS Features Implemented
1. **Normalization**: Up to 3NF / BCNF. Address flattened into atomic columns, 1:1 payment relationship enforced by `UNIQUE` session_id constraint.
2. **Automated Triggers**:
   - `trg_player_add_team_size`: Increments `teams.team_size` on player insert.
   - `trg_player_update_team_size`: Adjusts `teams.team_size` on transfer or team departure.
   - `trg_player_delete_team_size`: Decrements `teams.team_size` on player deletion.
   - `trg_booking_auto_payment`: Automatically initializes pending payment record when a booking is created.
3. **Database Views**:
   - `team_members`: Legacy view for team-player membership queries.
   - `branch_phones`: Flattened phone directory for branches.
   - `player_phones`: Flattened phone directory for players.
4. **Performance Indexes**:
   - On `bookings(room_id, start_time, slot_end_time)` for fast collision checking.
   - On `players(email)` and `players(team_id)`.
   - On `hint_usage(session_id)`.
5. **Stored Procedure**:
   - `sp_complete_game_session`: Atomically updates game outcome and completion time.
# DBMS-Project
