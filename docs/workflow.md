# 工业信息化开发工作流文档

## 项目概述

这是一个现代化的工业信息化系统开发框架，支持 MES、WMS、QMS、EMS 等系统快速开发。

## 技术架构

```
┌─────────────────────────────────────────────┐
│                   Web 前端                   │
│         Vue3 + Element Plus + TypeScript    │
└─────────────────────────────────────────────┘
                      │
                      │ API (REST)
                      ▼
┌─────────────────────────────────────────────┐
│                   后端 API                   │
│          NestJS + TypeORM + MySQL           │
└─────────────────────────────────────────────┘
                      │
                      │ 数据库
                      ▼
┌─────────────────────────────────────────────┐
│                 数据库层                     │
│          MySQL / PostgreSQL                 │
└─────────────────────────────────────────────┘
```

## 模块说明

### MES (生产管理)
- 生产订单管理
- 工站状态监控
- 生产进度跟踪

### WMS (仓储管理)
- 库存管理
- 入库/出库操作
- 移库管理

### QMS (质量管理)
- 进货检验
- 过程检验
- 出货检验

### EMS (设备管理)
- 设备状态监控
- 维护计划
- 设备启停控制

## 快速开始

### 1. 安装依赖

```bash
cd D:\IndustrialDev
pnpm install
```

### 2. 配置数据库

修改 `apps/api/.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=industrial_dev
```

### 3. 启动服务

```bash
# 启动后端
pnpm --filter @industrial/api dev

# 启动前端
pnpm --filter @industrial/web dev
```

### 4. 访问系统

- 前端: http://localhost:5173
- API: http://localhost:3000/api

## 自动化工作流

### 开发流程

1. 创建功能分支
2. 编写代码 + AI 辅助
3. 自动测试
4. 自动构建
5. 自动部署

### CI/CD (GitHub Actions)

- 推送代码自动触发构建
- 测试通过自动部署
- 支持多环境部署

### AI 辅助开发

可以通过我调用 Codex/Claude Code 自动生成代码：

```
我帮你启动编程代理：
- 自动生成模块
- 自动写 CRUD
- 自动写测试
- 自动重构
```

## 移动端开发

项目预留了 `apps/mobile` 目录，支持：

- React Native (iOS/Android)
- Flutter (跨平台)

## 部署方式

### Docker 部署

```bash
docker-compose up -d
```

### 手动部署

```bash
# 构建
pnpm build

# 部署 API
cd apps/api && npm run start:prod

# 部署 Web
cd apps/web && npm run preview
```