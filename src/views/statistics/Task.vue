<!-- src/views/statistics/Task.vue -->
<template>
  <div class="task-statistics">
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="loadData"
          />
        </el-form-item>
        <el-form-item label="维度" style="width: 150px">
          <el-select v-model="filterForm.dimension" @change="loadData">
            <el-option label="按人员" value="user" />
            <el-option label="按部门" value="dept" />
            <el-option label="按项目类型" value="projectType" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>任务按时完成率（柱状图）</span>
          </template>
          <div ref="barRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <span>任务按时完成率（折线图）</span>
          </template>
          <div ref="lineRef" style="height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <template #header>
        <span>明细数据</span>
      </template>
      <el-table :data="tableData" border stripe style="width: 100%">
        <el-table-column prop="name" :label="dimensionLabel" min-width="160" />
        <el-table-column prop="total" label="总任务数" width="120" />
        <el-table-column prop="onTime" label="按时完成数" width="140" />
        <el-table-column prop="rate" label="按时完成率" width="140">
          <template #default="{ row }">
            {{ row.rate }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const filterForm = reactive({
  dateRange: [],
  dimension: 'user'
})

const barRef = ref(null)
let barChart = null
const lineRef = ref(null)
let lineChart = null

const tableData = ref([])

const dimensionLabel = computed(() => {
  switch (filterForm.dimension) {
    case 'user': return '人员'
    case 'dept': return '部门'
    case 'projectType': return '项目类型'
    default: return '维度'
  }
})

const initCharts = () => {
  if (barRef.value) barChart = echarts.init(barRef.value)
  if (lineRef.value) lineChart = echarts.init(lineRef.value)
  updateCharts()
}

const updateCharts = () => {
  const names = tableData.value.map(i => i.name)
  const rates = tableData.value.map(i => i.rate)

  if (barChart) {
    barChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
      series: [
        {
          name: '按时完成率',
          data: rates,
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

  if (lineChart) {
    lineChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: names },
      yAxis: {
        type: 'value',
        max: 100,
        axisLabel: { formatter: '{value}%' }
      },
      series: [
        {
          name: '按时完成率',
          data: rates,
          type: 'line',
          smooth: true,
          itemStyle: { color: '#67C23A' },
          areaStyle: { color: 'rgba(103, 194, 58, 0.2)' }
        }
      ]
    })
  }
}

const mockData = () => {
  if (filterForm.dimension === 'user') {
    tableData.value = [
      { name: '张三', total: 20, onTime: 18, rate: 90 },
      { name: '李四', total: 15, onTime: 14, rate: 93.3 },
      { name: '王五', total: 12, onTime: 9, rate: 75 },
      { name: '赵六', total: 10, onTime: 10, rate: 100 }
    ]
  } else if (filterForm.dimension === 'dept') {
    tableData.value = [
      { name: '实施部', total: 30, onTime: 26, rate: 86.7 },
      { name: '开发部', total: 40, onTime: 35, rate: 87.5 },
      { name: '运维部', total: 18, onTime: 15, rate: 83.3 }
    ]
  } else {
    tableData.value = [
      { name: 'Web项目', total: 25, onTime: 23, rate: 92 },
      { name: '移动App', total: 15, onTime: 12, rate: 80 },
      { name: '内部系统', total: 20, onTime: 18, rate: 90 }
    ]
  }
}

const loadData = async () => {
  // TODO: 调用后端统计接口，按 filterForm.dimension 返回数据
  // 暂时使用 mock 数据
  mockData()
  updateCharts()
}

const handleExport = () => {
  // 简单导出为 CSV 字符串；实际可以集成文件下载
  const header = ['名称', '总任务数', '按时完成数', '按时完成率']
  const rows = tableData.value.map(i => [i.name, i.total, i.onTime, `${i.rate}%`])
  const csv = [header, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '任务按时完成率统计.csv'
  link.click()
  URL.revokeObjectURL(url)
}

const handleResize = () => {
  barChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  setTimeout(() => {
    initCharts()
    loadData()
  }, 100)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  barChart?.dispose()
  lineChart?.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="less" scoped>
.task-statistics {
  .filter-card {
    margin-bottom: 20px;
  }
}
</style>