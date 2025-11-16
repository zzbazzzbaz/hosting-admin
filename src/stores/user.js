import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUserStore = defineStore('user', () => {
  const profile = reactive({
    userId: null,
    name: '系统管理员',
    role: '管理员',
    mobile: '13800000000',
  })

  /**
   * 更新用户信息
   * @param {Object} userInfo - 用户信息对象
   */
  const updateProfile = (userInfo) => {
    if (userInfo.userId) profile.userId = userInfo.userId
    if (userInfo.phone) profile.mobile = userInfo.phone
  }

  /**
   * 清除用户信息
   */
  const clearProfile = () => {
    profile.userId = null
    profile.name = ''
    profile.role = ''
    profile.mobile = ''
  }

  return {
    profile,
    updateProfile,
    clearProfile
  }
})
