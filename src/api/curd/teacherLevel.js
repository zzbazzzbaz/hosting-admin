import request from '@/utils/request'

// ========== 数据适配器 ==========

const adaptLevelPageListResponse = (response) => {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total ?? rows.length,
      pages: response.data.pages ?? 1,
      list: rows.map((record, index) => ({
        id: record.id ?? `level-${index}`,
        teacherId: record.teacherId ?? record.teacher?.id ?? null,
        teacherName: record.teacherName ?? record.teacher?.teacherName ?? null,
        teacherPhone: record.teacherPhone ?? record.teacher?.phone ?? null,
        levelId: record.levelId ?? record.level?.id ?? null,
        level: record.level ?? record.level?.dicName ?? record.levelName ?? null,
        yearmonth: record.yearmonth ?? record.yearMonth ?? null,
        descption: record.descption ?? record.description ?? '',
        userId: record.userId ?? record.user?.id ?? null,
        userName: record.userName ?? record.user?.userName ?? null,
      })),
    },
  }
}

// ========== API 接口 ==========

/**
 * 获取教师月度评级分页列表
 */
export const getTeacherLevelPageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.yearmonth) {
    requestParams.yearmonth = params.yearmonth
  }
  if (params.levelId) {
    requestParams['level.id'] = params.levelId
  }
  if (params.teacherId) {
    requestParams['teacher.id'] = params.teacherId
  }

  const response = await request({
    url: '/admin/level/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptLevelPageListResponse(response)
}

/**
 * 更新教师评级
 */
export const updateTeacherLevel = async (data) => {
  if (!data?.id) {
    throw new Error('更新评级需要提供 id')
  }

  return request({
    url: `/admin/level/update/${data.id}`,
    method: 'put',
    params: {
      yearmonth: data.yearmonth,
      descption: data.descption,
      'level.id': data.levelId,
      'user.id': data.userId,
    },
  })
}

/**
 * 批量删除教师评级
 */
export const deleteTeacherLevels = async (ids) => {
  if (!ids || (Array.isArray(ids) && !ids.length)) {
    throw new Error('删除评级需要提供有效 id')
  }

  const idList = Array.isArray(ids) ? ids : [ids]
  const idStr = idList.join(',')

  return request({
    url: `/admin/level/deletes/${idStr}`,
    method: 'delete',
  })
}
