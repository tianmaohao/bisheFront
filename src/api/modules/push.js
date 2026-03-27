import request from '../index'

export const pushApi = {
  // 获取所有推送配置列表
  getConfigList() {
    return request({
      url: '/api/push/config/list',
      method: 'get'
    })
  },

  // 根据项目 ID 获取推送配置
  getConfigByProjectId(projectId) {
    return request({
      url: `/api/push/config/${projectId}`,
      method: 'get',
    })
  },

  // 保存推送配置
  saveConfig(data) {
    return request({
      url: '/api/push/config',
      method: 'post',
      data
    })
  },

  // 获取推送日志列表
  getLogList(params) {
    return request({
      url: '/api/push/log/list',
      method: 'post',
      data: params
    })
  },

  // 撤销推送
  cancelPush(logId) {
    return request({
      url: '/api/push/log/cancel',
      method: 'post',
      params: { logId }
    })
  },

  // 删除推送日志
  deletePushLog(logId) {
    return request({
      url: `/api/push/log/${logId}`,
      method: 'delete'
    })
  },

  // 批量删除推送日志
  batchDeletePushLog(logIds) {
    return request({
      url: '/api/push/log/batch',
      method: 'delete',
      data: logIds
    })
  },

  // 手动推送
  manualPush(projectId) {
    return request({
      url: '/api/push/manual',
      method: 'post',
      params: { projectId }
    })
  },

  // 启动自动推送
  startAutoPush(configId) {
    return request({
      url: '/api/push/auto/start',
      method: 'post',
      params: { configId }
    })
  },

  // 停止自动推送
  stopAutoPush(configId) {
    return request({
      url: '/api/push/auto/stop',
      method: 'post',
      params: { configId }
    })
  },
  // 获取推送数据列表
  getDataList(params) {
    return request({
      url: '/api/push/data/list',
      method: 'post',
      data: params
    })
  },

  // 删除推送数据
  deletePushData(id) {
    return request({
      url: `/api/push/data/${id}`,
      method: 'delete'
    })
  },

  // 批量删除推送数据
  batchDeletePushData(ids) {
    return request({
      url: '/api/push/data/batch',
      method: 'delete',
      data: ids
    })
  }
}
