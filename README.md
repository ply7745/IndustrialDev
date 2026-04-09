# IndustrialDev - 工业信息化系统开发框架

MES/WMS/ERP 等工业管理系统快速开发平台

## 项目结构

```
IndustrialDev/
├── apps/                    # 应用目录
│   ├── web/                 # Web 前端 (Vue3/React)
│   ├── api/                 # 后端 API (Node.js/NestJS)
│   └── mobile/              # 移动端 App (React Native/Flutter)
├── packages/                # 共享包
│   ├── shared/              # 共享类型和工具
│   ├── ui/                  # UI 组件库
│   └── database/            # 数据库模型
├── docs/                    # 文档
├── scripts/                 # 脚本工具
└── .github/                 # GitHub Actions CI/CD
```

## 技术栈

- **前端**: Vue3 + TypeScript + Element Plus / Ant Design
- **后端**: NestJS / Express + TypeScript
- **数据库**: PostgreSQL / MySQL
- **移动端**: React Native / Flutter
- **部署**: Docker + GitHub Actions

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 功能模块

- 生产管理 (MES)
- 仓储管理 (WMS)
- 质量管理 (QMS)
- 设备管理 (EMS)
- 供应链管理 (SCM)