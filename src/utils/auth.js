import storage from './storage'
import { STORAGE_KEYS } from '@/config/constants'

// 认证工具
export const getToken = () => {
  return storage.get(STORAGE_KEYS.TOKEN) || ''
}

export const setToken = (token) => {
  storage.set(STORAGE_KEYS.TOKEN, token)
}

export const removeToken = () => {
  storage.remove(STORAGE_KEYS.TOKEN)
}

export const getUserInfo = () => {
  return storage.get(STORAGE_KEYS.USER_INFO) || null
}

export const setUserInfo = (userInfo) => {
  storage.set(STORAGE_KEYS.USER_INFO, userInfo)
}

export const removeUserInfo = () => {
  storage.remove(STORAGE_KEYS.USER_INFO)
}

export const getPermissions = () => {
  return storage.get(STORAGE_KEYS.PERMISSIONS) || []
}

export const setPermissions = (permissions) => {
  storage.set(STORAGE_KEYS.PERMISSIONS, permissions)
}

export const getRoles = () => {
  return storage.get(STORAGE_KEYS.ROLES) || []
}

export const setRoles = (roles) => {
  storage.set(STORAGE_KEYS.ROLES, roles)
}

export const clearAuth = () => {
  removeToken()
  removeUserInfo()
  storage.remove(STORAGE_KEYS.PERMISSIONS)
  storage.remove(STORAGE_KEYS.ROLES)
}

