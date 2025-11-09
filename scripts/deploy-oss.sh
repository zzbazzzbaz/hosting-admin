#!/bin/bash

#############################################
# 阿里云 OSS 部署脚本
# 用于手动部署 Vue 项目到阿里云 OSS
#############################################

set -e  # 遇到错误立即退出

# 获取脚本所在目录的上级目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的信息
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

print_info "==================================="
print_info "  阿里云 OSS 部署脚本"
print_info "==================================="

# 加载 .env 文件（如果存在）
if [ -f "scripts/.env" ]; then
    print_info "加载 scripts/.env 配置文件..."
    set -a
    source scripts/.env
    set +a
    print_success "scripts/.env 文件加载成功"
fi

# 检查环境变量
if [ -z "$OSS_ENDPOINT" ] || [ -z "$OSS_ACCESS_KEY_ID" ] || [ -z "$OSS_ACCESS_KEY_SECRET" ] || [ -z "$OSS_BUCKET" ]; then
    print_error "缺少必要的环境变量！"
    echo ""
    echo "请设置以下环境变量："
    echo "  export OSS_ENDPOINT='oss-cn-hangzhou.aliyuncs.com'"
    echo "  export OSS_ACCESS_KEY_ID='你的AccessKeyId'"
    echo "  export OSS_ACCESS_KEY_SECRET='你的AccessKeySecret'"
    echo "  export OSS_BUCKET='你的存储桶名称'"
    echo "  export OSS_PATH='上传路径（可选）'"
    echo ""
    echo "请确保 scripts/.env 文件存在"
    echo "当前工作目录: $(pwd)"
    exit 1
fi

# 设置默认值
OSS_PATH=${OSS_PATH:-""}  # 默认为空，上传到根目录
BUILD_DIR=${BUILD_DIR:-"dist"}  # 默认构建目录为 dist

print_info "配置信息："
echo "  OSS Endpoint: $OSS_ENDPOINT"
echo "  OSS Bucket: $OSS_BUCKET"
echo "  OSS Path: ${OSS_PATH:-'根目录'}"
echo "  Build Dir: $BUILD_DIR"
echo ""

# 1. 检查 Node.js 环境
print_info "检查 Node.js 环境..."
if ! command_exists node; then
    print_error "未找到 Node.js，请先安装 Node.js！"
    exit 1
fi
print_success "Node.js 版本: $(node -v)"

# 2. 检查 npm
if ! command_exists npm; then
    print_error "未找到 npm，请先安装 npm！"
    exit 1
fi
print_success "npm 版本: $(npm -v)"

# 3. 配置 npm 国内镜像源
print_info "配置 npm 国内镜像源..."
npm config set registry https://registry.npmmirror.com
print_success "已配置淘宝 npm 镜像"

# 4. 安装依赖
print_info "安装项目依赖..."
if [ -f "package-lock.json" ]; then
    npm ci --prefer-offline --no-audit
else
    npm install --prefer-offline --no-audit
fi
print_success "依赖安装完成"

# 5. 构建项目
print_info "构建项目..."
npm run build
print_success "项目构建完成"

# 检查构建目录是否存在
if [ ! -d "$BUILD_DIR" ]; then
    print_error "构建目录 $BUILD_DIR 不存在！"
    exit 1
fi

# 6. 检查 ossutil 工具
print_info "检查 ossutil 工具..."
if ! command_exists ossutil; then
    print_error "未找到 ossutil！"
    echo ""
    echo "请先手动安装 ossutil："
    exit 1
fi
print_success "ossutil 已安装: $(ossutil --version | head -n 1)"

# 7. 配置 ossutil
print_info "配置 ossutil..."
ossutil config -e "$OSS_ENDPOINT" \
               -i "$OSS_ACCESS_KEY_ID" \
               -k "$OSS_ACCESS_KEY_SECRET" \
               -L CH \
               --output-dir=/tmp/ossutil_output
print_success "ossutil 配置完成"

# 8. 上传到 OSS
print_info "上传文件到 OSS..."

# 构建目标路径
if [ -z "$OSS_PATH" ]; then
    OSS_TARGET="oss://$OSS_BUCKET/"
else
    OSS_TARGET="oss://$OSS_BUCKET/$OSS_PATH/"
fi

echo "  源目录: ./$BUILD_DIR/"
echo "  目标路径: $OSS_TARGET"
echo ""

# 询问是否清空目标目录
read -r -p "是否清空 OSS 目标目录？(y/N): " -n 1 REPLY
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_warning "正在清空目标目录..."
    ossutil rm "$OSS_TARGET" -r -f || true
    print_success "目标目录已清空"
fi

# 上传文件
print_info "正在上传文件..."
ossutil cp -r -f -u \
    "./$BUILD_DIR/" \
    "$OSS_TARGET" \
    --meta Cache-Control:public,max-age=31536000

print_success "文件上传完成！"

# 9. 显示部署信息
print_info "==================================="
print_success "🎉 部署成功！"
print_info "==================================="
echo ""
echo "📦 部署信息："
echo "  OSS Bucket: $OSS_BUCKET"
echo "  OSS Path: ${OSS_PATH:-'根目录'}"
echo "  OSS URL: $OSS_TARGET"
echo ""
echo "🔗 访问地址："
if [ -z "$OSS_PATH" ]; then
    echo "  https://$OSS_BUCKET.$OSS_ENDPOINT/"
else
    echo "  https://$OSS_BUCKET.$OSS_ENDPOINT/$OSS_PATH/"
fi
echo ""
echo "💡 提示："
echo "  - 如需配置自定义域名，请在阿里云 OSS 控制台绑定"
echo "  - 建议配置 CDN 以提升访问速度"
echo "  - 可在 OSS 控制台查看文件列表和访问统计"
echo ""
print_success "部署完成！"
