<template>
  <div class="push-logs">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>推送日志</span>
          <div>
            <el-button
                v-if="canOperate"
                type="danger"
                :disabled="selectedLogIds.length === 0"
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
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                style="width: 150px"
            >
              <el-option label="成功" value="SUCCESS" />
              <el-option label="失败" value="FAILED" />
              <el-option label="待推送" value="PENDING" />
              <el-option label="已撤销" value="CANCELLED" />
            </el-select>
          </el-form-item>
          <el-form-item label="推送时间">
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

      <!-- 日志表格 -->
      <el-table
          v-loading="loading"
          :data="logList"
          stripe
          border          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="序号" width="60" align="center">
          <template #default="{ $index }">
            {{ ($index + 1) + (pagination.page - 1) * pagination.size }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="150" />
        <el-table-column prop="pushType" label="推送方式" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.pushType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="protocol" label="推送协议" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.protocol }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="推送状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetUnit" label="目标单位" min-width="120" />
        <el-table-column prop="pushTime" label="推送时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.pushTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="pushMessage" label="推送消息" min-width="200" show-overflow-tooltip >
          <template #default="{ row }">
            <span v-if="row.pushMessage" style="color: green;">
              {{ row.pushMessage }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.errorMessage" style="color: #f56c6c;">
              {{ row.errorMessage }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
                v-if="canOperate"
                type="danger"
                size="small"
                @click="handleDelete(row.id)"
            >
              <el-icon><Delete /></el-icon>
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
  </div>
</template>


<script setup>import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Delete } from '@element-plus/icons-vue'
import { usePushStore } from '@/stores/modules/push'
import { useUserStore } from '@/stores/modules/user'
import { useProjectStore } from '@/stores/modules/project'
import {PERMISSIONS, PUSH_STATUS} from '@/config/constants'
import { formatDate } from '@/utils/date'
import {hasPermission} from "@/utils/permission.js";

const pushStore = usePushStore()
const userStore = useUserStore()
const projectStore = useProjectStore()

const loading = ref(false)
const logList = ref([])
const projectList = ref([])
const selectedLogIds = ref([])


const searchForm = reactive({
  projectId: null,
  projectName: '',
  status: '',
  dateRange: []
})

// 判断是否为管理员（level === 4）
const isAdmin = computed(() => {
  return userStore.userInfo?.level === 4
})
const canOperate = computed(() => {
  return hasPermission(PERMISSIONS.PUSH_CONFIG)
})
const handleSelectionChange = (selection) => {
  selectedLogIds.value = selection.map(item => item.id)
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

// 获取推送日志
const fetchLogList = async () => {
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

    const res = await pushStore.fetchPushLogList(params)
    if (res.data) {
      logList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch push logs error:', error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const typeMap = {
    [PUSH_STATUS.SUCCESS]: 'success',
    [PUSH_STATUS.FAILED]: 'danger',
    [PUSH_STATUS.PENDING]: 'warning',
    [PUSH_STATUS.CANCELLED]: 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status) => {
  const labelMap = {
    [PUSH_STATUS.SUCCESS]: '成功',
    [PUSH_STATUS.FAILED]: '失败',
    [PUSH_STATUS.PENDING]: '待推送',
    [PUSH_STATUS.CANCELLED]: '已撤销'
  }
  return labelMap[status] || status
}

const handleSearch = () => {
  pagination.page = 1
  fetchLogList()
}

const handleReset = () => {
  searchForm.projectId = null
  searchForm.projectName = ''
  searchForm.status = ''
  searchForm.dateRange = []
  handleSearch()
}

const handleRefresh = () => {
  fetchLogList()
}

const handleCancel = async (logId) => {
  try {
    await ElMessageBox.confirm('确定要撤销该推送吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await pushStore.cancelPush(logId)
    ElMessage.success('撤销成功')
    fetchLogList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Cancel push error:', error)
    }
  }
}

const handleDelete = async (logId) => {
  try {
    await ElMessageBox.confirm('确定要删除该条推送日志吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await pushStore.deletePushLog(logId)
    ElMessage.success('删除成功')
    fetchLogList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete push log error:', error)
    }
  }
}

const handleBatchDelete = async () => {
  if (selectedLogIds.value.length === 0) {
    ElMessage.warning('请选择要删除的日志')
    return
  }

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedLogIds.value.length} 条推送日志吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await pushStore.batchDeletePushLog(selectedLogIds.value)
    ElMessage.success('批量删除成功')
    selectedLogIds.value = []
    fetchLogList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Batch delete push logs error:', error)
    }
  }
}

const handleSizeChange = () => {
  fetchLogList()
}

const handlePageChange = () => {
  fetchLogList()
}

onMounted(() => {
  fetchProjectList()
  fetchLogList()
})
</script>

<style lang="less" scoped>.push-logs {
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
