import {
  Bell,
  Collection,
  House,
  Notebook,
  Timer,
  User,
  UserFilled,
  TrophyBase,
} from '@element-plus/icons-vue'
import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { checkToken } from '@/api/auth'

export const navigationMenus = [
  {
    key: 'dashboard',
    label: '主页',
    icon: House,
    path: '/dashboard',
  },
  {
    key: 'users',
    label: '账户',
    icon: UserFilled,
    children: [
      { key: 'users-manage', label: '管理员管理', path: '/users/manage' },
      { key: 'teachers-manage', label: '教师管理', path: '/teachers/manage' },
      { key: 'users-parents', label: '家长管理', path: '/users/parents' },
      { key: 'users-students', label: '学生管理', path: '/users/students' },
    ],
  },
  {
    key: 'teacher-assessment',
    label: '考核',
    icon: User,
    children: [
      { key: 'teachers-assessment', label: '月度考核管理', path: '/teachers/assessment' },
      { key: 'teachers-level', label: '历史评级管理', path: '/teachers/levels' },
    ],
  },
  {
    key: 'attendance',
    label: '签到',
    icon: Timer,
    children: [
      { key: 'attendance-dashboard', label: '数据看板', path: '/attendance/dashboard' },
      { key: 'attendance-manage', label: '签到管理', path: '/attendance/manage' },
    ],
  },
  {
    key: 'homework',
    label: '作业',
    icon: Notebook,
    children: [
      { key: 'homework-dashboard', label: '数据看板', path: '/homework/dashboard' },
      { key: 'homework-manage', label: '作业管理', path: '/homework/manage' },
    ],
  },
  {
    key: 'score',
    label: '成绩',
    icon: TrophyBase,
    children: [{ key: 'score-manage', label: '成绩管理', path: '/score/manage' }],
  },
  {
    key: 'notice',
    label: '通知',
    icon: Bell,
    children: [{ key: 'notice-manage', label: '通知管理', path: '/notice/manage' }],
  },
  {
    key: 'dictionary',
    label: '字典',
    icon: Collection,
    children: [{ key: 'dictionary-manage', label: '字典管理', path: '/dictionary/manage' }],
  },
]

const layoutChildren = [
  {
    path: 'dashboard',
    name: 'DashboardHome',
    component: () => import('@/views/dashboard/DashboardWelcome.vue'),
    meta: { title: '主页', menuKey: 'dashboard' },
  },
  {
    path: 'users/manage',
    name: 'UserManagement',
    component: () => import('@/views/account/users/UserManagement.vue'),
    meta: { title: '用户管理', menuKey: 'users-manage', parentKey: 'users' },
  },
  {
    path: 'users/parents',
    name: 'ParentManagement',
    component: () => import('@/views/account/parents/ParentManagement.vue'),
    meta: { title: '家长管理', menuKey: 'users-parents', parentKey: 'users' },
  },
  {
    path: 'users/students',
    name: 'StudentManagement',
    component: () => import('@/views/account/students/StudentManagement.vue'),
    meta: { title: '学生管理', menuKey: 'users-students', parentKey: 'users' },
  },
  {
    path: 'teachers/manage',
    name: 'TeacherManagement',
    component: () => import('@/views/account/teachers/TeacherManagement.vue'),
    meta: { title: '教师管理', menuKey: 'teachers-manage', parentKey: 'users' },
  },
  {
    path: 'teachers/assessment',
    name: 'MonthlyAssessment',
    component: () => import('@/views/teacherEvaluation/MonthlyAssessment.vue'),
    meta: {
      title: '月度考核管理',
      menuKey: 'teachers-assessment',
      parentKey: 'teacher-assessment',
    },
  },
  {
    path: 'teachers/levels',
    name: 'TeacherLevelHistory',
    component: () => import('@/views/teacherEvaluation/TeacherLevelHistory.vue'),
    meta: { title: '历史评级管理', menuKey: 'teachers-level', parentKey: 'teacher-assessment' },
  },
  {
    path: 'attendance/dashboard',
    name: 'AttendanceDashboard',
    component: () => import('@/views/attendance/AttendanceDashboard.vue'),
    meta: { title: '签到数据看板', menuKey: 'attendance-dashboard', parentKey: 'attendance' },
  },
  {
    path: 'attendance/manage',
    name: 'AttendanceManagement',
    component: () => import('@/views/attendance/AttendanceManagement.vue'),
    meta: { title: '签到管理', menuKey: 'attendance-manage', parentKey: 'attendance' },
  },
  {
    path: 'homework/manage',
    name: 'HomeworkManagement',
    component: () => import('@/views/homework/HomeworkManagement.vue'),
    meta: { title: '作业管理', menuKey: 'homework-manage', parentKey: 'homework' },
  },
  {
    path: 'homework/dashboard',
    name: 'HomeworkDashboard',
    component: () => import('@/views/homework/HomeworkDashboard.vue'),
    meta: { title: '作业数据看板', menuKey: 'homework-dashboard', parentKey: 'homework' },
  },
  {
    path: 'score/manage',
    name: 'ScoreManagement',
    component: () => import('@/views/score/ScoreManagement.vue'),
    meta: { title: '成绩管理', menuKey: 'score-manage', parentKey: 'score' },
  },
  {
    path: 'notice/manage',
    name: 'NoticeManagement',
    component: () => import('@/views/notice/NoticeManagement.vue'),
    meta: { title: '通知管理', menuKey: 'notice-manage', parentKey: 'notice' },
  },
  {
    path: 'dictionary/manage',
    name: 'DictionaryManagement',
    component: () => import('@/views/dictionary/DictionaryManagement.vue'),
    meta: { title: '字典管理', menuKey: 'dictionary-manage', parentKey: 'dictionary' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/misc/LoginView.vue'),
      meta: { title: '登录' },
    },
    {
      path: '/',
      component: AdminLayout,
      redirect: '/dashboard',
      children: layoutChildren,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/misc/NotFound.vue'),
      meta: { title: '未找到页面' },
    },
  ],
})

// 标记是否已完成首次 token 验证
let hasCheckedToken = false

/**
 * 重置 token 验证状态
 * 用于用户登出时重置，下次进入时重新验证
 */
export const resetTokenCheck = () => {
  hasCheckedToken = false
}

/**
 * 全局路由守卫 - 仅在首次进入时验证 token
 * 1. 首次访问时（非登录页）：验证 token 是否有效
 *    - token 有效：跳转到 dashboard
 *    - token 无效或不存在：跳转到登录页
 * 2. 后续导航：仅检查 token 是否存在，不调用 API
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 如果访问登录页，直接放行
  if (to.path === '/login') {
    next()
    return
  }

  // 如果没有 token，重定向到登录页
  if (!authStore.isAuthenticated()) {
    next('/login')
    return
  }

  // 首次进入网站时验证 token
  if (!hasCheckedToken) {
    try {
      const response = await checkToken(authStore.token)
      const isValid = response.data?.isValid === true

      if (isValid) {
        hasCheckedToken = true
        // token 有效，跳转到 dashboard（如果当前访问的是根路径）
        if (to.path === '/') {
          next('/dashboard')
        } else {
          next()
        }
      } else {
        // token 过期，清除并跳转到登录页
        authStore.clearToken()
        next('/login')
      }
    } catch {
      // 验证失败，清除 token 并跳转到登录页
      authStore.clearToken()
      next('/login')
    }
  } else {
    // 已验证过 token，直接放行
    next()
  }
})

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} · hosting-admin`
  } else {
    document.title = 'hosting-admin'
  }
})

export default router
