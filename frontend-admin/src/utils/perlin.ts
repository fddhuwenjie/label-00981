/**
 * Perlin Noise 噪声算法工具函数
 * 提供 1D、2D、3D Perlin Noise 噪声的实现，支持八度数（Octaves）和持久性（Persistence）参数，
 * 可用于程序化生成地形、纹理等自然景观。
 */

/**
 * 伪随机数生成函数
 * 基于整数种子和坐标生成确定性的伪随机值
 * @param seed - 整数种子值
 * @param x - X 坐标
 * @param y - Y 坐标
 * @param z - Z 坐标（可选，默认为 0）
 * @returns 伪随机值，范围 [0, 1)
 */
export function pseudoRandom(seed: number, x: number, y: number, z: number = 0): number {
  let h = seed + x * 374761393 + y * 668265263 + z * 1442695040888963407
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return ((h >>> 0) % 2147483647) / 2147483647
}

/**
 * 线性插值函数（Linear Interpolation）
 * 在两个值之间进行线性平滑过渡
 * @param a - 起始值
 * @param b - 结束值
 * @param t - 插值参数，范围 [0, 1]
 * @returns 插值结果
 */
export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a)
}

/**
 * 缓动函数（Smoothstep）
 * 对插值参数进行平滑处理，使过渡更加自然
 * @param t - 插值参数，范围 [0, 1]
 * @returns 平滑后的插值参数
 */
export function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/**
 * 梯度函数
 * 根据梯度索引和坐标点计算梯度值
 * @param hash - 梯度哈希索引（0-255）
 * @param x - X 坐标偏移
 * @param y - Y 坐标偏移
 * @param z - Z 坐标偏移
 * @returns 梯度值
 */
function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15
  const u = h < 8 ? x : y
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}

/**
 * 构建 Perlin Noise 置换表
 * 生成一个包含 512 个梯度索引的置换表，用于 Perlin Noise 计算
 * @param seed - 随机种子值
 * @returns 长度为 512 的 Uint8Array 置换表
 */
export function buildPermutationTable(seed: number): Uint8Array {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    p[i] = i
  }
  let s = seed
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647
    const j = s % (i + 1)
    const t = p[i]
    p[i] = p[j]
    p[j] = t
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255]
  }
  return perm
}

/**
 * 计算 3D Perlin Noise 值
 * @param permutation - 置换表，由 buildPermutationTable 生成
 * @param x - X 坐标
 * @param y - Y 坐标
 * @param z - Z 坐标
 * @returns Perlin Noise 值，范围 [-1, 1]
 */
export function perlinNoise3D(permutation: Uint8Array, x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  const Z = Math.floor(z) & 255

  x -= Math.floor(x)
  y -= Math.floor(y)
  z -= Math.floor(z)

  const u = fade(x)
  const v = fade(y)
  const w = fade(z)

  const A = permutation[X] + Y
  const AA = permutation[A] + Z
  const AB = permutation[A + 1] + Z
  const B = permutation[X + 1] + Y
  const BA = permutation[B] + Z
  const BB = permutation[B + 1] + Z

  return lerp(
    lerp(
      lerp(grad(permutation[AA], x, y, z), grad(permutation[BA], x - 1, y, z), u),
      lerp(grad(permutation[AB], x, y - 1, z), grad(permutation[BB], x - 1, y - 1, z), u),
      v
    ),
    lerp(
      lerp(grad(permutation[AA + 1], x, y, z - 1), grad(permutation[BA + 1], x - 1, y, z - 1), u),
      lerp(grad(permutation[AB + 1], x, y - 1, z - 1), grad(permutation[BB + 1], x - 1, y - 1, z - 1), u),
      v
    ),
    w
  )
}

/**
 * 计算 2D Perlin Noise 值
 * @param permutation - 置换表，由 buildPermutationTable 生成
 * @param x - X 坐标
 * @param y - Y 坐标
 * @returns Perlin Noise 值，范围 [-1, 1]
 */
export function perlinNoise2D(permutation: Uint8Array, x: number, y: number): number {
  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255

  x -= Math.floor(x)
  y -= Math.floor(y)

  const u = fade(x)
  const v = fade(y)

  const A = permutation[X] + Y
  const B = permutation[X + 1] + Y

  return lerp(
    lerp(grad(permutation[A], x, y, 0), grad(permutation[B], x - 1, y, 0), u),
    lerp(grad(permutation[A + 1], x, y - 1, 0), grad(permutation[B + 1], x - 1, y - 1, 0), u),
    v
  )
}

/**
 * 计算多重八度（Multi-Octave）Perlin Noise 值
 * 通过叠加多个不同频率和振幅的 Perlin Noise 层，产生更自然的噪声效果
 * @param permutation - 置换表
 * @param x - X 坐标
 * @param y - Y 坐标
 * @param octaves - 八度数（叠加层数），建议范围 1-8
 * @param persistence - 持久性（振幅衰减系数），建议范围 0-1
 * @param frequency - 噪声频率，控制噪声的平滑程度，值越大噪声越频繁
 * @param amplitude - 噪声振幅，控制噪声的最大幅度
 * @returns 多重八度 Perlin Noise 值，范围约 [-amplitude, amplitude]
 */
export function octavePerlinNoise2D(
  permutation: Uint8Array,
  x: number,
  y: number,
  octaves: number,
  persistence: number,
  frequency: number,
  amplitude: number
): number {
  let total = 0
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    total += perlinNoise2D(permutation, x * frequency * Math.pow(2, i), y * frequency * Math.pow(2, i)) * amplitude
    maxValue += amplitude
    amplitude *= persistence
  }

  return total / maxValue
}
