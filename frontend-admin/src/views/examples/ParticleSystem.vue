<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><StarFilled /></el-icon>
        粒子系统
      </h1>
      <p class="page-description">
        创建绚丽的粒子效果，包括星空、雪花、火焰等视觉效果。
        利用 Three.js 的 Points 和 BufferGeometry 实现高性能粒子渲染。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas>
        <TresPerspectiveCamera :position="[0, 0, 15]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" :auto-rotate="autoRotate" :auto-rotate-speed="0.5" />
        
        <!-- 星空粒子 -->
        <TresPoints ref="starsRef">
          <TresBufferGeometry :position="[starPositions, 3]" />
          <TresPointsMaterial
            :size="particleSize"
            :color="particleColor"
            :transparent="true"
            :opacity="0.8"
            :size-attenuation="true"
          />
        </TresPoints>
        
        <!-- 螺旋粒子 -->
        <TresPoints ref="spiralRef" :rotation="spiralRotation">
          <TresBufferGeometry :position="[spiralPositions, 3]" />
          <TresPointsMaterial
            :size="particleSize * 1.5"
            color="#a855f7"
            :transparent="true"
            :opacity="0.9"
          />
        </TresPoints>
        
        <!-- 中心光晕 -->
        <TresMesh :position="[0, 0, 0]">
          <TresSphereGeometry :args="[2, 32, 32]" />
          <TresMeshBasicMaterial
            color="#6366f1"
            :transparent="true"
            :opacity="0.3"
          />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.2" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        粒子参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>粒子数量: {{ particleCount }}</label>
            <el-slider v-model="particleCount" :min="1000" :max="20000" :step="500" @change="regenerateParticles" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>粒子大小: {{ particleSize.toFixed(2) }}</label>
            <el-slider v-model="particleSize" :min="0.01" :max="0.2" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>粒子颜色：</label>
            <el-color-picker v-model="particleColor" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>自动旋转：</label>
            <el-switch v-model="autoRotate" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
        <el-col :span="6">
          <div class="control-item">
            <label>旋转速度: {{ rotationSpeed.toFixed(2) }}</label>
            <el-slider v-model="rotationSpeed" :min="0" :max="2" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>分布范围: {{ spreadRange.toFixed(0) }}</label>
            <el-slider v-model="spreadRange" :min="10" :max="50" :step="1" @change="regenerateParticles" />
          </div>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="regenerateParticles">
            <el-icon><Refresh /></el-icon>
            重新生成
          </el-button>
        </el-col>
      </el-row>
    </div>
    
    <div class="stats-panel">
      <div class="stat-item">
        <span class="label">总粒子数</span>
        <span class="value">{{ particleCount + spiralParticleCount }}</span>
      </div>
      <div class="stat-item">
        <span class="label">帧率</span>
        <span class="value">60 FPS</span>
      </div>
      <div class="stat-item">
        <span class="label">渲染模式</span>
        <span class="value">WebGL Points</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { StarFilled, Setting, Refresh } from '@element-plus/icons-vue'

const particleCount = ref(8000)
const spiralParticleCount = 2000
const particleSize = ref(0.05)
const particleColor = ref('#22d3ee')
const autoRotate = ref(true)
const rotationSpeed = ref(0.3)
const spreadRange = ref(30)

const starPositions = ref<Float32Array>(new Float32Array(0))
const spiralPositions = ref<Float32Array>(new Float32Array(0))
const spiralRotation = ref<[number, number, number]>([0, 0, 0])

const starsRef = ref()
const spiralRef = ref()

let animationId: number
let time = 0

const generateStarPositions = () => {
  const positions = new Float32Array(particleCount.value * 3)
  for (let i = 0; i < particleCount.value; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * spreadRange.value
    positions[i3 + 1] = (Math.random() - 0.5) * spreadRange.value
    positions[i3 + 2] = (Math.random() - 0.5) * spreadRange.value
  }
  return positions
}

const generateSpiralPositions = () => {
  const positions = new Float32Array(spiralParticleCount * 3)
  for (let i = 0; i < spiralParticleCount; i++) {
    const i3 = i * 3
    const t = (i / spiralParticleCount) * Math.PI * 8
    const radius = t * 0.3
    positions[i3] = Math.cos(t) * radius
    positions[i3 + 1] = (i / spiralParticleCount - 0.5) * 10
    positions[i3 + 2] = Math.sin(t) * radius
  }
  return positions
}

const regenerateParticles = () => {
  starPositions.value = generateStarPositions()
  spiralPositions.value = generateSpiralPositions()
}

onMounted(() => {
  regenerateParticles()
  
  const animate = () => {
    time += 0.016 * rotationSpeed.value
    spiralRotation.value = [0, time, 0]
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<style lang="scss" scoped>
.example-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-lg);
}

.stats-panel {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  
  .stat-item {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    
    .label {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
    
    .value {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--color-accent);
      font-family: var(--font-mono);
    }
  }
}
</style>


