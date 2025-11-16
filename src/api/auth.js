import request from '@/utils/request'

/**
 * 用户认证相关 API
 */

/**
 * 用户登录
 * @param {Object} data - 登录信息
 * @param {string} data.phone - 手机号
 * @param {string} data.password - 密码
 * @param {string} data.type - 登录类型（1：普通用户登录）
 * @returns {Promise} 返回用户信息和 token
 * @example
 * 请求示例：
 * login({
 *   phone: "15688463267",
 *   password: "123456",
 *   type: "1"
 * })
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "登陆成功",
 *   data: {
 *     Authorization: "1_75deea35-7b20-420b-b87e-193388cc7fff",
 *     phone: "15688463267",
 *     userName: "admin",
 *     userId: 1
 *   }
 * }
 *
 * 响应示例（失败）：
 * {
 *   code: 202,
 *   message: "用户名或密码错误",
 *   data: null
 * }
 */
export const login = (data) => {
    return request({
        url: '/front/user/login',
        method: 'post',
        params: {phone: data.phone, password: data.password, type: 1},  // 后端要求 POST 使用 params
    })
}

/**
 * 验证 token 是否过期
 * @param {string} token - 用户的 Authorization token
 * @returns {Promise} 返回 token 是否有效
 * @example
 * 请求示例：
 * checkToken("1_75deea35-7b20-420b-b87e-193388cc7fff")
 *
 * 响应示例（未过期）：
 * {
 *   code: 200,
 *   message: "token 有效",
 *   data: true
 * }
 *
 * 响应示例（已过期）：
 * {
 *   code: 200,
 *   message: "token 已过期",
 *   data: false
 * }
 */
export const checkToken = (token) => {
    return request({
        url: '/front/user/checkToken',
        method: 'post',
        params: {token}
    })
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

