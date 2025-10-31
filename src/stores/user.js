import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useUserStore = defineStore('user', () => {
  const profile = reactive({
    name: '系统管理员',
    role: '管理员',
    mobile: '13800000000',
  })

  const setProfile = (payload) => {
    Object.assign(profile, payload)
  }

  return {
    profile,
    setProfile,
  }
})
