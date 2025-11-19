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

// ========== 数据适配器 ==========

function adaptSigninPageListResponse(response) {
  if (!response || !response.data) {
    return response
  }

  const flattenedRows = (response.data.rows || []).map(record => {
    const studentId = record.student?.id ?? null
    const studentName = record.student?.studentName ?? null
    const studentSumHours = record.student?.sumHours ?? null
    const studentUsedHours = record.student?.usedHours ?? null
    const studentRemainingHours = record.student?.remainingHours ?? null

    const parentId = record.student?.parent?.id ?? record.parentId ?? null
    const parentName = record.student?.parent?.parentName ?? null
    const parentPhone = record.student?.parent?.phone ?? null

    const schoolId = record.schoolId ?? record.student?.school?.id ?? null
    const schoolName = record.schoolName ?? record.student?.school?.dicName ?? null

    const gradeId = record.gradeId ?? record.student?.grade?.id ?? null
    const gradeName = record.gradeName ?? record.student?.grade?.dicName ?? null

    const campusId = record.campusId ?? record.student?.campus?.id ?? null
    const campusName = record.campusName ?? record.student?.campus?.dicName ?? null

    const clazzId = record.clazzId ?? record.student?.clazz?.id ?? null
    const clazzName = record.clazzName ?? record.student?.clazz?.dicName ?? null

    const assignedTeacherId = record.student?.teacher?.id ?? null
    const assignedTeacherName = record.student?.teacher?.teacherName ?? null
    const assignedTeacherPhone = record.student?.teacher?.phone ?? null

    const checkinTeacherId = record.teacher?.id ?? null
    const checkinTeacherName = record.teacher?.teacherName ?? null
    const checkinTeacherPhone = record.teacher?.phone ?? null

    const picList = (record.picList || []).map(pic => ({
      ...pic,
      imgpath: resolveFileUrl(pic.imgpath),
    }))

    return {
      ...record,
      studentId,
      studentName,
      studentSumHours,
      studentUsedHours,
      studentRemainingHours,
      parentId,
      parentName,
      parentPhone,
      schoolId,
      schoolName,
      gradeId,
      gradeName,
      campusId,
      campusName,
      clazzId,
      clazzName,
      assignedTeacherId,
      assignedTeacherName,
      assignedTeacherPhone,
      checkinTeacherId,
      checkinTeacherName,
      checkinTeacherPhone,
      picList,
    }
  })

  return {
    code: response.code,
    message: response.message,
    data: {
      total: response.data.total,
      pages: response.data.pages,
      list: flattenedRows,
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
 * @param {number} [params.teacherId] - 签到教师 ID（精确）
 * @param {number} [params.parentId] - 家长 ID（精确）
 */
export const getSigninPageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.studentId) {
    requestParams['student.id'] = params.studentId
  }
  if (params.teacherId) {
    requestParams['teacher.id'] = params.teacherId
  }
  if (params.parentId) {
    requestParams.parentId = params.parentId
  }

  const response = await request({
    url: '/admin/signin/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptSigninPageListResponse(response)
}
