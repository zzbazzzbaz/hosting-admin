import request from '@/utils/request'

/**
 * 用户管理相关 API
 */

// ========== 数据适配器（防腐层）==========

/**
 * 标准化新增用户响应数据
 * @param {Object} response - 后端原始响应
 * @returns {Object} 标准化后的数据
 * @description 将后端数据格式转换为前端统一格式，当后端字段变化时只需修改此处
 */
function adaptAddUserResponse(response) {
    if (!response) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
    }
}

// ========== API 接口 ==========

/**
 * 新增用户
 *
 * @param {Object} data - 用户数据
 * @param {string} data.phone - 用户手机号（必传）
 * @param {string} [data.userName] - 用户名（可选）
 * @returns {Promise} 返回新增用户结果
 *
 * @example
 * 请求示例：
 * addUser({
 *   phone: "15688463267",
 *   userName: "张三"
 * })
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "新增成功",
 *   data: null
 * }
 */
export const addUser = async (data) => {
    const response = await request({
        url: '/admin/user/add',
        method: 'post',
        data: {
            phone: data.phone,
            userName: data.userName
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptAddUserResponse(response)
}
