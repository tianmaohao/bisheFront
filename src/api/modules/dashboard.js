import request from '../index'

// 看板相关API
export const dashboardApi = {
  // 获取看板数据
  getDashboardData(params) {
    return request({
      url: '/dashboard/data',
      method: 'get',
      params
    })
  },
  
  // 获取推送成功率统计
  getPushSuccessRate(params) {
    return request({
      url: '/dashboard/push-success-rate',
      method: 'get',
      params
    })
  },
  
  // 获取推送频次趋势
  getPushFrequencyTrend(params) {
    return request({
      url: '/dashboard/push-frequency-trend',
      method: 'get',
      params
    })
  },
  
  // 获取项目状态与推送效果关联分析
  getProjectPushAnalysis(params) {
    return request({
      url: '/dashboard/project-push-analysis',
      method: 'get',
      params
    })
  }
}

