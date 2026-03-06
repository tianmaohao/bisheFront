<template>
  <div class="header-wrapper">
    <div class="header-left">
      <el-icon class="collapse-icon" @click="toggleSidebar">
        <component :is="isCollapse ? 'Expand' : 'Fold'" />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item
            v-for="item in breadcrumbs"
            :key="item.path"
            :to="item.path"
        >
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar
              :size="32"
              :src="currentAvatarUrl"
              fit="cover"
              @error="handleAvatarError"
          >
            <span v-if="showAvatarText" class="avatar-text">
              {{ avatarText }}
            </span>
          </el-avatar>
          <span class="username">{{ userInfo?.realName || userInfo?.username }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="settings">系统设置</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { Fold, Expand, ArrowDown } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import { useUserStore } from '@/stores/modules/user'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

const isCollapse = computed(() => appStore.sidebarCollapse)
const userInfo = computed(() => userStore.userInfo)

// 当前头像 URL
const currentAvatarUrl = ref('')
// 是否显示文字头像
const showAvatarText = ref(false)

// 测试图片是否可加载的函数
const testImageUrl = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

// 监听用户信息变化
watch(() => userStore.userInfo, async (newUserInfo) => {
  console.log('=== 监听到用户信息变化 ===', newUserInfo)

  if (newUserInfo?.avatar && typeof newUserInfo.avatar === 'string' && newUserInfo.avatar.trim() !== '') {
    if (newUserInfo.avatar.startsWith('http://') || newUserInfo.avatar.startsWith('https://')) {
      // 先测试图片是否能加载
      const canLoad = await testImageUrl(newUserInfo.avatar)

      if (canLoad) {
        console.log('头像图片可加载:', newUserInfo.avatar)
        currentAvatarUrl.value = newUserInfo.avatar
        showAvatarText.value = false
      } else {
        console.log('头像图片加载失败，使用文字头像')
        currentAvatarUrl.value = ''
        showAvatarText.value = true
      }
    } else {
      // 相对路径使用文字头像
      currentAvatarUrl.value = ''
      showAvatarText.value = true
    }
  } else {
    currentAvatarUrl.value = ''
    showAvatarText.value = true
  }
}, { immediate: true, deep: true })

// 头像显示的文字（姓名首字母或用户名首字母）
const avatarText = computed(() => {
  if (userInfo.value?.realName) {
    return userInfo.value.realName.charAt(0)
  }
  if (userInfo.value?.username) {
    return userInfo.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

// 处理头像加载失败
const handleAvatarError = () => {
  console.log('el-avatar 组件报告图片加载失败')
  showAvatarText.value = true
  currentAvatarUrl.value = ''
}

const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched
})

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      break
    case 'settings':
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await userStore.logout()
        router.push('/login')
      } catch (error) {
        // 用户取消
      }
      break
  }
}

// 组件挂载时获取用户信息（刷新页面时会触发）
onMounted(async () => {
  console.log('=== Header 组件 onMounted ===')
  console.log('当前 token:', userStore.token ? '存在' : '不存在')
  console.log('当前 userInfo:', userStore.userInfo)

  if (userStore.token) {
    try {
      await userStore.fetchUserInfo()
      console.log('Header 组件：用户信息获取成功')
      console.log('获取后的 userInfo:', userStore.userInfo)
    } catch (error) {
      console.error('Header 组件：获取用户信息失败:', error)
    }
  }
})
</script>

// ... existing code ...


<style lang="less" scoped>
.header-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 100%;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-icon {
      font-size: 20px;
      cursor: pointer;
      margin-right: 20px;
      color: #606266;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;

      .avatar-text {
        font-size: 16px;
        font-weight: bold;
        color: #fff;
      }

      .username {
        margin: 0 8px;
        color: #606266;
      }
    }
  }
}
</style>
