import request from '@/utils/request'


// ========== 数据适配器（防腐层）==========

/**
 * 标准化校区列表响应数据
 * 扁平化处理：将 rows 转换为 list
 */
function adaptCampusListResponse(response) {
    if (!response || !response.data) {
        return response
    }

    return {
        code: response.code,
        message: response.message,
        data: {
            total: response.data.total,
            pages: response.data.pages,
            list: response.data.rows || []
        }
    }
}

// ========== API 接口 ==========

/**
 * 获取校区列表
 *
 * @param {Object} params - 分页参数
 * @param {number} params.page - 当前页码（默认 1）
 * @param {number} params.pageSize - 每页条数（默认 100）
 * @returns {Promise} 返回校区列表
 *
 * @example
 * 请求示例：
 * getCampusList({
 *   page: 1,
 *   pageSize: 100
 * })
 *
 * 响应示例（成功）：
 * {
 *   code: 200,
 *   message: "成功获取数据",
 *   data: {
 *     total: 2,
 *     pages: 1,
 *     list: [
 *       {
 *         id: 30,
 *         type: 4,
 *         dicName: "托管校区2"
 *       },
 *       {
 *         id: 29,
 *         type: 4,
 *         dicName: "托管校区1"
 *       }
 *     ]
 *   }
 * }
 */
export const getCampusList = async (params = {}) => {
    const response = await request({
        url: `/admin/dictionary/pageList/${params.page || 1}/${params.pageSize || 100}`,
        method: 'get',
        params: {
            type: 4  // 校区类型固定为 4
        }
    })

    // 🔹 使用适配器转换数据格式
    return adaptCampusListResponse(response)
}
