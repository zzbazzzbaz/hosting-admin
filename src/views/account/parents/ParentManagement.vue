<template>
  <div class="space-y-4">
    <el-card class="pastel-card" shadow="never">
      <div class="flex items-end justify-between gap-4">
        <el-form :model="filters" label-width="80" size="small" class="flex gap-3 flex-1">
          <el-form-item label="家长姓名">
            <el-input v-model="filters.parentName" placeholder="支持模糊查询" clearable />
          </el-form-item>
          <el-form-item label="手机号">
            <el-input v-model="filters.phone" placeholder="支持模糊查询" clearable />
          </el-form-item>
        </el-form>
        <div class="flex gap-2">
          <el-button size="small" @click="handleReset"> 重置 </el-button>
          <el-button size="small" type="primary" @click="handleQuery"> 查询 </el-button>
          <el-button size="small" type="primary" @click="handleCreate"> 新增家长 </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="parentList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="parentName" label="家长姓名" min-width="140">
          <template #default="{ row }">
            {{ row.parentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" min-width="140" />
        <el-table-column label="创建时间" min-width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)"> 修改 </el-button>
            <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
            <el-button type="info" link @click="handleResetPassword(row)"> 重置密码 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalParents }} 位家长</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalParents"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改家长' : '新增家长'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="家长姓名" prop="parentName">
          <el-input
            v-model="formData.parentName"
            placeholder="请输入家长姓名"
            maxlength="50"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false"> 取消 </el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
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
import {
  getParentPageList,
  addParent,
  updateParent,
  deleteParent,
  resetParentPassword,
} from '@/api/curd/parent.js'

const filters = reactive({
  parentName: '',
  phone: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const parentList = ref([])
const totalParents = ref(0)
const loading = ref(false)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  parentName: '',
  phone: '',
})

const formRules = {
  parentName: [{ required: true, message: '请输入家长姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
}

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

const fetchParentList = async () => {
  try {
    loading.value = true
    const result = await getParentPageList({
      page: pagination.current,
      pageSize: pagination.size,
      parentName: filters.parentName || undefined,
      phone: filters.phone || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      parentList.value = result.data.list || []
      totalParents.value = result.data.total || 0
    } else {
      ElMessage.error(result.message || '获取家长列表失败')
    }
  } catch (error) {
    console.error('获取家长列表失败:', error)
    ElMessage.error('获取家长列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchParentList()
})

onMounted(() => {
  fetchParentList()
})

const handleQuery = () => {
  pagination.current = 1
  fetchParentList()
}

const handleReset = () => {
  Object.assign(filters, {
    parentName: '',
    phone: '',
  })
  pagination.current = 1
  fetchParentList()
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    parentName: '',
    phone: '',
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    let result

    if (isEdit.value) {
      result = await updateParent({
        id: formData.id,
        parentName: formData.parentName,
        phone: formData.phone,
      })
    } else {
      result = await addParent({
        parentName: formData.parentName,
        phone: formData.phone,
      })
    }

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || (isEdit.value ? '修改家长成功' : '新增家长成功'))
      dialogVisible.value = false
      await fetchParentList()
    } else {
      ElMessage.error(result.message || (isEdit.value ? '修改家长失败' : '新增家长失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error(`${isEdit.value ? '修改' : '新增'}家长失败:`, error)
      ElMessage.error(`${isEdit.value ? '修改' : '新增'}家长失败，请稍后重试`)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleEdit = (row) => {
  Object.assign(formData, {
    id: row.id,
    parentName: row.parentName || '',
    phone: row.phone || '',
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除家长 ${row.parentName || row.phone} 吗？删除后数据将无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    const result = await deleteParent(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '删除成功')
      await fetchParentList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除家长失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置家长 ${row.parentName || row.phone} 的密码吗？新密码将设置为手机号后六位。`,
      '重置密码确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const result = await resetParentPassword(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '密码重置成功，新密码为手机号后六位')
    } else {
      ElMessage.error(result.message || '密码重置失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置家长密码失败:', error)
      ElMessage.error('密码重置失败，请稍后重试')
    }
  }
}
</script>
