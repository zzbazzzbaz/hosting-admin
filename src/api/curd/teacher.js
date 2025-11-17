import request from '@/utils/request'


// ========== 数据适配器（防腐层）==========

/**
 * 标准化新增教师响应数据
 */
function adaptAddTeacherResponse(response) {
    if (!response) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
    }
}

/**
 * 标准化更新教师响应数据
 */
function adaptUpdateTeacherResponse(response) {
    if (!response) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
    }
}

/**
 * 标准化教师分页列表响应数据
 * 扁平化 campus 字段，方便前端直接使用
 *
 * @param {Object} response - 接口原始响应
 * @returns {Object} 扁平化后的响应
 */
function adaptTeacherPageListResponse(response) {
    if (!response || !response.data) {
        return response
    }

    const flattenedRows = (response.data.rows || []).map(teacher => {
        const campusId = teacher.campus?.id ?? null
        const dicName = teacher.campus?.dicName ?? null
        const {campus, ...restTeacher} = teacher

        return {
            ...restTeacher,
            campusId,
            dicName
        }
    })

    return {
        code: response.code,
        message: response.message,
        data: {
            total: response.data.total,
            pages: response.data.pages,
            list: flattenedRows
        }
    }
}

/**
 * 标准化删除教师响应数据
 */
function adaptDeleteTeacherResponse(response) {
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
 * 获取教师分页列表
 *
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.teacherName] - 教师姓名（模糊查询）
 * @param {string} [params.phone] - 手机号（模糊查询）
 * @param {number} [params.campusId] - 校区 ID（精确查询）
 * @returns {Promise<Object>} 教师分页列表
 *
 * @example
 * getTeacherPageList({
 *   page: 1,
 *   pageSize: 10,
 *   teacherName: '张三',
 *   phone: '138',
 *   campusId: 29
 * })
 */
export const getTeacherPageList = async (params = {}) => {
    const requestParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 10
    }

    if (params.teacherName) {
        requestParams.teacherName = params.teacherName
    }
    if (params.phone) {
        requestParams.phone = params.phone
    }
    if (params.campusId) {
        requestParams['campus.id'] = params.campusId
    }

    const response = await request({
        url: '/admin/teacher/pageList',
        method: 'get',
        params: requestParams
    })

    return adaptTeacherPageListResponse(response)
}

/**
 * 新增教师
 */
export const addTeacher = async (data) => {
    const response = await request({
        url: '/admin/teacher/add',
        method: 'post',
        params: {
            teacherName: data.teacherName,
            phone: data.phone
        }
    })

    return adaptAddTeacherResponse(response)
}

/**
 * 更新教师信息
 */
export const updateTeacher = async (data) => {
    const response = await request({
        url: `/admin/teacher/update/${data.id}`,
        method: 'put',
        params: {
            teacherName: data.teacherName,
            phone: data.phone,
            'campus.id': data.campusId
        }
    })

    return adaptUpdateTeacherResponse(response)
}

/**
 * 删除教师
 */
export const deleteTeacher = async (ids) => {
    let idsStr
    if (Array.isArray(ids)) {
        idsStr = ids.join(',')
    } else {
        idsStr = String(ids)
    }

    const response = await request({
        url: `/admin/teacher/deletes/${idsStr}`,
        method: 'delete'
    })

    return adaptDeleteTeacherResponse(response)
}

/**
 * 重置教师密码
 */
export const resetTeacherPassword = async (teacherId) => {
    const response = await request({
        url: '/admin/teacher/resetPassword',
        method: 'post',
        params: {
            teacherId
        }
    })

    return adaptResetPasswordResponse(response)
}
