import request from '@/utils/request'

// ========== 数据适配器 ==========

function adaptParentPageListResponse(response) {
    if (!response || !response.data) {
        return response
    }

    const list = response.data.rows || []

    return {
        code: response.code,
        message: response.message,
        data: {
            total: response.data.total,
            pages: response.data.pages,
            list
        }
    }
}

// ========== API 接口 ==========

export const getParentPageList = async (params = {}) => {
    const requestParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 10
    }

    if (params.parentName) {
        requestParams.parentName = params.parentName
    }
    if (params.phone) {
        requestParams.phone = params.phone
    }

    const response = await request({
        url: '/admin/parent/pageList',
        method: 'get',
        params: requestParams
    })

    return adaptParentPageListResponse(response)
}

export const addParent = async (data) => {
    return request({
        url: '/admin/parent/add',
        method: 'post',
        params: {
            parentName: data.parentName,
            phone: data.phone
        }
    })
}

export const updateParent = async (data) => {
    return request({
        url: `/admin/parent/update/${data.id}`,
        method: 'put',
        params: {
            parentName: data.parentName,
            phone: data.phone
        }
    })
}

export const deleteParent = async (ids) => {
    let idsStr
    if (Array.isArray(ids)) {
        idsStr = ids.join(',')
    } else {
        idsStr = String(ids)
    }

    return request({
        url: `/admin/parent/deletes/${idsStr}`,
        method: 'delete'
    })
}

export const resetParentPassword = async (parentId) => {
    return request({
        url: '/admin/parent/resetPassword',
        method: 'post',
        params: {
            parentId
        }
    })
}
