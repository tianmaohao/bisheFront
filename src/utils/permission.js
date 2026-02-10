import { useUserStore } from '@/stores/modules/user'
import { PERMISSIONS } from '@/config/constants'

// 权限检查工具
export const hasPermission = (permission) => {
  const userStore = useUserStore()
  const permissions = userStore.permissions || []
  return permissions.includes(permission)
}

export const hasAnyPermission = (permissionList) => {
  return permissionList.some(permission => hasPermission(permission))
}

export const hasAllPermissions = (permissionList) => {
  return permissionList.every(permission => hasPermission(permission))
}

export const hasRole = (role) => {
  const userStore = useUserStore()
  const roles = userStore.roles || []
  return roles.includes(role)
}

// 检查是否可以配置推送
export const canConfigPush = () => {
  return hasPermission(PERMISSIONS.PUSH_CONFIG)
}

// 检查是否可以手动触发推送
export const canManualPush = () => {
  return hasPermission(PERMISSIONS.PUSH_MANUAL)
}

