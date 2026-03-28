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
              value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="维度" style="width: 150px">
          <el-select v-model="filterForm.dimension" @change="loadData">
            <el-option label="按人员" value="user" />
            <el-option label="按部门" value="dept" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">查询</el-button>
          <el-button v-if="canExport" @click="handleExport">导出</el-button>
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
        <el-table-column prop="totalTasks" label="总任务数" width="120" />
        <el-table-column prop="onTimeTasks" label="按时完成数" width="140" />
        <el-table-column prop="onTimeRate" label="按时完成率" width="140">
          <template #default="{ row }">
            {{ row.onTimeRate }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { taskApi } from '@/api/modules/task'
import {PERMISSIONS} from "@/config/constants.js";
import {hasPermission} from "@/utils/permission.js";

const filterForm = reactive({
  dateRange: [],
  dimension: 'user'
})

const barRef = ref(null)
let barChart = null
const lineRef = ref(null)
let lineChart = null

const tableData = ref([])
const loading = ref(false)

const dimensionLabel = computed(() => {
  switch (filterForm.dimension) {
    case 'user': return '人员'
    case 'dept': return '部门'
    default: return '维度'
  }
})

const canExport = computed(() => {
  return hasPermission(PERMISSIONS.DATA_EXPORT)
})

const initCharts = () => {
  if (barRef.value) barChart = echarts.init(barRef.value)
  if (lineRef.value) lineChart = echarts.init(lineRef.value)
  updateCharts()
}

const updateCharts = () => {
  const names = tableData.value.map(i => i.name)
  const rates = tableData.value.map(i => i.onTimeRate)

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

const loadData = async () => {
  loading.value = true
  try {
    const [startDate, endDate] = filterForm.dateRange || []
    const res = await taskApi.getTaskStatisticsByDimension({
      dimension: filterForm.dimension,
      startDate,
      endDate
    })

    if (res.data) {
      tableData.value = res.data
      updateCharts()
    }
  } catch (error) {
    console.error('Load statistics error:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

const handleExport = () => {
  import('xlsx').then(({ utils, writeFile }) => {
    // 准备数据
    const data = [
      ['名称', '总任务数', '按时完成数', '按时完成率'],
      ...tableData.value.map(i => [i.name, i.totalTasks, i.onTimeTasks, `${i.onTimeRate}%`])
    ]

    // 创建工作表
    const ws = utils.aoa_to_sheet(data)

    // 设置列宽
    ws['!cols'] = [
      { wch: 20 }, // 名称列宽
      { wch: 15 }, // 总任务数列宽
      { wch: 15 }, // 按时完成数列宽
      { wch: 15 }  // 按时完成率列宽
    ]

    // 创建工作簿
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, '任务统计')

    // 导出文件
    writeFile(wb, `任务按时完成率统计_${filterForm.dimension}.xlsx`)
    ElMessage.success('导出成功')
  }).catch(() => {
    ElMessage.error('导出失败')
  })
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
