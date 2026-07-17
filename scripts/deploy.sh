#!/bin/bash
# Deploy wf-marketing: pull latest, sync to web root
# Run on droplet: bash /home/n8n/wf-marketing/scripts/deploy.sh

set -e

REPO_DIR="/home/n8n/wf-marketing"
WEB_ROOT="/var/www/wf-marketing"
LOG_FILE="/home/n8n/wf-marketing/logs/deploy.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"; }

mkdir -p "$(dirname "$LOG_FILE")"
cd "$REPO_DIR" || exit 1

log "=== Starting wf-marketing deploy ==="

# 1. Pull latest from main
log "Pulling latest from origin/main..."
git pull origin main 2>&1 | tee -a "$LOG_FILE"

# 2. Sync to web root
log "Syncing files to $WEB_ROOT..."
sudo mkdir -p "$WEB_ROOT"
sudo rsync -av --delete "$REPO_DIR/site/" "$WEB_ROOT/" 2>&1 | tee -a "$LOG_FILE"

# 3. Fix ownership
log "Setting permissions..."
sudo chown -R www-data:www-data "$WEB_ROOT"

log "=== Deploy complete ==="
