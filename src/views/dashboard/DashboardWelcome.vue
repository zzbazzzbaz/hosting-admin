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

    <el-row :gutter="16">
      <el-col v-for="card in quickStats" :key="card.title" :span="6">
        <el-card class="pastel-card text-center">
          <p class="text-xs uppercase tracking-widest text-pink-400">
            {{ card.title }}
          </p>
          <p class="mt-2 text-3xl font-semibold text-slate-800">
            {{ card.value }}
          </p>
          <p class="mt-1 text-xs text-slate-500">
            {{ card.description }}
          </p>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-700">快速操作</span>
          <el-button type="primary" link @click="navigateTo('/users/manage')"> 管理用户 </el-button>
        </div>
      </template>
      <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="action in quickActions"
          :key="action.label"
          class="flex items-start gap-4 rounded-3xl border border-pink-100/60 bg-white/80 p-4 shadow-sm shadow-pink-100/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-200/70"
        >
          <el-icon
            :size="actionIconSize"
            class="rounded-2xl bg-pink-100/80 p-2 text-pink-500 shadow-inner shadow-pink-100/80"
          >
            <component :is="action.icon" />
          </el-icon>
          <div class="space-y-1">
            <p class="font-medium text-slate-800">
              {{ action.label }}
            </p>
            <p class="text-xs text-slate-500">
              {{ action.description }}
            </p>
            <el-button type="primary" text @click="navigateTo(action.path)"> 进入 </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { Avatar, Calendar, CollectionTag, EditPen, User, UserFilled } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const { profile } = userStore
const actionIconSize = 24

const quickStats = [
  { title: '活跃用户', value: 128, description: '最近 7 天活跃的管理员、教师与家长数量' },
  { title: '今日签到', value: 56, description: '今日学生签到记录数' },
  { title: '待批改作业', value: 14, description: '教师待处理的作业数量' },
  { title: '待审核信息', value: 8, description: '待完善的学生档案或异常记录' },
]

const quickActions = [
  {
    label: '新增用户',
    description: '创建管理员、教师或家长账号并分配角色',
    icon: UserFilled,
    path: '/users/manage',
  },
  {
    label: '签到管理',
    description: '查看学生签到记录并处理缺勤异常',
    icon: Calendar,
    path: '/attendance/manage',
  },
  {
    label: '作业管理',
    description: '发布与跟踪作业完成情况',
    icon: EditPen,
    path: '/homework/manage',
  },
  {
    label: '学生档案',
    description: '管理学生基础信息与老师关联关系',
    icon: Avatar,
    path: '/users/students',
  },
  {
    label: '教师资源',
    description: '维护教师信息与班级覆盖情况',
    icon: User,
    path: '/users/teachers',
  },
  {
    label: '数据字典',
    description: '维护学校、年级、科目等基础数据',
    icon: CollectionTag,
    path: '/dictionary/schools',
  },
]

const navigateTo = (path) => {
  router.push(path)
}
</script>
