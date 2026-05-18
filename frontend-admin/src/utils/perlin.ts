/**
 * Perlin Noise 算法实现
 * 基于 Ken Perlin 的改进版 Perlin Noise (2002)
 * 用于程序化生成地形高度数据
 */

/** 梯度向量表，用于 3D Perlin Noise 计算 */
const GRADIENT_3: readonly [number, number, number][] = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
] as const

/**
 * Perlin Noise 生成器类
 * 封装排列表和噪声计算逻辑，支持多八度（octave）叠加
 */
export class PerlinNoise {
  /** 排列表，包含 0-255 的随机排列 */
  private readonly perm: Uint8Array

  /**
   * 创建 Perlin Noise 实例
   * @param seed - 随机种子，相同种子生成相同的地形
   */
  constructor(seed: number = 42) {
    const p = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      p[i] = i
    }

    let s = Math.abs(seed) | 0
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647
      const j = s % (i + 1)
      const tmp = p[i]
      p[i] = p[j]
      p[j] = tmp
    }

    this.perm = new Uint8Array(512)
    for (let i = 0; i < 512; i++) {
      this.perm[i] = p[i & 255]
    }
  }

  /**
   * 缓动函数（Fade function），使用 6t⁵ - 15t⁴ + 10t³ 曲线
   * 消除噪声中的视觉伪影，使过渡更加平滑
   * @param t - 输入值，范围 [0, 1]
   * @returns 缓动后的值
   */
  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }

  /**
   * 线性插值
   * @param a - 起始值
   * @param b - 终止值
   * @param t - 插值因子，范围 [0, 1]
   * @returns 插值结果
   */
  private static lerp(a: number, b: number, t: number): number {
    return a + t * (b - a)
  }

  /**
   * 计算梯度向量与距离向量的点积
   * @param hash - 排列表中的哈希值
   * @param x - 距离向量的 x 分量
   * @param y - 距离向量的 y 分量
   * @param z - 距离向量的 z 分量
   * @returns 点积结果
   */
  private static grad(hash: number, x: number, y: number, z: number): number {
    const h = hash & 11
    const g = GRADIENT_3[h]
    return g[0] * x + g[1] * y + g[2] * z
  }

  /**
   * 计算 3D Perlin Noise 值
   * @param x - x 坐标
   * @param y - y 坐标
   * @param z - z 坐标
   * @returns 噪声值，范围约 [-1, 1]
   */
  noise3D(x: number, y: number, z: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    const Z = Math.floor(z) & 255

    const xf = x - Math.floor(x)
    const yf = y - Math.floor(y)
    const zf = z - Math.floor(z)

    const u = PerlinNoise.fade(xf)
    const v = PerlinNoise.fade(yf)
    const w = PerlinNoise.fade(zf)

    const p = this.perm
    const A = p[X] + Y
    const AA = p[A] + Z
    const AB = p[A + 1] + Z
    const B = p[X + 1] + Y
    const BA = p[B] + Z
    const BB = p[B + 1] + Z

    const g = PerlinNoise.grad
    const lerp = PerlinNoise.lerp

    return lerp(
      lerp(
        lerp(g(p[AA], xf, yf, zf), g(p[BA], xf - 1, yf, zf), u),
        lerp(g(p[AB], xf, yf - 1, zf), g(p[BB], xf - 1, yf - 1, zf), u),
        v
      ),
      lerp(
        lerp(g(p[AA + 1], xf, yf, zf - 1), g(p[BA + 1], xf - 1, yf, zf - 1), u),
        lerp(g(p[AB + 1], xf, yf - 1, zf - 1), g(p[BB + 1], xf - 1, yf - 1, zf - 1), u),
        v
      ),
      w
    )
  }

  /**
   * 计算 2D Perlin Noise 值（通过固定 z=0 调用 3D 版本）
   * @param x - x 坐标
   * @param y - y 坐标
   * @returns 噪声值，范围约 [-1, 1]
   */
  noise2D(x: number, y: number): number {
    return this.noise3D(x, y, 0)
  }

  /**
   * 计算分形布朗运动（fBm）噪声值
   * 通过叠加多个八度的 Perlin Noise 实现更自然的地形细节
   * @param x - x 坐标
   * @param y - y 坐标
   * @param frequency - 基础噪声频率，值越大地形细节越密
   * @param amplitude - 基础振幅，控制地形最大高度
   * @param octaves - 八度数，叠加的噪声层数，越多细节越丰富
   * @returns 噪声值，范围随参数变化
   */
  fbm2D(x: number, y: number, frequency: number, amplitude: number, octaves: number): number {
    let value = 0
    let freq = frequency
    let amp = amplitude
    let maxValue = 0

    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * freq, y * freq) * amp
      maxValue += amp
      freq *= 2.0
      amp *= 0.5
    }

    return maxValue > 0 ? value / maxValue : 0
  }
}

/**
 * 地形高度数据生成器
 * 根据噪声参数生成指定尺寸的高度图和颜色数据
 */

/** 地形颜色区域类型 */
export type TerrainZone = 'water' | 'beach' | 'grass' | 'forest' | 'rock' | 'snow'

/** 地形生成结果 */
export interface TerrainData {
  /** 顶点位置数组 (x, y, z 交错存储) */
  positions: Float32Array
  /** 顶点颜色数组 (r, g, b 交错存储) */
  colors: Float32Array
  /** 索引数组 */
  indices: Uint32Array
  /** 地形网格宽度方向的顶点数 */
  width: number
  /** 地形网格深度方向的顶点数 */
  depth: number
}

/** 地形高度到颜色的映射阈值配置 */
export interface TerrainColorThresholds {
  /** 水面高度阈值（低于此值为水面） */
  water: number
  /** 沙滩高度阈值 */
  beach: number
  /** 草地高度阈值 */
  grass: number
  /** 森林高度阈值 */
  forest: number
  /** 岩石高度阈值 */
  rock: number
}

/** 默认地形颜色阈值 */
const DEFAULT_THRESHOLDS: TerrainColorThresholds = {
  water: -0.25,
  beach: -0.1,
  grass: 0.1,
  forest: 0.35,
  rock: 0.6,
}

/**
 * 根据归一化高度值获取地形颜色
 * @param normalizedHeight - 归一化后的高度值，范围约 [-1, 1]
 * @param thresholds - 颜色阈值配置
 * @returns [r, g, b] 颜色元组，各分量范围 [0, 1]
 */
export function getTerrainColor(
  normalizedHeight: number,
  thresholds: TerrainColorThresholds = DEFAULT_THRESHOLDS
): [number, number, number] {
  const h = normalizedHeight

  if (h < thresholds.water) {
    return [0.12, 0.38, 0.72]
  } else if (h < thresholds.beach) {
    const t = (h - thresholds.water) / (thresholds.beach - thresholds.water)
    return [
      lerp(0.12, 0.82, t),
      lerp(0.38, 0.75, t),
      lerp(0.72, 0.45, t),
    ]
  } else if (h < thresholds.grass) {
    const t = (h - thresholds.beach) / (thresholds.grass - thresholds.beach)
    return [
      lerp(0.82, 0.22, t),
      lerp(0.75, 0.62, t),
      lerp(0.45, 0.18, t),
    ]
  } else if (h < thresholds.forest) {
    const t = (h - thresholds.grass) / (thresholds.forest - thresholds.grass)
    return [
      lerp(0.22, 0.1, t),
      lerp(0.62, 0.42, t),
      lerp(0.18, 0.1, t),
    ]
  } else if (h < thresholds.rock) {
    const t = (h - thresholds.forest) / (thresholds.rock - thresholds.forest)
    return [
      lerp(0.1, 0.45, t),
      lerp(0.42, 0.4, t),
      lerp(0.1, 0.38, t),
    ]
  } else {
    const t = Math.min((h - thresholds.rock) / (1.0 - thresholds.rock), 1.0)
    return [
      lerp(0.45, 0.95, t),
      lerp(0.4, 0.95, t),
      lerp(0.38, 0.98, t),
    ]
  }
}

/**
 * 线性插值工具函数
 * @param a - 起始值
 * @param b - 终止值
 * @param t - 插值因子，范围 [0, 1]
 * @returns 插值结果
 */
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/**
 * 生成地形网格数据
 * @param size - 地形网格的顶点数（宽度 = 深度 = size）
 * @param frequency - 噪声频率，范围 [0.01, 0.1]
 * @param amplitude - 噪声振幅，范围 [1, 50]
 * @param octaves - 八度数，范围 [1, 8]
 * @param seed - 随机种子
 * @returns 地形数据，包含顶点位置、颜色和索引
 */
export function generateTerrainData(
  size: number = 256,
  frequency: number = 0.03,
  amplitude: number = 20,
  octaves: number = 4,
  seed: number = 42
): TerrainData {
  const perlin = new PerlinNoise(seed)
  const vertexCount = size * size
  const positions = new Float32Array(vertexCount * 3)
  const colors = new Float32Array(vertexCount * 3)

  const halfSize = (size - 1) / 2

  for (let iz = 0; iz < size; iz++) {
    for (let ix = 0; ix < size; ix++) {
      const vertexIndex = iz * size + ix
      const i3 = vertexIndex * 3

      const x = ix - halfSize
      const z = iz - halfSize

      const nx = ix / (size - 1)
      const nz = iz / (size - 1)

      const noiseValue = perlin.fbm2D(nx, nz, frequency, amplitude, octaves)
      const normalizedHeight = noiseValue

      positions[i3] = x
      positions[i3 + 1] = noiseValue * amplitude
      positions[i3 + 2] = z

      const [r, g, b] = getTerrainColor(normalizedHeight)
      colors[i3] = r
      colors[i3 + 1] = g
      colors[i3 + 2] = b
    }
  }

  const indexCount = (size - 1) * (size - 1) * 6
  const indices = new Uint32Array(indexCount)
  let idx = 0

  for (let iz = 0; iz < size - 1; iz++) {
    for (let ix = 0; ix < size - 1; ix++) {
      const a = iz * size + ix
      const b = a + 1
      const c = a + size
      const d = c + 1

      indices[idx++] = a
      indices[idx++] = c
      indices[idx++] = b

      indices[idx++] = b
      indices[idx++] = c
      indices[idx++] = d
    }
  }

  return {
    positions,
    colors,
    indices,
    width: size,
    depth: size,
  }
}
