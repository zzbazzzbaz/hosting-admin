<template>
  <div class="space-y-6">
    <el-card shadow="hover" class="pastel-card">
      <div class="flex flex-col gap-2">
        <h2 class="text-2xl font-semibold text-pink-500">欢迎回来，{{ profile.name }}！</h2>
        <p class="text-slate-500">
          您可以通过左侧导航快捷进入用户、签到、作业等模块，管理托管机构的基础数据。
        </p>
      </div>
    </el-card>


  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const { profile } = userStore
</script>
