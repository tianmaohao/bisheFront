<template>
  <div class="main-layout">
    <!-- 固定侧边栏 -->
    <div class="fixed-sidebar" :style="{ width: sidebarWidth }">
      <Sidebar />
    </div>

    <!-- 右侧可滚动区域 -->
    <div class="main-content" :style="{ marginLeft: sidebarWidth, width: `calc(100% - ${sidebarWidth})` }">
      <el-header class="header-container">
        <Header />
      </el-header>

      <el-main class="main-container">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'

const appStore = useAppStore()

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapse ? '64px' : '200px'
})
</script>

<style lang="less" scoped>
.main-layout {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;

  .fixed-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    background-color: #304156;
    transition: width 0.28s;
    overflow: hidden;
    z-index: 1000;
  }

  .main-content {
    margin-left: v-bind(sidebarWidth);
    width: calc(100% - v-bind(sidebarWidth));
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: margin-left 0.28s, width 0.28s;

    .header-container {
      background-color: #fff;
      box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
      padding: 0;
      height: 60px;
      line-height: 60px;
      flex-shrink: 0;
    }

    .main-container {
      background-color: #f0f2f5;
      padding: 20px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      min-height: 0;
      width: 100%;
    }
  }
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
