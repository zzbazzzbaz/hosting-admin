import {defineStore} from 'pinia'
import {ref} from 'vue'

/**
 * 认证状态管理 Store
 * 用于管理用户的登录令牌和认证状态
 */
export const useAuthStore = defineStore('auth', () => {
    // 从 localStorage 读取已保存的 token
    const token = ref(localStorage.getItem('token') || '')

    /**
     * 设置登录令牌
     * @param {string} newToken - 新的访问令牌
     */
    const setToken = (newToken) => {
        token.value = newToken
        // 持久化到本地存储
        localStorage.setItem('token', newToken)
    }

    /**
     * 清除登录令牌
     * 用于用户退出登录时清空认证信息
     */
    const clearToken = () => {
        token.value = ''
        localStorage.removeItem('token')
    }

    /**
     * 检查是否已登录
     * @returns {boolean} 是否存在有效的 token
     */
    const isAuthenticated = () => {
        return !!token.value
    }

    return {
        token,
        setToken,
        clearToken,
        isAuthenticated
    }
})
