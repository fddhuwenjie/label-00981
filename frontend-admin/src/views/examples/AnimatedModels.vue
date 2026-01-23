<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><VideoPlay /></el-icon>
        动画模型
      </h1>
      <p class="page-description">
        使用 Tres.js 实现流畅的 3D 动画效果，包括旋转、缩放、位移等变换动画，
        以及使用 useRenderLoop 实现帧动画。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="[8, 6, 8]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 旋转的立方体组 -->
        <TresGroup ref="cubeGroupRef">
          <TresMesh
            v-for="(cube, index) in animatedCubes"
            :key="index"
            :position="cube.position"
            :rotation="cube.rotation"
            cast-shadow
          >
            <TresBoxGeometry :args="[1, 1, 1]" />
            <TresMeshStandardMaterial
              :color="cube.color"
              :metalness="0.6"
              :roughness="0.3"
            />
          </TresMesh>
        </TresGroup>
        
        <!-- 弹跳的球体 -->
        <TresMesh :position="bouncingBallPosition" cast-shadow>
          <TresSphereGeometry :args="[0.8, 32, 32]" />
          <TresMeshStandardMaterial color="#22d3ee" :metalness="0.8" :roughness="0.2" />
        </TresMesh>
        
        <!-- 脉动的圆环 -->
        <TresMesh :position="[0, 2, 0]" :scale="torusScale">
          <TresTorusGeometry :args="[2, 0.3, 16, 100]" />
          <TresMeshStandardMaterial
            color="#a855f7"
            :metalness="0.5"
            :roughness="0.4"
            :wireframe="wireframe"
          />
        </TresMesh>
        
        <!-- 地面 -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
          <TresPlaneGeometry :args="[30, 30]" />
          <TresMeshStandardMaterial color="#0f0f23" />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.3" />
        <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.2" cast-shadow />
        <TresPointLight :position="[0, 5, 0]" color="#6366f1" :intensity="0.8" />
        
        <TresGridHelper :args="[30, 30, '#6366f1', '#1a1a3e']" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        动画控制
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>旋转速度: {{ rotationSpeed.toFixed(2) }}</label>
            <el-slider v-model="rotationSpeed" :min="0" :max="2" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>弹跳高度: {{ bounceHeight.toFixed(1) }}</label>
            <el-slider v-model="bounceHeight" :min="1" :max="5" :step="0.1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>脉动幅度: {{ pulseAmplitude.toFixed(2) }}</label>
            <el-slider v-model="pulseAmplitude" :min="0" :max="0.5" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>线框模式：</label>
            <el-switch v-model="wireframe" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
        <el-col :span="12">
          <el-button
            :type="isPlaying ? 'danger' : 'primary'"
            @click="toggleAnimation"
          >
            <el-icon><component :is="isPlaying ? 'VideoPause' : 'VideoPlay'" /></el-icon>
            {{ isPlaying ? '暂停动画' : '播放动画' }}
          </el-button>
          <el-button @click="resetAnimation">
            <el-icon><RefreshRight /></el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { VideoPlay, Setting, RefreshRight } from '@element-plus/icons-vue'

interface AnimatedCube {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
  speed: number
}

const rotationSpeed = ref(0.5)
const bounceHeight = ref(3)
const pulseAmplitude = ref(0.2)
const wireframe = ref(false)
const isPlaying = ref(true)

const animatedCubes = ref<AnimatedCube[]>([])
const bouncingBallPosition = ref<[number, number, number]>([-5, 1, 0])
const torusScale = ref<[number, number, number]>([1, 1, 1])
const cubeGroupRef = ref()

let time = 0
let animationId: number

const colors = ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#f59e0b', '#ef4444']

onMounted(() => {
  // 创建围绕中心的立方体
  const radius = 5
  const count = 8
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    animatedCubes.value.push({
      position: [Math.cos(angle) * radius, 1, Math.sin(angle) * radius],
      rotation: [0, 0, 0],
      color: colors[i % colors.length],
      speed: 0.5 + Math.random() * 0.5
    })
  }
  
  animate()
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

const animate = () => {
  if (isPlaying.value) {
    time += 0.016
    
    // 更新立方体旋转和位置
    animatedCubes.value.forEach((cube, index) => {
      const angle = (index / animatedCubes.value.length) * Math.PI * 2 + time * rotationSpeed.value
      cube.position = [Math.cos(angle) * 5, 1 + Math.sin(time * 2 + index) * 0.5, Math.sin(angle) * 5]
      cube.rotation = [time * cube.speed, time * cube.speed * 0.7, 0]
    })
    
    // 弹跳球体
    const bounceY = 1 + Math.abs(Math.sin(time * 3)) * bounceHeight.value
    bouncingBallPosition.value = [-5, bounceY, 0]
    
    // 脉动圆环
    const scale = 1 + Math.sin(time * 2) * pulseAmplitude.value
    torusScale.value = [scale, scale, scale]
  }
  
  animationId = requestAnimationFrame(animate)
}

const toggleAnimation = () => {
  isPlaying.value = !isPlaying.value
}

const resetAnimation = () => {
  time = 0
  rotationSpeed.value = 0.5
  bounceHeight.value = 3
  pulseAmplitude.value = 0.2
}
</script>

<style lang="scss" scoped>
.example-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--spacing-lg);
}
</style>


