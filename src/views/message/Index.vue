
<template>
  <div class="message-center" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的消息</span>
          <div class="header-actions">
            <el-button
                type="primary"
                size="small"
                @click="handleRefresh"
                :icon="Refresh"
            >
              刷新
            </el-button>
            <el-button
                type="success"
                size="small"
                @click="handleMarkAllAsRead"
                :disabled="unreadCount === 0"
            >
              全部已读
            </el-button>
          </div>
        </div>
      </template>

      <!-- 消息类型筛选 -->
      <div class="filter-bar">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane name="all">
            <template #label>
              <span>
                全部消息
                <el-badge
                    v-if="unreadCount > 0"
                    :value="unreadCount"
                    :max="99"                    style="margin-left: 8px"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="unread">
            <template #label>
              <span>
                未读消息
                <el-badge
                    v-if="unreadCount > 0"
                    :value="unreadCount"
                    :max="99"
                    type="danger"                    style="margin-left: 8px"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane name="task_assign">任务分配</el-tab-pane>
          <el-tab-pane name="task_timeout">任务超时</el-tab-pane>
          <el-tab-pane name="task_rejected">任务驳回</el-tab-pane>
        </el-tabs>
      </div>

      <!-- 消息列表 -->
      <div class="message-list">
        <el-empty v-if="messageList.length === 0" description="暂无消息" />

        <div
            v-else
            v-for="msg in messageList"
            :key="msg.msgId"
            class="message-item"
            :class="{ 'is-unread': msg.readFlag === 0 }"
            @click="handleViewMessage(msg)"
        >
          <div class="message-icon">
            <el-icon :size="24" :color="getMessageIcon(msg.msgType).color">
              <component :is="getMessageIcon(msg.msgType).icon" />
            </el-icon>
          </div>

          <div class="message-content">
            <div class="message-header">
              <span class="message-title">{{ msg.title }}</span>
              <el-tag
                  v-if="msg.readFlag === 0"
                  size="small"
                  type="danger"
                  effect="plain"
              >
                未读
              </el-tag>
              <span class="message-time">{{ formatTime(msg.createTime) }}</span>
            </div>

            <div class="message-body">
              {{ msg.content }}
            </div>

            <div class="message-footer" v-if="msg.readTime">
              <span class="read-time">已读时间：{{ formatReadTime(msg.readTime) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination" v-if="messageList.length > 0">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="fetchMessageList"
            @size-change="fetchMessageList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Bell, Warning, DocumentChecked, CircleClose } from '@element-plus/icons-vue'
import { messageApi } from '@/api/modules/message'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()
const loading = ref(false)
const messageList = ref([])
const activeTab = ref('all')

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 统计数量
const totalCount = ref(0)
const unreadCount = ref(0)

// 获取消息图标和颜色
const getMessageIcon = (msgType) => {
  const iconMap = {
    task_assign: { icon: 'Document', color: '#409EFF' },
    task_timeout: { icon: 'Warning', color: '#E6A23C' },
    task_near_timeout: { icon: 'Clock', color: '#F56C6C' },
    task_rejected: { icon: 'CircleClose', color: '#F56C6C' },
    task_completed: { icon: 'CircleCheck', color: '#67C23A' },
    default: { icon: 'Bell', color: '#909399' }
  }
  return iconMap[msgType] || iconMap.default
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const diff = now - date

  // 1 分钟内
  if (diff < 60000) return '刚刚'
  // 1 小时内
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  // 24 小时内
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  // 7 天内
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`

  // 超过 7 天显示具体日期
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 格式化已读时间
const formatReadTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取消息列表
const fetchMessageList = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.page,
      pageSize: pagination.size
    }

    // 根据 tab 筛选
    if (activeTab.value === 'unread') {
      params.readFlag = 0
    } else if (['task_assign', 'task_timeout', 'task_rejected'].includes(activeTab.value)) {
      params.msgType = activeTab.value
    }

    const res = await messageApi.getMessageList(params)
    if (res.data) {
      messageList.value = res.data.list || []
      pagination.total = res.data.total || 0
      totalCount.value = res.data.total || 0
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取消息列表失败')
  } finally {
    loading.value = false
  }
}

// 获取未读消息数量
const fetchUnreadCount = async () => {
  try {
    const res = await messageApi.getUnreadMessages()
    if (res.data) {
      unreadCount.value = res.data.length || 0
    }
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 刷新
const handleRefresh = () => {
  fetchMessageList()
  fetchUnreadCount()
}

// Tab 切换
const handleTabChange = () => {
  pagination.page = 1
  fetchMessageList()
}

// 查看消息（标记为已读）
const handleViewMessage = async (msg) => {
  if (msg.readFlag === 1) return // 已读的不需要再次标记

  try {
    await messageApi.markAsRead(msg.msgId)
    msg.readFlag = 1
    msg.readTime = new Date().toISOString()
    await fetchUnreadCount()

    // 如果是当前页的第一条且已读完，刷新列表
    if (messageList.value.length === 1 && pagination.page > 1) {
      pagination.page--
      fetchMessageList()
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 全部已读
const handleMarkAllAsRead = async () => {
  try {
    await messageApi.markAllAsRead()
    ElMessage.success('已全部标记为已读')
    await fetchMessageList()
    await fetchUnreadCount()
  } catch (error) {
    console.error('全部已读失败:', error)
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  fetchMessageList()
  fetchUnreadCount()
})
</script>

<style lang="less" scoped>
.message-center {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 8px;
    }
  }

  .filter-bar {
    margin-bottom: 16px;
  }

  .message-list {
    min-height: 400px;

    .message-item {
      display: flex;
      padding: 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s;

      &:last-child {
        border-bottom: none;
      }

      &:hover {
        background-color: #f5f7fa;
      }

      &.is-unread {
        background-color: #ecf5ff;

        &:hover {
          background-color: #e1f3d8;
        }

        .message-title {
          font-weight: bold;
          color: #303133;
        }
      }

      .message-icon {
        margin-right: 16px;
        display: flex;
        align-items: center;
      }

      .message-content {
        flex: 1;
        min-width: 0;

        .message-header {
          display: flex;
          align-items: center;
          margin-bottom: 8px;

          .message-title {
            font-size: 15px;
            color: #606266;
            margin-right: 12px;
          }

          .message-time {
            margin-left: auto;
            font-size: 12px;
            color: #909399;
          }
        }

        .message-body {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .message-footer {
          .read-time {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
