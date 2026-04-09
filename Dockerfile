FROM node:20-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制配置文件
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database

# 构建
RUN pnpm build

# 生产镜像
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./

RUN npm install --production

EXPOSE 3000

CMD ["node", "dist/main.js"]