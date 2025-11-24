<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button type="primary" @click="handleCreate"> 新增教师 </el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <el-form-item label="教师姓名">
          <el-input v-model="filters.teacherName" placeholder="支持模糊查询" clearable />
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
        <el-button @click="handleReset"> 重置 </el-button>
        <el-button type="primary" @click="handleQuery"> 查询 </el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="teacherList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="teacherName" label="教师姓名" min-width="140">
          <template #default="{ row }">
            {{ row.teacherName || '-' }}
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
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)"> 修改 </el-button>
            <el-button type="danger" link @click="handleDelete(row)"> 删除 </el-button>
            <el-button type="info" link @click="handleResetPassword(row)"> 重置密码 </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalTeachers }} 位教师</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalTeachers"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改教师' : '新增教师'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="90px">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号" maxlength="11" clearable />
        </el-form-item>
        <el-form-item label="教师姓名" prop="teacherName">
          <el-input
            v-model="formData.teacherName"
            placeholder="请输入教师姓名"
            maxlength="50"
            clearable
          />
        </el-form-item>
        <el-form-item label="所在校区" prop="campusId">
          <el-select v-model="formData.campusId" placeholder="请选择所在校区" clearable filterable>
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
  getTeacherPageList,
  addTeacher,
  deleteTeacher,
  resetTeacherPassword,
  updateTeacher,
} from '@/api/curd/teacher'
import { getCampusList } from '@/api/curd/dictionary.js'

const filters = reactive({
  teacherName: '',
  phone: '',
  campusId: null,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const teacherList = ref([])
const totalTeachers = ref(0)
const loading = ref(false)
const campusList = ref([])
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  phone: '',
  teacherName: '',
  campusId: null,
})
const formRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  campusId: [{ required: true, message: '请选择所在校区', trigger: 'change' }],
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
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

const fetchCampusList = async () => {
  try {
    const result = await getCampusList({
      page: 1,
      pageSize: 100,
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

const fetchTeacherList = async () => {
  try {
    loading.value = true
    const result = await getTeacherPageList({
      page: pagination.current,
      pageSize: pagination.size,
      teacherName: filters.teacherName || undefined,
      phone: filters.phone || undefined,
      campusId: filters.campusId || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      teacherList.value = result.data.list || []
      totalTeachers.value = result.data.total || 0
    } else {
      ElMessage.error(result.message || '获取教师列表失败')
    }
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchTeacherList()
})

onMounted(() => {
  fetchTeacherList()
  fetchCampusList()
})

const handleQuery = () => {
  pagination.current = 1
  fetchTeacherList()
}

const handleReset = () => {
  Object.assign(filters, {
    teacherName: '',
    phone: '',
    campusId: null,
  })
  pagination.current = 1
  fetchTeacherList()
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    phone: '',
    teacherName: '',
    campusId: null,
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    let result
    if (isEdit.value) {
      result = await updateTeacher({
        id: formData.id,
        phone: formData.phone,
        teacherName: formData.teacherName || undefined,
        campusId: formData.campusId || undefined,
      })
    } else {
      result = await addTeacher({
        phone: formData.phone,
        teacherName: formData.teacherName || undefined,
        campusId: formData.campusId || undefined,
      })
    }

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || (isEdit.value ? '修改教师成功' : '新增教师成功'))
      dialogVisible.value = false
      await fetchTeacherList()
    } else {
      ElMessage.error(result.message || (isEdit.value ? '修改教师失败' : '新增教师失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error(`${isEdit.value ? '修改' : '新增'}教师失败:`, error)
      ElMessage.error(`${isEdit.value ? '修改' : '新增'}教师失败，请稍后重试`)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleEdit = (row) => {
  Object.assign(formData, {
    id: row.id,
    teacherName: row.teacherName || '',
    phone: row.phone || '',
    campusId: row.campusId || null,
  })
  isEdit.value = true
  dialogVisible.value = true
}

const handleResetPassword = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置教师 ${row.teacherName || row.phone} 的密码吗？新密码将设置为手机号后六位。`,
      '重置密码确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const result = await resetTeacherPassword(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '密码重置成功，新密码为手机号后六位')
    } else {
      ElMessage.error(result.message || '密码重置失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重置教师密码失败:', error)
      ElMessage.error('密码重置失败，请稍后重试')
    }
  }
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除教师 ${row.teacherName || row.phone} 吗？删除后数据将无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    const result = await deleteTeacher(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '删除成功')
      await fetchTeacherList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除教师失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}
</script>
