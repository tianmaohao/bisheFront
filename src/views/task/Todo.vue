<!-- src/views/task/Todo.vue -->
<template>
    <div class="task-todo">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的待办任务</span>
          </div>
        </template>
  
        <!-- 筛选栏 -->
        <div class="search-bar">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="项目名称">
              <el-input
                v-model="searchForm.projectName"
                placeholder="请输入项目名称"
                clearable
              />
            </el-form-item>
            <el-form-item label="节点名称">
              <el-input
                v-model="searchForm.nodeName"
                placeholder="请输入节点名称"
                clearable
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
  
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="projectName" label="项目名称" min-width="160" />
          <el-table-column prop="nodeName" label="节点名称" min-width="140" />
          <el-table-column prop="taskTitle" label="任务标题" min-width="180" />
          <el-table-column prop="createTime" label="创建时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="时间限制" min-width="160">
            <template #default="{ row }">
              <span :class="{ danger: isNearOrTimeout(row) }">
                {{ formatDate(row.deadline) }}
                <el-tag v-if="isTimeout(row)" type="danger" size="small">
                  已超时
                </el-tag>
                <el-tag v-else-if="isNearDeadline(row)" type="warning" size="small">
                  即将到期
                </el-tag>
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="TASK_STATUS_MAP[row.status]?.type || 'warning'">
                {{ TASK_STATUS_MAP[row.status]?.label || row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                @click="handleComplete(row)"
              >
                完成
              </el-button>
              <el-button
                type="danger"
                link
                @click="handleReject(row)"
              >
                退回
              </el-button>
            </template>
          </el-table-column>
        </el-table>
  
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="fetchList"
            @size-change="fetchList"
          />
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, computed, onMounted } from 'vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useUserStore } from '@/stores/modules/user'
  import { useTaskStore } from '@/stores/modules/task'
  import { formatDate } from '@/utils/date'
  import { TASK_STATUS, TASK_STATUS_MAP } from '@/config/constants'
  
  const userStore = useUserStore()
  const taskStore = useTaskStore()
  
  const loading = ref(false)
  const searchForm = reactive({
    projectName: '',
    nodeName: ''
  })
  const pagination = reactive({
    page: 1,
    size: 10,
    total: 0
  })
  
  const tableData = computed(() => {
    // 简单前端过滤项目/节点名称（后端目前未支持 keyword 时可这样做）
    return taskStore.list.filter(item => {
      const pOk = !searchForm.projectName || (item.projectName || '').includes(searchForm.projectName)
      const nOk = !searchForm.nodeName || (item.nodeName || '').includes(searchForm.nodeName)
      return pOk && nOk
    })
  })
  
  const fetchList = async () => {
    loading.value = true
    try {
      await taskStore.fetchTaskList({
        pageNum: pagination.page,
        pageSize: pagination.size,
        assigneeId: userStore.userInfo?.id,
        // 待办：后端 TaskStatusEnum.code = 'pending' / 'in_progress'
        status: 'pending'
      })
      pagination.total = taskStore.total
    } finally {
      loading.value = false
    }
  }
  
  const handleSearch = () => {
    pagination.page = 1
    fetchList()
  }
  
  const handleReset = () => {
    searchForm.projectName = ''
    searchForm.nodeName = ''
    handleSearch()
  }
  
  const handleComplete = async (row) => {
    await ElMessageBox.confirm(`确认完成任务「${row.taskTitle}」？`, '提示', {
      type: 'warning'
    })
    await taskStore.completeTask(row.taskId)
    ElMessage.success('任务已完成')
    fetchList()
  }
  
  const handleReject = async (row) => {
    const { value } = await ElMessageBox.prompt(
      `请输入退回说明（任务「${row.taskTitle}」）`,
      '退回任务',
      {
        inputType: 'textarea',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    await taskStore.rejectTask(row.taskId, value)
    ElMessage.success('任务已退回')
    fetchList()
  }

  
  // const taskStatusText = (status, timeoutFlag) => {
  //   if (timeoutFlag === 1) return '即将/已超时'
  //   const map = {
  //     pending: '待处理',
  //     in_progress: '进行中',
  //     completed: '已完成',
  //     rejected: '已退回',
  //     timeout: '已超时'
  //   }
  //   return map[status] || status || '-'
  // }

  const isNearOrTimeout = (row) => {
    if (!row.deadline) return false
    const deadline = new Date(row.deadline).getTime()
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    return deadline < now || deadline - now <= oneHour
  }

  const isTimeout = (row) => {
    if (!row.deadline) return false
    const deadline = new Date(row.deadline).getTime()
    const now = Date.now()
    return deadline < now
  }

  const isNearDeadline = (row) => {
    if (!row.deadline) return false
    const deadline = new Date(row.deadline).getTime()
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    return deadline >= now && deadline - now <= oneHour
  }
  
  onMounted(fetchList)
  </script>
  
  <style lang="less" scoped>
  .task-todo {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search-bar {
      margin-bottom: 16px;
    }
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
    .danger {
      color: @danger-color;
      font-weight: bold;
    }
  }
  </style>