import { Collection, House, Notebook, Timer, UserFilled } from '@element-plus/icons-vue'
import { createRouter, createWebHistory } from 'vue-router'

import AdminLayout from '@/layouts/AdminLayout.vue'

export const navigationMenus = [
  {
    key: 'dashboard',
    label: '主页',
    icon: House,
    path: '/dashboard',
  },
  {
    key: 'users',
    label: '用户',
    icon: UserFilled,
    children: [
      { key: 'users-manage', label: '用户管理', path: '/users/manage' },
      { key: 'users-teachers', label: '教师管理', path: '/users/teachers' },
      { key: 'users-students', label: '学生管理', path: '/users/students' },
    ],
  },
  {
    key: 'attendance',
    label: '签到',
    icon: Timer,
    children: [{ key: 'attendance-manage', label: '签到管理', path: '/attendance/manage' }],
  },
  {
    key: 'homework',
    label: '作业',
    icon: Notebook,
    children: [{ key: 'homework-manage', label: '作业管理', path: '/homework/manage' }],
  },
  {
    key: 'dictionary',
    label: '字典',
    icon: Collection,
    children: [
      { key: 'dictionary-schools', label: '学校字典', path: '/dictionary/schools' },
      { key: 'dictionary-subjects', label: '科目字典', path: '/dictionary/subjects' },
    ],
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
    path: 'users/teachers',
    name: 'TeacherManagement',
    component: () => import('@/views/teachers/TeacherManagement.vue'),
    meta: { title: '教师管理', menuKey: 'users-teachers', parentKey: 'users' },
  },
  {
    path: 'users/students',
    name: 'StudentManagement',
    component: () => import('@/views/students/StudentManagement.vue'),
    meta: { title: '学生管理', menuKey: 'users-students', parentKey: 'users' },
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
    path: 'dictionary/schools',
    name: 'SchoolDictionary',
    component: () => import('@/views/dictionary/SchoolDictionary.vue'),
    meta: { title: '学校字典', menuKey: 'dictionary-schools', parentKey: 'dictionary' },
  },
  {
    path: 'dictionary/subjects',
    name: 'SubjectDictionary',
    component: () => import('@/views/dictionary/SubjectDictionary.vue'),
    meta: { title: '科目字典', menuKey: 'dictionary-subjects', parentKey: 'dictionary' },
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

router.afterEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} · hosting-admin`
  } else {
    document.title = 'hosting-admin'
  }
})

export default router
