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
                // 如果是退出登录请求触发的 401，不提示错误
                console.log('退出登录hahhahah')
                if (response.config.isLogoutRequest) {
                    return Promise.reject(res)
                }
                handleTokenExpired()
                return Promise.reject(new Error('登录已过期'))
            }

            // 其他错误提示
            ElMessage({
                message: res.message || res.msg || '请求失败',
                type: 'error',
                duration: 3000
            })

            return Promise.reject(res)
        }

        return res
    },
    (error) => {
        console.error('响应异常:', error)
        // 如果是退出登录请求触发的网络层 401，同样不提示
        if (error.config && error.config.isLogoutRequest) {
            return Promise.reject(error)
        }
        if (error.response && error.response.status === 401) {
            handleTokenExpired()
        }
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