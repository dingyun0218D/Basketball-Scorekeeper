#!/bin/bash

# 环境变量检查脚本

echo "🔍 Checking environment variables..."
echo "=================================="

# 加载.env文件
if [ -f .env ]; then
    echo "✅ .env file found"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found"
    exit 1
fi

echo ""
echo "📋 Environment Variables Status:"
echo "=================================="

check_var() {
    local var_name=$1
    local var_value=$(eval echo \$$var_name)
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name: NOT SET or EMPTY"
        return 1
    else
        # 只显示前5个字符，保护敏感信息
        local preview="${var_value:0:5}..."
        echo "✅ $var_name: $preview (length: ${#var_value})"
        return 0
    fi
}

# 检查所有必需的环境变量
all_ok=true

check_var "PORT" || all_ok=false
check_var "TABLESTORE_ENDPOINT" || all_ok=false
check_var "TABLESTORE_INSTANCE_NAME" || all_ok=false
check_var "TABLESTORE_ACCESS_KEY_ID" || all_ok=false
check_var "TABLESTORE_ACCESS_KEY_SECRET" || all_ok=false
check_var "TUNNEL_GAME_SESSIONS_ID" || all_ok=false
check_var "TUNNEL_GAME_EVENTS_ID" || all_ok=false
check_var "NODEJS_CALLBACK_URL" || all_ok=false

echo ""
echo "=================================="

if [ "$all_ok" = true ]; then
    echo "✅ All environment variables are properly set"
    exit 0
else
    echo "❌ Some environment variables are missing or empty"
    echo ""
    echo "📋 .env file contents (sanitized):"
    cat .env | sed 's/=.*/=***HIDDEN***/'
    exit 1
fi

