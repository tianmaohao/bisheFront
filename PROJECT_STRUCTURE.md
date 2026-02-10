# 项目结构说明

## 完整目录结构

```
projectManegement/
├── public/                    # 静态资源目录
│   └── vite.svg
├── src/
│   ├── api/                  # API接口层
│   │   ├── modules/         # 各业务模块API
│   │   │   ├── user.js      # 用户相关API
│   │   │   ├── project.js   # 项目相关API
│   │   │   ├── push.js      # 推送相关API
│   │   │   └── dashboard.js # 看板相关API
│   │   └── index.js         # Axios实例和拦截器配置
│   │
│   ├── assets/              # 静态资源
│   │   └── vue.svg
│   │
│   ├── components/          # 全局组件
│   │   └── layout/         # 布局相关组件
│   │       ├── Sidebar.vue  # 侧边栏组件
│   │       └── Header.vue   # 头部组件
│   │
│   ├── composables/         # 组合式函数（Composables）
│   │   └── useAuth.js       # 认证相关组合式函数
│   │
│   ├── config/              # 配置文件
│   │   ├── constants.js     # 常量定义（状态枚举、权限等）
│   │   ├── env.js           # 环境配置
│   │   └── settings.js      # 应用设置
│   │
│   ├── directives/          # 自定义指令
│   │   └── permission.js    # 权限控制指令
│   │
│   ├── layouts/             # 布局组件
│   │   ├── MainLayout.vue   # 主布局（包含侧边栏和头部）
│   │   └── AuthLayout.vue   # 认证布局（登录页等）
│   │
│   ├── router/              # 路由配置
│   │   ├── index.js         # 路由主配置（包含路由守卫）
│   │   └── routes.js        # 路由定义
│   │
│   ├── stores/              # Pinia状态管理
│   │   ├── modules/         # 状态模块
│   │   │   ├── user.js      # 用户状态（登录、权限等）
│   │   │   ├── project.js   # 项目状态
│   │   │   ├── push.js      # 推送状态
│   │   │   └── app.js       # 应用状态（侧边栏、主题等）
│   │   └── index.js         # Store入口
│   │
│   ├── styles/              # 全局样式
│   │   ├── variables.less   # Less变量定义
│   │   ├── mixins.less      # Less混合定义
│   │   └── global.less      # 全局样式
│   │
│   ├── utils/               # 工具函数
│   │   ├── auth.js          # 认证工具（token、用户信息等）
│   │   ├── date.js          # 日期格式化工具
│   │   ├── permission.js    # 权限检查工具
│   │   ├── storage.js       # 本地存储工具
│   │   └── validator.js     # 表单验证工具
│   │
│   ├── views/               # 页面视图
│   │   ├── auth/            # 认证相关页面
│   │   │   └── Login.vue    # 登录页面
│   │   │
│   │   ├── dashboard/       # 看板页面
│   │   │   ├── Index.vue    # 数据看板首页
│   │   │   └── Visual.vue   # 可视化看板
│   │   │
│   │   ├── project/         # 项目管理页面
│   │   │   ├── List.vue     # 项目列表页
│   │   │   ├── Detail.vue   # 项目详情页
│   │   │   └── components/  # 项目相关组件
│   │   │       └── ProjectFormDialog.vue # 项目表单对话框
│   │   │
│   │   ├── push/            # 数据推送页面
│   │   │   ├── Config.vue   # 推送配置页
│   │   │   └── Logs.vue     # 推送日志页
│   │   │
│   │   └── error/           # 错误页面
│   │       └── 404.vue      # 404页面
│   │
│   ├── App.vue              # 根组件
│   └── main.js              # 应用入口文件
│
├── index.html               # HTML模板
├── vite.config.js           # Vite配置文件
├── package.json             # 项目依赖配置
├── README.md                # 项目说明文档
├── README_PROJECT.md        # 项目开发文档
└── PROJECT_STRUCTURE.md     # 项目结构说明（本文件）
```

## 核心模块说明

### 1. 项目流程与状态管理模块

**相关文件：**
- `src/views/project/` - 项目管理页面
- `src/stores/modules/project.js` - 项目状态管理
- `src/api/modules/project.js` - 项目相关API

**功能：**
- 项目创建、编辑、删除、查询
- 项目状态流转：需求发起 → 开发实施 → 部署推进 → 交付完成
- 项目退回机制（含原因说明）
- 超期项目识别和按期交付率统计
- 状态变更时自动触发数据推送

### 2. 实时数据推送模块

**相关文件：**
- `src/views/push/` - 推送管理页面
- `src/stores/modules/push.js` - 推送状态管理
- `src/api/modules/push.js` - 推送相关API

**功能：**
- 推送配置（支持MQTT和RabbitMQ）
- 推送参数管理（服务器地址、端口、认证信息等）
- 自动推送开关控制
- 推送日志查看和管理
- 推送撤销功能
- 权限控制（仅指定角色可配置）

### 3. 推送数据可视化看板模块

**相关文件：**
- `src/views/dashboard/` - 看板页面
- `src/api/modules/dashboard.js` - 看板相关API

**功能：**
- 项目状态分布可视化（环形图）
- 按期交付率统计（柱状图）
- 推送成功率分析（环形图）
- 推送频次趋势（折线图）
- 多维度筛选（时间、客户、状态）
- 项目推进状态与推送效果关联分析

## 技术架构说明

### 请求流程
```
组件 → API模块 → Axios实例 → 请求拦截器 → 后端API
                ↓
            响应拦截器 → 错误处理 → 组件
```

### 状态管理流程
```
组件 → Store Actions → API调用 → 更新State → 组件响应式更新
```

### 路由流程
```
路由跳转 → 路由守卫 → 权限检查 → 加载组件 → 渲染页面
```

### 权限控制
- **路由级权限**: 通过路由守卫检查
- **组件级权限**: 通过权限指令 `v-permission`
- **功能级权限**: 通过 `hasPermission` 函数检查

## 开发规范

### 命名规范
- **组件**: PascalCase (如 `ProjectList.vue`)
- **文件/目录**: kebab-case (如 `project-list.vue`)
- **变量/函数**: camelCase (如 `userInfo`)
- **常量**: UPPER_SNAKE_CASE (如 `PROJECT_STATUS`)

### 代码组织
- 每个模块独立管理自己的状态和API
- 公共逻辑提取到 `utils` 或 `composables`
- 组件保持单一职责原则
- API接口统一在 `api/modules` 中管理

### 样式规范
- 使用 Less 预处理器
- 全局变量定义在 `styles/variables.less`
- 公共样式混合定义在 `styles/mixins.less`
- 组件样式使用 `scoped` 避免污染

## 扩展指南

### 添加新页面
1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/routes.js` 中添加路由配置
3. 如需状态管理，在 `src/stores/modules/` 中创建store
4. 如需API调用，在 `src/api/modules/` 中添加API方法

### 添加新组件
1. 全局组件放在 `src/components/`
2. 页面级组件放在对应页面的 `components/` 目录
3. 在组件中按需引入

### 添加新工具函数
1. 在 `src/utils/` 中创建工具文件
2. 导出需要的函数
3. 在需要的地方按需引入

## 注意事项

1. **API接口**: 所有API接口需要后端配合实现
2. **权限控制**: 权限标识需要与后端保持一致
3. **状态管理**: 避免在多个store中重复管理相同数据
4. **性能优化**: 大数据列表使用虚拟滚动，图表及时销毁
5. **错误处理**: 统一使用ElMessage提示错误信息

