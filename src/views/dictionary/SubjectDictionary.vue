<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">科目字典</span>
          <el-button type="primary" @click="handleCreate">新增科目</el-button>
        </div>
      </template>
      <el-form :model="filters" label-width="90" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <el-form-item label="科目名称">
          <el-input v-model="filters.keyword" placeholder="输入科目名称" clearable />
        </el-form-item>
        <el-form-item label="学段">
          <el-select v-model="filters.stage" placeholder="选择学段" clearable>
            <el-option label="小学" value="primary" />
            <el-option label="初中" value="junior" />
            <el-option label="高中" value="senior" />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="mt-4 flex justify-end gap-3">
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" @click="handleQuery">查询</el-button>
      </div>
    </el-card>

    <el-card class="pastel-card">
      <el-table :data="subjectList" stripe>
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="name" label="科目名称" min-width="160" />
        <el-table-column prop="stageLabel" label="学段" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="220" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleRemove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const filters = reactive({
  keyword: '',
  stage: '',
})

const subjectList = ref([
  { id: 'sub-1', name: '语文', stage: 'primary', stageLabel: '小学', description: '语文课程' },
  { id: 'sub-2', name: '数学', stage: 'primary', stageLabel: '小学', description: '数学课程' },
  { id: 'sub-3', name: '英语', stage: 'primary', stageLabel: '小学', description: '英语课程' },
])

const handleQuery = () => {
  ElMessage.info('根据筛选条件查询科目（示例数据）')
}

const handleReset = () => {
  Object.assign(filters, {
    keyword: '',
    stage: '',
  })
  handleQuery()
}

const handleCreate = () => {
  ElMessage.success('打开新增科目弹窗（待接入 API）')
}

const handleEdit = (row) => {
  ElMessage.info(`编辑科目：${row.name}`)
}

const handleRemove = (row) => {
  ElMessage.warning(`删除科目：${row.name}`)
}
</script>
