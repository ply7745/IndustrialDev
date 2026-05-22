# APS高级计划与排程系统

基于微信公众号文章《APS 高级计划与排程——关键点分析（落地项目案例）》的46个核心流程开发的完整APS系统。

## 📋 系统概述

APS（Advanced Planning and Scheduling）高级计划与排程系统是一套用于优化生产计划、调度的智能化管理系统。

### 核心功能

- **基础数据管理**：物料、BOM、客户、仓库、资源、日历等
- **订单管理**：订单引入、拆分、评审、变更、补投单
- **MRP运算**：净需求计算、物料需求分析、采购计划生成
- **排程管理**：多种排程算法、瓶颈分析、紧急插单
- **工单管理**：工单创建、拆分、锁定、下达
- **齐套分析**：订单齐套、工单齐套检查
- **物料控制**：库存管理、物料锁定、替代料管理

## 🛠️ 技术栈

- **后端框架**: NestJS + TypeScript
- **数据库**: PostgreSQL 15
- **ORM**: TypeORM
- **前端框架**: Vue 3 + TypeScript
- **UI组件**: Element Plus
- **缓存**: Redis 7

## 📁 项目结构

```
aps-system/
├── apps/
│   ├── api/                    # 后端API服务
│   │   └── src/
│   │       ├── modules/        # 功能模块
│   │       │   ├── master-data/    # 基础数据管理
│   │       │   ├── order/           # 订单管理
│   │       │   ├── mrp/            # MRP运算
│   │       │   ├── scheduling/      # 排程管理
│   │       │   ├── work-order/      # 工单管理
│   │       │   ├── kits/            # 齐套分析
│   │       │   ├── material/         # 物料控制
│   │       │   └── engineering/      # 工程计划
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── web/                    # 前端应用
│       └── src/
│           └── views/aps/     # APS页面
│
├── packages/
│   └── database/
│       ├── src/entities/      # 数据库实体
│       └── migrations/         # 数据库脚本
│
├── docker-compose.yml          # Docker配置
├── SPEC.md                     # 技术规格说明书
├── PROCESS_DETAILS.md          # 流程详细说明
└── TASKS.md                    # 开发任务清单
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- PostgreSQL >= 15
- Redis >= 7

### 使用Docker启动

```bash
# 启动所有服务
docker-compose up -d

# 初始化数据库
docker exec -it aps-system-postgres-1 psql -U postgres -d aps_db -f /docker-entrypoint-initdb.d/001_init_aps_schema.sql
```

### 本地开发

```bash
# 安装依赖
cd apps/api
npm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
npm run start:dev
```

### 前端开发

```bash
cd apps/web
npm install
npm run dev
```

## 📚 API文档

启动服务后访问：`http://localhost:3000/api/docs`

### 核心API接口

#### 基础数据管理

| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | /api/v1/materials | 查询物料列表 |
| POST | /api/v1/materials | 创建物料 |
| GET | /api/v1/boms | 查询BOM列表 |
| POST | /api/v1/boms | 创建BOM |
| GET | /api/v1/customers | 查询客户列表 |
| POST | /api/v1/customers | 创建客户 |
| GET | /api/v1/warehouses | 查询仓库列表 |
| POST | /api/v1/warehouses | 创建仓库 |
| GET | /api/v1/resources | 查询资源列表 |
| POST | /api/v1/resources | 创建资源 |
| GET | /api/v1/calendars | 查询日历列表 |
| POST | /api/v1/calendars | 创建日历 |

#### 订单管理

| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | /api/v1/orders | 查询订单列表 |
| POST | /api/v1/orders | 创建订单 |
| POST | /api/v1/orders/:id/approve | 订单评审通过 |
| POST | /api/v1/orders/:id/split | 订单拆分 |
| POST | /api/v1/orders/:id/change | 订单变更 |
| GET | /api/v1/orders/pending-review | 待评审订单 |

#### MRP运算

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/mrp/run | 执行MRP运算 |
| GET | /api/v1/mrp/runs | 查询MRP运行记录 |
| GET | /api/v1/mrp/net-requirements | 查询净需求 |
| GET | /api/v1/material-requirements | 查询物料需求 |
| POST | /api/v1/purchase-plans/generate | 生成采购计划 |

#### 排程管理

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/scheduling/plans | 创建排程方案 |
| POST | /api/v1/scheduling/plans/:id/execute | 执行排程 |
| GET | /api/v1/scheduling/results | 查询排程结果 |
| POST | /api/v1/scheduling/bottleneck-analysis | 瓶颈分析 |
| POST | /api/v1/scheduling/insertions/urgent | 紧急插单 |
| POST | /api/v1/scheduling/insertions/force | 强制插单 |

#### 工单管理

| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | /api/v1/work-orders | 查询工单列表 |
| POST | /api/v1/work-orders | 创建工单 |
| POST | /api/v1/work-orders/:id/release | 下达工单 |
| POST | /api/v1/work-orders/:id/split | 拆分工单 |
| POST | /api/v1/work-orders/:id/lock | 锁定工单 |
| POST | /api/v1/work-orders/:id/unlock | 解锁工单 |

#### 齐套分析

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/kits-analysis/order/:orderId | 订单齐套分析 |
| POST | /api/v1/kits-analysis/work-order/:workOrderId | 工单齐套分析 |
| GET | /api/v1/kits-analysis | 查询齐套分析列表 |

#### 物料控制

| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | /api/v1/inventory | 查询库存 |
| POST | /api/v1/material-locks | 创建物料锁定 |
| POST | /api/v1/material-locks/:id/release | 释放物料锁定 |
| GET | /api/v1/material-substitutes/:materialId | 获取替代料 |
| POST | /api/v1/purchase-plans | 查询采购计划 |
| POST | /api/v1/purchase-plans/:id/approve | 审批采购计划 |

#### 工程计划

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/engineering/plans | 创建工程计划 |
| POST | /api/v1/engineering/plans/:id/confirm | 确认工程计划 |
| POST | /api/v1/engineering/documents | 创建工程资料 |
| POST | /api/v1/engineering/documents/:id/confirm | 确认工程资料 |
| POST | /api/v1/engineering/locks | 创建工程锁 |
| POST | /api/v1/engineering/locks/:id/unlock | 解除工程锁 |

## 🗄️ 数据库

### 主要数据表

- `calendar_plan` - 日历方案表
- `material` - 物料信息表
- `bom` - BOM表
- `customer` - 客户信息表
- `warehouse` - 仓库表
- `resource` - 资源表
- `operation` - 工序表
- `sales_order` - 销售订单表
- `order_split` - 订单拆分表
- `order_change` - 订单变更表
- `replenishment_order` - 补投单表
- `engineering_plan` - 工程计划表
- `engineering_document` - 工程资料表
- `engineering_lock` - 工程锁表
- `scheduling_plan` - 排程方案表
- `scheduling_result` - 排程结果表
- `bottleneck_analysis` - 瓶颈分析表
- `order_insertion` - 插单记录表
- `work_order` - 工单表
- `work_order_split` - 工单拆分表
- `material_requirement` - 物料需求表
- `mrp_run` - MRP运行记录表
- `net_requirement` - 净需求表
- `kits_analysis` - 齐套分析表
- `kits_analysis_line` - 齐套明细表
- `inventory` - 库存表
- `material_lock` - 物料锁定表
- `material_substitute` - 物料替代表
- `purchase_plan` - 采购计划表

详细数据库设计请参考 `SPEC.md`。

## 📊 核心流程

### 订单处理流程

```
订单引入 → 订单评审 → 订单拆分 → MRP运算 → 排程生成 → 工单下达
```

### MRP运算流程

```
收集需求 → BOM展开 → 计算毛需求 → 获取库存 → 计算净需求 → 生成采购计划
```

### 排程流程

```
创建方案 → 数据准备 → 算法执行 → 瓶颈分析 → 结果输出
```

## 🧪 测试

```bash
# 运行单元测试
npm run test

# 运行覆盖率测试
npm run test:cov

# 运行E2E测试
npm run test:e2e
```

## 📝 开发指南

### 添加新模块

1. 在 `packages/database/src/entities/` 创建实体
2. 在对应模块创建服务和控制器
3. 在 `app.module.ts` 注册模块
4. 添加API路由

### 数据库迁移

```bash
# 生成迁移文件
npm run typeorm migration:generate -- -n MigrationName

# 运行迁移
npm run typeorm migration:run
```

## 📄 文档

- [技术规格说明书](SPEC.md)
- [流程详细说明](PROCESS_DETAILS.md)
- [开发任务清单](TASKS.md)

## 🤝 贡献

欢迎提交Issue和Pull Request。

## 📜 许可证

MIT License
