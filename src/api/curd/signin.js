import request from '@/utils/request'

const rawFileBase = import.meta.env.VITE_STATIC_RESOURCES || ''
const normalizedFileBase = rawFileBase ? rawFileBase.replace(/\/$/, '') : ''

const resolveFileUrl = (path) => {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedFileBase ? `${normalizedFileBase}${normalizedPath}` : normalizedPath
}

const normalizePicList = (picList = [], recordId) => {
  if (!Array.isArray(picList)) return []

  return picList
    .map((pic, index) => {
      const picObj = typeof pic === 'object' ? { ...pic } : {}
      const rawPath =
        typeof pic === 'string'
          ? pic
          : picObj.imgpath || picObj.imgPath || picObj.url || picObj.path || ''

      if (!rawPath) return null

      return {
        ...picObj,
        id: picObj.id ?? `${recordId ?? 'pic'}-${index}`,
        imgpath: resolveFileUrl(rawPath),
      }
    })
    .filter(Boolean)
}

// ========== 数据适配器 ==========

function adaptSigninPageListResponse(response) {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []

  const flattenedRows = rows.map((record, index) => {
    const student = record.student || {}
    const parent = student.parent || {}
    const school = student.school || {}
    const grade = student.grade || {}
    const campus = student.campus || {}
    const clazz = student.clazz || {}
    const assignedTeacher = student.teacher || {}
    const checkinTeacher = record.teacher || {}

    return {
      ...record,
      studentId: record.studentId ?? student.id ?? null,
      studentName: record.studentName ?? student.studentName ?? null,
      studentSumHours: record.studentSumHours ?? student.sumHours ?? null,
      studentUsedHours: record.studentUsedHours ?? student.usedHours ?? null,
      studentRemainingHours: record.studentRemainingHours ?? student.remainingHours ?? null,
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
      assignedTeacherId: record.assignedTeacherId ?? assignedTeacher.id ?? null,
      assignedTeacherName: record.assignedTeacherName ?? assignedTeacher.teacherName ?? null,
      assignedTeacherPhone: record.assignedTeacherPhone ?? assignedTeacher.phone ?? null,
      checkinTeacherId: record.checkinTeacherId ?? record.teacherId ?? checkinTeacher.id ?? null,
      checkinTeacherName:
        record.checkinTeacherName ?? record.teacherName ?? checkinTeacher.teacherName ?? null,
      checkinTeacherPhone:
        record.checkinTeacherPhone ?? record.teacherPhone ?? checkinTeacher.phone ?? null,
      picList: normalizePicList(record.picList, record.id ?? `row-${index}`),
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

function adaptStudentSigninSummaryResponse(response) {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []

  const normalizedRows = rows.map((record, index) => {
    const student = record.student || {}
    const school = record.school || student.school || {}
    const grade = record.grade || student.grade || {}
    const clazz = record.clazz || student.clazz || {}
    const campus = record.campus || student.campus || {}
    const parent = record.parent || student.parent || {}
    const teacher = record.teacher || student.teacher || {}

    return {
      ...record,
      id: record.id ?? student.id ?? `signin-stat-${index}`,
      studentId: record.studentId ?? student.id ?? null,
      studentName: record.studentName ?? student.studentName ?? null,
      schoolId: record.schoolId ?? school.id ?? null,
      schoolName: record.schoolName ?? school.dicName ?? school.name ?? null,
      gradeId: record.gradeId ?? grade.id ?? null,
      gradeName: record.gradeName ?? grade.dicName ?? null,
      clazzId: record.clazzId ?? clazz.id ?? null,
      clazzName: record.clazzName ?? clazz.dicName ?? null,
      campusId: record.campusId ?? campus.id ?? null,
      campusName: record.campusName ?? campus.dicName ?? null,
      parentId: record.parentId ?? parent.id ?? null,
      parentName: record.parentName ?? parent.parentName ?? null,
      parentPhone: record.parentPhone ?? parent.phone ?? null,
      teacherId: record.teacherId ?? teacher.id ?? null,
      teacherName: record.teacherName ?? teacher.teacherName ?? null,
      teacherPhone: record.teacherPhone ?? teacher.phone ?? null,
      signinCount: Number(record.signinCount ?? record.count ?? 0),
    }
  })

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total ?? normalizedRows.length,
      pages: response.data.pages ?? 1,
      list: normalizedRows,
    },
  }
}

// ========== API 接口 ==========

/**
 * 获取签到分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页
 * @param {number} params.pageSize - 每页数量
 * @param {number} [params.studentId] - 学生 ID（精确）
 * @param {string} [params.studentName] - 学生姓名（模糊查询）
 * @param {number} [params.teacherId] - 签到教师 ID（精确）
 * @param {number} [params.parentId] - 家长 ID（精确）
 * @param {string} [params.createTime] - 签到日期（格式：YYYY-MM-DD）
 */
export const getSigninPageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.studentId) {
    requestParams['student.id'] = params.studentId
  }
  if (params.studentName) {
    requestParams.studentName = params.studentName
  }
  if (params.teacherId) {
    requestParams['teacher.id'] = params.teacherId
  }
  if (params.parentId) {
    requestParams.parentId = params.parentId
  }
  if (params.createTime) {
    requestParams.createTime = params.createTime
  }

  const response = await request({
    url: '/api/admin/signin/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptSigninPageListResponse(response)
}

/**
 * 获取学生签到次数统计分页列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 当前页
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.studentName] - 学生姓名（模糊）
 * @param {number} [params.schoolId] - 学校 ID
 * @param {number} [params.gradeId] - 年级 ID
 * @param {number} [params.clazzId] - 班级 ID
 * @param {number} [params.campusId] - 校区 ID
 * @param {number} [params.parentId] - 家长 ID
 * @param {number} [params.teacherId] - 教师 ID
 */
export const getStudentSigninStatsPageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.studentName) {
    requestParams.studentName = params.studentName
  }
  if (params.schoolId) {
    requestParams['school.id'] = params.schoolId
  }
  if (params.gradeId) {
    requestParams['grade.id'] = params.gradeId
  }
  if (params.clazzId) {
    requestParams['clazz.id'] = params.clazzId
  }
  if (params.campusId) {
    requestParams['campus.id'] = params.campusId
  }
  if (params.parentId) {
    requestParams['parent.id'] = params.parentId
  }
  if (params.teacherId) {
    requestParams['teacher.id'] = params.teacherId
  }

  const response = await request({
    url: '/api/admin/signin/pageStudentList',
    method: 'get',
    params: requestParams,
  })

  return adaptStudentSigninSummaryResponse(response)
}
