#!/usr/bin/env bash
# =====================================================================
# Database Setup Script for Escape Room & Puzzle Hunt System
# =====================================================================

set -e

DB_USER="${1:-root}"
echo "------------------------------------------------------------------"
echo "Setting up MySQL Database: escape_room_db"
echo "Target User: $DB_USER"
echo "------------------------------------------------------------------"

echo "[1/3] Executing 01_schema.sql (Tables, Views, Triggers, Indexes)..."
mysql -u "$DB_USER" -p < sql/01_schema.sql

echo "[2/3] Executing 02_seed.sql (Populating realistic sample data)..."
mysql -u "$DB_USER" -p < sql/02_seed.sql

echo "[3/3] Executing 03_queries_procedures.sql (Procedures & Views)..."
mysql -u "$DB_USER" -p < sql/03_queries_procedures.sql

echo "------------------------------------------------------------------"
echo "✓ Database escape_room_db setup completed successfully!"
echo "------------------------------------------------------------------"
