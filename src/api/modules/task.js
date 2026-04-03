// src/api/modules/task.js
import request from '../index'

export const taskApi = {
  // 分页查询任务列表（用于待办/已办）
  getTaskList(params) {
    return request({
      url: '/api/task/list',
      method: 'get',
      params
    })
  },

  // 获取当前登录用户的所有任务（如需）
  getMyTasks() {
    return request({
      url: '/api/task/my-tasks',
      method: 'get'
    })
  },

  // 完成任务
  completeTask(id) {
    return request({
      url: `/api/task/${id}/complete`,
      method: 'post'
    })
  },

  // 退回任务
  rejectTask(id, reason) {
    return request({
      url: `/api/task/${id}/reject`,
      method: 'post',
      params: { reason }
    })
  },

  // 获取当前用户任务统计
  getCurrentUserTaskStatistics() {
    return request({
      url: '/api/task/statistics',
      method: 'get'
    })
  },

  // 获取当前用户月度任务统计
  getCurrentUserMonthlyTaskStats() {
    return request({
      url: '/api/task/monthly-stats',
      method: 'get'
    })
  },

  // 获取任务统计明细（按维度）
  getTaskStatisticsByDimension(data) {
    return request({
      url: '/api/task/statistics/dimension',
      method: 'post',
      data
    })
  },

  // 根据用户 ID 获取任务列表
  getTasksByUserId(userId, params) {
    return request({
      url: `/api/task/user/${userId}`,
      method: 'get',
      params
    })
  },

  getUserTaskStatistics(userId){
    return request({
      url: `/api/task/user/${userId}/statistics`,
      method: 'get'
    })
  }

}