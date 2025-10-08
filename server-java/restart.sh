#!/bin/bash

# Basketball Scorekeeper Tunnel Service重启脚本

echo "🔄 Restarting tunnel-service..."

./stop.sh
sleep 1
./start.sh

echo "✅ Restart complete"

