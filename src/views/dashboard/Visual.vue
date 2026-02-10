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
            @change="handleFilterChange"
          />
        </el-form-item>
        <el-form-item label="合作客户">
          <el-select
            v-model="filterForm.customer"
            placeholder="请选择客户"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="customer in customerList"
              :key="customer"
              :label="customer"
              :value="customer"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目状态">
          <el-select
            v-model="filterForm.status"
            placeholder="请选择状态"
            clearable
            @change="handleFilterChange"
          >
            <el-option
              v-for="(label, value) in PROJECT_STATUS_MAP"
              :key="value"
              :label="label.label"
              :value="value"
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
            <span>项目推进状态与数据推送效果关联分析</span>
          </template>
          <div ref="correlationChartRef" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { PROJECT_STATUS_MAP } from '@/config/constants'
import { dashboardApi } from '@/api/modules/dashboard'

const successRateChartRef = ref(null)
const frequencyChartRef = ref(null)
const correlationChartRef = ref(null)

let successRateChart = null
let frequencyChart = null
let correlationChart = null

const filterForm = reactive({
  dateRange: [],
  customer: '',
  status: ''
})

const customerList = ref(['客户A', '客户B', '客户C', '客户D'])

const metrics = ref([
  { key: 'pushSuccessRate', label: '推送成功率', value: '95.5%', trend: 2.3 },
  { key: 'onTimeDeliveryRate', label: '按期交付率', value: '88.2%', trend: 1.5 },
  { key: 'pushCount', label: '推送总次数', value: '1,234', trend: -5.2 },
  { key: 'projectCount', label: '项目总数', value: '156', trend: 8.1 }
])

// 初始化图表
const initCharts = () => {
  if (successRateChartRef.value) {
    successRateChart = echarts.init(successRateChartRef.value)
  }
  if (frequencyChartRef.value) {
    frequencyChart = echarts.init(frequencyChartRef.value)
  }
  if (correlationChartRef.value) {
    correlationChart = echarts.init(correlationChartRef.value)
  }
  
  updateCharts()
}

// 更新图表数据
const updateCharts = async () => {
  const params = {
    startDate: filterForm.dateRange?.[0],
    endDate: filterForm.dateRange?.[1],
    customer: filterForm.customer,
    status: filterForm.status
  }
  
  try {
    // 获取推送成功率趋势
    const successRateRes = await dashboardApi.getPushSuccessRate(params)
    if (successRateChart && successRateRes.data) {
      successRateChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: successRateRes.data.dates || []
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
          data: frequencyRes.data.dates || []
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
    
    // 获取关联分析
    const correlationRes = await dashboardApi.getProjectPushAnalysis(params)
    if (correlationChart && correlationRes.data) {
      correlationChart.setOption({
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['项目状态分布', '推送成功率']
        },
        xAxis: {
          type: 'category',
          data: correlationRes.data.statuses || []
        },
        yAxis: [
          {
            type: 'value',
            name: '项目数量',
            position: 'left'
          },
          {
            type: 'value',
            name: '推送成功率(%)',
            position: 'right',
            max: 100
          }
        ],
        series: [
          {
            name: '项目状态分布',
            type: 'bar',
            data: correlationRes.data.projectCounts || [],
            itemStyle: {
              color: '#409EFF'
            }
          },
          {
            name: '推送成功率',
            type: 'line',
            yAxisIndex: 1,
            data: correlationRes.data.pushRates || [],
            itemStyle: {
              color: '#67C23A'
            }
          }
        ]
      })
    }
  } catch (error) {
    console.error('Update charts error:', error)
    // 使用模拟数据
    loadMockData()
  }
}

// 加载模拟数据
const loadMockData = () => {
  // 推送成功率趋势
  if (successRateChart) {
    successRateChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
      series: [{
        name: '推送成功率',
        data: [92, 94, 96, 95, 97, 95.5],
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
      xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'] },
      yAxis: { type: 'value' },
      series: [{
        name: '推送频次',
        data: [120, 150, 180, 200, 160, 140],
        type: 'bar',
        itemStyle: { color: '#409EFF' }
      }]
    })
  }
  
  // 关联分析
  if (correlationChart) {
    correlationChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['项目状态分布', '推送成功率'] },
      xAxis: { type: 'category', data: ['需求发起', '开发实施', '部署推进', '交付完成'] },
      yAxis: [
        { type: 'value', name: '项目数量', position: 'left' },
        { type: 'value', name: '推送成功率(%)', position: 'right', max: 100 }
      ],
      series: [
        { name: '项目状态分布', type: 'bar', data: [10, 20, 15, 30], itemStyle: { color: '#409EFF' } },
        { name: '推送成功率', type: 'line', yAxisIndex: 1, data: [0, 0, 95, 98], itemStyle: { color: '#67C23A' } }
      ]
    })
  }
}

const handleFilterChange = () => {
  updateCharts()
}

const handleReset = () => {
  filterForm.dateRange = []
  filterForm.customer = ''
  filterForm.status = ''
  handleFilterChange()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  successRateChart?.resize()
  frequencyChart?.resize()
  correlationChart?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initCharts()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  successRateChart?.dispose()
  frequencyChart?.dispose()
  correlationChart?.dispose()
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

