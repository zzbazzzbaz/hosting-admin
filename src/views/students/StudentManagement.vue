<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">查询筛选</span>
          <el-button type="primary" @click="handleCreate">新增学生</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <el-form-item label="学生姓名">
          <el-input v-model="filters.studentName" placeholder="支持模糊查询" clearable />
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="filters.schoolId" placeholder="全部学校" clearable filterable>
            <el-option
              v-for="item in schoolOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.gradeId" placeholder="全部年级" clearable filterable>
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.clazzId" placeholder="全部班级" clearable filterable>
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="校区">
          <el-select v-model="filters.campusId" placeholder="全部校区" clearable filterable>
            <el-option
              v-for="item in campusOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="家长">
          <el-select
            v-model="filters.parentId"
            placeholder="输入手机号搜索"
            clearable
            filterable
            remote
            :remote-method="handleParentRemote"
            :loading="parentLoading"
          >
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="formatParentLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师">
          <el-select
            v-model="filters.teacherId"
            placeholder="输入手机号搜索"
            clearable
            filterable
            remote
            :remote-method="handleTeacherRemote"
            :loading="teacherLoading"
          >
            <el-option
              v-for="item in teacherOptions"
              :key="item.id"
              :label="formatTeacherLabel(item)"
              :value="item.id"
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
      <el-table :data="studentList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="学生姓名" min-width="140">
          <template #default="{ row }">
            {{ row.studentName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="家长" min-width="160">
          <template #default="{ row }">
            {{ row.parentName || '-' }}（{{ row.parentPhone || '-' }}）
          </template>
        </el-table-column>
        <el-table-column prop="schoolName" label="学校" min-width="140" />
        <el-table-column prop="gradeName" label="年级" min-width="120" />
        <el-table-column prop="clazzName" label="班级" min-width="120" />
        <el-table-column prop="campusName" label="校区" min-width="140" />
        <el-table-column label="课时情况" min-width="180">
          <template #default="{ row }">
            {{ row.usedHours || 0 }}/{{ row.sumHours || 0 }}（剩余 {{ row.remainingHours || 0 }}）
          </template>
        </el-table-column>
        <el-table-column label="教师" min-width="160">
          <template #default="{ row }">
            {{ row.teacherName || '-' }}（{{ row.teacherPhone || '-' }}）
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
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalStudents }} 名学生</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalStudents"
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '修改学生' : '新增学生'"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        class="grid gap-4 md:grid-cols-2"
      >
        <el-form-item label="学生姓名" prop="studentName">
          <el-input
            v-model="formData.studentName"
            placeholder="请输入学生姓名"
            maxlength="50"
            clearable
          />
        </el-form-item>
        <el-form-item label="学校" prop="schoolId">
          <el-select v-model="formData.schoolId" placeholder="请选择学校" clearable filterable>
            <el-option
              v-for="item in schoolOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级" prop="gradeId">
          <el-select v-model="formData.gradeId" placeholder="请选择年级" clearable filterable>
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级" prop="clazzId">
          <el-select v-model="formData.clazzId" placeholder="请选择班级" clearable filterable>
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="校区" prop="campusId">
          <el-select v-model="formData.campusId" placeholder="请选择校区" clearable filterable>
            <el-option
              v-for="item in campusOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="家长" prop="parentId">
          <el-select
            v-model="formData.parentId"
            placeholder="输入手机号搜索家长"
            clearable
            filterable
            remote
            :remote-method="handleParentRemote"
            :loading="parentLoading"
          >
            <el-option
              v-for="item in parentOptions"
              :key="item.id"
              :label="formatParentLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="教师" prop="teacherId">
          <el-select
            v-model="formData.teacherId"
            placeholder="输入手机号搜索教师"
            clearable
            filterable
            remote
            :remote-method="handleTeacherRemote"
            :loading="teacherLoading"
          >
            <el-option
              v-for="item in teacherOptions"
              :key="item.id"
              :label="formatTeacherLabel(item)"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="总课时" prop="sumHours">
          <el-input-number v-model="formData.sumHours" :min="0" class="w-full" />
        </el-form-item>
        <el-form-item label="已用课时" prop="usedHours">
          <el-input-number v-model="formData.usedHours" :min="0" class="w-full" />
        </el-form-item>
        <div class="col-span-2 text-right text-sm text-slate-500">
          剩余课时：{{ computedRemainingHours }} 节
        </div>
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
import { reactive, ref, watch, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getStudentPageList, addStudent, updateStudent, deleteStudent } from '@/api/curd/student'
import { getParentPageList } from '@/api/curd/parent'
import { getTeacherPageList } from '@/api/curd/teacher'
import { getSchoolList, getGradeList, getClassList, getCampusList } from '@/api/curd/dictionary'

const filters = reactive({
  studentName: '',
  schoolId: null,
  parentId: null,
  gradeId: null,
  clazzId: null,
  campusId: null,
  teacherId: null,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const studentList = ref([])
const totalStudents = ref(0)
const loading = ref(false)

const schoolOptions = ref([])
const gradeOptions = ref([])
const classOptions = ref([])
const campusOptions = ref([])
const parentOptions = ref([])
const parentLoading = ref(false)
const teacherOptions = ref([])
const teacherLoading = ref(false)

const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  studentName: '',
  sumHours: 0,
  usedHours: 0,
  parentId: null,
  schoolId: null,
  gradeId: null,
  clazzId: null,
  campusId: null,
  teacherId: null,
})

const formRules = {
  studentName: [{ required: true, message: '请输入学生姓名', trigger: 'blur' }],
  sumHours: [{ required: true, message: '请输入总课时', trigger: 'blur' }],
  usedHours: [{ required: true, message: '请输入已用课时', trigger: 'blur' }],
  parentId: [{ required: true, message: '请选择家长', trigger: 'change' }],
  schoolId: [{ required: true, message: '请选择学校', trigger: 'change' }],
  gradeId: [{ required: true, message: '请选择年级', trigger: 'change' }],
  clazzId: [{ required: true, message: '请选择班级', trigger: 'change' }],
  campusId: [{ required: true, message: '请选择校区', trigger: 'change' }],
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
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

const formatParentLabel = (item) => {
  return `${item.parentName || '-'} / ${item.phone || '-'}`
}

const formatTeacherLabel = (item) => {
  return `${item.teacherName || '-'} / ${item.phone || '-'}`
}

const computedRemainingHours = computed(() => {
  const sum = Number(formData.sumHours) || 0
  const used = Number(formData.usedHours) || 0
  return Math.max(sum - used, 0)
})

const fetchDictionaryOptions = async () => {
  try {
    const [schools, grades, classes, campuses] = await Promise.all([
      getSchoolList({ page: 1, pageSize: 200 }),
      getGradeList({ page: 1, pageSize: 200 }),
      getClassList({ page: 1, pageSize: 200 }),
      getCampusList({ page: 1, pageSize: 200 }),
    ])

    schoolOptions.value = schools.data?.list || []
    gradeOptions.value = grades.data?.list || []
    classOptions.value = classes.data?.list || []
    campusOptions.value = campuses.data?.list || []
  } catch (error) {
    console.error('获取字典失败:', error)
    ElMessage.error('获取字典信息失败，请稍后重试')
  }
}

const fetchParentOptions = async (keyword = '') => {
  try {
    parentLoading.value = true
    const result = await getParentPageList({
      page: 1,
      pageSize: 50,
      phone: keyword || undefined,
    })
    parentOptions.value = result.data?.list || []
  } catch (error) {
    console.error('获取家长列表失败:', error)
    ElMessage.error('获取家长列表失败，请稍后重试')
  } finally {
    parentLoading.value = false
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

const handleParentRemote = (query) => {
  fetchParentOptions(query)
}

const handleTeacherRemote = (query) => {
  fetchTeacherOptions(query)
}

const ensureOptionExists = (optionsRef, option, key = 'id') => {
  if (!option || !option[key]) return
  const exists = optionsRef.value.some((item) => item[key] === option[key])
  if (!exists) {
    optionsRef.value = [...optionsRef.value, option]
  }
}

const fetchStudentList = async () => {
  try {
    loading.value = true
    const result = await getStudentPageList({
      page: pagination.current,
      pageSize: pagination.size,
      studentName: filters.studentName || undefined,
      schoolId: filters.schoolId || undefined,
      parentId: filters.parentId || undefined,
      gradeId: filters.gradeId || undefined,
      clazzId: filters.clazzId || undefined,
      campusId: filters.campusId || undefined,
      teacherId: filters.teacherId || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      studentList.value = result.data.list || []
      totalStudents.value = result.data.total || 0

      studentList.value.forEach((student) => {
        if (student.parentId) {
          ensureOptionExists(parentOptions, {
            id: student.parentId,
            parentName: student.parentName,
            phone: student.parentPhone,
          })
        }
        if (student.teacherId) {
          ensureOptionExists(teacherOptions, {
            id: student.teacherId,
            teacherName: student.teacherName,
            phone: student.teacherPhone,
          })
        }
      })
    } else {
      ElMessage.error(result.message || '获取学生列表失败')
    }
  } catch (error) {
    console.error('获取学生列表失败:', error)
    ElMessage.error('获取学生列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchStudentList()
})

onMounted(() => {
  fetchDictionaryOptions()
  fetchParentOptions()
  fetchTeacherOptions()
  fetchStudentList()
})

const handleQuery = () => {
  pagination.current = 1
  fetchStudentList()
}

const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    schoolId: null,
    parentId: null,
    gradeId: null,
    clazzId: null,
    campusId: null,
    teacherId: null,
  })
  pagination.current = 1
  fetchStudentList()
}

const handleCreate = () => {
  isEdit.value = false
  dialogVisible.value = true
}

const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    studentName: '',
    sumHours: 0,
    usedHours: 0,
    parentId: null,
    schoolId: null,
    gradeId: null,
    clazzId: null,
    campusId: null,
    teacherId: null,
  })
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitLoading.value = true
    const payload = {
      id: formData.id,
      studentName: formData.studentName,
      sumHours: formData.sumHours,
      usedHours: formData.usedHours,
      remainingHours: computedRemainingHours.value,
      parentId: formData.parentId,
      schoolId: formData.schoolId,
      gradeId: formData.gradeId,
      clazzId: formData.clazzId,
      campusId: formData.campusId,
      teacherId: formData.teacherId,
    }

    let result
    if (isEdit.value) {
      result = await updateStudent(payload)
    } else {
      result = await addStudent(payload)
    }

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || (isEdit.value ? '修改学生成功' : '新增学生成功'))
      dialogVisible.value = false
      fetchStudentList()
    } else {
      ElMessage.error(result.message || (isEdit.value ? '修改学生失败' : '新增学生失败'))
    }
  } catch (error) {
    if (error !== false) {
      console.error(`${isEdit.value ? '修改' : '新增'}学生失败:`, error)
      ElMessage.error(`${isEdit.value ? '修改' : '新增'}学生失败，请稍后重试`)
    }
  } finally {
    submitLoading.value = false
  }
}

const handleEdit = (row) => {
  Object.assign(formData, {
    id: row.id,
    studentName: row.studentName || '',
    sumHours: row.sumHours ?? 0,
    usedHours: row.usedHours ?? 0,
    parentId: row.parentId || null,
    schoolId: row.schoolId || null,
    gradeId: row.gradeId || null,
    clazzId: row.clazzId || null,
    campusId: row.campusId || null,
    teacherId: row.teacherId || null,
  })

  if (row.parentId) {
    ensureOptionExists(parentOptions, {
      id: row.parentId,
      parentName: row.parentName,
      phone: row.parentPhone,
    })
  }
  if (row.teacherId) {
    ensureOptionExists(teacherOptions, {
      id: row.teacherId,
      teacherName: row.teacherName,
      phone: row.teacherPhone,
    })
  }

  isEdit.value = true
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除学生 ${row.studentName} 吗？删除后数据将无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    const result = await deleteStudent(row.id)

    if (result.code === 200 || result.code === 0) {
      ElMessage.success(result.message || '删除成功')
      fetchStudentList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除学生失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}
</script>
