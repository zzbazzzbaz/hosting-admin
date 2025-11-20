<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
    <el-empty description="页面未找到">
      <template #image>
        <el-icon class="text-5xl text-slate-300">
<!--          <Warning />-->
        </el-icon>
      </template>
      <el-button
        type="primary"
        @click="goHome"
      >
        返回主页
      </el-button>
    </el-empty>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.replace('/dashboard')
}
</script>
