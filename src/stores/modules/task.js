// src/stores/modules/task.js
import { defineStore } from 'pinia'
import { taskApi } from '@/api/modules/task'

export const useTaskStore = defineStore('task', {
  state: () => ({
    list: [],
    total: 0
  }),
  actions: {
    async fetchTaskList(params) {
      const res = await taskApi.getTaskList(params)
      if (res.data) {
        this.list = res.data.list || []
        this.total = res.data.total || 0
      }
      return res
    },
    async completeTask(id) {
      return taskApi.completeTask(id)
    },
    async rejectTask(id, reason) {
      return taskApi.rejectTask(id, reason)
    }
  }
})