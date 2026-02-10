import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, clearAuth } from '@/utils/auth'
import { HTTP_STATUS } from '@/config/constants'
import env from '@/config/env'

// 创建axios实例
const service = axios.create({
  baseURL: env.apiBaseURL,
  timeout: env.requestTimeout,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加token
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data
    
    // 如果返回的状态码不是200，说明有错误
    if (res.code !== undefined && res.code !== HTTP_STATUS.SUCCESS) {
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      })
      
      // 401: 未授权，需要重新登录
      if (res.code === HTTP_STATUS.UNAUTHORIZED) {
        ElMessageBox.confirm('登录状态已过期，请重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          clearAuth()
          location.reload()
        })
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res
    }
  },
  (error) => {
    console.error('Response error:', error)
    
    let message = '请求失败'
    if (error.response) {
      switch (error.response.status) {
        case HTTP_STATUS.UNAUTHORIZED:
          message = '未授权，请重新登录'
          clearAuth()
          break
        case HTTP_STATUS.FORBIDDEN:
          message = '拒绝访问'
          break
        case HTTP_STATUS.NOT_FOUND:
          message = '请求地址不存在'
          break
        case HTTP_STATUS.SERVER_ERROR:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || `请求失败: ${error.response.status}`
      }
    } else if (error.request) {
      message = '网络连接失败，请检查网络'
    } else {
      message = error.message || '请求失败'
    }
    
    ElMessage({
      message,
      type: 'error',
      duration: 3000
    })
    
    return Promise.reject(error)
  }
)

export default service

