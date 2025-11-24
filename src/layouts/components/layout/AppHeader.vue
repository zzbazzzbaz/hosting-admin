<template>
  <div class="flex h-full w-full items-center justify-between gap-8 py-4">
    <div class="space-y-2">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(crumb, index) in breadcrumbs" :key="crumb.label">
          <router-link
            v-if="crumb.path && index !== breadcrumbs.length - 1"
            :to="crumb.path"
            class="text-slate-500 transition hover:text-emerald-500"
          >
            {{ crumb.label }}
          </router-link>
          <span v-else class="text-slate-700">
            {{ crumb.label }}
          </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <h1 class="text-3xl font-bold text-slate-900">
        {{ currentTitle }}
      </h1>
    </div>
    <div class="flex items-center gap-4">
      <div
        class="flex items-center gap-4 rounded-full bg-white/80 px-6 py-3 shadow-inner shadow-emerald-100/60 backdrop-blur"
      >
        <div class="text-left">
          <p class="text-xs uppercase tracking-wide text-slate-400">当前用户</p>
          <p class="text-base font-semibold text-slate-800">
            {{ profile.name }}
          </p>
        </div>
        <el-button
          type="primary"
          plain
          class="rounded-full border-none bg-emerald-400/90 px-5 text-sm font-semibold text-white shadow-md shadow-emerald-100/80 transition hover:bg-emerald-500 hover:text-white"
          @click="handleLogout"
        >
          <el-icon :size="18" class="-ml-1 mr-1 text-white">
            <SwitchButton />
          </el-icon>
          退出登录
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import { SwitchButton } from '@element-plus/icons-vue'

import { navigationMenus } from '@/router/index.js'
import { useUserStore } from '@/stores/user.js'
import { useAuthStore } from '@/stores/auth.js'
import { logOut } from '@/api/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const authStore = useAuthStore()

const { profile } = userStore

const menuLookup = new Map()

const registerMenu = (entry) => {
  menuLookup.set(entry.key, { label: entry.label, path: entry.path ?? null })
  if (entry.children?.length) {
    entry.children.forEach(registerMenu)
  }
}

navigationMenus.forEach(registerMenu)

const breadcrumbs = computed(() => {
  const trail = []

  if (route.meta?.grandParentKey) {
    const grand = menuLookup.get(route.meta.grandParentKey)
    if (grand) {
      trail.push(grand)
    }
  }

  if (route.meta?.parentKey) {
    const parent = menuLookup.get(route.meta.parentKey)
    if (parent) {
      trail.push(parent)
    }
  }

  if (route.meta?.menuKey) {
    const currentMenu = menuLookup.get(route.meta.menuKey)
    if (currentMenu) {
      trail.push({
        label: route.meta.title ?? currentMenu.label,
        path: currentMenu.path ?? route.fullPath,
      })
    } else if (route.meta.title) {
      trail.push({ label: route.meta.title, path: route.fullPath })
    }
  } else if (route.meta?.title) {
    trail.push({ label: route.meta.title, path: route.fullPath })
  }

  if (!trail.length && route.meta?.title) {
    trail.push({ label: route.meta.title, path: route.fullPath })
  }

  return trail
})

const currentTitle = computed(() => breadcrumbs.value.at(-1)?.label ?? route.meta?.title ?? '主页')

/**
 * 处理退出登录
 * 1. 弹出确认对话框
 * 2. 调用退出登录接口
 * 3. 清除本地 token 和用户信息
 * 4. 跳转到登录页
 */
const handleLogout = async () => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    // 调用退出登录接口
    await logOut()

    // 清除本地 token 和用户信息
    authStore.clearToken()
    userStore.clearProfile()

    // 显示退出成功消息
    ElMessage.success('已退出登录')

    // 跳转到登录页
    await router.push('/login')
  } catch (error) {
    // 用户取消或接口调用失败
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
      // 即使接口失败，也清除本地数据
      authStore.clearToken()
      userStore.clearProfile()
      await router.push('/login')
    }
  }
}
</script>
