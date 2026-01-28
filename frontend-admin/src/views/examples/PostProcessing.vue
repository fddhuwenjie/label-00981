<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><PictureFilled /></el-icon>
        后处理效果
      </h1>
      <p class="page-description">
        使用 Three.js EffectComposer 和 BloomPass 实现真正的后处理效果，
        包括辉光（Bloom）、暗角（Vignette）、色彩校正等，让 3D 场景更加生动和电影感。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="[6, 4, 6]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 发光球体组 -->
        <TresMesh
          v-for="(sphere, index) in glowingSpheres"
          :key="index"
          :position="sphere.position"
        >
          <TresSphereGeometry :args="[sphere.size, 32, 32]" />
          <TresMeshStandardMaterial
            :color="sphere.color"
            :emissive="sphere.color"
            :emissive-intensity="emissiveIntensity"
          />
        </TresMesh>
        
        <!-- 中心几何体 -->
        <TresMesh :position="[0, 1, 0]" :rotation="centerRotation">
          <TresIcosahedronGeometry :args="[1.5, 1]" />
          <TresMeshStandardMaterial
            color="#6366f1"
            :emissive="'#6366f1'"
            :emissive-intensity="emissiveIntensity * 0.5"
            :metalness="0.8"
            :roughness="0.2"
            :wireframe="wireframeMode"
          />
        </TresMesh>
        
        <!-- 环绕的小球 -->
        <TresMesh
          v-for="(orb, index) in orbitingOrbs"
          :key="'orb-' + index"
          :position="orb.position"
        >
          <TresSphereGeometry :args="[0.2, 16, 16]" />
          <TresMeshStandardMaterial
            :color="orb.color"
            :emissive="orb.color"
            :emissive-intensity="emissiveIntensity"
          />
        </TresMesh>
        
        <!-- 地面 -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
          <TresPlaneGeometry :args="[20, 20]" />
          <TresMeshStandardMaterial
            color="#0a0a15"
            :metalness="0.5"
            :roughness="0.8"
          />
        </TresMesh>
        
        <TresPointLight
          v-for="(sphere, index) in glowingSpheres"
          :key="'light-' + index"
          :position="sphere.position"
          :color="sphere.color"
          :intensity="lightIntensity"
          :distance="5"
        />
        
        <TresAmbientLight :intensity="ambientIntensity" />
        
        <!-- 后处理效果 -->
        <Suspense>
          <EffectComposerPmndrs>
            <BloomPmndrs
              v-if="bloomEnabled"
              :intensity="bloomIntensity"
              :luminance-threshold="0.2"
              :luminance-smoothing="0.9"
            />
            <VignettePmndrs
              v-if="vignetteEnabled"
              :darkness="vignetteIntensity"
              :offset="vignetteIntensity * 0.5"
            />
            <HueSaturationPmndrs :saturation="saturationValue" />
          </EffectComposerPmndrs>
        </Suspense>
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        后处理参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>辉光效果：</label>
            <el-switch v-model="bloomEnabled" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>辉光强度: {{ bloomIntensity.toFixed(2) }}</label>
            <el-slider v-model="bloomIntensity" :min="0" :max="3" :step="0.1" :disabled="!bloomEnabled" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>暗角效果：</label>
            <el-switch v-model="vignetteEnabled" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>暗角强度: {{ vignetteIntensity.toFixed(2) }}</label>
            <el-slider v-model="vignetteIntensity" :min="0" :max="1" :step="0.01" :disabled="!vignetteEnabled" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
        <el-col :span="6">
          <div class="control-item">
            <label>发光强度: {{ emissiveIntensity.toFixed(1) }}</label>
            <el-slider v-model="emissiveIntensity" :min="0" :max="3" :step="0.1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>环境光: {{ ambientIntensity.toFixed(2) }}</label>
            <el-slider v-model="ambientIntensity" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>饱和度: {{ saturation.toFixed(2) }}</label>
            <el-slider v-model="saturation" :min="0" :max="2" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>线框模式：</label>
            <el-switch v-model="wireframeMode" />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="effect-presets">
      <h4>快捷预设</h4>
      <div class="preset-buttons">
        <el-button @click="applyPreset('neon')">霓虹灯</el-button>
        <el-button @click="applyPreset('cinematic')">电影感</el-button>
        <el-button @click="applyPreset('minimal')">极简</el-button>
        <el-button @click="applyPreset('vibrant')">鲜艳</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { EffectComposerPmndrs, BloomPmndrs, VignettePmndrs, HueSaturationPmndrs } from '@tresjs/post-processing'
import { PictureFilled, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface GlowingSphere {
  position: [number, number, number]
  color: string
  size: number
}

interface OrbitingOrb {
  position: [number, number, number]
  color: string
  angle: number
  radius: number
  speed: number
}

const bloomEnabled = ref(true)
const bloomIntensity = ref(1.5)
const vignetteEnabled = ref(true)
const vignetteIntensity = ref(0.4)
const emissiveIntensity = ref(1.5)
const lightIntensity = ref(1.0)
const ambientIntensity = ref(0.2)
const saturation = ref(1.2)
const wireframeMode = ref(false)

// 将 UI 的 0~2 映射到 shader 的 -1~1
const saturationValue = computed(() => saturation.value - 1)

const centerRotation = ref<[number, number, number]>([0, 0, 0])

const glowingSpheres = ref<GlowingSphere[]>([
  { position: [-3, 0.5, -3], color: '#ef4444', size: 0.5 },
  { position: [3, 0.5, -3], color: '#22d3ee', size: 0.5 },
  { position: [-3, 0.5, 3], color: '#a855f7', size: 0.5 },
  { position: [3, 0.5, 3], color: '#10b981', size: 0.5 },
  { position: [0, 3, 0], color: '#f59e0b', size: 0.4 }
])

const orbitingOrbs = ref<OrbitingOrb[]>([])

let animationId: number
let time = 0

// 创建环绕小球
for (let i = 0; i < 8; i++) {
  orbitingOrbs.value.push({
    position: [0, 1, 0],
    color: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][i % 4],
    angle: (i / 8) * Math.PI * 2,
    radius: 2.5 + (i % 2) * 0.5,
    speed: 0.5 + Math.random() * 0.5
  })
}

onMounted(() => {
  const animate = () => {
    time += 0.016
    centerRotation.value = [time * 0.2, time * 0.3, time * 0.1]
    
    // 更新环绕小球位置
    orbitingOrbs.value.forEach((orb, index) => {
      const angle = orb.angle + time * orb.speed
      orb.position = [
        Math.cos(angle) * orb.radius,
        1 + Math.sin(time * 2 + index) * 0.3,
        Math.sin(angle) * orb.radius
      ]
    })
    
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

const applyPreset = (preset: string) => {
  switch (preset) {
    case 'neon':
      bloomEnabled.value = true
      bloomIntensity.value = 2.5
      vignetteEnabled.value = true
      vignetteIntensity.value = 0.5
      emissiveIntensity.value = 2.5
      saturation.value = 1.5
      break
    case 'cinematic':
      bloomEnabled.value = true
      bloomIntensity.value = 1.2
      vignetteEnabled.value = true
      vignetteIntensity.value = 0.6
      emissiveIntensity.value = 1.0
      saturation.value = 0.9
      break
    case 'minimal':
      bloomEnabled.value = false
      vignetteEnabled.value = false
      emissiveIntensity.value = 0.5
      saturation.value = 1.0
      break
    case 'vibrant':
      bloomEnabled.value = true
      bloomIntensity.value = 2.0
      vignetteEnabled.value = false
      emissiveIntensity.value = 2.0
      saturation.value = 1.8
      break
  }
  ElMessage.success(`已应用 "${preset}" 预设`)
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

.effect-presets {
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
