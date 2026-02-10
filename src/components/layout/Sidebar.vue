<template>
  <el-scrollbar>
    <el-menu
      :default-active="activeMenu"
      :collapse="isCollapse"
      :collapse-transition="false"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
      router
    >
      <template v-for="route in routes" :key="route.path">
        <el-menu-item
          v-if="!route.children && !route.meta.hidden"
          :index="route.path"
        >
          <el-icon v-if="route.meta.icon">
            <component :is="route.meta.icon" />
          </el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>
        
        <el-sub-menu
          v-else-if="route.children && !route.meta.hidden"
          :index="route.path"
        >
          <template #title>
            <el-icon v-if="route.meta.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta.title }}</span>
          </template>
          <el-menu-item
            v-for="child in route.children"
            :key="child.path"
            :index="child.path"
          >
            {{ child.meta.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </el-scrollbar>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import {
  DataAnalysis,
  Folder,
  Upload,
  DataBoard
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapse)

const activeMenu = computed(() => {
  const { path } = route
  if (path.startsWith('/project/detail')) {
    return '/project/list'
  }
  return path
})

// 获取路由配置
const routes = computed(() => {
  return router.getRoutes().filter(route => {
    return route.path === '/' && route.children
  })[0]?.children || []
})
</script>

<style lang="less" scoped>
:deep(.el-menu) {
  border-right: none;
}

:deep(.el-sub-menu__title),
:deep(.el-menu-item) {
  &:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.1) !important;
}
</style>

