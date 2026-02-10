import request from '../index'

// 项目相关API
export const projectApi = {
  // 获取项目列表
  getProjectList(params) {
    return request({
      url: '/project/list',
      method: 'get',
      params
    })
  },
  
  // 获取项目详情
  getProjectDetail(id) {
    return request({
      url: `/project/${id}`,
      method: 'get'
    })
  },
  
  // 创建项目
  createProject(data) {
    return request({
      url: '/project',
      method: 'post',
      data
    })
  },
  
  // 更新项目
  updateProject(id, data) {
    return request({
      url: `/project/${id}`,
      method: 'put',
      data
    })
  },
  
  // 删除项目
  deleteProject(id) {
    return request({
      url: `/project/${id}`,
      method: 'delete'
    })
  },
  
  // 更新项目状态
  updateProjectStatus(id, status, reason) {
    return request({
      url: `/project/${id}/status`,
      method: 'put',
      data: { status, reason }
    })
  },
  
  // 退回项目
  returnProject(id, reason) {
    return request({
      url: `/project/${id}/return`,
      method: 'post',
      data: { reason }
    })
  },
  
  // 获取项目统计
  getProjectStatistics(params) {
    return request({
      url: '/project/statistics',
      method: 'get',
      params
    })
  },
  
  // 获取按期交付率
  getOnTimeDeliveryRate(params) {
    return request({
      url: '/project/on-time-delivery-rate',
      method: 'get',
      params
    })
  }
}

