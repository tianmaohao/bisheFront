// src/api/modules/user.js
import request from '../index'

export const userApi = {
  // 用户登录
  login(data) {
    return request({
      url: '/auth/login',
      method: 'post',
      data
    })
  },

  // 用户登出
  logout() {
    return request({
      url: '/auth/logout',
      method: 'post'
    })
  },

  // 获取当前用户信息
  getUserInfo() {
    return request({
      url: '/api/user/info',
      method: 'get'
    })
  },

  // 用户列表（后台目前返回 List，可在前端分页）
  getUserList(data) {
    return request({
      url: '/api/user/list',
      method: 'post',
      data
    })
  },

  // 获取指定用户详情
  getUserById(userId) {
    return request({
      url: '/api/user/get',
      method: 'get',
      params: {userId}
    })
  },

  // 新增或更新用户
  addOrUpdateUser(data) {
    return request({
      url: '/api/user/addOrUpdate',
      method: 'post',
      data
    })
  },

  // 删除用户
  deleteUser(userId) {
    return request({
      url: '/api/user/delete',
      method: 'delete',
      params: {userId}
    })
  }
}