<template>
  <div class="flex-1 overflow-y-auto px-2 py-4">
    <el-menu
      ref="menuRef"
      router
      :default-active="activeMenu"
      :default-openeds="openMenus"
      class="h-full rounded-3xl border-r-0 px-3 py-4"
      background-color="transparent"
      text-color="#64748b"
      active-text-color="#f472b6"
      :unique-opened="false"
    >
      <template
        v-for="menu in menus"
        :key="menu.key"
      >
        <el-menu-item
          v-if="!menu.children?.length"
          :index="menu.path"
        >
          <el-icon
            v-if="menu.icon"
            :size="menuIconSize"
            class="mr-2 shrink-0"
          >
            <component :is="menu.icon" />
          </el-icon>
          <span class="text-sm font-medium">{{ menu.label }}</span>
        </el-menu-item>
        <el-sub-menu
          v-else
          :index="menu.key"
        >
          <template #title>
            <el-icon
              v-if="menu.icon"
              :size="menuIconSize"
              class="mr-2 shrink-0"
            >
              <component :is="menu.icon" />
            </el-icon>
            <span class="text-sm font-medium">{{ menu.label }}</span>
          </template>
          <template
            v-for="child in menu.children"
            :key="child.key"
          >
            <el-menu-item
              v-if="!child.children?.length"
              :index="child.path"
              class="rounded-md"
            >
              <span class="text-sm">{{ child.label }}</span>
            </el-menu-item>
            <el-sub-menu
              v-else
              :index="child.key"
              class="ml-2"
            >
              <template #title>
                <span class="text-sm font-medium">{{ child.label }}</span>
              </template>
              <el-menu-item
                v-for="grand in child.children"
                :key="grand.key"
                :index="grand.path"
                class="rounded-md pl-6"
              >
                <span class="text-sm">{{ grand.label }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()
const menuRef = ref()
const menuIconSize = 18

const activeMenu = computed(() => route.path)

const openMenus = computed(() => {
  const keys = []
  if (route.meta?.grandParentKey) {
    keys.push(route.meta.grandParentKey)
  }
  if (route.meta?.parentKey) {
    keys.push(route.meta.parentKey)
  }
  return keys
})

const ensureOpen = () => {
  if (!menuRef.value) return
  openMenus.value.forEach((key) => {
    if (key) {
      menuRef.value.open(key)
    }
  })
}

onMounted(() => {
  nextTick(() => ensureOpen())
})

watch(
  () => route.fullPath,
  () => {
    nextTick(() => ensureOpen())
  }
)
</script>
