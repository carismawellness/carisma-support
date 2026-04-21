#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Carisma GHL Webhook Server — local startup script
#
# Usage:
#   chmod +x CRM/ghl/start_webhook.sh
#   cd "Carisma AI"
#   ./CRM/ghl/start_webhook.sh
#
# Requires:
#   pip install fastapi uvicorn httpx python-dotenv ngrok
#   ngrok account + authtoken configured (ngrok config add-authtoken <token>)
# ─────────────────────────────────────────────────────────────────────────────
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PORT=8000
BRAND="${GHL_BRAND:-aesthetics}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Carisma GHL Webhook Server"
echo "  brand=${BRAND} | port=${PORT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$REPO_ROOT/CRM"

# ── Start ngrok tunnel in background ─────────────────────────────────────────
if command -v ngrok &>/dev/null; then
    echo "[1/2] Starting ngrok tunnel on port ${PORT}..."
    ngrok http ${PORT} --log=stdout > /tmp/ngrok_carisma.log 2>&1 &
    NGROK_PID=$!
    sleep 2

    # Extract public URL
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null \
        | python3 -c "import sys,json; t=json.load(sys.stdin)['tunnels']; print([x['public_url'] for x in t if 'https' in x['public_url']][0])" 2>/dev/null || echo "")

    if [ -n "$NGROK_URL" ]; then
        echo ""
        echo "  ✅ Public URL: ${NGROK_URL}"
        echo ""
        echo "  Configure in GHL → Settings → Integrations → Webhooks:"
        echo "    Lead Optin:      ${NGROK_URL}/webhook/lead-optin"
        echo "    Task Completed:  ${NGROK_URL}/webhook/task-completed"
        echo ""
    else
        echo "  ⚠️  Could not retrieve ngrok URL — check http://localhost:4040"
    fi
else
    echo "  ⚠️  ngrok not found — server will only be accessible locally."
    echo "     Install: brew install ngrok && ngrok config add-authtoken <token>"
fi

# ── Start FastAPI server ──────────────────────────────────────────────────────
echo "[2/2] Starting FastAPI webhook server..."
GHL_BRAND="${BRAND}" uvicorn ghl.webhook_handler:app \
    --host 0.0.0.0 \
    --port ${PORT} \
    --reload

# Cleanup on exit
trap "kill $NGROK_PID 2>/dev/null; echo 'Stopped.'" EXIT
