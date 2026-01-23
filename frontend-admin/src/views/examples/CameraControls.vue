<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Camera /></el-icon>
        相机控制
      </h1>
      <p class="page-description">
        探索多种相机交互模式，包括轨道控制、第一人称视角、飞行模式等。
        学习如何实现流畅的相机动画和过渡效果。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas shadows>
        <TresPerspectiveCamera
          ref="cameraRef"
          :position="cameraPosition"
          :look-at="lookAtTarget"
          :fov="fov"
        />
        
        <!-- 轨道控制 -->
        <OrbitControls
          v-if="controlMode === 'orbit'"
          :enable-damping="true"
          :damping-factor="dampingFactor"
          :enable-zoom="enableZoom"
          :enable-pan="enablePan"
          :auto-rotate="autoRotate"
          :auto-rotate-speed="autoRotateSpeed"
          :min-distance="minDistance"
          :max-distance="maxDistance"
        />
        
        <!-- 场景内容 -->
        <TresGroup>
          <!-- 中心展台 -->
          <TresMesh :position="[0, 0.5, 0]" cast-shadow>
            <TresCylinderGeometry :args="[3, 3, 1, 64]" />
            <TresMeshStandardMaterial color="#1a1a3e" :metalness="0.5" :roughness="0.7" />
          </TresMesh>
          
          <!-- 展示物体 -->
          <TresMesh :position="[0, 2.5, 0]" :rotation="objectRotation" cast-shadow>
            <TresIcosahedronGeometry :args="[1.5, 0]" />
            <TresMeshStandardMaterial
              color="#6366f1"
              :metalness="0.8"
              :roughness="0.2"
            />
          </TresMesh>
          
          <!-- 环绕球体 -->
          <TresMesh
            v-for="(sphere, index) in orbitingSpheres"
            :key="index"
            :position="sphere.position"
            cast-shadow
          >
            <TresSphereGeometry :args="[0.3, 32, 32]" />
            <TresMeshStandardMaterial :color="sphere.color" :metalness="0.6" :roughness="0.3" />
          </TresMesh>
        </TresGroup>
        
        <!-- 场景装饰 -->
        <TresMesh
          v-for="(pillar, index) in pillars"
          :key="'pillar-' + index"
          :position="pillar.position"
          cast-shadow
        >
          <TresCylinderGeometry :args="[0.5, 0.5, pillar.height, 16]" />
          <TresMeshStandardMaterial color="#0f0f23" :metalness="0.4" :roughness="0.6" />
        </TresMesh>
        
        <!-- 地面 -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
          <TresPlaneGeometry :args="[50, 50]" />
          <TresMeshStandardMaterial color="#0a0a15" />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.3" />
        <TresDirectionalLight :position="[10, 15, 10]" :intensity="1" cast-shadow />
        <TresSpotLight :position="[0, 10, 0]" :intensity="0.8" :angle="0.5" :penumbra="0.5" />
        
        <TresGridHelper :args="[50, 50, '#6366f1', '#1a1a3e']" />
      </TresCanvas>
      
      <!-- 相机信息叠加层 -->
      <div class="camera-info">
        <div class="info-item">
          <span class="label">位置</span>
          <span class="value">
            X: {{ cameraPosition[0].toFixed(1) }}
            Y: {{ cameraPosition[1].toFixed(1) }}
            Z: {{ cameraPosition[2].toFixed(1) }}
          </span>
        </div>
        <div class="info-item">
          <span class="label">FOV</span>
          <span class="value">{{ fov }}°</span>
        </div>
        <div class="info-item">
          <span class="label">模式</span>
          <span class="value">{{ controlModeLabels[controlMode] }}</span>
        </div>
      </div>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        相机参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>控制模式：</label>
            <CustomSelect
              v-model="controlMode"
              :options="controlModeOptions"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>视场角 (FOV): {{ fov }}°</label>
            <el-slider v-model="fov" :min="30" :max="120" :step="1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>阻尼系数: {{ dampingFactor.toFixed(2) }}</label>
            <el-slider v-model="dampingFactor" :min="0.01" :max="0.2" :step="0.01" />
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
            <label>旋转速度: {{ autoRotateSpeed.toFixed(1) }}</label>
            <el-slider v-model="autoRotateSpeed" :min="0.5" :max="5" :step="0.1" :disabled="!autoRotate" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>最小距离: {{ minDistance }}</label>
            <el-slider v-model="minDistance" :min="1" :max="10" :step="0.5" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>最大距离: {{ maxDistance }}</label>
            <el-slider v-model="maxDistance" :min="20" :max="100" :step="5" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>启用缩放：</label>
            <el-switch v-model="enableZoom" />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="camera-presets">
      <h4>视角预设</h4>
      <div class="preset-buttons">
        <el-button @click="setCameraPreset('front')">正面视角</el-button>
        <el-button @click="setCameraPreset('top')">俯视视角</el-button>
        <el-button @click="setCameraPreset('side')">侧面视角</el-button>
        <el-button @click="setCameraPreset('isometric')">等距视角</el-button>
        <el-button @click="setCameraPreset('close')">近景特写</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Camera, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import CustomSelect from '@/components/common/CustomSelect.vue'

interface OrbitingSphere {
  position: [number, number, number]
  color: string
  angle: number
  radius: number
  speed: number
  yOffset: number
}

interface Pillar {
  position: [number, number, number]
  height: number
}

const controlMode = ref('orbit')
const fov = ref(60)
const dampingFactor = ref(0.05)
const autoRotate = ref(false)
const autoRotateSpeed = ref(2.0)
const minDistance = ref(5)
const maxDistance = ref(50)
const enableZoom = ref(true)
const enablePan = ref(true)

const cameraPosition = ref<[number, number, number]>([12, 8, 12])
const lookAtTarget = ref<[number, number, number]>([0, 2, 0])
const objectRotation = ref<[number, number, number]>([0, 0, 0])

const cameraRef = ref()

const controlModeLabels: Record<string, string> = {
  orbit: '轨道控制',
  fixed: '固定视角'
}

const controlModeOptions = computed(() => [
  { label: '轨道控制', value: 'orbit' },
  { label: '固定视角', value: 'fixed' }
])

const orbitingSpheres = ref<OrbitingSphere[]>([])
const pillars = ref<Pillar[]>([])

let animationId: number
let time = 0

const colors = ['#6366f1', '#a855f7', '#22d3ee', '#f59e0b', '#10b981']

const createScene = () => {
  // 创建环绕球体
  for (let i = 0; i < 5; i++) {
    orbitingSpheres.value.push({
      position: [0, 2, 0],
      color: colors[i],
      angle: (i / 5) * Math.PI * 2,
      radius: 3,
      speed: 0.5 + i * 0.1,
      yOffset: i * 0.3
    })
  }
  
  // 创建柱子
  const pillarCount = 8
  const pillarRadius = 10
  for (let i = 0; i < pillarCount; i++) {
    const angle = (i / pillarCount) * Math.PI * 2
    const height = 3 + Math.random() * 4
    pillars.value.push({
      position: [
        Math.cos(angle) * pillarRadius,
        height / 2,
        Math.sin(angle) * pillarRadius
      ],
      height
    })
  }
}

const setCameraPreset = (preset: string) => {
  switch (preset) {
    case 'front':
      cameraPosition.value = [0, 5, 15]
      break
    case 'top':
      cameraPosition.value = [0, 20, 0.1]
      break
    case 'side':
      cameraPosition.value = [15, 5, 0]
      break
    case 'isometric':
      cameraPosition.value = [12, 12, 12]
      break
    case 'close':
      cameraPosition.value = [4, 4, 4]
      break
  }
  ElMessage.success(`已切换到 ${preset} 视角`)
}

onMounted(() => {
  createScene()
  
  const animate = () => {
    time += 0.016
    
    // 更新物体旋转
    objectRotation.value = [time * 0.2, time * 0.3, time * 0.1]
    
    // 更新环绕球体
    orbitingSpheres.value.forEach((sphere) => {
      const angle = sphere.angle + time * sphere.speed
      sphere.position = [
        Math.cos(angle) * sphere.radius,
        2.5 + Math.sin(time * 2 + sphere.yOffset) * 0.5,
        Math.sin(angle) * sphere.radius
      ]
    })
    
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

.canvas-container {
  position: relative;
}

.camera-info {
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  background: rgba(15, 15, 35, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  
  .info-item {
    display: flex;
    justify-content: space-between;
    gap: var(--spacing-md);
    padding: var(--spacing-xs) 0;
    font-size: var(--text-sm);
    
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

.camera-presets {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  
  h4 {
    font-size: var(--text-base);
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
  }
  
  .preset-buttons {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
}
</style>


