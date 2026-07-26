#!/bin/bash
# Start MikroTik Dashboard — Web Server + Daemon + Queue Worker

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR" || exit 1

echo "Starting MikroTik Dashboard..."
echo ""

# Build frontend if needed
if [ ! -d "public/build" ]; then
    echo "[1/3] Building frontend assets..."
    npm run build --silent 2>/dev/null || npm run build
fi

# Start queue worker (for billing sync jobs)
if pgrep -f "artisan queue:work" > /dev/null 2>&1; then
    echo "[OK] Queue worker already running"
else
    echo "[1/3] Starting queue worker..."
    nohup php artisan queue:work --sleep=3 --tries=3 > storage/logs/queue.log 2>&1 &
    echo "[OK] Queue worker started (PID $!)"
fi

# Start polling daemon
if pgrep -f "artisan mikrotik:monitor" > /dev/null 2>&1; then
    echo "[OK] Daemon already running"
else
    echo "[2/3] Starting MikroTik polling daemon..."
    nohup php artisan mikrotik:monitor > storage/logs/daemon.log 2>&1 &
    echo "[OK] Daemon started (PID $!)"
fi

# Start web server
if pgrep -f "artisan serve" > /dev/null 2>&1; then
    echo "[OK] Web server already running"
else
    echo "[3/3] Starting web server..."
    nohup php artisan serve --host=0.0.0.0 --port=8000 > storage/logs/server.log 2>&1 &
    echo "[OK] Web server started (PID $!)"
fi

echo ""
echo "All processes running:"
echo "  Web Server:  http://$(hostname -I 2>/dev/null | awk '{print $1}'):8000"
echo "  Daemon:      php artisan mikrotik:monitor"
echo "  Queue:       php artisan queue:work"
echo ""
echo "View logs:"
echo "  tail -f storage/logs/daemon.log"
echo "  tail -f storage/logs/server.log"
echo "  tail -f storage/logs/queue.log"
