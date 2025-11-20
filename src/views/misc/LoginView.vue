<template>
  <div class="login-page relative min-h-screen overflow-hidden">
    <div class="login-gradient login-gradient--top" />
    <div class="login-gradient login-gradient--bottom" />
    <div class="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
      <div
        class="login-card grid w-full max-w-5xl gap-6 rounded-[32px] border border-white/15 bg-white/90 p-6 shadow-[0_35px_120px_rgba(15,23,42,0.35)] backdrop-blur-[28px] lg:grid-cols-[1.05fr_1fr] lg:p-10"
      >
        <section
          class="brand-panel relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-sky-600 to-indigo-600 p-8 text-white"
        >
          <div class="brand-panel__glow brand-panel__glow--one" />
          <div class="brand-panel__glow brand-panel__glow--two" />
          <div class="relative z-10 flex h-full flex-col">
            <div
              class="inline-flex w-fit items-center gap-3 rounded-full bg-white/15 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]"
            >
              <span class="h-1 w-12 rounded-full bg-white/70" />
              hosting admin
            </div>
            <h1 class="mt-6 text-3xl font-semibold leading-tight text-white lg:text-4xl">
              托管平台智能控制台
            </h1>
            <p class="mt-4 max-w-md text-sm text-white/80">
              统一的课堂排程、考勤打卡、家校沟通与统计分析工具，为托管机构提供开箱即用的数字化能力。
            </p>
            <div class="mt-8 space-y-4">
              <div
                v-for="(feature, index) in featureList"
                :key="index"
                class="flex items-start gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
              >
                <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <el-icon :size="18">
                    <CircleCheck />
                  </el-icon>
                </span>
                <div>
                  <p class="text-base font-semibold">
                    {{ feature.title }}
                  </p>
                  <p class="text-xs text-white/80">
                    {{ feature.desc }}
                  </p>
                </div>
              </div>
            </div>
            <div
              class="mt-auto grid gap-4 pt-10 text-left text-xs uppercase tracking-[0.2em] text-white/70 sm:grid-cols-2"
            >
              <div>
                <p class="text-[10px] text-white/50">
                  Service Uptime
                </p>
                <p class="text-2xl font-semibold text-white">
                  99.95%
                </p>
              </div>
              <div>
                <p class="text-[10px] text-white/50">
                  Active Schools
                </p>
                <p class="text-2xl font-semibold text-white">
                  120+
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          class="form-panel flex flex-col justify-center rounded-3xl bg-white/90 p-8 text-slate-800 shadow-[0_25px_50px_rgba(15,23,42,0.12)]"
        >
          <div class="mb-8 flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">
                Account Center
              </p>
              <h2 class="mt-3 text-2xl font-semibold text-slate-900">
                欢迎登录托管后台
              </h2>
              <p class="mt-2 text-sm text-slate-500">
                输入账号信息以继续。我们会保障您的数据安全。
              </p>
            </div>
            <div
              class="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"
            >
              <img
                :src="logoUrl"
                alt="logo"
                class="h-8 w-8 object-contain"
              >
            </div>
          </div>
          <el-form
            class="space-y-6"
            label-position="top"
            @submit.prevent="handleLogin"
          >
            <el-form-item
              label="账号"
              class="form-item"
            >
              <div :class="['field-shell', { 'field-shell--error': showFieldError('account') }]">
                <el-input
                  v-model="form.account"
                  size="large"
                  placeholder="请输入账号或手机号"
                  @focus="touchField('account')"
                  @blur="handleBlur('account')"
                >
                  <template #prefix>
                    <el-icon
                      :size="18"
                      class="text-emerald-500"
                    >
                      <UserFilled />
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <p
                v-if="showFieldError('account')"
                class="error-tip"
              >
                {{ errors.account }}
              </p>
            </el-form-item>

            <el-form-item
              label="密码"
              class="form-item"
            >
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
                    <el-icon
                      :size="18"
                      class="text-emerald-500"
                    >
                      <Lock />
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <p
                v-if="showFieldError('password')"
                class="error-tip"
              >
                {{ errors.password }}
              </p>
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
          <div class="mt-6 text-center text-xs text-slate-400">
            登录即表示您同意
            <a
              class="font-medium text-emerald-500 hover:text-emerald-600"
              href="javascript:void(0)"
            >《安全与隐私政策》</a>
          </div>
        </section>
      </div>
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
  { title: '统一身份认证', desc: '手机号与账号双通道登录，支持后台灵活扩展' },
  { title: '多校区托管', desc: '覆盖校区、年级、教师多维数据，实时同步' },
  { title: '安全合规', desc: '采用加密传输与权限隔离，保障家校信息安全' },
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
  if (Object.values(errors).some((error) => error)) {
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
        phone: response.data.phone,
        userName: response.data.userName,
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
.login-page {
  font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  background:
    radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.25), transparent 55%),
    radial-gradient(circle at 80% 0%, rgba(16, 185, 129, 0.2), transparent 45%),
    linear-gradient(135deg, #0f172a 0%, #1d2b4b 45%, #273a57 100%);
}

.login-gradient {
  position: absolute;
  border-radius: 9999px;
  filter: blur(120px);
  opacity: 0.4;
  pointer-events: none;
}

.login-gradient--top {
  top: -220px;
  left: 12%;
  width: 520px;
  height: 520px;
  background: radial-gradient(circle at 30% 30%, rgba(16, 185, 129, 0.6), transparent 60%);
}

.login-gradient--bottom {
  bottom: -180px;
  right: 0;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.35), transparent 55%);
}

.brand-panel__glow {
  position: absolute;
  border-radius: 9999px;
  filter: blur(40px);
  opacity: 0.45;
}

.brand-panel__glow--one {
  top: -40px;
  right: -60px;
  width: 220px;
  height: 220px;
  background: rgba(255, 255, 255, 0.35);
}

.brand-panel__glow--two {
  bottom: -60px;
  left: -40px;
  width: 260px;
  height: 260px;
  background: rgba(16, 185, 129, 0.4);
}

.form-item {
  margin-bottom: 0;
}

.field-shell {
  border-radius: 1rem;
  padding: 2px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2));
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.field-shell:focus-within {
  box-shadow: 0 12px 28px rgba(79, 70, 229, 0.2);
  transform: translateY(-1px);
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
  background-image: linear-gradient(120deg, #34d399, #3b82f6, #8b5cf6);
  box-shadow: 0 20px 35px rgba(79, 70, 229, 0.35);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    filter 0.2s ease;
}

.brand-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 28px 45px rgba(79, 70, 229, 0.4);
}

.brand-btn:disabled {
  opacity: 0.85;
  cursor: not-allowed;
  filter: grayscale(0.1);
  transform: none;
}
</style>
