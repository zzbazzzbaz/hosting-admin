import request from '@/utils/request'

/**
 * 用户管理相关 API
 */

// ========== 数据适配器（防腐层）==========

// 标准化分页列表响应数据，扁平化 campus
function adaptPageListResponse(response) {
  if (!response || !response.data) {
    return response
  }

  // 扁平化处理每个用户对象
  const flattenedList = (response.data.rows || []).map((user) => {
    // 提取 campus 对象的字段到顶层
    const { campus, ...restUser } = user
    const campusId = campus?.id || null
    const dicName = campus?.dicName || null

    // 返回扁平化后的用户对象（移除原始 campus 对象）
    return {
      ...restUser,
      campusId, // 校区 ID
      dicName, // 校区名称
    }
  })

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total,
      pages: response.data.pages,
      list: flattenedList,
    },
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
  return await request({
    url: '/admin/user/add',
    method: 'post',
    params: {
      phone: data.phone,
      userName: data.userName,
    },
  })
}

/**
 * 获取用户分页列表
 *
 * @param {Object} params - 分页和筛选参数
 * @param {number} params.page - 当前页码（默认 1）
 * @param {number} params.pageSize - 每页条数（默认 10）
 * @param {string} [params.userName] - 用户名（模糊查询）
 * @param {string} [params.phone] - 手机号（模糊查询）
 * @param {number} [params.campusId] - 校区 ID（精确查询）
 * @returns {Promise} 返回用户分页列表
 *
 * @example
 * 请求示例：
 * getUserPageList({
 *   page: 1,
 *   pageSize: 10,
 *   userName: "张三",
 *   phone: "156",
 *   campusId: 29
 * })
 *
 * 实际请求：
 * GET /admin/user/pageList?page=1&pageSize=10&userName=张三&phone=156&campus.id=29
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
 *         id: 4,
 *         userName: "cc1111",
 *         phone: "15688463200",
 *         status: 0,
 *         createTime: "2025-11-17T05:28:48.299+00:00",
 *         campusId: 29,            // 校区 ID（已扁平化）
 *         dicName: "托管校区1"      // 校区名称（已扁平化）
 *       }
 *     ]
 *   }
 * }
 */
export const getUserPageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  // 添加可选的筛选参数
  if (params.userName) {
    requestParams.userName = params.userName
  }
  if (params.phone) {
    requestParams.phone = params.phone
  }
  if (params.campusId) {
    requestParams['campus.id'] = params.campusId // 后端期望的参数名
  }

  const response = await request({
    url: '/admin/user/pageList',
    method: 'get',
    params: requestParams,
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
 * @param {number} [data.campusId] - 所在校区 ID（可选，提交时会转换为 campus.id）
 * @returns {Promise} 返回更新用户结果
 *
 * @example
 * 请求示例：
 * updateUser({
 *   id: 1,
 *   userName: "张三",
 *   phone: "15688463267",
 *   campusId: 29
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
  return await request({
    url: `/admin/user/update/${data.id}`,
    method: 'put',
    params: {
      userName: data.userName,
      phone: data.phone,
      'campus.id': data.campusId,
    },
  })
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
 *
 * 请求示例 2（多个 ID - 字符串）：
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

  return await request({
    url: `/admin/user/deletes/${idsStr}`, // 修改为 deletes 匹配后端路径
    method: 'delete',
  })
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
  return await request({
    url: '/admin/user/resetPassword',
    method: 'post',
    params: {
      userId: userId,
    },
  })
}
