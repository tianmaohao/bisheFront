<!--<script setup>-->
<!--import { computed } from 'vue'-->
<!--import { useRoute } from 'vue-router'-->
<!--import MainLayout from '@/layouts/MainLayout.vue'-->
<!--import AuthLayout from '@/layouts/AuthLayout.vue'-->

<!--const route = useRoute()-->

<!--const layout = computed(() => {-->
<!--  return route.meta.layout === 'auth' ? AuthLayout : MainLayout-->
<!--})-->
<!--</script>-->

<!--<template>-->
<!--  <component :is="layout">-->
<!--    <router-view />-->
<!--  </component>-->
<!--</template>-->

<!--<style lang="less">-->
<!--#app {-->
<!--  height: 100%;-->
<!--}-->
<!--</style>-->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <router-view />
</template>

<style lang="less">
#app {
  height: 100%;
}
</style>
