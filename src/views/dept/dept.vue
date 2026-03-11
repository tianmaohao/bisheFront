
<!-- src/views/dept/List.vue -->
<template>
  <div class="dept-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增部门
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="部门名称">
            <el-input v-model="searchForm.deptName" placeholder="部门名称" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table
          v-loading="loading"
          :data="tableList"
          stripe
          border
          style="width: 100%"
      >
        <el-table-column prop="deptId" label="部门 ID" width="80" />
        <el-table-column prop="deptName" label="部门名称" min-width="150" />
        <el-table-column prop="parentId" label="父部门 ID" width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="currentDept?.deptId ? '编辑部门' : '新增部门'">
      <el-form :model="form" label-width="100px">
        <el-form-item label="部门名称">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="父部门 ID">
          <el-input-number v-model="form.parentId" :min="0" placeholder="0 为顶级部门" style="width: 100%" />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="form.sort" :min="0" placeholder="数字越小越靠前" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { deptApi } from '@/api/modules/dept'

const loading = ref(false)
const tableList = ref([])

const searchForm = reactive({
  deptName: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const currentDept = ref(null)
const form = reactive({
  deptId: null,
  deptName: '',
  parentId: 0,
  sort: 0
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await deptApi.getDeptList({
      pageNum: pagination.page,
      pageSize: pagination.size,
      deptName: searchForm.deptName
    })
    if (res.data) {
      tableList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleReset = () => {
  searchForm.deptName = ''
  handleSearch()
}

const handleCreate = () => {
  Object.assign(form, {
    deptId: null,
    deptName: '',
    parentId: 0,
    sort: 0
  })
  currentDept.value = null
  dialogVisible.value = true
}

const handleEdit = (row) => {
  currentDept.value = row
  Object.assign(form, {
    deptId: row.deptId,
    deptName: row.deptName,
    parentId: row.parentId,
    sort: row.sort
  })
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除部门「${row.deptName}」？`, '提示', {
    type: 'warning'
  })
  await deptApi.deleteDept(row.deptId)
  ElMessage.success('删除成功')
  fetchList()
}

const handleSave = async () => {
  await deptApi.addOrUpdateDept(form)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<style lang="less" scoped>
.dept-list {
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
