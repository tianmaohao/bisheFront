// 表单验证工具
export const validators = {
  // 必填
  required: (message = '此项为必填项') => ({
    required: true,
    message,
    trigger: 'blur'
  }),
  
  // 邮箱
  email: (message = '请输入正确的邮箱地址') => ({
    type: 'email',
    message,
    trigger: 'blur'
  }),
  
  // 手机号
  phone: (message = '请输入正确的手机号') => ({
    pattern: /^1[3-9]\d{9}$/,
    message,
    trigger: 'blur'
  }),
  
  // 长度范围
  length: (min, max, message) => ({
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur'
  }),
  
  // 数字范围
  numberRange: (min, max, message) => ({
    type: 'number',
    min,
    max,
    message: message || `数值应在 ${min} 到 ${max} 之间`,
    trigger: 'blur'
  })
}

