// src/api/modules/user.js
import request from '../index'

export const userApi = {
  // 登录/登出/当前用户信息 省略...

  // 用户列表（后台目前返回 List，可在前端分页）
  getUserList(data) {
    return request({
      url: '/user/list',
      method: 'post',
      data
    })
  },

  // 获取指定用户详情
  getUserById(userId) {
    return request({
      url: '/user/get',
      method: 'get',
      params: { userId }
    })
  },

  // 新增或更新用户
  addOrUpdateUser(data) {
    return request({
      url: '/user/addOrUpdate',
      method: 'post',
      data
    })
  },

  // 删除用户
  deleteUser(userId) {
    return request({
      url: '/user/delete',
      method: 'delete',
      params: { userId }
    })
  }
}