# APS 系统部署指南

## 目录
- [快速开始](#快速开始)
- [生产环境部署](#生产环境部署)
- [开发环境部署](#开发环境部署)
- [自动化部署](#自动化部署)
- [CI/CD 配置](#cicd-配置)
- [监控配置](#监控配置)
- [故障排查](#故障排查)

---

## 快速开始

### 一键启动
```bash
# 克隆项目
git clone <repository-url>
cd aps-system

# 快速启动
./start.sh
```

选择部署模式：
1. 生产环境（完整部署）
2. 开发环境（本地开发）
3. 仅数据库

---

## 生产环境部署

### 方式一：Docker Compose 部署

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 配置环境变量
cp apps/api/.env.example .env
vim .env  # 编辑配置

# 3. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 4. 查看服务状态
docker-compose -f docker-compose.prod.yml ps

# 5. 初始化数据库（如需要）
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d aps_db -f /docker-entrypoint-initdb.d/001_init_aps_schema.sql
```

### 方式二：使用部署脚本

```bash
# 交互式部署
./scripts/deploy.sh menu

# 或直接部署
./scripts/deploy.sh deploy
```

### 方式三：手动分步部署

```bash
# 1. 构建镜像
docker build -t aps-api:latest ./apps/api
docker build -t aps-web:latest ./apps/web

# 2. 启动基础设施
docker-compose -f docker-compose.prod.yml up -d postgres redis

# 3. 等待数据库就绪
sleep 10

# 4. 初始化数据库
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U postgres -d aps_db -f /docker-entrypoint-initdb.d/001_init_aps_schema.sql

# 5. 启动应用服务
docker-compose -f docker-compose.prod.yml up -d api web
```

---

## 开发环境部署

### 前置条件
- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL 15+ (可通过 Docker)
- Redis 7+ (可通过 Docker)

### 步骤

```bash
# 1. 启动数据库服务
docker-compose up -d postgres redis

# 2. 安装后端依赖
cd apps/api
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库连接

# 4. 启动后端开发服务器
npm run start:dev

# 5. 新开终端，安装前端依赖
cd apps/web
npm install

# 6. 启动前端开发服务器
npm run dev
```

### 开发服务地址
- API 服务：http://localhost:3000
- API 文档：http://localhost:3000/api/docs
- Web 前端：http://localhost:5173

---

## 自动化部署

### 部署脚本使用

```bash
# 查看所有可用命令
./scripts/deploy.sh

# 常用命令
./scripts/deploy.sh deploy          # 部署到生产环境
./scripts/deploy.sh deploy-staging  # 部署到预发布环境
./scripts/deploy.sh deploy-dev      # 部署到开发环境
./scripts/deploy.sh status          # 查看服务状态
./scripts/deploy.sh logs            # 查看日志
./scripts/deploy.sh restart         # 重启服务
./scripts/deploy.sh scale 5         # 扩展服务到5个实例
./scripts/deploy.sh backup          # 备份数据库
./scripts/deploy.sh stop            # 停止服务
./scripts/deploy.sh clean           # 清理环境
```

### 健康检查

```bash
# 运行健康检查
./scripts/health-check.sh

# 检查特定服务
curl http://localhost:3000/api/health
curl http://localhost/api/v1/materials
```

---

## CI/CD 配置

### GitHub Actions 工作流

项目包含以下自动化工作流：

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - 代码检查和测试
   - Docker 镜像构建
   - 自动部署到不同环境
   - 数据库备份

2. **Database Migration** (`.github/workflows/migration.yml`)
   - 数据库迁移管理
   - 支持 up/down/fresh 模式

### 环境配置

在 GitHub Settings 中配置以下 Secrets：

```bash
# 服务器配置
DEV_HOST          # 开发服务器地址
DEV_USER          # 开发服务器用户名
DEV_SSH_KEY       # 开发服务器 SSH 私钥

STAGING_HOST      # 预发布服务器地址
STAGING_USER      # 预发布服务器用户名
STAGING_SSH_KEY   # 预发布服务器 SSH 私钥

PROD_HOST         # 生产服务器地址
PROD_USER         # 生产服务器用户名
PROD_SSH_KEY      # 生产服务器 SSH 私钥

# 云存储（用于备份）
S3_BUCKET         # AWS S3 存储桶名称

# 通知
SLACK_WEBHOOK_URL # Slack Webhook URL

# 密码
DB_PASSWORD       # 数据库密码
GRAFANA_PASSWORD  # Grafana 管理员密码
```

### 触发部署

- **开发环境**：推送代码到 `develop` 分支
- **预发布环境**：推送代码到 `main` 分支
- **生产环境**：创建版本标签 `v*.*.*`

---

## 监控配置

### Prometheus + Grafana

生产环境配置包含完整的监控堆栈：

1. **Prometheus** - 指标收集
   - 访问地址：http://localhost:9090

2. **Grafana** - 可视化仪表盘
   - 访问地址：http://localhost:3000
   - 默认用户名：admin
   - 默认密码：admin123

### 监控指标

- API 响应时间
- API 请求率
- 数据库连接数
- 缓存命中率
- 服务健康状态

---

## Docker 服务说明

### 服务架构

```
┌─────────────────────────────────────────┐
│              负载均衡层                 │
│            (Nginx 可选)                 │
└────────────────┬──────────────────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────┐              ┌───▼────┐
│ Web 前端 │              │ API 服务 │
│  (Nginx) │              │ (Node)  │
└─────────┘              └────┬────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
         ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
         │PostgreSQL│    │  Redis   │    │ Prometheus│
         │  数据库  │    │  缓存    │    │  监控    │
         └─────────┘    └─────────┘    └─────────┘
```

### 端口映射

| 服务 | 容器端口 | 主机端口 | 说明 |
|-----|---------|---------|------|
| Web | 80 | 80 | 前端应用 |
| API | 3000 | 3000 | 后端 API |
| PostgreSQL | 5432 | 5432 | 数据库 |
| Redis | 6379 | 6379 | 缓存 |
| Prometheus | 9090 | 9090 | 监控 |
| Grafana | 3000 | 3000 | 仪表盘 |

### 数据持久化

所有数据通过 Docker Volume 持久化：

- `postgres_data` - 数据库数据
- `redis_data` - Redis 数据
- `prometheus_data` - 监控数据
- `grafana_data` - 仪表盘配置

---

## 故障排查

### 常见问题

#### 1. 容器无法启动

```bash
# 查看容器日志
docker-compose logs <service-name>

# 检查 Docker 状态
docker ps -a

# 重新构建镜像
docker-compose build --no-cache
```

#### 2. 数据库连接失败

```bash
# 检查数据库是否运行
docker-compose ps postgres

# 检查数据库日志
docker-compose logs postgres

# 手动连接测试
docker-compose exec postgres psql -U postgres -d aps_db
```

#### 3. API 无法访问

```bash
# 检查 API 日志
docker-compose logs api

# 检查端口占用
netstat -tlnp | grep 3000

# 重启 API 服务
docker-compose restart api
```

#### 4. 前端无法加载

```bash
# 检查 Nginx 日志
docker-compose logs web

# 重建前端镜像
docker-compose build --no-cache web
docker-compose up -d web
```

### 日志管理

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f postgres

# 导出日志
docker-compose logs > app.log
```

### 数据库维护

```bash
# 连接数据库
docker-compose exec postgres psql -U postgres -d aps_db

# 备份数据库
docker-compose exec -T postgres pg_dump -U postgres aps_db > backup.sql

# 恢复数据库
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d aps_db

# 查看连接数
docker-compose exec postgres psql -U postgres -d aps_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### 性能优化

```bash
# 扩展 API 实例
docker-compose -f docker-compose.prod.yml up -d --scale api=3

# 清理未使用的 Docker 资源
docker system prune -a

# 清理日志
docker-compose logs --tail=0 > /dev/null
truncate -s 0 /var/lib/docker/containers/*/*.log
```

---

## 安全配置

### 生产环境必做

1. **修改默认密码**
   ```bash
   # 编辑 .env 文件
   vim .env
   
   # 设置强密码
   DB_PASSWORD=your_secure_password_here
   ```

2. **启用 HTTPS**
   ```nginx
   # nginx.conf
   server {
       listen 443 ssl;
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
   }
   ```

3. **配置防火墙**
   ```bash
   # 只开放必要端口
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw deny 5432/tcp  # 禁止外部访问数据库
   ufw deny 6379/tcp   # 禁止外部访问 Redis
   ```

4. **定期更新**
   ```bash
   # 更新基础镜像
   docker-compose pull
   docker-compose up -d
   ```

---

## 扩展阅读

- [技术规格说明书](SPEC.md)
- [流程详细说明](PROCESS_DETAILS.md)
- [开发任务清单](TASKS.md)
- [API 文档](http://localhost:3000/api/docs)

---

## 技术支持

如遇问题，请检查：
1. Docker 和 Docker Compose 版本
2. 系统资源是否充足（建议 4GB+ 内存）
3. 端口是否被占用
4. 查看日志定位问题
