import { computed } from 'vue'
import { useUserStore } from '@/stores/modules/user'

// 认证相关的组合式函数
export const useAuth = () => {
  const userStore = useUserStore()
  
  const isAuthenticated = computed(() => userStore.isAuthenticated)
  const userInfo = computed(() => userStore.userInfo)
  const permissions = computed(() => userStore.permissions)
  const roles = computed(() => userStore.roles)
  
  const hasPermission = (permission) => {
    return userStore.hasPermission(permission)
  }
  
  const hasRole = (role) => {
    return userStore.hasRole(role)
  }
  
  return {
    isAuthenticated,
    userInfo,
    permissions,
    roles,
    hasPermission,
    hasRole
  }
}

