import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页', icon: 'House' }
  },
  {
    path: '/basic-scene',
    name: 'BasicScene',
    component: () => import('@/views/examples/BasicScene.vue'),
    meta: { title: '基础场景', icon: 'Box' }
  },
  {
    path: '/animated-models',
    name: 'AnimatedModels',
    component: () => import('@/views/examples/AnimatedModels.vue'),
    meta: { title: '动画模型', icon: 'VideoPlay' }
  },
  {
    path: '/shader-material',
    name: 'ShaderMaterial',
    component: () => import('@/views/examples/ShaderMaterial.vue'),
    meta: { title: '着色器材质', icon: 'MagicStick' }
  },
  {
    path: '/particle-system',
    name: 'ParticleSystem',
    component: () => import('@/views/examples/ParticleSystem.vue'),
    meta: { title: '粒子系统', icon: 'StarFilled' }
  },
  {
    path: '/environment-map',
    name: 'EnvironmentMap',
    component: () => import('@/views/examples/EnvironmentMap.vue'),
    meta: { title: '环境贴图', icon: 'Sunny' }
  },
  {
    path: '/post-processing',
    name: 'PostProcessing',
    component: () => import('@/views/examples/PostProcessing.vue'),
    meta: { title: '后处理效果', icon: 'PictureFilled' }
  },
  {
    path: '/physics-world',
    name: 'PhysicsWorld',
    component: () => import('@/views/examples/PhysicsWorld.vue'),
    meta: { title: '物理世界', icon: 'Basketball' }
  },
  {
    path: '/instanced-mesh',
    name: 'InstancedMesh',
    component: () => import('@/views/examples/InstancedMesh.vue'),
    meta: { title: '实例化渲染', icon: 'Grid' }
  },
  {
    path: '/text-geometry',
    name: 'TextGeometry',
    component: () => import('@/views/examples/TextGeometry.vue'),
    meta: { title: '3D文字', icon: 'EditPen' }
  },
  {
    path: '/camera-controls',
    name: 'CameraControls',
    component: () => import('@/views/examples/CameraControls.vue'),
    meta: { title: '相机控制', icon: 'Camera' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || 'Tres.js'} - 3D展示`
  next()
})

export default router


