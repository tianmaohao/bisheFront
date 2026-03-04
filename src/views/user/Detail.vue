<!-- src/views/user/Detail.vue -->
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
          <el-input v-model="form.department" />
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="form.level">
            <el-option label="普通员工" :value="1" />
            <el-option label="主管" :value="2" />
            <el-option label="项目经理" :value="3" />
            <el-option label="管理员" :value="4" />
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

      <el-divider>任务统计（占位，可与后端对接）</el-divider>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="总任务数">
          {{ taskStats.total }}
        </el-descriptions-item>
        <el-descriptions-item label="按时完成">
          {{ taskStats.onTime }}
        </el-descriptions-item>
        <el-descriptions-item label="按时完成率">
          {{ taskStats.rate }}%
        </el-descriptions-item>
      </el-descriptions>

      <div class="actions">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { userApi } from '@/api/modules/user'

const route = useRoute()
const loading = ref(false)
const form = reactive({
  id: null,
  username: '',
  realName: '',
  department: '',
  level: 1,
  status: 1
})

// 简单占位，后续可以接任务统计接口
const taskStats = reactive({
  total: 0,
  onTime: 0,
  rate: 0
})

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await userApi.getUserById(route.params.id)
    if (res.data) {
      Object.assign(form, res.data)
    }
    // TODO: 调用任务统计接口，填充 taskStats
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  await userApi.addOrUpdateUser(form)
  ElMessage.success('保存成功')
}

onMounted(fetchDetail)
</script>

<style lang="less" scoped>
.user-detail {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .actions {
    margin-top: 20px;
    text-align: right;
  }
}
</style>