<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button type="primary" @click="handleQuery">查询</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="100" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          <el-select v-model="filters.teacherId" placeholder="选择老师" clearable>
            <el-option label="张老师" value="teacher-1" />
            <el-option label="李老师" value="teacher-2" />
          </el-select>
        </el-form-item>
        <el-form-item label="布置日期">
          <el-date-picker
            v-model="filters.assignedDate"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
            unlink-panels
            clearable
          />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="filters.dueDate"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            class="w-full"
            unlink-panels
            clearable
          />
        </el-form-item>
        <el-form-item label="作业状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable>
            <el-option label="未开始" value="pending" />
            <el-option label="进行中" value="progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="逾期" value="overdue" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="homeworkList" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="studentName" label="学生姓名" min-width="140" />
        <el-table-column prop="grade" label="年级" min-width="100" />
        <el-table-column prop="assignedTeacher" label="分配老师" min-width="120" />
        <el-table-column prop="assignedAt" label="布置日期" min-width="140" />
        <el-table-column prop="statusLabel" label="作业状态" min-width="120" />
        <el-table-column prop="dueAt" label="截止日期" min-width="140" />
        <el-table-column prop="completedAt" label="完成时间" min-width="140" />
        <el-table-column label="操作" width="360" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleView('detail', row)">作业详情</el-button>
            <el-button type="success" link @click="handleView('completion', row)">完成详情</el-button>
            <el-button type="info" link @click="handleView('comment', row)">教师评语</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ pagination.total }} 条作业记录</div>
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
  studentName: '',
  grade: '',
  teacherId: '',
  assignedDate: null,
  dueDate: null,
  status: '',
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 45,
})

const homeworkList = ref([
  {
    id: 'h1',
    studentName: '王小明',
    grade: '四年级',
    assignedTeacher: '张老师',
    assignedAt: '2024-11-28',
    dueAt: '2024-11-30',
    status: 'completed',
    statusLabel: '已完成',
    completedAt: '2024-11-29 19:20',
  },
  {
    id: 'h2',
    studentName: '李小华',
    grade: '三年级',
    assignedTeacher: '李老师',
    assignedAt: '2024-11-27',
    dueAt: '2024-11-29',
    status: 'overdue',
    statusLabel: '逾期未完成',
    completedAt: '--',
  },
])

const handleQuery = () => {
  ElMessage.info('根据筛选条件刷新作业列表（示例数据）')
}

const handleReset = () => {
  Object.assign(filters, {
    studentName: '',
    grade: '',
    teacherId: '',
    assignedDate: null,
    dueDate: null,
    status: '',
  })
  pagination.current = 1
  handleQuery()
}

const handleView = (type, row) => {
  const map = {
    detail: '查看作业详情',
    completion: '查看完成详情',
    comment: '查看教师评语',
  }
  ElMessage.info(`${map[type]}：${row.studentName}`)
}
</script>
