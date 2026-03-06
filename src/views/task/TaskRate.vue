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
          <el-card shadow="hover" class="stat-card">
            <el-statistic title="超时任务数" :value="statistics.overdueTasks">
              <template #prefix>
                <el-icon color="#f56c6c"><Warning /></el-icon>
              </template>
              <template #suffix>个</template>
            </el-statistic>
          </el-card>
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
            v-loading="pageLoading"
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
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Warning } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { formatDate } from '@/utils/date'
import { TASK_STATUS, TASK_STATUS_MAP } from '@/config/constants'
import { taskApi } from '@/api/modules/task'

// 页面加载状态
const pageLoading = ref(true)

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
const taskList = ref([])

// 月度统计数据
const monthlyStats = ref([])

// 获取任务统计
const fetchStatistics = async () => {
  try {
    const res = await taskApi.getCurrentUserTaskStatistics()

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

// 获取月度统计数据
const fetchMonthlyStats = async () => {
  try {
    const res = await taskApi.getCurrentUserMonthlyTaskStats()

    if (res.data && res.data.length > 0) {
      monthlyStats.value = res.data
    } else {
      monthlyStats.value = []
    }
  } catch (error) {
    console.error('Fetch monthly stats error:', error)
    monthlyStats.value = []
  }
}

// 获取任务列表
const fetchTaskList = async () => {
  try {
    const res = await taskApi.getTaskList({
      pageNum: 1,
      pageSize: 100
    })

    if (res.data) {
      taskList.value = res.data.list || []
    }
  } catch (error) {
    console.error('Fetch task list error:', error)
  } finally {
    pageLoading.value = false
  }
}

// 初始化图表
const initCharts = async () => {
  await nextTick()

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
    { value: Math.max(0, statistics.totalTasks - statistics.onTimeTasks - statistics.overdueTasks), name: '未完成' }
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
        colors: ['#67C23A', '#F56C6C', '#E6E8F3'],
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

// 更新趋势图
const updateTrendChart = () => {
  let months = []
  let rates = []

  if (monthlyStats.value && monthlyStats.value.length > 0) {
    months = monthlyStats.value.map(item => item.month)
    rates = monthlyStats.value.map(item => item.onTimeRate || 0)
  } else {
    months = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月']
    rates = [0, 0, 0, 0, 0, statistics.onTimeRate]
  }

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
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.5)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
          ])
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

// 窗口大小变化时重新渲染图表
const handleResize = () => {
  statusChart?.resize()
  trendChart?.resize()
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchStatistics(),
    fetchMonthlyStats(),
    fetchTaskList()
  ])

  await initCharts()

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
