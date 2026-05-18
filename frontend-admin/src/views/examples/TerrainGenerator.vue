<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Cpu /></el-icon>
        地形生成器
      </h1>
      <p class="page-description">
        使用 Perlin Noise 算法程序化生成 3D 地形，支持实时调整噪声参数。
        通过滑块调整频率、振幅和八度数，观察地形的实时变化。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="[0, 80, 120]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" :damping-factor="0.05" />
        
        <!-- 地形网格 -->
        <TresMesh :position="[0, 0, 0]" receive-shadow>
          <TresBufferGeometry ref="geometryRef" />
          <TresMeshStandardMaterial :vertex-colors="true" :wireframe="showWireframe" :flat-shading="false" />
        </TresMesh>
        
        <!-- 水面平面 -->
        <TresMesh :position="[0, -waterLevel, 0]" :rotation="[-Math.PI / 2, 0, 0]">
          <TresPlaneGeometry :args="[terrainSize, terrainSize]" />
          <TresMeshStandardMaterial color="#1e88e5" :transparent="true" :opacity="0.6" :side="DoubleSide" />
        </TresMesh>
        
        <!-- 灯光 -->
        <TresAmbientLight :intensity="0.6" />
        <TresDirectionalLight
          :position="[50, 100, 50]"
          :intensity="1.2"
          cast-shadow
          :shadow-mapSize-width="1024"
          :shadow-mapSize-height="1024"
        />
        <TresPointLight :position="[-50, 30, -50]" color="#22d3ee" :intensity="0.3" />
        
        <TresGridHelper :args="[terrainSize, 32, '#6366f1', '#1a1a3e']" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        地形参数
      </h3>
      <div class="control-groups">
        <!-- 噪声参数 -->
        <div class="control-group">
          <div class="group-header">
            <el-icon><MagicStick /></el-icon>
            噪声参数
          </div>
          <div class="group-content">
            <div class="control-item">
              <label>频率: {{ frequency.toFixed(3) }}</label>
              <div class="slider-wrapper">
                <el-slider v-model="frequency" :min="0.01" :max="0.1" :step="0.001" />
                <span class="value-display">{{ frequency.toFixed(3) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>振幅: {{ amplitude.toFixed(1) }}</label>
              <div class="slider-wrapper">
                <el-slider v-model="amplitude" :min="1" :max="50" :step="0.5" />
                <span class="value-display">{{ amplitude.toFixed(1) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>八度数: {{ octaves }}</label>
              <div class="slider-wrapper">
                <el-slider v-model="octaves" :min="1" :max="8" :step="1" />
                <span class="value-display">{{ octaves }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>持久性: {{ persistence.toFixed(2) }}</label>
              <div class="slider-wrapper">
                <el-slider v-model="persistence" :min="0.1" :max="0.9" :step="0.01" />
                <span class="value-display">{{ persistence.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <div class="control-group">
          <div class="group-header">
            <el-icon><Sunny /></el-icon>
            显示设置
          </div>
          <div class="group-content">
            <div class="control-item">
              <label>线框模式：</label>
              <el-switch v-model="showWireframe" />
            </div>
            <div class="control-item">
              <label>水面高度: {{ waterLevel.toFixed(1) }}</label>
              <div class="slider-wrapper">
                <el-slider v-model="waterLevel" :min="0" :max="20" :step="0.5" />
                <span class="value-display">{{ waterLevel.toFixed(1) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>随机种子: {{ seed }}</label>
              <div class="slider-wrapper">
                <el-slider v-model="seed" :min="1" :max="9999" :step="1" />
                <el-button size="small" @click="randomizeSeed" :icon="Refresh" />
              </div>
            </div>
          </div>
        </div>

        <!-- 地形信息 -->
        <div class="control-group">
          <div class="group-header">
            <el-icon><DataAnalysis /></el-icon>
            地形信息
          </div>
          <div class="group-content">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">网格尺寸</span>
                <span class="info-value">{{ terrainResolution }} × {{ terrainResolution }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">顶点数</span>
                <span class="info-value">{{ vertexCount.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">三角形数</span>
                <span class="info-value">{{ triangleCount.toLocaleString() }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最高点</span>
                <span class="info-value">{{ maxHeight.toFixed(1) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最低点</span>
                <span class="info-value">{{ minHeight.toFixed(1) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">地形面积</span>
                <span class="info-value">{{ terrainSize }} × {{ terrainSize }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { DoubleSide, BufferAttribute, BufferGeometry } from 'three'
import { Cpu, Setting, MagicStick, Sunny, DataAnalysis, Refresh } from '@element-plus/icons-vue'
import { buildPermutationTable, octavePerlinNoise2D } from '@/utils/perlin'

const terrainResolution = 256
const terrainSize = 100
const geometryRef = ref<InstanceType<typeof BufferGeometry> | null>(null)

// 噪声参数
const frequency = ref(0.03)
const amplitude = ref(15)
const octaves = ref(4)
const persistence = ref(0.5)
const seed = ref(42)

// 显示设置
const showWireframe = ref(false)
const waterLevel = ref(3)

// 地形数据
const vertices = new Float32Array((terrainResolution + 1) * (terrainResolution + 1) * 3)
const colors = new Float32Array((terrainResolution + 1) * (terrainResolution + 1) * 3)
const indices = new Uint32Array(terrainResolution * terrainResolution * 6)

let permutationTable: Uint8Array

const vertexCount = computed(() => (terrainResolution + 1) * (terrainResolution + 1))
const triangleCount = computed(() => terrainResolution * terrainResolution * 2)

const maxHeight = ref(0)
const minHeight = ref(0)

/**
 * 根据高度值获取地形颜色
 * 低处为蓝色水面、中间为绿色草地、高处为白色雪山
 * @param height - 高度值
 * @param normalizedHeight - 归一化高度值
 * @returns RGB 颜色数组
 */
function getTerrainColor(height: number, normalizedHeight: number): [number, number, number] {
  if (height < waterLevel.value) {
    const t = Math.max(0, Math.min(1, height / waterLevel.value))
    return [
      0.05 + t * 0.1,
      0.2 + t * 0.3,
      0.5 + t * 0.2
    ]
  } else if (normalizedHeight < 0.3) {
    const t = (normalizedHeight - 0) / 0.3
    return [
      0.1 + t * 0.1,
      0.6 + t * 0.15,
      0.1 + t * 0.05
    ]
  } else if (normalizedHeight < 0.6) {
    const t = (normalizedHeight - 0.3) / 0.3
    return [
      0.4 + t * 0.2,
      0.5 + t * 0.15,
      0.2 + t * 0.1
    ]
  } else {
    const t = (normalizedHeight - 0.6) / 0.4
    return [
      0.75 + t * 0.25,
      0.8 + t * 0.2,
      0.85 + t * 0.15
    ]
  }
}

/**
 * 生成地形几何数据
 * 使用 Perlin Noise 生成地形高度并计算颜色
 */
function generateTerrain(): void {
  permutationTable = buildPermutationTable(seed.value)
  
  let localMax = -Infinity
  let localMin = Infinity

  for (let z = 0; z <= terrainResolution; z++) {
    for (let x = 0; x <= terrainResolution; x++) {
      const nx = x / terrainResolution
      const nz = z / terrainResolution
      
      const noiseValue = octavePerlinNoise2D(
        permutationTable,
        nx * terrainSize,
        nz * terrainSize,
        octaves.value,
        persistence.value,
        frequency.value,
        amplitude.value
      )
      
      const height = noiseValue
      localMax = Math.max(localMax, height)
      localMin = Math.min(localMin, height)

      const normalX = (x / terrainResolution - 0.5) * terrainSize
      const normalZ = (z / terrainResolution - 0.5) * terrainSize
      
      const vertexIndex = (z * (terrainResolution + 1) + x) * 3
      vertices[vertexIndex] = normalX
      vertices[vertexIndex + 1] = height
      vertices[vertexIndex + 2] = normalZ
    }
  }

  maxHeight.value = localMax
  minHeight.value = localMin

  const heightRange = localMax - localMin
  for (let z = 0; z <= terrainResolution; z++) {
    for (let x = 0; x <= terrainResolution; x++) {
      const vertexIndex = (z * (terrainResolution + 1) + x) * 3
      const height = vertices[vertexIndex + 1]
      const normalizedHeight = heightRange > 0 ? (height - localMin) / heightRange : 0
      const [r, g, b] = getTerrainColor(height, normalizedHeight)
      colors[vertexIndex] = r
      colors[vertexIndex + 1] = g
      colors[vertexIndex + 2] = b
    }
  }

  for (let z = 0; z < terrainResolution; z++) {
    for (let x = 0; x < terrainResolution; x++) {
      const index = (z * terrainResolution + x) * 6
      const row = z * (terrainResolution + 1)
      indices[index] = row + x
      indices[index + 1] = row + x + terrainResolution + 1
      indices[index + 2] = row + x + 1
      indices[index + 3] = row + x + 1
      indices[index + 4] = row + x + terrainResolution + 1
      indices[index + 5] = row + x + terrainResolution + 2
    }
  }

  if (geometryRef.value) {
    const geometry = geometryRef.value as unknown as BufferGeometry
    geometry.setAttribute('position', new BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new BufferAttribute(colors, 3))
    geometry.setIndex(new BufferAttribute(indices, 1))
    geometry.computeVertexNormals()
  }
}

/**
 * 生成随机种子
 */
function randomizeSeed(): void {
  seed.value = Math.floor(Math.random() * 9998) + 1
}

let updateTimeout: ReturnType<typeof setTimeout>

function scheduleUpdate(): void {
  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    generateTerrain()
  }, 100)
}

watch([frequency, amplitude, octaves, persistence, seed], () => {
  scheduleUpdate()
})

onMounted(() => {
  generateTerrain()
})

onUnmounted(() => {
  clearTimeout(updateTimeout)
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

.control-groups {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
    gap: var(--spacing-md);
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
    min-width: 90px;
  }
}

.slider-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .el-slider {
    flex: 1;
  }
  
  .value-display {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-accent);
    min-width: 45px;
    text-align: right;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  .info-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
  
  .info-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-accent);
  }
}
</style>
