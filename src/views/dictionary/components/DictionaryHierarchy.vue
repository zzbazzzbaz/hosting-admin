<template>
  <section class="dictionary-screen space-y-6">
    <div class="grid gap-6 xl:grid-cols-[1.4fr_2fr]">
      <el-card class="pastel-card dictionary-tree-card">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-slate-900">树形结构总览</p>
              <p class="text-xs text-slate-500">学校 → 年级 → 班级 → 科目</p>
            </div>
            <div class="flex gap-2">
              <el-button size="small" class="btn-soft" @click="expandAll">展开全部</el-button>
              <el-button size="small" class="btn-soft" @click="collapseAll">收起全部</el-button>
            </div>
          </div>
        </template>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索学校、班级或科目"
          clearable
          class="tree-search mb-4"
        >
          <template #prefix>
            <el-icon>
              <Search />
            </el-icon>
          </template>
        </el-input>
        <div class="tree-wrapper">
          <el-tree
            ref="treeRef"
            :data="dictionaryTree"
            node-key="id"
            :props="treeProps"
            :filter-node-method="filterNode"
            default-expand-all
            highlight-current
            :expand-on-click-node="false"
            @node-click="handleNodeClick"
          >
            <template #default="{ data }">
              <div class="node-shell flex flex-1 items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <span :class="['type-dot', typeMeta[data.type].chipClass]" />
                  <div>
                    <p class="text-sm font-medium text-slate-900">{{ data.label }}</p>
                    <p class="text-xs text-slate-400">{{ typeMeta[data.type].label }}</p>
                  </div>
                </div>
                <div class="node-actions flex items-center gap-2 text-xs">
                  <el-button
                    v-if="nextTypeMap[data.type]"
                    size="small"
                    text
                    class="btn-link"
                    @click.stop="handleAdd(nextTypeMap[data.type], data)"
                  >
                    新增
                  </el-button>
                  <el-button size="small" text class="btn-link" @click.stop="handleEdit(data)">编辑</el-button>
                  <el-button size="small" text class="btn-link danger" @click.stop="handleRemove(data)">删除</el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </el-card>

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
          <div class="flex flex-wrap items-center gap-3">
            <h3 class="text-2xl font-semibold text-slate-900">{{ selectedNode.label }}</h3>
            <span :class="['node-type-chip', typeMeta[selectedNode.type].badgeClass]">
              {{ typeMeta[selectedNode.type].label }}
            </span>
            <span v-if="selectedNode.remark" class="node-remark-chip">{{ selectedNode.remark }}</span>
          </div>
          <div class="info-grid grid gap-4 md:grid-cols-2">
            <div
              v-for="field in detailFields[selectedNode.type]"
              :key="field.key"
              class="info-card rounded-2xl border border-slate-100/80 bg-white/70 p-4"
            >
              <p class="text-xs text-slate-500">{{ field.label }}</p>
              <p class="mt-2 text-base font-semibold text-slate-900">
                {{ resolveFieldValue(field, selectedNode) }}
              </p>
            </div>
          </div>
          <section
            v-if="selectedNode.children?.length"
            class="child-panel rounded-3xl border border-slate-100 bg-white/80 p-4"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">
                  下级{{ typeMeta[nextTypeMap[selectedNode.type]].label }}
                </p>
                <p class="text-xs text-slate-500">共 {{ selectedNode.children.length }} 条</p>
              </div>
              <el-button
                v-if="nextTypeMap[selectedNode.type]"
                class="btn-soft px-4"
                @click="handleAdd(nextTypeMap[selectedNode.type], selectedNode)"
              >
                新增{{ typeMeta[nextTypeMap[selectedNode.type]].label }}
              </el-button>
            </div>
            <div class="child-grid mt-4 grid gap-3 md:grid-cols-2">
              <article
                v-for="child in selectedNode.children"
                :key="child.id"
                class="child-card rounded-2xl border border-white/70 bg-white/95 px-4 py-3 shadow-sm"
              >
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ child.label }}</p>
                    <p class="text-xs text-slate-500">{{ typeMeta[child.type].label }}</p>
                  </div>
                  <span :class="['node-type-chip text-xs', typeMeta[child.type].badgeClass]">
                    {{ typeMeta[child.type].label }}
                  </span>
                </div>
                <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span v-if="child.leader">班主任：{{ child.leader }}</span>
                  <span v-if="child.teacher">任课：{{ child.teacher }}</span>
                  <span v-if="child.stage">学段：{{ child.stage }}</span>
                  <span v-if="child.schedule">课表：{{ child.schedule }}</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </el-card>
      <el-card v-else class="pastel-card dictionary-detail-card flex items-center justify-center">
        <el-empty description="请选择左侧字典节点" />
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

defineProps({
  title: {
    type: String,
    default: '学校字典（树形）',
  },
  caption: {
    type: String,
    default: 'DICTIONARY TREE',
  },
  description: {
    type: String,
    default: '学校、年级、班级、科目一次性维护，层级结构更直观',
  },
})

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
              { id: 'subject-001', label: '语文', type: 'subject', teacher: '王语', schedule: '周一 / 周三', resource: '部编版' },
              { id: 'subject-002', label: '数学', type: 'subject', teacher: '陈晨', schedule: '周二 / 周四', resource: '苏教版' },
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
              { id: 'subject-003', label: '语文', type: 'subject', teacher: '王语', schedule: '周一 / 周四', resource: '部编版' },
              { id: 'subject-004', label: '数学', type: 'subject', teacher: '刘方', schedule: '周二 / 周五', resource: '苏教版' },
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
              { id: 'subject-005', label: '英语', type: 'subject', teacher: 'Grace', schedule: '周三 / 周五', resource: '朗文版' },
              { id: 'subject-006', label: '科学', type: 'subject', teacher: '秦远', schedule: '周二', resource: '自编资料' },
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
              { id: 'subject-007', label: '物理', type: 'subject', teacher: '高博', schedule: '周一 / 周四', resource: '浙科版' },
              { id: 'subject-008', label: '信息科技', type: 'subject', teacher: '杨一', schedule: '周五', resource: '自研微课' },
            ],
          },
        ],
      },
    ],
  },
])

const treeProps = {
  children: 'children',
  label: 'label',
}

const typeMeta = {
  school: {
    label: '学校',
    chipClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
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

const nextTypeMap = {
  school: 'grade',
  grade: 'class',
  class: 'subject',
}

const detailFields = {
  school: [
    { label: '所属区域', key: 'region' },
    { label: '联系人', key: 'contact' },
    { label: '服务热线', key: 'hotline' },
    { label: '备注', key: 'remark' },
  ],
  grade: [
    { label: '学段', key: 'stage' },
    { label: '班级数量', key: 'children', formatter: (node) => node.children?.length ?? 0 },
    { label: '年级特性', key: 'remark' },
    { label: '隶属学校', key: 'belong', formatter: (_, node) => findAncestorLabel(node, 'school') },
  ],
  class: [
    { label: '班主任', key: 'leader' },
    { label: '学生人数', key: 'students', suffix: ' 人' },
    { label: '教室', key: 'room' },
    { label: '作息安排', key: 'scheduleSummary' },
  ],
  subject: [
    { label: '任课老师', key: 'teacher' },
    { label: '课时安排', key: 'schedule' },
    { label: '教材 / 资源', key: 'resource' },
    { label: '所在班级', key: 'belong', formatter: (_, node) => findAncestorLabel(node, 'class') },
  ],
}

const selectedNode = ref(dictionaryTree.value[0])
const treeRef = ref()
const searchKeyword = ref('')

const summaryStats = computed(() => {
  const bucket = { schools: 0, grades: 0, classes: 0, subjects: 0 }
  const countKey = {
    school: 'schools',
    grade: 'grades',
    class: 'classes',
    subject: 'subjects',
  }

  const traverse = (nodes = []) => {
    nodes.forEach((node) => {
      bucket[countKey[node.type]] += 1
      traverse(node.children)
    })
  }

  traverse(dictionaryTree.value)

  return [
    { key: 'SCHOOLS', label: '已维护学校', value: bucket.schools },
    { key: 'GRADES', label: '包含年级', value: bucket.grades },
    { key: 'CLASSES', label: '覆盖班级', value: bucket.classes },
    { key: 'SUBJECTS', label: '下沉科目', value: bucket.subjects },
  ]
})

const selectedPath = computed(() => {
  if (!selectedNode.value) return []
  return findPath(dictionaryTree.value, selectedNode.value.id) || []
})

const filterNode = (value, data) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

watch(searchKeyword, (val) => {
  treeRef.value?.filter(val)
})

const handleNodeClick = (data) => {
  selectedNode.value = data
}

const resolveFieldValue = (field, node) => {
  if (field.formatter) {
    return field.formatter(node[field.key], node)
  }
  if (field.key === 'children') {
    return node.children?.length ?? 0
  }
  const value = node[field.key]
  if (!value) return '—'
  return field.suffix ? `${value}${field.suffix}` : value
}

const handleAdd = (type, parent) => {
  const parentLabel = parent ? `（上级：${parent.label}）` : ''
  ElMessage.success(`新增${typeMeta[type || 'school'].label}${parentLabel}（示例）`)
}

const handleEdit = (node) => {
  ElMessage.info(`编辑${typeMeta[node.type].label}：${node.label}`)
}

const handleRemove = (node) => {
  ElMessage.warning(`删除${typeMeta[node.type].label}：${node.label}`)
}

const handleRefresh = () => {
  ElMessage.success('已刷新字典数据（示例）')
}

const eachNode = (cb) => {
  const nodesMap = treeRef.value?.store?.nodesMap
  if (!nodesMap) return
  Object.values(nodesMap).forEach((node) => {
    cb(node)
  })
}

const expandAll = () => {
  eachNode((node) => {
    if (node.childNodes?.length) node.expanded = true
  })
}

const collapseAll = () => {
  eachNode((node) => {
    node.expanded = node.level === 1
  })
}

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

const findAncestorLabel = (node, type) => {
  const path = findPath(dictionaryTree.value, node.id)
  const match = path?.slice().reverse().find((item) => item.type === type && item.id !== node.id)
  return match ? match.label : '—'
}

onMounted(() => {
  nextTick(() => {
    if (selectedNode.value) {
      treeRef.value?.setCurrentKey(selectedNode.value.id)
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
  background: radial-gradient(circle at 12% 18%, rgba(16, 185, 129, 0.18), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.18), transparent 50%),
    linear-gradient(180deg, #ebfff7 0%, #eef7ff 60%, #f8fbff 100%);
}

.dictionary-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(16, 185, 129, 0.3);
  background: linear-gradient(135deg, rgba(224, 255, 244, 0.95), rgba(239, 246, 255, 0.98));
  box-shadow: 0 30px 90px rgba(14, 165, 233, 0.16);
  backdrop-filter: blur(12px);
}

.dictionary-hero::after {
  content: '';
  position: absolute;
  right: -60px;
  bottom: -80px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 65%);
}

.caption-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #047857;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.btn-soft {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(14, 165, 233, 0.35) !important;
  color: #0f766e !important;
  box-shadow: none !important;
}

.btn-soft:hover {
  border-color: rgba(14, 165, 233, 0.55) !important;
  color: #134e4a !important;
}

.stat-card {
  border-radius: 1.75rem;
  border: 1px solid rgba(59, 130, 246, 0.08);
  background: rgba(255, 255, 255, 0.94);
  padding: 1.5rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(6px);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.stat-key {
  font-size: 0.7rem;
  letter-spacing: 0.4em;
  font-weight: 600;
  text-transform: uppercase;
  color: #94a3b8;
}

.stat-value {
  margin-top: 0.75rem;
  font-size: 2.75rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1;
}

.stat-label {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  color: #475569;
}

.dictionary-tree-card,
.dictionary-detail-card {
  border: 1px solid rgba(15, 118, 110, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 50px rgba(15, 118, 110, 0.08);
  backdrop-filter: blur(10px);
}

.tree-search :deep(.el-input__wrapper) {
  border-color: rgba(15, 118, 110, 0.15);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.05);
}

:deep(.dictionary-tree-card .el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.tree-wrapper {
  flex: 1;
  max-height: 540px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

@media (min-width: 1280px) {
  .tree-wrapper {
    max-height: 620px;
  }
}

.tree-wrapper::-webkit-scrollbar {
  width: 4px;
}

.tree-wrapper::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.4);
}

:deep(.el-tree) {
  --el-tree-node-hover-bg-color: transparent;
  --el-tree-text-color: #0f172a;
}

:deep(.el-tree-node__content) {
  padding: 4px 0;
  background: transparent !important;
  border-radius: 18px;
}

:deep(.el-tree-node__children) {
  border-left: 1px dashed rgba(14, 165, 233, 0.15);
  margin-left: 1rem;
  padding-left: 0.75rem;
}

.node-shell {
  width: 100%;
  border-radius: 18px;
  padding: 0.65rem 0.8rem;
  border: 1px solid rgba(14, 165, 233, 0.08);
  background: rgba(255, 255, 255, 0.92);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  backdrop-filter: blur(4px);
}

.type-dot {
  width: 1.4rem;
  height: 1.4rem;
  border-radius: 999px;
  display: inline-flex;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.25);
}

.node-shell:hover {
  border-color: rgba(14, 165, 233, 0.35);
  box-shadow: 0 12px 20px rgba(156, 163, 175, 0.2);
  transform: translateY(-1px);
}

:deep(.el-tree-node.is-current > .el-tree-node__content .node-shell) {
  background: linear-gradient(135deg, rgba(190, 242, 100, 0.3), rgba(6, 182, 212, 0.3));
  border-color: rgba(14, 165, 233, 0.45);
  box-shadow: 0 18px 28px rgba(14, 165, 233, 0.2);
}

.node-actions .btn-link {
  color: #0ea5e9 !important;
  font-weight: 600;
  box-shadow: none !important;
}

.node-actions .btn-link:hover {
  color: #0284c7 !important;
}

.node-actions .btn-link.danger {
  color: #f43f5e !important;
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

.node-remark-chip {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  background: rgba(244, 114, 182, 0.1);
  color: #db2777;
  font-size: 0.75rem;
  font-weight: 600;
}

.info-card {
  min-height: 120px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(6px);
}

.child-panel {
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(6px);
}

.child-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-color: rgba(148, 163, 184, 0.35);
}

.child-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 35px rgba(148, 163, 184, 0.25);
}

.child-card .node-type-chip {
  padding: 0.2rem 0.65rem;
}
</style>
