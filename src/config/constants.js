// 项目状态枚举
export const PROJECT_STATUS = {
  REQUIREMENT_INITIATED: 'REQUIREMENT_INITIATED', // 需求发起
  DEVELOPMENT: 'DEVELOPMENT', // 开发实施
  DEPLOYMENT: 'DEPLOYMENT', // 部署推进
  DELIVERED: 'DELIVERED', // 交付完成
  RETURNED: 'RETURNED' // 已退回
}

// 项目状态标签映射
export const PROJECT_STATUS_MAP = {
  [PROJECT_STATUS.REQUIREMENT_INITIATED]: { label: '需求发起', type: 'info' },
  [PROJECT_STATUS.DEVELOPMENT]: { label: '开发实施', type: 'warning' },
  [PROJECT_STATUS.DEPLOYMENT]: { label: '部署推进', type: 'primary' },
  [PROJECT_STATUS.DELIVERED]: { label: '交付完成', type: 'success' },
  [PROJECT_STATUS.RETURNED]: { label: '已退回', type: 'danger' }
}

// 推送状态枚举
export const PUSH_STATUS = {
  PENDING: 'PENDING', // 待推送
  SUCCESS: 'SUCCESS', // 推送成功
  FAILED: 'FAILED', // 推送失败
  CANCELLED: 'CANCELLED' // 已取消
}

// 推送协议类型
export const PUSH_PROTOCOL = {
  MQTT: 'MQTT',
  RABBITMQ: 'RABBITMQ'
}

// 用户角色
export const USER_ROLES = {
  ADMIN: 'ADMIN', // 管理员
  PM: 'PM', // 项目经理
  MEMBER: 'MEMBER', // 团队成员
  VIEWER: 'VIEWER' // 访客
}

// 权限标识
export const PERMISSIONS = {
  // 项目相关
  PROJECT_CREATE: 'project:create',
  PROJECT_EDIT: 'project:edit',
  PROJECT_DELETE: 'project:delete',
  PROJECT_VIEW: 'project:view',
  
  // 推送相关
  PUSH_CONFIG: 'push:config',
  PUSH_MANUAL: 'push:manual',
  PUSH_VIEW: 'push:view',
  
  // 数据查看
  DATA_VIEW: 'data:view',
  DATA_EXPORT: 'data:export'
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  PERMISSIONS: 'permissions',
  ROLES: 'roles',
  THEME: 'theme'
}

// 请求状态码
export const HTTP_STATUS = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}

