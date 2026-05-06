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
          <el-descriptions-item label="项目经理">
            {{ getPmName(project.pmId) }}
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
          <el-button type="primary" @click="showAddNodeDialog" :disabled="!project.id">
            <el-icon><Plus /></el-icon>
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
                    : row.status === 'overdue-completed'
                    ? 'warning'
                    : row.status === 'in_progress'
                    ? 'warning'
                    : row.status === 'expired'
                    ? 'danger'
                    : row.status === 'pending-expired'
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
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="{ row }">
              <el-button
                  type="primary"
                  link
                  @click="showAddTaskDialog(row)"
                  :disabled="!canManageTask"
              >
                添加任务
              </el-button>
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
        <div v-else class="empty-tip">
          <el-empty description="暂无节点信息，请先添加节点">
            <el-button type="primary" @click="showAddNodeDialog">添加节点</el-button>
          </el-empty>
        </div>

        <!-- 任务列表（按节点分组展示） -->
        <el-divider>任务列表</el-divider>
        <div v-if="tasksByNode && Object.keys(tasksByNode).length > 0" class="tasks-by-node">
          <el-collapse v-model="activeNodeCollapse">
            <el-collapse-item
                v-for="(nodeTasks, nodeId) in tasksByNode"
                :key="nodeId"
                :name="nodeId"
            >
              <template #title>
                <div class="collapse-title">
                  <el-tag type="primary" size="small">{{ getNodeName(nodeId) }}</el-tag>
                  <span class="task-count">({{ nodeTasks.length }} 个任务)</span>
                </div>
              </template>

              <el-table
                  :data="nodeTasks"
                  border
                  stripe
                  size="small"
              >
                <el-table-column prop="taskTitle" label="任务标题" min-width="180" />
                <el-table-column prop="assigneeName" label="负责人" width="140" />
                <el-table-column prop="deadline" label="截止时间" min-width="160">
                  <template #default="{ row }">
                    {{ formatDate(row.deadline) }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="TASK_STATUS_MAP[row.status]?.type || 'info'">
                      {{ TASK_STATUS_MAP[row.status]?.label || row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                  <template #default="{ row }">
                    <el-button
                        type="primary"
                        link
                        @click="handleCompleteTask(row)"
                        v-if="row.status === 'PENDING' || row.status === 'IN_PROGRESS'"
                    >
                      完成
                    </el-button>
                    <el-button
                        type="warning"
                        link
                        @click="handleRejectTask(row)"
                        v-if="canManageTask && (row.status === 'COMPLETED')"
                    >
                      驳回
                    </el-button>
                    <el-button
                        type="danger"
                        link
                        @click="handleDeleteTask(row)"
                        v-if="canManageTask"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
        </div>
        <div v-else class="empty-tip">
          <el-empty description="暂无任务记录" />
        </div>

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
              placeholder="请选择节点负责人"
              filterable
              remote
              :remote-method="remoteSearchUser"
              :loading="userSearchLoading"
              clearable
              style="width: 100%"
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

    <!-- 添加任务对话框 -->
    <el-dialog
        v-model="taskDialogVisible"
        :title="editingTask ? '编辑任务' : '添加任务'"
        width="600px"
    >
      <el-form
          ref="taskFormRef"
          :model="taskForm"
          :rules="taskRules"
          label-width="100px"
      >
        <el-form-item label="所属节点" prop="nodeId">
          <el-select
              v-model="taskForm.nodeId"
              placeholder="请选择所属节点"
              filterable
              :disabled="!!selectedNodeForTask"
              style="width: 100%"
          >
            <el-option
                v-for="node in nodes"
                :key="node.nodeId"
                :label="node.nodeName"
                :value="node.nodeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="任务标题" prop="taskTitle">
          <el-input v-model="taskForm.taskTitle" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务内容" prop="taskContent">
          <el-input
              v-model="taskForm.taskContent"
              type="textarea"
              :rows="3"
              placeholder="请输入任务内容"
          />
        </el-form-item>
        <el-form-item label="任务负责人" prop="assigneeId">
          <el-select
              v-model="taskForm.assigneeId"
              placeholder="请选择任务负责人"
              filterable
              remote
              :remote-method="remoteSearchUser"
              :loading="userSearchLoading"
              clearable
              style="width: 100%"
          >
            <el-option
                v-for="user in userList"
                :key="user.id"
                :label="`${user.realName} (${user.username})`"
                :value="Number(user.id)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
              v-model="taskForm.deadline"
              type="datetime"
              placeholder="选择截止时间"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="taskLoading" @click="submitTaskForm">
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
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { useUserStore } from '@/stores/modules/user'
import { formatDateOnly, formatDate } from '@/utils/date'
import { hasPermission } from '@/utils/permission'
import { PERMISSIONS } from '@/config/constants'
import { PROJECT_STATUS, PROJECT_STATUS_MAP, TASK_STATUS, TASK_STATUS_MAP } from '@/config/constants'
import { taskApi } from '@/api/modules/task'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const userStore = useUserStore()

const loading = ref(false)
const project = ref(null)
const nodes = ref([])
const tasks = ref([])
const logs = ref([])
const pmList = ref([])

// 节点相关
const nodeDialogVisible = ref(false)
const nodeLoading = ref(false)
const nodeFormRef = ref(null)
const editingNode = ref(null)
const userList = ref([])
const userSearchLoading = ref(false)

// 任务相关
const taskDialogVisible = ref(false)
const taskLoading = ref(false)
const taskFormRef = ref(null)
const editingTask = ref(null)
const selectedNodeForTask = ref(null)
const activeNodeCollapse = ref([])

const nodeForm = ref({
  nodeName: '',
  nodeOrder: 1,
  ownerId: null,
  parentId: null,
  startTime: '',
  endTime: ''
})

const taskForm = ref({
  nodeId: null,
  taskTitle: '',
  taskContent: '',
  assigneeId: null,
  deadline: ''
})

const nodeRules = {
  nodeName: [{ required: true, message: '请输入节点名称', trigger: 'blur' }],
  nodeOrder: [{ required: true, message: '请输入节点顺序', trigger: 'blur' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }]
}

const taskRules = {
  nodeId: [{ required: true, message: '请选择所属节点', trigger: 'change' }],
  taskTitle: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  assigneeId: [{ required: true, message: '请选择任务负责人', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择截止时间', trigger: 'change' }]
}

const availableParentNodes = computed(() => {
  if (!editingNode.value) {
    return nodes.value
  }
  return nodes.value.filter(node => node.nodeId !== editingNode.value.nodeId)
})

// 按节点分组任务（统一使用数字类型作为 key）
const tasksByNode = computed(() => {
  const grouped = {}
  tasks.value.forEach(task => {
    const nodeId = Number(task.nodeId)
    if (!grouped[nodeId]) {
      grouped[nodeId] = []
    }
    grouped[nodeId].push(task)
  })
  return grouped
})

const canOperate = computed(() => {
  return hasPermission(PERMISSIONS.PROJECT_EDIT)
})

const canManageTask = computed(() => {
  return hasPermission(PERMISSIONS.TASK_MANAGE) || hasPermission(PERMISSIONS.PROJECT_EDIT)
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
  } catch (error) {
    console.error('Search user error:', error)
  } finally {
    userSearchLoading.value = false
  }
}

// 获取项目经理姓名
const getPmName = (pmId) => {
  if (!pmId) return '未分配'
  const pm = pmList.value.find(pm => pm.id === pmId)
  return pm ? `${pm.realName} (${pm.username})` : '未分配'
}

// 获取节点名称（统一转换为数字类型查找）
const getNodeName = (nodeId) => {
  const nodeIdNum = Number(nodeId)
  const node = nodes.value.find(n => n.nodeId === nodeIdNum)
  return node ? node.nodeName : '未知节点'
}

// 获取所有项目经理列表
const fetchPmList = async () => {
  try {
    const res = await userStore.fetchPmList()
    pmList.value = res.data || []
  } catch (error) {
    console.error('Fetch pm list error:', error)
  }
}

// 显示添加节点对话框
const showAddNodeDialog = () => {
  editingNode.value = null
  nodeForm.value = {
    nodeName: '',
    nodeOrder: nodes.value.length + 1,
    ownerId: undefined,
    parentId: undefined,
    startTime: '',
    endTime: ''
  }
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
  remoteSearchUser('')
  nodeDialogVisible.value = true
}

// 显示添加任务对话框（确保 nodeId 为数字类型）
const showAddTaskDialog = (node) => {
  editingTask.value = null
  selectedNodeForTask.value = node
  taskForm.value = {
    nodeId: Number(node.nodeId),
    taskTitle: '',
    taskContent: '',
    assigneeId: undefined,
    deadline: ''
  }
  remoteSearchUser('')
  taskDialogVisible.value = true
}

// 提交节点表单
const submitNodeForm = async () => {
  if (!nodeFormRef.value) return

  await nodeFormRef.value.validate(async (valid) => {
    if (valid) {
      nodeLoading.value = true
      try {
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
          projectId: Number(project.value.id),
          startTime: nodeForm.value.startTime ? formatDateTime(nodeForm.value.startTime) : '',
          endTime: nodeForm.value.endTime ? formatDateTime(nodeForm.value.endTime) : ''
        }

        if (editingNode.value) {
          await projectStore.updateProjectNode(Number(editingNode.value.nodeId), nodeData)
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

// 提交任务表单
const submitTaskForm = async () => {
  if (!taskFormRef.value) return

  await taskFormRef.value.validate(async (valid) => {
    if (valid) {
      taskLoading.value = true
      try {
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

        const taskData = {
          ...taskForm.value,
          projectId: Number(project.value.id),
          nodeId: Number(taskForm.value.nodeId),
          deadline: taskForm.value.deadline ? formatDateTime(taskForm.value.deadline) : ''
        }

        await taskApi.createTask(taskData)
        ElMessage.success(editingTask.value ? '更新成功' : '添加成功')

        taskDialogVisible.value = false
        fetchProjectDetail()
      } catch (error) {
        console.error('Submit task error:', error)
      } finally {
        taskLoading.value = false
      }
    }
  })
}

// 删除节点
const deleteNode = async (node) => {
  try {
    await ElMessageBox.confirm(`确认删除节点"${node.nodeName}"？删除后该节点下的所有任务也将被删除`, '提示', {
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

// 完成任务
const handleCompleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确认完成任务"${task.taskTitle}"？`, '提示', {
      type: 'info'
    })

    await taskApi.completeTask(task.taskId)
    ElMessage.success('任务已完成')
    fetchProjectDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Complete task error:', error)
    }
  }
}

// 驳回任务
const handleRejectTask = async (task) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入驳回原因', '驳回任务', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入驳回原因'
    })

    await taskApi.rejectTask(task.taskId, value)
    ElMessage.success('任务已驳回')
    fetchProjectDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Reject task error:', error)
    }
  }
}

// 删除任务
const handleDeleteTask = async (task) => {
  try {
    await ElMessageBox.confirm(`确认删除任务"${task.taskTitle}"？`, '提示', {
      type: 'warning'
    })

    await taskApi.deleteTask(task.taskId)
    ElMessage.success('删除成功')
    fetchProjectDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete task error:', error)
    }
  }
}

// 获取项目完整详情（统一 ID 类型为数字）
const fetchProjectDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    await projectStore.fetchProjectFullDetail(id)
    const detail = projectStore.currentProjectFullDetail
    if (detail) {
      project.value = detail.project
      nodes.value = (detail.nodes || []).map(node => ({
        ...node,
        nodeId: Number(node.nodeId)
      }))
      tasks.value = (detail.tasks || []).map(task => ({
        ...task,
        nodeId: Number(task.nodeId),
        taskId: Number(task.taskId),
        assigneeId: Number(task.assigneeId)
      }))
      logs.value = detail.logs || []

      activeNodeCollapse.value = nodes.value.map(n => n.nodeId)
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
    case 'pending-in_progress': // 兼容旧的状态码
      return '进行中'
    case 'completed':
      return '已完成'
    case 'expired':
    case 'pending-expired':
      return '已超期'
    case 'overdue-completed':
      return '超期完成'
    default:
      return status || '-'
  }
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
    NODE_DELETE: '删除了节点',
    TASK_CREATE: '创建了任务',
    TASK_UPDATE: '更新了任务',
    TASK_DELETE: '删除了任务'
  }
  return map[type] || ''
}

onMounted(() => {
  fetchPmList()
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

    .tasks-by-node {
      .collapse-title {
        display: flex;
        align-items: center;
        gap: 8px;

        .task-count {
          color: #909399;
          font-size: 14px;
        }
      }
    }

    .empty-tip {
      text-align: center;
      padding: 20px;
    }
  }
}
</style>
