<template>
  <div class="push-data">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>推送数据</span>
          <div>
            <el-button
                v-if="canOperate"
                type="danger"
                :disabled="selectedDataIds.length === 0"
                @click="handleBatchDelete"
            >
              <el-icon><Delete /></el-icon>
              批量删除
            </el-button>
            <el-button type="primary" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="选择项目">
            <el-select
                v-model="searchForm.projectId"
                placeholder="请选择项目"
                filterable
                clearable
                style="width: 200px"
            >
              <el-option
                  v-for="project in projectList"
                  :key="project.id"
                  :label="project.name"
                  :value="project.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选择项目经理">
            <el-select
                v-model="searchForm.pmId"
                placeholder="请选择项目经理"
                filterable
                clearable
                style="width: 200px"
            >
              <el-option
                  v-for="pm in pmList"
                  :key="pm.id"
                  :label="pm.realName"
                  :value="pm.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="项目名称">
            <el-input
                v-model="searchForm.projectName"
                placeholder="请输入项目名称"
                clearable
                style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="推送状态">
            <el-select
                v-model="searchForm.pushStatus"
                placeholder="请选择状态"
                clearable
                style="width: 150px"
            >
              <el-option label="待推送" value="PENDING" />
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILED" />
            </el-select>
          </el-form-item>
          <el-form-item label="对接单位">
            <el-input
                v-model="searchForm.targetUnit"
                placeholder="请输入对接单位名称"
                clearable
                style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 数据表格 -->
      <el-table
          v-loading="loading"
          :data="dataList"
          stripe
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ ($index + 1) + (pagination.page - 1) * pagination.size }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="150" align="center" />
        <el-table-column prop="pmName" label="项目经理" min-width="120" align="center" />
        <el-table-column prop="targetUnit" label="对接单位" min-width="150" align="center" />
        <el-table-column prop="pushStatus" label="推送状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.pushStatus)">
              {{ getStatusLabel(row.pushStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retryCount" label="重试次数" width="80" align="center" />
        <el-table-column prop="pushTime" label="推送时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.pushTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="200" align="center" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.errorMessage" style="color: #f56c6c;">
              {{ row.errorMessage }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
                type="primary"
                size="small"
                @click="handleViewDetail(row)"
            >
              <el-icon class="el-icon--left"><View /></el-icon>
              详情
            </el-button>
            <el-button
                v-if="canOperate"
                type="danger"
                size="small"
                @click="handleDelete(row.id)"
            >
              <el-icon class="el-icon--left"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
        v-model="detailVisible"
        title="数据详情"
        width="60%"
    >
      <el-descriptions :column="2" border v-if="currentData">
        <el-descriptions-item label="推送数据 ID">{{ currentData.id }}</el-descriptions-item>
        <el-descriptions-item label="项目 ID">{{ currentData.projectId }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ currentData.projectName }}</el-descriptions-item>
        <el-descriptions-item label="项目经理">{{ currentData.pmID }}</el-descriptions-item>
        <el-descriptions-item label="对接单位">{{ currentData.targetUnit }}</el-descriptions-item>
        <el-descriptions-item label="配置 ID">{{ currentData.configId }}</el-descriptions-item>
        <el-descriptions-item label="推送状态">
          <el-tag :type="getStatusType(currentData.pushStatus)">
            {{ getStatusLabel(currentData.pushStatus) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="推送时间">{{ formatDate(currentData.pushTime) }}</el-descriptions-item>
        <el-descriptions-item label="重试次数">{{ currentData.retryCount }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentData.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="数据内容" :span="2">
          <pre style="max-height: 300px; overflow: auto; background: #f5f7fa; padding: 10px; border-radius: 4px;">{{ formatJson(currentData.dataContent) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="currentData.errorMessage">
          <span style="color: #f56c6c;">{{ currentData.errorMessage }}</span>
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete, View } from '@element-plus/icons-vue'
import { usePushStore } from '@/stores/modules/push'
import { useUserStore } from '@/stores/modules/user'
import { useProjectStore } from '@/stores/modules/project'
import { PERMISSIONS } from '@/config/constants'
import { formatDate } from '@/utils/date'
import { hasPermission } from '@/utils/permission.js'

const pushStore = usePushStore()
const userStore = useUserStore()
const projectStore = useProjectStore()

const loading = ref(false)
const dataList = ref([])
const projectList = ref([])
const pmList = ref([])
const selectedDataIds = ref([])
const detailVisible = ref(false)
const currentData = ref(null)

const searchForm = reactive({
  projectId: null,
  projectName: '',
  pushStatus: '',
  dataType: '',
  targetUnit: '',
  pmId: null,
  dateRange: []
})

const canOperate = computed(() => {
  return hasPermission(PERMISSIONS.PUSH_CONFIG)
})

const handleSelectionChange = (selection) => {
  selectedDataIds.value = selection.map(item => item.id)
}

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取项目列表
const fetchProjectList = async () => {
  try {
    const res = await projectStore.fetchProjectList({
      pageNum: 1,
      pageSize: 100
    })
    projectList.value = res.data?.list || []
  } catch (error) {
    console.error('Fetch project list error:', error)
  }
}

//获取所有项目经理列表
const fetchPmList = async () => {
  try {
    const res = await userStore.fetchPmList()
    pmList.value = res.data || []
  } catch (error) {
    console.error('Fetch pm list error:', error)
  }
}

// 获取推送数据列表
const fetchDataList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      page: pagination.page,
      size: pagination.size
    }
    delete params.dateRange

    const res = await pushStore.fetchPushDataList(params)
    if (res.data) {
      dataList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch push data error:', error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const typeMap = {
    'SUCCESS': 'success',
    'FAILED': 'danger',
    'PENDING': 'warning'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status) => {
  const labelMap = {
    'SUCCESS': '成功',
    'FAILED': '失败',
    'PENDING': '待推送'
  }
  return labelMap[status] || status
}

const getDataTypeLabel = (type) => {
  const labelMap = {
    'PROJECT': '项目数据',
    'TASK': '任务数据',
    'STATISTICS': '统计数据'
  }
  return labelMap[type] || type
}

const handleSearch = () => {
  pagination.page = 1
  fetchDataList()
}

const handleReset = () => {
  searchForm.projectId = null
  searchForm.projectName = ''
  searchForm.pushStatus = ''
  searchForm.dataType = ''
  searchForm.dateRange = []
  searchForm.pmID = null
  searchForm.targetUnit = ''
  handleSearch()
}

const handleRefresh = () => {
  fetchDataList()
}

const handleViewDetail = (row) => {
  currentData.value = row
  detailVisible.value = true
}

const formatJson = (jsonStr) => {
  try {
    if (!jsonStr) return ''
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}

const handleDelete = async (dataId) => {
  try {
    await ElMessageBox.confirm('确定要删除该条推送数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await pushStore.deletePushData(dataId)
    ElMessage.success('删除成功')
    fetchDataList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete push data error:', error)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedDataIds.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedDataIds.value.length} 条推送数据吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await pushStore.batchDeletePushData(selectedDataIds.value)
    ElMessage.success('批量删除成功')
    selectedDataIds.value = []
    fetchDataList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete push data error:', error)
    }
  }
}

const handleSizeChange = () => {
  fetchDataList()
}

const handlePageChange = () => {
  fetchDataList()
}

onMounted(() => {
  fetchProjectList()
  fetchDataList()
  fetchPmList()
})
</script>

<style lang="less" scoped>
.push-data {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > div {
      display: flex;
      gap: 10px;
    }
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
