#!/bin/bash
# Alga DevOps - Database Backup Script
# Phase 6 of DevOps implementation
# 
# This script creates a backup of the PostgreSQL database
# Run daily via cron or manually before deployments
#
# Usage: ./scripts/backup-database.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/alga_db_${TIMESTAMP}.sql"

echo "🗄️  ALGA DATABASE BACKUP"
echo "========================"
echo "Timestamp: ${TIMESTAMP}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

echo "📦 Creating backup..."

# Create the backup using pg_dump
pg_dump "$DATABASE_URL" --no-owner --no-acl > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    # Compress the backup
    gzip "${BACKUP_FILE}"
    COMPRESSED_FILE="${BACKUP_FILE}.gz"
    
    # Get file size
    SIZE=$(ls -lh "${COMPRESSED_FILE}" | awk '{print $5}')
    
    echo "✅ Backup created successfully!"
    echo "   File: ${COMPRESSED_FILE}"
    echo "   Size: ${SIZE}"
    
    # Cleanup old backups (keep last 7 days)
    echo "🧹 Cleaning up old backups (keeping last 7 days)..."
    find ${BACKUP_DIR} -name "alga_db_*.sql.gz" -mtime +7 -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(ls -1 ${BACKUP_DIR}/alga_db_*.sql.gz 2>/dev/null | wc -l)
    echo "   ${BACKUP_COUNT} backup(s) retained"
    
    echo ""
    echo "🎉 Backup complete!"
else
    echo "❌ Backup failed!"
    exit 1
fi
