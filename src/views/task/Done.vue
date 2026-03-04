<!-- src/views/task/Done.vue -->
<template>
    <div class="task-done">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>我的已办任务</span>
          </div>
        </template>
  
        <div class="search-bar">
          <el-form :inline="true" :model="searchForm">
            <el-form-item label="项目名称">
              <el-input
                v-model="searchForm.projectName"
                placeholder="请输入项目名称"
                clearable
              />
            </el-form-item>
            <el-form-item label="完成状态">
              <el-select
                v-model="searchForm.finishType"
                placeholder="请选择"
                clearable
              >
                <el-option label="正常完成" value="normal" />
                <el-option label="超时完成" value="timeout" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
  
        <el-table
          v-loading="loading"
          :data="tableData"
          stripe
          border
          style="width: 100%"
        >
          <el-table-column prop="projectName" label="项目名称" min-width="160" />
          <el-table-column prop="nodeName" label="节点名称" min-width="140" />
          <el-table-column prop="taskTitle" label="任务标题" min-width="180" />
          <el-table-column prop="completeTime" label="完成时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.completeTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="任务状态" width="140">
            <template #default="{ row }">
              <el-tag :type="row.timeoutFlag === 1 ? 'danger' : 'success'">
                {{ row.timeoutFlag === 1 ? '超时完成' : '正常完成' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
  
        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :total="pagination.total"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="fetchList"
            @size-change="fetchList"
          />
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, computed, onMounted } from 'vue'
  import { useUserStore } from '@/stores/modules/user'
  import { useTaskStore } from '@/stores/modules/task'
  import { formatDate } from '@/utils/date'
  
  const userStore = useUserStore()
  const taskStore = useTaskStore()
  
  const loading = ref(false)
  const searchForm = reactive({
    projectName: '',
    finishType: '' // normal / timeout
  })
  const pagination = reactive({
    page: 1,
    size: 10,
    total: 0
  })
  
  const tableData = computed(() => {
    return taskStore.list.filter(item => {
      const pOk = !searchForm.projectName || (item.projectName || '').includes(searchForm.projectName)
      const tOk =
        !searchForm.finishType ||
        (searchForm.finishType === 'normal' && item.timeoutFlag === 0) ||
        (searchForm.finishType === 'timeout' && item.timeoutFlag === 1)
      return pOk && tOk
    })
  })
  
  const fetchList = async () => {
    loading.value = true
    try {
      await taskStore.fetchTaskList({
        pageNum: pagination.page,
        pageSize: pagination.size,
        assigneeId: userStore.userInfo?.id,
        status: 'completed'
      })
      pagination.total = taskStore.total
    } finally {
      loading.value = false
    }
  }
  
  const handleSearch = () => {
    pagination.page = 1
    fetchList()
  }
  
  const handleReset = () => {
    searchForm.projectName = ''
    searchForm.finishType = ''
    handleSearch()
  }
  
  onMounted(fetchList)
  </script>
  
  <style lang="less" scoped>
  .task-done {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .search-bar {
      margin-bottom: 16px;
    }
    .pagination {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
  </style>