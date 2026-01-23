<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo" @click="router.push('/')">
        <div class="logo-icon">
          <el-icon :size="28"><Box /></el-icon>
        </div>
        <div class="logo-text">
          <span class="title">Tres.js</span>
          <span class="subtitle">高级示例展示</span>
        </div>
      </div>
    </div>
    
    <div class="header-right">
      <el-tooltip content="GitHub 仓库" placement="bottom">
        <el-button :icon="Link" circle class="action-btn" @click="openGitHub" />
      </el-tooltip>
      <el-tooltip content="文档" placement="bottom">
        <el-button :icon="Document" circle class="action-btn" @click="openDocs" />
      </el-tooltip>
      <el-tooltip content="刷新" placement="bottom">
        <el-button :icon="Refresh" circle class="action-btn" @click="handleRefresh" />
      </el-tooltip>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Box,
  Link,
  Document,
  Refresh
} from '@element-plus/icons-vue'

const router = useRouter()

const openGitHub = () => {
  window.open('https://github.com/Tresjs/tres', '_blank')
}

const openDocs = () => {
  window.open('https://tresjs.org/', '_blank')
}

const handleRefresh = () => {
  location.reload()
}
</script>

<style lang="scss" scoped>
.app-header {
  height: 64px;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  line-height: 1;
  
  &:hover {
    background: rgba(59, 130, 246, 0.1);
    
    .logo-icon {
      transform: rotate(10deg) scale(1.1);
    }
  }
  
  .logo-icon {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: transform var(--transition-normal);
  }
  
  .logo-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .title {
      font-size: var(--text-lg);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
      background: linear-gradient(135deg, #fff 0%, var(--color-accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      font-size: var(--text-xs);
      color: var(--text-muted);
      line-height: 1;
    }
  }
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.action-btn {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(6, 182, 212, 0.25) 100%);
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    border-color: var(--color-primary);
    color: white;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 
      0 8px 24px rgba(59, 130, 246, 0.5),
      0 0 20px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    &::before {
      left: 100%;
    }
    
    :deep(.el-icon) {
      color: white !important;
    }
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  :deep(.el-icon) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.el-divider {
  border-color: var(--border-color);
  margin: 0 var(--spacing-sm);
}

.user-avatar {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
  }
  
  .el-avatar {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
    color: white;
  }
  
  .user-name {
    font-size: var(--text-sm);
    color: var(--text-primary);
  }
  
  .el-icon {
    color: var(--text-muted);
    font-size: 12px;
  }
}

</style>


