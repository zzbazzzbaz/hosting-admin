import {useUserStore} from "@/stores/user.js";

/**
 * 获取当前用户Id
 * @returns {number}
 */
const getUserId = () => {
    const userStore = useUserStore()
    const id = userStore?.profile?.userId ?? null
    if (id === null || id === undefined || id === '') {
        console.log('缺少当前用户ID')
        throw new Error('缺少当前用户ID')
    }
    const parsed = Number(id)
    return Number.isNaN(parsed) ? id : parsed
}

export {
    getUserId,
}