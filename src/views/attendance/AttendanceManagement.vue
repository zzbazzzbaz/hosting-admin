<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button
            type="primary"
            @click="handleQuery"
          >
            刷新
          </el-button>
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
        <el-form-item label="签到教师">
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
              v-for="parent in parentOptions"
              :key="parent.id"
              :label="formatParentLabel(parent)"
              :value="parent.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="签到日期">
          <el-date-picker
            v-model="filters.createDate"
            type="date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            class="w-full"
            clearable
          />
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
      <el-table
        :data="signinList"
        :loading="loading"
        stripe
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          label="学生姓名"
          min-width="180"
        >
          <template #default="{ row }">
            <span class="font-medium text-slate-800">{{ row.studentName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="签到教师"
          min-width="160"
        >
          <template #default="{ row }">
            <span>{{ row.checkinTeacherName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="签到时间"
          min-width="180"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          label="签到图片"
          min-width="240"
        >
          <template #default="{ row }">
            <div
              v-if="row.picList?.length"
              class="flex flex-wrap gap-2"
            >
              <el-image
                v-for="pic in row.picList"
                :key="pic.id || pic"
                class="h-16 w-16 rounded-md border border-slate-200 object-cover"
                :src="getImageSrc(pic)"
                :preview-src-list="getPreviewList(row.picList)"
                fit="cover"
                preview-teleported
              />
            </div>
            <span
              v-else
              class="text-xs text-slate-400"
            >暂无图片</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="120"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">
          共 {{ totalRecords }} 条签到记录
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

    <el-dialog
      v-model="detailVisible"
      title="签到详情"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-descriptions
        :column="2"
        border
        class="rounded-lg"
      >
        <el-descriptions-item label="记录 ID">
          {{ currentRecord?.id || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="学生姓名">
          {{ currentRecord?.studentName || currentRecord?.student?.studentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="家长">
          {{ currentRecord?.parentName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="学校">
          {{ currentRecord?.schoolName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="年级">
          {{ currentRecord?.gradeName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="班级">
          {{ currentRecord?.clazzName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="校区">
          {{ currentRecord?.campusName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="签到教师">
          {{ currentRecord?.checkinTeacherName || currentRecord?.teacherName || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="签到时间">
          {{ formatDateTime(currentRecord?.createTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <div class="mt-5">
        <div class="mb-2 font-medium text-slate-700">
          签到图片
        </div>
        <div
          v-if="currentRecord?.picList?.length"
          class="flex flex-wrap gap-3"
        >
          <el-image
            v-for="pic in currentRecord?.picList"
            :key="pic.id || pic"
            class="h-28 w-28 rounded-md border border-slate-200 object-cover"
            :src="getImageSrc(pic)"
            :preview-src-list="getPreviewList(currentRecord?.picList || [])"
            fit="cover"
            preview-teleported
          />
        </div>
        <div
          v-else
          class="text-sm text-slate-400"
        >
          暂无签到图片
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSigninPageList } from '@/api/curd/signin'
import { getTeacherPageList } from '@/api/curd/teacher'
import { getParentPageList } from '@/api/curd/parent'

const filters = reactive({
  studentName: '',
  teacherId: null,
  parentId: null,
  createDate: null,
})

const pagination = reactive({
  current: 1,
  size: 10,
})

const signinList = ref([])
const totalRecords = ref(0)
const loading = ref(false)

const teacherOptions = ref([])
const parentOptions = ref([])

const teacherLoading = ref(false)
const parentLoading = ref(false)

const detailVisible = ref(false)
const currentRecord = ref(null)

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return '-'
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

const formatTeacherLabel = (teacher) => {
  if (!teacher) return ''
  return `${teacher.teacherName || '未命名'} / ${teacher.phone || '-'}`
}

const formatParentLabel = (parent) => {
  if (!parent) return ''
  return `${parent.parentName || '未命名'} / ${parent.phone || '-'}`
}

const getImageSrc = (pic) => {
  if (!pic) return ''
  if (typeof pic === 'string') {
    return pic
  }
  return pic.imgpath || pic.imgPath || pic.url || pic.path || ''
}

const getPreviewList = (picList = []) => {
  return picList.map(getImageSrc).filter((url) => !!url)
}

const ensureOptionExists = (optionsRef, option, key = 'id') => {
  if (!option || !option[key]) return
  const exists = optionsRef.value.some((item) => item[key] === option[key])
  if (!exists) {
    optionsRef.value = [...optionsRef.value, option]
  }
}

const fetchSigninList = async () => {
  try {
    loading.value = true
    const result = await getSigninPageList({
      page: pagination.current,
      pageSize: pagination.size,
      studentName: filters.studentName?.trim() || undefined,
      teacherId: filters.teacherId || undefined,
      parentId: filters.parentId || undefined,
      createTime: filters.createDate || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      signinList.value = result.data.list || []
      totalRecords.value = result.data.total || 0

      signinList.value.forEach((record) => {
        if (record.checkinTeacherId || record.teacher?.id) {
          ensureOptionExists(teacherOptions, {
            id: record.checkinTeacherId || record.teacher?.id,
            teacherName: record.checkinTeacherName || record.teacher?.teacherName,
            phone: record.checkinTeacherPhone || record.teacher?.phone,
          })
        }
        if (record.parentId || record.student?.parent?.id) {
          ensureOptionExists(parentOptions, {
            id: record.parentId || record.student?.parent?.id,
            parentName: record.parentName || record.student?.parent?.parentName,
            phone: record.parentPhone || record.student?.parent?.phone,
          })
        }
      })
    } else {
      ElMessage.error(result.message || '获取签到列表失败')
    }
  } catch (error) {
    console.error('获取签到列表失败:', error)
    ElMessage.error('获取签到列表失败，请稍后重试')
  } finally {
    loading.value = false
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

const handleTeacherRemote = (query) => {
  fetchTeacherOptions(query)
}

const handleParentRemote = (query) => {
  fetchParentOptions(query)
}

const handleQuery = () => {
  pagination.current = 1
  fetchSigninList()
}

const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    teacherId: null,
    parentId: null,
    createDate: null,
  })
  pagination.current = 1
  fetchSigninList()
}

const handleViewDetail = (record) => {
  currentRecord.value = { ...record }
  detailVisible.value = true
}

watch([() => pagination.current, () => pagination.size], () => {
  fetchSigninList()
})

onMounted(() => {
  fetchSigninList()
  fetchTeacherOptions()
  fetchParentOptions()
})
</script>
