<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button type="primary" @click="handleCreate">新增教师</el-button>
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
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
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
      title="新增教师"
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
        <el-form-item label="教师姓名" prop="teacherName">
          <el-input
            v-model="formData.teacherName"
            placeholder="请输入教师姓名（可选）"
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
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getTeacherPageList, addTeacher } from '@/api/curd/teacher'
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
const formRef = ref(null)
const formData = reactive({
  phone: '',
  teacherName: '',
})
const formRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
}

const handleCreate = () => {
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
    phone: '',
    teacherName: '',
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    const result = await addTeacher({
      phone: formData.phone,
      teacherName: formData.teacherName || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '新增教师成功')
      dialogVisible.value = false
      fetchTeacherList()
    } else {
      ElMessage.error(result.message || '新增教师失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('新增教师失败:', error)
      ElMessage.error('新增教师失败，请稍后重试')
    }
  } finally {
    submitLoading.value = false
  }
}
</script>
