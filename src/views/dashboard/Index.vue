<template>
  <div class="dashboard">
    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="时间区间">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item label="维度">
          <el-radio-group v-model="filterForm.dimension" @change="fetchData">
            <el-radio label="personal">个人</el-radio>
            <el-radio label="team">团队</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="8" v-for="stat in stats" :key="stat.key">
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
            <span>任务准时完成率</span>
          </template>
          <div ref="taskOnTimeRateChartRef" style="height: 300px;"></div>
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
            <div class="chart-header">
              <span>任务排行榜</span>
              <el-select v-model="rankSortBy" size="small" @change="fetchRanking">
                <el-option label="准时完成率" value="onTimeRate" />
                <el-option label="完成任务总数" value="totalTasks" />
              </el-select>
            </div>
          </template>
          <div class="ranking-table-container">
            <el-table :data="rankingData" style="width: 100%" :height="260">
              <el-table-column type="index" label="排名" width="60" :index="indexMethod" />
              <el-table-column prop="userName" label="姓名" width="100" />
              <el-table-column v-if="filterForm.dimension === 'personal'" prop="department" label="部门" width="120" />
              <el-table-column
                  v-if="rankSortBy === 'onTimeRate'"
                  prop="onTimeRate"
                  label="准时完成率"
                  width="120"
              >
                <template #default="{ row }">
                  {{ row.onTimeRate }}%
                </template>
              </el-table-column>
              <el-table-column
                  v-if="rankSortBy === 'totalTasks'"
                  prop="totalTasks"
                  label="完成总任务数"
                  width="120"
              />
              <el-table-column
                  v-if="rankSortBy === 'onTimeRate'"
                  prop="totalTasks"
                  label="完成总任务数"
                  width="120"
              />
              <el-table-column
                  v-if="rankSortBy === 'totalTasks'"
                  prop="onTimeRate"
                  label="准时完成率"
                  width="120"
              >
                <template #default="{ row }">
                  {{ row.onTimeRate }}%
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { useProjectStore } from '@/stores/modules/project'
import { usePushStore } from '@/stores/modules/push'
import { Folder, Check, Close, Upload } from '@element-plus/icons-vue'
import { dashboardApi } from '@/api/modules/dashboard'

const FolderIcon = Folder
const CheckIcon = Check
const CloseIcon = Close
const UploadIcon = Upload

const projectStore = useProjectStore()
const pushStore = usePushStore()

const filterForm = ref({
  dateRange: [],
  dimension: 'personal',
  startDate: null,
  endDate: null
})

const rankSortBy = ref('onTimeRate')

const statusChartRef = ref(null)
const taskOnTimeRateChartRef = ref(null)
const pushSuccessChartRef = ref(null)
const rankingChartRef = ref(null)

let statusChart = null
let taskOnTimeRateChart = null
let pushSuccessChart = null
let rankingChart = null

const stats = ref([
  { key: 'total', label: '项目总数', value: 0, icon: FolderIcon, color: '#409EFF' },
  { key: 'delivered', label: '已交付', value: 0, icon: CheckIcon, color: '#67C23A' },
  { key: 'overdue', label: '超期项目', value: 0, icon: CloseIcon, color: '#F56C6C' },
])

// 处理日期选择
const handleDateChange = (value) => {
  if (value && value.length === 2) {
    filterForm.value.startDate = value[0]
    filterForm.value.endDate = value[1]
  } else {
    filterForm.value.startDate = null
    filterForm.value.endDate = null
  }
}

// 索引方法
const indexMethod = (index) => {
  return index + 1
}

// 初始化图表
const initCharts = () => {
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
  }
  if (taskOnTimeRateChartRef.value) {
    taskOnTimeRateChart = echarts.init(taskOnTimeRateChartRef.value)
  }
  if (pushSuccessChartRef.value) {
    pushSuccessChart = echarts.init(pushSuccessChartRef.value)
  }

  updateCharts()
}

// 更新图表数据
const updateCharts = () => {
  updateStatusChart()
  updateTaskOnTimeRateChart()
  updatePushSuccessChart()
}

// 更新项目状态分布图表
const updateStatusChart = () => {
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
}

// 更新任务准时完成率图表
const updateTaskOnTimeRateChart = () => {
  if (taskOnTimeRateChart && taskOnTimeRateData.value) {
    const names = taskOnTimeRateData.value.dataList.map(item => item.name)
    const rates = taskOnTimeRateData.value.dataList.map(item => item.onTimeRate)

    taskOnTimeRateChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          interval: 0,
          rotate: 30
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
          data: rates,
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#83bff6' },
              { offset: 0.5, color: '#188df0' },
              { offset: 1, color: '#188df0' }
            ])
          },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%'
          }
        }
      ]
    })
  }
}

// 更新推送成功率图表
const updatePushSuccessChart = () => {
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
}

const taskOnTimeRateData = ref(null)
const rankingData = ref([])


const fetchStatistics = async () => {
  try {
    // 获取项目统计
    const projectStatsRes = await projectStore.fetchStatistics()

    // 从响应中获取数据
    if (projectStatsRes && projectStatsRes.data) {
      const statsData = projectStatsRes.data
      stats.value[0].value = statsData.total || 0
      stats.value[1].value = statsData.byStatus.DELIVERED || 0
      stats.value[2].value = statsData.overdueCount || 0
    } else {
      // 如果返回数据为空，使用 projectList 长度
      stats.value[0].value = projectStore.projectList.length
    }
  } catch (error) {
    console.error('Fetch statistics error:', error)
    // 发生错误时设置默认值
    stats.value.forEach(stat => stat.value = 0)
  }
}

// 获取任务准时完成率
const fetchTaskOnTimeRate = async () => {
  try {
    const params = {
      dimension: filterForm.value.dimension,
      startDate: filterForm.value.startDate,
      endDate: filterForm.value.endDate
    }
    const res = await dashboardApi.getTaskOnTimeRate(params)
    taskOnTimeRateData.value = res.data
    updateTaskOnTimeRateChart()
  } catch (error) {
    console.error('Fetch task on-time rate error:', error)
  }
}

// 获取排行榜数据
const fetchRanking = async () => {
  try {
    const params = {
      dimension: filterForm.value.dimension,
      startDate: filterForm.value.startDate,
      endDate: filterForm.value.endDate,
      sortBy: rankSortBy.value
    }
    const res = await dashboardApi.getTaskRanking(params)
    rankingData.value = res.data
  } catch (error) {
    console.error('Fetch ranking error:', error)
  }
}

// 获取所有数据
const fetchData = async () => {
  await fetchStatistics()
  await fetchTaskOnTimeRate()
  await fetchRanking()
}

// 窗口大小改变时重新调整图表
const handleResize = () => {
  statusChart?.resize()
  taskOnTimeRateChart?.resize()
  pushSuccessChart?.resize()
}

onMounted(() => {
  fetchData()
  setTimeout(() => {
    initCharts()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  statusChart?.dispose()
  taskOnTimeRateChart?.dispose()
  pushSuccessChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>.dashboard {
  .filter-card {
    margin-bottom: 20px;

    .filter-form {
      .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
  }

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      height: 100%;

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
          flex-shrink: 0;
        }

        .stat-info {
          flex: 1;
          min-width: 0;

          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: @text-color-primary;
            margin-bottom: 5px;
          }

          .stat-label {
            font-size: 14px;
            color: @text-color-secondary;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .ranking-table-container {
    height: 300px;
    overflow: hidden;
  }
}
</style>

