// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      layout: 'auth'
    }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: {
      requiresAuth: true
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: {
          title: '数据看板',
          requiresAuth: true,
          icon: 'DataAnalysis'
        }
      },
      {
        path: 'project',
        name: 'Project',
        redirect: '/project/list',
        meta: {
          title: '项目管理',
          requiresAuth: true,
          icon: 'Folder'
        },
        children: [
          {
            path: 'list',
            name: 'ProjectList',
            component: () => import('@/views/project/List.vue'),
            meta: {
              title: '项目列表',
              requiresAuth: true
            }
          },
          {
            path: 'detail/:id',
            name: 'ProjectDetail',
            component: () => import('@/views/project/Detail.vue'),
            meta: {
              title: '项目详情',
              requiresAuth: true,
              activeMenu: '/project/list'
            }
          }
        ]
      },
      {
        path: 'push',
        name: 'Push',
        redirect: '/push/config',
        meta: {
          title: '数据推送',
          requiresAuth: true,
          icon: 'Upload'
        },
        children: [
          {
            path: 'config',
            name: 'PushConfig',
            component: () => import('@/views/push/Config.vue'),
            meta: {
              title: '推送配置',
              requiresAuth: true,
              permission: 'push:config'
            }
          },
          {
            path: 'logs',
            name: 'PushLogs',
            component: () => import('@/views/push/Logs.vue'),
            meta: {
              title: '推送日志',
              requiresAuth: true
            }
          }
        ]
      },
      {
        path: 'dashboard-visual',
        name: 'DashboardVisual',
        component: () => import('@/views/dashboard/Visual.vue'),
        meta: {
          title: '可视化看板',
          requiresAuth: true,
          icon: 'DataBoard'
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: {
      title: '页面不存在'
    }
  }
]

export default routes

