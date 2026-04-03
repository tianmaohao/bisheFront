<template>
  <div class="user-detail" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span>人员详情</span>
        </div>
      </template>

      <el-form :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" disabled />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
              v-model="form.department"
              placeholder="请选择角色"
              filterable              style="width: 100%"
          >
            <el-option
                v-for="dept in deptList"
                :key="dept.deptId"
                :label="dept.deptName"
                :value="dept.deptName"
            >
              <span style="float: left">{{ dept.deptName }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select
              v-model="form.roleId"
              placeholder="请选择角色"
              filterable              style="width: 100%"
          >
            <el-option
                v-for="role in roleList"
                :key="role.roleId"
                :label="role.roleName"
                :value="role.roleId"
            >
              <span style="float: left">{{ role.roleName }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ role.roleCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch
              v-model="form.status"
              :active-value="1"
              :inactive-value="0"
          />
        </el-form-item>
      </el-form>

      <el-divider>任务统计</el-divider>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="总任务数">
          {{ taskStats.totalTasks }}
        </el-descriptions-item>
        <el-descriptions-item label="按时完成">
          {{ taskStats.onTimeTasks }}
        </el-descriptions-item>
        <el-descriptions-item label="按时完成率">
          {{ taskStats.onTimeRate }}%
        </el-descriptions-item>
      </el-descriptions>

      <el-divider>任务列表</el-divider>
      <el-table :data="taskList" style="width: 100%" v-loading="taskLoading">
        <el-table-column prop="projectName" label="项目名称" />
        <el-table-column prop="taskTitle" label="任务标题" />
        <el-table-column prop="deadline" label="截止时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="fetchTaskList"
            @current-change="fetchTaskList"
        />
      </div>

      <div class="actions">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'
import { deptApi } from '@/api/modules/dept'
import { taskApi } from '@/api/modules/task'
import request from '@/api/index'
import { formatDate } from '@/utils/date'

const route = useRoute()
const loading = ref(false)
const taskLoading = ref(false)
const form = reactive({
  id: null,
  username: '',
  realName: '',
  department: '',
  roleId: null,
  level: 1,
  status: null
})
const roleList = ref([])
const deptList = ref([])
const taskStats = reactive({
  totalTasks: 0,
  onTimeTasks: 0,
  onTimeRate: 0
})
const taskList = ref([])
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const fetchDeptList = async () => {
  try {
    const res = await deptApi.getAllDepts()
    if (res.data) {
      deptList.value = res.data
    }
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

const fetchRoleList = async () => {
  try {
    const res = await request({
      url: '/api/role/list',
      method: 'get'
    })
    if (res.data) {
      roleList.value = res.data
      console.log('角色列表:', res.data)
    }
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

const fetchTaskStats = async () => {
  try {
    const res = await taskApi.getUserTaskStatistics(route.params.id)
    if (res.data) {
      taskStats.totalTasks = res.data.totalTasks || 0
      taskStats.onTimeTasks = res.data.onTimeTasks || 0
      taskStats.onTimeRate = res.data.onTimeRate || 0
    }
  } catch (error) {
    console.error('获取任务统计失败:', error)
  }
}

const fetchTaskList = async () => {
  taskLoading.value = true
  try {
    const res = await taskApi.getTasksByUserId(route.params.id, {
      page: pagination.page,
      size: pagination.size,
      assigneeId: route.params.id
    })
    if (res.data) {
      taskList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
  } finally {
    taskLoading.value = false
  }
}

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserById(route.params.id)
    if (res.data) {
      console.log('用户详情响应数据:', res.data)
      console.log('roleId 字段值:', res.data.roleId)
      console.log('roles 字段值:', res.data.roles)

      form.id = res.data.id || null
      form.username = res.data.username || ''
      form.realName = res.data.realName || ''
      form.department = res.data.department || ''
      form.level = res.data.level || 1
      form.status = res.data.status

      if (res.data.roleId !== undefined && res.data.roleId !== null) {
        form.roleId = res.data.roleId
        console.log('设置 roleId 为:', form.roleId)
      } else {
        form.roleId = null
        console.warn('未找到 roleId 字段')
      }
    }
    await fetchTaskStats()
    await fetchTaskList()
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  await userApi.addOrUpdateUser(form)
  ElMessage.success('保存成功')
}

const getStatusType = (status) => {
  const statusMap = {
    'pending': 'warning',
    'in_progress': 'primary',
    'completed': 'success',
    'rejected': 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待处理',
    'in_progress': '进行中',
    'completed': '已完成',
    'rejected': '已驳回'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchDetail()
  fetchDeptList()
  fetchRoleList()
})
</script>

<style lang="less" scoped>
.user-detail {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  .actions {
    margin-top: 20px;
    text-align: right;
  }
}
</style>
