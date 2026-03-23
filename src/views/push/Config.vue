<template>
  <div class="push-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>推送配置</span>
          <el-button
              type="primary"
              :disabled="!canConfig"
              @click="handleSave"
              :loading="loading"
          >
            保存配置
          </el-button>
        </div>
      </template>

      <el-alert
          v-if="!canConfig"
          title="权限提示"
          description="您没有配置推送参数的权限，请联系管理员"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
      />

      <!-- 选择项目 -->
      <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="150px"
      >
        <el-form-item label="选择项目" prop="projectId">
          <el-select
              v-model="form.projectId"
              placeholder="请选择项目"
              filterable
              style="width: 100%"
              @change="handleProjectChange"
          >
            <el-option
                v-for="project in projectList"
                :key="project.id"
                :label="project.name"
                :value="project.id"
            />
          </el-select>
        </el-form-item>

        <el-divider />
        <el-form-item label="推送方式" prop="pushType">
          <el-radio-group v-model="form.pushType">
            <el-radio label="MQTT">MQTT</el-radio>
            <el-radio label="RABBITMQ">RabbitMQ</el-radio>
            <el-radio label="HTTP">HTTP 推送</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- MQTT 配置 -->
        <template v-if="form.pushType === 'MQTT'">
          <el-divider />
          <el-form-item label="MQTT 服务器地址" prop="mqttHost">
            <el-input v-model="form.mqttHost" placeholder="例如：mqtt.example.com" />
          </el-form-item>
          <el-form-item label="MQTT 端口" prop="mqttPort">
            <el-input-number v-model="form.mqttPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="用户名" prop="mqttUsername">
            <el-input v-model="form.mqttUsername" />
          </el-form-item>
          <el-form-item label="密码" prop="mqttPassword">
            <el-input v-model="form.mqttPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="主题 (Topic)" prop="mqttTopic">
            <el-input v-model="form.mqttTopic" placeholder="例如：project/data" />
          </el-form-item>
        </template>

        <!-- RabbitMQ 配置 -->
        <template v-if="form.pushType === 'RABBITMQ'">
          <el-divider />
          <el-form-item label="RabbitMQ 服务器地址" prop="rabbitmqHost">
            <el-input v-model="form.rabbitmqHost" placeholder="例如：rabbitmq.example.com" />
          </el-form-item>
          <el-form-item label="RabbitMQ 端口" prop="rabbitmqPort">
            <el-input-number v-model="form.rabbitmqPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="虚拟主机" prop="rabbitmqVhost">
            <el-input v-model="form.rabbitmqVhost" placeholder="例如：/" />
          </el-form-item>
          <el-form-item label="用户名" prop="rabbitmqUsername">
            <el-input v-model="form.rabbitmqUsername" />
          </el-form-item>
          <el-form-item label="密码" prop="rabbitmqPassword">
            <el-input v-model="form.rabbitmqPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="交换机名称" prop="rabbitmqExchange">
            <el-input v-model="form.rabbitmqExchange" />
          </el-form-item>
          <el-form-item label="路由键" prop="rabbitmqRoutingKey">
            <el-input v-model="form.rabbitmqRoutingKey" />
          </el-form-item>
        </template>

        <!-- HTTP 配置 -->
        <template v-if="form.pushType === 'HTTP'">
          <el-divider />
          <el-form-item label="推送地址" prop="httpUrl">
            <el-input
                v-model="form.httpUrl"
                type="textarea"
                :rows="3"
                placeholder="请输入完整的 HTTP 推送地址，例如：https://api.example.com/push"
            />
          </el-form-item>
        </template>

        <el-divider />
        <el-form-item label="推送模式" prop="isManualPush">
          <el-radio-group v-model="form.isManualPush">
            <el-radio :label="0">自动推送</el-radio>
            <el-radio :label="1">手动推送</el-radio>
          </el-radio-group>
          <div class="form-tip">
            自动推送：按照设定的时间间隔自动推送数据<br>
            手动推送：需要手动点击按钮触发推送
          </div>
        </el-form-item>

        <el-form-item
            v-if="form.isManualPush === 0"
            label="推送间隔"
            prop="pushInterval"
        >
          <el-input-number
              v-model="form.pushInterval"
              :min="1"
              :max="86400"
              placeholder="请输入推送间隔（秒）"
          />
          <span style="margin-left: 10px; color: #909399;">秒</span>
          <div class="form-tip">
            自动推送的时间间隔，最小 1 秒，最大 86400 秒（24 小时）
          </div>
        </el-form-item>

        <el-form-item
            v-if="form.isManualPush === 0"
            label="自动推送开关"
            prop="autoPush"
        >
          <el-switch
              v-model="form.autoPush"
              active-text="开启"
              inactive-text="关闭"
          />
          <div class="form-tip">
            开启后，项目状态变更到"部署推进"或"交付完成"时将自动推送数据
          </div>
        </el-form-item>

        <el-form-item label="目标对接单位" prop="targetUnit">
          <el-input v-model="form.targetUnit" placeholder="请输入目标对接单位" />
        </el-form-item>

        <!-- 手动推送按钮 -->
        <el-form-item v-if="form.isManualPush === 1 && form.id" label="手动推送">
          <el-button
              type="primary"
              @click="handleManualPush"
              :loading="pushing"
          >
            立即推送
          </el-button>
          <div class="form-tip">
            点击按钮将立即推送一次数据
          </div>
        </el-form-item>

        <!-- 自动推送控制按钮 -->
        <template v-if="form.isManualPush === 0 && form.id">
          <el-form-item label="自动推送控制">
            <el-space>
              <el-button
                  type="success"
                  @click="handleStartAutoPush"
                  :loading="starting"
                  :disabled="form.autoPush"
              >
                开始推送
              </el-button>
              <el-button
                  type="warning"
                  @click="handleStopAutoPush"
                  :loading="stopping"
                  :disabled="!form.autoPush"
              >
                停止推送
              </el-button>
            </el-space>
            <div class="form-tip">
              控制自动推送任务的启动和停止
            </div>
          </el-form-item>
        </template>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { usePushStore } from '@/stores/modules/push'
import { useProjectStore } from '@/stores/modules/project'
import { canConfigPush } from '@/utils/permission'
import { validators } from '@/utils/validator'

const pushStore = usePushStore()
const projectStore = useProjectStore()
const formRef = ref(null)
const loading = ref(false)
const pushing = ref(false)
const starting = ref(false)
const stopping = ref(false)

const canConfig = computed(() => canConfigPush())

const form = reactive({
  id: null,
  projectId: null,
  projectName: '',
  pushType: 'MQTT',
  // MQTT 配置
  mqttHost: '',
  mqttPort: 1883,
  mqttUsername: '',
  mqttPassword: '',
  mqttTopic: '',
  // RabbitMQ 配置
  rabbitmqHost: '',
  rabbitmqPort: 5672,
  rabbitmqVhost: '/',
  rabbitmqUsername: '',
  rabbitmqPassword: '',
  rabbitmqExchange: '',
  rabbitmqRoutingKey: '',
  // HTTP 配置
  httpUrl: '',
  // 通用配置
  autoPush: true,
  pushInterval: 3600,
  isManualPush: 0,
  targetUnit: ''
})

const rules = {
  projectId: [validators.required('请选择项目')],
  pushType: [validators.required('请选择推送方式')],
  mqttHost: [
    { required: true, message: '请输入 MQTT 服务器地址', trigger: 'blur', validator: (rule, value, callback) => {
        if (form.pushType === 'MQTT' && !value) {
          callback(new Error('请输入 MQTT 服务器地址'))
        } else {
          callback()
        }
      }}
  ],
  rabbitmqHost: [
    { required: true, message: '请输入 RabbitMQ 服务器地址', trigger: 'blur', validator: (rule, value, callback) => {
        if (form.pushType === 'RABBITMQ' && !value) {
          callback(new Error('请输入 RabbitMQ 服务器地址'))
        } else {
          callback()
        }
      }}
  ],
  httpUrl: [
    { required: true, message: '请输入 HTTP 推送地址', trigger: 'blur', validator: (rule, value, callback) => {
        if (form.pushType === 'HTTP' && !value) {
          callback(new Error('请输入 HTTP 推送地址'))
        } else {
          callback()
        }
      }}
  ],
  targetUnit: [validators.required('请输入目标对接单位')]
}

// 获取项目列表
const projectList = ref([])
const fetchProjectList = async () => {
  try {
    const res = await projectStore.fetchProjectList({
      pageNum: 1,
      pageSize: 100
    })
    projectList.value = res.data?.list || []
  } catch (error) {
    console.error('Fetch project list error:', error)
  }
}

// 切换项目时加载配置
const handleProjectChange = async (projectId) => {
  console.log('=== 切换项目 ===')
  console.log('选择的 projectId:', projectId)

  if (!projectId) {
    resetForm()
    return
  }

  try {
    console.log('Fetch push config by project id:', projectId)
    await pushStore.fetchPushConfigByProjectId(projectId)
    const config = pushStore.pushConfig

    console.log('Push config from store:', config)

    if (config) {
      console.log('配置详情:', config)
      // 映射后端字段到前端表单
      form.id = config.id
      form.projectId = config.projectId
      form.projectName = config.projectName || ''
      form.pushType = config.protocol || 'MQTT'
      form.mqttHost = config.mqttHost || ''
      form.mqttPort = config.mqttPort || 1883
      form.mqttUsername = config.mqttUsername || ''
      form.mqttPassword = config.mqttPassword || ''
      form.mqttTopic = config.mqttTopic || ''
      form.rabbitmqHost = config.rabbitmqHost || ''
      form.rabbitmqPort = config.rabbitmqPort || 5672
      form.rabbitmqVhost = config.rabbitmqVhost || '/'
      form.rabbitmqUsername = config.rabbitmqUsername || ''
      form.rabbitmqPassword = config.rabbitmqPassword || ''
      form.rabbitmqExchange = config.rabbitmqExchange || ''
      form.rabbitmqRoutingKey = config.rabbitmqRoutingKey || ''
      form.httpUrl = config.webhookUrl || ''
      form.autoPush = config.autoPush === 1
      form.isManualPush = config.scheduledPush === 1 ? 0 : 1
      form.pushInterval = config.pushInterval || 3600
      form.targetUnit = config.targetUnit || ''

      ElMessage.info(`已加载项目 (ID: ${projectId}) 的推送配置`)
    } else {
      // 重要：后端返回 null 时，清空表单并提示
      console.log('该项目没有配置，重置表单')
      resetForm()
      form.projectId = projectId
      ElMessage.warning(`项目 (ID: ${projectId}) 暂无推送配置，请进行新增`)
    }
  } catch (error) {
    console.error('Fetch push config error:', error)
    ElMessage.error('加载配置失败')
  }
}
// 重置表单
const resetForm = () => {
  form.id = null
  form.projectId = null
  form.projectName = ''
  form.pushType = 'MQTT'
  form.mqttHost = ''
  form.mqttPort = 1883
  form.mqttUsername = ''
  form.mqttPassword = ''
  form.mqttTopic = ''
  form.rabbitmqHost = ''
  form.rabbitmqPort = 5672
  form.rabbitmqVhost = '/'
  form.rabbitmqUsername = ''
  form.rabbitmqPassword = ''
  form.rabbitmqExchange = ''
  form.rabbitmqRoutingKey = ''
  form.httpUrl = ''
  form.autoPush = true
  form.pushInterval = 3600
  form.isManualPush = 0
  form.targetUnit = ''
}

// 保存配置
const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const submitData = {
          id: form.id,
          projectId: form.projectId,
          configName: `${form.pushType}推送配置`,
          protocol: form.pushType,
          mqttHost: form.mqttHost,
          mqttPort: form.mqttPort,
          mqttUsername: form.mqttUsername,
          mqttPassword: form.mqttPassword,
          mqttTopic: form.mqttTopic,
          rabbitmqHost: form.rabbitmqHost,
          rabbitmqPort: form.rabbitmqPort,
          rabbitmqVhost: form.rabbitmqVhost,
          rabbitmqUsername: form.rabbitmqUsername,
          rabbitmqPassword: form.rabbitmqPassword,
          rabbitmqExchange: form.rabbitmqExchange,
          rabbitmqRoutingKey: form.rabbitmqRoutingKey,
          webhookUrl: form.httpUrl,
          autoPush: form.autoPush ? 1 : 0,
          scheduledPush: form.isManualPush === 0 ? 1 : 0,
          pushInterval: form.pushInterval,
          pushStatus: form.pushStatus || 0,
          targetUnit: form.targetUnit
        }
        await pushStore.savePushConfig(submitData)
        ElMessage.success('配置保存成功')

        // 重新加载配置
        handleProjectChange(form.projectId)
      } catch (error) {
        console.error('Save config error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 手动推送
const handleManualPush = async () => {
  try {
    await ElMessageBox.confirm('确定要立即推送数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    pushing.value = true
    await pushStore.manualPush(form.id)
    ElMessage.success('推送成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Manual push error:', error)
    }
  } finally {
    pushing.value = false
  }
}

// 启动自动推送
const handleStartAutoPush = async () => {
  try {
    await pushStore.startAutoPush(form.id)
    ElMessage.success('自动推送已启动')
    handleProjectChange(form.projectId)
  } catch (error) {
    console.error('Start auto push error:', error)
  } finally {
    starting.value = false
  }
}

// 停止自动推送
const handleStopAutoPush = async () => {
  try {
    await pushStore.stopAutoPush(form.id)
    ElMessage.success('自动推送已停止')
    handleProjectChange(form.projectId)
  } catch (error) {
    console.error('Stop auto push error:', error)
  } finally {
    stopping.value = false
  }
}

onMounted(() => {
  fetchProjectList()
})
</script>

<style lang="less" scoped>
.push-config {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-tip {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
    line-height: 1.5;
  }
}
</style>
