<template>
  <el-config-provider :locale="zhCn">
    <div class="app-container">
      <AppHeader />
      <div class="main-wrapper">
        <AppSidebar />
        <main class="content-area">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </main>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<style lang="scss" scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d1f 100%);
  overflow: hidden;
}

.main-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: transparent;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>


