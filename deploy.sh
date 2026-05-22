#!/bin/bash

# 劳务公司员工信息管理系统 - 快速部署脚本

set -e

echo "========================================="
echo "  劳务公司员工信息管理系统 - 部署脚本"
echo "========================================="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 选择数据库
echo ""
echo "请选择数据库类型："
echo "1) SQLite（推荐，快速部署，无需额外配置）"
echo "2) MySQL"
echo "3) PostgreSQL"
read -p "请输入选项 (1-3，默认 1): " DB_CHOICE
DB_CHOICE=${DB_CHOICE:-1}

# 根据选择设置配置文件
case $DB_CHOICE in
    1)
        COMPOSE_FILE="docker-compose.yml"
        echo "✅ 已选择 SQLite"
        ;;
    2)
        COMPOSE_FILE="docker-compose.mysql.yml"
        echo "✅ 已选择 MySQL"
        ;;
    3)
        COMPOSE_FILE="docker-compose.postgres.yml"
        echo "✅ 已选择 PostgreSQL"
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

echo ""
echo "开始部署..."

# 构建并启动服务
if command -v docker-compose &> /dev/null; then
    docker-compose -f $COMPOSE_FILE up -d --build
else
    docker compose -f $COMPOSE_FILE up -d --build
fi

echo ""
echo "🎉 部署成功！"
echo ""
echo "访问地址："
echo "  前端应用：http://localhost"
echo "  API 服务：http://localhost/api"
echo ""
echo "常用命令："
echo "  查看日志：docker compose -f $COMPOSE_FILE logs -f"
echo "  停止服务：docker compose -f $COMPOSE_FILE down"
echo "  重启服务：docker compose -f $COMPOSE_FILE restart"
echo ""
