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
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <el-form-item label="用户名">
          <el-input v-model="filters.username" placeholder="支持模糊查询" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.mobile" placeholder="支持模糊查询" clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.role" placeholder="全部角色" clearable>
            <el-option label="管理员" value="admin" />
            <el-option label="教师" value="teacher" />
            <el-option label="家长" value="parent" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="displayedUsers" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="username" label="用户名" min-width="160" />
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="roleLabel" label="角色" min-width="120" />
        <el-table-column prop="statusLabel" label="状态" min-width="100" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button type="warning" link @click="handleToggle(row)">
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
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
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="90px"
      >
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="formData.phone"
            placeholder="请输入手机号"
            maxlength="11"
            clearable
          />
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
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { addUser } from '@/api/curd/user'

// ========== 筛选条件 ==========
const filters = reactive({
  username: '',
  mobile: '',
  role: '',
  status: '',
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

const pagination = reactive({
  current: 1,
  size: 20,
})

const roleOptions = [
  { value: 'admin', label: '管理员' },
  { value: 'teacher', label: '教师' },
  { value: 'parent', label: '家长' },
]

const statusOptions = [
  { value: 'enabled', label: '启用' },
  { value: 'disabled', label: '禁用' },
]

const createMockUsers = (count = 160) => {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const role = roleOptions[index % roleOptions.length]
    const status = statusOptions[index % statusOptions.length]
    const mobileNumber = (13800000000 + index).toString()
    const mobile = `${mobileNumber.slice(0, 3)}${mobileNumber.slice(3)}`
    const suffix = (1000 + (index % 9000)).toString()

    return {
      id: `${id}`,
      username: `default_${mobile.slice(-4)}_${suffix}`,
      mobile,
      role: role.value,
      roleLabel: role.label,
      status: status.value,
      statusLabel: status.label,
    }
  })
}

const userList = ref(createMockUsers(160))

const totalUsers = computed(() => userList.value.length)

const displayedUsers = computed(() => {
  const start = (pagination.current - 1) * pagination.size
  const end = start + pagination.size
  return userList.value.slice(start, end)
})

const handleQuery = () => {
  pagination.current = 1
  ElMessage.info('已根据筛选条件刷新用户列表（示例数据）')
}

const handleReset = () => {
  Object.assign(filters, {
    username: '',
    mobile: '',
    role: '',
    status: '',
  })
  pagination.current = 1
  handleQuery()
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
      // 刷新用户列表（这里可以添加实际的列表刷新逻辑）
      handleQuery()
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

const handleDetail = (row) => {
  ElMessage.info(`进入用户详情：${row.username}`)
}

const handleToggle = (row) => {
  ElMessage.warning(`${row.status === 'enabled' ? '禁用' : '启用'}用户 ${row.username}`)
}

const handleDelete = (row) => {
  ElMessage.error(`删除用户 ${row.username}（软删除）`)
}

const handleResetPassword = (row) => {
  ElMessage.success(`重置用户 ${row.username} 的密码`)
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
