#!/bin/bash
# Database backup script for Nexus Blog
# Run: bash scripts/backup-db.sh
# Recommended: add to crontab for daily backups
#   0 3 * * * /home/ubuntu/wpl/toy/my-blog/scripts/backup-db.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DB_PATH="$PROJECT_DIR/data/blog.db"
BACKUP_DIR="$PROJECT_DIR/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/blog_$TIMESTAMP.db"

mkdir -p "$BACKUP_DIR"

# Checkpoint WAL first, then backup
sqlite3 "$DB_PATH" "PRAGMA wal_checkpoint(TRUNCATE);" 2>/dev/null
cp "$DB_PATH" "$BACKUP_FILE"

# Keep only last 14 backups
ls -t "$BACKUP_DIR"/blog_*.db 2>/dev/null | tail -n +15 | xargs rm -f 2>/dev/null

echo "Backup saved: $BACKUP_FILE ($(du -h "$BACKUP_FILE" | cut -f1))"
