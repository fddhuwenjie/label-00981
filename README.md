# Tres.js 高级示例展示平台

一个基于 Vue 3 + Element Plus + Tres.js 的 3D 可视化展示平台，包含 10+ 个高级 Tres.js 示例。

---

## How to Run

### 本地开发运行

```bash
# 1. 进入前端项目目录
cd frontend-admin

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问 http://localhost:8081
```

### Docker 运行

**重要提示：** 如果遇到镜像拉取失败（`content size of zero` 错误），请先配置 Docker 镜像源：

1. **配置 Docker Desktop 镜像源**（推荐）：
   - 打开 Docker Desktop
   - 进入 `Settings` -> `Docker Engine`
   - 添加以下配置：
   ```json
   {
     "registry-mirrors": [
       "https://docker.m.daocloud.io",
       "https://hub-mirror.c.163.com",
       "https://mirror.baidubce.com"
     ]
   }
   ```
   - 点击 `Apply & Restart` 重启 Docker Desktop

2. **或者使用命令行配置**：
   ```powershell
   # 清理构建缓存
   docker builder prune -a -f
   
   # 禁用 BuildKit（如果仍有问题）
   $env:DOCKER_BUILDKIT=0
   docker-compose up -d --build
   ```

3. **构建并启动容器**：
   ```bash
   docker-compose up -d --build
   ```

4. **访问应用**：
   - 访问 http://localhost:8081

5. **停止容器**：
   ```bash
   docker-compose down
   ```

### 生产构建

```bash
cd frontend-admin
npm run build
```

---

## Services

| 服务名称 | 端口 | 描述 |
|---------|------|------|
| frontend-admin | 8081 | Tres.js 3D 展示前端服务 |

### 技术栈

- **前端框架**: Vue 3.5.17
- **UI 组件库**: Element Plus
- **3D 渲染**: Tres.js 5.2.0 + Three.js 0.181.2
- **构建工具**: Vite 6.x
- **编程语言**: TypeScript
- **容器化**: Docker + Nginx

---

## 测试账号

本项目为纯前端展示项目，无需登录账号。直接访问即可体验所有功能。

| 角色 | 账号 | 密码 | 说明 |
|------|------|------|------|
| 访客 | - | - | 无需登录，直接访问 |

---

## 题目内容

### 项目需求

基于以下版本创建一个完整的前端 Vite 项目，展示 Tres.js 的高级用法：

- `@tresjs/core`: 5.2.0
- `@tresjs/cientos`: 5.2.0  
- `three`: ^0.181.2
- `vue`: 3.5.17

### 包含示例

本项目包含 **10 个** Tres.js 高级用法示例：

1. **基础场景 (Basic Scene)**
   - 创建基本的 3D 场景
   - 几何体、材质、灯光配置
   - 相机和控制器设置

2. **动画模型 (Animated Models)**
   - 使用 useRenderLoop 实现帧动画
   - 旋转、缩放、位移变换
   - 弹跳和脉动效果

3. **着色器材质 (Shader Material)**
   - 自定义 GLSL 着色器
   - 渐变和波浪效果
   - Uniform 参数控制

4. **粒子系统 (Particle System)**
   - 大规模粒子渲染
   - 星空和螺旋效果
   - Points 和 BufferGeometry

5. **环境贴图 (Environment Map)**
   - HDRI 环境贴图
   - 真实金属和玻璃反射
   - 多种环境预设

6. **后处理效果 (Post Processing)**
   - 辉光 (Bloom) 效果
   - 暗角 (Vignette) 效果
   - 色彩校正

7. **物理世界 (Physics World)**
   - 重力和碰撞模拟
   - 弹性和摩擦力
   - 动态添加物体

8. **实例化渲染 (Instanced Mesh)**
   - 高性能批量渲染
   - 多种排列模式
   - 波浪动画效果

9. **3D 文字 (Text Geometry)**
   - 立体文字效果
   - 自定义文字内容
   - 材质和动画

10. **相机控制 (Camera Controls)**
    - 轨道控制器
    - 多种视角预设
    - 相机参数调节

### 项目特点

- ✅ 完整的 Vue 3 + TypeScript 项目结构
- ✅ Element Plus UI 组件库集成
- ✅ 响应式设计，支持多种屏幕尺寸
- ✅ 深色主题，现代化 UI 设计
- ✅ Docker 容器化部署支持
- ✅ 跨平台镜像 (ARM64 + X86_64)

---

## 项目结构

```
label-00981/
├── README.md                 # 项目说明文档
├── docker-compose.yml        # Docker 编排配置
├── .gitignore               # Git 忽略配置
└── frontend-admin/          # 前端项目目录
    ├── Dockerfile           # Docker 构建配置
    ├── nginx.conf           # Nginx 配置
    ├── package.json         # 项目依赖
    ├── vite.config.ts       # Vite 配置
    ├── tsconfig.json        # TypeScript 配置
    ├── index.html           # 入口 HTML
    ├── public/              # 静态资源
    │   └── favicon.svg
    └── src/                 # 源代码
        ├── main.ts          # 入口文件
        ├── App.vue          # 根组件
        ├── router/          # 路由配置
        │   └── index.ts
        ├── views/           # 页面组件
        │   ├── Home.vue
        │   └── examples/    # 10 个示例页面
        │       ├── BasicScene.vue
        │       ├── AnimatedModels.vue
        │       ├── ShaderMaterial.vue
        │       ├── ParticleSystem.vue
        │       ├── EnvironmentMap.vue
        │       ├── PostProcessing.vue
        │       ├── PhysicsWorld.vue
        │       ├── InstancedMesh.vue
        │       ├── TextGeometry.vue
        │       └── CameraControls.vue
        ├── components/      # 组件
        │   └── layout/
        │       ├── AppHeader.vue
        │       └── AppSidebar.vue
        └── styles/          # 样式
            └── global.scss
```

---

## 开发说明

### 环境要求

- Node.js >= 18.x
- npm >= 9.x
- Docker >= 20.x (可选)

### 常用命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview

# 代码检查
npm run lint
```

### Docker 命令

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重新构建并启动
docker-compose up -d --build
```

---

## 许可证

MIT License
