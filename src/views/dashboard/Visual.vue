<template>
  <div class="dashboard-visual">
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间周期">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
          />
        </el-form-item>
        <el-form-item label="项目维度">
          <el-select
              v-model="filterForm.projectId"
              placeholder="请选择项目"
              clearable
              @change="handleFilterChange"
              style="width: 200px"
          >
            <el-option
                label="全部项目"
                :value="null"
            />
            <el-option
                v-for="project in projectList"
                :key="project.id"
                :label="project.name"
                :value="project.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilterChange">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 核心指标卡片 -->
    <el-row :gutter="20" class="metrics-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="metric in metrics" :key="metric.key">
        <el-card class="metric-card">
          <div class="metric-content">
            <div class="metric-label">{{ metric.label }}</div>
            <div class="metric-value">{{ metric.value }}</div>
            <div class="metric-trend" :class="metric.trend > 0 ? 'up' : 'down'">
              <el-icon>
                <component :is="metric.trend > 0 ? 'ArrowUp' : 'ArrowDown'" />
              </el-icon>
              <span>{{ Math.abs(metric.trend) }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <span>推送成功率趋势</span>
          </template>
          <div ref="successRateChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <span>推送频次统计</span>
          </template>
          <div ref="frequencyChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span>按期交付率趋势</span>
          </template>
          <div ref="onTimeDeliveryChartRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/modules/dashboard'
import { projectApi } from '@/api/modules/project'
import { ElMessage } from 'element-plus'

const successRateChartRef = ref(null)
const frequencyChartRef = ref(null)
const onTimeDeliveryChartRef = ref(null)

let successRateChart = null
let frequencyChart = null
let onTimeDeliveryChart = null

const filterForm = reactive({
  dateRange: [],
  projectId: null
})

const projectList = ref([])

const metrics = ref([
  { key: 'pushSuccessRate', label: '推送成功率', value: '95.5%', trend: 2.3 },
  { key: 'onTimeDeliveryRate', label: '按期交付率', value: '88.2%', trend: 1.5 },
  { key: 'pushCount', label: '推送总次数', value: '1,234', trend: -5.2 },
  { key: 'projectCount', label: '项目总数', value: '156', trend: 8.1 }
])

// 获取项目列表
const fetchProjectList = async () => {
  try {
    const res = await projectApi.getProjectList({ pageNum: 1, pageSize: 100 })
    if (res.data && res.data.list) {
      projectList.value = res.data.list
    }
  } catch (error) {
    console.error('Fetch project list error:', error)
  }
}

// 初始化图表
const initCharts = () => {
  if (successRateChartRef.value) {
    successRateChart = echarts.init(successRateChartRef.value)
  }
  if (frequencyChartRef.value) {
    frequencyChart = echarts.init(frequencyChartRef.value)
  }
  if (onTimeDeliveryChartRef.value) {
    onTimeDeliveryChart = echarts.init(onTimeDeliveryChartRef.value)
  }

  updateCharts()
}

// 更新图表数据
const updateCharts = async () => {
  const params = {
    startDate: filterForm.dateRange?.[0],
    endDate: filterForm.dateRange?.[1],
    projectId: filterForm.projectId
  }

  try {
    // 判断是否选择了项目
    const isAllProjects = !filterForm.projectId

    // 获取推送成功率趋势
    const successRateRes = await dashboardApi.getPushSuccessRate(params)
    if (successRateChart && successRateRes.data) {
      successRateChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: successRateRes.data.dates || [],
          axisLabel: {
            interval: 0,
            rotate: isAllProjects ? 30 : 0 // 全部项目时倾斜显示
          }
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
            name: '推送成功率',
            data: successRateRes.data.rates || [],
            type: 'line',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
                { offset: 1, color: 'rgba(103, 194, 58, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      })
    }

    // 获取推送频次统计
    const frequencyRes = await dashboardApi.getPushFrequencyTrend(params)
    if (frequencyChart && frequencyRes.data) {
      frequencyChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: frequencyRes.data.dates || [],
          axisLabel: {
            interval: 0,
            rotate: isAllProjects ? 30 : 0
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: '推送频次',
            data: frequencyRes.data.counts || [],
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#188df0' },
                { offset: 1, color: '#188df0' }
              ])
            }
          }
        ]
      })
    }

    // 获取按期交付率趋势
    const onTimeDeliveryRes = await dashboardApi.getOnTimeDeliveryRate(params)
    if (onTimeDeliveryChart && onTimeDeliveryRes.data) {
      onTimeDeliveryChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: onTimeDeliveryRes.data.dates || [],
          axisLabel: {
            interval: 0,
            rotate: isAllProjects ? 30 : 0
          }
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
            name: '按期交付率',
            data: onTimeDeliveryRes.data.rates || [],
            type: 'line',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            },
            itemStyle: {
              color: '#409EFF'
            }
          }
        ]
      })
    }
  } catch (error) {
    console.error('Update charts error:', error)
    ElMessage.error('加载图表数据失败')
    loadMockData()
  }
}

// 加载核心指标数据
const fetchMetrics = async () => {
  const params = {
    startDate: filterForm.dateRange?.[0],
    endDate: filterForm.dateRange?.[1],
    projectId: filterForm.projectId
  }

  try {
    const res = await dashboardApi.getDashboardData(params)
    if (res.data) {
      // 更新推送成功率
      if (res.data.pushStats) {
        metrics.value[0].value = `${res.data.pushStats.successRate}%`
      }
      // 更新推送总次数
      if (res.data.pushStats) {
        metrics.value[2].value = res.data.pushStats.todayCount.toLocaleString()
      }
      // 更新项目总数（不随项目维度变化）
      if (res.data.projectStats) {
        metrics.value[3].value = res.data.projectStats.total.toLocaleString()
      }
    }
  } catch (error) {
    console.error('Fetch metrics error:', error)
  }
}

// 加载模拟数据
const loadMockData = () => {
  const isAllProjects = !filterForm.projectId
  const dates = isAllProjects
      ? projectList.value.map(p => p.name)
      : ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月']

  // 推送成功率趋势
  if (successRateChart) {
    successRateChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 0,
          rotate: isAllProjects ? 30 : 0
        }
      },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{
        name: '推送成功率',
        data: isAllProjects
            ? projectList.value.map(() => 90 + Math.random() * 10)
            : [92, 94, 96, 95, 97, 95.5],
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(103, 194, 58, 0.3)' },
        itemStyle: { color: '#67C23A' }
      }]
    })
  }

  // 推送频次统计
  if (frequencyChart) {
    frequencyChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 0,
          rotate: isAllProjects ? 30 : 0
        }
      },
      yAxis: { type: 'value' },
      series: [{
        name: '推送频次',
        data: isAllProjects
            ? projectList.value.map(() => Math.floor(100 + Math.random() * 100))
            : [120, 150, 180, 200, 160, 140],
        type: 'bar',
        itemStyle: { color: '#409EFF' }
      }]
    })
  }

  // 按期交付率趋势
  if (onTimeDeliveryChart) {
    onTimeDeliveryChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 0,
          rotate: isAllProjects ? 30 : 0
        }
      },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{
        name: '按期交付率',
        data: isAllProjects
            ? projectList.value.map(() => 80 + Math.random() * 15)
            : [85, 87, 88, 89, 88, 88.2],
        type: 'line',
        smooth: true,
        areaStyle: { color: 'rgba(64, 158, 255, 0.3)' },
        itemStyle: { color: '#409EFF' }
      }]
    })
  }
}

const handleFilterChange = () => {
  fetchMetrics()
  updateCharts()
}

const handleReset = () => {
  filterForm.dateRange = []
  filterForm.projectId = null
  handleFilterChange()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  successRateChart?.resize()
  frequencyChart?.resize()
  onTimeDeliveryChart?.resize()
}

onMounted(() => {
  fetchProjectList()
  fetchMetrics()
  setTimeout(() => {
    initCharts()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  successRateChart?.dispose()
  frequencyChart?.dispose()
  onTimeDeliveryChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.dashboard-visual {
  .filter-card {
    margin-bottom: 20px;
  }

  .metrics-row {
    margin-bottom: 20px;

    .metric-card {
      .metric-content {
        .metric-label {
          font-size: 14px;
          color: @text-color-secondary;
          margin-bottom: 10px;
        }

        .metric-value {
          font-size: 28px;
          font-weight: bold;
          color: @text-color-primary;
          margin-bottom: 10px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          font-size: 12px;

          &.up {
            color: @success-color;
          }

          &.down {
            color: @danger-color;
          }
        }
      }
    }
  }
}
</style>
