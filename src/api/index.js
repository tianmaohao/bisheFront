import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, clearAuth } from '@/utils/auth'
import { HTTP_STATUS } from '@/config/constants'
import env from '@/config/env'

// 创建 axios 实例
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
      // 添加 token
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

      // 如果返回的状态码不是 200，说明有错误
      if (res.code !== undefined && res.code !== HTTP_STATUS.SUCCESS) {
        ElMessage({
          message: res.message || res.msg || '请求失败',
          type: 'error',
          duration: 3000
        })

        // 401: 未授权，需要重新登录
        if (res.code === HTTP_STATUS.UNAUTHORIZED) {
          clearAuth()
          // 直接跳转到登录页面
          window.location.href = '/login'
        }

        const error = new Error(res.message || res.msg || '请求失败')
        error.code = res.code
        error.data = res.data
        return Promise.reject(error)
      } else {
        return res
      }
    },
    (error) => {
      console.error('Response error:', error)

      // 如果已经有处理过的错误信息，直接使用
      if (error.message && error.code) {
        // 这是业务逻辑错误（code != 200），已经在上面显示过了，不需要再次显示
        return Promise.reject(error)
      }

      let message = '请求失败'
      if (error.response) {
        switch (error.response.status) {
          case HTTP_STATUS.UNAUTHORIZED:
            message = '未授权，请重新登录'
            clearAuth()
            // 直接跳转到登录页面
            window.location.href = '/login'
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
            message = error.response.data?.message || error.response.data?.msg || `请求失败：${error.response.status}`
        }
      } else if (error.request) {
        message = '网络连接失败，请检查网络'
      } else {
        message = error.message || '请求失败'
      }

      // 401 错误已经在上面处理了，不需要再次显示
      if (error.response?.status !== HTTP_STATUS.UNAUTHORIZED) {
        ElMessage({
          message,
          type: 'error',
          duration: 3000
        })
      }

      return Promise.reject(error)
    }
)

export default service
