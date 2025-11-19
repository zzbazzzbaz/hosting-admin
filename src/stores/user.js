import { defineStore } from 'pinia'
import { reactive } from 'vue'

const STORAGE_KEY = 'user_profile'

const getDefaultProfile = () => ({
  userId: null,
  name: '',
  mobile: '',
})

const loadPersistedProfile = () => {
  if (typeof localStorage === 'undefined') {
    return getDefaultProfile()
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return getDefaultProfile()
    const parsed = JSON.parse(stored)
    return {
      ...getDefaultProfile(),
      ...parsed,
    }
  } catch (error) {
    console.warn('解析本地用户信息失败:', error)
    return getDefaultProfile()
  }
}

const persistProfile = (profile) => {
  if (typeof localStorage === 'undefined') return
  const payload = JSON.stringify({
    userId: profile.userId,
    name: profile.name,
    mobile: profile.mobile,
  })
  localStorage.setItem(STORAGE_KEY, payload)
}

const clearPersistedProfile = () => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export const useUserStore = defineStore('user', () => {
  const profile = reactive(loadPersistedProfile())

  /**
   * 更新用户信息
   * @param {Object} userInfo - 用户信息对象
   */
  const updateProfile = (userInfo = {}) => {
    if (Object.prototype.hasOwnProperty.call(userInfo, 'userId')) {
      profile.userId = userInfo.userId
    }
    if (userInfo.userName || userInfo.name) {
      profile.name = userInfo.userName || userInfo.name || ''
    }
    if (userInfo.phone || userInfo.mobile) {
      profile.mobile = userInfo.phone || userInfo.mobile || ''
    }
    persistProfile(profile)
  }

  /**
   * 清除用户信息
   */
  const clearProfile = () => {
    const defaults = getDefaultProfile()
    Object.assign(profile, defaults)
    clearPersistedProfile()
  }

  return {
    profile,
    updateProfile,
    clearProfile,
  }
})
