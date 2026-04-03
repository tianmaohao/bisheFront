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

// 防重复跳转锁
let isRedirecting = false

// 请求拦截器
service.interceptors.request.use(
    (config) => {
      const token = getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      console.error('请求异常:', error)
      return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    (response) => {
      const res = response.data

      // 业务状态码错误
      if (res.code !== undefined && res.code !== HTTP_STATUS.SUCCESS) {
        // 401：token过期
        if (res.code === HTTP_STATUS.UNAUTHORIZED) {
          handleTokenExpired()
          return Promise.reject(new Error('登录已过期'))
        }

        // 其他错误提示
        ElMessage({
          message: res.message || res.msg || '请求失败',
          type: 'error',
          duration: 3000
        })

        const error = new Error(res.message || '请求失败')
        error.code = res.code
        return Promise.reject(error)
      }

      return res
    },
    (error) => {
      console.error('响应异常:', error)

      // HTTP 401 处理
      if (error.response?.status === HTTP_STATUS.UNAUTHORIZED) {
        handleTokenExpired()
        return Promise.reject(error)
      }

      // 其他 HTTP 错误提示
      let msg = '请求失败'
      if (error.response) {
        const status = error.response.status
        const errMsg = error.response.data?.message || error.response.data?.msg
        switch (status) {
          case 403: msg = '权限不足'; break
          case 404: msg = '接口不存在'; break
          case 500: msg = '服务器异常'; break
          default: msg = errMsg || `请求错误 ${status}`
        }
      } else if (error.request) {
        msg = '网络异常，请检查连接'
      } else {
        msg = error.message
      }

      ElMessage({
        message: msg,
        type: 'error',
        duration: 3000
      })

      return Promise.reject(error)
    }
)

// 统一处理 token 过期（核心方法）
function handleTokenExpired() {
  // 防止重复跳转
  if (isRedirecting) return
  isRedirecting = true

  // 清除登录信息
  clearAuth()

  // 提示 + 跳转
  ElMessageBox.confirm(
      '登录状态已过期，请重新登录',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false
      }
  ).then(() => {
    // 记录当前页面，登录后跳回
    const redirect = encodeURIComponent(window.location.href)
    window.location.href = `/login?redirect=${redirect}`
  }).finally(() => {
    isRedirecting = false
  })
}

export default service