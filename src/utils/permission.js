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


// 检查是否可以创建用户
export const canCreateUser = () => {
  return hasPermission(PERMISSIONS.USER_CREATE)
}

// 检查是否可以编辑用户
export const canEditUser = () => {
  return hasPermission(PERMISSIONS.USER_EDIT)
}

// 检查是否可以删除用户
export const canDeleteUser = () => {
  return hasPermission(PERMISSIONS.USER_DELETE)
}

// 检查是否可以查看用户
export const canViewUser = () => {
  return hasPermission(PERMISSIONS.USER_VIEW)
}

