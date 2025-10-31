<template>
  <div class="space-y-4">
    <el-card class="pastel-card">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold text-slate-800">基础字典维护</span>
          <el-button type="primary" @click="handleCreate(activeTab)">新增{{ currentTabLabel }}</el-button>
        </div>
      </template>

      <el-tabs v-model="activeTab" class="dictionary-tabs">
        <el-tab-pane label="学校字典" name="schools">
          <dictionary-table
            :columns="schoolColumns"
            :data="schoolList"
            empty-text="暂无学校字典数据"
            @edit="handleEdit"
            @remove="handleRemove"
          />
        </el-tab-pane>
        <el-tab-pane label="年级字典" name="grades">
          <dictionary-table
            :columns="gradeColumns"
            :data="gradeList"
            empty-text="暂无年级字典数据"
            @edit="handleEdit"
            @remove="handleRemove"
          />
        </el-tab-pane>
        <el-tab-pane label="班级字典" name="classes">
          <dictionary-table
            :columns="classColumns"
            :data="classList"
            empty-text="暂无班级字典数据"
            @edit="handleEdit"
            @remove="handleRemove"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

import DictionaryTable from './components/DictionaryTable.vue'

const activeTab = ref('schools')

const schoolList = ref([
  { id: 'school-1', name: '第一实验小学', region: '江南区', remark: '重点合作学校' },
  { id: 'school-2', name: '第二实验小学', region: '海曙区', remark: '与托管中心共建' },
])

const gradeList = ref([
  { id: 'grade-1', name: '一年级', stage: '小学', remark: '含 1-2 班' },
  { id: 'grade-2', name: '二年级', stage: '小学', remark: '含 1-2 班' },
  { id: 'grade-3', name: '三年级', stage: '小学', remark: '含 1-3 班' },
])

const classList = ref([
  { id: 'class-1', name: '一年级一班', leader: '张老师' },
  { id: 'class-2', name: '二年级二班', leader: '李老师' },
  { id: 'class-3', name: '三年级一班', leader: '赵老师' },
])

const schoolColumns = [
  { prop: 'name', label: '学校名称', minWidth: 200 },
  { prop: 'region', label: '所属区域', minWidth: 140 },
  { prop: 'remark', label: '备注', minWidth: 220 },
]

const gradeColumns = [
  { prop: 'name', label: '年级名称', minWidth: 160 },
  { prop: 'stage', label: '学段', minWidth: 120 },
  { prop: 'remark', label: '备注', minWidth: 220 },
]

const classColumns = [
  { prop: 'name', label: '班级名称', minWidth: 160 },
  { prop: 'leader', label: '班主任', minWidth: 140 },
]

const tabLabelMap = {
  schools: '学校',
  grades: '年级',
  classes: '班级',
}

const currentTabLabel = computed(() => tabLabelMap[activeTab.value])

const handleCreate = (tab) => {
  ElMessage.success(`新增${tabLabelMap[tab]}记录（待接入 API）`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑字典：${row.name}`)
}

const handleRemove = (row) => {
  ElMessage.warning(`删除字典：${row.name}`)
}
</script>
