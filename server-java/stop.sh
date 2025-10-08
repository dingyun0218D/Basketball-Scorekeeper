#!/bin/bash

# Basketball Scorekeeper Tunnel Service停止脚本

APP_NAME="tunnel-service"
PID_FILE="/var/run/${APP_NAME}.pid"

if [ ! -f "${PID_FILE}" ]; then
    echo "⚠️ PID file not found, service may not be running"
    exit 1
fi

PID=$(cat "${PID_FILE}")

if ! ps -p ${PID} > /dev/null 2>&1; then
    echo "⚠️ Service is not running (stale PID file)"
    rm -f "${PID_FILE}"
    exit 1
fi

echo "🛑 Stopping ${APP_NAME} (PID: ${PID})..."
kill ${PID}

# 等待进程结束
sleep 2

# 如果还在运行，强制结束
if ps -p ${PID} > /dev/null 2>&1; then
    echo "⚠️ Force killing process..."
    kill -9 ${PID}
    sleep 1
fi

# 清理PID文件
rm -f "${PID_FILE}"

if ps -p ${PID} > /dev/null 2>&1; then
    echo "❌ Failed to stop ${APP_NAME}"
    exit 1
else
    echo "✅ ${APP_NAME} stopped successfully"
fi

