<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-50">筛选条件</span>
          <div class="space-x-3">
            <el-button type="primary" @click="handleQuery">刷新</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
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
          <el-select v-model="filters.schoolId" placeholder="选择学校" clearable filterable>
            <el-option v-for="item in schoolOptions" :key="item.id" :label="item.dicName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.gradeId" placeholder="选择年级" clearable filterable>
            <el-option v-for="item in gradeOptions" :key="item.id" :label="item.dicName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.clazzId" placeholder="选择班级" clearable filterable>
            <el-option v-for="item in classOptions" :key="item.id" :label="item.dicName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="校区">
          <el-select v-model="filters.campusId" placeholder="选择校区" clearable filterable>
            <el-option v-for="item in campusOptions" :key="item.id" :label="item.dicName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="学科">
          <el-select v-model="filters.subjectId" placeholder="选择学科" clearable filterable>
            <el-option v-for="item in subjectOptions" :key="item.id" :label="item.dicName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="完成状态">
          <el-select v-model="filters.state" placeholder="选择状态" clearable>
            <el-option label="未完成" :value="0" />
            <el-option label="已完成" :value="1" />
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
        <span class="font-semibold text-slate-50">作业列表</span>
      </template>
      <el-table :data="homeworkList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentName" label="学生姓名" min-width="160" />
        <el-table-column prop="state" label="完成状态" width="120">
          <template #default="{ row }">
            <el-tag :type="row.state === 1 ? 'success' : 'info'" effect="dark">
              {{ row.state === 1 ? '已完成' : '未完成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="布置时间" min-width="160" />
        <el-table-column prop="finishTime" label="完成时间" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="handleViewDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-slate-300">共 {{ totalRecords }} 条作业记录</div>
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
      v-model="detailVisible"
      title="作业详情"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border class="rounded-2xl">
        <el-descriptions-item label="ID">{{ currentRecord?.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="学生姓名">{{ currentRecord?.studentName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="教师">{{ currentRecord?.teacherName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="家长">{{ currentRecord?.parentName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="布置时间">{{ currentRecord?.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentRecord?.finishTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成状态">
          <el-tag :type="currentRecord?.state === 1 ? 'success' : 'info'" effect="dark">
            {{ currentRecord?.state === 1 ? '已完成' : '未完成' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="教师评语">
          {{ currentRecord?.evaluation || '—' }}
        </el-descriptions-item>
        <el-descriptions-item label="托管校区">{{ currentRecord?.campusName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所在班级">
          {{ currentRecord?.schoolName || '-' }} · {{ currentRecord?.gradeName || '-' }} · {{ currentRecord?.clazzName || '-' }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-6 space-y-4">
        <section>
          <h4 class="mb-2 text-sm font-semibold text-slate-900">作业内容</h4>
          <p class="rounded-2xl bg-white p-4 text-sm text-slate-900 whitespace-pre-line">
            {{ currentRecord?.content || '暂无内容' }}
          </p>
          <div v-if="currentRecord?.workPicList?.length" class="mt-3 flex flex-wrap gap-3">
            <el-image
              v-for="pic in currentRecord?.workPicList"
              :key="pic.id"
              :src="pic.url"
              fit="cover"
              class="h-24 w-24 rounded-xl border border-white/10 object-cover"
              :preview-src-list="currentRecord.workPicList.map(item => item.url)"
              preview-teleported
            />
          </div>
        </section>
        <section>
          <h4 class="mb-2 text-sm font-semibold text-slate-900">完成情况</h4>
          <div v-if="currentRecord?.finishPicList?.length" class="flex flex-wrap gap-3">
            <el-image
              v-for="pic in currentRecord?.finishPicList"
              :key="pic.id"
              :src="pic.url"
              fit="cover"
              class="h-24 w-24 rounded-xl border border-white/10 object-cover"
              :preview-src-list="currentRecord.finishPicList.map(item => item.url)"
              preview-teleported
            />
          </div>
          <p v-else class="text-sm text-slate-900">暂无完成照片</p>
        </section>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getHomeworkPageList } from '@/api/curd/homework'
import { getSchoolList, getGradeList, getClassList, getCampusList, getSubjectList } from '@/api/curd/dictionary'
import { getTeacherPageList } from '@/api/curd/teacher'
import { getParentPageList } from '@/api/curd/parent'

const filters = reactive({
  studentName: '',
  teacherId: null,
  parentId: null,
  schoolId: null,
  subjectId: null,
  gradeId: null,
  campusId: null,
  clazzId: null,
  state: '',
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const homeworkList = ref([])
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
const subjectOptions = ref([])

const detailVisible = ref(false)
const currentRecord = ref(null)

const formatTeacherLabel = (teacher) => {
  if (!teacher) return ''
  return `${teacher.teacherName || '未命名'} / ${teacher.phone || '-'}`
}

const formatParentLabel = (parent) => {
  if (!parent) return ''
  return `${parent.parentName || '未命名'} / ${parent.phone || '-'}`
}

const ensureOptionExists = (listRef, option, key = 'id') => {
  if (!option || !option[key]) return
  const exists = listRef.value.some(item => item[key] === option[key])
  if (!exists) {
    listRef.value = [...listRef.value, option]
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
    console.error('获取教师列表失败', error)
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
    console.error('获取家长列表失败', error)
  } finally {
    parentLoading.value = false
  }
}

const fetchDictionaryOptions = async () => {
  try {
    const [schools, grades, classes, campuses, subjects] = await Promise.all([
      getSchoolList({ pageSize: 100 }),
      getGradeList({ pageSize: 100 }),
      getClassList({ pageSize: 100 }),
      getCampusList({ pageSize: 100 }),
      getSubjectList({ pageSize: 100 }),
    ])
    schoolOptions.value = schools.data?.list || []
    gradeOptions.value = grades.data?.list || []
    classOptions.value = classes.data?.list || []
    campusOptions.value = campuses.data?.list || []
    subjectOptions.value = subjects.data?.list || []
  } catch (error) {
    console.error('加载字典失败', error)
    ElMessage.error('加载学校/年级/班级等选项失败，请稍后重试')
  }
}

const fetchHomeworkList = async () => {
  try {
    loading.value = true
    const result = await getHomeworkPageList({
      page: pagination.current,
      pageSize: pagination.size,
      ...filters,
      state: filters.state === '' ? undefined : filters.state,
    })

    if (result.code === 200 || result.code === 0) {
      homeworkList.value = result.data.list || []
      totalRecords.value = result.data.total || 0

      homeworkList.value.forEach((item) => {
        if (item.teacherId) {
          ensureOptionExists(teacherOptions, {
            id: item.teacherId,
            teacherName: item.teacherName,
            phone: item.teacherPhone,
          })
        }
        if (item.parentId) {
          ensureOptionExists(parentOptions, {
            id: item.parentId,
            parentName: item.parentName,
            phone: item.parentPhone,
          })
        }
      })
    } else {
      ElMessage.error(result.message || '获取作业列表失败')
    }
  } catch (error) {
    console.error('获取作业列表失败', error)
    ElMessage.error('获取作业列表失败，请稍后重试')
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
  fetchHomeworkList()
}

const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    teacherId: null,
    parentId: null,
    schoolId: null,
    subjectId: null,
    gradeId: null,
    campusId: null,
    clazzId: null,
    state: '',
  })
  pagination.current = 1
  fetchHomeworkList()
}

const handleViewDetail = (record) => {
  currentRecord.value = { ...record }
  detailVisible.value = true
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchHomeworkList()
})

onMounted(() => {
  fetchDictionaryOptions()
  fetchTeacherOptions()
  fetchParentOptions()
  fetchHomeworkList()
})
</script>
