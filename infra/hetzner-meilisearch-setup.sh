#!/bin/bash
# Hetzner CX22 - Meilisearch + Caddy (TLS) setup
# Usage: SSH into the VPS as root, paste this whole script, run.
# 
# Prerequisites:
# - Hetzner CX22 instance (or any Ubuntu 22.04+ with 2GB+ RAM)
# - DNS: search.domaindispute.com -> <this VPS IP> (proxy: DNS only, NOT orange cloud)

set -euo pipefail

DOMAIN="search.domaindispute.com"
EMAIL="hello@domaindispute.com"

echo "==> Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable --now docker

echo "==> Generating Meilisearch master key (save this!)..."
MEILI_MASTER_KEY=$(openssl rand -hex 32)
echo ""
echo "============================================================"
echo "MEILISEARCH MASTER KEY:"
echo "$MEILI_MASTER_KEY"
echo "============================================================"
echo "  Save this to 1Password as MEILISEARCH_MASTER_KEY."
echo "  You will need it for the Vercel env var and the sync script."
echo "  This will NOT be shown again."
echo "============================================================"
echo ""

echo "==> Starting Meilisearch container..."
mkdir -p /var/meili-data

docker run -d \
  --name meilisearch \
  --restart unless-stopped \
  -p 127.0.0.1:7700:7700 \
  -v /var/meili-data:/meili_data \
  -e MEILI_MASTER_KEY="$MEILI_MASTER_KEY" \
  -e MEILI_ENV=production \
  -e MEILI_NO_ANALYTICS=true \
  getmeili/meilisearch:v1.10

echo "==> Waiting for Meilisearch to start..."
sleep 5

echo "==> Installing Caddy (auto-TLS reverse proxy)..."
apt update
apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install -y caddy

echo "==> Configuring Caddy..."
cat > /etc/caddy/Caddyfile <<EOF
${DOMAIN} {
    reverse_proxy 127.0.0.1:7700
    encode gzip zstd
    
    @cors_preflight method OPTIONS
    handle @cors_preflight {
        header Access-Control-Allow-Origin "https://domaindispute.com"
        header Access-Control-Allow-Methods "GET, POST, OPTIONS"
        header Access-Control-Allow-Headers "Authorization, Content-Type, X-Meilisearch-Client"
        header Access-Control-Max-Age "86400"
        respond "" 204
    }
    
    header Access-Control-Allow-Origin "https://domaindispute.com"
    header Access-Control-Expose-Headers "X-Meilisearch-Client"
    
    log {
        output file /var/log/caddy/access.log
        format json
    }
}
EOF

systemctl enable --now caddy
systemctl reload caddy

echo "==> Generating browser-safe search-only API key..."
sleep 3
SEARCH_KEY_RESPONSE=$(curl -s -X POST "https://${DOMAIN}/keys" \
  -H "Authorization: Bearer ${MEILI_MASTER_KEY}" \
  -H "Content-Type: application/json" \
  --data-binary '{
    "description": "Public search-only key for domaindispute.com browser",
    "actions": ["search"],
    "indexes": ["cases"],
    "expiresAt": null
  }')

SEARCH_KEY=$(echo "$SEARCH_KEY_RESPONSE" | grep -oE '"key":"[^"]+"' | cut -d'"' -f4)

echo ""
echo "============================================================"
echo "SETUP COMPLETE"
echo "============================================================"
echo ""
echo "Meilisearch master key (admin/sync):"
echo "  $MEILI_MASTER_KEY"
echo ""
echo "Public search-only key (for browser/Vercel):"
echo "  $SEARCH_KEY"
echo ""
echo "URL:"
echo "  https://${DOMAIN}"
echo ""
echo "Vercel env vars to set:"
echo "  MEILISEARCH_HOST=https://${DOMAIN}"
echo "  MEILISEARCH_MASTER_KEY=${MEILI_MASTER_KEY}"
echo "  NEXT_PUBLIC_MEILISEARCH_HOST=https://${DOMAIN}"
echo "  NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY=${SEARCH_KEY}"
echo ""
echo "Test Meilisearch is alive:"
echo "  curl -H 'Authorization: Bearer ${MEILI_MASTER_KEY}' https://${DOMAIN}/health"
echo "============================================================"
