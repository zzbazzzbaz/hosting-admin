<template>
  <div class="space-y-4">
    <el-card class="pastel-card" shadow="never">
      <div class="flex items-end justify-between gap-4">
        <el-form :model="filters" label-width="80" size="small" class="flex gap-3 flex-1 flex-wrap">
          <el-form-item label="学生姓名">
            <el-input v-model="filters.studentName" placeholder="输入学生姓名" clearable />
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
          <el-form-item label="学生">
            <el-select v-model="filters.studentId" placeholder="选择学生" clearable filterable>
              <el-option
                v-for="item in studentOptions"
                :key="item.id"
                :label="item.studentName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="flex gap-2 flex-shrink-0">
          <el-button size="small" @click="handleReset"> 重置 </el-button>
          <el-button size="small" type="primary" @click="handleQuery"> 查询 </el-button>
        </div>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">成绩列表</span>
          <el-button type="primary" @click="handleAdd"> 添加成绩 </el-button>
        </div>
      </template>
      <el-table :data="scoreList" :loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="学生" min-width="160">
          <template #default="{ row }">
            <div class="font-medium text-slate-800">
              {{ row.studentName || '-' }}
            </div>
            <div class="text-xs text-slate-400">
              {{ row.schoolName || '未分配学校' }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="gradeName" label="年级" min-width="100" />
        <el-table-column prop="clazzName" label="班级" min-width="100" />
        <el-table-column prop="yearmonth" label="年月" width="120" />
        <el-table-column prop="chineseScore" label="语文" width="80" />
        <el-table-column prop="mathScore" label="数学" width="80" />
        <el-table-column prop="englishScore" label="英语" width="80" />
        <el-table-column prop="physicsScore" label="物理" width="80" />
        <el-table-column prop="chemistryScore" label="化学" width="80" />
        <el-table-column prop="organismScore" label="生物" width="80" />
        <el-table-column prop="historyScore" label="历史" width="80" />
        <el-table-column prop="politicsScore" label="政治" width="80" />
        <el-table-column prop="geographyScore" label="地理" width="80" />
        <el-table-column prop="description" label="备注" min-width="150" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)"> 编辑 </el-button>
            <el-button link type="danger" @click="handleDelete(row)"> 删除 </el-button>
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

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="学生" prop="studentId">
          <el-select
            v-model="formData.studentId"
            placeholder="选择学生"
            filterable
            :disabled="isEdit"
          >
            <el-option
              v-for="item in studentOptions"
              :key="item.id"
              :label="item.studentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年月" prop="yearmonth">
          <el-date-picker
            v-model="formData.yearmonth"
            type="month"
            placeholder="选择年月"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="语文">
          <el-input-number
            v-model="formData.chineseScore"
            :min="0"
            :max="150"
            placeholder="语文成绩"
          />
        </el-form-item>
        <el-form-item label="数学">
          <el-input-number
            v-model="formData.mathScore"
            :min="0"
            :max="150"
            placeholder="数学成绩"
          />
        </el-form-item>
        <el-form-item label="英语">
          <el-input-number
            v-model="formData.englishScore"
            :min="0"
            :max="150"
            placeholder="英语成绩"
          />
        </el-form-item>
        <el-form-item label="物理">
          <el-input-number
            v-model="formData.physicsScore"
            :min="0"
            :max="100"
            placeholder="物理成绩"
          />
        </el-form-item>
        <el-form-item label="化学">
          <el-input-number
            v-model="formData.chemistryScore"
            :min="0"
            :max="100"
            placeholder="化学成绩"
          />
        </el-form-item>
        <el-form-item label="生物">
          <el-input-number
            v-model="formData.organismScore"
            :min="0"
            :max="100"
            placeholder="生物成绩"
          />
        </el-form-item>
        <el-form-item label="历史">
          <el-input-number
            v-model="formData.historyScore"
            :min="0"
            :max="100"
            placeholder="历史成绩"
          />
        </el-form-item>
        <el-form-item label="政治">
          <el-input-number
            v-model="formData.politicsScore"
            :min="0"
            :max="100"
            placeholder="政治成绩"
          />
        </el-form-item>
        <el-form-item label="地理">
          <el-input-number
            v-model="formData.geographyScore"
            :min="0"
            :max="100"
            placeholder="地理成绩"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false"> 取消 </el-button>
        <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getScorePageList, addScore, updateScore, deleteScore } from '@/api/curd/score'
import {
  getSchoolList,
  getGradeList,
  getClassList,
  getCampusList,
  getTeacherComboxList,
  getParentComboxList,
  getStudentComboxList,
} from '@/api/curd/dictionary'

// 筛选条件
const filters = reactive({
  studentName: '',
  schoolId: null,
  gradeId: null,
  clazzId: null,
  campusId: null,
  parentId: null,
  teacherId: null,
  studentId: null,
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
})

// 列表数据
const scoreList = ref([])
const totalRecords = ref(0)
const loading = ref(false)

// 下拉选项
const schoolOptions = ref([])
const gradeOptions = ref([])
const classOptions = ref([])
const campusOptions = ref([])
const parentOptions = ref([])
const parentLoading = ref(false)
const teacherOptions = ref([])
const teacherLoading = ref(false)
const studentOptions = ref([])

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,
  studentId: null,
  yearmonth: '',
  chineseScore: null,
  mathScore: null,
  englishScore: null,
  physicsScore: null,
  chemistryScore: null,
  organismScore: null,
  historyScore: null,
  politicsScore: null,
  geographyScore: null,
  description: '',
})

const formRules = {
  studentId: [{ required: true, message: '请选择学生', trigger: 'change' }],
  yearmonth: [{ required: true, message: '请选择年月', trigger: 'change' }],
}

const dialogTitle = computed(() => (isEdit.value ? '编辑成绩' : '添加成绩'))

// 加载字典选项
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
    ElMessage.error('加载学校/年级等选项失败')
  }
}

// 加载家长选项
const fetchParentOptions = async (keyword = '') => {
  try {
    parentLoading.value = true
    const result = await getParentComboxList()
    let list = result.data || []
    if (keyword) {
      list = list.filter(
        (item) => item.phone?.includes(keyword) || item.parentName?.includes(keyword)
      )
    }
    parentOptions.value = list
  } catch (error) {
    console.error('获取家长列表失败:', error)
  } finally {
    parentLoading.value = false
  }
}

// 加载教师选项
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
  } finally {
    teacherLoading.value = false
  }
}

// 加载学生选项
const fetchStudentOptions = async () => {
  try {
    const result = await getStudentComboxList()
    studentOptions.value = result.data || []
  } catch (error) {
    console.error('获取学生列表失败:', error)
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

// 获取成绩列表
const fetchScoreList = async () => {
  try {
    loading.value = true
    const result = await getScorePageList({
      page: pagination.current,
      pageSize: pagination.size,
      studentName: filters.studentName?.trim() || undefined,
      schoolId: filters.schoolId || undefined,
      gradeId: filters.gradeId || undefined,
      clazzId: filters.clazzId || undefined,
      campusId: filters.campusId || undefined,
      parentId: filters.parentId || undefined,
      teacherId: filters.teacherId || undefined,
      studentId: filters.studentId || undefined,
    })

    if (result.code === 200 || result.code === 0) {
      scoreList.value = result.data.list || []
      totalRecords.value = result.data.total || 0
    } else {
      ElMessage.error(result.message || '获取成绩列表失败')
    }
  } catch (error) {
    console.error('获取成绩列表失败:', error)
    ElMessage.error('获取成绩列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  pagination.current = 1
  fetchScoreList()
}

// 重置
const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    schoolId: null,
    gradeId: null,
    clazzId: null,
    campusId: null,
    parentId: null,
    teacherId: null,
    studentId: null,
  })
  pagination.current = 1
  fetchScoreList()
}

// 添加
const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: null,
    studentId: null,
    yearmonth: '',
    chineseScore: null,
    mathScore: null,
    englishScore: null,
    physicsScore: null,
    chemistryScore: null,
    organismScore: null,
    historyScore: null,
    politicsScore: null,
    geographyScore: null,
    description: '',
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    studentId: row.studentId,
    yearmonth: row.yearmonth,
    chineseScore: row.chineseScore,
    mathScore: row.mathScore,
    englishScore: row.englishScore,
    physicsScore: row.physicsScore,
    chemistryScore: row.chemistryScore,
    organismScore: row.organismScore,
    historyScore: row.historyScore,
    politicsScore: row.politicsScore,
    geographyScore: row.geographyScore,
    description: row.description,
  })
  dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      await updateScore(formData.id, formData)
      ElMessage.success('更新成绩成功')
    } else {
      await addScore(formData)
      ElMessage.success('添加成绩成功')
    }

    dialogVisible.value = false
    await fetchScoreList()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条成绩记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await deleteScore(row.id)
    ElMessage.success('删除成功')
    await fetchScoreList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 监听分页变化
watch([() => pagination.current, () => pagination.size], () => {
  fetchScoreList()
})

// 初始化
onMounted(() => {
  fetchDictionaryOptions()
  fetchParentOptions()
  fetchTeacherOptions()
  fetchStudentOptions()
  fetchScoreList()
})
</script>
