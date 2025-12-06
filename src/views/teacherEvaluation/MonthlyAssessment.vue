<template>
  <div class="space-y-4">
    <!-- 筛选区域 -->
    <el-card class="pastel-card" shadow="never">
      <div class="flex items-end justify-between gap-4">
        <el-form :model="filters" label-width="80" size="small" class="flex gap-3 flex-1">
          <el-form-item label="所属校区">
            <el-select v-model="filters.campusId" placeholder="选择校区" clearable filterable>
              <el-option
                v-for="campus in campusOptions"
                :key="campus.id"
                :label="campus.dicName"
                :value="campus.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="所属月份">
            <el-date-picker
              v-model="filters.yearMonth"
              type="month"
              value-format="YYYY-MM"
              placeholder="选择年月"
              clearable
            />
          </el-form-item>
        </el-form>
        <div class="flex gap-2">
          <el-button size="small" @click="handleReset"> 重置 </el-button>
          <el-button size="small" type="primary" @click="handleQuery"> 查询 </el-button>
        </div>
      </div>
    </el-card>

    <!-- 教师列表 -->
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">教师考核列表</span>
          <div class="flex gap-2">
            <el-button size="small" type="primary" @click="handleOpenSingleAdd">
              新增评级
            </el-button>
            <el-button size="small" type="success" @click="handleOpenBatchAdd">
              批量新增
            </el-button>
          </div>
        </div>
      </template>
      <el-table :data="teacherList" :loading="loading" stripe>
        <el-table-column prop="teacherId" label="ID" width="80" />
        <el-table-column label="教师信息" min-width="200">
          <template #default="{ row }">
            <div class="font-medium text-slate-800">
              {{ row.teacherName || '-' }}
            </div>
            <div class="text-xs text-slate-400">
              {{ row.teacherPhone || '未提供手机号' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="campusName" label="所属校区" min-width="120" />
        <el-table-column prop="levelName" label="评级等级" min-width="120" />
        <el-table-column prop="yearmonth" label="月份" min-width="120" />
        <el-table-column prop="descption" label="评级描述" min-width="180" />
        <el-table-column prop="userName" label="操作人" min-width="120" />
      </el-table>
    </el-card>

    <!-- 单个新增对话框 -->
    <el-dialog
      v-model="singleDialogVisible"
      title="新增教师评级"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="singleFormRef"
        :model="singleFormData"
        :rules="singleFormRules"
        label-width="80px"
      >
        <el-form-item label="教师" prop="teacherId">
          <el-select
            v-model="singleFormData.teacherId"
            placeholder="选择教师"
            class="w-full"
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
        <el-form-item label="月份" prop="yearmonth">
          <el-date-picker
            v-model="singleFormData.yearmonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择年月"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="评级" prop="levelId">
          <el-select v-model="singleFormData.levelId" placeholder="选择评级" class="w-full">
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
            v-model="singleFormData.descption"
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
          <el-button @click="singleDialogVisible = false"> 取消 </el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSingleSubmit">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 批量新增对话框 -->
    <el-dialog
      v-model="batchDialogVisible"
      title="批量新增教师评级"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form ref="batchFormRef" :model="batchFormData" :rules="batchFormRules" label-width="80px">
        <el-form-item label="教师" prop="teacherIds">
          <el-select
            v-model="batchFormData.teacherIds"
            placeholder="选择多个教师"
            class="w-full"
            multiple
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
        <el-form-item label="月份" prop="yearMonth">
          <el-date-picker
            v-model="batchFormData.yearMonth"
            type="month"
            value-format="YYYY-MM"
            placeholder="选择年月"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="评级" prop="levelId">
          <el-select v-model="batchFormData.levelId" placeholder="选择评级" class="w-full">
            <el-option
              v-for="level in levelOptions"
              :key="level.id"
              :label="level.dicName"
              :value="level.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="batchFormData.description"
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
          <el-button @click="batchDialogVisible = false"> 取消 </el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleBatchSubmit">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  getTeacherLevelList,
  addTeacherLevel,
  addTeacherLevelBatch,
} from '@/api/curd/teacherLevel.js'
import { getCampusList, getTeacherRatingList, getTeacherComboxList } from '@/api/curd/dictionary.js'

// ========== 工具函数 ==========
const getCurrentYearMonth = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// ========== 筛选条件 ==========
const filters = reactive({
  campusId: null,
  yearMonth: getCurrentYearMonth(),
})

// ========== 教师列表 ==========
const teacherList = ref([])
const loading = ref(false)

// ========== 下拉选项 ==========
const campusOptions = ref([])
const levelOptions = ref([])
const teacherOptions = ref([])
const teacherLoading = ref(false)

// ========== 单个新增对话框 ==========
const singleDialogVisible = ref(false)
const singleFormRef = ref(null)
const singleFormData = reactive({
  teacherId: null,
  yearmonth: getCurrentYearMonth(),
  levelId: null,
  descption: '',
})
const singleFormRules = {
  teacherId: [{ required: true, message: '请选择教师', trigger: 'change' }],
  yearmonth: [{ required: true, message: '请选择月份', trigger: 'change' }],
  levelId: [{ required: true, message: '请选择评级', trigger: 'change' }],
  descption: [{ required: true, message: '请填写描述', trigger: 'blur' }],
}

// ========== 批量新增对话框 ==========
const batchDialogVisible = ref(false)
const batchFormRef = ref(null)
const batchFormData = reactive({
  teacherIds: [],
  yearMonth: getCurrentYearMonth(),
  levelId: null,
  description: '',
})
const batchFormRules = {
  teacherIds: [{ required: true, message: '请至少选择一个教师', trigger: 'change' }],
  yearMonth: [{ required: true, message: '请选择月份', trigger: 'change' }],
  levelId: [{ required: true, message: '请选择评级', trigger: 'change' }],
  description: [{ required: true, message: '请填写描述', trigger: 'blur' }],
}

const submitLoading = ref(false)

// ========== 格式化函数 ==========
/**
 * 格式化教师标签显示
 */
const formatTeacherLabel = (teacher) => {
  if (!teacher) return ''
  return `${teacher.teacherName || '未命名'} / ${teacher.phone || '-'}`
}

// ========== 获取下拉选项数据 ==========
/**
 * 获取校区列表
 */
const fetchCampusOptions = async () => {
  try {
    const result = await getCampusList({ pageSize: 100 })
    campusOptions.value = result.data?.list || []
  } catch (error) {
    console.error('获取校区字典失败:', error)
    ElMessage.error('加载校区字典失败，请稍后重试')
  }
}

/**
 * 获取评级列表
 */
const fetchLevelOptions = async () => {
  try {
    const result = await getTeacherRatingList({ pageSize: 100 })
    levelOptions.value = result.data?.list || []
  } catch (error) {
    console.error('获取评级字典失败:', error)
    ElMessage.error('加载评级字典失败，请稍后重试')
  }
}

/**
 * 获取教师列表（支持关键词搜索）
 */
const fetchTeacherOptions = async (keyword = '') => {
  try {
    teacherLoading.value = true
    const result = await getTeacherComboxList()
    let list = result.data || []
    if (keyword) {
      list = list.filter(
        (item) => item.phone?.includes(keyword) || item.teacherName?.includes(keyword)
      )
    }
    teacherOptions.value = list
  } catch (error) {
    console.error('获取教师列表失败:', error)
    ElMessage.error('获取教师列表失败，请稍后重试')
  } finally {
    teacherLoading.value = false
  }
}

/**
 * 远程搜索教师
 */
const handleTeacherRemote = (query) => {
  fetchTeacherOptions(query)
}

// ========== 获取教师考核列表 ==========
/**
 * 获取教师及评价信息列表
 */
const fetchTeacherLevelList = async () => {
  try {
    loading.value = true
    const result = await getTeacherLevelList({
      campusId: filters.campusId || undefined,
      yearMonth: filters.yearMonth || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      teacherList.value = result.data || []
    } else {
      ElMessage.error(result.message || '获取教师考核列表失败')
    }
  } catch (error) {
    console.error('获取教师考核列表失败:', error)
    ElMessage.error('获取教师考核列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ========== 筛选操作 ==========
/**
 * 查询操作
 */
const handleQuery = () => {
  fetchTeacherLevelList()
}

/**
 * 重置筛选条件
 */
const handleReset = () => {
  Object.assign(filters, {
    campusId: null,
    yearMonth: getCurrentYearMonth(),
  })
  fetchTeacherLevelList()
}

// ========== 单个新增 ==========
/**
 * 打开单个新增对话框
 */
const handleOpenSingleAdd = () => {
  Object.assign(singleFormData, {
    teacherId: null,
    yearmonth: getCurrentYearMonth(),
    levelId: null,
    descption: '',
  })
  singleDialogVisible.value = true
  nextTick(() => {
    singleFormRef.value?.clearValidate?.()
  })
}

/**
 * 提交单个新增
 */
const handleSingleSubmit = () => {
  singleFormRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      submitLoading.value = true
      await addTeacherLevel({
        teacherId: singleFormData.teacherId,
        yearmonth: singleFormData.yearmonth,
        levelId: singleFormData.levelId,
        descption: singleFormData.descption,
      })
      ElMessage.success('新增评级成功')
      singleDialogVisible.value = false
      await fetchTeacherLevelList()
    } catch (error) {
      console.error('新增评级失败:', error)
      ElMessage.error(error.message || '新增失败，请稍后重试')
    } finally {
      submitLoading.value = false
    }
  })
}

// ========== 批量新增 ==========
/**
 * 打开批量新增对话框
 */
const handleOpenBatchAdd = () => {
  Object.assign(batchFormData, {
    teacherIds: [],
    yearMonth: getCurrentYearMonth(),
    levelId: null,
    description: '',
  })
  batchDialogVisible.value = true
  nextTick(() => {
    batchFormRef.value?.clearValidate?.()
  })
}

/**
 * 提交批量新增
 */
const handleBatchSubmit = () => {
  batchFormRef.value?.validate(async (valid) => {
    if (!valid) return
    try {
      submitLoading.value = true
      await addTeacherLevelBatch({
        teacherIds: batchFormData.teacherIds,
        yearMonth: batchFormData.yearMonth,
        levelId: batchFormData.levelId,
        description: batchFormData.description,
      })
      ElMessage.success(`成功为 ${batchFormData.teacherIds.length} 位教师添加评级`)
      batchDialogVisible.value = false
      await fetchTeacherLevelList()
    } catch (error) {
      console.error('批量新增评级失败:', error)
      ElMessage.error(error.message || '批量新增失败，请稍后重试')
    } finally {
      submitLoading.value = false
    }
  })
}

// ========== 组件挂载 ==========
onMounted(() => {
  fetchCampusOptions()
  fetchLevelOptions()
  fetchTeacherOptions()
  fetchTeacherLevelList()
})
</script>
