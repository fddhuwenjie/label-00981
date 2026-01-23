<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><EditPen /></el-icon>
        3D 文字
      </h1>
      <p class="page-description">
        使用 Three.js TextGeometry 和 FontLoader 实现真正的 3D 立体文字效果，
        支持自定义文字内容、字体大小、挤出深度等参数。
      </p>
    </div>
    
    <div class="canvas-container">
      <CanvasLoading />
      <TresCanvas shadows ref="canvasRef">
        <TresPerspectiveCamera :position="[0, 2, 12]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 3D 文字 -->
        <TresGroup :position="textPosition" :rotation="textRotation" ref="textGroupRef">
          <TresMesh
            v-for="(mesh, index) in textMeshes"
            :key="index"
            :ref="(el: any) => setTextMeshRef(el, index)"
            :geometry="mesh.geometry"
            cast-shadow
          >
            <TresMeshStandardMaterial
              :color="textColor"
              :emissive="textColor"
              :emissive-intensity="0.3"
              :metalness="metalness"
              :roughness="roughness"
            />
          </TresMesh>
        </TresGroup>
        
        <!-- 背景面板 -->
        <TresMesh :position="[0, 0, -5]">
          <TresPlaneGeometry :args="[30, 20]" />
          <TresMeshStandardMaterial
            color="#0f172a"
            :metalness="0.2"
            :roughness="0.9"
          />
        </TresMesh>
        
        <!-- 地面 -->
        <TresMesh :position="[0, -4, 0]" :rotation="[-Math.PI / 2, 0, 0]">
          <TresPlaneGeometry :args="[30, 30]" />
          <TresMeshStandardMaterial
            color="#1e293b"
            :metalness="0.3"
            :roughness="0.8"
          />
        </TresMesh>
        
        <!-- 环绕光点 -->
        <TresMesh
          v-for="(point, index) in lightPoints"
          :key="'light-' + index"
          :position="point.position"
        >
          <TresSphereGeometry :args="[0.1, 16, 16]" />
          <TresMeshBasicMaterial :color="point.color" />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.6" />
        <TresDirectionalLight :position="[5, 10, 5]" :intensity="1.5" cast-shadow />
        <TresDirectionalLight :position="[-5, 10, -5]" :intensity="0.8" />
        <TresPointLight :position="[-5, 5, 5]" color="#3b82f6" :intensity="1" />
        <TresPointLight :position="[5, 5, -5]" color="#06b6d4" :intensity="1" />
        <TresPointLight :position="[0, 0, 8]" color="#ffffff" :intensity="0.8" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        文字参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>文字内容：</label>
            <el-input v-model="textContent" placeholder="输入文字" @input="updateText" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>文字颜色：</label>
            <el-color-picker v-model="textColor" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>字符高度: {{ letterHeight.toFixed(1) }}</label>
            <el-slider v-model="letterHeight" :min="0.5" :max="3" :step="0.1" @input="updateText" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>挤出深度: {{ extrudeDepth.toFixed(1) }}</label>
            <el-slider v-model="extrudeDepth" :min="0.1" :max="2" :step="0.1" @input="updateText" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
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
        <el-col :span="6">
          <div class="control-item">
            <label>旋转速度: {{ rotationSpeed.toFixed(2) }}</label>
            <el-slider v-model="rotationSpeed" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>自动旋转：</label>
            <el-switch v-model="autoRotate" />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="text-presets">
      <h4>快捷预设</h4>
      <div class="preset-buttons">
        <el-button @click="applyPreset('tres')">Tres.js</el-button>
        <el-button @click="applyPreset('vue')">Vue 3</el-button>
        <el-button @click="applyPreset('3d')">3D World</el-button>
        <el-button @click="applyPreset('hello')">Hello</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { EditPen, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { Mesh, BoxGeometry, MeshStandardMaterial } from 'three'
import type { Group } from 'three'
import CanvasLoading from '@/components/common/CanvasLoading.vue'

interface LightPoint {
  position: [number, number, number]
  color: string
  angle: number
  radius: number
}

const canvasRef = ref()
const textGroupRef = ref<Group>()
const textContent = ref('TRES')
const textColor = ref('#ffffff')
const letterHeight = ref(2.5)
const extrudeDepth = ref(0.8)
const metalness = ref(0.3)
const roughness = ref(0.4)
const rotationSpeed = ref(0.2)
const autoRotate = ref(true)

const textPosition = ref<[number, number, number]>([0, 0, 0])
const textRotation = ref<[number, number, number]>([0, 0, 0])
const textMeshes = ref<Mesh[]>([])
const textMeshRefs = ref<(Mesh | undefined)[]>([])
const lightPoints = ref<LightPoint[]>([])

let animationId: number
let time = 0
let font: any = null

const setTextMeshRef = (el: Mesh | undefined, index: number) => {
  if (el) {
    textMeshRefs.value[index] = el
  }
}

const loadFont = async () => {
  try {
    const loader = new FontLoader()
    // 使用 Three.js 提供的默认字体 JSON
    const fontData = await fetch('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json')
      .then(res => res.json())
    font = loader.parse(fontData)
    updateText()
  } catch (error) {
    console.error('Failed to load font:', error)
    ElMessage.error('字体加载失败，使用备用方案')
    // 如果字体加载失败，使用简单的几何体作为后备
    createFallbackText()
  }
}

const createFallbackText = () => {
  // 后备方案：使用立方体代表文字
  const chars = textContent.value.toUpperCase().split('')
  const letterWidth = letterHeight.value * 0.8
  const totalWidth = chars.length * letterWidth
  const startX = -totalWidth / 2 + letterWidth / 2
  
  textMeshes.value = chars.map((_char, index) => {
    // 使用简单的立方体作为后备
    const geometry = new BoxGeometry(
      letterWidth * 0.7,
      letterHeight.value,
      extrudeDepth.value
    )
    
    const mesh = new Mesh(geometry)
    mesh.position.set(startX + index * letterWidth * 1.1, 0, 0)
    return mesh
  })
}

const updateText = async () => {
  if (!font) {
    await loadFont()
    return
  }
  
  // 清理旧的mesh
  textMeshes.value.forEach(mesh => {
    mesh.geometry.dispose()
  })
  textMeshes.value = []
  
  try {
    const geometry = new TextGeometry(textContent.value.toUpperCase(), {
      font: font,
      size: letterHeight.value,
      depth: extrudeDepth.value,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 3
    })
    
    geometry.computeBoundingBox()
    const centerOffsetX = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x)
    const centerOffsetY = -0.5 * (geometry.boundingBox!.max.y - geometry.boundingBox!.min.y)
    
    const mesh = new Mesh(geometry)
    mesh.position.set(centerOffsetX, centerOffsetY, 0)
    textMeshes.value = [mesh]
    
    // 更新位置
    textPosition.value = [0, 0, 0]
  } catch (error) {
    console.error('Failed to create text geometry:', error)
    createFallbackText()
  }
}

const createLightPoints = () => {
  const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
  lightPoints.value = []
  for (let i = 0; i < 20; i++) {
    lightPoints.value.push({
      position: [0, 0, 0],
      color: colors[i % colors.length],
      angle: (i / 20) * Math.PI * 2,
      radius: 5 + (i % 3)
    })
  }
}

const applyPreset = (preset: string) => {
  switch (preset) {
    case 'tres':
      textContent.value = 'TRES'
      textColor.value = '#3b82f6'
      break
    case 'vue':
      textContent.value = 'VUE3'
      textColor.value = '#42b883'
      break
    case '3d':
      textContent.value = '3D'
      textColor.value = '#06b6d4'
      break
    case 'hello':
      textContent.value = 'HELLO'
      textColor.value = '#f59e0b'
      break
  }
  updateText()
  ElMessage.success(`已应用 "${preset}" 预设`)
}

onMounted(async () => {
  createLightPoints()
  await loadFont()
  
  const animate = () => {
    time += 0.016
    
    if (autoRotate.value) {
      textRotation.value = [0, time * rotationSpeed.value, 0]
    }
    
    // 更新光点位置
    lightPoints.value.forEach((point, index) => {
      const angle = point.angle + time * 0.5
      point.position = [
        Math.cos(angle) * point.radius,
        Math.sin(time * 2 + index) * 2,
        Math.sin(angle) * point.radius
      ]
    })
    
    // 更新材质颜色
    textMeshRefs.value.forEach(mesh => {
      if (mesh && mesh.material) {
        const material = mesh.material as MeshStandardMaterial
        if (material.color) {
          material.color.setStyle(textColor.value)
        }
        if ('metalness' in material) {
          material.metalness = metalness.value
        }
        if ('roughness' in material) {
          material.roughness = roughness.value
        }
      }
    })
    
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  textMeshes.value.forEach(mesh => {
    mesh.geometry.dispose()
  })
})

watch(textContent, updateText)
watch(textColor, () => {
  // 颜色改变时更新材质
  textMeshRefs.value.forEach(mesh => {
    if (mesh && mesh.material) {
      const material = mesh.material as MeshStandardMaterial
      if (material.color) {
        material.color.setStyle(textColor.value)
      }
    }
  })
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
  height: 500px;
}

.text-presets {
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
