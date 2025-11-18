import request from '@/utils/request'

// ========== 数据适配器 ==========

function adaptStudentPageListResponse(response) {
    if (!response || !response.data) {
        return response
    }

    const flattenedRows = (response.data.rows || []).map(student => {
        const parentId = student.parent?.id ?? null
        const parentName = student.parent?.parentName ?? null
        const parentPhone = student.parent?.phone ?? null

        const schoolId = student.school?.id ?? null
        const schoolName = student.school?.dicName ?? null

        const gradeId = student.grade?.id ?? null
        const gradeName = student.grade?.dicName ?? null

        const clazzId = student.clazz?.id ?? null
        const clazzName = student.clazz?.dicName ?? null

        const campusId = student.campus?.id ?? null
        const campusName = student.campus?.dicName ?? null

        const teacherId = student.teacher?.id ?? null
        const teacherName = student.teacher?.teacherName ?? null
        const teacherPhone = student.teacher?.phone ?? null

        return {
            ...student,
            parentId,
            parentName,
            parentPhone,
            schoolId,
            schoolName,
            gradeId,
            gradeName,
            clazzId,
            clazzName,
            campusId,
            campusName,
            teacherId,
            teacherName,
            teacherPhone
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

// ========== API 接口 ==========

export const getStudentPageList = async (params = {}) => {
    const requestParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 10
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
        url: '/admin/student/pageList',
        method: 'get',
        params: requestParams
    })

    return adaptStudentPageListResponse(response)
}

export const addStudent = async (data) => {
    return request({
        url: '/admin/student/add',
        method: 'post',
        params: {
            studentName: data.studentName,
            sumHours: data.sumHours,
            usedHours: data.usedHours,
            remainingHours: data.remainingHours,
            'parent.id': data.parentId,
            'school.id': data.schoolId,
            'grade.id': data.gradeId,
            'clazz.id': data.clazzId,
            'campus.id': data.campusId,
            'teacher.id': data.teacherId
        }
    })
}

export const updateStudent = async (data) => {
    return request({
        url: `/admin/student/update/${data.id}`,
        method: 'put',
        params: {
            studentName: data.studentName,
            sumHours: data.sumHours,
            usedHours: data.usedHours,
            remainingHours: data.remainingHours,
            'parent.id': data.parentId,
            'school.id': data.schoolId,
            'grade.id': data.gradeId,
            'clazz.id': data.clazzId,
            'campus.id': data.campusId,
            'teacher.id': data.teacherId
        }
    })
}

export const deleteStudent = async (ids) => {
    let idsStr
    if (Array.isArray(ids)) {
        idsStr = ids.join(',')
    } else {
        idsStr = String(ids)
    }

    return request({
        url: `/admin/student/deletes/${idsStr}`,
        method: 'delete'
    })
}
