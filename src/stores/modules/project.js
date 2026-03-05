import { defineStore } from 'pinia'
import { projectApi } from '@/api/modules/project'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projectList: [],
    currentProject: null,
    currentProjectFullDetail: null,
    statistics: null,
    onTimeDeliveryRate: null
  }),
  
  getters: {
    // 按状态筛选项目
    projectsByStatus: (state) => (status) => {
      return state.projectList.filter(p => p.status === status)
    },
    
    // 超期项目
    overdueProjects: (state) => {
      return state.projectList.filter(p => {
        if (!p.deadline) return false
        return new Date(p.deadline) < new Date() && p.status !== 'DELIVERED'
      })
    }
  },
  
  actions: {
    async fetchProjectList(params) {
      const res = await projectApi.getProjectList(params)
      if (res.data) {
        this.list = res.data.list || []
        this.total = res.data.total || 0
      }
      return res
    },

    async fetchProjectDetail(id) {
      const res = await projectApi.getProjectDetail(id)
      if (res.data) {
        this.currentProject = res.data
      }
      return res
    },

    async fetchProjectFullDetail(id) {
      const res = await projectApi.getProjectFullDetail(id)
      if (res.data) {
        this.currentProjectFullDetail = res.data
      }
      return res
    },

    async createProject(data) {
      return projectApi.createProject(data)
    },

    async updateProject(id, data) {
      return projectApi.updateProject(id, data)
    },

    async deleteProject(id) {
      return projectApi.deleteProject(id)
    },

    async updateProjectStatus(id, status, reason) {
      return projectApi.updateProjectStatus(id, status, reason)
    },

    async returnProject(id, reason) {
      return projectApi.returnProject(id, reason)
    },

    async fetchProjectStatistics(params) {
      return projectApi.getProjectStatistics(params)
    },

    async fetchOnTimeDeliveryRate(params) {
      return projectApi.getOnTimeDeliveryRate(params)
    },

    async createProjectNode(data) {
      return projectApi.createProjectNode(data)
    },

    async updateProjectNode(id, data) {
      return projectApi.updateProjectNode(id, data)
    },

    async deleteProjectNode(id) {
      return projectApi.deleteProjectNode(id)
    },

    async fetchProjectNodeList(params) {
      const res = await projectApi.getProjectNodeList(params)
      if (res.data) {
        return res.data
      }
      return res
    },

    
    // 获取项目统计
    async fetchStatistics(params) {
      try {
        const res = await projectApi.getProjectStatistics(params)
        if (res.data) {
          this.statistics = res.data
        }
        return res
      } catch (error) {
        throw error
      }
    }
  }
})

