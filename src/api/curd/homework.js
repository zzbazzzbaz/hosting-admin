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
      const rawPath = typeof item === 'string'
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
    requestParams['teacherId'] = params.teacherId
  }
  if (params.parentId) {
    requestParams['parentId'] = params.parentId
  }
  if (params.studentName) {
    requestParams.studentName = params.studentName
  }
  if (params.schoolId) {
    requestParams['schoolId'] = params.schoolId
  }
  if (params.subjectId) {
    requestParams['subjectId'] = params.subjectId
  }
  if (params.gradeId) {
    requestParams['gradeId'] = params.gradeId
  }
  if (params.campusId) {
    requestParams['campusId'] = params.campusId
  }
  if (params.clazzId) {
    requestParams['clazzId'] = params.clazzId
  }
  if (params.state !== undefined && params.state !== null && params.state !== '') {
    requestParams.state = params.state
  }

  const response = await request({
    url: '/admin/homework/pageList',
    method: 'get',
    params: requestParams,
  })

  return adaptHomeworkPageListResponse(response)
}
