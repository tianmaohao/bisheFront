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

    // 获取用户信息（每次调用都会发起网络请求）
    async fetchUserInfo() {
      try {
        const res = await userApi.getUserInfo()
        console.log('获取用户信息响应:', res)

        if (res.data) {
          this.userInfo = res.data
          this.permissions = res.data.permissions || []
          this.roles = res.data.roles || []

          // 更新 localStorage
          setUserInfo(this.userInfo)
          setPermissions(this.permissions)
          setRoles(this.roles)

          console.log('用户信息已更新:', this.userInfo)
          return res
        } else {
          throw new Error('获取用户信息失败：返回数据为空')
        }
      } catch (error) {
        console.error('fetchUserInfo 错误:', error)
        // 如果是 401 错误，清除认证信息
        if (error.response && error.response.status === 401) {
          console.log('Token 已失效，清除认证信息')
          this.logout()
        }
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
    },
    //获取所有项目经理列表
    async fetchPmList() {
      try {
        const res = await userApi.getPmList()
        return res
      } catch (error) {
        throw error
      }
    }
  }
})
