import request from '@/utils/request'

// ========== 数据适配器 ==========

/**
 * 适配成绩分页列表响应数据
 */
function adaptScorePageListResponse(response) {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []

  const flattenedRows = rows.map((record) => {
    const student = record.student || {}
    const parent = student.parent || {}
    const school = student.school || {}
    const grade = student.grade || {}
    const campus = student.campus || {}
    const clazz = student.clazz || {}
    const teacher = student.teacher || {}
    const exam = record.exam || {}

    return {
      ...record,
      name: record.name ?? record.examName ?? exam.name ?? null,
      studentId: record.studentId ?? student.id ?? null,
      studentName: record.studentName ?? student.studentName ?? null,
      parentId: record.parentId ?? parent.id ?? null,
      parentName: record.parentName ?? parent.parentName ?? null,
      parentPhone: record.parentPhone ?? parent.phone ?? null,
      schoolId: record.schoolId ?? school.id ?? null,
      schoolName: record.schoolName ?? school.dicName ?? school.name ?? null,
      gradeId: record.gradeId ?? grade.id ?? null,
      gradeName: record.gradeName ?? grade.dicName ?? null,
      campusId: record.campusId ?? campus.id ?? null,
      campusName: record.campusName ?? campus.dicName ?? null,
      clazzId: record.clazzId ?? clazz.id ?? null,
      clazzName: record.clazzName ?? clazz.dicName ?? null,
      teacherId: record.teacherId ?? teacher.id ?? null,
      teacherName: record.teacherName ?? teacher.teacherName ?? null,
      teacherPhone: record.teacherPhone ?? teacher.phone ?? null,
    }
  })

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total ?? flattenedRows.length,
      pages: response.data.pages ?? 1,
      list: flattenedRows,
    },
  }
}

// ========== API 接口 ==========

/**
 * 获取成绩分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.studentName] - 学生姓名（模糊查询）
 * @param {number} [params.schoolId] - 学校 ID
 * @param {number} [params.parentId] - 家长 ID
 * @param {number} [params.gradeId] - 年级 ID
 * @param {number} [params.clazzId] - 班级 ID
 * @param {number} [params.campusId] - 校区 ID
 * @param {number} [params.teacherId] - 教师 ID
 * @param {number} [params.studentId] - 学生 ID
 */
export const getScorePageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.studentName) {
    requestParams.studentName = params.studentName
  }
  if (params.schoolId) {
    requestParams.schoolId = params.schoolId
  }
  if (params.parentId) {
    requestParams.parentId = params.parentId
  }
  if (params.gradeId) {
    requestParams.gradeId = params.gradeId
  }
  if (params.clazzId) {
    requestParams.clazzId = params.clazzId
  }
  if (params.campusId) {
    requestParams.campusId = params.campusId
  }
  if (params.teacherId) {
    requestParams.teacherId = params.teacherId
  }
  if (params.studentId) {
    requestParams['student.id'] = params.studentId
  }

  const response = await request({
    url: '/api/admin/score/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptScorePageListResponse(response)
}

/**
 * 添加成绩
 * @param {Object} data - 成绩数据
 * @param {number} data.studentId - 学生 ID
 * @param {string} data.name - 考试名称
 * @param {number} [data.chineseScore] - 语文成绩
 * @param {number} [data.mathScore] - 数学成绩
 * @param {number} [data.englishScore] - 英语成绩
 * @param {number} [data.physicsScore] - 物理成绩
 * @param {number} [data.chemistryScore] - 化学成绩
 * @param {number} [data.organismScore] - 生物成绩
 * @param {number} [data.historyScore] - 历史成绩
 * @param {number} [data.politicsScore] - 政治成绩
 * @param {number} [data.geographyScore] - 地理成绩
 * @param {string} [data.description] - 备注
 * @param {string} data.yearmonth - 年月 (格式: yyyy-MM)
 */
export const addScore = (data) => {
  return request({
    url: '/api/admin/score/add',
    method: 'post',
    params: {
      'student.id': data.studentId,
      name: data.name,
      chineseScore: data.chineseScore,
      mathScore: data.mathScore,
      englishScore: data.englishScore,
      physicsScore: data.physicsScore,
      chemistryScore: data.chemistryScore,
      organismScore: data.organismScore,
      historyScore: data.historyScore,
      politicsScore: data.politicsScore,
      geographyScore: data.geographyScore,
      description: data.description,
      yearmonth: data.yearmonth,
    },
  })
}

/**
 * 更新成绩
 * @param {number} id - 成绩记录 ID
 * @param {Object} data - 成绩数据
 * @param {string} [data.name] - 考试名称
 */
export const updateScore = (id, data) => {
  return request({
    url: `/api/admin/score/update/${id}`,
    method: 'put',
    params: {
      name: data.name,
      chineseScore: data.chineseScore,
      mathScore: data.mathScore,
      englishScore: data.englishScore,
      physicsScore: data.physicsScore,
      chemistryScore: data.chemistryScore,
      organismScore: data.organismScore,
      historyScore: data.historyScore,
      politicsScore: data.politicsScore,
      geographyScore: data.geographyScore,
      description: data.description,
      yearmonth: data.yearmonth,
    },
  })
}

/**
 * 删除成绩记录
 * @param {string} ids - 成绩记录 ID（多个用逗号分隔）
 */
export const deleteScore = (ids) => {
  return request({
    url: `/api/admin/score/deletes/${ids}`,
    method: 'delete',
  })
}
