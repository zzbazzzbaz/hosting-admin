<template>
  <el-table :data="data" stripe :empty-text="emptyText">
    <el-table-column type="index" label="序号" width="70" />
    <el-table-column
      v-for="column in columns"
      :key="column.prop"
      v-bind="column"
    />
    <el-table-column label="操作" width="160" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" link @click="$emit('edit', row)">编辑</el-button>
        <el-button type="danger" link @click="$emit('remove', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
defineProps({
  columns: {
    type: Array,
    default: () => [],
  },
  data: {
    type: Array,
    default: () => [],
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
})

defineEmits(['edit', 'remove'])
</script>
