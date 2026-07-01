#!/bin/bash

# ======================================================
# Production Deployment Script — LA Skinn (cPanel)
# ======================================================

echo "======================================"
echo " Starting LA Skinn Deployment..."
echo "======================================"

# 1. Update from GitHub
echo ">>> Pulling latest code from GitHub (prod-cpanel branch)..."
cd ~/repositories/laskin || exit
git fetch origin
git checkout prod-cpanel
git pull origin prod-cpanel

# 2. Build Frontend (React/Vite)
echo ">>> Installing frontend dependencies..."
/opt/cpanel/ea-nodejs20/bin/npm install

echo ">>> Building React frontend..."
/opt/cpanel/ea-nodejs20/bin/npm run build

if [ ! -d "dist" ]; then
    echo "Frontend build failed! Check errors above."
    exit 1
fi
echo ">>> Frontend build successful."

# 3. Deploy Frontend to public_html
echo ">>> Copying frontend files to public_html..."
rm -rf ~/public_html/*
cp -R dist/. ~/public_html/

# 4. Build Backend (Node.js)
echo ">>> Installing backend dependencies..."
cd ~/repositories/laskin/server || exit
/opt/cpanel/ea-nodejs20/bin/npm install

echo ""
echo "======================================"
echo " Deployment Complete! 🚀"
echo "======================================"
echo " Live URL:     https://laskinaestheticsct.com"
echo " Backend API:  https://laskinaestheticsct.com/api"
echo "======================================"
echo " ⚠️ IMPORTANT: Go to 'Setup Node.js App' in cPanel and click the RESTART button to apply backend changes!"
echo "======================================"
