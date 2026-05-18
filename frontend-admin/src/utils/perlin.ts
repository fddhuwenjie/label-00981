/**
 * Perlin Noise 算法实现
 * 用于生成自然的随机噪声，可应用于地形生成、纹理创建等场景
 */
export class PerlinNoise {
  private permutation: number[];

  /**
   * 创建 PerlinNoise 实例
   * @param seed - 随机种子，用于生成可复现的噪声
   */
  constructor(seed: number = Math.random() * 10000) {
    this.permutation = this.generatePermutation(seed);
  }

  /**
   * 生成排列数组
   * @param seed - 随机种子
   * @returns 包含 0-255 随机排列的数组（长度 512，用于避免边界检查）
   */
  private generatePermutation(seed: number): number[] {
    const p: number[] = [];
    for (let i = 0; i < 256; i++) {
      p[i] = i;
    }

    let n: number;
    let q: number;
    for (let i = 255; i > 0; i--) {
      seed = (seed * 16807) % 2147483647;
      n = seed % (i + 1);
      q = p[i];
      p[i] = p[n];
      p[n] = q;
    }

    return [...p, ...p];
  }

  /**
   * 平滑插值函数 (fade)
   * 使用 6t^5 - 15t^4 + 10t^3 实现平滑过渡
   * @param t - 插值参数 (0-1)
   * @returns 平滑后的值
   */
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * 线性插值
   * @param a - 起始值
   * @param b - 结束值
   * @param t - 插值参数 (0-1)
   * @returns 插值结果
   */
  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  /**
   * 梯度函数
   * 根据哈希值返回梯度向量与点积的结果
   * @param hash - 哈希值
   * @param x - x 坐标
   * @param y - y 坐标
   * @returns 梯度计算结果
   */
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3;
    const u = h < 2 ? x : y;
    const v = h < 2 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  /**
   * 生成 2D Perlin Noise 值
   * @param x - x 坐标
   * @param y - y 坐标
   * @returns 噪声值，范围 [-1, 1]
   */
  public noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;

    x -= Math.floor(x);
    y -= Math.floor(y);

    const u = this.fade(x);
    const v = this.fade(y);

    const A = this.permutation[X] + Y;
    const AA = this.permutation[A];
    const AB = this.permutation[A + 1];
    const B = this.permutation[X + 1] + Y;
    const BA = this.permutation[B];
    const BB = this.permutation[B + 1];

    return this.lerp(
      this.lerp(this.grad(this.permutation[AA], x, y), this.grad(this.permutation[BA], x - 1, y), u),
      this.lerp(this.grad(this.permutation[AB], x, y - 1), this.grad(this.permutation[BB], x - 1, y - 1), u),
      v
    );
  }

  /**
   * 生成叠加多个八度的 2D 噪声（分形布朗运动 FBM）
   * @param x - x 坐标
   * @param y - y 坐标
   * @param octaves - 八度数（叠加层数）
   * @param persistence - 持续度（每层振幅的衰减系数）
   * @param lacunarity - 间隙度（每层频率的倍增系数）
   * @returns 叠加后的噪声值，范围 [-1, 1]
   */
  public fbm2D(
    x: number,
    y: number,
    octaves: number = 4,
    persistence: number = 0.5,
    lacunarity: number = 2.0
  ): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      value += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= lacunarity;
    }

    return value / maxValue;
  }
}

/**
 * 根据高度值获取对应的地形颜色
 * @param height - 归一化的高度值 (-1 到 1)
 * @returns RGB 颜色对象 { r, g, b }
 */
export function getTerrainColor(height: number): { r: number; g: number; b: number } {
  const h = (height + 1) / 2;

  if (h < 0.3) {
    const t = h / 0.3;
    return {
      r: Math.floor(20 + t * 30),
      g: Math.floor(60 + t * 80),
      b: Math.floor(120 + t * 80)
    };
  } else if (h < 0.4) {
    const t = (h - 0.3) / 0.1;
    return {
      r: Math.floor(50 + t * 150),
      g: Math.floor(140 + t * 80),
      b: Math.floor(200 - t * 120)
    };
  } else if (h < 0.6) {
    const t = (h - 0.4) / 0.2;
    return {
      r: Math.floor(200 - t * 100),
      g: Math.floor(220 - t * 40),
      b: Math.floor(80 + t * 20)
    };
  } else if (h < 0.75) {
    const t = (h - 0.6) / 0.15;
    return {
      r: Math.floor(100 + t * 50),
      g: Math.floor(180 - t * 50),
      b: Math.floor(100 - t * 50)
    };
  } else {
    const t = (h - 0.75) / 0.25;
    return {
      r: Math.floor(150 + t * 105),
      g: Math.floor(130 + t * 125),
      b: Math.floor(50 + t * 205)
    };
  }
}

/**
 * 生成地形网格数据（非索引化三角形）
 * @param size - 网格大小（顶点数）
 * @param frequency - 噪声频率
 * @param amplitude - 噪声振幅
 * @param octaves - 八度数
 * @param seed - 随机种子
 * @returns 包含位置数组和颜色数组的对象
 */
export function generateTerrainMesh(
  size: number,
  frequency: number,
  amplitude: number,
  octaves: number,
  seed: number
): {
  positions: Float32Array;
  colors: Float32Array;
  heights: number[][];
} {
  const perlin = new PerlinNoise(seed);
  const heights: number[][] = [];

  for (let z = 0; z < size; z++) {
    heights[z] = [];
    for (let x = 0; x < size; x++) {
      const noiseValue = perlin.fbm2D(x * frequency, z * frequency, octaves);
      heights[z][x] = noiseValue * amplitude;
    }
  }

  const triangleCount = (size - 1) * (size - 1) * 2;
  const positions = new Float32Array(triangleCount * 3 * 3);
  const colors = new Float32Array(triangleCount * 3 * 3);

  const getVertexData = (x: number, z: number) => {
    const nx = x / size - 0.5;
    const nz = z / size - 0.5;
    const height = heights[z][x];
    const noiseValue = height / amplitude;
    const color = getTerrainColor(noiseValue);
    return {
      x: nx * size,
      y: height,
      z: nz * size,
      r: color.r / 255,
      g: color.g / 255,
      b: color.b / 255
    };
  };

  let posIndex = 0;
  let colIndex = 0;

  for (let z = 0; z < size - 1; z++) {
    for (let x = 0; x < size - 1; x++) {
      const v0 = getVertexData(x, z);
      const v1 = getVertexData(x + 1, z);
      const v2 = getVertexData(x, z + 1);
      const v3 = getVertexData(x + 1, z + 1);

      positions[posIndex++] = v0.x;
      positions[posIndex++] = v0.y;
      positions[posIndex++] = v0.z;
      positions[posIndex++] = v2.x;
      positions[posIndex++] = v2.y;
      positions[posIndex++] = v2.z;
      positions[posIndex++] = v1.x;
      positions[posIndex++] = v1.y;
      positions[posIndex++] = v1.z;

      colors[colIndex++] = v0.r;
      colors[colIndex++] = v0.g;
      colors[colIndex++] = v0.b;
      colors[colIndex++] = v2.r;
      colors[colIndex++] = v2.g;
      colors[colIndex++] = v2.b;
      colors[colIndex++] = v1.r;
      colors[colIndex++] = v1.g;
      colors[colIndex++] = v1.b;

      positions[posIndex++] = v1.x;
      positions[posIndex++] = v1.y;
      positions[posIndex++] = v1.z;
      positions[posIndex++] = v2.x;
      positions[posIndex++] = v2.y;
      positions[posIndex++] = v2.z;
      positions[posIndex++] = v3.x;
      positions[posIndex++] = v3.y;
      positions[posIndex++] = v3.z;

      colors[colIndex++] = v1.r;
      colors[colIndex++] = v1.g;
      colors[colIndex++] = v1.b;
      colors[colIndex++] = v2.r;
      colors[colIndex++] = v2.g;
      colors[colIndex++] = v2.b;
      colors[colIndex++] = v3.r;
      colors[colIndex++] = v3.g;
      colors[colIndex++] = v3.b;
    }
  }

  return { positions, colors, heights };
}
