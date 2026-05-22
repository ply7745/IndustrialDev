-- APS高级计划与排程系统 - 数据库初始化脚本
-- PostgreSQL 15+

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 基础数据表
-- =====================================================

-- 日历方案表
CREATE TABLE IF NOT EXISTS calendar_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    work_days JSONB NOT NULL,
    shift_patterns JSONB,
    holidays JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_plan_code ON calendar_plan(code);
CREATE INDEX idx_calendar_plan_type ON calendar_plan(type);

-- 物料信息表
CREATE TABLE IF NOT EXISTS material (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    unit_cost DECIMAL(18, 4),
    safety_stock DECIMAL(18, 4) DEFAULT 0,
    min_lot_size DECIMAL(18, 4),
    max_lot_size DECIMAL(18, 4),
    lead_time INTEGER DEFAULT 0,
    bom_level INTEGER DEFAULT 0,
    warehouse_id UUID,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_code ON material(code);
CREATE INDEX idx_material_type ON material(type);
CREATE INDEX idx_material_status ON material(status);

-- BOM表
CREATE TABLE IF NOT EXISTS bom (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_bom_parent ON bom(parent_material_id);
CREATE INDEX idx_bom_child ON bom(child_material_id);

-- 客户信息表
CREATE TABLE IF NOT EXISTS customer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_customer_code ON customer(code);

-- 子库/仓库表
CREATE TABLE IF NOT EXISTS warehouse (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
    address TEXT,
    capacity DECIMAL(18, 4),
    parent_warehouse_id UUID REFERENCES warehouse(id),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouse_code ON warehouse(code);
CREATE INDEX idx_warehouse_type ON warehouse(type);

-- 资源表
CREATE TABLE IF NOT EXISTS resource (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    type VARCHAR(20) NOT NULL,
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

CREATE INDEX idx_resource_code ON resource(code);
CREATE INDEX idx_resource_type ON resource(type);
CREATE INDEX idx_resource_status ON resource(status);

-- 工序表
CREATE TABLE IF NOT EXISTS operation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    workcenter_id UUID REFERENCES resource(id),
    standard_time DECIMAL(18, 4),
    setup_time DECIMAL(18, 4),
    process_time DECIMAL(18, 4),
    queue_time DECIMAL(18, 4),
    wait_time DECIMAL(18, 4),
    transfer_time DECIMAL(18, 4),
    is_bottleneck BOOLEAN DEFAULT false,
    priority INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_operation_code ON operation(code);
CREATE INDEX idx_operation_workcenter ON operation(workcenter_id);

-- =====================================================
-- 2. 订单管理表
-- =====================================================

-- 销售订单表
CREATE TABLE IF NOT EXISTS sales_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customer(id),
    material_id UUID REFERENCES material(id),
    order_type VARCHAR(20) NOT NULL,
    priority INTEGER DEFAULT 5,
    order_date DATE NOT NULL,
    demand_date DATE,
    quantity DECIMAL(18, 6) NOT NULL,
    delivered_quantity DECIMAL(18, 6) DEFAULT 0,
    unit_price DECIMAL(18, 4),
    total_amount DECIMAL(18, 4),
    status VARCHAR(20) DEFAULT 'PENDING',
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    contract_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_order_no ON sales_order(order_no);
CREATE INDEX idx_sales_order_customer ON sales_order(customer_id);
CREATE INDEX idx_sales_order_status ON sales_order(status);
CREATE INDEX idx_sales_order_approval ON sales_order(approval_status);
CREATE INDEX idx_sales_order_demand ON sales_order(demand_date);

-- 订单拆分表
CREATE TABLE IF NOT EXISTS order_split (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- 订单变更表
CREATE TABLE IF NOT EXISTS order_change (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES sales_order(id),
    change_type VARCHAR(20) NOT NULL,
    original_value TEXT,
    new_value TEXT,
    change_reason VARCHAR(500),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'APPLIED'
);

-- 补投单表
CREATE TABLE IF NOT EXISTS replenishment_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    original_order_id UUID REFERENCES sales_order(id),
    reason VARCHAR(200),
    material_id UUID REFERENCES material(id),
    quantity DECIMAL(18, 6) NOT NULL,
    demand_date DATE,
    priority INTEGER DEFAULT 5,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. 工程计划表
-- =====================================================

-- 工程计划表
CREATE TABLE IF NOT EXISTS engineering_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_no VARCHAR(50) NOT NULL UNIQUE,
    material_id UUID REFERENCES material(id),
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'DRAFT',
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date DATE,
    actual_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工程资料表
CREATE TABLE IF NOT EXISTS engineering_document (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_no VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    file_url TEXT,
    material_id UUID REFERENCES material(id),
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'PENDING',
    confirmed_at TIMESTAMP,
    confirmed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 工程锁表
CREATE TABLE IF NOT EXISTS engineering_lock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES material(id),
    lock_type VARCHAR(20) NOT NULL,
    reason VARCHAR(500),
    locked_by VARCHAR(100),
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unlock_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'LOCKED'
);

-- =====================================================
-- 4. 排程管理表
-- =====================================================

-- 排程方案表
CREATE TABLE IF NOT EXISTS scheduling_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_no VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200),
    description TEXT,
    planning_horizon_start DATE,
    planning_horizon_end DATE,
    algorithm VARCHAR(50),
    optimization_target VARCHAR(50),
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scheduling_plan_no ON scheduling_plan(plan_no);
CREATE INDEX idx_scheduling_plan_status ON scheduling_plan(status);

-- 排程结果表
CREATE TABLE IF NOT EXISTS scheduling_result (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_scheduling_result_plan ON scheduling_result(plan_id);
CREATE INDEX idx_scheduling_result_order ON scheduling_result(order_id);
CREATE INDEX idx_scheduling_result_resource ON scheduling_result(resource_id);
CREATE INDEX idx_scheduling_result_time ON scheduling_result(planned_start_time, planned_end_time);

-- 瓶颈分析表
CREATE TABLE IF NOT EXISTS bottleneck_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_bottleneck_date ON bottleneck_analysis(analysis_date);

-- 插单记录表
CREATE TABLE IF NOT EXISTS order_insertion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES sales_order(id),
    insertion_type VARCHAR(20) NOT NULL,
    original_demand_date DATE,
    new_demand_date DATE,
    reason VARCHAR(500),
    impacted_orders JSONB,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. 工单管理表
-- =====================================================

-- 工单表
CREATE TABLE IF NOT EXISTS work_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_no VARCHAR(50) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL,
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
    status VARCHAR(20) DEFAULT 'RELEASED',
    is_locked BOOLEAN DEFAULT false,
    lock_reason VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_order_no ON work_order(order_no);
CREATE INDEX idx_work_order_status ON work_order(status);
CREATE INDEX idx_work_order_material ON work_order(material_id);

-- 工单拆分表
CREATE TABLE IF NOT EXISTS work_order_split (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_work_order_id UUID NOT NULL REFERENCES work_order(id),
    split_order_no VARCHAR(50) NOT NULL,
    split_quantity DECIMAL(18, 6) NOT NULL,
    split_reason VARCHAR(200),
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 6. 物料需求表
-- =====================================================

-- 物料需求表
CREATE TABLE IF NOT EXISTS material_requirement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requirement_no VARCHAR(50) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL,
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

CREATE INDEX idx_material_req_no ON material_requirement(requirement_no);
CREATE INDEX idx_material_req_source ON material_requirement(source_type);
CREATE INDEX idx_material_req_material ON material_requirement(material_id);
CREATE INDEX idx_material_req_date ON material_requirement(required_date);

-- MRP运行记录表
CREATE TABLE IF NOT EXISTS mrp_run (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_no VARCHAR(50) NOT NULL UNIQUE,
    planning_horizon_start DATE,
    planning_horizon_end DATE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status VARCHAR(20) DEFAULT 'RUNNING',
    total_orders INTEGER DEFAULT 0,
    total_requirements INTEGER DEFAULT 0,
    shortage_count INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mrp_run_no ON mrp_run(run_no);
CREATE INDEX idx_mrp_run_status ON mrp_run(status);

-- 净需求表
CREATE TABLE IF NOT EXISTS net_requirement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_net_req_mrp ON net_requirement(mrp_run_id);
CREATE INDEX idx_net_req_material ON net_requirement(material_id);

-- 预测冲减表
CREATE TABLE IF NOT EXISTS forecast_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forecast_order_id UUID NOT NULL REFERENCES sales_order(id),
    sales_order_id UUID REFERENCES sales_order(id),
    consumed_quantity DECIMAL(18, 6) NOT NULL,
    consumed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 7. 齐套分析表
-- =====================================================

-- 齐套分析表
CREATE TABLE IF NOT EXISTS kits_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_no VARCHAR(50) NOT NULL UNIQUE,
    source_type VARCHAR(20) NOT NULL,
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

CREATE INDEX idx_kits_analysis_no ON kits_analysis(analysis_no);

-- 齐套明细表
CREATE TABLE IF NOT EXISTS kits_analysis_line (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES kits_analysis(id),
    material_id UUID NOT NULL REFERENCES material(id),
    required_quantity DECIMAL(18, 6) NOT NULL,
    available_quantity DECIMAL(18, 6) DEFAULT 0,
    shortage_quantity DECIMAL(18, 6) DEFAULT 0,
    warehouse_id UUID REFERENCES warehouse(id),
    kit_status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kits_line_analysis ON kits_analysis_line(analysis_id);

-- =====================================================
-- 8. 物料控制表
-- =====================================================

-- 物料库存表
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_inventory_material ON inventory(material_id);
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);

-- 物料锁定表
CREATE TABLE IF NOT EXISTS material_lock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lock_no VARCHAR(50) NOT NULL UNIQUE,
    material_id UUID NOT NULL REFERENCES material(id),
    warehouse_id UUID REFERENCES warehouse(id),
    quantity DECIMAL(18, 6) NOT NULL,
    lock_type VARCHAR(20) NOT NULL,
    source_id UUID,
    source_type VARCHAR(20),
    locked_by VARCHAR(100),
    locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'LOCKED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_lock_no ON material_lock(lock_no);
CREATE INDEX idx_material_lock_material ON material_lock(material_id);

-- 物料替代表
CREATE TABLE IF NOT EXISTS material_substitute (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX idx_material_sub_original ON material_substitute(original_material_id);

-- 采购计划表
CREATE TABLE IF NOT EXISTS purchase_plan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_no VARCHAR(50) NOT NULL UNIQUE,
    material_id UUID NOT NULL REFERENCES material(id),
    supplier_id UUID,
    quantity DECIMAL(18, 6) NOT NULL,
    unit_price DECIMAL(18, 4),
    total_amount DECIMAL(18, 4),
    required_date DATE,
    planned_order_date DATE,
    status VARCHAR(20) DEFAULT 'DRAFT',
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchase_plan_no ON purchase_plan(plan_no);
CREATE INDEX idx_purchase_plan_material ON purchase_plan(material_id);
CREATE INDEX idx_purchase_plan_status ON purchase_plan(status);

-- =====================================================
-- 初始化数据
-- =====================================================

-- 插入示例日历
INSERT INTO calendar_plan (code, name, type, effective_date, work_days) VALUES
('CAL001', '标准工作日历', 'WORKING', CURRENT_DATE, '{"1": true, "2": true, "3": true, "4": true, "5": true, "6": false, "7": false}');

-- 插入示例仓库
INSERT INTO warehouse (code, name, type, address) VALUES
('WH001', '原材料仓', 'RAW', 'A区1号仓库'),
('WH002', '成品仓', 'FINISHED', 'B区2号仓库'),
('WH003', '在制品仓', 'WIP', 'C区3号仓库');

-- 插入示例资源/工作中心
INSERT INTO resource (code, name, type, capacity, status) VALUES
('WC001', '加工中心A', 'WORKCENTER', 1, 'ACTIVE'),
('WC002', '装配中心B', 'WORKCENTER', 1, 'ACTIVE'),
('WC003', '检测中心C', 'WORKCENTER', 1, 'ACTIVE'),
('MC001', 'CNC机床1号', 'MACHINE', 1, 'ACTIVE'),
('MC002', 'CNC机床2号', 'MACHINE', 1, 'ACTIVE');

-- 插入示例物料
INSERT INTO material (code, name, type, unit, safety_stock, lead_time, bom_level) VALUES
('M001', '产品A', 'FINISHED', 'PCS', 10, 2, 0),
('M002', '半成品A1', 'SEMI', 'PCS', 20, 1, 1),
('M003', '部件A11', 'RAW', 'PCS', 50, 3, 2),
('M004', '部件A12', 'RAW', 'PCS', 50, 3, 2),
('M005', '原材料X', 'RAW', 'KG', 100, 5, 3),
('M006', '原材料Y', 'RAW', 'KG', 100, 5, 3);

-- 插入示例BOM
INSERT INTO bom (parent_material_id, child_material_id, quantity, scrap_rate, effective_date) VALUES
((SELECT id FROM material WHERE code = 'M001'), (SELECT id FROM material WHERE code = 'M002'), 1, 0.05, CURRENT_DATE),
((SELECT id FROM material WHERE code = 'M002'), (SELECT id FROM material WHERE code = 'M003'), 2, 0.02, CURRENT_DATE),
((SELECT id FROM material WHERE code = 'M002'), (SELECT id FROM material WHERE code = 'M004'), 1, 0.02, CURRENT_DATE),
((SELECT id FROM material WHERE code = 'M003'), (SELECT id FROM material WHERE code = 'M005'), 0.5, 0, CURRENT_DATE),
((SELECT id FROM material WHERE code = 'M004'), (SELECT id FROM material WHERE code = 'M006'), 0.3, 0, CURRENT_DATE);

-- 插入示例客户
INSERT INTO customer (code, name, contact_person, contact_phone, payment_terms) VALUES
('C001', '客户A公司', '张三', '13800138001', 'T/T 30天'),
('C002', '客户B公司', '李四', '13800138002', 'T/T 45天'),
('C003', '客户C公司', '王五', '13800138003', 'L/C 60天');

-- 插入示例工序
INSERT INTO operation (code, name, workcenter_id, standard_time, setup_time, process_time, priority) VALUES
('OP001', '原材料检验', (SELECT id FROM resource WHERE code = 'WC003'), 0.5, 0.5, 1, 1),
('OP002', '粗加工', (SELECT id FROM resource WHERE code = 'WC001'), 2, 1, 3, 2),
('OP003', '精加工', (SELECT id FROM resource WHERE code = 'WC001'), 1.5, 0.5, 2, 3),
('OP004', '装配', (SELECT id FROM resource WHERE code = 'WC002'), 1, 0.5, 1.5, 4),
('OP005', '检测', (SELECT id FROM resource WHERE code = 'WC003'), 0.5, 0.25, 0.5, 5);

-- 插入示例库存
INSERT INTO inventory (material_id, warehouse_id, quantity, available_quantity) VALUES
((SELECT id FROM material WHERE code = 'M005'), (SELECT id FROM warehouse WHERE code = 'WH001'), 100, 80),
((SELECT id FROM material WHERE code = 'M006'), (SELECT id FROM warehouse WHERE code = 'WH001'), 80, 70),
((SELECT id FROM material WHERE code = 'M003'), (SELECT id FROM warehouse WHERE code = 'WH003'), 30, 25),
((SELECT id FROM material WHERE code = 'M004'), (SELECT id FROM warehouse WHERE code = 'WH003'), 20, 18);

-- 插入示例销售订单
INSERT INTO sales_order (order_no, customer_id, material_id, order_type, quantity, order_date, demand_date, priority, unit_price, status, approval_status) VALUES
('SO202401001', (SELECT id FROM customer WHERE code = 'C001'), (SELECT id FROM material WHERE code = 'M001'), 'SALES', 100, CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days', 3, 1000, 'APPROVED', 'APPROVED'),
('SO202401002', (SELECT id FROM customer WHERE code = 'C002'), (SELECT id FROM material WHERE code = 'M001'), 'SALES', 50, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days', 1, 1000, 'APPROVED', 'APPROVED'),
('SO202401003', (SELECT id FROM customer WHERE code = 'C003'), (SELECT id FROM material WHERE code = 'M001'), 'SALES', 80, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', 5, 1000, 'PENDING', 'PENDING');

-- 创建更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有表创建更新触发器
CREATE TRIGGER update_calendar_plan_updated_at BEFORE UPDATE ON calendar_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_updated_at BEFORE UPDATE ON material FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bom_updated_at BEFORE UPDATE ON bom FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_updated_at BEFORE UPDATE ON customer FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_warehouse_updated_at BEFORE UPDATE ON warehouse FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_resource_updated_at BEFORE UPDATE ON resource FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operation_updated_at BEFORE UPDATE ON operation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sales_order_updated_at BEFORE UPDATE ON sales_order FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_order_split_updated_at BEFORE UPDATE ON order_split FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_replenishment_order_updated_at BEFORE UPDATE ON replenishment_order FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_engineering_plan_updated_at BEFORE UPDATE ON engineering_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduling_plan_updated_at BEFORE UPDATE ON scheduling_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_scheduling_result_updated_at BEFORE UPDATE ON scheduling_result FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_work_order_updated_at BEFORE UPDATE ON work_order FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_requirement_updated_at BEFORE UPDATE ON material_requirement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mrp_run_updated_at BEFORE UPDATE ON mrp_run FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_net_requirement_updated_at BEFORE UPDATE ON net_requirement FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kits_analysis_updated_at BEFORE UPDATE ON kits_analysis FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kits_analysis_line_updated_at BEFORE UPDATE ON kits_analysis_line FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_material_lock_updated_at BEFORE UPDATE ON material_lock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_plan_updated_at BEFORE UPDATE ON purchase_plan FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 输出完成信息
DO $$
BEGIN
    RAISE NOTICE 'APS数据库初始化完成！';
    RAISE NOTICE '已创建表: 基础数据表(6), 订单管理表(4), 工程计划表(3), 排程管理表(4), 工单管理表(2), 物料需求表(4), 齐套分析表(2), 物料控制表(4)';
    RAISE NOTICE '共计: 29个数据表';
END $$;
