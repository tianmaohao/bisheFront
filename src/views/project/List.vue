<template>
  <div class="project-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>项目列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建项目
          </el-button>
        </div>
      </template>
      
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="项目名称">
            <el-input
              v-model="searchForm.name"
              placeholder="请输入项目名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="项目状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option
                v-for="(label, value) in PROJECT_STATUS_MAP"
                :key="value"
                :label="label.label"
                :value="value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 项目表格 -->
      <el-table
        v-loading="loading"
        :data="projectList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="name" label="项目名称" min-width="150" />
        <el-table-column prop="customer" label="合作客户" min-width="120" />
        <el-table-column prop="status" label="项目状态" width="120">
          <template #default="{ row }">
            <el-tag :type="PROJECT_STATUS_MAP[row.status]?.type">
              {{ PROJECT_STATUS_MAP[row.status]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="交付日期" width="120">
          <template #default="{ row }">
            {{ formatDateOnly(row.deadline) }}
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="120">
          <template #default="{ row }">
            <el-progress :percentage="row.progress || 0" />
          </template>
        </el-table-column>
        <el-table-column prop="isOverdue" label="是否超期" width="100">
          <template #default="{ row }">
            <el-tag v-if="isOverdue(row.deadline)" type="danger">超期</el-tag>
            <el-tag v-else type="success">正常</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row.id)">
              查看
            </el-button>
            <el-button link type="primary" @click="handleEdit(row.id)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row.id)">
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
    
    <!-- 项目表单对话框 -->
    <ProjectFormDialog
      v-model="dialogVisible"
      :project-id="currentProjectId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useProjectStore } from '@/stores/modules/project'
import { PROJECT_STATUS_MAP } from '@/config/constants'
import { formatDateOnly, isOverdue } from '@/utils/date'
import ProjectFormDialog from './components/ProjectFormDialog.vue'

const router = useRouter()
const projectStore = useProjectStore()

const loading = ref(false)
const projectList = ref([])
const dialogVisible = ref(false)
const currentProjectId = ref(null)

const searchForm = reactive({
  name: '',
  status: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 获取项目列表
const fetchProjectList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      size: pagination.size
    }
    const res = await projectStore.fetchProjectList(params)
    if (res.data) {
      projectList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Fetch project list error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchProjectList()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
}

const handleCreate = () => {
  currentProjectId.value = null
  dialogVisible.value = true
}

const handleView = (id) => {
  router.push(`/project/detail/${id}`)
}

const handleEdit = (id) => {
  currentProjectId.value = id
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该项目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await projectStore.deleteProject(id)
    ElMessage.success('删除成功')
    fetchProjectList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Delete project error:', error)
    }
  }
}

const handleFormSuccess = () => {
  dialogVisible.value = false
  fetchProjectList()
}

const handleSizeChange = () => {
  fetchProjectList()
}

const handlePageChange = () => {
  fetchProjectList()
}

onMounted(() => {
  fetchProjectList()
})
</script>

<style lang="less" scoped>
.project-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
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

