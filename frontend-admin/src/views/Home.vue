<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">Tres.js</span>
          <span class="subtitle">Vue 3 的 3D 渲染解决方案</span>
        </h1>
        <p class="hero-description">
          探索 10+ 个高级 3D 示例，体验 Tres.js 与 Vue 3 的完美结合。
          从基础场景到复杂动画，从粒子系统到物理模拟，全方位展示 WebGL 的魅力。
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" @click="navigateToExample">
            <el-icon><VideoPlay /></el-icon>
            开始探索
          </el-button>
          <el-button size="large" @click="openDocs">
            <el-icon><Document /></el-icon>
            查看文档
          </el-button>
        </div>
      </div>
      
      <div class="hero-canvas">
        <TresCanvas shadows alpha>
          <TresPerspectiveCamera :position="[5, 5, 5]" :look-at="[0, 0, 0]" />
          <OrbitControls :enable-damping="true" />
          
          <TresMesh
            v-for="(cube, index) in cubes"
            :key="index"
            :position="cube.position"
            :rotation="cube.rotation"
          >
            <TresBoxGeometry :args="[0.8, 0.8, 0.8]" />
            <TresMeshStandardMaterial
              :color="cube.color"
              :metalness="0.3"
              :roughness="0.4"
            />
          </TresMesh>
          
          <TresAmbientLight :intensity="0.5" />
          <TresDirectionalLight :position="[5, 5, 5]" :intensity="1" cast-shadow />
          <TresGridHelper :args="[10, 10, '#6366f1', '#1a1a3e']" />
        </TresCanvas>
      </div>
    </section>
    
    <section class="features-section">
      <h2 class="section-title">
        <el-icon><Star /></el-icon>
        技术特点
      </h2>
      <div class="features-grid">
        <div
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
        >
          <div class="feature-icon">
            <el-icon :size="32"><component :is="iconComponents[feature.icon as keyof typeof iconComponents]" /></el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>
    
    <section class="examples-section">
      <h2 class="section-title">
        <el-icon><Grid /></el-icon>
        示例列表
      </h2>
      <div class="examples-grid">
        <div
          v-for="example in examples"
          :key="example.path"
          class="example-card"
          @click="router.push(example.path)"
        >
          <div class="example-preview">
            <el-icon :size="48"><component :is="iconComponents[example.icon as keyof typeof iconComponents]" /></el-icon>
          </div>
          <div class="example-info">
            <h3 class="example-title">{{ example.title }}</h3>
            <p class="example-description">{{ example.description }}</p>
          </div>
          <div class="example-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>
    </section>
    
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">10+</div>
          <div class="stat-label">高级示例</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">Vue 3</div>
          <div class="stat-label">组合式 API</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">TypeScript</div>
          <div class="stat-label">类型安全</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">Three.js</div>
          <div class="stat-label">强力驱动</div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import {
  VideoPlay,
  Document,
  Star,
  Grid,
  ArrowRight,
  Connection,
  Cpu,
  SetUp,
  Box,
  MagicStick,
  StarFilled,
  Sunny,
  PictureFilled,
  Basketball,
  EditPen,
  Camera
} from '@element-plus/icons-vue'

// 导出图标供动态组件使用
const iconComponents = {
  VideoPlay,
  Document,
  Star,
  Grid,
  ArrowRight,
  Connection,
  Cpu,
  SetUp,
  Box,
  MagicStick,
  StarFilled,
  Sunny,
  PictureFilled,
  Basketball,
  EditPen,
  Camera
}

const router = useRouter()

interface Cube {
  position: [number, number, number]
  rotation: [number, number, number]
  color: string
}

const cubes = ref<Cube[]>([])
const colors = ['#6366f1', '#a855f7', '#22d3ee', '#10b981', '#f59e0b']

onMounted(() => {
  // 生成随机立方体
  for (let i = 0; i < 15; i++) {
    cubes.value.push({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 4 + 1,
        (Math.random() - 0.5) * 8
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ],
      color: colors[Math.floor(Math.random() * colors.length)]
    })
  }
  
  // 动画更新立方体旋转
  const animate = () => {
    cubes.value.forEach((cube, index) => {
      cube.rotation[0] += 0.005 * (index % 3 + 1)
      cube.rotation[1] += 0.008 * (index % 2 + 1)
    })
    requestAnimationFrame(animate)
  }
  animate()
})

const features = [
  {
    icon: 'MagicStick',
    title: '声明式 3D',
    description: '使用 Vue 组件语法创建 3D 场景，简洁直观'
  },
  {
    icon: 'Connection',
    title: '响应式绑定',
    description: 'Vue 3 响应式系统与 Three.js 完美结合'
  },
  {
    icon: 'Cpu',
    title: '高性能渲染',
    description: '基于 Three.js，支持 WebGL 2.0 和 WebGPU'
  },
  {
    icon: 'SetUp',
    title: '丰富生态',
    description: '集成 @tresjs/cientos 提供大量预设组件'
  }
]

const examples = [
  { path: '/basic-scene', icon: 'Box', title: '基础场景', description: '创建基本的 3D 场景和几何体' },
  { path: '/animated-models', icon: 'VideoPlay', title: '动画模型', description: '实现流畅的 3D 动画效果' },
  { path: '/shader-material', icon: 'MagicStick', title: '着色器材质', description: '自定义 GLSL 着色器' },
  { path: '/particle-system', icon: 'StarFilled', title: '粒子系统', description: '创建绚丽的粒子效果' },
  { path: '/environment-map', icon: 'Sunny', title: '环境贴图', description: '实现真实的环境反射' },
  { path: '/post-processing', icon: 'PictureFilled', title: '后处理效果', description: '添加视觉后期处理' },
  { path: '/physics-world', icon: 'Basketball', title: '物理世界', description: '模拟真实的物理交互' },
  { path: '/instanced-mesh', icon: 'Grid', title: '实例化渲染', description: '高效渲染大量对象' },
  { path: '/text-geometry', icon: 'EditPen', title: '3D 文字', description: '创建立体文字效果' },
  { path: '/camera-controls', icon: 'Camera', title: '相机控制', description: '多种相机交互模式' }
]

const navigateToExample = () => {
  router.push('/basic-scene')
}

const openDocs = () => {
  window.open('https://tresjs.org/', '_blank')
}
</script>

<style lang="scss" scoped>
.home-page {
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: var(--spacing-xl);
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);
  min-height: 500px;
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-title {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-lg);
  
  .gradient-text {
    font-size: 64px;
    font-weight: 800;
    background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.1;
  }
  
  .subtitle {
    font-size: var(--text-xl);
    color: var(--text-secondary);
    font-weight: 400;
    margin-top: var(--spacing-sm);
  }
}

.hero-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  line-height: 1.8;
  margin-bottom: var(--spacing-lg);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  .el-button {
    padding: 12px 24px;
    font-size: var(--text-base);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    
    .el-icon {
      margin-right: 8px;
    }
  }
}

.hero-actions .el-button:last-child {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  
  &:hover {
    background: var(--color-primary);
    border-color: var(--color-primary);
    color: white;
    
    .el-icon {
      color: white;
    }
  }
  
  .el-icon {
    color: var(--color-primary);
  }
}

.hero-canvas {
  height: 500px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: linear-gradient(145deg, rgba(30, 30, 60, 0.8) 0%, rgba(15, 15, 35, 0.9) 100%);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg), var(--shadow-glow);
  
  @media (max-width: 1024px) {
    height: 350px;
  }
}

.section-title {
  font-size: var(--text-2xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  .el-icon {
    color: var(--color-primary);
  }
}

.features-section {
  margin-bottom: var(--spacing-xl);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  text-align: center;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-4px);
    border-color: var(--color-primary);
    box-shadow: var(--shadow-glow);
    
    .feature-icon {
      transform: scale(1.1);
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
    }
  }
  
  .feature-icon {
    width: 64px;
    height: 64px;
    margin-bottom: var(--spacing-md);
    background: rgba(59, 130, 246, 0.2);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    transition: all var(--transition-normal);
  }
  
  .feature-title {
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    line-height: 1.2;
  }
  
  .feature-description {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
  }
}

.examples-section {
  margin-bottom: var(--spacing-xl);
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.example-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background: var(--bg-card-hover);
    border-color: var(--color-primary);
    transform: translateX(4px);
    
    .example-preview {
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      color: white;
    }
    
    .example-arrow {
      opacity: 1;
      transform: translateX(4px);
    }
  }
  
  .example-preview {
    width: 80px;
    height: 80px;
    background: rgba(59, 130, 246, 0.2);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
    transition: all var(--transition-normal);
  }
  
  .example-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    
    .example-title {
      font-size: var(--text-base);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: var(--spacing-xs);
      line-height: 1.2;
    }
    
    .example-description {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }
  
  .example-arrow {
    color: var(--color-primary);
    opacity: 0;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
  }
}

.stats-section {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  text-align: center;
  
  .stat-value {
    font-size: var(--text-3xl);
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: var(--spacing-xs);
  }
  
  .stat-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
}
</style>


