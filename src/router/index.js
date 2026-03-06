import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/modules/user'
import routes from './routes'

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 标记是否已经在当前会话中获取过用户信息
let hasFetchedInSession = false

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token

  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 企业项目管理系统`
  }

  // 需要认证的路由
  if (to.meta.requiresAuth) {
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }

    // 每次页面刷新都重新获取用户信息（通过检查是否从登录页面过来）
    const isRefresh = from.path === '' || from.path === '/'
    const shouldFetchUserInfo = !userStore.userInfo || isRefresh || !hasFetchedInSession

    if (shouldFetchUserInfo) {
      try {
        await userStore.fetchUserInfo()
        hasFetchedInSession = true
        console.log('用户信息获取成功')
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 获取失败则清除 token 并跳转到登录页
        userStore.logout()
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
  }

  // 已登录用户访问登录页，重定向到首页
  if (to.path === '/login' && token) {
    next('/')
    return
  }

  next()
})

export default router
