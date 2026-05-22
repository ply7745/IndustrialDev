# 多阶段构建：构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制配置文件
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database

# 构建所有应用
RUN pnpm build

# 生产镜像
FROM node:20-alpine AS runner

WORKDIR /app

# 安装 Nginx
RUN apk add --no-cache nginx

# 复制后端构建结果
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

# 复制前端构建结果
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 安装生产依赖
RUN npm install --production

# 创建数据目录
RUN mkdir -p /app/data

# 暴露端口
EXPOSE 80
EXPOSE 3000

# 启动脚本
COPY <<EOF /app/start.sh
#!/bin/sh
set -e

# 启动 Nginx
nginx

# 启动 API 服务
cd /app
node dist/main.js
EOF

RUN chmod +x /app/start.sh

# 启动命令
CMD ["/app/start.sh"]
