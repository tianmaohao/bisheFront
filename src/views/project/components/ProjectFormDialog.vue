<template>
  <el-dialog
    v-model="dialogVisible"
    :title="projectId ? '编辑项目' : '新建项目'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="合作客户" prop="customer">
        <el-input v-model="form.customer" placeholder="请输入合作客户" />
      </el-form-item>
      <el-form-item label="开始日期" prop="startDate">
        <el-date-picker
          v-model="form.startDate"
          type="date"
          placeholder="选择开始日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="交付日期" prop="deadline">
        <el-date-picker
          v-model="form.deadline"
          type="date"
          placeholder="选择交付日期"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="项目描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入项目描述"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useProjectStore } from '@/stores/modules/project'
import { validators } from '@/utils/validator'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const projectStore = useProjectStore()
const formRef = ref(null)
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const form = reactive({
  name: '',
  customer: '',
  startDate: '',
  deadline: '',
  description: ''
})

const rules = {
  name: [validators.required('请输入项目名称')],
  customer: [validators.required('请输入合作客户')],
  startDate: [validators.required('请选择开始日期')],
  deadline: [validators.required('请选择交付日期')]
}

// 获取项目详情
const fetchProjectDetail = async () => {
  if (!props.projectId) return
  
  try {
    await projectStore.fetchProjectDetail(props.projectId)
    const project = projectStore.currentProject
    if (project) {
      Object.assign(form, {
        name: project.name || '',
        customer: project.customer || '',
        startDate: project.startDate || '',
        deadline: project.deadline || '',
        description: project.description || ''
      })
    }
  } catch (error) {
    console.error('Fetch project detail error:', error)
  }
}

// 监听projectId变化
watch(() => props.projectId, (newVal) => {
  if (newVal && dialogVisible.value) {
    fetchProjectDetail()
  } else {
    resetForm()
  }
})

// 监听对话框显示
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    if (props.projectId) {
      fetchProjectDetail()
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  Object.assign(form, {
    name: '',
    customer: '',
    startDate: '',
    deadline: '',
    description: ''
  })
  formRef.value?.clearValidate()
}

const handleClose = () => {
  dialogVisible.value = false
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (props.projectId) {
          await projectStore.updateProject(props.projectId, form)
          ElMessage.success('更新成功')
        } else {
          await projectStore.createProject(form)
          ElMessage.success('创建成功')
        }
        emit('success')
        handleClose()
      } catch (error) {
        console.error('Submit error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

