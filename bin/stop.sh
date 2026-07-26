#!/bin/bash
# Stop all MikroTik Dashboard processes

echo "Stopping MikroTik Dashboard..."

for proc in "artisan mikrotik:monitor" "artisan queue:work" "artisan serve"; do
    PIDS=$(pgrep -f "$proc" 2>/dev/null)
    if [ -n "$PIDS" ]; then
        echo "  Stopping: $proc (PID $PIDS)"
        kill $PIDS 2>/dev/null
        sleep 1
        # Force kill if still alive
        PIDS=$(pgrep -f "$proc" 2>/dev/null)
        if [ -n "$PIDS" ]; then
            kill -9 $PIDS 2>/dev/null
            echo "  Force killed: $proc"
        fi
    else
        echo "  Not running: $proc"
    fi
done

echo "Done."
