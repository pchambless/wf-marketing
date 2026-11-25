#!/bin/bash
# Deploy wf-marketing: pull latest, sync to web root
# Run on droplet: bash <repo>/scripts/deploy.sh [dev|prod] [branch]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
TARGET="${1:-prod}"
LOG_FILE="$REPO_DIR/logs/deploy.log"

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

# 2b. Dev only: source links point at the PROD app (v2.whatsfresh.app/login);
# rewrite them so the dev marketing site logs into the dev app (task 467).
# Runs after every rsync because rsync --delete restores the source links.
if [ "$TARGET" = "dev" ]; then
  log "Pointing Login links at the dev app..."
  sudo find "$WEB_ROOT" -name '*.html' -exec sed -i 's#https://v2.whatsfresh.app/login#https://dev-v2.whatsfresh.app/login#g' {} +
fi

# 2c. Cache busting: stamp CSS/JS links and JSON fetches with this deploy's commit, so Cloudflare and browsers
# fetch the new files on the first visit after a deploy instead of serving copies cached for hours (2026-11-25:
# style.css stayed a Cloudflare HIT and a cached features.json left the new Recall page blank). Runs on the web
# root after rsync, like 2b, so the source files in git keep plain links.
VER="$(git -C "$REPO_DIR" rev-parse --short HEAD)"
log "Stamping asset links with ?v=$VER..."
sudo find "$WEB_ROOT" -name '*.html' -exec sed -i -E "s#(href|src)=\"(/(css|js)/[^\"?]+\.(css|js))\"#\1=\"\2?v=$VER\"#g" {} +
sudo find "$WEB_ROOT" -name '*.js' -exec sed -i -E "s#fetch\('(/[^'?]+\.json)'\)#fetch('\1?v=$VER')#g" {} +

# 3. Fix ownership
log "Setting permissions..."
sudo chown -R www-data:www-data "$WEB_ROOT"

log "=== Deploy complete ($TARGET) ==="
