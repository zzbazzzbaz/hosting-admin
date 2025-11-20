<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">查询筛选</span>
          <div class="flex items-center gap-3">
            <el-button type="primary" @click="handleCreate">新增用户</el-button>
            <el-dropdown @command="handleExcelCommand">
              <el-button type="success">
                Excel 操作
                <el-icon class="ml-1">
                  <ArrowDown />
                </el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="import">Excel 导入用户</el-dropdown-item>
                  <el-dropdown-item command="export">Excel 导出用户</el-dropdown-item>
                  <el-dropdown-item command="template">Excel 模板下载</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <el-form-item label="用户名">
          <el-input v-model="filters.userName" placeholder="支持模糊查询" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.phone" placeholder="支持模糊查询" clearable />
        </el-form-item>
        <el-form-item label="所在校区">
          <el-select v-model="filters.campusId" placeholder="全部校区" clearable filterable>
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.dicName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="userList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户名" min-width="140">
          <template #default="{ row }">
            {{ row.userName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column prop="dicName" label="所在校区" min-width="160">
          <template #default="{ row }">
            {{ row.dicName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">修改</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            <el-button type="info" link @click="handleResetPassword(row)">重置密码</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalUsers }} 条记录</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalUsers"
        />
      </div>
    </el-card>

    <!-- 新增用户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="新增用户"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="formData.userName"
            placeholder="请输入用户名（可选）"
            maxlength="50"
            clearable
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改用户弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改用户"
      width="500px"
      :close-on-click-modal="false"
      @close="handleEditDialogClose"
    >
      <el-form ref="editFormRef" :model="editFormData" :rules="editFormRules" label-width="90px">
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="editFormData.userName"
            placeholder="请输入用户名"
            maxlength="50"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="editFormData.phone"
            placeholder="请输入手机号"
            maxlength="11"
            clearable
          />
        </el-form-item>
        <el-form-item label="所在校区" prop="campusId">
          <el-select
            v-model="editFormData.campusId"
            placeholder="请选择所在校区"
            clearable
            filterable
          >
            <el-option
              v-for="campus in campusList"
              :key="campus.id"
              :label="campus.dicName"
              :value="campus.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editSubmitLoading" @click="handleEditSubmit">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addUser, getUserPageList, updateUser, deleteUser, resetPassword } from '@/api/curd/user'
import { getCampusList } from '@/api/curd/dictionary.js'

// ========== 筛选条件 ==========
const filters = reactive({
  userName: '', // 用户名（对应后端 userName）
  phone: '', // 手机号（对应后端 phone）
  campusId: null, // 校区 ID（对应后端 campus.id）
})

// ========== 新增用户弹窗 ==========
const dialogVisible = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)

const formData = reactive({
  phone: '',
  userName: '',
})

// 表单验证规则
const formRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
}

// ========== 修改用户弹窗 ==========
const editDialogVisible = ref(false)
const editSubmitLoading = ref(false)
const editFormRef = ref(null)

const editFormData = reactive({
  id: null,
  userName: '',
  phone: '',
  campusId: null, // 校区 ID（用于提交和显示）
})

// 修改表单验证规则
const editFormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
}

// ========== 用户列表数据 ==========
const pagination = reactive({
  current: 1,
  size: 10,
})

const userList = ref([])
const totalUsers = ref(0)
const loading = ref(false)

// ========== 校区列表数据 ==========
const campusList = ref([])

/**
 * 获取校区列表
 */
const fetchCampusList = async () => {
  try {
    const result = await getCampusList({
      page: 1,
      pageSize: 100, // 获取所有校区
    })

    if (result.code === 200 || result.code === 0) {
      campusList.value = result.data.list || []
    } else {
      ElMessage.error(result.message || '获取校区列表失败')
    }
  } catch (error) {
    console.error('获取校区列表失败:', error)
    ElMessage.error('获取校区列表失败，请稍后重试')
  }
}

/**
 * 格式化日期时间
 */
const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

/**
 * 获取用户列表
 */
const fetchUserList = async () => {
  try {
    loading.value = true
    const result = await getUserPageList({
      page: pagination.current,
      pageSize: pagination.size,
      userName: filters.userName || undefined, // 用户名筛选
      phone: filters.phone || undefined, // 手机号筛选
      campusId: filters.campusId || undefined, // 校区筛选
    })

    if (result.code === 200 || result.code === 0) {
      userList.value = result.data.list || []
      totalUsers.value = result.data.total || 0
    } else {
      ElMessage.error(result.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ========== 分页监听 ==========
watch(
  [() => pagination.current, () => pagination.size],
  () => {
    fetchUserList()
  },
  { deep: true }
)

// ========== 页面初始化 ==========
onMounted(() => {
  fetchUserList()
  fetchCampusList() // 获取校区列表
})

// ========== 查询和重置 ==========
const handleQuery = () => {
  pagination.current = 1
  fetchUserList()
}

const handleReset = () => {
  Object.assign(filters, {
    userName: '',
    phone: '',
    campusId: null,
  })
  pagination.current = 1
  fetchUserList()
}

const handleCreate = () => {
  dialogVisible.value = true
}

/**
 * 关闭弹窗时重置表单
 */
const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    phone: '',
    userName: '',
  })
}

/**
 * 提交新增用户表单
 */
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    submitLoading.value = true

    // 调用新增用户 API
    const result = await addUser({
      phone: formData.phone,
      userName: formData.userName || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '新增用户成功')
      dialogVisible.value = false
      // 刷新用户列表
      fetchUserList()
    } else {
      ElMessage.error(result.message || '新增用户失败')
    }
  } catch (error) {
    console.error('新增用户失败:', error)
    if (error !== false) {
      ElMessage.error('新增用户失败，请稍后重试')
    }
  } finally {
    submitLoading.value = false
  }
}

/**
 * 打开修改用户弹窗
 */
const handleEdit = (row) => {
  // 填充表单数据（使用扁平化后的字段）
  Object.assign(editFormData, {
    id: row.id,
    userName: row.userName || '',
    phone: row.phone || '',
    campusId: row.campusId || null, // 校区 ID
  })
  editDialogVisible.value = true
}

/**
 * 关闭修改弹窗时重置表单
 */
const handleEditDialogClose = () => {
  editFormRef.value?.resetFields()
  Object.assign(editFormData, {
    id: null,
    userName: '',
    phone: '',
    campusId: null, // 重置校区 ID
  })
}

/**
 * 提交修改用户表单
 */
const handleEditSubmit = async () => {
  try {
    // 表单验证
    await editFormRef.value?.validate()

    editSubmitLoading.value = true

    // 调用修改用户 API（提交 campusId）
    const result = await updateUser({
      id: editFormData.id,
      userName: editFormData.userName || undefined,
      phone: editFormData.phone,
      campusId: editFormData.campusId || undefined, // 提交校区 ID
    })

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '修改用户成功')
      editDialogVisible.value = false
      // 刷新用户列表
      fetchUserList()
    } else {
      ElMessage.error(result.message || '修改用户失败')
    }
  } catch (error) {
    console.error('修改用户失败:', error)
    if (error !== false) {
      ElMessage.error('修改用户失败，请稍后重试')
    }
  } finally {
    editSubmitLoading.value = false
  }
}

/**
 * 删除用户
 */
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${row.userName || row.phone} 吗？删除后数据将无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    const result = await deleteUser(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '删除成功')
      // 刷新列表
      fetchUserList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

/**
 * 重置用户密码
 */
const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 ${row.userName || row.phone} 的密码吗？新密码将设置为手机号后六位。`,
      '重置密码确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const result = await resetPassword(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '密码重置成功，新密码为手机号后六位')
    } else {
      ElMessage.error(result.message || '密码重置失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置密码失败:', error)
      ElMessage.error('重置密码失败，请稍后重试')
    }
  }
}

const handleExcelCommand = (command) => {
  const actionMap = {
    import: '执行 Excel 导入用户',
    export: '执行 Excel 导出用户',
    template: '下载 Excel 模板',
  }
  ElMessage.info(actionMap[command])
}
</script>
