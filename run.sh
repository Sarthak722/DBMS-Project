#!/usr/bin/env bash
# =====================================================================
# Build and Run Script for Escape Room & Puzzle Hunt System
# =====================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

echo "=================================================================="
echo "   Escape Room & Puzzle Hunt Management System"
echo "   DBMS Lab Project - Modular Java & JDBC"
echo "=================================================================="

# Check if Maven is available
if command -v mvn &> /dev/null; then
    echo "[*] Compiling with Maven..."
    mvn clean compile
    echo "[+] Compilation successful!"
    echo "[*] Launching Web Application Server on http://localhost:8080 ..."
    mvn exec:java -Dexec.mainClass="com.escaperoom.Main"
else
    echo "[*] Maven not found. Compiling with javac..."
    mkdir -p bin
    
    # Classpath with MySQL JDBC Driver
    CP="lib/*:bin:."
    if [ -f "mysql-connector-j.jar" ]; then
        CP="$CP:mysql-connector-j.jar"
    elif [ -f "lib/mysql-connector-j.jar" ]; then
        CP="lib/mysql-connector-j.jar:$CP"
    fi

    javac -cp "$CP" -d bin $(find src/main/java -name "*.java")
    echo "[+] Javac compilation successful!"
    echo "[*] Launching Web Application Server on http://localhost:8080 ..."
    java -cp "bin:$CP" com.escaperoom.Main
fi
