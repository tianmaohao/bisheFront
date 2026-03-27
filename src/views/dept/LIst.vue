<template>
  <div class="dept-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门列表</span>
          <el-button v-if="canAdd" type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增部门
          </el-button>
        </div>
      </template>

      <div class="toolbar">
        <div class="search-bar">
          <el-input
              v-model="searchText"
              placeholder="搜索部门名称..."
              clearable
              prefix-icon="Search"
              style="width: 300px"
          />
        </div>
      </div>

      <el-table
          ref="tableRef"
          v-loading="loading"
          :data="filteredTableData"
          style="width: 100%"
          row-key="deptId"
          border
          :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="deptName" label="部门名称" min-width="250">
          <template #default="{ row }">
            <div class="dept-cell">
              <el-icon :size="18" :color="getIconColor(row)">
                <component :is="getIcon(row)" />
              </el-icon>
              <span class="dept-name">{{ row.deptName }}</span>
              <span
                  v-if="row.children && row.children.length > 0"
                  class="expand-icon"
                  @click.stop="handleExpandClick(row)"
              >
                <el-icon :size="12">
                  <CaretRight v-if="!expandedRows.includes(row.deptId)" />
                  <CaretBottom v-else />
                </el-icon>
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="updateTime" label="更新时间" width="180" align="center" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-if="canEdit" link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button v-if="canDelete" link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
              v-model="form.parentId"
              :data="treeData"
              placeholder="选择上级部门"
              check-strictly
              :render-after-expand="false"
              show-checkbox
              style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Folder, Document, CaretRight, CaretBottom } from '@element-plus/icons-vue'
import { deptApi } from '@/api/modules/dept'
import {hasPermission} from "@/utils/permission.js";
import {PERMISSIONS} from "@/config/constants.js";

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const searchText = ref('')
const formRef = ref(null)
const tableRef = ref(null)
const expandedRows = ref([])
const allDepts = ref([])
const tableData = ref([])

// 表单数据
const form = reactive({
  deptId: null,
  deptName: '',
  parentId: 0
})


const canEdit = computed(() => {
  return hasPermission(PERMISSIONS.USER_EDIT)
})

const canDelete = computed(() => {
  return hasPermission(PERMISSIONS.USER_DELETE)
})
const canAdd = computed(() => {
  return hasPermission(PERMISSIONS.USER_CREATE)
})

// 表单验证规则
const rules = {
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  parentId: [
    { required: false }
  ]
}

// 树形数据
const treeData = computed(() => {
  const buildTree = (depts, parentId = 0) => {
    return depts
        .filter(dept => dept.parentId === parentId)
        .map(dept => ({
          value: dept.deptId,
          label: dept.deptName,
          children: buildTree(depts, dept.deptId)
        }))
  }
  return [{ value: 0, label: '顶级部门', children: buildTree(allDepts.value, 0) }]
})

// 过滤后的表格数据
const filteredTableData = computed(() => {
  if (!searchText.value) return tableData.value

  const filterTree = (nodes) => {
    return nodes.reduce((acc, node) => {
      const matches = node.deptName.includes(searchText.value)
      const children = node.children ? filterTree(node.children) : []

      if (matches || children.length > 0) {
        acc.push({
          ...node,
          children: children.length > 0 ? children : node.children
        })
      }
      return acc
    }, [])
  }

  return filterTree(tableData.value)
})

// 获取图标
const getIcon = (row) => {
  if (row.children && row.children.length > 0) {
    return Folder
  }
  return Document
}

// 获取图标颜色
const getIconColor = (row) => {
  const level = getLevel(row)
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  return colors[(level - 1) % colors.length]
}

// 计算层级
const getLevel = (row, level = 1) => {
  if (row.parentId === 0) return level
  const parent = allDepts.value.find(d => d.deptId === row.parentId)
  if (!parent) return level
  return getLevel(parent, level + 1)
}

// 构建树形表格数据
const buildTableTree = (depts, parentId = 0) => {
  return depts
      .filter(dept => dept.parentId === parentId)
      .map(dept => ({
        ...dept,
        children: buildTableTree(depts, dept.deptId)
      }))
}

// 处理展开/折叠点击
const handleExpandClick = (row) => {
  const index = expandedRows.value.indexOf(row.deptId)
  if (index > -1) {
    // 已展开，折叠
    expandedRows.value.splice(index, 1)
    tableRef.value.toggleRowExpansion(row, false)
  } else {
    // 未展开，展开
    expandedRows.value.push(row.deptId)
    tableRef.value.toggleRowExpansion(row, true)
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await deptApi.getAllDepts()
    if (res.data) {
      allDepts.value = res.data
      tableData.value = buildTableTree(res.data)
    }
  } catch (error) {
    ElMessage.error('加载部门数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 新增部门
const handleCreate = () => {
  form.deptId = null
  form.deptName = ''
  form.parentId = 0
  dialogVisible.value = true
}

// 编辑部门
const handleEdit = (row) => {
  form.deptId = row.deptId
  form.deptName = row.deptName
  form.parentId = row.parentId
  dialogVisible.value = true
}

// 删除部门
const handleDelete = async (row) => {
  if (row.children && row.children.length > 0) {
    ElMessage.warning('该部门存在子部门，无法删除')
    return
  }

  try {
    await ElMessageBox.confirm(`确定删除部门「${row.deptName}」？`, '提示', {
      type: 'warning'
    })
    await deptApi.deleteDept(row.deptId)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true
    await deptApi.addOrUpdateDept(form)
    ElMessage.success('保存成功')
    dialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="less" scoped>
.dept-list {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .toolbar {
    margin-bottom: 16px;
  }
}

.dept-cell {
  display: flex;
  align-items: center;

  .dept-icon {
    flex-shrink: 0;
  }

  .dept-name {
    font-weight: 500;
    color: #303133;
    margin-left: 8px;
    white-space: nowrap;
  }

  .expand-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #C0C4CC;
    transition: all 0.2s;
    padding: 2px 4px;
    border-radius: 3px;
    margin-left: 5px;

    &:hover {
      background-color: #E4E7ED;
      color: #409EFF;
    }
  }
}

// 表格样式优化
:deep(.el-table) {
  font-size: 14px;

  .el-table__header th {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
    padding: 12px 0;
  }

  .el-table__row {
    td {
      padding: 12px 0;
    }

    &:hover {
      background-color: #f5f7fa;

      .dept-name {
        color: #409EFF;
      }
    }
  }

  // 隐藏默认的展开图标
  .el-table__expand-icon {
    display: none;
  }

  // 隐藏默认缩进
  .el-table__indent {
    display: none;
  }

  // 操作按钮
  .el-button-link {
    padding: 4px 8px;
    font-size: 13px;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

// 斑马纹
:deep(.el-table--striped) {
  .el-table__body tr.el-table__row--striped td {
    background-color: #fafafa;
  }

  .el-table__body tr.el-table__row--striped:hover td {
    background-color: #ecf5ff;
  }
}
</style>
