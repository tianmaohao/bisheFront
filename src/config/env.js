// 环境配置
const env = import.meta.env

export default {
  // 开发环境
  isDev: env.MODE === 'development',
  
  // 生产环境
  isProd: env.MODE === 'production',
  
  // API基础地址
  apiBaseURL: env.VITE_API_BASE_URL || '/api',
  
  // WebSocket地址
  wsBaseURL: env.VITE_WS_BASE_URL || 'ws://localhost:8080/ws',
  
  // 应用标题
  appTitle: env.VITE_APP_TITLE || '企业项目管理系统',
  
  // 请求超时时间
  requestTimeout: env.VITE_REQUEST_TIMEOUT || 10000,
  
  // 分页默认大小
  pageSize: 10,
  pageSizes: [10, 20, 50, 100]
}

