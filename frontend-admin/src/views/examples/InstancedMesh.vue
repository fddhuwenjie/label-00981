<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Grid /></el-icon>
        实例化渲染
      </h1>
      <p class="page-description">
        高效渲染大量相同几何体的对象，使用 InstancedMesh 可以在单次绘制调用中渲染数千个实例，
        大幅提升性能。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas shadows>
        <TresPerspectiveCamera :position="cameraPosition" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 实例化的立方体矩阵 -->
        <TresInstancedMesh
          ref="instancedMeshRef"
          :instance-count="instanceCount"
          @created="onInstancedMeshCreated"
        >
          <TresBoxGeometry :args="[0.8, 0.8, 0.8]" />
          <TresMeshStandardMaterial
            :color="baseColor"
            :metalness="metalness"
            :roughness="roughness"
          />
        </TresInstancedMesh>
        
        <!-- 地面 -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow>
          <TresPlaneGeometry :args="[100, 100]" />
          <TresMeshStandardMaterial color="#0a0a15" />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.3" />
        <TresDirectionalLight :position="[20, 30, 20]" :intensity="1" cast-shadow />
        <TresPointLight :position="[0, 10, 0]" color="#6366f1" :intensity="0.5" />
        
        <TresGridHelper :args="[100, 100, '#6366f1', '#1a1a3e']" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        实例参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>实例数量: {{ instanceCount }}</label>
            <el-slider
              v-model="instanceCount"
              :min="100"
              :max="10000"
              :step="100"
              @change="regenerateInstances"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>排列模式：</label>
            <CustomSelect
              v-model="arrangementMode"
              :options="arrangementOptions"
              @update:model-value="regenerateInstances"
            />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>基础颜色：</label>
            <el-color-picker v-model="baseColor" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>动画速度: {{ animationSpeed.toFixed(2) }}</label>
            <el-slider v-model="animationSpeed" :min="0" :max="2" :step="0.01" />
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
            <label>波动幅度: {{ waveAmplitude.toFixed(1) }}</label>
            <el-slider v-model="waveAmplitude" :min="0" :max="5" :step="0.1" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>启用动画：</label>
            <el-switch v-model="animationEnabled" />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="performance-stats">
      <div class="stat-item">
        <span class="label">渲染实例数</span>
        <span class="value">{{ instanceCount.toLocaleString() }}</span>
      </div>
      <div class="stat-item">
        <span class="label">绘制调用</span>
        <span class="value">1</span>
      </div>
      <div class="stat-item">
        <span class="label">渲染模式</span>
        <span class="value">InstancedMesh</span>
      </div>
      <div class="stat-item">
        <span class="label">排列模式</span>
        <span class="value">{{ arrangementLabels[arrangementMode] }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Grid, Setting } from '@element-plus/icons-vue'
import { Object3D, InstancedMesh } from 'three'
import CustomSelect from '@/components/common/CustomSelect.vue'

const instanceCount = ref(2000)
const arrangementMode = ref('grid')
const baseColor = ref('#6366f1')
const metalness = ref(0.5)
const roughness = ref(0.4)
const animationSpeed = ref(0.5)
const waveAmplitude = ref(2)
const animationEnabled = ref(true)

const cameraPosition = ref<[number, number, number]>([30, 20, 30])
const instancedMeshRef = ref<InstancedMesh | null>(null)

const arrangementLabels: Record<string, string> = {
  grid: '网格排列',
  sphere: '球形排列',
  spiral: '螺旋排列',
  random: '随机分布'
}

const arrangementOptions = computed(() => [
  { label: '网格', value: 'grid' },
  { label: '球形', value: 'sphere' },
  { label: '螺旋', value: 'spiral' },
  { label: '随机', value: 'random' }
])

let animationId: number
let time = 0
let instancePositions: { x: number; y: number; z: number; baseY: number }[] = []

const dummy = new Object3D()

const generatePositions = () => {
  instancePositions = []
  const count = instanceCount.value
  
  switch (arrangementMode.value) {
    case 'grid': {
      const size = Math.ceil(Math.sqrt(count))
      const spacing = 1.5
      const offset = (size * spacing) / 2
      for (let i = 0; i < count; i++) {
        const x = (i % size) * spacing - offset
        const z = Math.floor(i / size) * spacing - offset
        instancePositions.push({ x, y: 0, z, baseY: 0 })
      }
      break
    }
    case 'sphere': {
      for (let i = 0; i < count; i++) {
        const phi = Math.acos(-1 + (2 * i) / count)
        const theta = Math.sqrt(count * Math.PI) * phi
        const radius = 15
        const x = radius * Math.sin(phi) * Math.cos(theta)
        const y = radius * Math.cos(phi) + radius
        const z = radius * Math.sin(phi) * Math.sin(theta)
        instancePositions.push({ x, y, z, baseY: y })
      }
      break
    }
    case 'spiral': {
      for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 20
        const radius = t * 0.5
        const x = Math.cos(t) * radius
        const y = (i / count) * 30
        const z = Math.sin(t) * radius
        instancePositions.push({ x, y, z, baseY: y })
      }
      break
    }
    case 'random': {
      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * 40
        const y = Math.random() * 20
        const z = (Math.random() - 0.5) * 40
        instancePositions.push({ x, y, z, baseY: y })
      }
      break
    }
  }
}

const updateInstances = () => {
  if (!instancedMeshRef.value) return
  
  instancePositions.forEach((pos, i) => {
    if (animationEnabled.value) {
      const wave = Math.sin(time * 2 + pos.x * 0.2 + pos.z * 0.2) * waveAmplitude.value
      dummy.position.set(pos.x, pos.baseY + wave, pos.z)
      dummy.rotation.set(time * 0.5 + i * 0.01, time * 0.3, 0)
    } else {
      dummy.position.set(pos.x, pos.y, pos.z)
      dummy.rotation.set(0, 0, 0)
    }
    dummy.updateMatrix()
    instancedMeshRef.value!.setMatrixAt(i, dummy.matrix)
  })
  instancedMeshRef.value.instanceMatrix.needsUpdate = true
}

const onInstancedMeshCreated = (mesh: any) => {
  instancedMeshRef.value = mesh
  regenerateInstances()
}

const regenerateInstances = () => {
  generatePositions()
  updateInstances()
}

onMounted(() => {
  generatePositions()
  
  const animate = () => {
    time += 0.016 * animationSpeed.value
    if (animationEnabled.value) {
      updateInstances()
    }
    animationId = requestAnimationFrame(animate)
  }
  animate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})

watch([instanceCount, arrangementMode], () => {
  regenerateInstances()
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

.performance-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
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


