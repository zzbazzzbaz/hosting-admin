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

const normalizeImageList = (list, recordId, prefix) => {
  if (!list) return []
  const arr = Array.isArray(list) ? list : typeof list === 'string' ? [list] : []
  return arr
    .map((item, index) => {
      if (!item) return null
      const imgObj = typeof item === 'object' ? { ...item } : {}
      const rawPath =
        typeof item === 'string'
          ? item
          : imgObj.imgpath || imgObj.imgPath || imgObj.url || imgObj.path || ''

      if (!rawPath) return null

      return {
        ...imgObj,
        id: imgObj.id ?? `${recordId || prefix}-${index}`,
        url: resolveFileUrl(rawPath),
      }
    })
    .filter(Boolean)
}

const adaptHomeworkPageListResponse = (response) => {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []

  const normalizedRows = rows.map((record, index) => {
    const teacher = record.teacher || {}
    const parent = record.parent || {}
    const school = record.school || {}
    const grade = record.grade || {}
    const subject = record.subject || {}
    const campus = record.campus || {}
    const clazz = record.clazz || {}
    const student = record.student || {}

    return {
      ...record,
      id: record.id ?? `homework-${index}`,
      teacherId: record.teacherId ?? teacher.id ?? null,
      teacherName: record.teacherName ?? teacher.teacherName ?? null,
      teacherPhone: teacher.phone ?? null,
      parentId: record.parentId ?? parent.id ?? null,
      parentName: record.parentName ?? parent.parentName ?? null,
      parentPhone: parent.phone ?? null,
      schoolId: record.schoolId ?? school.id ?? null,
      schoolName: record.schoolName ?? school.dicName ?? null,
      gradeId: record.gradeId ?? grade.id ?? null,
      gradeName: record.gradeName ?? grade.dicName ?? null,
      subjectId: record.subjectId ?? subject.id ?? null,
      subjectName: record.subjectName ?? subject.dicName ?? null,
      campusId: record.campusId ?? campus.id ?? null,
      campusName: record.campusName ?? campus.dicName ?? null,
      clazzId: record.clazzId ?? clazz.id ?? null,
      clazzName: record.clazzName ?? clazz.dicName ?? null,
      studentId: record.studentId ?? student.id ?? null,
      studentName: record.studentName ?? student.studentName ?? null,
      workPicList: normalizeImageList(record.workpicList, record.id, 'work'),
      finishPicList: normalizeImageList(record.finishpicList, record.id, 'finish'),
      state: Number(record.state ?? record.workState ?? 0),
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

export const getHomeworkPageList = async (params = {}) => {
  const requestParams = {
    page: params.page || 1,
    pageSize: params.pageSize || 10,
  }

  if (params.teacherId) {
    requestParams['teacher.id'] = params.teacherId
  }
  if (params.parentId) {
    requestParams['parent.id'] = params.parentId
  }
  if (params.studentName) {
    requestParams.studentName = params.studentName
  }
  if (params.schoolId) {
    requestParams['school.id'] = params.schoolId
  }
  if (params.subjectId) {
    requestParams['subject.id'] = params.subjectId
  }
  if (params.gradeId) {
    requestParams['grade.id'] = params.gradeId
  }
  if (params.campusId) {
    requestParams['campus.id'] = params.campusId
  }
  if (params.clazzId) {
    requestParams['clazz.id'] = params.clazzId
  }
  if (params.state !== undefined && params.state !== null && params.state !== '') {
    requestParams.state = params.state
  }

  const response = await request({
    url: '/api/admin/homework/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptHomeworkPageListResponse(response)
}

const adaptHomeworkStudentStatsResponse = (response) => {
  if (!response || !response.data) {
    return response
  }

  const rows = response.data.rows || response.data.list || []

  const normalizedRows = rows.map((record, index) => ({
    ...record,
    id: record.id ?? `homework-stat-${index}`,
    studentName: record.studentName ?? record.student?.studentName ?? null,
    teacherName: record.teacherName ?? record.teacher?.teacherName ?? null,
    parentName: record.parentName ?? record.parent?.parentName ?? null,
    schoolName: record.schoolName ?? record.school?.dicName ?? null,
    gradeName: record.gradeName ?? record.grade?.dicName ?? null,
    clazzName: record.clazzName ?? record.clazz?.dicName ?? null,
    campusName: record.campusName ?? record.campus?.dicName ?? null,
    finishCount: Number(record.finishCount ?? 0),
    nofinishCount: Number(record.nofinishCount ?? 0),
    sumCount: Number(record.sumCount ?? 0),
  }))

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

export const getHomeworkStudentStatsPageList = async (params = {}) => {
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
  if (params.parentId) {
    requestParams['parent.id'] = params.parentId
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
  if (params.teacherId) {
    requestParams['teacher.id'] = params.teacherId
  }

  const response = await request({
    url: '/api/admin/homework/pageStudentList',
    method: 'get',
    params: requestParams,
  })

  return adaptHomeworkStudentStatsResponse(response)
}
