# 1. 安装依赖阶段 (deps)
# 使用一个轻量的 Node.js 18 Alpine 镜像作为基础
FROM node:18-alpine AS deps
# 设置工作目录
WORKDIR /app

# =================================================================
#  ↓↓↓ 新增！！！通过 ENV 指令设置 sharp 的国内镜像源环境变量 ↓↓↓
# =================================================================
ENV SHARP_BINARY_HOST="https://npmmirror.com/mirrors/sharp"
ENV SHARP_LIBVIPS_BINARY_HOST="https://npmmirror.com/mirrors/sharp-libvips"

# 复制 package.json 和 package-lock.json 到工作目录
COPY package.json package-lock.json* ./

# 安装编译 sharp 所需的系统工具
RUN apk add --no-cache libc6-compat build-base python3

# 配置 npm 使用国内的淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com

# 使用 npm ci 命令安装依赖
RUN npm ci

# -------------------------------------------------------------------

# 2. 构建阶段 (builder )
# 同样使用一个 Node.js 18 Alpine 镜像
FROM node:18-alpine AS builder
WORKDIR /app

# 从上一个 "deps" 阶段复制已经安装好的 node_modules 文件夹
COPY --from=deps /app/node_modules ./node_modules
# 复制项目的所有其他文件 (源代码等)
COPY . .

# 执行 Next.js 的构建命令
RUN npm run build

# -------------------------------------------------------------------

# 3. 生产运行阶段 (runner)
# 再次使用一个干净的、极度轻量的 Node.js 18 Alpine 镜像
FROM node:18-alpine AS runner
WORKDIR /app

# 设置环境变量为 "production"
ENV NODE_ENV=production

# 从 "builder" 阶段，只复制构建出来的、运行所必需的产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露 Next.js 服务运行的端口
EXPOSE 3000

# 定义容器启动时执行的命令
CMD ["node", "server.js"]
