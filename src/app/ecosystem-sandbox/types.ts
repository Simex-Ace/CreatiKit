// 地形类型
export type TerrainType = 'ocean' | 'beach' | 'plains' | 'forest' | 'mountain';

// 地形单元格
export interface TerrainCell {
  type: TerrainType;
}

// 地形网格
export type TerrainGrid = TerrainCell[][];

// 地形效果
export interface TerrainEffect {
  speedMultiplier: number;
  hungerRateMultiplier: number;
  canSpawnFood: boolean;
  canSpawnOrganism: boolean;
  canPassThrough: boolean;            // 地形是否可通行
  // 新增地形效果属性
  breedingChanceMultiplier?: number; // 繁殖概率倍数
  healthRegenerationRate?: number;    // 健康恢复率（饥饿减少的减缓）
  foodDetectionRangeMultiplier?: number; // 食物检测范围倍数
  colorTint?: string;                 // 地形对生物的颜色影响
}

// 生态系统配置接口
export interface SandboxConfig {
  width: number;
  height: number;
  organismCount: number;
  foodCount: number;
  speed: number;
  isRunning: boolean;
  maxOrganisms: number;
  maxFood: number;
  foodSpawnRate: number;
  foodSpawnThreshold: number;
  evolutionThreshold: number;
  breedingThreshold: number;
  hasTerrain?: boolean;
  terrainGridSize?: number;
}

// 生物类型
export type OrganismType = 'basic' | 'predator' | 'scavenger';

// 生物接口
export interface Organism {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  adjustedSpeed?: number;
  direction: number;
  color: string;
  hunger: number;
  type: OrganismType;
  age: number;
  canEvolve: boolean;
  isBreeding: boolean;
  breedingPartnerId?: number;
  breedingTime?: number;
  breedingProgress?: number;
  isDetectingFood: boolean;
  foodDetectionTime?: number;
  detectedFoodDistance?: number;
  currentTerrainType?: TerrainType;
  hungerRateMultiplier?: number;
  targetFood?: Food; // 目标食物，用于优化移动逻辑
  
  // 方法定义
  findNearestFood: (foods: Food[]) => Food | null;
  eat: (food: Food) => boolean;
  evolve: () => Organism | null;
  update: (foods: Food[], ecosystemManager: any) => void;
  calculateDistance?: (x: number, y: number) => number;
}

// 食物接口
export interface Food {
  id: number;
  x: number;
  y: number;
  size: number;
  isFlashing?: boolean;
  flashTime?: number;
  terrainType?: TerrainType;
}

// 地形分布统计
export interface TerrainDistribution {
  ocean: number;
  beach: number;
  forest: number;
  mountain: number;
  plains: number;
}

// 统计数据接口
export interface Stats {
  fps: number;
  frameTime: number;
  organismTypes: {
    basic: number;
    predator: number;
    scavenger: number;
  };
  terrainDistribution?: TerrainDistribution;
}