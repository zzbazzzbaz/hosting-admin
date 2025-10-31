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
      <div class="flex items-center gap-4 rounded-full bg-white/80 px-6 py-3 shadow-inner shadow-emerald-100/60 backdrop-blur">
        <div class="text-left">
          <p class="text-xs uppercase tracking-wide text-slate-400">当前用户</p>
          <p class="text-base font-semibold text-slate-800">{{ profile.name }}</p>
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

import { SwitchButton } from '@element-plus/icons-vue'

import { navigationMenus } from '@/router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const { profile } = userStore

const menuLookup = new Map()

navigationMenus.forEach((entry) => {
  menuLookup.set(entry.key, { label: entry.label, path: entry.path ?? null })
  if (entry.children?.length) {
    entry.children.forEach((child) => {
      menuLookup.set(child.key, { label: child.label, path: child.path ?? null })
    })
  }
})

const breadcrumbs = computed(() => {
  const trail = []

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

const handleLogout = () => {
  router.push('/login')
}
</script>
