#!/bin/bash

# 劳务公司员工信息管理系统 - 腾讯云一键部署脚本

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}  劳务公司员工信息管理系统 - 腾讯云部署  ${NC}"
echo -e "${BLUE}=========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    echo -e "尝试: sudo $0"
    exit 1
fi

# 检测系统类型
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}无法检测操作系统类型${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📋 系统信息: $PRETTY_NAME${NC}"

# 1. 更新系统
echo -e "\n${BLUE}[1/8]${NC} 更新系统..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get update && apt-get upgrade -y
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum update -y
else
    echo -e "${YELLOW}⚠️ 不支持的操作系统，尝试继续...${NC}"
fi

# 2. 安装基础工具
echo -e "\n${BLUE}[2/8]${NC} 安装基础工具..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt-get install -y curl wget git vim ca-certificates gnupg lsb-release
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum install -y curl wget git vim
fi

# 3. 安装 Docker
echo -e "\n${BLUE}[3/8]${NC} 安装 Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    
    # 使用腾讯云镜像源加速（可选）
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
  "registry-mirrors": [
    "https://mirror.ccs.tencentyun.com",
    "https://docker.mirrors.ustc.edu.cn"
  ]
}
EOF
else
    echo -e "${GREEN}✅ Docker 已安装${NC}"
fi

# 4. 安装 Docker Compose
echo -e "\n${BLUE}[4/8]${NC} 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    # 尝试使用插件方式安装
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get install -y docker-compose-plugin
    fi
    
    # 如果插件方式失败，使用二进制方式
    if ! docker compose version &> /dev/null; then
        DOCKER_COMPOSE_VERSION="v2.20.2"
        curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
else
    echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
fi

# 5. 启动 Docker 服务
echo -e "\n${BLUE}[5/8]${NC} 启动 Docker 服务..."
systemctl start docker 2>/dev/null || true
systemctl enable docker 2>/dev/null || true

# 6. 验证安装
echo -e "\n${BLUE}[6/8]${NC} 验证安装..."
docker --version
if docker compose version &> /dev/null; then
    docker compose version
elif docker-compose --version &> /dev/null; then
    docker-compose --version
fi

# 7. 检测项目文件
echo -e "\n${BLUE}[7/8]${NC} 检测项目文件..."
if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ 找到项目文件${NC}"
else
    echo -e "${YELLOW}⚠️ 未找到项目文件${NC}"
    echo ""
    echo "请选择项目获取方式："
    echo "1) 从 Git 仓库克隆"
    echo "2) 手动上传项目文件"
    read -p "请输入选项 (1-2): " PROJECT_CHOICE
    
    case $PROJECT_CHOICE in
        1)
            read -p "请输入 Git 仓库地址: " GIT_REPO
            if [ -z "$GIT_REPO" ]; then
                echo -e "${RED}❌ 仓库地址不能为空${NC}"
                exit 1
            fi
            echo -e "${GREEN}正在克隆仓库...${NC}"
            git clone "$GIT_REPO" labor-management
            cd labor-management
            ;;
        2)
            echo ""
            echo "请将项目文件上传到当前目录后重新运行此脚本"
            echo "或使用以下命令上传："
            echo "  scp -r /path/to/local/workspace root@$(hostname -I | awk '{print $1}'):/root/"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选项${NC}"
            exit 1
            ;;
    esac
fi

# 8. 启动服务
echo -e "\n${BLUE}[8/8]${NC} 启动服务..."

# 选择数据库
echo ""
echo "请选择数据库类型："
echo "1) SQLite（推荐，无需额外配置）"
echo "2) MySQL"
echo "3) PostgreSQL"
read -p "请输入选项 (1-3，默认 1): " DB_CHOICE
DB_CHOICE=${DB_CHOICE:-1}

COMPOSE_FILE=""
case $DB_CHOICE in
    1)
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${GREEN}✅ 已选择 SQLite${NC}"
        ;;
    2)
        COMPOSE_FILE="docker-compose.mysql.yml"
        echo -e "${GREEN}✅ 已选择 MySQL${NC}"
        ;;
    3)
        COMPOSE_FILE="docker-compose.postgres.yml"
        echo -e "${GREEN}✅ 已选择 PostgreSQL${NC}"
        ;;
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

echo -e "\n${YELLOW}🚀 开始构建和启动服务...${NC}"

# 使用兼容的 docker compose 命令
if command -v docker-compose &> /dev/null; then
    docker-compose -f $COMPOSE_FILE up -d --build
elif docker compose version &> /dev/null; then
    docker compose -f $COMPOSE_FILE up -d --build
else
    echo -e "${RED}❌ Docker Compose 命令不可用${NC}"
    exit 1
fi

# 获取服务器IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 部署成功！${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "📱 访问地址："
echo -e "   前端应用：${BLUE}http://$SERVER_IP${NC}"
echo -e "   API 服务：${BLUE}http://$SERVER_IP/api${NC}"
echo ""
echo "📚 常用命令："
echo "   查看日志：docker compose -f $COMPOSE_FILE logs -f"
echo "   停止服务：docker compose -f $COMPOSE_FILE down"
echo "   重启服务：docker compose -f $COMPOSE_FILE restart"
echo "   更新部署：git pull && docker compose -f $COMPOSE_FILE up -d --build"
echo ""
echo "🛡️  安全提醒："
echo "   1. 请在腾讯云控制台配置安全组，开放端口 80"
echo "   2. 建议配置 HTTPS 和域名"
echo "   3. 定期备份数据"
echo ""
echo -e "${BLUE}详细文档请查看：docs/腾讯云部署指南.md${NC}"
echo ""
