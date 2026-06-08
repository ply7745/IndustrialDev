#!/bin/bash

# ==========================================
# APS System Automated Deployment Script
# ==========================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="aps-system"
API_PORT=3000
WEB_PORT=80
DB_PORT=5432
REDIS_PORT=6379

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "检查系统要求..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js"
        exit 1
    fi
    
    log_success "所有要求已满足"
}

pull_latest_code() {
    log_info "拉取最新代码..."
    cd "$(dirname "$0")"
    git pull origin main || git pull origin master
    log_success "代码已更新"
}

build_docker_images() {
    log_info "构建 Docker 镜像..."
    
    # Build API image
    log_info "构建 API 镜像..."
    docker build -t ${PROJECT_NAME}-api:latest ./apps/api
    
    # Build Web image
    log_info "构建 Web 镜像..."
    docker build -t ${PROJECT_NAME}-web:latest ./apps/web
    
    log_success "镜像构建完成"
}

deploy_docker_compose() {
    log_info "使用 Docker Compose 部署..."
    docker-compose up -d
    log_success "部署完成"
}

deploy_production() {
    log_info "生产环境部署..."
    
    # Pull latest code
    pull_latest_code
    
    # Build images
    build_docker_images
    
    # Deploy
    deploy_docker_compose
    
    # Initialize database
    log_info "初始化数据库..."
    sleep 5
    init_database
    
    log_success "生产环境部署完成"
}

deploy_staging() {
    log_info "预发布环境部署..."
    
    # Pull staging branch
    git checkout staging
    pull_latest_code
    
    # Deploy with staging config
    docker-compose -f docker-compose.staging.yml up -d
    
    log_success "预发布环境部署完成"
}

deploy_development() {
    log_info "开发环境部署..."
    
    # Create env file
    if [ ! -f .env ]; then
        cp apps/api/.env.example .env
        log_warn "已创建 .env 文件，请根据需要修改配置"
    fi
    
    # Start services
    docker-compose up -d postgres redis
    
    # Install dependencies and start API
    log_info "安装后端依赖..."
    cd apps/api && npm install
    
    log_info "启动后端开发服务器..."
    npm run start:dev &
    
    # Install dependencies and start Web
    log_info "安装前端依赖..."
    cd ../web && npm install
    
    log_info "启动前端开发服务器..."
    npm run dev &
    
    log_success "开发环境部署完成"
}

init_database() {
    log_info "初始化数据库..."
    
    # Wait for PostgreSQL to be ready
    for i in {1..30}; do
        if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            break
        fi
        log_info "等待数据库启动... ($i/30)"
        sleep 2
    done
    
    # Run initialization script
    docker-compose exec -T postgres psql -U postgres -d aps_db -f /docker-entrypoint-initdb.d/001_init_aps_schema.sql
    
    log_success "数据库初始化完成"
}

backup_database() {
    log_info "备份数据库..."
    
    BACKUP_DIR="./backups"
    mkdir -p $BACKUP_DIR
    
    BACKUP_FILE="${BACKUP_DIR}/aps_db_$(date +%Y%m%d_%H%M%S).sql"
    
    docker-compose exec -T postgres pg_dump -U postgres aps_db > $BACKUP_FILE
    
    log_success "数据库已备份到: $BACKUP_FILE"
}

restore_database() {
    BACKUP_FILE=$1
    
    if [ ! -f "$BACKUP_FILE" ]; then
        log_error "备份文件不存在: $BACKUP_FILE"
        exit 1
    fi
    
    log_info "恢复数据库..."
    cat $BACKUP_FILE | docker-compose exec -T postgres psql -U postgres -d aps_db
    
    log_success "数据库恢复完成"
}

show_status() {
    log_info "检查服务状态..."
    
    echo ""
    echo "========================================"
    echo "         APS 系统服务状态"
    echo "========================================"
    echo ""
    
    docker-compose ps
    
    echo ""
    echo "========================================"
    echo "         服务访问地址"
    echo "========================================"
    echo ""
    echo "API 服务:      http://localhost:${API_PORT}"
    echo "API 文档:      http://localhost:${API_PORT}/api/docs"
    echo "Web 前端:      http://localhost:${WEB_PORT}"
    echo "PostgreSQL:    localhost:${DB_PORT}"
    echo "Redis:         localhost:${REDIS_PORT}"
    echo ""
}

view_logs() {
    SERVICE=$1
    
    if [ -z "$SERVICE" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f $SERVICE
    fi
}

stop_services() {
    log_info "停止服务..."
    docker-compose down
    log_success "服务已停止"
}

clean_environment() {
    log_warn "清理环境将删除所有数据，是否继续？"
    read -p "输入 'yes' 继续: " confirm
    
    if [ "$confirm" = "yes" ]; then
        log_info "清理环境..."
        docker-compose down -v
        docker system prune -f
        log_success "环境已清理"
    else
        log_info "取消清理"
    fi
}

restart_services() {
    log_info "重启服务..."
    docker-compose restart
    log_success "服务已重启"
}

scale_api() {
    REPLICAS=$1
    
    if [ -z "$REPLICAS" ]; then
        REPLICAS=3
    fi
    
    log_info "扩展 API 服务到 $REPLICAS 个实例..."
    docker-compose up -d --scale api=$REPLICAS
    log_success "扩展完成"
}

# Main Menu
show_menu() {
    echo ""
    echo "========================================"
    echo "     APS 系统自动化部署工具"
    echo "========================================"
    echo ""
    echo "1. 部署到生产环境"
    echo "2. 部署到预发布环境"
    echo "3. 部署到开发环境"
    echo "4. 查看服务状态"
    echo "5. 查看日志"
    echo "6. 重启服务"
    echo "7. 扩展服务"
    echo "8. 备份数据库"
    echo "9. 恢复数据库"
    echo "10. 停止服务"
    echo "11. 清理环境"
    echo "12. 初始化数据库"
    echo "13. 退出"
    echo ""
}

# Main
case "${1:-menu}" in
    deploy|deploy-prod|1)
        deploy_production
        show_status
        ;;
    deploy-staging|2)
        deploy_staging
        show_status
        ;;
    deploy-dev|3)
        deploy_development
        show_status
        ;;
    status|4)
        show_status
        ;;
    logs|5)
        view_logs ${2:-}
        ;;
    restart|6)
        restart_services
        show_status
        ;;
    scale|7)
        scale_api ${2:-3}
        show_status
        ;;
    backup|8)
        backup_database
        ;;
    restore|9)
        restore_database ${2:-}
        ;;
    stop|10)
        stop_services
        ;;
    clean|11)
        clean_environment
        ;;
    init|12)
        init_database
        ;;
    menu|13)
        show_menu
        read -p "请选择操作: " choice
        case $choice in
            1) deploy_production ;;
            2) deploy_staging ;;
            3) deploy_development ;;
            4) show_status ;;
            5) view_logs ;;
            6) restart_services ;;
            7) read -p "输入实例数: " replicas; scale_api $replicas ;;
            8) backup_database ;;
            9) read -p "输入备份文件路径: " backup; restore_database $backup ;;
            10) stop_services ;;
            11) clean_environment ;;
            12) init_database ;;
            13) exit 0 ;;
        esac
        ;;
    *)
        echo "用法: $0 {deploy|deploy-staging|deploy-dev|status|logs|restart|scale|backup|restore|stop|clean|init|menu}"
        echo ""
        echo "选项:"
        echo "  deploy           - 部署到生产环境"
        echo "  deploy-staging   - 部署到预发布环境"
        echo "  deploy-dev       - 部署到开发环境"
        echo "  status           - 查看服务状态"
        echo "  logs [service]   - 查看日志"
        echo "  restart          - 重启服务"
        echo "  scale [num]      - 扩展服务实例数"
        echo "  backup           - 备份数据库"
        echo "  restore [file]   - 恢复数据库"
        echo "  stop             - 停止服务"
        echo "  clean            - 清理环境"
        echo "  init             - 初始化数据库"
        echo "  menu             - 显示菜单"
        exit 1
        ;;
esac
