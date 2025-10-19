# 1. 安装依赖阶段
FROM node:18-alpine AS deps
WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package.json package-lock.json* ./

# 安装依赖
RUN npm ci

# 2. 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app

# 从上一阶段复制依赖
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 执行构建
RUN npm run build

# 3. 生产运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

# 设置生产环境变量
ENV NODE_ENV=production

# 从构建阶段复制必要的产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
