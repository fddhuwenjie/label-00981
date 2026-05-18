<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><MapLocation /></el-icon>
        地形生成器
      </h1>
      <p class="page-description">
        使用 Perlin Noise 算法程序化生成 3D 地形网格。通过调整噪声参数，实时生成不同形态的地形，
        包括蓝色水面、绿色草地和白色雪山等自然景观。
      </p>
    </div>

    <div class="canvas-container">
      <CanvasLoading />
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="[100, 120, 100]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" :damping-factor="0.05" :max-polar-angle="Math.PI / 2.1" />

        <TresMesh receive-shadow cast-shadow>
          <TresBufferGeometry
            :position="[terrainData.positions, 3]"
            :color="[terrainData.colors, 3]"
          />
          <TresMeshStandardMaterial
            :vertex-colors="true"
            :side="DoubleSide"
            :roughness="0.8"
            :metalness="0.1"
          />
        </TresMesh>

        <TresAmbientLight :intensity="0.4" />
        <TresDirectionalLight
          :position="[100, 150, 100]"
          :intensity="1.2"
          cast-shadow
          :shadow-mapSize-width="2048"
          :shadow-mapSize-height="2048"
          :shadow-camera-left="-150"
          :shadow-camera-right="150"
          :shadow-camera-top="150"
          :shadow-camera-bottom="-150"
        />
        <TresDirectionalLight :position="[-100, 50, -100]" :intensity="0.3" color="#6b7280" />
      </TresCanvas>
    </div>

    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        地形参数
      </h3>
      <div class="control-groups">
        <div class="control-group">
          <div class="group-header">
            <el-icon><Odometer /></el-icon>
            噪声参数
          </div>
          <div class="group-content">
            <div class="control-item">
              <label>噪声频率：</label>
              <div class="slider-wrapper">
                <el-slider
                  v-model="frequency"
                  :min="0.01"
                  :max="0.1"
                  :step="0.001"
                />
                <span class="value-display">{{ frequency.toFixed(3) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>振幅：</label>
              <div class="slider-wrapper">
                <el-slider
                  v-model="amplitude"
                  :min="1"
                  :max="50"
                  :step="1"
                />
                <span class="value-display">{{ amplitude.toFixed(0) }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>八度数：</label>
              <div class="slider-wrapper">
                <el-slider
                  v-model="octaves"
                  :min="1"
                  :max="8"
                  :step="1"
                />
                <span class="value-display">{{ octaves }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="control-group">
          <div class="group-header">
            <el-icon><Operation /></el-icon>
            生成控制
          </div>
          <div class="group-content">
            <div class="control-item">
              <label>随机种子：</label>
              <div class="slider-wrapper">
                <el-slider
                  v-model="seed"
                  :min="1"
                  :max="10000"
                  :step="1"
                />
                <span class="value-display">{{ seed }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>网格大小：</label>
              <div class="slider-wrapper">
                <el-slider
                  v-model="gridSize"
                  :min="64"
                  :max="256"
                  :step="32"
                  @change="regenerateTerrain"
                />
                <span class="value-display">{{ gridSize }}×{{ gridSize }}</span>
              </div>
            </div>
            <div class="control-item">
              <label>自动旋转：</label>
              <el-switch v-model="autoRotate" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="stats-panel">
      <div class="stat-item">
        <span class="label">网格大小</span>
        <span class="value">{{ gridSize }}×{{ gridSize }}</span>
      </div>
      <div class="stat-item">
        <span class="label">三角形数</span>
        <span class="value">{{ (gridSize - 1) * (gridSize - 1) * 2 }}</span>
      </div>
      <div class="stat-item">
        <span class="label">最高海拔</span>
        <span class="value">{{ maxHeight.toFixed(1) }}</span>
      </div>
      <div class="stat-item">
        <span class="label">最低海拔</span>
        <span class="value">{{ minHeight.toFixed(1) }}</span>
      </div>
    </div>

    <div class="code-section">
      <h3 class="panel-title">
        <el-icon><Document /></el-icon>
        代码示例
      </h3>
      <pre class="code-block">{{ codeExample }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { DoubleSide } from 'three'
import { MapLocation, Setting, Odometer, Operation, Document } from '@element-plus/icons-vue'
import CanvasLoading from '@/components/common/CanvasLoading.vue'
import { generateTerrainMesh } from '@/utils/perlin'

const frequency = ref(0.03)
const amplitude = ref(25)
const octaves = ref(4)
const seed = ref(1234)
const gridSize = ref(256)
const autoRotate = ref(false)

const terrainData = ref({
  positions: new Float32Array(),
  colors: new Float32Array()
})

const heights = ref<number[][]>([])

const maxHeight = computed(() => {
  let max = -Infinity
  for (const row of heights.value) {
    for (const h of row) {
      if (h > max) max = h
    }
  }
  return max === -Infinity ? 0 : max
})

const minHeight = computed(() => {
  let min = Infinity
  for (const row of heights.value) {
    for (const h of row) {
      if (h < min) min = h
    }
  }
  return min === Infinity ? 0 : min
})

const regenerateTerrain = () => {
  const { positions, colors, heights: h } = generateTerrainMesh(
    gridSize.value,
    frequency.value,
    amplitude.value,
    octaves.value,
    seed.value
  )
  terrainData.value = { positions, colors }
  heights.value = h
}

watch([frequency, amplitude, octaves, seed], () => {
  regenerateTerrain()
})

onMounted(() => {
  regenerateTerrain()
})

const codeExample = [
  '<template>',
  '  <TresCanvas shadows>',
  '    <TresPerspectiveCamera :position="[100, 120, 100]" />',
  '    <OrbitControls />',
  '    ',
  '    <TresMesh>',
  '      <TresBufferGeometry',
  '        :position="[positions, 3]"',
  '        :color="[colors, 3]"',
  '      />',
  '      <TresMeshStandardMaterial :vertex-colors="true" />',
  '    </TresMesh>',
  '    ',
  '    <TresAmbientLight :intensity="0.4" />',
  '    <TresDirectionalLight :position="[100, 150, 100]" />',
  '  </TresCanvas>',
  '</template>',
  '',
  '<script setup lang="ts">',
  "import { generateTerrainMesh } from '@/utils/perlin'",
  '',
  'const { positions, colors } = generateTerrainMesh(',
  '  256,  // size',
  '  0.03, // frequency',
  '  25,   // amplitude',
  '  4,    // octaves',
  '  1234  // seed',
  ')',
  '<' + '/script>'
].join('\n')
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
    gap: var(--spacing-sm);
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
    min-width: 80px;
  }
}

.slider-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);

  .el-slider {
    flex: 1;
  }

  .value-display {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-accent);
    min-width: 60px;
    text-align: right;
  }
}

.stats-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
    text-align: center;

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

.code-section {
  margin-top: var(--spacing-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}
</style>
