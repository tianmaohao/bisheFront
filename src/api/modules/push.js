import request from '../index'

// 数据推送相关 API
export const pushApi = {
  // 获取推送配置
  getPushConfig() {
    return request({
      url: '/api/push/config',
      method: 'get'
    })
  },

  // 更新推送配置
  updatePushConfig(data) {
    return request({
      url: '/api/push/config',
      method: 'put',
      data
    })
  },

  // 手动触发推送
  manualPush(projectId) {
    return request({
      url: '/api/push/manual',
      method: 'post',
      data: { projectId }
    })
  },

  // 获取推送日志列表
  getPushLogList(params) {
    return request({
      url: '/api/push/logs',
      method: 'get',
      params
    })
  },

  // 获取推送统计
  getPushStatistics(params) {
    return request({
      url: '/api/push/statistics',
      method: 'get',
      params
    })
  },

  // 撤销推送
  cancelPush(logId) {
    return request({
      url: `/api/push/cancel/${logId}`,
      method: 'post'
    })
  }
}
