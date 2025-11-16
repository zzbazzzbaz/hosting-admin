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

/**
 * 标准化分页列表响应数据
 * @param {Object} response - 后端原始响应
 * @returns {Object} 标准化后的数据
 * @description 将后端分页数据格式转换为前端统一格式
 */
function adaptPageListResponse(response) {
    if (!response || !response.data) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
        data: {
            total: response.data.total,
            pages: response.data.pages,
            list: response.data.rows || []
        }
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

/**
 * 获取用户分页列表
 *
 * @param {Object} params - 分页参数
 * @param {number} params.page - 当前页码（默认 1）
 * @param {number} params.pageSize - 每页条数（默认 10）
 * @returns {Promise} 返回用户分页列表
 *
 * @example
 * 请求示例：
 * getUserPageList({
 *   page: 1,
 *   pageSize: 10
 * })
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "成功获取数据",
 *   data: {
 *     total: 2,
 *     pages: 1,
 *     list: [
 *       {
 *         id: 2,
 *         userName: "gqt",
 *         phone: "15688463267",
 *         status: 0,
 *         createTime: "2025-11-16T06:57:03.825+00:00",
 *         campus: null
 *       }
 *     ]
 *   }
 * }
 */
export const getUserPageList = async (params = {}) => {
    const response = await request({
        url: '/admin/user/pageList',
        method: 'get',
        params: {
            page: params.page || 1,
            pageSize: params.pageSize || 10
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptPageListResponse(response)
}

