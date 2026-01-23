<template>
  <div class="example-page">
    <div class="page-header">
      <h1 class="page-title">
        <el-icon><Basketball /></el-icon>
        物理世界
      </h1>
      <p class="page-description">
        使用 cannon-es 物理引擎实现真实的物理交互，包括重力、碰撞检测、弹跳等物理效果。
        使用 Tres.js 与物理引擎集成，实现真实的物理模拟。
      </p>
    </div>
    
    <div class="canvas-container">
      <TresCanvas shadows ref="canvasRef">
        <TresPerspectiveCamera :position="[10, 10, 10]" :look-at="[0, 0, 0]" />
        <OrbitControls :enable-damping="true" />
        
        <!-- 物理球体 -->
        <TresMesh
          v-for="(ball, index) in physicsBalls"
          :key="'ball-' + index"
          :ref="(el: any) => setBallRef(el, index)"
          :position="ball.position"
          cast-shadow
        >
          <TresSphereGeometry :args="[ball.radius, 32, 32]" />
          <TresMeshStandardMaterial
            :color="ball.color"
            :metalness="0.3"
            :roughness="0.4"
          />
        </TresMesh>
        
        <!-- 物理立方体 -->
        <TresMesh
          v-for="(box, index) in physicsBoxes"
          :key="'box-' + index"
          :ref="(el: any) => setBoxRef(el, index)"
          :position="box.position"
          :rotation="box.rotation"
          cast-shadow
        >
          <TresBoxGeometry :args="[box.size, box.size, box.size]" />
          <TresMeshStandardMaterial
            :color="box.color"
            :metalness="0.4"
            :roughness="0.3"
          />
        </TresMesh>
        
        <!-- 地面 -->
        <TresMesh :rotation="[-Math.PI / 2, 0, 0]" receive-shadow ref="groundRef">
          <TresPlaneGeometry :args="[30, 30]" />
          <TresMeshStandardMaterial color="#1a1a3e" />
        </TresMesh>
        
        <!-- 边界墙 -->
        <TresMesh :position="[0, 2, -15]" receive-shadow ref="wallBackRef">
          <TresBoxGeometry :args="[30, 4, 0.5]" />
          <TresMeshStandardMaterial color="#0f0f23" :transparent="true" :opacity="0.5" />
        </TresMesh>
        <TresMesh :position="[0, 2, 15]" receive-shadow ref="wallFrontRef">
          <TresBoxGeometry :args="[30, 4, 0.5]" />
          <TresMeshStandardMaterial color="#0f0f23" :transparent="true" :opacity="0.5" />
        </TresMesh>
        <TresMesh :position="[-15, 2, 0]" receive-shadow ref="wallLeftRef">
          <TresBoxGeometry :args="[0.5, 4, 30]" />
          <TresMeshStandardMaterial color="#0f0f23" :transparent="true" :opacity="0.5" />
        </TresMesh>
        <TresMesh :position="[15, 2, 0]" receive-shadow ref="wallRightRef">
          <TresBoxGeometry :args="[0.5, 4, 30]" />
          <TresMeshStandardMaterial color="#0f0f23" :transparent="true" :opacity="0.5" />
        </TresMesh>
        
        <TresAmbientLight :intensity="0.4" />
        <TresDirectionalLight :position="[10, 15, 10]" :intensity="1" cast-shadow />
        <TresGridHelper :args="[30, 30, '#3b82f6', '#1a1a3e']" />
      </TresCanvas>
    </div>
    
    <div class="control-panel">
      <h3 class="panel-title">
        <el-icon><Setting /></el-icon>
        物理参数
      </h3>
      <el-row :gutter="24">
        <el-col :span="6">
          <div class="control-item">
            <label>重力: {{ gravity.toFixed(1) }}</label>
            <el-slider v-model="gravity" :min="1" :max="20" :step="0.5" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>弹性: {{ bounciness.toFixed(2) }}</label>
            <el-slider v-model="bounciness" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>摩擦力: {{ friction.toFixed(2) }}</label>
            <el-slider v-model="friction" :min="0" :max="1" :step="0.01" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>模拟速度: {{ simulationSpeed.toFixed(1) }}x</label>
            <el-slider v-model="simulationSpeed" :min="0.1" :max="3" :step="0.1" />
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin-top: 16px;">
        <el-col :span="12">
          <el-button type="primary" @click="() => addBall()">
            <el-icon><Plus /></el-icon>
            添加球体
          </el-button>
          <el-button type="success" @click="() => addBox()">
            <el-icon><Plus /></el-icon>
            添加立方体
          </el-button>
          <el-button type="danger" @click="resetScene">
            <el-icon><Delete /></el-icon>
            清空场景
          </el-button>
        </el-col>
        <el-col :span="6">
          <div class="control-item">
            <label>暂停模拟：</label>
            <el-switch v-model="isPaused" />
          </div>
        </el-col>
      </el-row>
    </div>
    
    <div class="physics-stats">
      <div class="stat-item">
        <span class="label">球体数量</span>
        <span class="value">{{ physicsBalls.length }}</span>
      </div>
      <div class="stat-item">
        <span class="label">立方体数量</span>
        <span class="value">{{ physicsBoxes.length }}</span>
      </div>
      <div class="stat-item">
        <span class="label">总物体数</span>
        <span class="value">{{ physicsBalls.length + physicsBoxes.length }}</span>
      </div>
      <div class="stat-item">
        <span class="label">模拟状态</span>
        <span class="value" :class="{ paused: isPaused }">
          {{ isPaused ? '已暂停' : '运行中' }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import { Basketball, Setting, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as CANNON from 'cannon-es'
import type { Mesh } from 'three'

interface PhysicsBall {
  position: [number, number, number]
  radius: number
  color: string
  meshRef?: Mesh
  body?: CANNON.Body
}

interface PhysicsBox {
  position: [number, number, number]
  rotation: [number, number, number]
  size: number
  color: string
  meshRef?: Mesh
  body?: CANNON.Body
}

const canvasRef = ref()
const groundRef = ref<Mesh>()
const wallBackRef = ref<Mesh>()
const wallFrontRef = ref<Mesh>()
const wallLeftRef = ref<Mesh>()
const wallRightRef = ref<Mesh>()

const gravity = ref(9.8)
const bounciness = ref(0.7)
const friction = ref(0.05)
const simulationSpeed = ref(1.0)
const isPaused = ref(false)

const physicsBalls = ref<PhysicsBall[]>([])
const physicsBoxes = ref<PhysicsBox[]>([])
const ballMeshRefs = ref<(Mesh | undefined)[]>([])
const boxMeshRefs = ref<(Mesh | undefined)[]>([])

const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#a855f7']

let world: CANNON.World | null = null
let groundBody: CANNON.Body | null = null
let wallBodies: CANNON.Body[] = []
let animationId: number

const setBallRef = (el: Mesh | undefined, index: number) => {
  if (el) {
    ballMeshRefs.value[index] = el
    if (physicsBalls.value[index] && !physicsBalls.value[index].meshRef) {
      physicsBalls.value[index].meshRef = el
      createBallBody(index)
    }
  }
}

const setBoxRef = (el: Mesh | undefined, index: number) => {
  if (el) {
    boxMeshRefs.value[index] = el
    if (physicsBoxes.value[index] && !physicsBoxes.value[index].meshRef) {
      physicsBoxes.value[index].meshRef = el
      createBoxBody(index)
    }
  }
}

const createBallBody = (index: number) => {
  const ball = physicsBalls.value[index]
  if (!ball.meshRef || ball.body) return
  
  const shape = new CANNON.Sphere(ball.radius)
  const body = new CANNON.Body({ mass: 1 })
  body.addShape(shape)
  body.position.set(ball.position[0], ball.position[1], ball.position[2])
  body.material = new CANNON.Material('ball')
  body.material.restitution = bounciness.value
  body.material.friction = friction.value
  
  world?.addBody(body)
  ball.body = body
}

const createBoxBody = (index: number) => {
  const box = physicsBoxes.value[index]
  if (!box.meshRef || box.body) return
  
  const shape = new CANNON.Box(new CANNON.Vec3(box.size / 2, box.size / 2, box.size / 2))
  const body = new CANNON.Body({ mass: 1 })
  body.addShape(shape)
  body.position.set(box.position[0], box.position[1], box.position[2])
  body.quaternion.setFromEuler(box.rotation[0], box.rotation[1], box.rotation[2])
  body.material = new CANNON.Material('box')
  body.material.restitution = bounciness.value
  body.material.friction = friction.value
  
  world?.addBody(body)
  box.body = body
}

const addBall = (showMessage = true) => {
  const ball: PhysicsBall = {
    position: [(Math.random() - 0.5) * 10, 8 + Math.random() * 5, (Math.random() - 0.5) * 10],
    radius: 0.3 + Math.random() * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)]
  }
  physicsBalls.value.push(ball)
  if (showMessage) {
    ElMessage.success('已添加球体')
  }
}

const addBox = (showMessage = true) => {
  const box: PhysicsBox = {
    position: [(Math.random() - 0.5) * 10, 8 + Math.random() * 5, (Math.random() - 0.5) * 10],
    rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
    size: 0.5 + Math.random() * 0.5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }
  physicsBoxes.value.push(box)
  if (showMessage) {
    ElMessage.success('已添加立方体')
  }
}

const resetScene = () => {
  // 移除所有物理体
  physicsBalls.value.forEach(ball => {
    if (ball.body && world) {
      world.removeBody(ball.body as CANNON.Body)
    }
  })
  physicsBoxes.value.forEach(box => {
    if (box.body && world) {
      world.removeBody(box.body as CANNON.Body)
    }
  })
  
  physicsBalls.value = []
  physicsBoxes.value = []
  ballMeshRefs.value = []
  boxMeshRefs.value = []
  ElMessage.info('场景已清空')
}

onMounted(async () => {
  // 初始化物理世界
  world = new CANNON.World()
  world.gravity.set(0, -gravity.value, 0)
  world.broadphase = new CANNON.NaiveBroadphase()
  
  // 创建地面
  const groundShape = new CANNON.Plane()
  groundBody = new CANNON.Body({ mass: 0 })
  groundBody.addShape(groundShape)
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
  world.addBody(groundBody)
  
  // 创建边界墙
  const wallMaterial = new CANNON.Material('wall')
  wallMaterial.restitution = bounciness.value
  
  const walls = [
    { pos: [0, 2, -15], size: [30, 4, 0.5] },
    { pos: [0, 2, 15], size: [30, 4, 0.5] },
    { pos: [-15, 2, 0], size: [0.5, 4, 30] },
    { pos: [15, 2, 0], size: [0.5, 4, 30] }
  ]
  
  walls.forEach(wall => {
    const shape = new CANNON.Box(new CANNON.Vec3(wall.size[0] / 2, wall.size[1] / 2, wall.size[2] / 2))
    const body = new CANNON.Body({ mass: 0, material: wallMaterial })
    body.addShape(shape)
    body.position.set(wall.pos[0], wall.pos[1], wall.pos[2])
    world?.addBody(body)
    wallBodies.push(body)
  })
  
  // 添加初始物体（不显示消息）
  for (let i = 0; i < 5; i++) {
    addBall(false)
  }
  for (let i = 0; i < 3; i++) {
    addBox(false)
  }
  
  // 等待下一帧确保mesh已创建
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 为初始物体创建物理体
  physicsBalls.value.forEach((_, index) => createBallBody(index))
  physicsBoxes.value.forEach((_, index) => createBoxBody(index))
  
  const simulate = () => {
    if (!isPaused.value && world) {
      const dt = 0.016 * simulationSpeed.value
      world.step(dt)
      
      // 同步物理体位置到mesh
      physicsBalls.value.forEach((ball) => {
        if (ball.body && ball.meshRef) {
          const pos = ball.body.position
          const quat = ball.body.quaternion
          ball.position = [pos.x, pos.y, pos.z]
          ball.meshRef.position.set(pos.x, pos.y, pos.z)
          ball.meshRef.quaternion.set(quat.x, quat.y, quat.z, quat.w)
        }
      })
      
      physicsBoxes.value.forEach((box) => {
        if (box.body && box.meshRef) {
          const pos = box.body.position
          const quat = box.body.quaternion
          box.position = [pos.x, pos.y, pos.z]
          box.meshRef.position.set(pos.x, pos.y, pos.z)
          box.meshRef.quaternion.set(quat.x, quat.y, quat.z, quat.w)
          
          // 更新旋转
          const euler = new CANNON.Vec3()
          box.body.quaternion.toEuler(euler)
          box.rotation = [euler.x, euler.y, euler.z]
        }
      })
    }
    
    animationId = requestAnimationFrame(simulate)
  }
  simulate()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (world) {
    world.bodies.forEach(body => world?.removeBody(body))
  }
})

watch(gravity, (newVal) => {
  if (world) {
    world.gravity.set(0, -newVal, 0)
  }
})

watch(bounciness, (newVal) => {
  if (world) {
    world.bodies.forEach(body => {
      if (body.material) {
        body.material.restitution = newVal
      }
    })
  }
})

watch(friction, (newVal) => {
  if (world) {
    world.bodies.forEach(body => {
      if (body.material) {
        body.material.friction = newVal
      }
    })
  }
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

.physics-stats {
  display: flex;
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
    
    .label {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
    
    .value {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--color-accent);
      font-family: var(--font-mono);
      
      &.paused {
        color: var(--color-secondary);
      }
    }
  }
}
</style>
