import request from '@/utils/request'

// ========== 数据适配器 ==========

function adaptDictionaryListResponse(response) {
  if (!response || !response.data) {
    return response
  }

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total,
      pages: response.data.pages,
      list: response.data.rows || [],
    },
  }
}

// ========== API 接口 ==========

export const getDictionaryList = async ({ page = 1, pageSize = 10, type, dicName } = {}) => {
  if (!type) {
    throw new Error('type 为必传参数')
  }

  const response = await request({
    url: `/admin/dictionary/pageList/${page}/${pageSize}`,
    method: 'get',
    params: {
      type,
      dicName,
    },
  })

  return adaptDictionaryListResponse(response)
}

export const addDictionary = async (data) => {
  return request({
    url: '/admin/dictionary/add',
    method: 'post',
    params: {
      dicName: data.dicName,
      type: data.type,
    },
  })
}

export const updateDictionary = async (data) => {
  return request({
    url: `/admin/dictionary/update/${data.id}`,
    method: 'put',
    params: {
      dicName: data.dicName,
      type: data.type,
    },
  })
}

export const deleteDictionary = async (ids) => {
  let idsStr
  if (Array.isArray(ids)) {
    idsStr = ids.join(',')
  } else {
    idsStr = String(ids)
  }

  return request({
    url: `/admin/dictionary/delete/${idsStr}`,
    method: 'delete',
  })
}

// ==== //  1:年级     2：科目     3:学校     4：校区    5：教师评级分类   6：班级   7：学生今日状态

const fetchDictionaryByType = (params, type) => {
  return getDictionaryList({
    page: params.page || 1,
    pageSize: params.pageSize || 100,
    type,
    dicName: params.dicName,
  })
}

export const getGradeList = async (params = {}) => fetchDictionaryByType(params, 1)
export const getSubjectList = async (params = {}) => fetchDictionaryByType(params, 2)
export const getSchoolList = async (params = {}) => fetchDictionaryByType(params, 3)
export const getCampusList = async (params = {}) => fetchDictionaryByType(params, 4)
export const getTeacherRatingList = async (params = {}) => fetchDictionaryByType(params, 5)
export const getClassList = async (params = {}) => fetchDictionaryByType(params, 6)
export const getStudentStatusList = async (params = {}) => fetchDictionaryByType(params, 7)

// ========== 下拉框接口 ==========

/**
 * 获取教师下拉框列表
 * @returns {Promise} 返回教师列表 [{teacherName, phone, id}]
 */
export const getTeacherComboxList = () => {
  return request({
    url: '/common/teacher/getComboxList',
    method: 'get',
  })
}

/**
 * 获取家长下拉框列表
 * @returns {Promise} 返回家长列表 [{parentName, phone, id}]
 */
export const getParentComboxList = () => {
  return request({
    url: '/common/parent/getComboxList',
    method: 'get',
  })
}

/**
 * 获取所有学生下拉框列表
 * @returns {Promise} 返回学生列表 [{studentName, id}]
 */
export const getStudentComboxList = () => {
  return request({
    url: '/common/student/getComboxList',
    method: 'get',
  })
}
