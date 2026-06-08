#!/bin/bash

# ==========================================
# APS System Health Check Script
# ==========================================

set -e

API_URL="http://localhost:3000/api"
WEB_URL="http://localhost"
DB_HOST="localhost"
DB_PORT="5432"
REDIS_HOST="localhost"
REDIS_PORT="6379"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local name=$1
    local url=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}[✓]${NC} $name - 在线"
        return 0
    else
        echo -e "${RED}[✗]${NC} $name - 离线"
        return 1
    fi
}

check_api_endpoint() {
    local name=$1
    local endpoint=$2
    
    if curl -sf "${API_URL}${endpoint}" > /dev/null 2>&1; then
        echo -e "${GREEN}[✓]${NC} API $name - 正常"
        return 0
    else
        echo -e "${YELLOW}[!]${NC} API $name - 异常"
        return 1
    fi
}

check_db() {
    if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
        echo -e "${GREEN}[✓]${NC} PostgreSQL - 在线 (${DB_HOST}:${DB_PORT})"
        return 0
    else
        echo -e "${RED}[✗]${NC} PostgreSQL - 离线"
        return 1
    fi
}

check_redis() {
    if redis-cli -h $REDIS_HOST -p $REDIS_PORT ping > /dev/null 2>&1; then
        echo -e "${GREEN}[✓]${NC} Redis - 在线 (${REDIS_HOST}:${REDIS_PORT})"
        return 0
    else
        echo -e "${RED}[✗]${NC} Redis - 离线"
        return 1
    fi
}

# Main
echo "=========================================="
echo "     APS 系统健康检查"
echo "=========================================="
echo ""

# Check Web
check_service "Web 前端" "$WEB_URL"
check_service "API 服务" "$API_URL/health" 2>/dev/null || check_service "API 服务" "http://localhost:3000"

# Check API endpoints
echo ""
echo "API 端点检查:"
check_api_endpoint "物料列表" "/v1/materials"
check_api_endpoint "订单列表" "/v1/orders"
check_api_endpoint "排程方案" "/v1/scheduling/plans"

# Check Infrastructure
echo ""
echo "基础设施检查:"
check_db
check_redis

# Summary
echo ""
echo "=========================================="
echo "     检查完成"
echo "=========================================="
