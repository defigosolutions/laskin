#!/bin/bash

# ======================================================
# Production Deployment Script — laskin
# Usage: ./deploy-prod.sh [port]
# Example: ./deploy-prod.sh 4000
#
# Architecture:
#   Frontend & Admin CMS → React/Vite static files (served by Nginx at /)
#   Backend              → Express/Node.js API     (PM2 on port 4000, path: /api)
#   DB                   → PostgreSQL (remote)
# ======================================================

APP_NAME="laskin"
BACKEND_PORT=${1:-4000}
BASE_DOMAIN="bluetelecast.4usoftwaresolutions.com"

BASE_DIR="/var/www/production"
APP_DIR="$BASE_DIR/$APP_NAME"
DOMAIN="prod-$APP_NAME.$BASE_DOMAIN"
NGINX_CONF_NAME="${APP_NAME}-prod"
PM2_APP_NAME="${APP_NAME}-prod-backend"

echo "======================================"
echo " Production Deployment: $APP_NAME"
echo " Domain:   https://$DOMAIN"
echo " Backend:  port $BACKEND_PORT"
echo " Dir:      $APP_DIR"
echo " Nginx:    /etc/nginx/sites-available/$NGINX_CONF_NAME"
echo " PM2 App:  $PM2_APP_NAME"
echo "======================================"

# ── 1. Ensure base directory ──────────────────────────
sudo mkdir -p $BASE_DIR
sudo chown -R ubuntu:ubuntu $BASE_DIR

# ── 2. Clone or pull latest code (production branch) ──
cd $BASE_DIR || exit

if [ ! -d "$APP_DIR" ]; then
    echo ">>> Cloning repository from production branch..."
    git clone -b production git@github.com:defigosolutions/$APP_NAME.git
else
    echo ">>> Repository exists. Pulling latest production code..."
    cd $APP_DIR || exit
    git fetch origin
    git checkout production
    git pull origin production
fi

cd $APP_DIR || exit

# ── 3. Set up backend .env if not present ────────────
if [ ! -f "$APP_DIR/server/.env" ]; then
    echo ">>> Creating default server/.env file..."
    cat > $APP_DIR/server/.env <<ENVEOF
PORT=$BACKEND_PORT
DATABASE_URL="postgresql://laskin_user:Ac9g0FA%2C6X%22P@34.182.208.192:5432/laskin_db"
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
CORS_ORIGIN="https://$DOMAIN"
ENVEOF
    echo ""
    echo "  ⚠️  .env created at $APP_DIR/server/.env"
    echo "  ⚠️  Please review DB credentials. We pre-filled the production credentials."
    echo "  Run: nano $APP_DIR/server/.env"
    echo ""
    read -p "Press ENTER to continue deployment..."
else
    echo ">>> server/.env already exists. Skipping creation."
fi

# ── 4. Build Backend ──────────────────────────
echo ">>> Installing backend dependencies..."
cd $APP_DIR/server || exit
rm -rf node_modules package-lock.json
npm install --unsafe-perm=true

echo ">>> Running database seed and migrations..."
npm run seed

echo ">>> Backend dependencies installed and seeded successfully."

# ── 5. Build React Frontend (includes Admin CMS) ──────
echo ">>> Installing frontend dependencies..."
cd $APP_DIR || exit
rm -rf dist node_modules package-lock.json
npm install --unsafe-perm=true

echo ">>> Building React frontend..."
VITE_API_BASE_URL="/api/v1" npm run build

if [ ! -d "dist" ]; then
    echo "Frontend build failed! Check errors above."
    exit 1
fi
echo ">>> Frontend build successful."

# ── 6. PM2 Process Management ────────────────────────
echo ">>> Checking PM2..."
if ! command -v pm2 &> /dev/null; then
    echo ">>> PM2 not found. Installing globally..."
    npm install -g pm2
fi

# Create PM2 ecosystem config
cat > $APP_DIR/ecosystem.config.cjs <<EOF
module.exports = {
  apps: [
    {
      name: '$PM2_APP_NAME',
      script: 'index.js',
      cwd: '$APP_DIR/server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: $BACKEND_PORT
      },
      error_file: '/var/log/pm2/$PM2_APP_NAME-error.log',
      out_file:   '/var/log/pm2/$PM2_APP_NAME-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
}
EOF

mkdir -p /var/log/pm2

# Stop old instance if running, then start fresh
pm2 describe $PM2_APP_NAME &>/dev/null && pm2 delete $PM2_APP_NAME
pm2 start $APP_DIR/ecosystem.config.cjs
pm2 save

# Ensure PM2 restarts on server reboot
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>/dev/null || true

echo ">>> PM2 started: $PM2_APP_NAME (port $BACKEND_PORT)"

# ── 7. Nginx config ───────────────────────────────────
echo ">>> Creating Nginx config..."

sudo tee /etc/nginx/sites-available/$NGINX_CONF_NAME > /dev/null <<EOF
# HTTP → redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$host\$request_uri;
}

# HTTPS
server {
    listen 443 ssl;
    server_name $DOMAIN;

    # --- SSL (certbot fills these in) ---
    # ssl_certificate     /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options         "SAMEORIGIN"            always;
    add_header X-Content-Type-Options  "nosniff"               always;
    add_header X-XSS-Protection        "1; mode=block"         always;
    add_header Referrer-Policy         "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    gzip_comp_level 6;

    # ── Uploaded Media ────────────────────────────────────
    location /uploads/ {
        proxy_pass         http://127.0.0.1:$BACKEND_PORT/uploads/;
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }

    # ── Backend API (Express on port $BACKEND_PORT) ───────
    location /api/ {
        proxy_pass         http://127.0.0.1:$BACKEND_PORT/api/;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        'upgrade';
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout    300s;
        proxy_connect_timeout  75s;
    }

    # ── React Frontend & Admin CMS (static files) ─────────
    location / {
        root  $APP_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }
}
EOF

# ── 8. Enable site and reload Nginx ───────────────────
echo ">>> Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/$NGINX_CONF_NAME /etc/nginx/sites-enabled/$NGINX_CONF_NAME

echo ">>> Testing Nginx config..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "Nginx configuration test FAILED. Please fix errors above."
    exit 1
fi

sudo systemctl reload nginx

# ── 9. SSL certificate ───────────────────────────────
echo ">>> Installing SSL certificate..."
sudo certbot --nginx -d $DOMAIN \
    --non-interactive \
    --agree-tos \
    -m hr@4usoftwaresolutions.com \
    --redirect

echo ""
echo "======================================"
echo " Deployment Complete! 🚀"
echo "======================================"
echo " App:          $APP_NAME"
echo " Live URL:     https://$DOMAIN"
echo " Backend API:  https://$DOMAIN/api/v1/"
echo " App dir:      $APP_DIR"
echo "======================================"
echo ""
echo " PM2 processes:"
echo "   $PM2_APP_NAME  → port $BACKEND_PORT  (Express API)"
echo ""
echo " Useful commands:"
echo "   pm2 status                      → check all apps"
echo "   pm2 logs $PM2_APP_NAME       → backend logs"
echo "   pm2 restart $PM2_APP_NAME    → restart backend"
echo "======================================"
