# ============================================
# Tres.js Vue3 前端项目 Dockerfile
# 支持 ARM64 和 X86_64 架构
# ============================================

# 阶段一: 构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# ============================================
# 阶段二: 生产阶段
FROM nginx:1.24-alpine

# 安装 wget（用于健康检查）和设置时区
RUN apk add --no-cache tzdata wget && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone && \
    apk del tzdata

# 移除默认的 nginx 配置
RUN rm -rf /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 设置权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]


