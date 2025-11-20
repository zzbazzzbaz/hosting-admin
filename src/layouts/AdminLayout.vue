<template>
  <el-container class="h-screen bg-transparent text-slate-700">
    <el-aside
      width="260"
      class="sticky top-0 flex h-screen flex-col overflow-hidden border-r border-sky-200 bg-sky-100/95 shadow-xl shadow-sky-200/70 backdrop-blur"
    >
      <div class="flex items-center gap-3 border-b border-sky-200/80 px-6 py-6">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md shadow-pink-200/70 ring-1 ring-inset ring-sky-200/60"
        >
          <img
            :src="logoUrl"
            alt="hosting-admin Logo"
            class="h-10 w-10 object-contain"
          >
        </div>
        <div>
          <p class="text-lg font-semibold text-slate-800">
            hosting-admin
          </p>
          <p class="text-xs text-slate-600 tracking-wide">
            Admin Portal
          </p>
        </div>
      </div>
      <app-sidebar :menus="menus" />
    </el-aside>
    <el-container>
      <el-header
        height="120"
        class="flex items-center justify-between border-b border-pink-100/70 bg-white/90 px-10 backdrop-blur"
      >
        <app-header />
      </el-header>
      <el-main class="h-full overflow-y-auto p-6">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import AppHeader from '@/layouts/components/layout/AppHeader.vue'
import AppSidebar from '@/layouts/components/layout/AppSidebar.vue'
import { navigationMenus } from '@/router'
import logoUrl from '@/assets/logo.png'

const menus = navigationMenus
</script>
