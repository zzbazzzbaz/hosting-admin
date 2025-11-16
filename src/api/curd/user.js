import request from '@/utils/request'

/**
 * 用户管理相关 API
 */

// ========== 数据适配器（防腐层）==========

/**
 * 标准化新增用户响应数据
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

/**
 * 标准化更新用户响应数据
 */
function adaptUpdateUserResponse(response) {
    if (!response) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
    }
}

/**
 * 标准化删除用户响应数据
 */
function adaptDeleteUserResponse(response) {
    if (!response) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
    }
}

/**
 * 标准化重置密码响应数据
 */
function adaptResetPasswordResponse(response) {
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

/**
 * 更新用户信息
 *
 * @param {Object} data - 用户数据
 * @param {number} data.id - 用户 ID（必传）
 * @param {string} [data.userName] - 用户名（可选）
 * @param {string} [data.phone] - 用户手机号（可选）
 * @param {number} [data.status] - 用户状态（可选，0-启用，1-禁用）
 * @param {string} [data.dicName] - 所在校区名称（可选）
 * @returns {Promise} 返回更新用户结果
 *
 * @example
 * 请求示例：
 * updateUser({
 *   id: 1,
 *   userName: "张三",
 *   phone: "15688463267",
 *   status: 0,
 *   dicName: "托管校区1"
 * })
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "修改成功",
 *   data: null
 * }
 */
export const updateUser = async (data) => {
    const response = await request({
        url: `/admin/user/update/${data.id}`,
        method: 'put',
        data: {
            userName: data.userName,
            phone: data.phone,
            status: data.status,
            dicName: data.dicName
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptUpdateUserResponse(response)
}

/**
 * 删除用户
 *
 * @param {string|number|Array} ids - 用户 ID，支持单个 ID 或多个 ID
 * @returns {Promise} 返回删除用户结果
 *
 * @example
 * 请求示例 1（单个 ID）：
 * deleteUser(1)
 *
 * 请求示例 2（多个 ID - 数组）：
 * deleteUser([1, 5, 8, 9, 10])
 *
 * 请求示例 3（多个 ID - 字符串）：
 * deleteUser("1,5,8,9,10")
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "删除成功",
 *   data: null
 * }
 */
export const deleteUser = async (ids) => {
    // 处理 ids 参数：支持数组、单个 ID、字符串格式
    let idsStr
    if (Array.isArray(ids)) {
        idsStr = ids.join(',')
    } else {
        idsStr = String(ids)
    }

    const response = await request({
        url: `/admin/user/delete/${idsStr}`,
        method: 'delete'
    })

    // 🔹 使用适配器转换数据格式
    return adaptDeleteUserResponse(response)
}

/**
 * 重置用户密码
 *
 * @param {string|number} userId - 用户 ID
 * @returns {Promise} 返回重置密码结果
 *
 * @example
 * 请求示例：
 * resetPassword(1)
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "密码重置成功,新密码为手机后六位",
 *   data: null
 * }
 */
export const resetPassword = async (userId) => {
    const response = await request({
        url: '/admin/user/resetPassword',
        method: 'post',
        params: {
            userId: userId
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptResetPasswordResponse(response)
}
