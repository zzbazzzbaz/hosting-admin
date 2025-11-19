<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button type="primary" @click="handleQuery">刷新</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <el-form-item label="学生姓名">
          <el-input
            v-model="filters.studentName"
            placeholder="输入学生姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="filters.schoolId" placeholder="选择学校" clearable filterable>
            <el-option
              v-for="item in schoolOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.gradeId" placeholder="选择年级" clearable filterable>
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.clazzId" placeholder="选择班级" clearable filterable>
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="托管校区">
          <el-select v-model="filters.campusId" placeholder="选择校区" clearable filterable>
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
      <template #header>
        <span class="font-semibold text-slate-800">签到次数列表</span>
      </template>
      <el-table :data="statsList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="学生" min-width="160">
          <template #default="{ row }">
            <div class="font-medium text-slate-800">{{ row.studentName || '-' }}</div>
            <div class="text-xs text-slate-400">{{ row.schoolName || '未分配学校' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="gradeName" label="年级" min-width="120" />
        <el-table-column prop="clazzName" label="班级" min-width="120" />
        <el-table-column prop="campusName" label="托管校区" min-width="140" />
        <el-table-column label="家长" min-width="160">
          <template #default="{ row }">
            <div>{{ row.parentName || '-' }}</div>
            <div class="text-xs text-slate-400">{{ row.parentPhone || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column label="教师" min-width="160">
          <template #default="{ row }">
            <div>{{ row.teacherName || '-' }}</div>
            <div class="text-xs text-slate-400">{{ row.teacherPhone || '' }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="signinCount" label="签到次数" width="140">
          <template #default="{ row }">
            <span class="text-lg font-semibold text-slate-800">{{ row.signinCount ?? 0 }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ totalRecords }} 位学生</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalRecords"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getStudentSigninStatsPageList } from '@/api/curd/signin'
import { getSchoolList, getGradeList, getClassList, getCampusList } from '@/api/curd/dictionary'
import { getParentPageList } from '@/api/curd/parent'
import { getTeacherPageList } from '@/api/curd/teacher'

const filters = reactive({
  studentName: '',
  schoolId: null,
  gradeId: null,
  clazzId: null,
  campusId: null,
  parentId: null,
  teacherId: null,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const statsList = ref([])
const totalRecords = ref(0)
const loading = ref(false)

const schoolOptions = ref([])
const gradeOptions = ref([])
const classOptions = ref([])
const campusOptions = ref([])
const parentOptions = ref([])
const parentLoading = ref(false)
const teacherOptions = ref([])
const teacherLoading = ref(false)

const fetchDictionaryOptions = async () => {
  try {
    const [schools, grades, classes, campuses] = await Promise.all([
      getSchoolList({ pageSize: 100 }),
      getGradeList({ pageSize: 100 }),
      getClassList({ pageSize: 100 }),
      getCampusList({ pageSize: 100 }),
    ])
    schoolOptions.value = schools.data?.list || []
    gradeOptions.value = grades.data?.list || []
    classOptions.value = classes.data?.list || []
    campusOptions.value = campuses.data?.list || []
  } catch (error) {
    console.error('加载字典选项失败:', error)
    ElMessage.error('加载学校/年级等选项失败，请稍后重试')
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

const formatParentLabel = (parent) => {
  if (!parent) return ''
  return `${parent.parentName || '未命名'} / ${parent.phone || '-'}`
}

const formatTeacherLabel = (teacher) => {
  if (!teacher) return ''
  return `${teacher.teacherName || '未命名'} / ${teacher.phone || '-'}`
}

const ensureOptionExists = (optionsRef, option, key = 'id') => {
  if (!option || !option[key]) return
  const exists = optionsRef.value.some(item => item[key] === option[key])
  if (!exists) {
    optionsRef.value = [...optionsRef.value, option]
  }
}

const fetchSigninStats = async () => {
  try {
    loading.value = true
    const result = await getStudentSigninStatsPageList({
      page: pagination.current,
      pageSize: pagination.size,
      studentName: filters.studentName?.trim() || undefined,
      schoolId: filters.schoolId || undefined,
      gradeId: filters.gradeId || undefined,
      clazzId: filters.clazzId || undefined,
      campusId: filters.campusId || undefined,
      parentId: filters.parentId || undefined,
      teacherId: filters.teacherId || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      statsList.value = result.data.list || []
      totalRecords.value = result.data.total || 0

      statsList.value.forEach((row) => {
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
      })
    } else {
      ElMessage.error(result.message || '获取签到统计失败')
    }
  } catch (error) {
    console.error('获取签到统计失败:', error)
    ElMessage.error('获取签到统计失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  pagination.current = 1
  fetchSigninStats()
}

const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    schoolId: null,
    gradeId: null,
    clazzId: null,
    campusId: null,
    parentId: null,
    teacherId: null,
  })
  pagination.current = 1
  fetchSigninStats()
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchSigninStats()
})

onMounted(() => {
  fetchDictionaryOptions()
  fetchParentOptions()
  fetchTeacherOptions()
  fetchSigninStats()
})
</script>
