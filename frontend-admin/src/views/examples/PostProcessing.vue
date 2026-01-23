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
      <TresCanvas shadows ref="canvasRef">
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { PictureFilled, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { VignetteShader } from 'three/examples/jsm/shaders/VignetteShader.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

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

const canvasRef = ref()
const bloomEnabled = ref(true)
const bloomIntensity = ref(1.5)
const vignetteEnabled = ref(true)
const vignetteIntensity = ref(0.4)
const emissiveIntensity = ref(1.5)
const lightIntensity = ref(1.0)
const ambientIntensity = ref(0.2)
const saturation = ref(1.2)
const wireframeMode = ref(false)

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
let composer: EffectComposer | null = null
let renderPass: RenderPass | null = null
let bloomPass: UnrealBloomPass | null = null
let vignettePass: ShaderPass | null = null
let outputPass: OutputPass | null = null

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

const initPostProcessing = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera) => {
  // 创建后处理合成器
  composer = new EffectComposer(renderer)
  
  // 渲染通道
  renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)
  
  // Bloom 通道 (UnrealBloomPass)
  const size = new THREE.Vector2(
    renderer.domElement.width,
    renderer.domElement.height
  )
  bloomPass = new UnrealBloomPass(size, bloomIntensity.value, 0.4, 0.85)
  composer.addPass(bloomPass)
  
  // Vignette 通道
  vignettePass = new ShaderPass(VignetteShader)
  vignettePass.uniforms.offset.value = vignetteIntensity.value
  vignettePass.uniforms.darkness.value = vignetteIntensity.value
  composer.addPass(vignettePass)
  
  // 输出通道
  outputPass = new OutputPass()
  outputPass.renderToScreen = true
  composer.addPass(outputPass)
}

onMounted(async () => {
  // 等待下一帧确保canvas已初始化
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // 通过 canvasRef 获取 TresCanvas 的上下文
  if (canvasRef.value) {
    const context = canvasRef.value.context
    if (context) {
      const { renderer, scene, camera } = context
      if (renderer?.value && scene?.value && camera?.value) {
        initPostProcessing(renderer.value, scene.value, camera.value)
      }
    }
  }
  
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
    
    // 更新后处理效果
    if (composer) {
      if (bloomPass) {
        bloomPass.enabled = bloomEnabled.value
        bloomPass.strength = bloomEnabled.value ? bloomIntensity.value : 0
      }
      if (vignettePass) {
        vignettePass.enabled = vignetteEnabled.value
        vignettePass.uniforms.offset.value = vignetteIntensity.value
        vignettePass.uniforms.darkness.value = vignetteIntensity.value
      }
      
      composer.render()
    }
    
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (composer) {
    composer.dispose()
  }
})

watch(bloomEnabled, (enabled) => {
  if (bloomPass) {
    bloomPass.enabled = enabled
  }
})

watch(vignetteEnabled, (enabled) => {
  if (vignettePass) {
    vignettePass.enabled = enabled
  }
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
