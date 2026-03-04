// src/api/modules/task.js
import request from '../index'

export const taskApi = {
  // 分页查询任务列表（用于待办/已办）
  getTaskList(params) {
    return request({
      url: '/task/list',
      method: 'get',
      params
    })
  },

  // 获取当前登录用户的所有任务（如需）
  getMyTasks() {
    return request({
      url: '/task/my-tasks',
      method: 'get'
    })
  },

  // 完成任务
  completeTask(id) {
    return request({
      url: `/task/${id}/complete`,
      method: 'post'
    })
  },

  // 退回任务
  rejectTask(id, reason) {
    return request({
      url: `/task/${id}/reject`,
      method: 'post',
      params: { reason }
    })
  }
}