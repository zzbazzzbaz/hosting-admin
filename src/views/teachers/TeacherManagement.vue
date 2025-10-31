<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">筛选条件</span>
          <el-button type="primary" @click="handleCreate">新增教师</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <el-form-item label="教师姓名">
          <el-input v-model="filters.name" placeholder="输入姓名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.mobile" placeholder="输入手机号" clearable />
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="filters.classId" placeholder="选择班级" clearable>
            <el-option label="一年级一班" value="class-1-1" />
            <el-option label="二年级二班" value="class-2-2" />
            <el-option label="三年级一班" value="class-3-1" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="在职" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="teacherList" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="name" label="教师姓名" min-width="140" />
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="studentCount" label="学生数量" min-width="120" />
        <el-table-column prop="statusLabel" label="状态" min-width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button type="warning" link @click="handleToggle(row)">
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-xs text-slate-500">共 {{ pagination.total }} 位教师</div>
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
  mobile: '',
  classId: '',
  status: '',
})

const pagination = reactive({
  current: 1,
  size: 20,
  total: 12,
})

const teacherList = ref([
  {
    id: 't1',
    name: '张老师',
    mobile: '13812345678',
    studentCount: 25,
    status: 'active',
    statusLabel: '在职',
  },
  {
    id: 't2',
    name: '李老师',
    mobile: '13987654321',
    studentCount: 18,
    status: 'disabled',
    statusLabel: '禁用',
  },
])

const handleQuery = () => {
  ElMessage.info('已根据筛选条件刷新教师列表（示例数据）')
}

const handleReset = () => {
  Object.assign(filters, {
    name: '',
    mobile: '',
    classId: '',
    status: '',
  })
  pagination.current = 1
  handleQuery()
}

const handleCreate = () => {
  ElMessage.success('打开新增教师弹窗（待接入 API）')
}

const handleDetail = (row) => {
  ElMessage.info(`进入教师详情：${row.name}`)
}

const handleToggle = (row) => {
  ElMessage.warning(`${row.status === 'active' ? '禁用' : '启用'}教师 ${row.name}`)
}

const handleDelete = (row) => {
  ElMessage.error(`删除教师 ${row.name}（软删除）`)
}
</script>
