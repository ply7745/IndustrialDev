#!/bin/bash

# ==========================================
# APS System Quick Start Script
# ==========================================

set -e

echo "=========================================="
echo "  APS 高级计划与排程系统 - 快速启动"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装"
    exit 1
fi

# Welcome
echo "欢迎使用 APS 系统！"
echo ""
echo "请选择部署模式："
echo "  1) 生产环境 (完整部署)"
echo "  2) 开发环境 (本地开发)"
echo "  3) 仅数据库"
echo ""
read -p "请输入选项 [1-3]: " choice

case $choice in
    1)
        log_info "启动生产环境..."
        
        # Pull latest
        log_info "拉取最新代码..."
        git pull origin main 2>/dev/null || true
        
        # Start services
        log_info "启动服务..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services
        log_info "等待服务启动..."
        sleep 10
        
        # Check status
        echo ""
        log_success "服务启动完成！"
        echo ""
        echo "=========================================="
        echo "  访问地址"
        echo "=========================================="
        echo "  API 服务:    http://localhost:3000"
        echo "  API 文档:    http://localhost:3000/api/docs"
        echo "  Web 前端:    http://localhost"
        echo "  PostgreSQL:  localhost:5432"
        echo "  Redis:       localhost:6379"
        echo ""
        echo "  管理员:      admin / admin123"
        echo ""
        ;;
        
    2)
        log_info "启动开发环境..."
        
        # Create env file
        if [ ! -f .env ]; then
            cp apps/api/.env.example .env
            log_success "已创建 .env 配置文件"
        fi
        
        # Start database
        log_info "启动数据库服务..."
        docker-compose up -d postgres redis
        
        # Wait for database
        log_info "等待数据库启动..."
        sleep 5
        
        # Install and start API
        log_info "安装后端依赖..."
        cd apps/api && npm install
        
        log_info "启动后端开发服务器..."
        cd ../..
        cd apps/api && npm run start:dev &
        API_PID=$!
        
        # Install and start Web
        log_info "安装前端依赖..."
        cd ../web && npm install
        
        log_info "启动前端开发服务器..."
        npm run dev &
        WEB_PID=$!
        
        # Wait
        sleep 5
        
        echo ""
        log_success "开发环境启动完成！"
        echo ""
        echo "=========================================="
        echo "  开发服务地址"
        echo "=========================================="
        echo "  API 服务:    http://localhost:3000"
        echo "  API 文档:    http://localhost:3000/api/docs"
        echo "  Web 前端:    http://localhost:5173"
        echo ""
        echo "按 Ctrl+C 停止服务"
        echo ""
        
        # Wait for interrupt
        wait
        ;;
        
    3)
        log_info "仅启动数据库..."
        docker-compose up -d postgres
        
        echo ""
        log_success "数据库启动完成！"
        echo ""
        echo "  PostgreSQL:  localhost:5432"
        echo "  用户名:      postgres"
        echo "  密码:        postgres123"
        echo "  数据库:      aps_db"
        echo ""
        ;;
        
    *)
        echo "无效选项"
        exit 1
        ;;
esac
