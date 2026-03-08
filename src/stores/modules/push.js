import { defineStore } from 'pinia'
import { pushApi } from '@/api/modules/push'

export const usePushStore = defineStore('push', {
  state: () => ({
    pushConfig: null,
    pushLogList: [],
    pushStatistics: null
  }),
  
  getters: {
    // 推送成功率
    successRate: (state) => {
      if (!state.pushStatistics) return 0
      const { success, total } = state.pushStatistics
      return total > 0 ? ((success / total) * 100).toFixed(2) : 0
    },
    
    // 今日推送次数
    todayPushCount: (state) => {
      const today = new Date().toDateString()
      return state.pushLogList.filter(log => {
        const logDate = new Date(log.pushTime).toDateString()
        return logDate === today
      }).length
    }
  },
  
  actions: {
      // 获取推送配置
      async fetchPushConfig() {
          try {
              const res = await pushApi.getPushConfig()
              if (res.data) {
                  // 将后端的 0/1 转换为布尔值供前端使用
                  this.pushConfig = {
                      ...res.data,
                      autoPush: res.data.autoPush === 1
                  }
              }
              return res
          } catch (error) {
              throw error
          }
      },

      // 更新推送配置
      async updatePushConfig(data) {
          try {
              // 确保 autoPush 是 0 或 1
              const submitData = {
                  ...data,
                  autoPush: data.autoPush === true || data.autoPush === 1 ? 1 : 0
              }
              const res = await pushApi.updatePushConfig(submitData)
              if (res.data) {
                  this.pushConfig = { ...this.pushConfig, ...res.data }
              }
              return res
          } catch (error) {
              throw error
          }
      },
    
    // 手动触发推送
    async manualPush(projectId) {
      try {
        const res = await pushApi.manualPush(projectId)
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 获取推送日志
    async fetchPushLogList(params) {
      try {
        const res = await pushApi.getPushLogList(params)
        if (res.data) {
          this.pushLogList = res.data.list || []
        }
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 获取推送统计
    async fetchPushStatistics(params) {
      try {
        const res = await pushApi.getPushStatistics(params)
        if (res.data) {
          this.pushStatistics = res.data
        }
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 撤销推送
    async cancelPush(logId) {
      try {
        const res = await pushApi.cancelPush(logId)
        return res
      } catch (error) {
        throw error
      }
    }
  }
})

