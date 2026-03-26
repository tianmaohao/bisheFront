import { defineStore } from 'pinia'
import { pushApi } from '@/api/modules/push'

export const usePushStore = defineStore('push', {
    state: () => ({
        pushConfig: null,
        pushConfigList: [],
        pushLogs: []
    }),

    actions: {
        // 获取所有推送配置列表
        async fetchPushConfigList() {
            try {
                const res = await pushApi.getConfigList()
                this.pushConfigList = res.data || []
                return res
            } catch (error) {
                throw error
            }
        },

        // 根据项目 ID 获取推送配置
        async fetchPushConfigByProjectId(projectId) {
            try {
                const res = await pushApi.getConfigByProjectId(projectId)
                // 重要：无论返回什么，都更新 pushConfig
                console.log('Store 收到的响应:', res)
                console.log('Store 收到的 data:', res.data)

                this.pushConfig = res.data || null
                console.log('Store 推送配置已更新:', this.pushConfig)
                return res
            } catch (error) {
                throw error
            }
        },

        // 保存推送配置（新增或更新）
        async savePushConfig(data) {
            try {
                const res = await pushApi.saveConfig(data)
                return res
            } catch (error) {
                throw error
            }
        },

        // 获取推送日志列表
        async fetchPushLogList(params) {
            try {
                const res = await pushApi.getLogList(params)
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
        },

        // 手动推送
        async manualPush(projectId) {
            try {
                const res = await pushApi.manualPush(projectId)
                return res
            } catch (error) {
                throw error
            }
        },

        // 启动自动推送
        async startAutoPush(configId) {
            try {
                const res = await pushApi.startAutoPush(configId)
                return res
            } catch (error) {
                throw error
            }
        },

        // 停止自动推送
        async stopAutoPush(configId) {
            try {
                const res = await pushApi.stopAutoPush(configId)
                return res
            } catch (error) {
                throw error
            }
        }
    }
})
