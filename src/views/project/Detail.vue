<template>
  <div class="project-detail" v-loading="loading">
    <el-card>
      <template #header>
        <div class="card-header">
          <el-button @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span>项目详情</span>
          <el-button type="primary" @click="handleEdit">
            编辑项目
          </el-button>
        </div>
      </template>

      <div v-if="project" class="detail-content">
        <!-- 基本信息 -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="项目名称">
            {{ project.name }}
          </el-descriptions-item>
          <el-descriptions-item label="合作客户">
            {{ project.customer }}
          </el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="PROJECT_STATUS_MAP[project.status]?.type">
              {{ PROJECT_STATUS_MAP[project.status]?.label }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目进度">
            <el-progress :percentage="project.progress || 0" />
          </el-descriptions-item>
          <el-descriptions-item label="开始日期">
            {{ formatDateOnly(project.startDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="交付日期">
            {{ formatDateOnly(project.deadline) }}
          </el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">
            {{ project.description }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 状态流转操作 -->
        <div class="status-actions" v-if="canOperate">
          <el-divider>状态操作</el-divider>
          <el-space>
            <el-button
              v-if="project.status === 'REQUIREMENT_INITIATED'"
              type="warning"
              @click="handleStatusChange('DEVELOPMENT')"
            >
              开始开发
            </el-button>
            <el-button
              v-if="project.status === 'DEVELOPMENT'"
              type="primary"
              @click="handleStatusChange('DEPLOYMENT')"
            >
              进入部署
            </el-button>
            <el-button
              v-if="project.status === 'DEPLOYMENT'"
              type="success"
              @click="handleStatusChange('DELIVERED')"
            >
              完成交付
            </el-button>
            <el-button
              v-if="['DEVELOPMENT', 'DEPLOYMENT'].includes(project.status)"
              type="danger"
              @click="handleReturn"
            >
              退回项目
            </el-button>
          </el-space>
        </div>

        <!-- 节点信息 -->
        <el-divider>项目节点</el-divider>
        <el-table
          :data="nodes"
          border
          stripe
          style="width: 100%"
          v-if="nodes && nodes.length"
        >
          <el-table-column prop="nodeOrder" label="顺序" width="80" />
          <el-table-column prop="nodeName" label="节点名称" min-width="150" />
          <el-table-column prop="ownerName" label="负责人" width="140" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag
                :type="
                  row.status === 'completed'
                    ? 'success'
                    : row.status === 'in_progress'
                    ? 'warning'
                    : row.status === 'expired'
                    ? 'danger'
                    : 'info'
                "
              >
                {{ nodeStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.endTime) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-tip">暂无节点信息</div>

        <!-- 任务列表 -->
        <el-divider>相关任务</el-divider>
        <el-table
          :data="tasks"
          border
          stripe
          style="width: 100%"
          v-if="tasks && tasks.length"
        >
          <el-table-column prop="nodeName" label="节点" min-width="150" />
          <el-table-column prop="taskTitle" label="任务标题" min-width="180" />
          <el-table-column prop="assigneeName" label="负责人" width="140" />
          <el-table-column prop="deadline" label="截止时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.deadline) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="140">
            <template #default="{ row }">
              <el-tag :type="row.timeoutFlag === 1 ? 'danger' : 'success'">
                {{ taskStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
        <div v-else class="empty-tip">暂无任务记录</div>

        <!-- 操作日志 -->
        <el-divider>操作日志</el-divider>
        <el-timeline v-if="logs && logs.length">
          <el-timeline-item
            v-for="log in logs"
            :key="log.logId"
            :timestamp="formatDate(log.operationTime)"
          >
            <p>
              <strong>{{ log.operatorName }}</strong>
              {{ operationTypeText(log.operationType) }}
            </p>
            <p>{{ log.operationContent }}</p>
            <p v-if="log.remark" class="remark">备注：{{ log.remark }}</p>
          </el-timeline-item>
        </el-timeline>
        <div v-else class="empty-tip">暂无操作日志</div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { PROJECT_STATUS, PROJECT_STATUS_MAP } from '@/config/constants'
import { formatDateOnly, formatDate } from '@/utils/date'
import { hasPermission } from '@/utils/permission'
import { PERMISSIONS } from '@/config/constants'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const loading = ref(false)
const project = ref(null)
const nodes = ref([])
const tasks = ref([])
const logs = ref([])

const canOperate = computed(() => {
  return hasPermission(PERMISSIONS.PROJECT_EDIT)
})

// 获取项目完整详情（含节点、任务、日志等）
const fetchProjectDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    await projectStore.fetchProjectFullDetail(id)
    const detail = projectStore.currentProjectFullDetail
    if (detail) {
      project.value = detail.project
      nodes.value = detail.nodes || []
      tasks.value = detail.tasks || []
      logs.value = detail.logs || []
    }
  } catch (error) {
    console.error('Fetch project detail error:', error)
  } finally {
    loading.value = false
  }
}

// 状态变更
const handleStatusChange = async (status) => {
  try {
    await projectStore.updateProjectStatus(project.value.id, status)
    ElMessage.success('状态更新成功')
    fetchProjectDetail()
  } catch (error) {
    console.error('Update status error:', error)
  }
}

// 退回项目
const handleReturn = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入退回原因', '退回项目', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入退回原因'
    })

    await projectStore.returnProject(project.value.id, value)
    ElMessage.success('项目已退回')
    fetchProjectDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Return project error:', error)
    }
  }
}

const handleEdit = () => {
  router.push(`/project/list?edit=${project.value.id}`)
}

// 节点状态文案
const nodeStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待开始'
    case 'in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
    case 'expired':
      return '已超期'
    default:
      return status || '-'
  }
}

// 任务状态文案
const taskStatusText = (status) => {
  if (!status) return '-'
  // 后端枚举TaskStatusEnum，直接展示枚举名或做简单映射
  const map = {
    TODO: '待处理',
    IN_PROGRESS: '进行中',
    DONE: '已完成',
    RETURNED: '已退回',
    EXPIRED: '已超期'
  }
  return map[status] || status
}

// 操作类型文案
const operationTypeText = (type) => {
  const map = {
    CREATE: '创建了项目',
    UPDATE: '更新了项目',
    DELETE: '删除了项目',
    STATUS_CHANGE: '变更了项目状态',
    RETURN: '退回了项目'
  }
  return map[type] || ''
}

onMounted(() => {
  fetchProjectDetail()
})
</script>

<style lang="less" scoped>
.project-detail {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .detail-content {
    .status-actions {
      margin-top: 20px;
    }
  }
}
</style>

