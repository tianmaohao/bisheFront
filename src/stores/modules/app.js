import { defineStore } from 'pinia'
import storage from '@/utils/storage'
import { STORAGE_KEYS } from '@/config/constants'

export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapse: storage.get(STORAGE_KEYS.SIDEBAR_COLLAPSE, false),
    theme: storage.get(STORAGE_KEYS.THEME, 'light'),
    tagsView: true
  }),
  
  actions: {
    // 切换侧边栏
    toggleSidebar() {
      this.sidebarCollapse = !this.sidebarCollapse
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSE, this.sidebarCollapse)
    },
    
    // 设置侧边栏状态
    setSidebarCollapse(collapse) {
      this.sidebarCollapse = collapse
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSE, collapse)
    },
    
    // 切换主题
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light'
      storage.set(STORAGE_KEYS.THEME, this.theme)
      document.documentElement.setAttribute('data-theme', this.theme)
    },
    
    // 设置主题
    setTheme(theme) {
      this.theme = theme
      storage.set(STORAGE_KEYS.THEME, theme)
      document.documentElement.setAttribute('data-theme', theme)
    }
  }
})

