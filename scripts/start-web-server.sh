#!/bin/bash

echo "=========================================="
echo "   SnippetVault Web Preview Server"
echo "=========================================="
echo ""
echo "Starting local server at http://localhost:8080"
echo "Press Ctrl+C to stop."
echo ""

# Detect Python command
if command -v python3 &> /dev/null; then
    PYTHON=python3
elif command -v python &> /dev/null; then
    PYTHON=python
else
    echo "[Error] Python not found. Please install Python 3 first."
    exit 1
fi

# Start server in background
cd "$(dirname "$0")"
$PYTHON -m http.server 8080 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Open browser
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080
elif command -v open &> /dev/null; then
    open http://localhost:8080
fi

# Keep script running until interrupted
trap "kill $SERVER_PID 2>/dev/null; exit" INT
wait $SERVER_PID
