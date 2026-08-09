#!/bin/bash
# Deploy wf-marketing: pull latest, sync to web root
# Run on droplet: bash /home/n8n/wf-marketing/scripts/deploy.sh [dev|prod] [branch]

set -e

TARGET="${1:-prod}"
REPO_DIR="/home/n8n/wf-marketing"
LOG_FILE="/home/n8n/wf-marketing/logs/deploy.log"

case "$TARGET" in
  dev)
    WEB_ROOT="/var/www/wf-marketing-dev"
    BRANCH="${2:-$(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD)}"
    ;;
  prod)
    WEB_ROOT="/var/www/wf-marketing"
    BRANCH="main"
    ;;
  *)
    echo "Usage: deploy.sh [dev|prod] [branch]"
    exit 1
    ;;
esac

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$TARGET] $1" | tee -a "$LOG_FILE"; }

mkdir -p "$(dirname "$LOG_FILE")"
cd "$REPO_DIR" || exit 1

log "=== Starting wf-marketing deploy (target: $TARGET, branch: $BRANCH) ==="

# 1. Fetch and check out the right branch
log "Fetching and checking out $BRANCH..."
git fetch origin 2>&1 | tee -a "$LOG_FILE"
git checkout "$BRANCH" 2>&1 | tee -a "$LOG_FILE"
git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"

# 2. Sync to web root
log "Syncing files to $WEB_ROOT..."
sudo mkdir -p "$WEB_ROOT"
sudo rsync -av --delete "$REPO_DIR/site/" "$WEB_ROOT/" 2>&1 | tee -a "$LOG_FILE"

# 3. Fix ownership
log "Setting permissions..."
sudo chown -R www-data:www-data "$WEB_ROOT"

log "=== Deploy complete ($TARGET) ==="
