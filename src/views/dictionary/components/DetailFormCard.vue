<template>
  <!-- 右侧：详情表单卡片 -->
  <el-card v-if="selectedNode" class="pastel-card dictionary-detail-card">
    <template #header>
      <div class="flex flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-500">节点详情</p>
        <el-breadcrumb separator="›" class="text-xs text-slate-400">
          <el-breadcrumb-item v-for="node in selectedPath" :key="node.id">{{ node.label }}</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </template>

    <div class="space-y-6">
      <!-- 节点类型标题 -->
      <div class="flex flex-wrap items-center gap-3">
        <h3 class="text-2xl font-semibold text-slate-900">{{ typeMeta[selectedNode.type].label }}信息</h3>
        <span :class="['node-type-chip', typeMeta[selectedNode.type].badgeClass]">
          {{ typeMeta[selectedNode.type].label }}
        </span>
      </div>

      <!-- 表单区域 -->
      <el-form :model="formData" label-width="100px" class="detail-form">
        <!-- 学校表单 -->
        <template v-if="selectedNode.type === 'school'">
          <el-form-item label="学校名称">
            <el-input v-model="formData.label" placeholder="请输入学校名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
          <el-form-item label="年级列表">
            <div class="readonly-list">
              <el-tag
                v-for="child in selectedNode.children"
                :key="child.id"
                class="mr-2 mb-2"
                type="info"
              >
                {{ child.label }}
              </el-tag>
              <span v-if="!selectedNode.children?.length" class="text-slate-400">暂无年级</span>
            </div>
          </el-form-item>
        </template>

        <!-- 年级表单 -->
        <template v-else-if="selectedNode.type === 'grade'">
          <el-form-item label="年级名称">
            <el-input v-model="formData.label" placeholder="请输入年级名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
          <el-form-item label="班级列表">
            <div class="readonly-list">
              <el-tag
                v-for="child in selectedNode.children"
                :key="child.id"
                class="mr-2 mb-2"
                type="info"
              >
                {{ child.label }}
              </el-tag>
              <span v-if="!selectedNode.children?.length" class="text-slate-400">暂无班级</span>
            </div>
          </el-form-item>
        </template>

        <!-- 班级表单 -->
        <template v-else-if="selectedNode.type === 'class'">
          <el-form-item label="班级名称">
            <el-input v-model="formData.label" placeholder="请输入班级名称" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="请输入备注信息" />
          </el-form-item>
          <el-form-item label="学生人数">
            <el-input v-model="formData.students" disabled>
              <template #suffix>人</template>
            </el-input>
          </el-form-item>
        </template>

        <!-- 保存按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
  <el-card v-else class="pastel-card dictionary-detail-card flex items-center justify-center">
    <el-empty description="请选择左侧字典节点" />
  </el-card>
</template>

<script setup>
/**
 * 详情表单卡片组件
 * 用于展示和编辑节点详细信息
 */
import { watch } from 'vue'

// 组件属性定义
const props = defineProps({
  /** 当前选中的节点 */
  selectedNode: {
    type: Object,
    default: null,
  },
  /** 当前选中节点的路径 */
  selectedPath: {
    type: Array,
    default: () => [],
  },
  /** 节点类型元数据 */
  typeMeta: {
    type: Object,
    required: true,
  },
  /** 表单数据 */
  formData: {
    type: Object,
    required: true,
  },
})

// 组件事件定义
const emit = defineEmits(['save'])

/**
 * 保存节点信息
 */
const handleSave = () => {
  emit('save')
}
</script>

<style scoped>
.dictionary-detail-card {
  border: 1px solid rgba(15, 118, 110, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 50px rgba(15, 118, 110, 0.08);
  backdrop-filter: blur(10px);
}

.node-type-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.25rem 0.9rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 只读列表样式 */
.readonly-list {
  min-height: 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(241, 245, 249, 0.5);
}
</style>
