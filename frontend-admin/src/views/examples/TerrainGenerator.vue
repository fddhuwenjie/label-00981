<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Guide /></el-icon>
        地形生成器
      </h1>
      <p class="page-description">
        使用 Perlin Noise 算法程序化生成 256×256 的 3D 地形网格。地形高度根据噪声值着色：
        低处为蓝色水面、中间为绿色草地、高处为白色雪山。支持实时调整噪声频率、振幅和八度数。
      </p>
    </div>

    <div class="canvas-container">
      <TresCanvas>
        <TresPerspectiveCamera :position="cameraPosition" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />

        <TresMesh ref="terrainMeshRef" :rotation="[-Math.PI / 2, 0, 0]">
          <TresBufferGeometry
            :position="[terrainPositions, 3]"
            :color="[terrainColors, 3]"
          />
          <TresMeshStandardMaterial
            :vertex-colors="true"
            :side="2"
            :flat-shading="true"
            :wireframe="wireframe"
          />
        </TresMesh>

        <TresAmbientLight :intensity="0.6" />
        <TresDirectionalLight :position="[100, 100, 50]" :intensity="1.0" />
        <TresDirectionalLight :position="[-50, 80, -30]" :intensity="0.3" />
        <TresHemisphereLight
          :args="['#87ceeb', '#3a5f0b', 0.3]"
        />
      </TresCanvas>
    </div>

    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        地形参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="8">
          <div class="control-item">
            <label>噪声频率: {{ noiseFrequency.toFixed(3) }}</label>
            <el-slider
              v-model="noiseFrequency"
              :min="0.01"
              :max="0.1"
              :step="0.001"
              @change="regenerateTerrain"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="control-item">
            <label>振幅: {{ noiseAmplitude.toFixed(1) }}</label>
            <el-slider
              v-model="noiseAmplitude"
              :min="1"
              :max="50"
              :step="0.5"
              @change="regenerateTerrain"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="control-item">
            <label>八度数: {{ noiseOctaves }}</label>
            <el-slider
              v-model="noiseOctaves"
              :min="1"
              :max="8"
              :step="1"
              @change="regenerateTerrain"
            />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
        <el-col :span="8">
          <div class="control-item">
            <label>随机种子: {{ terrainSeed }}</label>
            <el-slider
              v-model="terrainSeed"
              :min="1"
              :max="999"
              :step="1"
              @change="regenerateTerrain"
            />
          </div>
        </el-col>
        <el-col :span="8">
          <div class="control-item">
            <label>线框模式：</label>
            <el-switch v-model="wireframe" />
          </div>
        </el-col>
        <el-col :span="8">
          <el-button type="primary" @click="randomizeSeed">
            <el-icon><Refresh /></el-icon>
            随机地形
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div class="terrain-stats">
      <div class="stat-item">
        <span class="label">网格尺寸</span>
        <span class="value">256 × 256</span>
      </div>
      <div class="stat-item">
        <span class="label">顶点数</span>
        <span class="value">{{ vertexCount.toLocaleString() }}</span>
      </div>
      <div class="stat-item">
        <span class="label">三角面数</span>
        <span class="value">{{ triangleCount.toLocaleString() }}</span>
      </div>
      <div class="stat-item">
        <span class="label">噪声算法</span>
        <span class="value">Perlin fBm</span>
      </div>
      <div class="stat-item">
        <span class="label">频率</span>
        <span class="value">{{ noiseFrequency.toFixed(3) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">振幅</span>
        <span class="value">{{ noiseAmplitude.toFixed(1) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Guide, Setting, Refresh } from '@element-plus/icons-vue'
import { Uint32BufferAttribute } from 'three'
import type { Mesh } from 'three'
import { generateTerrainData } from '@/utils/perlin'

const GRID_SIZE = 256

const noiseFrequency = ref(0.03)
const noiseAmplitude = ref(20)
const noiseOctaves = ref(4)
const terrainSeed = ref(42)
const wireframe = ref(false)

const cameraPosition = ref<[number, number, number]>([120, 100, 120])

const terrainPositions = ref<Float32Array>(new Float32Array(0))
const terrainColors = ref<Float32Array>(new Float32Array(0))
const terrainIndices = ref<Uint32Array>(new Uint32Array(0))

const terrainMeshRef = ref<Mesh | null>(null)

const vertexCount = computed(() => GRID_SIZE * GRID_SIZE)
const triangleCount = computed(() => (GRID_SIZE - 1) * (GRID_SIZE - 1) * 2)

const applyIndexAndNormals = () => {
  if (!terrainMeshRef.value) return
  const geometry = terrainMeshRef.value.geometry
  geometry.setIndex(new Uint32BufferAttribute(terrainIndices.value, 1))
  geometry.computeVertexNormals()
}

const regenerateTerrain = () => {
  const data = generateTerrainData(
    GRID_SIZE,
    noiseFrequency.value,
    noiseAmplitude.value,
    noiseOctaves.value,
    terrainSeed.value
  )

  terrainPositions.value = data.positions
  terrainColors.value = data.colors
  terrainIndices.value = data.indices

  nextTick(() => {
    applyIndexAndNormals()
  })
}

const randomizeSeed = () => {
  terrainSeed.value = Math.floor(Math.random() * 999) + 1
  regenerateTerrain()
}

watch(terrainMeshRef, (mesh) => {
  if (mesh) {
    nextTick(() => {
      applyIndexAndNormals()
    })
  }
})

onMounted(() => {
  regenerateTerrain()
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

.terrain-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
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
