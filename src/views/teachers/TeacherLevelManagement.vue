<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <div class="space-x-3">
            <el-button type="primary" @click="handleQuery"> 刷新 </el-button>
            <el-button type="primary" @click="handleCreate">新增评级</el-button>
          </div>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <el-form-item label="所属月份">
          <el-date-picker
            v-model="filters.yearmonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择年月"
            class="w-full"
            clearable
          />
        </el-form-item>
        <el-form-item label="评级等级">
          <el-select v-model="filters.levelId" placeholder="选择评级" clearable filterable>
            <el-option
              v-for="level in levelOptions"
              :key="level.id"
              :label="level.dicName"
              :value="level.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select
            v-model="filters.teacherId"
            placeholder="输入手机号搜索教师"
            clearable
            filterable
            remote
            :remote-method="handleTeacherRemote"
            :loading="teacherLoading"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.id"
              :label="formatTeacherLabel(teacher)"
              :value="teacher.id"
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
      <template #header>
        <span class="font-semibold text-slate-800">教师评级列表</span>
      </template>
      <el-table :data="levelList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="教师信息" min-width="200">
          <template #default="{ row }">
            <div class="font-medium text-slate-800">{{ row.teacherName || '-' }}</div>
            <div class="text-xs text-slate-400">{{ row.teacherPhone || '未提供手机号' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="评级等级" min-width="120" />
        <el-table-column prop="yearmonth" label="月份" min-width="120" />
        <el-table-column prop="descption" label="评级描述" min-width="180" />
        <el-table-column label="操作人" min-width="140">
          <template #default="{ row }">
            <div>{{ row.userName || '-' }}</div>
            <div class="text-xs text-slate-400">ID: {{ row.userId || '-' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="flex gap-2">
              <el-button size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(row)"
                >删除</el-button
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalRecords }} 条记录</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRecords"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <el-form-item label="教师" prop="teacherId">
          <el-select
            v-model="formData.teacherId"
            placeholder="选择教师"
            class="w-full"
            clearable
            filterable
            remote
            :remote-method="handleTeacherRemote"
            :loading="teacherLoading"
            :disabled="isEdit"
          >
            <el-option
              v-for="teacher in teacherOptions"
              :key="teacher.id"
              :label="formatTeacherLabel(teacher)"
              :value="teacher.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="月份" prop="yearmonth">
          <el-date-picker
            v-model="formData.yearmonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择年月"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="评级" prop="levelId">
          <el-select v-model="formData.levelId" placeholder="选择评级" class="w-full">
            <el-option
              v-for="level in levelOptions"
              :key="level.id"
              :label="level.dicName"
              :value="level.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="descption">
          <el-input
            v-model="formData.descption"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="填写补充说明，最长 200 字"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTeacherLevelPageList,
  updateTeacherLevel,
  deleteTeacherLevels,
  addTeacherLevel,
} from '@/api/curd/teacherLevel'
import { getTeacherRatingList } from '@/api/curd/dictionary'
import { getTeacherPageList } from '@/api/curd/teacher'

const filters = reactive({
  yearmonth: '',
  levelId: null,
  teacherId: null,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const levelList = ref([])
const totalRecords = ref(0)
const loading = ref(false)

const levelOptions = ref([])
const teacherOptions = ref([])
const teacherLoading = ref(false)

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  teacherId: null,
  teacherName: '',
  yearmonth: '',
  levelId: null,
  descption: '',
})
const dialogTitle = computed(() => (isEdit.value ? '编辑教师评级' : '新增教师评级'))

const formRules = {
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  yearmonth: [{ required: true, message: '请选择月份', trigger: 'change' }],
  levelId: [{ required: true, message: '请选择评级', trigger: 'change' }],
  descption: [{ required: true, message: '请填写描述', trigger: 'blur' }],
}

const formatTeacherLabel = (teacher) => {
  if (!teacher) return ''
  return `${teacher.teacherName || '未命名'} / ${teacher.phone || '-'}`
}

const ensureOptionExists = (optionsRef, option, key = 'id') => {
  if (!option || !option[key]) return
  const exists = optionsRef.value.some((item) => item[key] === option[key])
  if (!exists) {
    optionsRef.value = [...optionsRef.value, option]
  }
}

const fetchLevelOptions = async () => {
  try {
    const result = await getTeacherRatingList({ pageSize: 100 })
    levelOptions.value = result.data?.list || []
  } catch (error) {
    console.error('获取评级字典失败:', error)
    ElMessage.error('加载评级字典失败，请稍后重试')
  }
}

const fetchTeacherOptions = async (keyword = '') => {
  try {
    teacherLoading.value = true
    const result = await getTeacherPageList({
      page: 1,
      pageSize: 50,
      phone: keyword || undefined,
    })
    teacherOptions.value = result.data?.list || []
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败，请稍后重试')
  } finally {
    teacherLoading.value = false
  }
}

const handleTeacherRemote = (query) => {
  fetchTeacherOptions(query)
}

const fetchLevelList = async () => {
  try {
    loading.value = true
    const result = await getTeacherLevelPageList({
      page: pagination.current,
      pageSize: pagination.size,
      yearmonth: filters.yearmonth || undefined,
      levelId: filters.levelId || undefined,
      teacherId: filters.teacherId || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      levelList.value = result.data.list || []
      totalRecords.value = result.data.total || 0

      levelList.value.forEach((item) => {
        if (item.teacherId) {
          ensureOptionExists(teacherOptions, {
            id: item.teacherId,
            teacherName: item.teacherName,
            phone: item.teacherPhone,
          })
        }
      })
    } else {
      ElMessage.error(result.message || '获取评级列表失败')
    }
  } catch (error) {
    console.error('获取评级列表失败:', error)
    ElMessage.error('获取评级列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.current = 1
  fetchLevelList()
}

const handleReset = () => {
  Object.assign(filters, {
    yearmonth: '',
    levelId: null,
    teacherId: null,
  })
  pagination.current = 1
  fetchLevelList()
}

const resetFormData = () => {
  Object.assign(formData, {
    id: null,
    teacherId: null,
    teacherName: '',
    yearmonth: '',
    levelId: null,
    descption: '',
  })
}

const handleCreate = () => {
  isEdit.value = false
  resetFormData()
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate?.()
  })
}

const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    teacherId: row.teacherId || null,
    teacherName: row.teacherName,
    yearmonth: row.yearmonth,
    levelId: row.levelId,
    descption: row.descption,
  })
  ensureOptionExists(teacherOptions, {
    id: row.teacherId,
    teacherName: row.teacherName,
    phone: row.teacherPhone,
  })
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate?.()
  })
}

const handleSubmit = () => {
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      submitLoading.value = true
      if (isEdit.value) {
        await updateTeacherLevel({
          id: formData.id,
          yearmonth: formData.yearmonth,
          levelId: formData.levelId,
          descption: formData.descption,
        })
      } else {
        await addTeacherLevel({
          teacherId: formData.teacherId,
          yearmonth: formData.yearmonth,
          levelId: formData.levelId,
          descption: formData.descption,
        })
      }
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      fetchLevelList()
    } catch (error) {
      console.error('提交评级失败:', error)
      ElMessage.error(error.message || '操作失败，请稍后重试')
    } finally {
      submitLoading.value = false
    }
  })
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确认删除教师 ${row.teacherName || ''} 在 ${row.yearmonth || '-'} 的评级记录吗？`,
    '提示',
    {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    }
  )
    .then(async () => {
      await deleteTeacherLevels(row.id)
      ElMessage.success('删除成功')
      fetchLevelList()
    })
    .catch(() => {})
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchLevelList()
})

onMounted(() => {
  fetchLevelOptions()
  fetchTeacherOptions()
  fetchLevelList()
})
</script>
