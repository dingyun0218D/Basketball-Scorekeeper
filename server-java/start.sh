#!/bin/bash

# Basketball Scorekeeper Tunnel Service启动脚本

APP_NAME="tunnel-service"
APP_JAR="${APP_NAME}.jar"
PID_FILE="/var/run/${APP_NAME}.pid"
LOG_DIR="logs"
LOG_FILE="${LOG_DIR}/application.log"

# 创建日志目录
mkdir -p ${LOG_DIR}

# 加载环境变量
if [ -f .env ]; then
    echo "📦 Loading environment variables from .env..."
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "⚠️ Warning: .env file not found"
fi

# 检查JAR文件是否存在
if [ ! -f "${APP_JAR}" ]; then
    echo "❌ Error: ${APP_JAR} not found!"
    echo "Current directory: $(pwd)"
    echo "Available files: $(ls -la)"
    exit 1
fi

# 检查是否已经在运行
if [ -f "${PID_FILE}" ]; then
    PID=$(cat "${PID_FILE}")
    if ps -p ${PID} > /dev/null 2>&1; then
        echo "⚠️ Service is already running (PID: ${PID})"
        exit 1
    else
        echo "⚠️ Removing stale PID file"
        rm -f "${PID_FILE}"
    fi
fi

echo "🚀 Starting ${APP_NAME}..."

# 启动服务
nohup java -jar ${APP_JAR} > ${LOG_FILE} 2>&1 &
APP_PID=$!

# 保存PID
echo ${APP_PID} > ${PID_FILE}

# 等待服务启动
sleep 3

# 检查服务是否启动成功
if ps -p ${APP_PID} > /dev/null 2>&1; then
    echo "✅ ${APP_NAME} started successfully (PID: ${APP_PID})"
    echo "📋 Logs: tail -f ${LOG_FILE}"
else
    echo "❌ Failed to start ${APP_NAME}"
    rm -f "${PID_FILE}"
    exit 1
fi

