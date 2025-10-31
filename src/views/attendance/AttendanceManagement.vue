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
          <el-input v-model="filters.studentName" placeholder="输入学生姓名" clearable />
        </el-form-item>
        <el-form-item label="年级">
          <el-select v-model="filters.grade" placeholder="选择年级" clearable>
            <el-option label="一年级" value="一年级" />
            <el-option label="二年级" value="二年级" />
            <el-option label="三年级" value="三年级" />
            <el-option label="四年级" value="四年级" />
          </el-select>
        </el-form-item>
        <el-form-item label="代课老师">
          <el-select v-model="filters.teacherId" placeholder="选择教师" clearable>
            <el-option label="张老师" value="teacher-1" />
            <el-option label="李老师" value="teacher-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="签到日期">
          <el-date-picker
            v-model="filters.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
          />
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="records" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="studentName" label="学生姓名" min-width="140" />
        <el-table-column prop="grade" label="年级" min-width="100" />
        <el-table-column prop="assignedTeacher" label="分配老师" min-width="120" />
        <el-table-column prop="checkinTeacher" label="签到教师" min-width="120" />
        <el-table-column prop="checkinDate" label="签到日期" min-width="180" />
        <el-table-column label="签到照片" min-width="140">
          <template #default="{ row }">
            <el-image
              class="h-14 w-14 rounded-md object-cover"
              :src="row.photo"
              :preview-src-list="[row.photo]"
              preview-teleported
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="checkinTime" label="签到时间" min-width="140" />
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ pagination.total }} 条签到记录</div>
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
import dayjs from 'dayjs'
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({
  studentName: '',
  grade: '',
  teacherId: '',
  date: dayjs().format('YYYY-MM-DD'),
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 34,
})

const records = ref([
  {
    id: 'c1',
    studentName: '王小明',
    grade: '四年级',
    assignedTeacher: '张老师',
    checkinTeacher: '李老师',
    checkinDate: `${dayjs().format('YYYY-MM-DD')} 08:00`,
    photo: 'https://via.placeholder.com/120x120.png?text=签到',
    checkinTime: '08:00',
  },
  {
    id: 'c2',
    studentName: '李小华',
    grade: '三年级',
    assignedTeacher: '李老师',
    checkinTeacher: '李老师',
    checkinDate: `${dayjs().format('YYYY-MM-DD')} 08:10`,
    photo: 'https://via.placeholder.com/120x120.png?text=签到',
    checkinTime: '08:10',
  },
])

const handleQuery = () => {
  ElMessage.info(`查询 ${filters.date} 的签到记录（示例数据）`)
}

const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    grade: '',
    teacherId: '',
    date: dayjs().format('YYYY-MM-DD'),
  })
  pagination.current = 1
  handleQuery()
}
</script>
