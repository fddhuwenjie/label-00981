<template>
  <div v-if="loading" class="canvas-loading">
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      <p class="loading-text">加载 3D 场景中...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)

onMounted(() => {
  // 延迟隐藏loading，确保场景已渲染
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style lang="scss" scoped>
.canvas-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: var(--radius-lg);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  &:nth-child(1) {
    animation-delay: 0s;
  }
  
  &:nth-child(2) {
    width: 80%;
    height: 80%;
    top: 10%;
    left: 10%;
    border-top-color: var(--color-secondary);
    animation-duration: 1.5s;
    animation-direction: reverse;
  }
  
  &:nth-child(3) {
    width: 60%;
    height: 60%;
    top: 20%;
    left: 20%;
    border-top-color: var(--color-accent);
    animation-duration: 2s;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  margin: 0;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
</style>

