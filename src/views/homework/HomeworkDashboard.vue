<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-50">筛选条件</span>
          <div class="space-x-3">
            <el-button
              type="primary"
              @click="handleQuery"
            >
              刷新
            </el-button>
          </div>
        </div>
      </template>
      <el-form
        :model="filters"
        label-width="90"
        class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <el-form-item label="学生姓名">
          <el-input
            v-model="filters.studentName"
            placeholder="输入学生姓名"
            clearable
          />
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
        <el-form-item label="学校">
          <el-select
            v-model="filters.schoolId"
            placeholder="选择学校"
            clearable
            filterable
          >
            <el-option
              v-for="item in schoolOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select
            v-model="filters.gradeId"
            placeholder="选择年级"
            clearable
            filterable
          >
            <el-option
              v-for="item in gradeOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select
            v-model="filters.clazzId"
            placeholder="选择班级"
            clearable
            filterable
          >
            <el-option
              v-for="item in classOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="校区">
          <el-select
            v-model="filters.campusId"
            placeholder="选择校区"
            clearable
            filterable
          >
            <el-option
              v-for="item in campusOptions"
              :key="item.id"
              :label="item.dicName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">
          重置
        </el-button>
        <el-button
          type="primary"
          @click="handleQuery"
        >
          查询
        </el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <template #header>
        <span class="font-semibold text-slate-50">学生作业统计</span>
      </template>
      <el-table
        :data="statsList"
        :loading="loading"
        stripe
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="studentName"
          label="学生姓名"
          min-width="160"
        />
        <el-table-column
          prop="teacherName"
          label="教师"
          min-width="140"
        />
        <el-table-column
          prop="sumCount"
          label="总作业数"
          width="120"
        />
        <el-table-column
          prop="finishCount"
          label="已完成"
          width="120"
        />
        <el-table-column
          prop="nofinishCount"
          label="未完成"
          width="120"
        />
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-slate-300">
          共 {{ totalRecords }} 位学生
        </div>
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
import { reactive, ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomeworkStudentStatsPageList } from '@/api/curd/homework'
import { getTeacherPageList } from '@/api/curd/teacher'
import { getParentPageList } from '@/api/curd/parent'
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

const statsList = ref([])
const totalRecords = ref(0)
const loading = ref(false)

const teacherOptions = ref([])
const parentOptions = ref([])
const teacherLoading = ref(false)
const parentLoading = ref(false)

const schoolOptions = ref([])
const gradeOptions = ref([])
const classOptions = ref([])
const campusOptions = ref([])

const totalFinished = computed(() =>
  statsList.value.reduce((sum, item) => sum + (item.finishCount || 0), 0)
)
const totalUnfinished = computed(() =>
  statsList.value.reduce((sum, item) => sum + (item.nofinishCount || 0), 0)
)
const totalHomework = computed(() =>
  statsList.value.reduce((sum, item) => sum + (item.sumCount || 0), 0)
)
const finishRate = computed(() => {
  if (!totalHomework.value) return 0
  return ((totalFinished.value / totalHomework.value) * 100).toFixed(1)
})

const formatTeacherLabel = (teacher) => {
  if (!teacher) return ''
  return `${teacher.teacherName || '未命名'} / ${teacher.phone || '-'}`
}

const formatParentLabel = (parent) => {
  if (!parent) return ''
  return `${parent.parentName || '未命名'} / ${parent.phone || '-'}`
}

const ensureOptionExists = (optionsRef, option, key = 'id') => {
  if (!option || !option[key]) return
  const exists = optionsRef.value.some((item) => item[key] === option[key])
  if (!exists) {
    optionsRef.value = [...optionsRef.value, option]
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
    console.error('获取教师失败', error)
  } finally {
    teacherLoading.value = false
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
    console.error('获取家长失败', error)
  } finally {
    parentLoading.value = false
  }
}

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
    console.error('加载字典失败', error)
    ElMessage.error('加载学校/年级/班级等选项失败，请稍后重试')
  }
}

const fetchStats = async () => {
  try {
    loading.value = true
    const result = await getHomeworkStudentStatsPageList({
      page: pagination.current,
      pageSize: pagination.size,
      ...filters,
    })
    if (result.code === 200 || result.code === 0) {
      statsList.value = result.data.list || []
      totalRecords.value = result.data.total || 0

      statsList.value.forEach((item) => {
        if (item.teacherId) {
          ensureOptionExists(teacherOptions, {
            id: item.teacherId,
            teacherName: item.teacherName,
          })
        }
        if (item.parentId) {
          ensureOptionExists(parentOptions, {
            id: item.parentId,
            parentName: item.parentName,
          })
        }
      })
    } else {
      ElMessage.error(result.message || '获取统计列表失败')
    }
  } catch (error) {
    console.error('获取统计失败', error)
    ElMessage.error('获取统计失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleTeacherRemote = (query) => {
  fetchTeacherOptions(query)
}

const handleParentRemote = (query) => {
  fetchParentOptions(query)
}

const handleQuery = () => {
  pagination.current = 1
  fetchStats()
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
  fetchStats()
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchStats()
})

onMounted(() => {
  fetchDictionaryOptions()
  fetchTeacherOptions()
  fetchParentOptions()
  fetchStats()
})
</script>
