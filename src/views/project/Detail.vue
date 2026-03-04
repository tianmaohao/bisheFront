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
import { formatDateOnly } from '@/utils/date'
import { hasPermission } from '@/utils/permission'
import { PERMISSIONS } from '@/config/constants'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()

const loading = ref(false)
const project = ref(null)

const canOperate = computed(() => {
  return hasPermission(PERMISSIONS.PROJECT_EDIT)
})

// 获取项目详情
const fetchProjectDetail = async () => {
  loading.value = true
  try {
    const id = route.params.id
    await projectStore.fetchProjectDetail(id)
    project.value = projectStore.currentProject
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

