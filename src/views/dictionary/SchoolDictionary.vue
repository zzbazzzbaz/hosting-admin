<template>
  <section class="dictionary-screen space-y-6">
    <div class="grid gap-6 xl:grid-cols-[1.4fr_2fr]">
      <!-- 左侧：树状预览卡片 -->
      <TreePreviewCard
        ref="treeCardRef"
        :dictionary-tree="dictionaryTree"
        :tree-props="treeProps"
        :type-meta="typeMeta"
        :next-type-map="nextTypeMap"
        @node-click="handleNodeClick"
        @add="handleAdd"
        @remove="handleRemove"
      />

      <!-- 右侧：详情表单卡片 -->
      <DetailFormCard
        v-model:form-data="formData"
        :selected-node="selectedNode"
        :selected-path="selectedPath"
        :type-meta="typeMeta"
        @save="handleSave"
      />
    </div>
  </section>
</template>

<script setup>
/**
 * 学校字典树形管理页面
 * 用于展示和管理学校-年级-班级-科目的层级结构
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import TreePreviewCard from './components/TreePreviewCard.vue'
import DetailFormCard from './components/DetailFormCard.vue'

// ==================== 数据定义 ====================

/**
 * 树形数据源
 * 包含完整的学校-年级-班级-科目层级结构
 */
const dictionaryTree = ref([
  {
    id: 'school-001',
    label: '南星托管学校',
    type: 'school',
    region: '滨江区',
    contact: '林秋',
    remark: '重点示范校',
    hotline: '0571-8899 1001',
    children: [
      {
        id: 'grade-001',
        label: '一年级',
        type: 'grade',
        stage: '小学',
        remark: '2 个教学班',
        children: [
          {
            id: 'class-001',
            label: '一年级 1 班',
            type: 'class',
            leader: '张老师',
            students: 32,
            room: 'A101',
            scheduleSummary: '上午 + 下午',
            children: [
              {
                id: 'subject-001',
                label: '语文',
                type: 'subject',
                teacher: '王语',
                schedule: '周一 / 周三',
                resource: '部编版',
              },
              {
                id: 'subject-002',
                label: '数学',
                type: 'subject',
                teacher: '陈晨',
                schedule: '周二 / 周四',
                resource: '苏教版',
              },
            ],
          },
          {
            id: 'class-002',
            label: '一年级 2 班',
            type: 'class',
            leader: '李老师',
            students: 34,
            room: 'A102',
            scheduleSummary: '上午',
            children: [
              {
                id: 'subject-003',
                label: '语文',
                type: 'subject',
                teacher: '王语',
                schedule: '周一 / 周四',
                resource: '部编版',
              },
              {
                id: 'subject-004',
                label: '数学',
                type: 'subject',
                teacher: '刘方',
                schedule: '周二 / 周五',
                resource: '苏教版',
              },
            ],
          },
        ],
      },
      {
        id: 'grade-002',
        label: '二年级',
        type: 'grade',
        stage: '小学',
        remark: '3 个教学班',
        children: [
          {
            id: 'class-003',
            label: '二年级 1 班',
            type: 'class',
            leader: '赵老师',
            students: 31,
            room: 'B201',
            scheduleSummary: '上午 + 晚自习',
            children: [
              {
                id: 'subject-005',
                label: '英语',
                type: 'subject',
                teacher: 'Grace',
                schedule: '周三 / 周五',
                resource: '朗文版',
              },
              {
                id: 'subject-006',
                label: '科学',
                type: 'subject',
                teacher: '秦远',
                schedule: '周二',
                resource: '自编资料',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'school-002',
    label: '长安托管学校',
    type: 'school',
    region: '余杭区',
    contact: '周渊',
    remark: '与云资源中心共建',
    hotline: '0571-8899 1023',
    children: [
      {
        id: 'grade-003',
        label: '七年级',
        type: 'grade',
        stage: '初中',
        remark: '双语试验班',
        children: [
          {
            id: 'class-004',
            label: '七年级 1 班',
            type: 'class',
            leader: '郁老师',
            students: 36,
            room: 'C303',
            scheduleSummary: '全天制',
            children: [
              {
                id: 'subject-007',
                label: '物理',
                type: 'subject',
                teacher: '高博',
                schedule: '周一 / 周四',
                resource: '浙科版',
              },
              {
                id: 'subject-008',
                label: '信息科技',
                type: 'subject',
                teacher: '杨一',
                schedule: '周五',
                resource: '自研微课',
              },
            ],
          },
        ],
      },
    ],
  },
])

/**
 * Element Plus 树形组件属性配置
 * 指定树节点数据的字段映射关系
 */
const treeProps = {
  children: 'children', // 子节点字段名
  label: 'label', // 节点显示文本字段名
}

/**
 * 节点类型元数据配置
 * 定义不同类型节点的样式和展示信息
 */
const typeMeta = {
  school: {
    label: '学校',
    chipClass: 'bg-emerald-500', // 节点圆点颜色
    badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100', // 徽章样式
    tagType: 'success',
  },
  grade: {
    label: '年级',
    chipClass: 'bg-cyan-500',
    badgeClass: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
    tagType: 'info',
  },
  class: {
    label: '班级',
    chipClass: 'bg-blue-500',
    badgeClass: 'bg-blue-50 text-blue-600 border border-blue-100',
    tagType: '',
  },
  subject: {
    label: '科目',
    chipClass: 'bg-indigo-500',
    badgeClass: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    tagType: 'warning',
  },
}

/**
 * 层级关系映射
 * 定义每个节点类型的下一级类型
 */
const nextTypeMap = {
  school: 'grade', // 学校的下一级是年级
  grade: 'class', // 年级的下一级是班级
  class: 'subject', // 班级的下一级是科目
}

// ==================== 响应式状态 ====================

/** 当前选中的节点 */
const selectedNode = ref(dictionaryTree.value[0])

/** 树状预览卡片组件引用 */
const treeCardRef = ref()

/** 表单数据 */
const formData = ref({
  label: '',
  remark: '',
  students: 0,
})

// ==================== 计算属性 ====================

/**
 * 当前选中节点的路径（面包屑）
 * 从根节点到当前节点的完整路径
 */
const selectedPath = computed(() => {
  if (!selectedNode.value) return []
  return findPath(dictionaryTree.value, selectedNode.value.id) || []
})

// ==================== 核心方法 ====================

/**
 * 监听选中节点变化，更新表单数据
 */
watch(
  selectedNode,
  (node) => {
    if (node) {
      formData.value = {
        label: node.label || '',
        remark: node.remark || '',
        students: node.students || 0,
      }
    }
  },
  { immediate: true }
)

/**
 * 树节点点击事件处理
 * @param {object} data - 被点击的节点数据
 */
const handleNodeClick = (data) => {
  selectedNode.value = data
}

// ==================== 操作方法 ====================

/**
 * 新增节点（示例方法）
 * @param {string} type - 节点类型
 * @param {object} parent - 父节点
 */
const handleAdd = (type, parent) => {
  const parentLabel = parent ? `（上级：${parent.label}）` : ''
  ElMessage.success(`新增${typeMeta[type || 'school'].label}${parentLabel}（示例）`)
}

/**
 * 保存节点信息
 * 将表单数据更新到选中节点
 */
const handleSave = () => {
  if (!selectedNode.value) return

  // 更新节点数据
  selectedNode.value.label = formData.value.label
  selectedNode.value.remark = formData.value.remark

  // 班级类型不允许修改学生人数，学生人数是只读的
  // 其他类型也不需要更新 students 字段

  ElMessage.success(`已保存${typeMeta[selectedNode.value.type].label}信息`)
}

/**
 * 删除节点（示例方法）
 * @param {object} node - 要删除的节点
 */
const handleRemove = (node) => {
  ElMessage.warning(`删除${typeMeta[node.type].label}：${node.label}`)
}

// ==================== 辅助方法 ====================

/**
 * 查找节点路径（用于面包屑导航）
 * @param {array} nodes - 节点数组
 * @param {string} targetId - 目标节点 ID
 * @param {array} path - 当前路径
 * @returns {array|null} 从根节点到目标节点的路径数组
 */
const findPath = (nodes, targetId, path = []) => {
  for (const node of nodes) {
    const currentPath = [...path, node]
    if (node.id === targetId) return currentPath
    if (node.children) {
      const childPath = findPath(node.children, targetId, currentPath)
      if (childPath?.length) return childPath
    }
  }
  return null
}

// ==================== 生命周期钩子 ====================

/**
 * 组件挂载后，设置默认选中节点
 */
onMounted(() => {
  nextTick(() => {
    if (selectedNode.value) {
      treeCardRef.value?.setCurrentKey(selectedNode.value.id)
    }
  })
})
</script>

<style scoped>
.dictionary-screen {
  padding-bottom: 2rem;
  position: relative;
  isolation: isolate;
}

.dictionary-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 12% 18%, rgba(16, 185, 129, 0.18), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.18), transparent 50%),
    linear-gradient(180deg, #ebfff7 0%, #eef7ff 60%, #f8fbff 100%);
}
</style>
