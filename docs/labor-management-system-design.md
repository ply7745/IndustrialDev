# 劳务公司员工信息管理系统 - 设计文档

## 1. 项目概述

### 1.1 项目背景
为劳务公司提供一个完整的员工信息管理解决方案，支持从员工信息录入、岗位发布、报名、工资管理到福利关怀的全流程管理。

### 1.2 核心用户角色
- **系统管理员**：管理全局数据，包括员工、企业、岗位等
- **企业用户**：用工企业，发布岗位、管理员工分配
- **员工用户**：查看个人信息、报名岗位、查看工资

### 1.3 技术栈
- **前端**：Vue 3 + TypeScript + Element Plus + Pinia + PWA
- **后端**：NestJS + TypeORM + PostgreSQL
- **身份证识别**：Tesseract.js（浏览器端本地识别）

## 2. 系统架构

### 2.1 整体架构图
```
┌─────────────────────────────────────────────────────────────┐
│                         前端层                              │
├──────────────────────┬─────────────────────┬─────────────────┤
│   管理员端Web       │   企业端Web         │   员工端Web/PWA │
└──────────────────────┴─────────────────────┴─────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        API网关层                             │
│                    NestJS + RESTful API                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        业务逻辑层                             │
├───────────┬───────────┬───────────┬───────────┬────────────┤
│ 员工管理  │ 企业管理  │ 岗位管理  │ 工资管理  │ 通知管理    │
└───────────┴───────────┴───────────┴───────────┴────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        数据访问层                             │
│                      TypeORM + Repository                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                        数据库层                               │
│                      PostgreSQL                              │
└─────────────────────────────────────────────────────────────┘
```

## 3. 核心功能模块

### 3.1 员工管理模块
- 员工信息CRUD操作
- 身份证OCR识别自动录入
- 员工状态管理（在职/离职/待岗）
- 员工与企业关联

### 3.2 企业管理模块
- 企业信息CRUD操作
- 企业合作状态管理
- 企业联系人管理

### 3.3 岗位管理模块
- 岗位信息CRUD操作
- 岗位发布/下架
- 岗位与企业关联
- 岗位要求和薪资设置

### 3.4 工资管理模块
- 工资录入与编辑
- 电子工资条生成
- 工资历史查询
- 工资统计报表

### 3.5 报名管理模块
- 员工岗位报名
- 报名状态跟踪
- 面试安排记录
- 录用结果管理

### 3.6 通知管理模块
- 系统通知推送
- 生日自动提醒
- 节日祝福推送
- 消息已读/未读状态

## 4. 数据库设计

### 4.1 Employee（员工表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| name | varchar(100) | 姓名 |
| idCard | varchar(18) | 身份证号 |
| phone | varchar(20) | 手机号 |
| gender | varchar(10) | 性别 |
| birthday | date | 出生日期 |
| age | int | 年龄 |
| address | varchar(500) | 住址 |
| emergencyContact | varchar(100) | 紧急联系人 |
| emergencyPhone | varchar(20) | 紧急联系电话 |
| entryDate | date | 入职日期 |
| status | varchar(20) | 状态（active/inactive/pending） |
| companyId | uuid | 关联公司ID |
| avatar | varchar(500) | 头像URL |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.2 Company（公司表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| name | varchar(200) | 公司名称 |
| unifiedCreditCode | varchar(18) | 统一社会信用代码 |
| contactPerson | varchar(100) | 联系人 |
| contactPhone | varchar(20) | 联系电话 |
| address | varchar(500) | 地址 |
| businessScope | text | 经营范围 |
| status | varchar(20) | 状态（active/inactive） |
| cooperationDate | date | 合作日期 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.3 Position（岗位表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| title | varchar(200) | 岗位名称 |
| description | text | 岗位描述 |
| requirements | text | 岗位要求 |
| salaryMin | decimal | 最低薪资 |
| salaryMax | decimal | 最高薪资 |
| location | varchar(200) | 工作地点 |
| recruitCount | int | 招聘人数 |
| status | varchar(20) | 状态（draft/published/closed） |
| companyId | uuid | 关联公司ID |
| publishDate | datetime | 发布时间 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.4 Salary（工资表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| employeeId | uuid | 员工ID |
| year | int | 年份 |
| month | int | 月份 |
| baseSalary | decimal | 基本工资 |
| performanceSalary | decimal | 绩效工资 |
| allowance | decimal | 补贴 |
| deduction | decimal | 扣款 |
| totalSalary | decimal | 应发工资 |
| actualSalary | decimal | 实发工资 |
| status | varchar(20) | 状态（pending/paid） |
| paidDate | datetime | 发放日期 |
| remark | text | 备注 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.5 Application（报名表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| employeeId | uuid | 员工ID |
| positionId | uuid | 岗位ID |
| status | varchar(20) | 状态（pending/interviewing/accepted/rejected） |
| applyDate | datetime | 报名时间 |
| interviewDate | datetime | 面试时间 |
| interviewResult | text | 面试结果 |
| remark | text | 备注 |
| createdAt | datetime | 创建时间 |
| updatedAt | datetime | 更新时间 |

### 4.6 Notification（通知表）
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键 |
| recipientId | uuid | 接收者ID |
| recipientType | varchar(20) | 接收者类型（employee/admin/company） |
| type | varchar(50) | 通知类型 |
| title | varchar(200) | 标题 |
| content | text | 内容 |
| isRead | boolean | 是否已读 |
| readAt | datetime | 阅读时间 |
| createdAt | datetime | 创建时间 |

## 5. API接口设计

### 5.1 员工接口
- `GET /api/employees` - 获取员工列表
- `GET /api/employees/:id` - 获取员工详情
- `POST /api/employees` - 创建员工
- `PUT /api/employees/:id` - 更新员工
- `DELETE /api/employees/:id` - 删除员工
- `POST /api/employees/ocr` - 身份证OCR识别

### 5.2 企业接口
- `GET /api/companies` - 获取企业列表
- `GET /api/companies/:id` - 获取企业详情
- `POST /api/companies` - 创建企业
- `PUT /api/companies/:id` - 更新企业
- `DELETE /api/companies/:id` - 删除企业

### 5.3 岗位接口
- `GET /api/positions` - 获取岗位列表
- `GET /api/positions/:id` - 获取岗位详情
- `POST /api/positions` - 创建岗位
- `PUT /api/positions/:id` - 更新岗位
- `DELETE /api/positions/:id` - 删除岗位
- `PUT /api/positions/:id/publish` - 发布岗位

### 5.4 工资接口
- `GET /api/salaries` - 获取工资列表
- `GET /api/salaries/:id` - 获取工资详情
- `POST /api/salaries` - 创建工资记录
- `PUT /api/salaries/:id` - 更新工资记录
- `DELETE /api/salaries/:id` - 删除工资记录
- `GET /api/salaries/employee/:employeeId` - 获取员工工资历史

### 5.5 报名接口
- `GET /api/applications` - 获取报名列表
- `GET /api/applications/:id` - 获取报名详情
- `POST /api/applications` - 创建报名
- `PUT /api/applications/:id` - 更新报名
- `DELETE /api/applications/:id` - 删除报名

### 5.6 通知接口
- `GET /api/notifications` - 获取通知列表
- `GET /api/notifications/:id` - 获取通知详情
- `PUT /api/notifications/:id/read` - 标记已读

## 6. 开发实施计划

### 阶段一：基础数据层
1. 创建数据库实体模型
2. 配置TypeORM
3. 创建基础CRUD接口

### 阶段二：管理员端
1. 员工信息管理页面
2. 企业信息管理页面
3. 岗位管理页面
4. 身份证OCR集成

### 阶段三：企业端和员工端
1. 企业端门户页面
2. 员工端门户页面
3. 岗位报名功能

### 阶段四：工资和通知
1. 工资管理功能
2. 电子工资条
3. 生日提醒
4. 消息通知系统

## 7. 部署方案

- 使用Docker容器化部署
- PostgreSQL数据库
- Nginx反向代理
- PWA支持离线访问和推送通知
