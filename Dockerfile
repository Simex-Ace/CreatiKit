# 1. 安装依赖阶段 (deps)
# 使用一个轻量的 Node.js 18 Alpine 镜像作为基础
FROM node:18-alpine AS deps
# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 到工作目录
# 这样可以利用 Docker 的缓存机制，如果这两个文件没有变化，就不会重新安装依赖
COPY package.json package-lock.json* ./

# 安装编译 sharp 所需的系统工具 (例如 python, make, g++)
# 这是为了防止 sharp 下载预编译包失败时，能够在服务器上现场编译
RUN apk add --no-cache libc6-compat build-base python3

# 配置 npm 使用国内的淘宝镜像源，解决网络问题
# 这能极大地提高下载速度，并避免因网络连接国外服务器失败导致的错误
# 同时为 sharp 和其依赖的 libvips 指定国内镜像地址
RUN npm config set registry https://registry.npmmirror.com && \
    npm config set sharp_binary_host "https://npmmirror.com/mirrors/sharp" && \
    npm config set sharp_libvips_binary_host "https://npmmirror.com/mirrors/sharp-libvips"

# 使用 npm ci 命令安装依赖
# 它会严格按照 package-lock.json 来安装 ，确保环境一致性，且速度比 npm install 更快
RUN npm ci

# -------------------------------------------------------------------

# 2. 构建阶段 (builder)
# 同样使用一个 Node.js 18 Alpine 镜像
FROM node:18-alpine AS builder
# 设置工作目录
WORKDIR /app

# 从上一个 "deps" 阶段复制已经安装好的 node_modules 文件夹
# 这样就不用在构建阶段重新安装一遍依赖了
COPY --from=deps /app/node_modules ./node_modules
# 复制项目的所有其他文件 (源代码等)
COPY . .

# 执行 Next.js 的构建命令
RUN npm run build

# -------------------------------------------------------------------

# 3. 生产运行阶段 (runner)
# 再次使用一个干净的、极度轻量的 Node.js 18 Alpine 镜像
FROM node:18-alpine AS runner
# 设置工作目录
WORKDIR /app

# 设置环境变量为 "production"，这是 Next.js 生产模式所必需的
ENV NODE_ENV=production

# 从 "builder" 阶段，只复制构建出来的、运行所必需的产物
# 这样可以使最终的生产镜像体积非常小，不包含任何开发依赖和源代码
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 暴露 Next.js 服务运行的端口 (默认为 3000)
EXPOSE 3000

# 定义容器启动时执行的命令
# 运行 .next/standalone/server.js 来启动 Next.js 服务
CMD ["node", "server.js"]
