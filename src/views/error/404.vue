<template>
  <div class="error-page">
    <div class="error-content">
      <h1>404</h1>
      <p>页面不存在</p>
      <el-button type="primary" @click="$router.push('/')">
        返回首页
      </el-button>
    </div>
  </div>
</template>

<script setup>
</script>

<style lang="less" scoped>
.error-page {
  .flex-center();
  min-height: 100vh;
  
  .error-content {
    text-align: center;
    
    h1 {
      font-size: 120px;
      color: @primary-color;
      margin-bottom: 20px;
    }
    
    p {
      font-size: 18px;
      color: @text-color-secondary;
      margin-bottom: 30px;
    }
  }
}
</style>

