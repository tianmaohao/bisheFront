import { defineStore } from 'pinia'
import { userApi } from '@/api/modules/user'
import { setToken, getToken, setUserInfo, getUserInfo, setPermissions, getPermissions, setRoles, getRoles, clearAuth } from '@/utils/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken(),
    userInfo: getUserInfo(),
    permissions: getPermissions(),
    roles: getRoles()
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    },
    hasRole: (state) => (role) => {
      return state.roles.includes(role)
    }
  },
  
  actions: {
    // 登录
    async login(credentials) {
      try {
        const res = await userApi.login(credentials)
        if (res.data) {
          this.token = res.data.token
          this.userInfo = res.data.userInfo
          this.permissions = res.data.permissions || []
          this.roles = res.data.roles || []
          
          setToken(this.token)
          setUserInfo(this.userInfo)
          setPermissions(this.permissions)
          setRoles(this.roles)
        }
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 登出
    async logout() {
      try {
        await userApi.logout()
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = ''
        this.userInfo = null
        this.permissions = []
        this.roles = []
        clearAuth()
      }
    },
    
    // 获取用户信息
    async fetchUserInfo() {
      try {
        const res = await userApi.getUserInfo()
        if (res.data) {
          this.userInfo = res.data
          this.permissions = res.data.permissions || []
          this.roles = res.data.roles || []
          setUserInfo(this.userInfo)
          setPermissions(this.permissions)
          setRoles(this.roles)
        }
        return res
      } catch (error) {
        throw error
      }
    },

    // 更新用户信息
    async updateUserInfo(data) {
      try {
        const res = await userApi.updateUserInfo(data)
        if (res.data) {
          this.userInfo = { ...this.userInfo, ...res.data }
          setUserInfo(this.userInfo)
        }
        return res
      } catch (error) {
        throw error
      }
    },

    // 获取用户列表
    async fetchUserList(data) {
      try {
        const res = await userApi.getUserList(data)
        return res
      } catch (error) {
        throw error
      }
    }
  }
})

