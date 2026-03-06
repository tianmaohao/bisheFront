<template>
  <div class="task-rate">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的任务分布</span>
        </div>
      </template>

      <el-row :gutter="20">
        <!-- 任务概览卡片 -->
        <el-col :span="6" :xs="24">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="总任务数" :value="statistics.totalTasks">
              <template #suffix>个</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6" :xs="24">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="按时完成数" :value="statistics.onTimeTasks">
              <template #suffix>个</template>
            </el-statistic>
          </el-card>
        </el-col>
        <el-col :span="6" :xs="24">
          <el-statistic title="超时任务数" :value="statistics.overdueTasks">
            <template #prefix>
              <el-icon color="#f56c6c"><Warning /></el-icon>
            </template>
            <template #suffix>个</template>
          </el-statistic>
        </el-col>
        <el-col :span="6" :xs="24">
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="按时完成率" :value="statistics.onTimeRate" :precision="1">
              <template #suffix>%</template>
            </el-statistic>
          </el-card>
        </el-col>
      </el-row>

      <!-- 图表展示 -->
      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12" :xs="24">
          <el-card>
            <template #header>
              <span>任务状态分布</span>
            </template>
            <div ref="statusChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>
        <el-col :span="12" :xs="24">
          <el-card>
            <template #header>
              <span>任务按时完成趋势</span>
            </template>
            <div ref="trendChartRef" style="height: 300px;"></div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 任务明细表格 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>任务明细</span>
        </template>
        <el-table
            v-loading="tableLoading"
            :data="taskList"
            stripe
            border
            style="width: 100%"
        >
          <el-table-column prop="projectName" label="项目名称" min-width="150" />
          <el-table-column prop="nodeName" label="节点名称" min-width="120" />
          <el-table-column prop="taskTitle" label="任务标题" min-width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="TASK_STATUS_MAP[row.status]?.type || 'info'">
                {{ TASK_STATUS_MAP[row.status]?.label || row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="deadline" label="截止时间" width="160">
            <template #default="{ row }">
              <span :class="{ 'text-danger': isTimeout(row) }">
                {{ formatDate(row.deadline) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="completeTime" label="完成时间" width="160">
            <template #default="{ row }">
              {{ formatDate(row.completeTime) }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/modules/user'
import { formatDate } from '@/utils/date'
import { TASK_STATUS, TASK_STATUS_MAP } from '@/config/constants'
import request from '@/api'

const userStore = useUserStore()

// 统计数据
const statistics = reactive({
  totalTasks: 0,
  onTimeTasks: 0,
  overdueTasks: 0,
  onTimeRate: 0
})

// 图表引用
const statusChartRef = ref(null)
const trendChartRef = ref(null)
let statusChart = null
let trendChart = null

// 任务列表
const tableLoading = ref(false)
const taskList = ref([])

// 获取任务统计
const fetchStatistics = async () => {
  try {
    const userId = userStore.userInfo?.userId
    if (!userId) return

    const res = await request({
      url: `/task/statistics/${userId}`,
      method: 'get'
    })

    if (res.data) {
      statistics.totalTasks = res.data.totalTasks || 0
      statistics.onTimeTasks = res.data.onTimeTasks || 0
      statistics.overdueTasks = res.data.overdueTasks || 0
      statistics.onTimeRate = res.data.onTimeRate || 0
    }
  } catch (error) {
    console.error('Fetch statistics error:', error)
  }
}

// 获取任务列表
const fetchTaskList = async () => {
  tableLoading.value = true
  try {
    const userId = userStore.userInfo?.userId
    if (!userId) return

    const res = await request({
      url: '/task/list',
      method: 'get',
      params: {
        assigneeId: userId,
        pageNum: 1,
        pageSize: 100
      }
    })

    if (res.data) {
      taskList.value = res.data.list || []
    }
  } catch (error) {
    console.error('Fetch task list error:', error)
  } finally {
    tableLoading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    updateStatusChart()
  }

  if (trendChartRef.value) {
    trendChart = echarts.init(trendChartRef.value)
    updateTrendChart()
  }
}

// 更新状态分布图
const updateStatusChart = () => {
  const statusData = [
    { value: statistics.onTimeTasks, name: '按时完成' },
    { value: statistics.overdueTasks, name: '超时完成' },
    { value: statistics.totalTasks - statistics.onTimeTasks - statistics.overdueTasks, name: '未完成' }
  ]

  statusChart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}个 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: '60%',
        data: statusData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          formatter: '{b}: {c}个'
        }
      }
    ]
  })
}

// 更新趋势图（这里使用 mock 数据，实际应从后端获取）
const updateTrendChart = () => {
  // Mock 数据 - 实际应该从后端获取最近几个月的统计数据
  const months = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月']
  const rates = [85, 88, 82, 90, 87, statistics.onTimeRate]

  trendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '按时完成率',
        data: rates,
        type: 'line',
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        },
        areaStyle: {
          color: 'rgba(103, 194, 58, 0.2)'
        },
        label: {
          show: true,
          formatter: '{c}%',
          position: 'top'
        }
      }
    ]
  })
}

// 判断是否超时
const isTimeout = (row) => {
  if (!row.deadline) return false
  const deadline = new Date(row.deadline).getTime()
  const now = Date.now()
  return deadline < now && row.status !== 'completed'
}

// 获取状态类型
// const getStatusType = (status) => {
//   const map = {
//     pending: 'warning',
//     in_progress: 'primary',
//     completed: 'success',
//     rejected: 'danger',
//     timeout: 'danger'
//   }
//   return map[status] || 'info'
// }

// 获取状态文本
// const getStatusText = (status) => {
//   const map = {
//     pending: '待处理',
//     in_progress: '进行中',
//     completed: '已完成',
//     rejected: '已退回',
//     timeout: '已超时'
//   }
//   return map[status] || status
// }

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  statusChart?.resize()
  trendChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  fetchTaskList()
  setTimeout(() => {
    initCharts()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  statusChart?.dispose()
  trendChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.task-rate {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-card {
    text-align: center;
  }

  .text-danger {
    color: #f56c6c;
    font-weight: bold;
  }
}
</style>
