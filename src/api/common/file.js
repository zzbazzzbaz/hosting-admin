import request from '@/utils/request'

/**
 * 下载导入模板
 * @param {number} type 模板类型：1 学生；2 成绩
 * @returns {Promise<Blob>} 文件二进制
 */
export const downloadTypeTemplate = (type) => {
  return request({
    url: '/api/common/file/downTypeTemplate',
    method: 'get',
    params: { type },
    responseType: 'blob',
  })
}

/**
 * 导入学生信息
 * @param {File} file Excel 文件
 */
export const importStudentData = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/api/common/file/importStudentData',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 导入成绩信息
 * @param {File} file Excel 文件
 */
export const importScoreData = (file) => {
  const formData = new FormData()
  formData.append('file', file)

  return request({
    url: '/api/common/file/importScoreData',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
