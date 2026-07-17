# wf-marketing Deployment

## Overview

wf-marketing is a static marketing site served via nginx. It's deployed to the same droplet as wf-server but on a different domain.

## Architecture

```
Domain Structure:
├── www.whatsfresh.app (or marketing.whatsfresh.app)  → wf-marketing (nginx)
├── v2.whatsfresh.app                                  → wf-server (Node.js)
└── dev.whatsfresh.app (or dev-v2.whatsfresh.app)     → dev environment
```

## Initial Setup (on droplet)

### 1. Clone the repo

```bash
cd /home/n8n
git clone https://github.com/your-org/wf-marketing.git
cd wf-marketing
mkdir -p logs
```

### 2. Create nginx config

Create `/etc/nginx/sites-available/wf-marketing`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name www.whatsfresh.app;

    root /var/www/wf-marketing;
    index index.html;

    # Serve static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing: serve index.html for unmatched routes
    location / {
        try_files $uri /index.html;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

### 3. Enable the site

```bash
sudo ln -s /etc/nginx/sites-available/wf-marketing /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Set up SSL (Let's Encrypt)

```bash
sudo certbot certonly --nginx -d www.whatsfresh.app
```

Then update the nginx config to use SSL (or use certbot to do it automatically).

## Deployment

### Local Development

```bash
# Make changes in /home/paul/Projects/wf-marketing
# Test locally: npx http-server pages -p 8000

# Commit and push
git add .
git commit -m "your message"
git push origin main
```

### Deploy to droplet

```bash
# On the droplet, run:
bash /home/n8n/wf-marketing/scripts/deploy.sh

# Or set up a GitHub webhook for auto-deploy on push
```

## File Structure on Droplet

```
/home/n8n/wf-marketing/     (git repo)
├── pages/
├── public/
├── scripts/
│   └── deploy.sh
└── logs/

/var/www/wf-marketing/      (served by nginx)
├── index.html
├── css/
├── js/
├── features/
└── ... (synced from repo)
```

## Monitoring

Check deployment logs:

```bash
tail -f /home/n8n/wf-marketing/logs/deploy.log
```

Nginx access/error logs:

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## Rollback

If something goes wrong, you can rollback to a previous commit:

```bash
cd /home/n8n/wf-marketing
git revert HEAD
bash scripts/deploy.sh
```

Or revert to a specific commit:

```bash
git reset --hard <commit-hash>
bash scripts/deploy.sh
```
