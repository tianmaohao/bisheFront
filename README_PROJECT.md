# 企业项目管理系统 - 前端项目

## 项目简介

基于 Vue 3 + Element Plus 的企业项目管理系统前端，实现项目全流程管理、数据推送和可视化看板三大核心功能模块。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP请求**: Axios
- **CSS预处理器**: Less
- **数据可视化**: ECharts

## 项目结构

```
src/
├── api/                    # API接口封装
│   ├── modules/           # 各模块API
│   │   ├── user.js       # 用户相关API
│   │   ├── project.js    # 项目相关API
│   │   ├── push.js       # 推送相关API
│   │   └── dashboard.js  # 看板相关API
│   └── index.js          # Axios实例和拦截器
├── assets/                # 静态资源
├── components/            # 全局组件
│   └── layout/           # 布局组件
│       ├── Sidebar.vue   # 侧边栏
│       └── Header.vue    # 头部
├── composables/          # 组合式函数
│   └── useAuth.js        # 认证相关
├── config/               # 配置文件
│   ├── constants.js      # 常量定义
│   ├── env.js           # 环境配置
│   └── settings.js      # 应用设置
├── directives/           # 自定义指令
│   └── permission.js     # 权限指令
├── layouts/              # 布局组件
│   ├── MainLayout.vue   # 主布局
│   └── AuthLayout.vue   # 认证布局
├── router/               # 路由配置
│   ├── index.js         # 路由主配置
│   └── routes.js        # 路由定义
├── stores/               # Pinia状态管理
│   ├── modules/         # 状态模块
│   │   ├── user.js      # 用户状态
│   │   ├── project.js   # 项目状态
│   │   ├── push.js      # 推送状态
│   │   └── app.js       # 应用状态
│   └── index.js         # Store入口
├── styles/               # 全局样式
│   ├── variables.less   # 变量定义
│   ├── mixins.less      # 混合定义
│   └── global.less      # 全局样式
├── utils/               # 工具函数
│   ├── auth.js          # 认证工具
│   ├── date.js          # 日期工具
│   ├── permission.js    # 权限工具
│   ├── storage.js       # 存储工具
│   └── validator.js     # 验证工具
└── views/               # 页面视图
    ├── auth/            # 认证页面
    │   └── Login.vue    # 登录页
    ├── dashboard/       # 看板页面
    │   ├── Index.vue    # 数据看板
    │   └── Visual.vue   # 可视化看板
    ├── project/         # 项目管理
    │   ├── List.vue     # 项目列表
    │   ├── Detail.vue   # 项目详情
    │   └── components/  # 项目组件
    ├── push/            # 数据推送
    │   ├── Config.vue   # 推送配置
    │   └── Logs.vue     # 推送日志
    └── error/           # 错误页面
        └── 404.vue      # 404页面
```

## 核心功能模块

### 1. 项目流程与状态管理模块

- **项目列表**: 支持项目创建、编辑、删除、查询
- **项目详情**: 查看项目详细信息，进行状态流转操作
- **状态管理**: 
  - 需求发起 → 开发实施 → 部署推进 → 交付完成
  - 支持项目退回机制（含原因说明）
- **时间管控**: 自动识别超期项目，统计按期交付率

### 2. 实时数据推送模块

- **推送配置**: 
  - 支持 MQTT 和 RabbitMQ 两种协议
  - 配置推送参数（服务器地址、端口、认证信息等）
  - 设置自动推送开关
- **推送日志**: 
  - 查看推送历史记录
  - 支持按项目、状态、时间筛选
  - 支持撤销推送操作
- **权限控制**: 仅指定角色可配置参数或手动触发推送

### 3. 推送数据可视化看板模块

- **数据看板**: 
  - 项目状态分布（环形图）
  - 按期交付率统计（柱状图）
  - 推送成功率（环形图）
  - 推送频次趋势（折线图）
- **可视化看板**: 
  - 多维度筛选（时间周期、合作客户、项目状态）
  - 推送成功率趋势分析
  - 推送频次统计
  - 项目推进状态与数据推送效果关联分析

## 开发指南

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 环境变量配置

创建 `.env` 文件（参考 `.env.example`）：

```env
# API基础地址
VITE_API_BASE_URL=/api

# WebSocket地址
VITE_WS_BASE_URL=ws://localhost:8080/ws

# 应用标题
VITE_APP_TITLE=企业项目管理系统

# 请求超时时间(毫秒)
VITE_REQUEST_TIMEOUT=10000
```

## API接口说明

### 用户相关
- `POST /auth/login` - 用户登录
- `POST /auth/logout` - 用户登出
- `GET /user/info` - 获取用户信息

### 项目相关
- `GET /project/list` - 获取项目列表
- `GET /project/:id` - 获取项目详情
- `POST /project` - 创建项目
- `PUT /project/:id` - 更新项目
- `DELETE /project/:id` - 删除项目
- `PUT /project/:id/status` - 更新项目状态
- `POST /project/:id/return` - 退回项目
- `GET /project/statistics` - 获取项目统计
- `GET /project/on-time-delivery-rate` - 获取按期交付率

### 推送相关
- `GET /push/config` - 获取推送配置
- `PUT /push/config` - 更新推送配置
- `POST /push/manual` - 手动触发推送
- `GET /push/logs` - 获取推送日志
- `GET /push/statistics` - 获取推送统计
- `POST /push/cancel/:id` - 撤销推送

### 看板相关
- `GET /dashboard/data` - 获取看板数据
- `GET /dashboard/push-success-rate` - 获取推送成功率
- `GET /dashboard/push-frequency-trend` - 获取推送频次趋势
- `GET /dashboard/project-push-analysis` - 获取项目推送关联分析

## 权限说明

### 角色定义
- **ADMIN**: 管理员，拥有所有权限
- **PM**: 项目经理，可管理项目
- **MEMBER**: 团队成员，可查看和更新任务
- **VIEWER**: 访客，仅可查看

### 权限标识
- `project:create` - 创建项目
- `project:edit` - 编辑项目
- `project:delete` - 删除项目
- `project:view` - 查看项目
- `push:config` - 配置推送参数
- `push:manual` - 手动触发推送
- `push:view` - 查看推送日志
- `data:view` - 查看数据
- `data:export` - 导出数据

## 注意事项

1. 所有API请求都需要在请求头中携带 `Authorization: Bearer {token}`
2. 项目状态变更到"部署推进"或"交付完成"时会自动触发数据推送（如果开启了自动推送）
3. 项目退回时会自动撤销相关的推送状态
4. 图表数据需要后端提供对应的接口支持

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT

