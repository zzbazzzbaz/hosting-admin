import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

/**
 * 创建 axios 实例
 */
const request = axios.create({
  baseURL: import.meta.env?.VITE_BASE_URL,
  timeout: 15000, // 请求超时时间（15秒）
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

/**
 * 请求拦截器
 */
request.interceptors.request.use(
  (config) => {
    // 获取 auth store 实例
    const authStore = useAuthStore()

    // 如果存在 token，则在请求头中添加 Authorization
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    return config
  },
  (error) => {
    // 请求错误处理
    console.error('请求错误：', error)
    return Promise.reject(error)
  },
)

/**
 * 响应拦截器
 */
request.interceptors.response.use((response) => {
  // 获取响应数据
  const res = response.data

  // 根据后端返回的状态码进行不同的处理
  // 这里假设后端返回格式为 { code: number, data: any, message: string }
  // 请根据实际后端接口格式调整

  // 如果请求成功，直接返回数据
  if (res.code === 0 || res.code === 200 || response.status === 200) {
    return res
  }

  // 如果有错误码，显示错误消息
  ElMessage.error(res.message || '请求失败')
  return Promise.reject(new Error(res.message || '请求失败'))
})

export default request
