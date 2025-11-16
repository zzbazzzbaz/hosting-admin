<template>
  <div class="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-emerald-50 to-white px-4 py-12 text-slate-900">
    <div class="absolute inset-0 -z-10 overflow-hidden">
      <div class="absolute -left-24 top-10 h-72 w-72 rounded-full bg-rose-200/50 blur-3xl" />
      <div class="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
    </div>
    <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-[32px] border border-rose-100 bg-rose-50/95 p-6 shadow-[0_25px_80px_rgba(244,63,94,0.15)] backdrop-blur-xl lg:flex-row lg:gap-10 lg:p-12">
      <section class="flex flex-1 flex-col justify-between rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-sky-50 p-8">
        <div>
          <div class="inline-flex items-center gap-3 rounded-full bg-white px-4 py-1 text-xs font-medium uppercase tracking-[0.35em] text-emerald-600 shadow-sm">
            <span class="h-1 w-10 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400" />
            托管后台管理
          </div>
          <h1 class="mt-6 text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">托管后台管理</h1>
          <p class="mt-4 max-w-md text-base text-slate-600">
            XXXXXXXXXXXXXXXXXXXXXXXXX，XXXXXXXXXXXXXXXXXXXXXXX。
            hhh 。
            CICD测试成功！！。
            github action 测试
          </p>
          <div class="mt-8 space-y-5">
            <div v-for="(feature, index) in featureList" :key="index" class="flex items-start gap-4">
              <span class="rounded-2xl bg-white p-2 text-emerald-500 shadow-inner shadow-emerald-100">
                <el-icon :size="18">
                  <CircleCheck />
                </el-icon>
              </span>
              <div>
                <p class="text-base font-semibold text-slate-900">{{ feature.title }}</p>
                <p class="text-sm text-slate-600">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="flex flex-1 flex-col justify-center rounded-3xl bg-white p-8 text-slate-800 shadow-2xl shadow-emerald-900/20">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-500">Login</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">欢迎来到托管后台管理</h2>
          </div>
          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 shadow-inner shadow-emerald-100">
            <img :src="logoUrl" alt="logo" class="h-10 w-10 object-contain" />
          </div>
        </div>
        <el-form class="space-y-6" label-position="top" @submit.prevent="handleLogin">
          <el-form-item label="账号" class="form-item">
            <div :class="['field-shell', { 'field-shell--error': showFieldError('account') }]">
              <el-input
                v-model="form.account"
                size="large"
                placeholder="请输入账号或手机号"
                @focus="touchField('account')"
                @blur="handleBlur('account')"
              >
                <template #prefix>
                  <el-icon :size="18" class="text-emerald-500">
                    <UserFilled />
                  </el-icon>
                </template>
              </el-input>
            </div>
            <p v-if="showFieldError('account')" class="error-tip">{{ errors.account }}</p>
          </el-form-item>

          <el-form-item label="密码" class="form-item">
            <div :class="['field-shell', { 'field-shell--error': showFieldError('password') }]">
              <el-input
                v-model="form.password"
                size="large"
                type="password"
                show-password
                placeholder="请输入登录密码"
                @focus="touchField('password')"
                @blur="handleBlur('password')"
              >
                <template #prefix>
                  <el-icon :size="18" class="text-emerald-500">
                    <Lock />
                  </el-icon>
                </template>
              </el-input>
            </div>
            <p v-if="showFieldError('password')" class="error-tip">{{ errors.password }}</p>
          </el-form-item>

          <el-button
            class="brand-btn"
            :loading="isLoading"
            :disabled="isLoading"
            native-type="submit"
          >
            <template #default>
              <span v-if="!isLoading">进入控制台</span>
              <span v-else>验证中...</span>
            </template>
          </el-button>
        </el-form>
        <p class="mt-8 text-center text-xs text-slate-400">
          登录即表示您同意
          <a class="font-medium text-emerald-500 hover:text-emerald-600" href="javascript:void(0)">《安全与隐私政策》</a>
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { CircleCheck, Lock, UserFilled } from '@element-plus/icons-vue'

import logoUrl from '@/assets/logo.png'
import { login } from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const featureList = [
  { title: 'XXXXXX', desc: 'XXXXXXXXXXXXXXXXXXXXXXXX' },
  { title: 'XXXXXX', desc: 'XXXXXXXXXXXXXXXXXXXXXXXX' },
  { title: 'XXXXXX', desc: 'XXXXXXXXXXXXXXXXXXXXXXXX' },
]

const form = reactive({
  account: '',
  password: '',
})

const errors = reactive({
  account: '',
  password: '',
})

const touched = reactive({
  account: false,
  password: false,
})

const isLoading = ref(false)

const validators = {
  account: (value) => {
    if (!value) return '请输入账号或手机号'
    if (value.length < 4) return '账号长度需不少于 4 位'
    return ''
  },
  password: (value) => {
    if (!value) return '请输入密码'
    if (value.length < 6) return '密码长度需不少于 6 位'
    return ''
  },
}

const validateField = (field) => {
  errors[field] = validators[field](form[field])
}

const touchField = (field) => {
  touched[field] = true
}

const handleBlur = (field) => {
  touchField(field)
  validateField(field)
}

const showFieldError = (field) => touched[field] && errors[field]

watch(
  () => form.account,
  () => {
    if (touched.account) validateField('account')
  }
)

watch(
  () => form.password,
  () => {
    if (touched.password) validateField('password')
  }
)

const handleLogin = async () => {
  // 验证所有字段
  Object.keys(errors).forEach((key) => {
    touchField(key)
    validateField(key)
  })

  // 如果有验证错误，不提交表单
  if (Object.values(errors).some(error => error)) {
    return
  }

  isLoading.value = true

  try {
    const response = await login({
      phone: form.account,
      password: form.password,
    })

    // 检查登录是否成功
    if (response.code === 200 && response.data) {
      const token = response.data.authToken

      // 保存 token 到 store 和 localStorage
      authStore.setToken(token)

      // 保存用户信息到 store
      userStore.updateProfile({
        userId: response.data.userId,
        phone: response.data.phone
      })

      // 显示成功消息
      ElMessage.success(response.message || '登录成功，欢迎回来！')

      // 跳转到主页
      await router.push('/dashboard')
    } else {
      // 登录失败
      console.log('登录失败，响应 code:', response.code)
      ElMessage.error(response.message || '登录失败，请检查账号密码')
    }
  } catch (error) {
    // 网络错误或其他异常
    console.error('登录异常:', error)
    console.error('错误详情:', error.response || error.message)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.form-item {
  margin-bottom: 0;
}

.field-shell {
  border-radius: 1rem;
  padding: 2px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15));
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.field-shell:focus-within {
  box-shadow: 0 10px 25px rgba(15, 118, 110, 0.2);
  transform: translateY(-1px);
}

.field-shell--error {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.25), rgba(239, 68, 68, 0.15));
}

.field-shell :deep(.el-input__wrapper) {
  border-radius: 0.95rem;
  background: white;
  border: 1px solid transparent;
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-shell:focus-within :deep(.el-input__wrapper) {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.35);
}

.field-shell--error :deep(.el-input__wrapper) {
  border-color: rgba(248, 113, 113, 0.9);
  box-shadow: 0 0 0 2px rgba(248, 113, 113, 0.35);
}

.error-tip {
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #ef4444;
}

.brand-btn {
  width: 100%;
  border: 0;
  border-radius: 1rem;
  height: 3.5rem;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #fff;
  background-image: linear-gradient(120deg, #34d399, #06b6d4, #0ea5e9);
  box-shadow: 0 20px 35px rgba(14, 165, 233, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.brand-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 28px 45px rgba(14, 165, 233, 0.35);
}

.brand-btn:disabled {
  opacity: 0.85;
  cursor: not-allowed;
  filter: grayscale(0.1);
  transform: none;
}

.brand-btn.is-loading {
  transform: none;
}
</style>
