<template>
  <!-- 左侧：树形结构卡片 -->
  <el-card class="pastel-card dictionary-tree-card">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-semibold text-slate-900">
            树形结构总览
          </p>
          <p class="text-xs text-slate-500">
            学校 → 年级 → 班级 → 科目
          </p>
        </div>
        <!-- 展开/收起按钮组 -->
        <div class="flex gap-2">
          <el-button
            size="small"
            class="btn-soft"
            @click="expandAll"
          >
            展开全部
          </el-button>
          <el-button
            size="small"
            class="btn-soft"
            @click="collapseAll"
          >
            收起全部
          </el-button>
        </div>
      </div>
    </template>

    <!-- 搜索框 -->
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

    <!-- 树形组件容器 -->
    <div class="tree-wrapper">
      <!--
        Element Plus 树形组件配置说明：
        - ref: 组件引用，用于调用树的方法（如 filter、expandAll 等）
        - data: 树形数据源
        - node-key: 节点唯一标识字段名
        - props: 配置树节点字段映射（children、label）
        - filter-node-method: 节点过滤方法
        - default-expand-all: 默认展开所有节点
        - highlight-current: 高亮当前选中节点
        - expand-on-click-node: 是否在点击节点时展开（false：只点击箭头展开）
        - @node-click: 节点点击事件
      -->
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
        <!-- 自定义节点内容插槽 -->
        <template #default="{ data }">
          <div :class="['node-shell', `node-${data.type}`]">
            <!-- 左侧：节点信息 -->
            <div class="node-content">
              <!-- 类型指示器圆点 -->
              <span :class="['type-dot', typeMeta[data.type].chipClass]" />
              <div class="node-text">
                <!-- 节点名称 -->
                <p class="text-sm font-medium text-slate-900">
                  {{ data.label }}
                </p>
                <!-- 节点类型标签 -->
                <p class="text-xs text-slate-400">
                  {{ typeMeta[data.type].label }}
                </p>
              </div>
            </div>
            <!-- 右侧：操作按钮组 -->
            <div class="node-actions">
              <!-- 新增子节点按钮（仅非叶子节点显示） -->
              <el-button
                v-if="nextTypeMap[data.type]"
                size="small"
                text
                class="btn-link"
                @click.stop="handleAdd(nextTypeMap[data.type], data)"
              >
                新增
              </el-button>
              <!-- 删除按钮 -->
              <el-button
                size="small"
                text
                class="btn-link danger"
                @click.stop="handleRemove(data)"
              >
                删除
              </el-button>
            </div>
          </div>
        </template>
      </el-tree>
    </div>
  </el-card>
</template>

<script setup>
/**
 * 树状预览卡片组件
 * 用于展示学校-年级-班级-科目的树形结构
 */
import { ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

// 组件属性定义
const props = defineProps({
  /** 树形数据源 */
  dictionaryTree: {
    type: Array,
    required: true,
  },
  /** 树节点属性配置 */
  treeProps: {
    type: Object,
    default: () => ({
      children: 'children',
      label: 'label',
    }),
  },
  /** 节点类型元数据 */
  typeMeta: {
    type: Object,
    required: true,
  },
  /** 层级关系映射 */
  nextTypeMap: {
    type: Object,
    required: true,
  },
})

// 组件事件定义
const emit = defineEmits(['node-click', 'add', 'remove'])

/** 树形组件引用 */
const treeRef = ref()

/** 搜索关键词 */
const searchKeyword = ref('')

/**
 * 树节点过滤方法
 * @param {string} value - 搜索关键词
 * @param {object} data - 节点数据
 * @returns {boolean} 是否显示该节点
 */
const filterNode = (value, data) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}

/**
 * 监听搜索关键词变化，触发树过滤
 */
watch(searchKeyword, (val) => {
  treeRef.value?.filter(val)
})

/**
 * 树节点点击事件处理
 * @param {object} data - 被点击的节点数据
 */
const handleNodeClick = (data) => {
  emit('node-click', data)
}

/**
 * 新增节点
 * @param {string} type - 节点类型
 * @param {object} parent - 父节点
 */
const handleAdd = (type, parent) => {
  emit('add', type, parent)
}

/**
 * 删除节点
 * @param {object} node - 要删除的节点
 */
const handleRemove = (node) => {
  emit('remove', node)
}

/**
 * 遍历所有树节点
 * @param {function} cb - 对每个节点执行的回调函数
 */
const eachNode = (cb) => {
  const nodesMap = treeRef.value?.store?.nodesMap
  if (!nodesMap) return
  Object.values(nodesMap).forEach((node) => {
    cb(node)
  })
}

/**
 * 展开所有节点
 */
const expandAll = () => {
  eachNode((node) => {
    if (node.childNodes?.length) node.expanded = true
  })
}

/**
 * 收起所有节点（仅保留第一级展开）
 */
const collapseAll = () => {
  eachNode((node) => {
    node.expanded = node.level === 1
  })
}

/**
 * 设置当前选中节点
 * @param {string} nodeId - 节点ID
 */
const setCurrentKey = (nodeId) => {
  treeRef.value?.setCurrentKey(nodeId)
}

// 暴露方法给父组件
defineExpose({
  setCurrentKey,
  expandAll,
  collapseAll,
})
</script>

<style scoped>
.dictionary-tree-card {
  border: 1px solid rgba(15, 118, 110, 0.08);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 50px rgba(15, 118, 110, 0.08);
  backdrop-filter: blur(10px);
  padding: 1rem;
  margin-bottom: 1rem;
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

.tree-wrapper {
  flex: 1;
  max-height: 540px;
  overflow-y: auto;
  padding: 0.8rem;
  padding-right: 0.3rem;
  background: rgba(249, 250, 251, 0.4);
  border-radius: 10px;
  margin: 0.2rem 0;
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

.node-shell {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 12px;
  margin: 12px 0;
  border: 1px solid rgba(14, 165, 233, 0.08);
  background: rgba(255, 255, 255, 0.92);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 1;
}

/* 左侧节点内容区域 */
.node-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
  overflow: hidden;
}

/* 节点文字区域 */
.node-text {
  flex: 1;
  min-width: 0;
  line-height: 1.2;
}

.node-text p {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0.1rem 0;
  font-size: 13px;
}

.node-text p:last-child {
  margin-bottom: 0;
}

/* 右侧操作按钮区域 */
.node-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.type-dot {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 999px;
  display: inline-flex;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(14, 165, 233, 0.25);
  margin-right: 0.3rem;
}

.node-shell:hover {
  border-color: rgba(14, 165, 233, 0.35);
  box-shadow: 0 12px 20px rgba(156, 163, 175, 0.2);
  transform: translateY(-2px);
}

/* 当前选中节点样式 */
:deep(.el-tree-node.is-current > .el-tree-node__content .node-shell) {
  background: rgba(14, 165, 233, 0.12);
  border-color: rgba(14, 165, 233, 0.45);
  box-shadow: 0 18px 28px rgba(14, 165, 233, 0.2);
  transform: scale(1.02);
}

/* 不同节点类型的高度样式 */
.node-school {
  min-height: 60px;
  padding: 0.8rem 1.2rem;
}

.node-grade {
  min-height: 52px;
  padding: 0.6rem 1.2rem;
}

.node-class {
  min-height: 48px;
  padding: 0.5rem 1.2rem;
}

.node-subject {
  min-height: 44px;
  padding: 0.4rem 1.2rem;
}

/* 树节点子元素 */
:deep(.el-tree-node__children) {
  padding-left: 20px;
  margin-top: 0px;
  margin-bottom: 0px;
}

/* 树节点内容样式 */
:deep(.el-tree-node__content) {
  min-height: 0;
  padding: 0;
  height: 75px;
}

/* 树节点样式 */
:deep(.el-tree-node) {
  line-height: 1.5;
}

/* 树节点展开图标样式 */
:deep(.el-tree-node__expand-icon) {
  margin-right: 12px;
  font-size: 16px;
  width: 20px;
  height: 20px;
}

/* 树节点缩进样式 */
:deep(.el-tree-node__indent) {
  width: 16px;
}

.node-actions .btn-link {
  color: #0ea5e9 !important;
  font-weight: 600;
  box-shadow: none !important;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(14, 165, 233, 0.05);
}

.node-actions .btn-link:hover {
  color: #0284c7 !important;
  background: rgba(14, 165, 233, 0.1);
}

.node-actions .btn-link.danger {
  color: #f43f5e !important;
  background: rgba(244, 63, 94, 0.05);
}

.node-actions .btn-link.danger:hover {
  background: rgba(244, 63, 94, 0.1);
}
</style>
