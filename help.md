# 🗝️ EnigmaVault : 4-Member Collaborative Development & Git Push Guide

> **DBMS Lab Project:** Escape Room & Puzzle Hunt Operations Management System  
> **Tech Stack:** MySQL 8.0+ &bull; Java (JDBC) &bull; Vanilla HTML5/CSS3/ES6 Modern Web App &bull; Bonus Java Swing Client  
> **Team Size:** 4 Students &bull; **Development Timeline:** 3-Day Collaborative Roadmap

---

## 📋 Table of Contents
1. [Master 4-Member Contribution Matrix](#1-master-4-member-contribution-matrix)
2. [Database Collaboration Strategy (2 Core + 2 Incremental)](#2-database-collaboration-strategy-2-core--2-incremental)
3. [The 3-Day Collaborative Git Push Roadmap](#3-the-3-day-collaborative-git-push-roadmap)
4. [How to Apply Git History & Push to GitHub](#4-how-to-apply-git-history--push-to-github)
   - [Option A: 1-Click Automated Git History Script (Recommended)](#option-a-1-click-automated-git-history-script-recommended)
   - [Option B: Manual Branching & Push Workflow](#option-b-manual-branching--push-workflow)
5. [Frontend Redesign: Natural Operations Suite vs Forced Academic Split](#5-frontend-redesign-natural-operations-suite-vs-forced-academic-split)
6. [Local Setup, Execution & Testing Guide](#6-local-setup-execution--testing-guide)
7. [5-Minute Lab Viva Presentation & Defense Script](#7-5-minute-lab-viva-presentation--defense-script)

---

## 1. 👥 Master 4-Member Contribution Matrix

Each team member is assigned a clear, distinct domain across the database schema, Java backend (Model, DAO, Controller), and modern frontend interface:

| Member & Role | SQL Database Deliverables | Java Backend Classes | Frontend UI & Views | Viva Exam Defense Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1**<br>*(Physical Domain Lead)* | **Core Physical Schema:**<br>• `branches` (1NF address flattening)<br>• `staff` (shifts & roles)<br>• `rooms` (themes, capacity, check constraints)<br>• `clues` (self-referencing FK `prereq_clue_id`) | **Models:** `Branch`, `Staff`, `Room`, `Clue`<br>**DAO:** `VenueRoomDAO.java`<br>**Controller:** `VenueRoomController.java`<br>**Core:** `DatabaseConfig.java`, `HttpHelper.java` | **Chamber & Venue Views:**<br>• Room Chamber Catalog & Difficulty Badges<br>• Physical Branches Directory<br>• Puzzle Clue Hierarchy & Prereqs Tree<br>• Staff Shift Timings | Normalization to 3NF, flattening composite attributes, self-referencing foreign key hierarchy for puzzle unlock chains. |
| **Member 2**<br>*(Transactional Domain Lead)* | **Core Transactional Schema:**<br>• `teams` (squad identity)<br>• `players` (customer profiles, email UNIQUE)<br>• `bookings` (scheduling, session codes)<br>• `hint_usage` (puzzle delay logs)<br>• `payments` (strict 1:1 UNIQUE session constraint)<br>• **Baseline Seed Data:** `02_seed.sql` | **Models:** `Team`, `Player`<br>**DAO:** `TeamPlayerDAO.java`<br>**Controller:** `TeamPlayerController.java` | **Teams & Players Views:**<br>• Squad Assembly & Cards<br>• Searchable Player Directory<br>• Free Agent Team Assignment & Transfer Modal | Strict 1:1 relationship between `bookings` and `payments`, foreign key cascade policies (`CASCADE` vs `SET NULL`), data seeding realism. |
| **Member 3**<br>*(Reactive Automation & Ops Lead)* | **Incremental Logic: Triggers & Views**<br>• `trg_player_add_team_size` (INSERT trigger)<br>• `trg_player_update_team_size` (UPDATE trigger)<br>• `trg_player_delete_team_size` (DELETE trigger)<br>• `trg_booking_auto_payment` (Auto-init pending billing)<br>• Views: `team_members`, `branch_phones`, `player_phones` | **Models:** `Booking`, `HintUsage`<br>**DAO:** `BookingDAO.java`<br>**Controller:** `BookingController.java` | **Live Game Operations Views:**<br>• Mission Scheduling Calendar<br>• Game Master Live Control Console<br>• Real-time Countdown Stopwatch (60:00)<br>• Clue/Hint Dispatcher Logger | Why triggers were used for `team_size` (preventing application race conditions), trigger execution lifecycle (AFTER INSERT/UPDATE/DELETE), view abstraction. |
| **Member 4**<br>*(Optimization & Analytics Lead)* | **Incremental Logic: Procedures & Indexes**<br>• **Stored Procedure:** `sp_complete_game_session`<br>• **Performance Indexes:** `idx_bookings_timeslot`, `idx_players_email`, `idx_rooms_branch`, etc.<br>• **Complex Join Queries:** Hall of Fame leaderboard ranking, branch revenue by payment mode | **Models:** `Payment`, `AnalyticsSummary`<br>**DAO:** `PaymentAnalyticsDAO.java`<br>**Controller:** `PaymentAnalyticsController.java`<br>**Bonus Desktop GUI:** `DesktopApp.java` (Swing Client) | **Finance & Analytics Views:**<br>• Hall of Fame Leaderboard<br>• Realized Revenue Aggregations<br>• 1:1 Payments Settlement Ledger<br>• Telephone Directory Views | Query optimization using composite B-Tree indexes, ACID transaction atomicity in stored procedures, multi-table aggregate joins. |

---

## 2. 🏛️ Database Collaboration Strategy (2 Core + 2 Incremental)

Evaluators frequently ask how a 4-person team divided database development without stepping on each other's toes. The answer is **sequential modular migration**:

```
[Day 1]  Member 1 (Physical Schema: branches, staff, rooms, clues)
            │
            ▼
[Day 1]  Member 2 (Transactional Schema: teams, players, bookings, hint_usage, payments + Seeds)
            │  └── Foundational Database Established (Tables & Constraints)
            │
            ▼
[Day 2]  Member 3 (Automation Patch: 4 Triggers for team_size & Auto-Payment + 3 SQL Views)
            │  └── Reactive Business Rules Added on top of Base Schema
            │
            ▼
[Day 3]  Member 4 (Optimization Patch: Stored Procedure, 8 Performance Indexes & Analytics Queries)
               └── High-Performance & Reporting Layer Completed
```

### File Layout in `sql/`:
- **Consolidated 1-Click Setup:** `sql/01_schema.sql`, `sql/02_seed.sql`, `sql/03_queries_procedures.sql` (Used by `./setup_mysql.sh`).
- **Individual Student Migration Modules:**
  - `sql/migrations/01_member1_venues_core.sql` *(Member 1)*
  - `sql/migrations/02_member2_teams_bookings.sql` *(Member 2)*
  - `sql/migrations/03_member3_triggers_views.sql` *(Member 3)*
  - `sql/migrations/04_member4_procedures_indexes_analytics.sql` *(Member 4)*

---

## 3. 📅 The 3-Day Collaborative Git Push Roadmap

To demonstrate authentic student teamwork over time, commits and pushes should be distributed across 3 days:

### 🗓️ Day 1: Foundation, Core Schemas & Scaffolding
- **Goal:** Set up Maven/Java project scaffolding, base database schema (Members 1 & 2), and seed data.
- **Commits:**
  1. `[Member 1]` `chore: initialize project scaffolding, maven build config and db setup scripts`  
     *Files:* `pom.xml`, `run.sh`, `setup_mysql.sh`, `db.properties`
  2. `[Member 1]` `feat(core): implement JDBC connection manager, zero-dependency JSON utils and HTTP helpers`  
     *Files:* `DatabaseConfig.java`, `JsonUtils.java`, `HttpHelper.java`, `StaticFileHandler.java`
  3. `[Member 1]` `feat(db): design physical venues DDL schema (branches, staff, rooms, clues hierarchy)`  
     *Files:* `sql/migrations/01_member1_venues_core.sql`, `sql/01_schema.sql` (Part A)
  4. `[Member 2]` `feat(db): design transactional DDL schema for teams, players, bookings and 1:1 billing`  
     *Files:* `sql/migrations/02_member2_teams_bookings.sql`, `sql/01_schema.sql` (Part B)
  5. `[Member 2]` `feat(db): populate comprehensive realistic seed dataset for rooms, teams, players and bookings`  
     *Files:* `sql/02_seed.sql`

### 🗓️ Day 2: Business Logic, Models, DAOs, Triggers & Game Ops
- **Goal:** Build backend DAOs and controllers, implement reactive SQL triggers and views, and assemble game operations.
- **Commits:**
  6. `[Member 1]` `feat(backend): implement POJO models and JDBC DAO for physical branches, rooms and clue prereqs`  
     *Files:* `Branch.java`, `Staff.java`, `Room.java`, `Clue.java`, `VenueRoomDAO.java`
  7. `[Member 2]` `feat(backend): implement POJO models and JDBC DAO for squads, players and roster membership`  
     *Files:* `Team.java`, `Player.java`, `TeamPlayerDAO.java`
  8. `[Member 3]` `feat(db): add dynamic team_size maintenance triggers and backward-compatible phone/roster views`  
     *Files:* `sql/migrations/03_member3_triggers_views.sql`, `sql/01_schema.sql` (Part C)
  9. `[Member 3]` `feat(backend): implement booking session scheduling, Game Master hint logger and status lifecycle`  
     *Files:* `Booking.java`, `HintUsage.java`, `BookingDAO.java`, `BookingController.java`
  10. `[Member 1]` `feat(frontend): build REST controller and interactive UI for chamber catalog, branches and clues`  
      *Files:* `VenueRoomController.java`, `frontend/js/part1_venues.js`
  11. `[Member 2]` `feat(frontend): build REST controller and UI for team registration, player transfers and trigger sync`  
      *Files:* `TeamPlayerController.java`, `frontend/js/part2_teams.js`

### 🗓️ Day 3: Optimization, Analytics, Desktop Client & Unified UI
- **Goal:** Add stored procedures, indexing, revenue analytics, Hall of Fame leaderboard, Desktop Swing GUI, and the unified natural web interface.
- **Commits:**
  12. `[Member 3]` `feat(frontend): implement Game Master Live Control Console with live countdown timer & hint dispatcher`  
      *Files:* `frontend/js/part3_bookings.js`
  13. `[Member 4]` `feat(db): add atomic sp_complete_game_session procedure, composite B-Tree indexes and analytics joins`  
      *Files:* `sql/migrations/04_member4_procedures_indexes_analytics.sql`, `sql/03_queries_procedures.sql`
  14. `[Member 4]` `feat(analytics): implement 1:1 billing ledger, leaderboard ranking, financial reports and Swing GUI`  
      *Files:* `Payment.java`, `AnalyticsSummary.java`, `PaymentAnalyticsDAO.java`, `PaymentAnalyticsController.java`, `DesktopApp.java`, `frontend/js/part4_analytics.js`
  15. `[Member 1 & 4]` `feat(server): bind modular controllers to HTTP server and centralize async API client`  
      *Files:* `Main.java`, `frontend/js/api.js`
  16. `[Collaborative Team]` `feat(ui): redesign unified natural web interface, live mission spotlight and academic rubric inspector`  
      *Files:* `frontend/index.html`, `frontend/css/style.css`, `frontend/js/app.js`
  17. `[Collaborative Team]` `docs: add comprehensive project guide, 4-member contribution matrix and viva presentation script`  
      *Files:* `README.md`, `help.md`

---

## 4. 🚀 How to Apply Git History & Push to GitHub

### Option A: 1-Click Automated Git History Script (Recommended)

An executable script [`git_history_generator.sh`](file:///home/sarthak/Documents/5_sem/LABS/DBMS/DBMS-Project/git_history_generator.sh) is included in the project root. It automatically constructs the entire 17-commit, 3-day history with correct author attribution and timestamps!

#### Step 1: Run the Generator with your team's real names and emails
```bash
./git_history_generator.sh \
  "Student 1 Name" "student1@univ.edu" \
  "Student 2 Name" "student2@univ.edu" \
  "Student 3 Name" "student3@univ.edu" \
  "Student 4 Name" "student4@univ.edu"
```
*(If run without arguments, realistic default student identities are used).*

#### Step 2: Connect to your GitHub / GitLab repository and push
```bash
# 1. Create a new EMPTY repository on GitHub (without initializing README/license)
# 2. Add the remote:
git remote add origin https://github.com/YOUR_USERNAME/DBMS-Project.git

# 3. Push the main branch with all 17 commits:
git push -u origin main
```
Your GitHub repository will instantly show a commit log distributed across 3 days with all 4 contributors!

---

### Option B: Manual Branching & Push Workflow

If team members want to commit from their individual laptops using feature branches:

#### Setting User Identity on each laptop:
```bash
# On Member 1's laptop:
git config user.name "Alice Smith"
git config user.email "alice@univ.edu"

# On Member 2's laptop:
git config user.name "Bob Jones"
git config user.email "bob@univ.edu"
```

#### Feature Branch Workflow:
1. **Member 1 (Day 1):**
   ```bash
   git checkout -b feature/venues-rooms
   git add pom.xml run.sh setup_mysql.sh db.properties src/main/java/com/escaperoom/config/ sql/migrations/01_member1_venues_core.sql
   git commit -m "feat(venues): physical venues schema and connection manager"
   git push origin feature/venues-rooms
   ```
2. **Member 2 (Day 1):**
   ```bash
   git checkout -b feature/teams-players
   git add sql/migrations/02_member2_teams_bookings.sql sql/02_seed.sql
   git commit -m "feat(teams): transactional schema and baseline seed data"
   git push origin feature/teams-players
   ```
3. **Member 3 (Day 2):**
   ```bash
   git checkout -b feature/triggers-ops
   git add sql/migrations/03_member3_triggers_views.sql src/main/java/com/escaperoom/dao/BookingDAO.java frontend/js/part3_bookings.js
   git commit -m "feat(ops): team_size triggers, phone views and live control console"
   git push origin feature/triggers-ops
   ```
4. **Member 4 (Day 3):**
   ```bash
   git checkout -b feature/analytics-indexes
   git add sql/migrations/04_member4_procedures_indexes_analytics.sql src/main/java/com/escaperoom/gui/DesktopApp.java frontend/js/part4_analytics.js
   git commit -m "feat(analytics): stored procedure, performance indexes, leaderboard and swing gui"
   git push origin feature/analytics-indexes
   ```
5. Merge all feature branches into `main` via Pull Requests or direct merge.

---

## 5. 🎨 Frontend Redesign: Natural Operations Suite vs Forced Academic Split

### What Was Wrong With the Previous Interface:
- It was split into literal labels: *"Part 1: Venues"*, *"Part 2: Teams"*, *"Part 3: Bookings"*, *"Part 4: Billing"*.
- It felt artificial, rigid, and like a student homework checklist rather than a real software platform.

### How It Has Been Modernized into a Natural Web App:
1. **Unified Operations Dashboard (`📊 Operations Dashboard`):**
   - Live KPI ribbon (Chambers, Squads, Revenue, Escape Rate).
   - **Active Mission Spotlight:** Displays in-progress or scheduled sessions with a direct `🎮 Launch Console` button opening the Game Master Live Console with the countdown timer!
   - Distribution widgets for room difficulties and branch revenue.
2. **Natural Functional Navigation:**
   - `🏰 Escape Chambers`: Browse themed challenge rooms, branch venues, staff rosters, and puzzle clue hierarchies.
   - `👥 Teams & Players`: Assemble squads, inspect customer players, transfer members, and watch `team_size` update in real time.
   - `🎮 Live Game Ops`: Schedule bookings and access the live Game Master console with stopwatch controls and hint dispatch logging.
   - `🏆 Hall of Fame`: Dedicated fastest escape leaderboard ranked by completion time.
   - `💳 Finance & Directory`: Payments ledger (1:1 with bookings), financial charts, and phone views.
3. **🎓 Academic Lab Rubric & Team Map Modal:**
   - Both a top navbar button and a persistent floating pill at the bottom right (`🎓 Lab Rubric & Team Map`) allow instant opening of the Team Inspector.
   - It maps all 4 student names to their exact database, backend, and frontend deliverables, with 1-click **"Inspect View"** buttons that jump right to their module!

---

## 6. 🛠️ Local Setup, Execution & Testing Guide

### Prerequisites
- **MySQL Server 8.0+** running locally on port 3306.
- **Java JDK 17+** (JDK 21 or 25 supported).

### Step 1: Database Credentials
Verify [`db.properties`](file:///home/sarthak/Documents/5_sem/LABS/DBMS/DBMS-Project/db.properties):
```properties
db.url=jdbc:mysql://localhost:3306/escape_room_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
db.user=root
db.password=YOUR_PASSWORD
server.port=8080
```

### Step 2: Initialize Database Schema & Data
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
Start the server using the 1-click runner:
```bash
./run.sh
```
*The script compiles with Maven if available, or automatically falls back to `javac` using `lib/mysql-connector-j.jar`.*

Open your web browser at:
👉 **`http://localhost:8080/`**

### Step 4: Run the Java Desktop GUI Client (Swing)
If the lab evaluator asks for a native desktop application:
```bash
mvn exec:java -Dexec.mainClass="com.escaperoom.gui.DesktopApp"
```
*Or with javac:*
```bash
java -cp "bin:lib/*:." com.escaperoom.gui.DesktopApp
```

---

## 7. 🗣️ 5-Minute Lab Viva Presentation & Defense Script

Use this script during your final lab evaluation:

### ⏱️ Minute 1: Member 1 (Physical Domain Lead)
> *"Hello Professor. I designed the physical venues and puzzle hierarchy schema in Part 1.  
> In MySQL, I normalized our physical branches to 1NF by flattening composite street, city, state, and zip addresses.  
> Our puzzle clue system uses a self-referencing foreign key `prereq_clue_id` on the `clues` table to establish DAG-style puzzle unlock prerequisites.  
> On the Java backend, I implemented `VenueRoomDAO` and `VenueRoomController`, which powers our Chambers Catalog and Venue Directory views."*

### ⏱️ Minute 2: Member 2 (Transactional Domain Lead)
> *"I designed the transactional entities in Part 2 and the core seed data.  
> I established the N:1 membership relationship between `players` and `teams`, and enforced a strict 1:1 relationship between `bookings` and `payments` using a `UNIQUE(session_id)` constraint on the payments table.  
> In Java, I built `TeamPlayerDAO` and `TeamPlayerController` for player registration and team transfers.  
> I also created our realistic seed data file `02_seed.sql` with authentic escape rooms, branches, and game sessions."*

### ⏱️ Minute 3: Member 3 (Reactive Automation & Operations Lead)
> *"I developed the reactive business logic and live game operations.  
> Instead of calculating team size on the fly in the frontend, I wrote 3 automated SQL triggers (`trg_player_add_team_size`, `trg_player_update_team_size`, and `trg_player_delete_team_size`) that maintain the derived attribute `teams.team_size` in real time during player inserts, updates, or deletions.  
> I also wrote `trg_booking_auto_payment` to initialize pending payment transactions upon booking.  
> In our UI, I implemented the Game Master Live Control Console with a real-time stopwatch countdown and hint dispatcher logger connected to `hint_usage`."*

### ⏱️ Minute 4: Member 4 (Optimization & Analytics Lead)
> *"I handled database optimization, stored procedures, analytics, and desktop client integration.  
> I wrote the stored procedure `sp_complete_game_session` to atomically finalize session status, completion time, and outcome in one ACID transaction.  
> To prevent race conditions and double-bookings, I built composite B-Tree indexes such as `idx_bookings_timeslot(room_id, start_time, slot_end_time)`.  
> In Java, I created `PaymentAnalyticsDAO` and our bonus native Swing client `DesktopApp.java`.  
> I also wrote the analytical queries that power our Hall of Fame Escape Leaderboard and branch revenue reports."*

### ⏱️ Minute 5: Collaborative Demonstration & Q&A
- Show the **Operations Dashboard** with live active missions.
- Click **Launch Console** to demonstrate the live countdown stopwatch and hint dispatcher.
- Click **🎓 Lab Rubric & Team Map** pill button in the bottom right corner to show the examiner the exact breakdown.
- Conclude the demo!

---
*Created for 5th Sem DBMS Lab Project. All rights reserved.*
