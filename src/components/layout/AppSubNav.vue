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

<style scoped>
.secondary-tabs :deep(.el-tabs__header) {
  @apply m-0 border-none;
}

.secondary-tabs :deep(.el-tabs__nav) {
  @apply bg-transparent;
}

.secondary-tabs :deep(.el-tabs__item) {
  @apply mx-2 rounded-full border border-transparent bg-white/80 px-6 py-2 text-sm font-medium text-slate-500 shadow-sm shadow-pink-100/40 transition-all duration-200;
}

.secondary-tabs :deep(.el-tabs__item:hover) {
  @apply border-pink-200 bg-pink-50/70 text-pink-500 shadow-pink-100/60;
}

.secondary-tabs :deep(.is-active) {
  @apply border-pink-300 bg-pink-100 text-pink-600 shadow-md shadow-pink-200/70;
}

.secondary-tabs :deep(.el-tabs__item.is-active::before) {
  display: none;
}

.secondary-tabs :deep(.el-tabs__content) {
  display: none;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
