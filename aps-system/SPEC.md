# APS高级计划与排程系统 - 技术规格说明书

## 一、系统概述

### 1.1 项目背景
基于微信公众号文章《APS 高级计划与排程——关键点分析（落地项目案例）》提供的46个核心流程，构建一套完整的APS（Advanced Planning and Scheduling）高级计划与排程系统。

### 1.2 系统目标
- 实现订单到工单的全流程管理
- 提供精确的物料需求计划（MRP）
- 支持多约束条件下的智能排程
- 实现产能优化和瓶颈分析
- 支持紧急插单和强制插单管理

### 1.3 核心流程映射

| 序号 | 流程名称 | 所属模块 |
|-----|---------|---------|
| ① | 基础数据管理流程 | 基础数据管理 |
| ② | 日历方案管理流程 | 基础数据管理 |
| ③ | 物料信息引入流程 | 基础数据管理 |
| ④ | BOM引入流程 | 基础数据管理 |
| ⑤ | 客户信息引入流程 | 基础数据管理 |
| ⑥ | 子库引入流程 | 基础数据管理 |
| ⑦ | 计划资源流程 | 基础数据管理 |
| ⑧ | 工程资料引入流程 | 基础数据管理 |
| ⑨ | 订单引入流程 | 订单管理 |
| ⑩ | 工程计划管理流程 | 工程计划 |
| ⑪ | 工程资料确认流程 | 工程计划 |
| ⑫ | 复投单工程锁管理流程 | 工程计划 |
| ⑬ | 订单拆分管理流程 | 订单管理 |
| ⑭ | 订单评审管理流程 | 订单管理 |
| ⑮ | 合同变更管理流程 | 订单管理 |
| ⑯ | 订单变更管理流程 | 订单管理 |
| ⑰ | 补投单导入管理流程 | 订单管理 |
| ⑱ | 净需求计算管理流程 | MRP计算 |
| ⑲ | 排程方案管理流程 | 排程管理 |
| ⑳ | 瓶颈工序分布计算流程 | 排程管理 |
| ㉑ | 产能分配流程 | 排程管理 |
| ㉒ | 紧急插单管理流程 | 排程管理 |
| ㉓ | 强制插单管理流程 | 排程管理 |
| ㉔ | 计划单导入流程 | 工单管理 |
| ㉕ | 计划单锁定管理流程 | 工单管理 |
| ㉖ | 工单拆分管理流程 | 工单管理 |
| ㉗ | 工单下达管理流程 | 工单管理 |
| ㉘ | 待评审物料需求流程 | 物料需求 |
| ㉙ | 预测物料需求流程 | 物料需求 |
| ㉚ | 预生产物料需求流程 | 物料需求 |
| ㉛ | 在线工单物料需求流程 | 物料需求 |
| ㉜ | 原材料销售订单需求 | 物料需求 |
| ㉝ | 安全库存物料需求流程 | 物料需求 |
| ㉞ | 预测物料冲减流程 | 物料需求 |
| ㉟ | 待评审订单齐套流程 | 齐套分析 |
| ㊱ | 工单物料齐套流程 | 齐套分析 |
| ㊲ | MRP流程 | MRP计算 |
| ㊳ | 主料采购计划流程 | 采购计划 |
| ㊴ | 物料锁定流程 | 物料控制 |
| ㊵ | 物料释放流程 | 物料控制 |
| ㊶ | 物料替代流程 | 物料控制 |

## 二、技术架构

### 2.1 系统架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    表现层 (Vue 3 + Element Plus)            │
├─────────────────────────────────────────────────────────────┤
│                    BFF层 (NestJS API Gateway)                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 基础数据服务│ │ 订单服务    │ │ 工程计划服务│          │
│  │ MasterData  │ │ Order       │ │ Engineering │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ MRP服务     │ │ 排程服务    │ │ 工单服务    │          │
│  │ MRP         │ │ Schedule    │ │ WorkOrder   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │ 物料服务    │ │ 齐套分析服务│                          │
│  │ Material    │ │ KitsAnalysis│                          │
│  └─────────────┘ └─────────────┘                          │
├─────────────────────────────────────────────────────────────┤
│                    数据层 (PostgreSQL + Redis)              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈
- **后端框架**: NestJS + TypeScript
- **数据库**: PostgreSQL 15
- **ORM**: TypeORM
- **缓存**: Redis 7
- **消息队列**: Redis Queue
- **前端框架**: Vue 3 + TypeScript
- **UI组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4

### 2.3 项目结构
```
apps/
├── api/                    # 后端API服务
│   └── src/
│       ├── modules/        # 功能模块
│       │   ├── master-data/        # 基础数据管理
│       │   ├── order/               # 订单管理
│       │   ├── engineering/         # 工程计划
│       │   ├── mrp/                 # MRP计算
│       │   ├── scheduling/          # 排程管理
│       │   ├── work-order/          # 工单管理
│       │   ├── material/            # 物料控制
│       │   └── kits-analysis/       # 齐套分析
│       ├── core/            # 核心引擎
│       │   ├── mrp-engine/          # MRP引擎
│       │   ├── scheduling-engine/   # 排程引擎
│       │   └── constraint-solver/   # 约束求解器
│       └── common/          # 公共模块
│
└── web/                    # 前端应用
    └── src/
        ├── views/          # 页面
        │   ├── master-data/        # 基础数据
        │   ├── order/              # 订单管理
        │   ├── scheduling/         # 排程管理
        │   ├── work-order/         # 工单管理
        │   └── material/           # 物料管理
        ├── components/      # 组件
        └── stores/         # 状态管理
```

## 三、数据库设计

### 3.1 基础数据表

#### 3.1.1 日历方案表 (calendar_plan)
```sql
CREATE TABLE calendar_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'WORKING', 'SHIFT', 'BREAK'
    effective_date DATE NOT NULL,
    expiry_date DATE,
    work_days JSONB NOT NULL,  -- {1: true, 2: true, ...}
    shift_patterns JSONB,      -- [{start: '08:00', end: '12:00'}, ...]
    holidays JSONB,            -- ['2024-01-01', '2024-05-01', ...]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.2 物料信息表 (material)
```sql
CREATE TABLE material (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'RAW', 'SEMI', 'FINISHED'
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(18, 4),
    safety_stock DECIMAL(18, 4) DEFAULT 0,
    min_lot_size DECIMAL(18, 4),
    max_lot_size DECIMAL(18, 4),
    lead_time INTEGER DEFAULT 0,  -- 天数
    bom_level INTEGER DEFAULT 0,
    warehouse_id UUID,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.3 BOM表 (bom)
```sql
CREATE TABLE bom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_material_id UUID NOT NULL REFERENCES material(id),
    child_material_id UUID NOT NULL REFERENCES material(id),
    quantity DECIMAL(18, 6) NOT NULL,
    scrap_rate DECIMAL(5, 4) DEFAULT 0,
    version VARCHAR(20),
    effective_date DATE NOT NULL,
    expiry_date DATE,
    is_alternative BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.4 客户信息表 (customer)
```sql
CREATE TABLE customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(50),
    credit_limit DECIMAL(18, 4),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.5 子库/仓库表 (warehouse)
```sql
CREATE TABLE warehouse (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'RAW', 'WIP', 'FINISHED'
    address TEXT,
    capacity DECIMAL(18, 4),
    parent_warehouse_id UUID REFERENCES warehouse(id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.6 资源表 (resource)
```sql
CREATE TABLE resource (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,  -- 'WORKCENTER', 'MACHINE', 'WORKER'
    workcenter_id UUID,
    calendar_id UUID REFERENCES calendar_plan(id),
    capacity DECIMAL(18, 4) DEFAULT 1,
    efficiency DECIMAL(5, 4) DEFAULT 1,
    utilization DECIMAL(5, 4) DEFAULT 1,
    cost_per_hour DECIMAL(18, 4),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.1.7 工序表 (operation)
```sql
CREATE TABLE operation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    workcenter_id UUID REFERENCES resource(id),
    standard_time DECIMAL(18, 4),  -- 标准工时（小时）
    setup_time DECIMAL(18, 4),     -- 准备时间
    process_time DECIMAL(18, 4),   -- 加工时间
    queue_time DECIMAL(18, 4),     -- 排队时间
    wait_time DECIMAL(18, 4),      -- 等待时间
    transfer_time DECIMAL(18, 4),  -- 转移时间
    is_bottleneck BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 订单管理表

#### 3.2.1 销售订单表 (sales_order)
```sql
CREATE TABLE sales_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customer(id),
    order_type VARCHAR(20) NOT NULL,  -- 'SALES', 'FORECAST', 'REplenishment'
    priority INTEGER DEFAULT 5,  -- 1-10，1最高
    order_date DATE NOT NULL,
    demand_date DATE,
    quantity DECIMAL(18, 6) NOT NULL,
    delivered_quantity DECIMAL(18, 6) DEFAULT 0,
    unit_price DECIMAL(18, 4),
    total_amount DECIMAL(18, 4),
    status VARCHAR(20) DEFAULT 'PENDING',
    approval_status VARCHAR(20) DEFAULT 'PENDING',  -- 待评审
    contract_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2.2 订单拆分表 (order_split)
```sql
CREATE TABLE order_split (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_order_id UUID NOT NULL REFERENCES sales_order(id),
    split_order_no VARCHAR(50) NOT NULL,
    split_quantity DECIMAL(18, 6) NOT NULL,
    split_reason VARCHAR(200),
    demand_date DATE,
    priority INTEGER,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.2.3 订单变更表 (order_change)
```sql
CREATE TABLE order_change (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES sales_order(id),
    change_type VARCHAR(20) NOT NULL,  -- 'QUANTITY', 'DATE', 'PRIORITY', 'CANCEL'
    original_value TEXT,
    new_value TEXT,
    change_reason VARCHAR(500),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'APPLIED'
);
```

#### 3.2.4 补投单表 (replenishment_order)
```sql
CREATE TABLE replenishment_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    original_order_id UUID REFERENCES sales_order(id),
    reason VARCHAR(200),
    quantity DECIMAL(18, 6) NOT NULL,
    demand_date DATE,
    priority INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 工程计划表

#### 3.3.1 工程计划表 (engineering_plan)
```sql
CREATE TABLE engineering_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_no VARCHAR(50) NOT NULL UNIQUE,
    material_id UUID REFERENCES material(id),
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT, CONFIRMED, LOCKED
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.3.2 工程资料表 (engineering_document)
```sql
CREATE TABLE engineering_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50),  -- 'DRAWING', 'SPEC', 'PROCESS', 'BOM'
    file_url TEXT,
    material_id UUID REFERENCES material(id),
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, CONFIRMED
    confirmed_at TIMESTAMP,
    confirmed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.3.3 工程锁表 (engineering_lock)
```sql
CREATE TABLE engineering_lock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES material(id),
    lock_type VARCHAR(20) NOT NULL,  -- 'REPEAT_LOCK', 'ENGINEERING_LOCK'
    reason VARCHAR(500),
    locked_by VARCHAR(100),
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlock_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'LOCKED'
);
```

### 3.4 排程管理表

#### 3.4.1 排程方案表 (scheduling_plan)
```sql
CREATE TABLE scheduling_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200),
    description TEXT,
    planning_horizon_start DATE,
    planning_horizon_end DATE,
    algorithm VARCHAR(50),  -- 'FORWARD', 'BACKWARD', 'FINITE_CAPACITY'
    optimization_target VARCHAR(50),  -- 'MIN_MAKESPAN', 'MIN_DELAY', 'BALANCE_LOAD'
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.4.2 排程结果表 (scheduling_result)
```sql
CREATE TABLE scheduling_result (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES scheduling_plan(id),
    order_id UUID REFERENCES sales_order(id),
    work_order_id UUID,
    operation_id UUID REFERENCES operation(id),
    resource_id UUID REFERENCES resource(id),
    planned_start_time TIMESTAMP NOT NULL,
    planned_end_time TIMESTAMP NOT NULL,
    planned_quantity DECIMAL(18, 6),
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PLANNED',
    priority INTEGER DEFAULT 5,
    delay_hours DECIMAL(18, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.4.3 瓶颈分析表 (bottleneck_analysis)
```sql
CREATE TABLE bottleneck_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workcenter_id UUID NOT NULL REFERENCES resource(id),
    analysis_date DATE NOT NULL,
    utilization_rate DECIMAL(5, 4) NOT NULL,
    queue_length INTEGER,
    avg_wait_time DECIMAL(18, 4),
    capacity_load DECIMAL(5, 4),
    is_bottleneck BOOLEAN DEFAULT false,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.4.4 插单记录表 (order_insertion)
```sql
CREATE TABLE order_insertion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES sales_order(id),
    insertion_type VARCHAR(20) NOT NULL,  -- 'URGENT', 'FORCE'
    original_demand_date DATE,
    new_demand_date DATE,
    reason VARCHAR(500),
    impacted_orders JSONB,  -- 受影响的订单列表
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.5 工单管理表

#### 3.5.1 工单表 (work_order)
```sql
CREATE TABLE work_order (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL,  -- 'SALES', 'FORECAST', 'MRP'
    source_order_id UUID,
    material_id UUID NOT NULL REFERENCES material(id),
    quantity DECIMAL(18, 6) NOT NULL,
    completed_quantity DECIMAL(18, 6) DEFAULT 0,
    priority INTEGER DEFAULT 5,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    workcenter_id UUID REFERENCES resource(id),
    status VARCHAR(20) DEFAULT 'RELEASED',  -- PLANNING, RELEASED, IN_PROGRESS, COMPLETED, CLOSED
    is_locked BOOLEAN DEFAULT false,
    lock_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.5.2 工单拆分表 (work_order_split)
```sql
CREATE TABLE work_order_split (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_work_order_id UUID NOT NULL REFERENCES work_order(id),
    split_order_no VARCHAR(50) NOT NULL,
    split_quantity DECIMAL(18, 6) NOT NULL,
    split_reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.6 物料需求表

#### 3.6.1 物料需求表 (material_requirement)
```sql
CREATE TABLE material_requirement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_no VARCHAR(50) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL,  -- 'PENDING_REVIEW', 'FORECAST', 'PRE_PRODUCTION', 'WORK_ORDER', 'SALES', 'SAFETY_STOCK'
    source_id UUID,
    material_id UUID NOT NULL REFERENCES material(id),
    required_quantity DECIMAL(18, 6) NOT NULL,
    allocated_quantity DECIMAL(18, 6) DEFAULT 0,
    available_quantity DECIMAL(18, 6) DEFAULT 0,
    shortage_quantity DECIMAL(18, 6) DEFAULT 0,
    required_date DATE,
    warehouse_id UUID REFERENCES warehouse(id),
    priority INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.6.2 MRP运行记录表 (mrp_run)
```sql
CREATE TABLE mrp_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_no VARCHAR(50) NOT NULL UNIQUE,
    planning_horizon_start DATE,
    planning_horizon_end DATE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'RUNNING',  -- RUNNING, COMPLETED, FAILED
    total_orders INTEGER DEFAULT 0,
    total_requirements INTEGER DEFAULT 0,
    shortage_count INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.6.3 净需求表 (net_requirement)
```sql
CREATE TABLE net_requirement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mrp_run_id UUID NOT NULL REFERENCES mrp_run(id),
    material_id UUID NOT NULL REFERENCES material(id),
    gross_requirement DECIMAL(18, 6) NOT NULL,
    scheduled_receipts DECIMAL(18, 6) DEFAULT 0,
    on_hand_quantity DECIMAL(18, 6) DEFAULT 0,
    safety_stock DECIMAL(18, 6) DEFAULT 0,
    net_requirement DECIMAL(18, 6) NOT NULL,
    available_quantity DECIMAL(18, 6),
    order_suggestion DECIMAL(18, 6),
    required_date DATE,
    planned_order_date DATE,
    status VARCHAR(20) DEFAULT 'CALCULATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.6.4 预测冲减表 (forecast_consumption)
```sql
CREATE TABLE forecast_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forecast_order_id UUID NOT NULL REFERENCES sales_order(id),
    sales_order_id UUID REFERENCES sales_order(id),
    consumed_quantity DECIMAL(18, 6) NOT NULL,
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.7 齐套分析表

#### 3.7.1 齐套分析表 (kits_analysis)
```sql
CREATE TABLE kits_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_no VARCHAR(50) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL,  -- 'ORDER', 'WORK_ORDER'
    source_id UUID NOT NULL,
    analysis_date DATE NOT NULL,
    required_date DATE,
    total_lines INTEGER DEFAULT 0,
    kit_lines INTEGER DEFAULT 0,
    shortage_lines INTEGER DEFAULT 0,
    kit_rate DECIMAL(5, 4),
    status VARCHAR(20) DEFAULT 'ANALYZING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.7.2 齐套明细表 (kits_analysis_line)
```sql
CREATE TABLE kits_analysis_line (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id UUID NOT NULL REFERENCES kits_analysis(id),
    material_id UUID NOT NULL REFERENCES material(id),
    required_quantity DECIMAL(18, 6) NOT NULL,
    available_quantity DECIMAL(18, 6) DEFAULT 0,
    shortage_quantity DECIMAL(18, 6) DEFAULT 0,
    warehouse_id UUID REFERENCES warehouse(id),
    kit_status VARCHAR(20) DEFAULT 'PENDING',  -- KITTED, SHORTAGE, PARTIAL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.8 物料控制表

#### 3.8.1 物料库存表 (inventory)
```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID NOT NULL REFERENCES material(id),
    warehouse_id UUID NOT NULL REFERENCES warehouse(id),
    batch_no VARCHAR(50),
    quantity DECIMAL(18, 6) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(18, 6) DEFAULT 0,
    available_quantity DECIMAL(18, 6),
    unit_cost DECIMAL(18, 4),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(material_id, warehouse_id, batch_no)
);
```

#### 3.8.2 物料锁定表 (material_lock)
```sql
CREATE TABLE material_lock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lock_no VARCHAR(50) NOT NULL UNIQUE,
    material_id UUID NOT NULL REFERENCES material(id),
    warehouse_id UUID REFERENCES warehouse(id),
    quantity DECIMAL(18, 6) NOT NULL,
    lock_type VARCHAR(20) NOT NULL,  -- 'ORDER', 'WORK_ORDER', 'MRP', 'MANUAL'
    source_id UUID,
    source_type VARCHAR(20),
    locked_by VARCHAR(100),
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'LOCKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.8.3 物料替代表 (material_substitute)
```sql
CREATE TABLE material_substitute (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_material_id UUID NOT NULL REFERENCES material(id),
    substitute_material_id UUID NOT NULL REFERENCES material(id),
    substitution_ratio DECIMAL(18, 6) DEFAULT 1,
    is_approved BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    effective_date DATE,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3.8.4 采购计划表 (purchase_plan)
```sql
CREATE TABLE purchase_plan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_no VARCHAR(50) NOT NULL UNIQUE,
    material_id UUID NOT NULL REFERENCES material(id),
    supplier_id UUID,
    quantity DECIMAL(18, 6) NOT NULL,
    unit_price DECIMAL(18, 4),
    total_amount DECIMAL(18, 4),
    required_date DATE,
    planned_order_date DATE,
    status VARCHAR(20) DEFAULT 'DRAFT',  -- DRAFT, APPROVED, SENT, CONFIRMED, RECEIVED
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 四、API接口设计

### 4.1 基础数据管理接口

#### 4.1.1 日历方案管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/calendars | 创建日历方案 |
| GET | /api/v1/calendars | 查询日历方案列表 |
| GET | /api/v1/calendars/:id | 获取日历方案详情 |
| PUT | /api/v1/calendars/:id | 更新日历方案 |
| DELETE | /api/v1/calendars/:id | 删除日历方案 |
| GET | /api/v1/calendars/:id/workdays | 获取工作日信息 |

#### 4.1.2 物料信息管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/materials | 创建物料 |
| GET | /api/v1/materials | 查询物料列表 |
| GET | /api/v1/materials/:id | 获取物料详情 |
| PUT | /api/v1/materials/:id | 更新物料 |
| DELETE | /api/v1/materials/:id | 删除物料 |
| POST | /api/v1/materials/import | 批量导入物料 |
| GET | /api/v1/materials/bom-tree/:id | 获取物料BOM树 |

#### 4.1.3 BOM管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/boms | 创建BOM |
| GET | /api/v1/boms | 查询BOM列表 |
| GET | /api/v1/boms/:id | 获取BOM详情 |
| PUT | /api/v1/boms/:id | 更新BOM |
| DELETE | /api/v1/boms/:id | 删除BOM |
| GET | /api/v1/boms/material/:materialId | 获取物料的BOM |

#### 4.1.4 客户信息管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/customers | 创建客户 |
| GET | /api/v1/customers | 查询客户列表 |
| GET | /api/v1/customers/:id | 获取客户详情 |
| PUT | /api/v1/customers/:id | 更新客户 |
| DELETE | /api/v1/customers/:id | 删除客户 |

#### 4.1.5 仓库管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/warehouses | 创建仓库 |
| GET | /api/v1/warehouses | 查询仓库列表 |
| GET | /api/v1/warehouses/:id | 获取仓库详情 |
| PUT | /api/v1/warehouses/:id | 更新仓库 |
| DELETE | /api/v1/warehouses/:id | 删除仓库 |

#### 4.1.6 资源管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/resources | 创建资源 |
| GET | /api/v1/resources | 查询资源列表 |
| GET | /api/v1/resources/:id | 获取资源详情 |
| PUT | /api/v1/resources/:id | 更新资源 |
| DELETE | /api/v1/resources/:id | 删除资源 |
| GET | /api/v1/resources/:id/calendar | 获取资源日历 |

### 4.2 订单管理接口

#### 4.2.1 订单引入
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/orders | 创建订单 |
| POST | /api/v1/orders/import | 批量导入订单 |
| GET | /api/v1/orders | 查询订单列表 |
| GET | /api/v1/orders/:id | 获取订单详情 |
| PUT | /api/v1/orders/:id | 更新订单 |
| DELETE | /api/v1/orders/:id | 删除订单 |
| POST | /api/v1/orders/:id/split | 订单拆分 |
| POST | /api/v1/orders/:id/approve | 订单评审 |
| POST | /api/v1/orders/:id/change | 订单变更 |

#### 4.2.2 补投单管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/replenishment-orders | 创建补投单 |
| GET | /api/v1/replenishment-orders | 查询补投单列表 |
| GET | /api/v1/replenishment-orders/:id | 获取补投单详情 |
| PUT | /api/v1/replenishment-orders/:id | 更新补投单 |
| POST | /api/v1/replenishment-orders/import | 导入补投单 |

### 4.3 工程计划接口

#### 4.3.1 工程计划
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/engineering/plans | 创建工程计划 |
| GET | /api/v1/engineering/plans | 查询工程计划列表 |
| GET | /api/v1/engineering/plans/:id | 获取工程计划详情 |
| PUT | /api/v1/engineering/plans/:id | 更新工程计划 |
| POST | /api/v1/engineering/plans/:id/confirm | 确认工程计划 |

#### 4.3.2 工程资料
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/engineering/documents | 创建工程资料 |
| GET | /api/v1/engineering/documents | 查询工程资料列表 |
| PUT | /api/v1/engineering/documents/:id | 更新工程资料 |
| POST | /api/v1/engineering/documents/:id/confirm | 确认工程资料 |

#### 4.3.3 工程锁
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/engineering/locks | 创建工程锁 |
| GET | /api/v1/engineering/locks | 查询工程锁列表 |
| POST | /api/v1/engineering/locks/:id/unlock | 解除工程锁 |

### 4.4 MRP接口

#### 4.4.1 MRP运算
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/mrp/run | 执行MRP运算 |
| GET | /api/v1/mrp/runs | 查询MRP运行记录 |
| GET | /api/v1/mrp/runs/:id | 获取MRP运行详情 |
| GET | /api/v1/mrp/net-requirements | 查询净需求 |
| GET | /api/v1/mrp/material-requirements | 查询物料需求 |
| POST | /api/v1/mrp/requirements/:id/approve | 评审物料需求 |

#### 4.4.2 物料需求
| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | /api/v1/material-requirements | 查询物料需求列表 |
| GET | /api/v1/material-requirements/forecast | 预测物料需求 |
| GET | /api/v1/material-requirements/pre-production | 预生产物料需求 |
| GET | /api/v1/material-requirements/work-orders | 工单物料需求 |
| GET | /api/v1/material-requirements/safety-stock | 安全库存需求 |

### 4.5 排程接口

#### 4.5.1 排程方案
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/scheduling/plans | 创建排程方案 |
| GET | /api/v1/scheduling/plans | 查询排程方案列表 |
| GET | /api/v1/scheduling/plans/:id | 获取排程方案详情 |
| PUT | /api/v1/scheduling/plans/:id | 更新排程方案 |
| POST | /api/v1/scheduling/plans/:id/execute | 执行排程 |
| GET | /api/v1/scheduling/results | 查询排程结果 |
| GET | /api/v1/scheduling/results/:id | 获取排程结果详情 |

#### 4.5.2 瓶颈分析
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/scheduling/bottleneck-analysis | 执行瓶颈分析 |
| GET | /api/v1/scheduling/bottleneck-analysis | 查询瓶颈分析结果 |
| GET | /api/v1/scheduling/workcenter-load | 查询工作中心负载 |

#### 4.5.3 插单管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/scheduling/urgent-insertion | 紧急插单 |
| POST | /api/v1/scheduling/force-insertion | 强制插单 |
| GET | /api/v1/scheduling/insertions | 查询插单记录 |
| POST | /api/v1/scheduling/insertions/:id/approve | 审批插单 |

### 4.6 工单接口

#### 4.6.1 工单管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/work-orders | 创建工单 |
| POST | /api/v1/work-orders/import | 导入计划单 |
| GET | /api/v1/work-orders | 查询工单列表 |
| GET | /api/v1/work-orders/:id | 获取工单详情 |
| PUT | /api/v1/work-orders/:id | 更新工单 |
| POST | /api/v1/work-orders/:id/split | 工单拆分 |
| POST | /api/v1/work-orders/:id/release | 下达工单 |
| POST | /api/v1/work-orders/:id/lock | 锁定工单 |
| POST | /api/v1/work-orders/:id/unlock | 解锁工单 |

### 4.7 齐套分析接口

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/kits-analysis/order/:orderId | 订单齐套分析 |
| POST | /api/v1/kits-analysis/work-order/:workOrderId | 工单齐套分析 |
| GET | /api/v1/kits-analysis | 查询齐套分析列表 |
| GET | /api/v1/kits-analysis/:id | 获取齐套分析详情 |

### 4.8 物料控制接口

#### 4.8.1 库存管理
| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | /api/v1/inventory | 查询库存 |
| GET | /api/v1/inventory/:materialId | 获取物料库存 |
| POST | /api/v1/inventory/adjust | 库存调整 |

#### 4.8.2 物料锁定/释放
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/material-locks | 创建物料锁定 |
| GET | /api/v1/material-locks | 查询物料锁定列表 |
| POST | /api/v1/material-locks/:id/release | 释放物料锁定 |

#### 4.8.3 物料替代
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/material-substitutes | 创建物料替代 |
| GET | /api/v1/material-substitutes | 查询物料替代列表 |
| GET | /api/v1/material-substitutes/:materialId | 获取物料替代方案 |
| PUT | /api/v1/material-substitutes/:id | 更新物料替代 |

#### 4.8.4 采购计划
| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | /api/v1/purchase-plans/generate | 生成采购计划 |
| GET | /api/v1/purchase-plans | 查询采购计划列表 |
| POST | /api/v1/purchase-plans/:id/approve | 审批采购计划 |

## 五、核心算法设计

### 5.1 MRP计算算法

#### 5.1.1 净需求计算流程
```
1. 获取所有销售订单和预测订单
2. 对每个物料计算毛需求：
   - 毛需求 = Σ(订单数量 × BOM用量 × (1 + 报废率))
3. 获取可用库存：
   - 可用库存 = 当前库存 - 已分配量 - 安全库存
4. 计算净需求：
   - 净需求 = 毛需求 - 可用库存
5. 生成建议订单：
   - 建议订单量 = 净需求（考虑批量规则）
```

#### 5.1.2 MRP运算伪代码
```typescript
async function runMRP(horizonStart: Date, horizonEnd: Date) {
    const mrpRun = await createMrpRun(horizonStart, horizonEnd);
    
    // 获取所有物料（按BOM层级从低到高）
    const materials = await getMaterialsSortedByBomLevel();
    
    for (const material of materials) {
        // 计算毛需求
        const grossRequirements = await calculateGrossRequirements(material, horizonStart, horizonEnd);
        
        // 获取可用库存
        const availableStock = await getAvailableStock(material);
        
        // 计算净需求
        const netRequirements = await calculateNetRequirements(
            material,
            grossRequirements,
            availableStock
        );
        
        // 生成建议订单
        const suggestions = await generateOrderSuggestions(material, netRequirements);
        
        // 保存净需求记录
        await saveNetRequirements(mrpRun.id, material, netRequirements, suggestions);
    }
    
    return mrpRun;
}
```

### 5.2 排程算法

#### 5.2.1 有限产能排程算法
```typescript
async function runFiniteCapacityScheduling(planId: string) {
    const plan = await getSchedulingPlan(planId);
    
    // 1. 获取所有待排程订单
    const orders = await getPendingOrders(plan.planningHorizon);
    
    // 2. 按优先级排序
    orders.sort((a, b) => a.priority - b.priority || a.demandDate - b.demandDate);
    
    // 3. 获取工序和资源
    const operations = await getOperations();
    const resources = await getResources();
    
    // 4. 计算瓶颈工序
    const bottlenecks = await identifyBottlenecks(operations, resources);
    
    // 5. 从瓶颈工序开始排程
    for (const order of orders) {
        for (const bottleneck of bottlenecks) {
            // 检查产能
            const capacity = await getResourceCapacity(bottleneck.resourceId, order.demandDate);
            const demand = await getResourceDemand(bottleneck.resourceId, order);
            
            if (demand > capacity) {
                // 需要调整计划或增加产能
                await handleCapacityConflict(order, bottleneck, capacity, demand);
            }
            
            // 计算开始时间（倒排）
            const startTime = await calculateBackwardStartTime(order, bottleneck);
            
            // 生成排程结果
            await createSchedulingResult(plan.id, order, bottleneck, startTime);
        }
    }
    
    return plan;
}
```

#### 5.2.2 瓶颈分析算法
```typescript
async function analyzeBottlenecks(date: Date) {
    const workcenters = await getWorkcenters();
    const results = [];
    
    for (const workcenter of workcenters) {
        // 计算利用率
        const utilization = await calculateUtilization(workcenter.id, date);
        
        // 计算队列长度
        const queueLength = await getQueueLength(workcenter.id, date);
        
        // 计算平均等待时间
        const avgWaitTime = await calculateAvgWaitTime(workcenter.id, date);
        
        // 判断是否为瓶颈（利用率 > 85% 或队列长度 > 10）
        const isBottleneck = utilization > 0.85 || queueLength > 10;
        
        results.push({
            workcenterId: workcenter.id,
            utilization,
            queueLength,
            avgWaitTime,
            isBottleneck
        });
    }
    
    return results;
}
```

### 5.3 齐套分析算法
```typescript
async function analyzeKits(sourceType: string, sourceId: string) {
    const analysis = await createKitsAnalysis(sourceType, sourceId);
    
    // 获取需求物料清单
    const requirements = await getRequirements(sourceType, sourceId);
    
    for (const req of requirements) {
        // 获取可用库存
        const available = await getAvailableInventory(req.materialId, req.warehouseId);
        
        // 计算齐套状态
        let kitStatus = 'KITTED';
        let shortageQty = 0;
        
        if (available < req.requiredQuantity) {
            kitStatus = 'SHORTAGE';
            shortageQty = req.requiredQuantity - available;
        } else if (available < req.requiredQuantity) {
            kitStatus = 'PARTIAL';
            shortageQty = req.requiredQuantity - available;
        }
        
        await createKitsAnalysisLine(analysis.id, req, available, kitStatus, shortageQty);
    }
    
    // 更新齐套率
    await updateKitsRate(analysis.id);
    
    return analysis;
}
```

## 六、前端页面设计

### 6.1 页面结构
```
前端应用 (apps/web/src/views/aps/)
├── Dashboard.vue                    # APS首页仪表盘
├── MasterData/                      # 基础数据管理
│   ├── Calendar.vue                 # 日历方案管理
│   ├── Material.vue                 # 物料信息管理
│   ├── BOM.vue                      # BOM管理
│   ├── Customer.vue                 # 客户信息管理
│   ├── Warehouse.vue                # 仓库管理
│   ├── Resource.vue                 # 资源管理
│   └── Operation.vue                # 工序管理
├── Order/                          # 订单管理
│   ├── OrderList.vue                # 订单列表
│   ├── OrderImport.vue              # 订单导入
│   ├── OrderSplit.vue               # 订单拆分
│   ├── OrderReview.vue              # 订单评审
│   └── OrderChange.vue              # 订单变更
├── Engineering/                    # 工程计划
│   ├── EngineeringPlan.vue          # 工程计划
│   ├── EngineeringDocument.vue      # 工程资料
│   └── EngineeringLock.vue          # 工程锁
├── MRP/                            # MRP管理
│   ├── MRPRun.vue                   # MRP运算
│   ├── NetRequirement.vue           # 净需求
│   ├── MaterialRequirement.vue      # 物料需求
│   └── PurchasePlan.vue             # 采购计划
├── Scheduling/                     # 排程管理
│   ├── SchedulingPlan.vue           # 排程方案
│   ├── SchedulingResult.vue         # 排程结果
│   ├── BottleneckAnalysis.vue       # 瓶颈分析
│   ├── UrgentInsertion.vue          # 紧急插单
│   └── ForceInsertion.vue           # 强制插单
├── WorkOrder/                     # 工单管理
│   ├── WorkOrderList.vue            # 工单列表
│   ├── WorkOrderImport.vue         # 工单导入
│   ├── WorkOrderSplit.vue          # 工单拆分
│   └── WorkOrderRelease.vue        # 工单下达
├── Kits/                          # 齐套分析
│   ├── OrderKits.vue                # 订单齐套
│   └── WorkOrderKits.vue           # 工单齐套
└── Material/                     # 物料控制
    ├── Inventory.vue               # 库存查询
    ├── MaterialLock.vue            # 物料锁定
    ├── MaterialUnlock.vue          # 物料释放
    └── MaterialSubstitute.vue      # 物料替代
```

### 6.2 核心页面功能

#### 6.2.1 MRP运算页面
- MRP参数配置（计划期、运行范围）
- MRP执行按钮
- MRP运行状态展示
- 净需求结果列表
- 物料需求汇总
- 短缺物料高亮显示

#### 6.2.2 排程结果页面
- Gantt图展示排程结果
- 订单甘特图
- 资源负载图
- 瓶颈工序标识
- 拖拽调整功能
- 插单功能

#### 6.2.3 齐套分析页面
- 齐套率展示
- 短缺物料清单
- 库存分布图
- 替代物料推荐
- 采购建议生成

## 七、安全性设计

### 7.1 权限控制
- 基于角色的访问控制（RBAC）
- 功能权限：增删改查操作
- 数据权限：组织架构隔离
- 审批权限：分级审批流

### 7.2 审计日志
- 操作日志记录
- 数据变更追踪
- MRP运行记录
- 排程变更记录

## 八、性能优化

### 8.1 数据库优化
- 索引优化：常用查询字段建立索引
- 分区表：按时间分区存储历史数据
- 物化视图：常用汇总数据

### 8.2 缓存策略
- 基础数据缓存：Redis缓存
- 排程结果缓存：减少重复计算
- 库存实时更新

### 8.3 异步处理
- MRP运算异步执行
- 批量导入异步处理
- 定时任务更新

## 九、部署架构

### 9.1 Docker Compose部署
```yaml
version: '3.8'
services:
  api:
    build: ./apps/api
    ports:
      - "3000:3000"
    environment:
      - DATABASE_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
  
  web:
    build: ./apps/web
    ports:
      - "8080:80"
    depends_on:
      - api
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=aps_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## 十、项目计划

### 10.1 开发阶段
1. **第一阶段**：基础数据管理（流程①-⑧）
2. **第二阶段**：订单管理（流程⑨、⑬-⑰）
3. **第三阶段**：MRP运算（流程⑱、㊲）
4. **第四阶段**：排程管理（流程⑲-㉓）
5. **第五阶段**：工单管理（流程㉔-㉗）
6. **第六阶段**：物料控制（流程㊵-㊶）

### 10.2 交付物
- 需求规格说明书
- 技术设计文档
- 数据库设计文档
- API接口文档
- 测试报告
- 用户操作手册
