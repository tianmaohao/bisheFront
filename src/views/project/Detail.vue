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
        <div class="node-actions">
          <el-button type="primary" @click="showAddNodeDialog">
            添加节点
          </el-button>
        </div>
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
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button
                  type="primary"
                  link
                  @click="showEditNodeDialog(row)"
              >
                编辑
              </el-button>
              <el-button
                  type="danger"
                  link
                  @click="deleteNode(row)"
              >
                删除
              </el-button>
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

    <!-- 添加/编辑节点对话框 -->
    <el-dialog
        v-model="nodeDialogVisible"
        :title="editingNode ? '编辑节点' : '添加节点'"
        width="600px"
    >
      <el-form
          ref="nodeFormRef"
          :model="nodeForm"
          :rules="nodeRules"
          label-width="100px"
      >
        <el-form-item label="节点名称" prop="nodeName">
          <el-input v-model="nodeForm.nodeName" placeholder="请输入节点名称" />
        </el-form-item>
        <el-form-item label="节点顺序" prop="nodeOrder">
          <el-input-number
              v-model="nodeForm.nodeOrder"
              :min="1"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="负责人" prop="ownerId">
          <el-select
              v-model="nodeForm.ownerId"
              placeholder="请选择负责人"
              filterable
              remote
              :remote-method="remoteSearchUser"
              :loading="userSearchLoading"
              clearable            style="width: 100%"
          >
            <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.realName} (${user.username})`"
                :value="Number(user.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="父节点" prop="parentId">
          <el-select
              v-model="nodeForm.parentId"
              placeholder="请选择父节点（可选）"
              clearable
              style="width: 100%"
          >
            <el-option
                v-for="node in availableParentNodes"
                :key="node.nodeId"
                :label="node.nodeName"
                :value="node.nodeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
              v-model="nodeForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
              v-model="nodeForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nodeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="nodeLoading" @click="submitNodeForm">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import { PROJECT_STATUS, PROJECT_STATUS_MAP } from '@/config/constants'
import { formatDateOnly, formatDate } from '@/utils/date'
import { hasPermission } from '@/utils/permission'
import { PERMISSIONS } from '@/config/constants'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const userStore = useUserStore()

const loading = ref(false)
const project = ref(null)
const nodes = ref([])
const tasks = ref([])
const logs = ref([])

// 节点相关
const nodeDialogVisible = ref(false)
const nodeLoading = ref(false)
const nodeFormRef = ref(null)
const editingNode = ref(null)
const userList = ref([])
const userSearchLoading = ref(false)

const nodeForm = ref({
  nodeName: '',
  nodeOrder: 1,
  ownerId: null,
  parentId: null,
  startTime: '',
  endTime: ''
})

const nodeRules = {
  nodeName: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
  nodeOrder: [{ required: true, message: '请输入节点顺序', trigger: 'blur' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const availableParentNodes = computed(() => {
  // 排除当前正在编辑的节点
  return nodes.value.filter(node =>
      !editingNode.value || node.nodeId !== editingNode.value.nodeId
  )
})

const canOperate = computed(() => {
  return hasPermission(PERMISSIONS.PROJECT_EDIT)
})

// 远程搜索用户
const remoteSearchUser = async (queryString) => {
  userSearchLoading.value = true
  try {
    const res = await userStore.fetchUserList({
      pageNum: 1,
      pageSize: 20,
      username: queryString || '',
      realName: queryString || ''
    })
    userList.value = res.data?.list || []
    console.log('User list:', userList.value) // 调试日志
  } catch (error) {
    console.error('Search user error:', error)
  } finally {
    userSearchLoading.value = false
  }
}

// 显示添加节点对话框
const showAddNodeDialog = () => {
  editingNode.value = null
  nodeForm.value = {
    nodeName: '',
    nodeOrder: nodes.value.length + 1,
    ownerId: undefined, // 改为 undefined
    parentId: undefined,
    startTime: '',
    endTime: ''
  }
  // 加载所有用户
  remoteSearchUser('')
  nodeDialogVisible.value = true
}

// 显示编辑节点对话框
const showEditNodeDialog = (node) => {
  editingNode.value = node
  nodeForm.value = {
    nodeName: node.nodeName,
    nodeOrder: node.nodeOrder,
    ownerId: node.ownerId,
    parentId: node.parentId,
    startTime: node.startTime,
    endTime: node.endTime
  }
  // 加载所有用户
  remoteSearchUser('')
  nodeDialogVisible.value = true
}



// 获取用户列表
const fetchUserList = async () => {
  try {
    const res = await userStore.fetchUserList({ pageNum: 1, pageSize: 100 })
    userList.value = res.data?.list || []
  } catch (error) {
    console.error('Fetch user list error:', error)
  }
}

// 提交节点表单
const submitNodeForm = async () => {
  if (!nodeFormRef.value) return

  await nodeFormRef.value.validate(async (valid) => {
    if (valid) {
      nodeLoading.value = true
      try {
        // 格式化日期时间为 yyyy-MM-dd HH:mm:ss 格式，避免时区问题
        const formatDateTime = (date) => {
          if (!date) return ''
          const d = new Date(date)
          const year = d.getFullYear()
          const month = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const hours = String(d.getHours()).padStart(2, '0')
          const minutes = String(d.getMinutes()).padStart(2, '0')
          const seconds = String(d.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
        }

        const nodeData = {
          ...nodeForm.value,
          projectId: project.value.id,
          startTime: nodeForm.value.startTime ? formatDateTime(nodeForm.value.startTime) : '',
          endTime: nodeForm.value.endTime ? formatDateTime(nodeForm.value.endTime) : ''
        }

        if (editingNode.value) {
          await projectStore.updateProjectNode(editingNode.value.nodeId, nodeData)
          ElMessage.success('更新成功')
        } else {
          await projectStore.createProjectNode(nodeData)
          ElMessage.success('添加成功')
        }

        nodeDialogVisible.value = false
        fetchProjectDetail()
      } catch (error) {
        console.error('Submit node error:', error)
      } finally {
        nodeLoading.value = false
      }
    }
  })
}

// 删除节点
const deleteNode = async (node) => {
  try {
    await ElMessageBox.confirm(`确认删除节点"${node.nodeName}"？`, '提示', {
      type: 'warning'
    })

    await projectStore.deleteProjectNode(node.nodeId)
    ElMessage.success('删除成功')
    fetchProjectDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete node error:', error)
    }
  }
}

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
    case 'pending-in_progress':
      return '进行中'
    case 'completed':
      return '已完成'
    case 'pending-expired':
      return '已超期'
    default:
      return status || '-'
  }
}

// 任务状态文案
const taskStatusText = (status) => {
  if (!status) return '-'
  // 后端枚举 TaskStatusEnum，直接展示枚举名或做简单映射
  const statusCode = typeof status === 'object' ? status.code : status
  // 将大写的状态码转换为小写进行匹配
  const statusLower = statusCode.toLowerCase()
  const map = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    rejected: '已退回',
    timeout: '已超时'
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
    RETURN: '退回了项目',
    NODE_CREATE: '创建了节点',
    NODE_UPDATE: '更新了节点',
    NODE_DELETE: '删除了节点'
  }
  return map[type] || ''
}

onMounted(() => {
  fetchUserList()
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

    .node-actions {
      margin-bottom: 16px;
    }
  }
}
</style>
