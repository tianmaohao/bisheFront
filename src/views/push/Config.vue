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
      
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="150px"
      >
        <el-form-item label="推送协议" prop="protocol">
          <el-radio-group v-model="form.protocol">
            <el-radio label="MQTT">MQTT</el-radio>
            <el-radio label="RABBITMQ">RabbitMQ</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-divider v-if="form.protocol === 'MQTT'" />
        <template v-if="form.protocol === 'MQTT'">
          <el-form-item label="MQTT服务器地址" prop="mqttHost">
            <el-input v-model="form.mqttHost" placeholder="例如: mqtt.example.com" />
          </el-form-item>
          <el-form-item label="MQTT端口" prop="mqttPort">
            <el-input-number v-model="form.mqttPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="用户名" prop="mqttUsername">
            <el-input v-model="form.mqttUsername" />
          </el-form-item>
          <el-form-item label="密码" prop="mqttPassword">
            <el-input v-model="form.mqttPassword" type="password" show-password />
          </el-form-item>
          <el-form-item label="主题(Topic)" prop="mqttTopic">
            <el-input v-model="form.mqttTopic" placeholder="例如: project/data" />
          </el-form-item>
        </template>
        
        <el-divider v-if="form.protocol === 'RABBITMQ'" />
        <template v-if="form.protocol === 'RABBITMQ'">
          <el-form-item label="RabbitMQ服务器地址" prop="rabbitmqHost">
            <el-input v-model="form.rabbitmqHost" placeholder="例如: rabbitmq.example.com" />
          </el-form-item>
          <el-form-item label="RabbitMQ端口" prop="rabbitmqPort">
            <el-input-number v-model="form.rabbitmqPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="虚拟主机" prop="rabbitmqVhost">
            <el-input v-model="form.rabbitmqVhost" placeholder="例如: /" />
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
        
        <el-divider />
        <el-form-item label="自动推送" prop="autoPush">
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
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { usePushStore } from '@/stores/modules/push'
import { canConfigPush } from '@/utils/permission'
import { validators } from '@/utils/validator'

const pushStore = usePushStore()
const formRef = ref(null)
const loading = ref(false)

const canConfig = computed(() => canConfigPush())

const form = reactive({
  protocol: 'MQTT',
  // MQTT配置
  mqttHost: '',
  mqttPort: 1883,
  mqttUsername: '',
  mqttPassword: '',
  mqttTopic: '',
  // RabbitMQ配置
  rabbitmqHost: '',
  rabbitmqPort: 5672,
  rabbitmqVhost: '/',
  rabbitmqUsername: '',
  rabbitmqPassword: '',
  rabbitmqExchange: '',
  rabbitmqRoutingKey: '',
  // 通用配置
  autoPush: true,
  targetUnit: ''
})

const rules = {
  protocol: [validators.required('请选择推送协议')],
  mqttHost: [
    { required: true, message: '请输入MQTT服务器地址', trigger: 'blur', validator: (rule, value, callback) => {
      if (form.protocol === 'MQTT' && !value) {
        callback(new Error('请输入MQTT服务器地址'))
      } else {
        callback()
      }
    }}
  ],
  rabbitmqHost: [
    { required: true, message: '请输入RabbitMQ服务器地址', trigger: 'blur', validator: (rule, value, callback) => {
      if (form.protocol === 'RABBITMQ' && !value) {
        callback(new Error('请输入RabbitMQ服务器地址'))
      } else {
        callback()
      }
    }}
  ],
  targetUnit: [validators.required('请输入目标对接单位')]
}

// 获取推送配置
const fetchConfig = async () => {
  try {
    await pushStore.fetchPushConfig()
    if (pushStore.pushConfig) {
      Object.assign(form, pushStore.pushConfig)
    }
  } catch (error) {
    console.error('Fetch push config error:', error)
  }
}

// 保存配置
const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await pushStore.updatePushConfig(form)
        ElMessage.success('配置保存成功')
      } catch (error) {
        console.error('Save config error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchConfig()
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
    color: @text-color-secondary;
    font-size: 12px;
  }
}
</style>

