<template>
  <aside class="app-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <el-button
        :icon="isCollapsed ? Expand : Fold"
        text
        class="collapse-btn"
        @click="toggleCollapse"
      />
    </div>
    
    <el-scrollbar class="sidebar-menu">
      <el-menu
        :default-active="currentRoute"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="menu"
      >
        <el-menu-item
          v-for="route in menuRoutes"
          :key="route.path"
          :index="route.path"
        >
          <el-icon><component :is="route.meta?.icon" /></el-icon>
          <template #title>
            <span>{{ route.meta?.title }}</span>
          </template>
        </el-menu-item>
      </el-menu>
    </el-scrollbar>
    
    <div class="sidebar-footer">
      <div class="version-info" v-if="!isCollapsed">
        <div class="version-item">
          <span class="label">Vue</span>
          <span class="value">3.5.17</span>
        </div>
        <div class="version-item">
          <span class="label">Tres.js</span>
          <span class="value">5.2.0</span>
        </div>
        <div class="version-item">
          <span class="label">Three.js</span>
          <span class="value">0.181.2</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Expand, Fold } from '@element-plus/icons-vue'
import router from '@/router'

const route = useRoute()
const isCollapsed = ref(false)

const currentRoute = computed(() => route.path)

const menuRoutes = computed(() => {
  return router.options.routes
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style lang="scss" scoped>
.app-sidebar {
  width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 1px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      transparent,
      var(--color-primary),
      var(--color-secondary),
      transparent
    );
    opacity: 0.3;
  }
  
  &.collapsed {
    width: 64px;
    
    .version-info {
      display: none;
    }
  }
}

.sidebar-header {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-light);
}

.collapse-btn {
  color: var(--text-muted);
  
  &:hover {
    color: var(--color-primary);
    background: rgba(99, 102, 241, 0.1);
  }
}

.sidebar-menu {
  flex: 1;
  padding: var(--spacing-sm) 0;
}

.menu {
  border: none;
  background: transparent;
  
  --el-menu-bg-color: transparent;
  --el-menu-hover-bg-color: rgba(59, 130, 246, 0.1);
  --el-menu-active-color: var(--color-primary);
  --el-menu-text-color: var(--text-secondary);
  --el-menu-hover-text-color: var(--text-primary);
  --el-menu-item-height: 48px;
  
  :deep(.el-menu-item) {
    margin: 4px 8px;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    
    &:hover {
      background: rgba(59, 130, 246, 0.1);
      transform: translateX(4px);
    }
    
    &.is-active {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%);
      border-left: 3px solid var(--color-primary);
      color: var(--color-primary);
      
      .el-icon {
        color: var(--color-primary);
      }
    }
    
    .el-icon {
      margin-right: var(--spacing-sm);
      font-size: 18px;
      color: var(--text-muted);
      transition: color var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    span {
      font-size: var(--text-sm);
      font-weight: 500;
      line-height: 1;
    }
  }
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color-light);
}

.version-info {
  background: rgba(30, 30, 60, 0.5);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm);
  
  .version-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) 0;
    font-size: var(--text-xs);
    
    &:not(:last-child) {
      border-bottom: 1px solid var(--border-color-light);
    }
    
    .label {
      color: var(--text-muted);
    }
    
    .value {
      color: var(--color-accent);
      font-family: var(--font-mono);
    }
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    height: calc(100vh - 64px);
    z-index: 99;
    transform: translateX(-100%);
    
    &.expanded {
      transform: translateX(0);
    }
  }
}
</style>


