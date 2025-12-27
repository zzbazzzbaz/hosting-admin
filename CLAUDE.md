# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览

这是一个基于 Vue 3 + Vite + Element Plus 的托管后台管理系统。使用 Composition API、Pinia 状态管理、Vue Router 路由守卫和 TailwindCSS 样式。

## 开发命令

```bash
npm run dev      # 启动开发服务器 (Vite)
npm run build    # 生产环境构建
npm run preview  # 预览构建结果
```

**Node 版本要求**: v20.19.1 (使用 NVM 管理)

## 核心架构

### 认证流程

1. **登录**: `src/views/misc/LoginView.vue` 调用 `login()` API
2. **Token 存储**: 登录成功后 token 保存到 `localStorage` 和 `useAuthStore`
3. **路由守卫**: `src/router/index.js` 的 `beforeEach` 在每次导航时：
   - 检查是否存在 token
   - 调用 `checkToken()` API 验证 token 有效性
   - token 过期则清除并重定向到登录页

### HTTP 请求处理

**文件**: `src/utils/request.js`

- **Base URL**: `http://localhost:8080`
- **请求拦截器**: 自动在请求头添加 `Authorization: Bearer ${token}`
- **响应拦截器**: 统一处理 `code: 0/200` 成功响应，其他显示错误提示
- **超时设置**: 15秒

**使用方式**:
```javascript
import request from '@/utils/request'

export const someApi = (data) => {
  return request({
    url: '/api/endpoint',
    method: 'post',
    data  // 或使用 params 取决于后端要求
  })
}
```

### 状态管理 (Pinia)

- **`src/stores/auth.js`**: Token 管理，自动同步到 localStorage
- **`src/stores/user.js`**: 用户信息管理 (userId, userName, phone, role)

### 路由与菜单同步

**关键文件**: `src/router/index.js`

1. **导出 `navigationMenus`**: 侧边栏菜单配置 (包含 icon, label, children)
2. **定义 `layoutChildren`**: 实际路由配置
3. **同步机制**: 通过 `meta.menuKey` 和 `meta.parentKey` 关联

**添加新页面步骤**:
1. 在 `navigationMenus` 添加菜单项 (设置 `key` 和 `path`)
2. 在 `layoutChildren` 添加路由 (设置 `meta.menuKey` 匹配菜单 key)
3. 在 `src/views/` 创建对应的 Vue 组件

### 布局结构

- **`src/layouts/AdminLayout.vue`**: 后台主布局 (侧边栏 + 内容区)
- **`src/layouts/components/layout/AppHeader.vue`**: 顶部面包屑 + 用户信息 + 退出按钮
- **`src/layouts/components/layout/AppSidebar.vue`**: 左侧导航菜单
- **`src/views/misc/LoginView.vue`**: 独立登录页面

### API 模块组织

- **`src/api/auth.js`**: 认证相关 (login, checkToken, logOut)
- 新增 API 模块: 在 `src/api/` 下创建对应的 `xxx.js`，使用 `request` 实例

### 样式系统

- **TailwindCSS**: 主要使用工具类 (配置文件: `tailwind.config.js`)
- **Element Plus**: UI 组件库，主题通过 CSS 变量覆盖
- **Scoped Styles**: 组件内样式使用 `<style scoped>`
- **Deep Selectors**: 使用 `:deep()` 穿透子组件样式

## 环境配置

**开发环境文件**: `.env.development` (需创建)

建议配置:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 代码规范

- **注释**: 所有函数和复杂逻辑必须添加中文注释
- **命名**: 遵循 Vue 官方风格指南 (组件名大驼峰，文件名大驼峰或短横线)
- **状态管理**: 优先使用 Pinia Composition API 风格
- **路由配置**: 必须同时更新 `navigationMenus` 和 `layoutChildren`

## 常见问题

### 后端接口参数格式

- 登录接口使用 `params` 而非 `data` (POST 请求但参数在 URL query)
- 根据实际后端要求调整 `data` 或 `params`

### Token 验证逻辑

路由守卫会在每次导航时调用 `checkToken` API，频繁导航可能增加服务器负载。如需优化，可以考虑:
- 添加 token 本地过期时间缓存
- 仅在 token 快过期时才调用验证接口

### 菜单权限控制

当前菜单对所有登录用户可见。如需角色权限控制:
1. 在 `router.beforeEach` 添加角色检查逻辑
2. 在 `navigationMenus` 配置中添加 `roles` 字段
3. 在 `AppSidebar.vue` 中根据用户角色过滤菜单
