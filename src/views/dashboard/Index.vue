<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="30">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <span>项目状态分布</span>
          </template>
          <div ref="statusChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <span>按期交付率</span>
          </template>
          <div ref="deliveryRateChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <span>推送成功率</span>
          </template>
          <div ref="pushSuccessChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="24" :md="12">
        <el-card>
          <template #header>
            <span>推送频次趋势</span>
          </template>
          <div ref="pushTrendChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useProjectStore } from '@/stores/modules/project'
import { usePushStore } from '@/stores/modules/push'
import { Folder, Check, Close, Upload } from '@element-plus/icons-vue'

const FolderIcon = Folder
const CheckIcon = Check
const CloseIcon = Close
const UploadIcon = Upload

const projectStore = useProjectStore()
const pushStore = usePushStore()

const statusChartRef = ref(null)
const deliveryRateChartRef = ref(null)
const pushSuccessChartRef = ref(null)
const pushTrendChartRef = ref(null)

let statusChart = null
let deliveryRateChart = null
let pushSuccessChart = null
let pushTrendChart = null

const stats = ref([
  { key: 'total', label: '项目总数', value: 0, icon: FolderIcon, color: '#409EFF' },
  { key: 'delivered', label: '已交付', value: 0, icon: CheckIcon, color: '#67C23A' },
  { key: 'overdue', label: '超期项目', value: 0, icon: CloseIcon, color: '#F56C6C' },
  { key: 'pushCount', label: '今日推送', value: 0, icon: UploadIcon, color: '#E6A23C' }
])

// 初始化图表
const initCharts = () => {
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
  }
  if (deliveryRateChartRef.value) {
    deliveryRateChart = echarts.init(deliveryRateChartRef.value)
  }
  if (pushSuccessChartRef.value) {
    pushSuccessChart = echarts.init(pushSuccessChartRef.value)
  }
  if (pushTrendChartRef.value) {
    pushTrendChart = echarts.init(pushTrendChartRef.value)
  }
  
  updateCharts()
}

// 更新图表数据
const updateCharts = () => {
  // 项目状态分布 - 环形图
  if (statusChart) {
    statusChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          name: '项目状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          data: [
            { value: 10, name: '需求发起' },
            { value: 20, name: '开发实施' },
            { value: 15, name: '部署推进' },
            { value: 30, name: '交付完成' }
          ]
        }
      ]
    })
  }
  
  // 按期交付率 - 柱状图
  if (deliveryRateChart) {
    deliveryRateChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['个人', '团队']
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
          data: [85, 78],
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
  
  // 推送成功率 - 环形图
  if (pushSuccessChart) {
    pushSuccessChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: '5%',
        left: 'center'
      },
      series: [
        {
          name: '推送状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          data: [
            { value: 85, name: '成功' },
            { value: 10, name: '失败' },
            { value: 5, name: '待推送' }
          ]
        }
      ]
    })
  }
  
  // 推送频次趋势 - 折线图
  if (pushTrendChart) {
    pushTrendChart.setOption({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: [12, 15, 18, 20, 16, 14, 10],
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
              { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
            ])
          }
        }
      ]
    })
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  try {
    // 获取项目统计
    await projectStore.fetchStatistics()
    // 获取推送统计
    await pushStore.fetchPushStatistics()
    
    // 更新统计数据
    // 这里应该从store中获取实际数据
    stats.value[0].value = projectStore.projectList.length
    stats.value[3].value = pushStore.todayPushCount
  } catch (error) {
    console.error('Fetch statistics error:', error)
  }
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  statusChart?.resize()
  deliveryRateChart?.resize()
  pushSuccessChart?.resize()
  pushTrendChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  setTimeout(() => {
    initCharts()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  statusChart?.dispose()
  deliveryRateChart?.dispose()
  pushSuccessChart?.dispose()
  pushTrendChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.dashboard {
  .stats-row {
    margin-bottom: 20px;
    
    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin-right: 15px;
        }
        
        .stat-info {
          flex: 1;
          
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: @text-color-primary;
            margin-bottom: 5px;
          }
          
          .stat-label {
            font-size: 14px;
            color: @text-color-secondary;
          }
        }
      }
    }
  }
  
  .charts-row {
    margin-bottom: 20px;
  }
}
</style>

