<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><MagicStick /></el-icon>
        着色器材质
      </h1>
      <p class="page-description">
        自定义 GLSL 着色器，实现独特的视觉效果。包括渐变、波浪、噪声等高级着色器技术。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas>
        <TresPerspectiveCamera :position="[0, 0, 5]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 自定义着色器平面 -->
        <TresMesh :position="[-2.5, 0, 0]">
          <TresPlaneGeometry :args="[3, 3, 64, 64]" />
          <TresShaderMaterial
            :vertex-shader="gradientVertexShader"
            :fragment-shader="gradientFragmentShader"
            :uniforms="gradientUniforms"
          />
        </TresMesh>
        
        <!-- 波浪着色器球体 -->
        <TresMesh :position="[2.5, 0, 0]" :rotation="sphereRotation">
          <TresSphereGeometry :args="[1.5, 64, 64]" />
          <TresShaderMaterial
            :vertex-shader="waveVertexShader"
            :fragment-shader="waveFragmentShader"
            :uniforms="waveUniforms"
          />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.5" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        着色器参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>颜色1：</label>
            <el-color-picker v-model="color1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>颜色2：</label>
            <el-color-picker v-model="color2" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>波浪频率: {{ waveFrequency.toFixed(1) }}</label>
            <el-slider v-model="waveFrequency" :min="1" :max="10" :step="0.1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>波浪幅度: {{ waveAmplitude.toFixed(2) }}</label>
            <el-slider v-model="waveAmplitude" :min="0" :max="0.5" :step="0.01" />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="shader-code">
      <el-tabs>
        <el-tab-pane label="渐变顶点着色器">
          <pre class="code-block">{{ gradientVertexShader }}</pre>
        </el-tab-pane>
        <el-tab-pane label="渐变片段着色器">
          <pre class="code-block">{{ gradientFragmentShader }}</pre>
        </el-tab-pane>
        <el-tab-pane label="波浪顶点着色器">
          <pre class="code-block">{{ waveVertexShader }}</pre>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Color } from 'three'
import { MagicStick, Setting } from '@element-plus/icons-vue'

const color1 = ref('#6366f1')
const color2 = ref('#22d3ee')
const waveFrequency = ref(4.0)
const waveAmplitude = ref(0.2)
const sphereRotation = ref<[number, number, number]>([0, 0, 0])

let time = 0
let animationId: number

// 渐变着色器
const gradientVertexShader = `
varying vec2 vUv;
uniform float uTime;

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += sin(pos.x * 5.0 + uTime) * 0.1;
  pos.z += sin(pos.y * 5.0 + uTime) * 0.1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`

const gradientFragmentShader = `
varying vec2 vUv;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uTime;

void main() {
  float mixValue = vUv.y + sin(vUv.x * 10.0 + uTime) * 0.1;
  vec3 color = mix(uColor1, uColor2, mixValue);
  gl_FragColor = vec4(color, 1.0);
}`

// 波浪着色器
const waveVertexShader = `
varying vec2 vUv;
varying float vElevation;
uniform float uTime;
uniform float uFrequency;
uniform float uAmplitude;

void main() {
  vUv = uv;
  vec3 pos = position;
  float elevation = sin(pos.x * uFrequency + uTime) * uAmplitude;
  elevation += sin(pos.y * uFrequency + uTime) * uAmplitude;
  pos += normal * elevation;
  vElevation = elevation;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`

const waveFragmentShader = `
varying vec2 vUv;
varying float vElevation;
uniform vec3 uColor1;
uniform vec3 uColor2;

void main() {
  float mixValue = (vElevation + 0.5) * 2.0;
  vec3 color = mix(uColor1, uColor2, clamp(mixValue, 0.0, 1.0));
  gl_FragColor = vec4(color, 1.0);
}`


const gradientUniforms = computed(() => ({
  uTime: { value: time },
  uColor1: { value: new Color(color1.value) },
  uColor2: { value: new Color(color2.value) }
}))

const waveUniforms = computed(() => ({
  uTime: { value: time },
  uFrequency: { value: waveFrequency.value },
  uAmplitude: { value: waveAmplitude.value },
  uColor1: { value: new Color(color1.value) },
  uColor2: { value: new Color(color2.value) }
}))

onMounted(() => {
  const animate = () => {
    time += 0.02
    gradientUniforms.value.uTime.value = time
    waveUniforms.value.uTime.value = time
    sphereRotation.value = [0, time * 0.2, 0]
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

.shader-code {
  margin-top: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  
  :deep(.el-tabs) {
    .el-tabs__header {
      margin-bottom: var(--spacing-md);
    }
    .el-tabs__content {
      padding: 0;
    }
  }
}
</style>


