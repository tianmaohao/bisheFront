import { defineStore } from 'pinia'
import { projectApi } from '@/api/modules/project'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projectList: [],
    currentProject: null,
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
    // 获取项目列表
    async fetchProjectList(params) {
      try {
        const res = await projectApi.getProjectList(params)
        if (res.data) {
          this.projectList = res.data.list || []
        }
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 获取项目详情
    async fetchProjectDetail(id) {
      try {
        const res = await projectApi.getProjectDetail(id)
        if (res.data) {
          this.currentProject = res.data
        }
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 创建项目
    async createProject(data) {
      try {
        const res = await projectApi.createProject(data)
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 更新项目
    async updateProject(id, data) {
      try {
        const res = await projectApi.updateProject(id, data)
        if (res.data && this.currentProject?.id === id) {
          this.currentProject = { ...this.currentProject, ...res.data }
        }
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 更新项目状态
    async updateProjectStatus(id, status, reason) {
      try {
        const res = await projectApi.updateProjectStatus(id, status, reason)
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 退回项目
    async returnProject(id, reason) {
      try {
        const res = await projectApi.returnProject(id, reason)
        return res
      } catch (error) {
        throw error
      }
    },
    
    // 删除项目
    async deleteProject(id) {
      try {
        const res = await projectApi.deleteProject(id)
        // 从列表中移除
        this.projectList = this.projectList.filter(p => p.id !== id)
        return res
      } catch (error) {
        throw error
      }
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
    },
    
    // 获取按期交付率
    async fetchOnTimeDeliveryRate(params) {
      try {
        const res = await projectApi.getOnTimeDeliveryRate(params)
        if (res.data) {
          this.onTimeDeliveryRate = res.data
        }
        return res
      } catch (error) {
        throw error
      }
    }
  }
})

