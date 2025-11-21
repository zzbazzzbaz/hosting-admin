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
      {
        key: 'users-teacher-directory',
        label: '教师目录',
        icon: User,
        children: [
          { key: 'teachers-manage', label: '教师管理', path: '/teachers/manage' },
          { key: 'teachers-level', label: '教师评级管理', path: '/teachers/levels' },
        ],
      },
      { key: 'users-parents', label: '家长管理', path: '/users/parents' },
      { key: 'users-students', label: '学生管理', path: '/users/students' },
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
    component: () => import('@/views/users/UserManagement.vue'),
    meta: { title: '用户管理', menuKey: 'users-manage', parentKey: 'users' },
  },
  {
    path: 'users/parents',
    name: 'ParentManagement',
    component: () => import('@/views/parents/ParentManagement.vue'),
    meta: { title: '家长管理', menuKey: 'users-parents', parentKey: 'users' },
  },
  {
    path: 'users/students',
    name: 'StudentManagement',
    component: () => import('@/views/students/StudentManagement.vue'),
    meta: { title: '学生管理', menuKey: 'users-students', parentKey: 'users' },
  },
  {
    path: 'teachers/manage',
    name: 'TeacherManagement',
    component: () => import('@/views/teachers/TeacherManagement.vue'),
    meta: {
      title: '教师管理',
      menuKey: 'teachers-manage',
      parentKey: 'users-teacher-directory',
      grandParentKey: 'users',
    },
  },
  {
    path: 'teachers/levels',
    name: 'TeacherLevelManagement',
    component: () => import('@/views/teachers/TeacherLevelManagement.vue'),
    meta: {
      title: '教师评级管理',
      menuKey: 'teachers-level',
      parentKey: 'users-teacher-directory',
      grandParentKey: 'users',
    },
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
      redirect: '/login',
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

/**
 * 全局路由守卫 - 验证用户登录状态和 token 有效性
 * 在每次路由跳转前执行以下检查：
 * 1. 检查目标路由是否为登录页，如果是则直接放行
 * 2. 检查是否存在 token，如果不存在则重定向到登录页
 * 3. 调用 checkToken API 验证 token 是否过期
 * 4. 如果 token 过期则清除本地 token 并重定向到登录页
 * 5. 验证通过则放行
 */
router.beforeEach(async (to, from, next) => {
  console.log('路由守卫触发 - 从:', from.path, '到:', to.path)
  const authStore = useAuthStore()

  // 如果访问的是登录页，直接放行
  if (to.path === '/login') {
    console.log('目标是登录页，直接放行')
    next()
    return
  }

  // 检查是否存在 token
  console.log('检查 token 是否存在')
  console.log('authStore.token:', authStore.token)
  console.log('isAuthenticated:', authStore.isAuthenticated())

  if (!authStore.isAuthenticated()) {
    // token 不存在，重定向到登录页
    console.log('Token 不存在，重定向到登录页')
    next('/login')
    return
  }

  try {
    // 调用接口验证 token 是否过期（返回标准化后的数据）
    console.log('开始验证 token 有效性:', authStore.token)
    const response = await checkToken(authStore.token)
    console.log('Token 验证响应（标准化后）:', response)
    console.log('response.data:', response.data)

    // 🔹 使用标准化后的字段名 isValid（不再依赖后端具体返回格式）
    const isValid = response.data?.isValid === true
    console.log('Token 是否有效:', isValid)

    if (isValid) {
      // token 有效，放行
      console.log('Token 有效，放行到:', to.path)
      next()
    } else {
      // token 已过期，清除本地存储并重定向到登录页
      console.log('Token 已过期，清除并重定向到登录页')
      authStore.clearToken()
      next('/login')
    }
  } catch (error) {
    // 接口调用失败，清除 token 并重定向到登录页
    console.error('Token 验证失败:', error)
    console.error('错误详情:', error.response || error.message)
    authStore.clearToken()
    next('/login')
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
