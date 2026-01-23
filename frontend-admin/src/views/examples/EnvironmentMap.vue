<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Sunny /></el-icon>
        环境贴图
      </h1>
      <p class="page-description">
        实现真实的环境反射效果，包括 HDRI 环境贴图、立方体贴图和程序化天空盒。
        让 3D 物体具有真实的金属和玻璃反射效果。
      </p>
    </div>
    
    <div class="canvas-container">
      <CanvasLoading />
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="[5, 3, 5]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 反射球体 -->
        <TresMesh :position="[0, 1.5, 0]">
          <TresSphereGeometry :args="[1.5, 64, 64]" />
          <TresMeshStandardMaterial
            :color="sphereColor"
            :metalness="metalness"
            :roughness="roughness"
            :env-map-intensity="envIntensity"
          />
        </TresMesh>
        
        <!-- 玻璃立方体 -->
        <TresMesh :position="[-3, 1, 0]" :rotation="cubeRotation">
          <TresBoxGeometry :args="[1.5, 1.5, 1.5]" />
          <TresMeshPhysicalMaterial
            :color="'#ffffff'"
            :metalness="0"
            :roughness="0"
            :transmission="transmission"
            :thickness="0.5"
            :ior="ior"
          />
        </TresMesh>
        
        <!-- 金属环 -->
        <TresMesh :position="[3, 1, 0]" :rotation="torusRotation">
          <TresTorusGeometry :args="[1, 0.4, 32, 100]" />
          <TresMeshStandardMaterial
            color="#f59e0b"
            :metalness="1"
            :roughness="0.1"
          />
        </TresMesh>
        
        <!-- 底座 -->
        <TresMesh :position="[0, 0, 0]">
          <TresCylinderGeometry :args="[4, 4, 0.2, 64]" />
          <TresMeshStandardMaterial color="#1a1a3e" :metalness="0.3" :roughness="0.7" />
        </TresMesh>
        
        <!-- 环境 -->
        <Suspense>
          <Environment :preset="selectedPreset" :background="showBackground" />
        </Suspense>
        
        <TresAmbientLight :intensity="0.3" />
        <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" cast-shadow />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        环境参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>环境预设：</label>
            <CustomSelect
              v-model="selectedPreset"
              :options="presetOptions"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>球体颜色：</label>
            <el-color-picker v-model="sphereColor" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>金属度: {{ metalness.toFixed(2) }}</label>
            <el-slider v-model="metalness" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>粗糙度: {{ roughness.toFixed(2) }}</label>
            <el-slider v-model="roughness" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
        <el-col :span="6">
          <div class="control-item">
            <label>环境强度: {{ envIntensity.toFixed(1) }}</label>
            <el-slider v-model="envIntensity" :min="0" :max="2" :step="0.1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>玻璃透射: {{ transmission.toFixed(2) }}</label>
            <el-slider v-model="transmission" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>折射率 (IOR): {{ ior.toFixed(2) }}</label>
            <el-slider v-model="ior" :min="1" :max="2.5" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>显示背景：</label>
            <el-switch v-model="showBackground" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls, Environment } from '@tresjs/cientos'
import { Sunny, Setting } from '@element-plus/icons-vue'
import CanvasLoading from '@/components/common/CanvasLoading.vue'
import CustomSelect from '@/components/common/CustomSelect.vue'

const presets = ['sunset', 'dawn', 'night', 'forest', 'studio', 'city'] as const
const presetLabels: Record<string, string> = {
  sunset: '日落',
  dawn: '黎明',
  night: '夜晚',
  forest: '森林',
  studio: '工作室',
  city: '城市'
}

const presetOptions = computed(() => {
  return presets.map(preset => ({
    label: presetLabels[preset],
    value: preset
  }))
})

const selectedPreset = ref<'sunset' | 'dawn' | 'night' | 'forest' | 'studio' | 'city'>('sunset')
const sphereColor = ref('#6366f1')
const metalness = ref(0.9)
const roughness = ref(0.1)
const envIntensity = ref(1.0)
const transmission = ref(0.9)
const ior = ref(1.5)
const showBackground = ref(true)

const cubeRotation = ref<[number, number, number]>([0, 0, 0])
const torusRotation = ref<[number, number, number]>([Math.PI / 2, 0, 0])

let animationId: number
let time = 0

onMounted(() => {
  const animate = () => {
    time += 0.01
    cubeRotation.value = [time * 0.3, time * 0.5, 0]
    torusRotation.value = [Math.PI / 2, time * 0.4, 0]
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
</style>


