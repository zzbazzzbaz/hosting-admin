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

import { navigationMenus } from '@/router'

const route = useRoute()
const router = useRouter()

const activeTab = ref(route.path)

const parentMenu = computed(() => {
  const parentKey = route.meta?.parentKey

  if (!parentKey) {
    return null
  }

  return navigationMenus.find((menu) => menu.key === parentKey) || null
})

const tabs = computed(() => {
  if (!parentMenu.value?.children?.length) {
    return []
  }

  return parentMenu.value.children.map((child) => ({
    label: child.label,
    path: child.path,
  }))
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
