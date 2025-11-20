import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { getUserId } from '@/utils/util.js'

const adaptNoticePageListResponse = (response) => {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []
  const list = rows.map((item, index) => ({
    ...item,
    id: item.id ?? `notice-${index}`,
    title: item.title ?? '',
    content: item.content ?? '',
    createTime: item.createTime ?? '',
    userId: item.userId ?? item.user?.id ?? null,
    userName: item.userName ?? item.user?.userName ?? '',
    status: item.status ?? item.state ?? null,
  }))

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total ?? list.length,
      pages: response.data.pages ?? 1,
      list,
    },
  }
}

export const getNoticePageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.title) {
    requestParams.title = params.title
  }

  const response = await request({
    url: '/admin/notice/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptNoticePageListResponse(response)
}

export const addNotice = async (data) => {
  return request({
    url: '/admin/notice/add',
    method: 'post',
    params: {
      title: data.title,
      content: data.content,
      userId: getUserId(),
    },
  })
}

export const updateNotice = async (data) => {
  return request({
    url: `/admin/notice/update/${data.id}`,
    method: 'put',
    params: {
      title: data.title,
      content: data.content,
      userId: getUserId(),
    },
  })
}

export const deleteNotice = async (ids) => {
  const idsStr = Array.isArray(ids) ? ids.join(',') : String(ids)

  return request({
    url: `/admin/notice/delete/${idsStr}`,
    method: 'delete',
  })
}
