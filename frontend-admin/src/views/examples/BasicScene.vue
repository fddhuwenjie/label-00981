<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Box /></el-icon>
        基础场景
      </h1>
      <p class="page-description">
        学习如何使用 Tres.js 创建基本的 3D 场景，包括几何体、材质、灯光和相机的配置。
        这是所有 3D 开发的基础，掌握后可以构建更复杂的场景。
      </p>
    </div>
    
    <div class="canvas-container">
      <CanvasLoading />
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="[5, 5, 5]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" :damping-factor="0.05" />
        
        <!-- 中心立方体 -->
        <TresMesh :position="[0, 1, 0]" cast-shadow>
          <TresBoxGeometry :args="[2, 2, 2]" />
          <TresMeshStandardMaterial
            :color="cubeColor"
            :metalness="metalness"
            :roughness="roughness"
          />
        </TresMesh>
        
        <!-- 球体 -->
        <TresMesh :position="[-3, 1, 0]" cast-shadow>
          <TresSphereGeometry :args="[1, 32, 32]" />
          <TresMeshStandardMaterial color="#a855f7" :metalness="0.5" :roughness="0.3" />
        </TresMesh>
        
        <!-- 圆锥体 -->
        <TresMesh :position="[3, 1, 0]" cast-shadow>
          <TresConeGeometry :args="[1, 2, 32]" />
          <TresMeshStandardMaterial color="#22d3ee" :metalness="0.5" :roughness="0.3" />
        </TresMesh>
        
        <!-- 圆环 -->
        <TresMesh :position="[0, 1, -3]" cast-shadow>
          <TresTorusGeometry :args="[1, 0.4, 16, 100]" />
          <TresMeshStandardMaterial color="#f59e0b" :metalness="0.5" :roughness="0.3" />
        </TresMesh>
        
        <!-- 地面 -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
          <TresPlaneGeometry :args="[20, 20]" />
          <TresMeshStandardMaterial color="#1a1a3e" :side="DoubleSide" />
        </TresMesh>
        
        <!-- 灯光 -->
        <TresAmbientLight :intensity="ambientIntensity" />
        <TresDirectionalLight
          :position="[5, 8, 5]"
          :intensity="lightIntensity"
          cast-shadow
          :shadow-mapSize-width="2048"
          :shadow-mapSize-height="2048"
        />
        <TresPointLight :position="[-5, 5, -5]" color="#3b82f6" :intensity="0.5" />
        
        <TresGridHelper :args="[20, 20, '#3b82f6', '#1a1a3e']" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        参数控制
      </h3>
      <div class="control-groups">
        <!-- 材质设置 -->
        <div class="control-group">
          <div class="group-header">
            <el-icon><MagicStick /></el-icon>
            材质设置
          </div>
          <div class="group-content">
            <div class="control-item">
              <label>立方体颜色：</label>
              <el-color-picker v-model="cubeColor" size="small" />
            </div>
            <div class="control-item">
              <label>金属度：</label>
              <div class="slider-wrapper">
                <el-slider v-model="metalness" :min="0" :max="1" :step="0.01" />
                <span class="value-display">{{ metalness.toFixed(2) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>粗糙度：</label>
              <div class="slider-wrapper">
                <el-slider v-model="roughness" :min="0" :max="1" :step="0.01" />
                <span class="value-display">{{ roughness.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 灯光设置 -->
        <div class="control-group">
          <div class="group-header">
            <el-icon><Sunny /></el-icon>
            灯光设置
          </div>
          <div class="group-content">
            <div class="control-item">
              <label>环境光强度：</label>
              <div class="slider-wrapper">
                <el-slider v-model="ambientIntensity" :min="0" :max="1" :step="0.1" />
                <span class="value-display">{{ ambientIntensity.toFixed(1) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>主灯光强度：</label>
              <div class="slider-wrapper">
                <el-slider v-model="lightIntensity" :min="0" :max="2" :step="0.1" />
                <span class="value-display">{{ lightIntensity.toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="code-section">
      <h3 class="panel-title">
        <el-icon><Document /></el-icon>
        代码示例
      </h3>
      <pre class="code-block">{{ codeExample }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { DoubleSide } from 'three'
import { Box, Setting, Document, MagicStick, Sunny } from '@element-plus/icons-vue'
import CanvasLoading from '@/components/common/CanvasLoading.vue'

const cubeColor = ref('#3b82f6')
const metalness = ref(0.5)
const roughness = ref(0.4)
const lightIntensity = ref(1.0)
const ambientIntensity = ref(0.4)

const codeExample = `<template>
  <TresCanvas shadows>
    <TresPerspectiveCamera :position="[5, 5, 5]" />
    <OrbitControls />
    
    <TresMesh :position="[0, 1, 0]" cast-shadow>
      <TresBoxGeometry :args="[2, 2, 2]" />
      <TresMeshStandardMaterial
        color="#6366f1"
        :metalness="0.5"
        :roughness="0.4"
      />
    </TresMesh>
    
    <TresAmbientLight :intensity="0.4" />
    <TresDirectionalLight :position="[5, 8, 5]" cast-shadow />
  </TresCanvas>
</template>`
</script>

<style lang="scss" scoped>
.example-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.control-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.control-group {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-color-light);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  
  .group-header {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: var(--spacing-md);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color-light);
    padding-bottom: var(--spacing-sm);
    
    .el-icon {
      font-size: 16px;
    }
  }
  
  .group-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

.control-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md);
  
  label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    white-space: nowrap;
    min-width: 80px;
  }
}

.slider-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  .el-slider {
    flex: 1;
  }
  
  .value-display {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-accent);
    min-width: 35px;
    text-align: right;
  }
}

.code-section {
  margin-top: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}
</style>


