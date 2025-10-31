<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button type="primary" @click="handleCreate">新增学生</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="100" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <el-form-item label="学生姓名">
          <el-input v-model="filters.name" placeholder="输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.grade" placeholder="选择年级" clearable>
            <el-option label="一年级" value="一年级" />
            <el-option label="二年级" value="二年级" />
            <el-option label="三年级" value="三年级" />
            <el-option label="四年级" value="四年级" />
          </el-select>
        </el-form-item>
        <el-form-item label="家长姓名">
          <el-input v-model="filters.parentName" placeholder="输入家长姓名" clearable />
        </el-form-item>
        <el-form-item label="家长手机号">
          <el-input v-model="filters.parentMobile" placeholder="输入家长手机号" clearable />
        </el-form-item>
        <el-form-item label="代课教师">
          <el-select v-model="filters.teacherId" placeholder="选择教师" clearable>
            <el-option label="张老师" value="teacher-1" />
            <el-option label="李老师" value="teacher-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="学校">
          <el-select v-model="filters.schoolId" placeholder="选择学校" clearable>
            <el-option label="第一实验小学" value="school-1" />
            <el-option label="第二实验小学" value="school-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="年级筛选">
          <el-select v-model="filters.gradeId" placeholder="选择年级" clearable>
            <el-option label="一年级" value="grade-1" />
            <el-option label="二年级" value="grade-2" />
            <el-option label="三年级" value="grade-3" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="studentList" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="name" label="学生姓名" min-width="140" />
        <el-table-column prop="grade" label="年级" min-width="100" />
        <el-table-column label="已修课时" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-2">
              <el-progress
                :percentage="computeProgress(row)"
                :status="progressStatus(row)"
                :stroke-width="12"
                class="flex-1"
              />
              <span class="text-xs text-slate-500">
                {{ row.completedHours }}/{{ row.totalHours }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="parentName" label="家长姓名" min-width="120" />
        <el-table-column prop="parentMobile" label="家长手机号" min-width="140" />
        <el-table-column prop="teacherName" label="分配教师" min-width="120" />
        <el-table-column prop="teacherMobile" label="教师手机号" min-width="140" />
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button type="warning" link @click="handleToggle(row)">
              {{ row.disabled ? '启用' : '禁用' }}
            </el-button>
            <el-button type="info" link @click="handleUnbind(row)">解绑教师</el-button>
            <el-button type="success" link @click="handleBind(row)">绑定教师</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ pagination.total }} 名学生</div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({
  name: '',
  grade: '',
  parentName: '',
  parentMobile: '',
  teacherId: '',
  schoolId: '',
  gradeId: '',
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 58,
})

const studentList = ref([
  {
    id: 's1',
    name: '王小明',
    grade: '四年级',
    completedHours: 8,
    totalHours: 100,
    parentName: '王女士',
    parentMobile: '13812345678',
    teacherName: '张老师',
    teacherMobile: '13998765432',
    disabled: false,
  },
  {
    id: 's2',
    name: '李小华',
    grade: '三年级',
    completedHours: 60,
    totalHours: 80,
    parentName: '李先生',
    parentMobile: '13787654321',
    teacherName: '李老师',
    teacherMobile: '13623456789',
    disabled: false,
  },
  {
    id: 's3',
    name: '赵雨婷',
    grade: '二年级',
    completedHours: 20,
    totalHours: 60,
    parentName: '赵女士',
    parentMobile: '13511223344',
    teacherName: '孙老师',
    teacherMobile: '13900112233',
    disabled: true,
  },
])

const computeProgress = (row) => {
  if (!row.totalHours) return 0
  return Math.round((row.completedHours / row.totalHours) * 100)
}

const progressStatus = (row) => {
  const percentage = computeProgress(row)
  if (percentage >= 100) return 'success'
  if (percentage < 30) return 'exception'
  return 'active'
}

const handleQuery = () => {
  ElMessage.info('已根据筛选条件刷新学生列表（示例数据）')
}

const handleReset = () => {
  Object.assign(filters, {
    name: '',
    grade: '',
    parentName: '',
    parentMobile: '',
    teacherId: '',
    schoolId: '',
    gradeId: '',
  })
  pagination.current = 1
  handleQuery()
}

const handleCreate = () => {
  ElMessage.success('打开新增学生弹窗（待接入 API）')
}

const handleDetail = (row) => {
  ElMessage.info(`进入学生详情：${row.name}`)
}

const handleToggle = (row) => {
  ElMessage.warning(`${row.disabled ? '启用' : '禁用'}学生 ${row.name}（软删除）`)
  row.disabled = !row.disabled
}

const handleUnbind = (row) => {
  ElMessage.info(`解绑学生 ${row.name} 的教师`)
}

const handleBind = (row) => {
  ElMessage.success(`绑定学生 ${row.name} 的教师`)
}
</script>
