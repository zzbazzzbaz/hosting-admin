# 第一阶段：构建 Vue 项目
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
# 单独复制这些文件可以利用 Docker 缓存层，只有当依赖变化时才重新安装
COPY package*.json ./

# 安装项目依赖
RUN npm ci --only=production=false

# 复制项目源代码
COPY . .

# 构建生产环境的静态文件
RUN npm run build

# 第二阶段：使用 Nginx 托管静态文件
FROM nginx:1.27-alpine

# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物到 Nginx 的 html 目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露 80 端口
EXPOSE 80

# 启动 Nginx（前台运行）
CMD ["nginx", "-g", "daemon off;"]
