<template>
  <transition name="fade-slide">
    <div v-if="tabs.length" class="mb-6">
      <div class="flex items-center justify-between gap-4 rounded-3xl bg-white/80 p-2 shadow-inner shadow-pink-100/40">
        <el-tabs
          v-model="activeTab"
          type="card"
          class="secondary-tabs"
          @tab-click="handleTabClick"
        >
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.path"
            :label="tab.label"
            :name="tab.path"
          />
        </el-tabs>
        <slot name="suffix" />
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { navigationMenus } from '@/router/index.js'

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.path)

const findMenuByKey = (menus, key) => {
  for (const menu of menus) {
    if (menu.key === key) return menu
    if (menu.children?.length) {
      const found = findMenuByKey(menu.children, key)
      if (found) return found
    }
  }
  return null
}

const parentMenu = computed(() => {
  const parentKey = route.meta?.parentKey
  if (!parentKey) return null
  return findMenuByKey(navigationMenus, parentKey)
})

const tabs = computed(() => {
  if (!parentMenu.value?.children?.length) {
    return []
  }

  const flattenChildren = (items) => {
    const result = []
    items.forEach((item) => {
      if (item.children?.length) {
        result.push(...flattenChildren(item.children))
      } else if (item.path) {
        result.push({ label: item.label, path: item.path })
      }
    })
    return result
  }

  return flattenChildren(parentMenu.value.children)
})

watch(
  () => route.path,
  (path) => {
    activeTab.value = path
  }
)

const handleTabClick = (pane) => {
  if (pane.props?.name && pane.props.name !== route.path) {
    router.push(pane.props.name)
  }
}
</script>
