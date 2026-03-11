<!-- src/views/user/List.vue -->
<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人员列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增人员
          </el-button>
        </div>
      </template>

      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="用户名">
            <el-input v-model="searchForm.username" placeholder="用户名" clearable />
          </el-form-item>
          <el-form-item label="姓名">
            <el-input v-model="searchForm.realName" placeholder="姓名" clearable />
          </el-form-item>
          <el-form-item label="部门">
            <el-select v-model="searchForm.department" placeholder="部门" clearable filterable style="width: 150px">
              <el-option
                  v-for="dept in deptList"
                  :key="dept.deptId"
                  :label="dept.deptName"
                  :value="dept.deptName"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 100px">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
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
        :data="pagedList"
        stripe
        border
        style="width: 100%"
      >
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="realName" label="姓名" min-width="120" />
        <el-table-column prop="department" label="所属部门" min-width="140" />
        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag>{{ levelText(row.level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">详情</el-button>
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
          @current-change="calcPage"
          @size-change="calcPage"
        />
      </div>
    </el-card>

    <!-- 简单编辑弹窗，也可以跳到详情页编辑 -->
    <el-dialog v-model="dialogVisible" :title="currentUser?.id ? '编辑人员' : '新增人员'">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="form.realName" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="form.department" placeholder="请选择部门" filterable style="width: 100%">
            <el-option
                v-for="dept in deptList"
                :key="dept.deptId"
                :label="dept.deptName"
                :value="dept.deptName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="form.level" placeholder="请选择">
            <el-option label="普通员工" :value="1" />
            <el-option label="主管" :value="2" />
            <el-option label="项目经理" :value="3" />
            <el-option label="管理员" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!form.id" label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'
import { deptApi } from '@/api/modules/dept'

const router = useRouter()

const loading = ref(false)
const rawList = ref([])

const searchForm = reactive({
  username: '',
  realName: '',
  department: '',
  status: null
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const dialogVisible = ref(false)
const currentUser = ref(null)
const deptList = ref([])
const form = reactive({
  id: null,
  username: '',
  password: '',
  realName: '',
  department: '',
  level: 1
})

const filteredList = computed(() => {
  // return rawList.value.filter(u => {
  //   const uOk = !searchForm.username || (u.username || '').includes(searchForm.username)
  //   const rOk = !searchForm.realName || (u.realName || '').includes(searchForm.realName)
  //   const dOk = !searchForm.department || (u.department || '').includes(searchForm.department)
  //   const sOk = searchForm.status == null || u.status === searchForm.status
  //   return uOk && rOk && dOk && sOk
  // })、
  return rawList.value
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

const pagedList = computed(() => {
  const start = (pagination.page - 1) * pagination.size
  const end = start + pagination.size
  return filteredList.value.slice(start, end)
})

const levelText = (level) => {
  const map = {
    1: '普通员工',
    2: '主管',
    3: '项目经理',
    4: '管理员'
  }
  return map[level] || level
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserList({
      pageNum: pagination.page,
      pageSize: pagination.size,
      username: searchForm.username,
      realName: searchForm.realName,
      department: searchForm.department,
      status: searchForm.status
    })
    if (res.data) {
      rawList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } finally {
    loading.value = false
  }
}

const calcPage = () => {
  pagination.total = filteredList.value.length
}

const handleSearch = () => {
  pagination.page = 1
  fetchList()
}

const handleReset = () => {
  searchForm.username = ''
  searchForm.realName = ''
  searchForm.department = ''
  searchForm.status = null
  handleSearch()
}

const handleCreate = () => {
  Object.assign(form, {
    id: null,
    username: '',
    password: '',
    realName: '',
    department: '',
    level: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  currentUser.value = row
  Object.assign(form, {
    id: row.id,
    username: row.username,
    realName: row.realName,
    department: row.department,
    level: row.level,
    password: ''
  })
  dialogVisible.value = true
}

const handleView = (row) => {
  router.push(`/user/detail/${row.id}`)
}

const handleDelete = async (row) => {
  await ElMessageBox.confirm(`确定删除用户「${row.realName}」？`, '提示', {
    type: 'warning'
  })
  await userApi.deleteUser(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

const handleSave = async () => {
  await userApi.addOrUpdateUser(form)
  ElMessage.success('保存成功')
  dialogVisible.value = false
  fetchList()
}

onMounted(() => {
  fetchDeptList()
  fetchList()
})
</script>

<style lang="less" scoped>
.user-list {
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