<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-100 via-emerald-100 to-sky-100 px-4 py-12 text-slate-800"
  >
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-emerald-200/50 blur-3xl" />
      <div class="absolute -bottom-20 right-0 h-56 w-56 rounded-full bg-sky-200/50 blur-3xl" />
    </div>
    <div class="mb-10 flex flex-col items-center space-y-4">
      <div class="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-lg shadow-emerald-100/80 ring-2 ring-inset ring-emerald-200/70">
        <img :src="logoUrl" alt="hosting-admin Logo" class="h-12 w-12 object-contain" />
      </div>
      <div class="text-center">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">hosting-admin</h1>
        <p class="text-sm text-slate-600">请登录您的账号，开始管理教学与学生数据</p>
      </div>
    </div>
    <el-card class="w-full max-w-4xl border-0 bg-white/90 shadow-2xl shadow-emerald-100/70 backdrop-blur" shadow="hover">
      <div class="grid gap-8 p-8 lg:grid-cols-[1fr_1.2fr]">
        <div class="flex flex-col justify-center space-y-4 rounded-2xl bg-emerald-50/70 p-6 text-sm text-slate-600">
          <h2 class="text-lg font-semibold text-slate-800">账户权限说明</h2>
          <ul class="space-y-2 leading-relaxed">
            <li class="flex items-start gap-2">
              <el-icon class="mt-1 text-emerald-400" :size="16">
                <CircleCheck />
              </el-icon>
              <span>管理员可统一管理用户、教师、学生及作业信息</span>
            </li>
            <li class="flex items-start gap-2">
              <el-icon class="mt-1 text-emerald-400" :size="16">
                <CircleCheck />
              </el-icon>
              <span>多角色支持差异化权限，确保数据安全</span>
            </li>
            <li class="flex items-start gap-2">
              <el-icon class="mt-1 text-emerald-400" :size="16">
                <CircleCheck />
              </el-icon>
              <span>如需帮助，请联系机构教务员或管理员</span>
            </li>
          </ul>
        </div>
        <div>
          <el-form class="space-y-6" label-position="top" @submit.prevent="handleLogin">
            <el-form-item label="用户名 / 手机号">
              <el-input
                v-model="form.account"
                size="large"
                placeholder="请输入用户名或手机号"
                class="rounded-xl"
              >
                <template #prefix>
                  <el-icon :size="18" class="text-emerald-400">
                    <UserFilled />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="登录密码">
              <el-input
                v-model="form.password"
                size="large"
                type="password"
                show-password
                placeholder="请输入登录密码"
                class="rounded-xl"
              >
                <template #prefix>
                  <el-icon :size="18" class="text-emerald-400">
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <div class="flex items-center justify-between text-sm text-slate-500">
              <el-checkbox v-model="form.remember">记住账号</el-checkbox>
              <button type="button" class="font-medium text-emerald-500 transition hover:text-emerald-600">
                忘记密码？
              </button>
            </div>

            <el-button
              type="primary"
              size="large"
              native-type="submit"
              class="w-full rounded-xl bg-emerald-400 text-base font-semibold tracking-wide text-white transition hover:bg-emerald-500"
            >
              登录
            </el-button>
          </el-form>
          <p class="mt-8 text-center text-xs text-slate-400">
            登录即代表您已阅读并同意
            <a class="font-medium text-emerald-500 hover:text-emerald-600" href="javascript:void(0)">《平台服务协议》</a>
          </p>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

import { CircleCheck, Lock, UserFilled } from '@element-plus/icons-vue'

import logoUrl from '@/assets/logo.png'

const router = useRouter()

const form = reactive({
  account: '',
  password: '',
  remember: true,
})

const handleLogin = () => {
  router.push('/dashboard')
}
</script>
