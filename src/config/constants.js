// 项目状态枚举

export const PROJECT_STATUS = {
  REQUIREMENT_INITIATED: 'REQUIREMENT_INITIATED', // 需求发起
  DEVELOPMENT: 'DEVELOPMENT', // 开发实施
  DEPLOYMENT: 'DEPLOYMENT', // 部署推进
  DELIVERED: 'DELIVERED', // 交付完成（按期）
  DELIVERED_OVERDUE: 'DELIVERED_OVERDUE', // 交付完成（超期）
  RETURNED: 'RETURNED' // 已退回
}

export const PROJECT_STATUS_MAP = {
  REQUIREMENT_INITIATED: { label: '需求发起', type: 'info' },
  DEVELOPMENT: { label: '开发实施', type: 'warning' },
  DEPLOYMENT: { label: '部署推进', type: 'primary' },
  DELIVERED: { label: '交付完成', type: 'success' },
  DELIVERED_OVERDUE: { label: '交付完成', type: 'success' },
  RETURNED: { label: '已退回', type: 'danger' }
}


// 推送状态枚举
export const PUSH_STATUS = {
  PENDING: 'PENDING', // 待推送
  SUCCESS: 'SUCCESS', // 推送成功
  FAILED: 'FAILED', // 推送失败
  CANCELLED: 'CANCELLED' // 已取消
}

// 推送状态标签映射
export const PUSH_STATUS_MAP = {
  PENDING: { label: '待推送', type: 'warning' },
  SUCCESS: { label: '推送成功', type: 'success' },
  FAILED: { label: '推送失败', type: 'danger' },
  CANCELLED: { label: '已取消', type: 'info' }
}

// 任务状态枚举（与后端 TaskStatusEnum 保持一致）
export const TASK_STATUS = {
  PENDING: 'pending', // 待处理
  IN_PROGRESS: 'pending-in_progress', // 进行中
  COMPLETED: 'completed', // 已完成
  REJECTED: 'pending-rejected', // 已退回
  TIMEOUT: 'pending-timeout' // 已超时
}

// 任务状态标签映射
export const TASK_STATUS_MAP = {
  pending: { label: '待处理', type: 'warning' },
  'pending-in_progress': { label: '进行中', type: 'primary' },
  completed: { label: '已完成', type: 'success' },
  'pending-rejected': { label: '已退回', type: 'danger' },
  'pending-timeout': { label: '已超时', type: 'danger' }
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
  PROJECT_CREATE: 'projectPo:add',
  PROJECT_EDIT: 'projectPo:edit',
  PROJECT_DELETE: 'projectPo:delete',
  PROJECT_VIEW: 'projectPo:query',

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
