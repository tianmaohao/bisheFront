import request from '../index'

// 看板相关API
export const dashboardApi = {
  // 获取看板数据
  getDashboardData(params) {
    return request({
      url: '/api/dashboard/data',
      method: 'get',
      params
    })
  },
  
  // 获取推送成功率统计
  getPushSuccessRate(params) {
    return request({
      url: '/api/dashboard/push-success-rate',
      method: 'get',
      params
    })
  },
  
  // 获取推送频次趋势
  getPushFrequencyTrend(params) {
    return request({
      url: '/api/dashboard/push-frequency-trend',
      method: 'get',
      params
    })
  },

  // 获取按期交付率
  getOnTimeDeliveryRate(params) {
    return request({
      url: '/api/dashboard/on-time-delivery-rate',
      method: 'get',
      params
    })
  },
  
  // 获取项目状态与推送效果关联分析
  getProjectPushAnalysis(params) {
    return request({
      url: '/api/dashboard/project-push-analysis',
      method: 'get',
      params
    })
  },
  // 获取任务准时完成率
  getTaskOnTimeRate(params) {
    return request({
      url: '/api/dashboard/task-on-time-rate',
      method: 'get',
      params
    })
  },

  // 获取任务排行榜
  getTaskRanking(params) {
    return request({
      url: '/api/dashboard/task-ranking',
      method: 'get',
      params
    })
  },

  // 获取项目活跃度
  getProjectActivity(params) {
    return request({
      url: '/api/dashboard/project-activity',
      method: 'get',
      params
    })
  }
}

