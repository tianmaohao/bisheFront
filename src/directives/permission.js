import { useUserStore } from '@/stores/modules/user'

// 权限指令
export const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions || []
    
    if (value && !permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  },
  
  updated(el, binding) {
    const { value } = binding
    const userStore = useUserStore()
    const permissions = userStore.permissions || []
    
    if (value && !permissions.includes(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

