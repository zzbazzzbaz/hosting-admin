import request from '@/utils/request'

/**
 * 用户认证相关 API
 */

// ========== 数据适配器（防腐层）==========

/**
 * 标准化登录响应数据
 * @param {Object} response - 后端原始响应
 * @returns {Object} 标准化后的数据
 * @description 将后端数据格式转换为前端统一格式，当后端字段变化时只需修改此处
 */
function adaptLoginResponse(response) {
    if (!response || !response.data) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
        data: {
            // 标准化字段名：前端统一使用这些字段名
            authToken: response.data.token,
            userId: response.data.userId,
            phone: response.data.phone
        }
    }
}

/**
 * 标准化 token 验证响应数据
 * @param {Object} response - 后端原始响应
 * @returns {Object} 标准化后的数据
 */
function adaptTokenCheckResponse(response) {
    console.log(response)

    return {
        code: response.code,
        message: response.message || '',
        data: {
            isValid: response.data.isValid === true,
        }
    }
}

/**
 * 用户登录
 *
 * 请求示例：
 * login({
 *   phone: "15688463267",
 *   password: "463267",
 *   type: 1
 * })
 */
export const login = async (data) => {
    const response = await request({
        url: '/front/user/login',
        method: 'post',
        data: {
            phone: data.phone,
            password: data.password,
            type: data.type || 1
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptLoginResponse(response)
}

/**
 * 验证 token 是否过期
 */
export const checkToken = async (token) => {
    const response = await request({
        url: '/front/user/checkToken',
        method: 'post',
        data: {
            token: token
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptTokenCheckResponse(response)
}

/**
 * 退出登录
 * @returns {Promise} 返回退出登录结果
 * @example
 * 请求示例：
 * logOut()
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "退出成功",
 *   data: null
 * }
 */
export const logOut = () => {
    return request({
        url: '/front/user/logOut',
        method: 'get'
    })
}

