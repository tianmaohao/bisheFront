import request from '../index'

// 项目相关 API
export const projectApi = {
  // 获取项目列表
  getProjectList(params) {
    return request({
      url: '/api/project/list',
      method: 'get',
      params
    })
  },

  // 获取项目详情
  getProjectDetail(id) {
    return request({
      url: `/api/project/${id}`,
      method: 'get'
    })
  },

  // 获取项目完整详情（包含节点、任务、日志等）
  getProjectFullDetail(id) {
    return request({
      url: `/api/project/${id}/full-detail`,
      method: 'get'
    })
  },

  // 创建项目
  createProject(data) {
    return request({
      url: '/api/project',
      method: 'post',
      data
    })
  },

  // 更新项目
  updateProject(id, data) {
    return request({
      url: `/api/project/${id}`,
      method: 'put',
      data
    })
  },

  // 删除项目
  deleteProject(id) {
    return request({
      url: `/api/project/${id}`,
      method: 'delete'
    })
  },

  // 更新项目状态
  updateProjectStatus(id, status, reason) {
    return request({
      url: `/api/project/${id}/status`,
      method: 'put',
      data: { status, reason }
    })
  },

  // 退回项目
  returnProject(id, reason) {
    return request({
      url: `/api/project/${id}/return`,
      method: 'post',
      data: { reason }
    })
  },

  // 获取项目统计
  getProjectStatistics(params) {
    return request({
      url: '/api/project/statistics',
      method: 'get',
      params
    })
  },

  // 获取按期交付率
  getOnTimeDeliveryRate(params) {
    return request({
      url: '/api/project/on-time-delivery-rate',
      method: 'get',
      params
    })
  },

  // 创建项目节点
  createProjectNode(data) {
    return request({
      url: '/api/project-node',
      method: 'post',
      data
    })
  },

  // 获取项目节点详情
  getProjectNodeDetail(id) {
    return request({
      url: `/api/project-node/${id}`,
      method: 'get'
    })
  },

  // 获取项目节点列表
  getProjectNodeList(params) {
    return request({
      url: '/api/project-node/list',
      method: 'get',
      params
    })
  },

  // 更新项目节点
  updateProjectNode(id, data) {
    return request({
      url: `/api/project-node/${id}`,
      method: 'put',
      data
    })
  },

  // 删除项目节点
  deleteProjectNode(id) {
    return request({
      url: `/api/project-node/${id}`,
      method: 'delete'
    })
  },

  // 根据项目 ID 获取所有节点
  getNodesByProjectId(projectId) {
    return request({
      url: `/api/project-node/project/${projectId}`,
      method: 'get'
    })
  }
}
