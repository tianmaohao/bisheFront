<template>
  <el-scrollbar>
    <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
    >
      <template v-for="route in menuRoutes" :key="route.path">
        <el-menu-item
            v-if="!route.children && !route.meta?.hidden"
            :index="route.path.startsWith('/') ? route.path : '/' + route.path"
            @click="handleMenuClick(route.path.startsWith('/') ? route.path : '/' + route.path)"
        >
          <el-icon v-if="route.meta?.icon">
            <component :is="route.meta.icon" />
          </el-icon>
          <template #title>{{ route.meta.title }}</template>
        </el-menu-item>

        <el-sub-menu
            v-else-if="route.children && !route.meta?.hidden"
            :index="route.path.startsWith('/') ? route.path : '/' + route.path"
        >
          <template #title>
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <span>{{ route.meta.title }}</span>
          </template>
          <el-menu-item
              v-for="child in route.children"
              :key="child.path"
              :index="getChildMenuPath(route.path, child.path)"
              @click="handleMenuClick(getChildMenuPath(route.path, child.path))"
          >
            {{ child.meta.title }}
          </el-menu-item>
        </el-sub-menu>
      </template>
    </el-menu>
  </el-scrollbar>
</template>


<script setup>import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import {
  DataAnalysis,
  Folder,
  Upload,
  DataBoard,
  OfficeBuilding
} from '@element-plus/icons-vue'
import routes from '@/router/routes'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const isCollapse = computed(() => appStore.sidebarCollapse)

const activeMenu = computed(() => {
  const { path } = route
  // 处理项目详情的特殊情况
  if (path.startsWith('/project/detail')) {
    return '/project/list'
  }
  // 处理用户详情的特殊情况
  if (path.startsWith('/user/detail')) {
    return '/user/list'
  }
  return path
})

// 生成子菜单路径的辅助函数
const getChildMenuPath = (parentPath, childPath) => {
  if (parentPath.startsWith('/')) {
    return parentPath + '/' + childPath
  }
  return '/' + parentPath + '/' + childPath
}

// 处理菜单点击
const handleMenuClick = (path) => {
  console.log('Menu clicked, navigating to:', path)
  router.push(path).catch(err => {
    console.error('Navigation error:', err)
  })
}

const menuRoutes = computed(() => {
  const mainRoute = routes.find(route => route.path === '/')
  return mainRoute?.children || []
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
