<template>
  <div class="login-container">
    <div class="login-background">
      <div class="bg-circle circle-1"></div>
      <div class="bg-circle circle-2"></div>
      <div class="bg-circle circle-3"></div>
    </div>

    <div class="login-card-wrapper">
      <el-card class="login-card">
        <template #header>
          <div class="card-header">
            <div class="logo-icon">
              <el-icon :size="42"><Management /></el-icon>
            </div>
            <h2>企业项目管理系统</h2>
            <p class="subtitle">欢迎登录，开启高效工作之旅</p>
          </div>
        </template>

        <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-width="0"
            class="login-form"
        >
          <el-form-item prop="username">
            <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                clearable
                size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                size="large"
                @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                :loading="loading"
                class="login-btn"
                size="large"
                @click="handleLogin"
            >
              <span v-if="!loading">登 录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>

          <el-form-item>
            <div class="no-account-tip">
              <el-icon class="tip-icon"><InfoFilled /></el-icon>
              <span>没有账号？请联系管理员</span>
            </div>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Management, InfoFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/modules/user'
import { validators } from '@/utils/validator'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [validators.required('请输入用户名')],
  password: [validators.required('请输入密码')]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        await userStore.login(loginForm)
        ElMessage.success('登录成功')
        const redirect = route.query.redirect || '/'
        router.push(redirect)
      } catch (error) {
        console.error('Login error:', error)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="less" scoped>
.login-container {
  position: relative;
  .flex-center();
  min-height: 100vh;
  background: linear-gradient(120deg, #e0f2fe 0%, #f0f9ff 50%, #e0f2fe 100%);
  overflow: hidden;

  .login-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 0;

    .bg-circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(64, 158, 255, 0.06);

      &.circle-1 {
        width: 350px;
        height: 350px;
        top: -100px;
        right: -100px;
      }

      &.circle-2 {
        width: 280px;
        height: 280px;
        bottom: -80px;
        left: -80px;
      }

      &.circle-3 {
        width: 200px;
        height: 200px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  .login-card-wrapper {
    position: relative;
    z-index: 1;
    animation: fadeIn 0.5s ease-out;

    .login-card {
      width: 450px;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 12px;
      border: 1px solid rgba(226, 232, 240, 0.8);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

      :deep(.el-card__header) {
        padding: 35px 40px 25px;
        background: transparent;
        border-bottom: none;

        .card-header {
          text-align: center;

          .logo-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 72px;
            height: 72px;
            border-radius: 50%;
            background: linear-gradient(135deg, #409EFF 0%, #60a5fa 100%);
            margin-bottom: 16px;
            color: #fff;
          }

          h2 {
            margin: 0 0 8px;
            font-size: 26px;
            font-weight: 600;
            color: #1e293b;
          }

          .subtitle {
            margin: 0;
            font-size: 13px;
            color: #64748b;
          }
        }
      }

      :deep(.el-card__body) {
        padding: 10px 40px 35px;

        .login-form {
          .el-form-item {
            margin-bottom: 22px;

            :deep(.el-input) {
              .el-input__wrapper {
                padding-left: 40px;
                height: 46px;
                border-radius: 8px;
                background: #f8fafc;
                border: 1.5px solid #e2e8f0;
                box-shadow: none;
                transition: all 0.25s;

                &:hover {
                  background: #f1f5f9;
                  border-color: #cbd5e1;
                }

                &.is-focus {
                  background: #fff;
                  border-color: #409EFF;
                  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                }
              }

              .el-input__inner {
                font-size: 14px;
                color: #334155;
              }

              .el-input__prefix {
                left: 12px;

                .el-icon {
                  color: #94a3b8;
                  font-size: 18px;
                }
              }
            }
          }

          .login-btn {
            width: 100%;
            height: 46px;
            font-size: 16px;
            font-weight: 500;
            letter-spacing: 4px;
            border-radius: 8px;
            background: linear-gradient(135deg, #409EFF 0%, #60a5fa 100%);
            border: none;
            transition: all 0.25s;
            box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);

            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
            }

            &:active {
              transform: translateY(0);
            }
          }

          .no-account-tip {
            width: 100%;
            text-align: center;
            color: #64748b;
            font-size: 13px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;

            .tip-icon {
              color: #94a3b8;
              font-size: 16px;
            }
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media screen and (max-width: 768px) {
  .login-card-wrapper {
    .login-card {
      width: 90% !important;

      :deep(.el-card__header),
      :deep(.el-card__body) {
        padding-left: 24px;
        padding-right: 24px;
      }
    }
  }
}
</style>
