// 地形类型
export type TerrainType = 'ocean' | 'beach' | 'plains' | 'forest' | 'mountain';

// 世代阶段
export type EcosystemStage = 'primordial_soup' | 'prokaryotic_eukaryotic' | 'evolution' | 'advanced';

// 地形单元格
export interface TerrainCell {
  type: TerrainType;
  x?: number;
  y?: number;
  size?: number;
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
  
  currentStage: EcosystemStage;
  primordialSoupCount: number; // 原始汤数量
  primordialSoupThreshold: number; // 解锁下一阶段所需的原始汤数量
  prokaryoticCount: number; // 原核生物数量（用于第二阶段进阶）
  prokaryoticThreshold: number; // 解锁第三阶段所需的原核生物数量
  canAdvanceStage: boolean; // 是否可以进入下一阶段
}

// 生物类型
export type OrganismType = 'basic' | 'predator' | 'scavenger' | 'cyanobacteria' | 'primitive_eukaryote' | 'amoeba' | 'water_mold';

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
  lastSplitAge?: number; // 上次分裂年龄，用于无性生殖
  hasSplitOnce?: boolean; // 是否已经完成过至少一次分裂
  
  // 分裂繁殖相关属性
  isSplitting?: boolean;
  splitProgress?: number;
  splitDirection?: number;
  originalSize?: number;
  toBeRemoved?: boolean;
  
  // 移动状态相关属性
  lastPosition?: {x: number; y: number};
  stuckCounter?: number;
  
  // 分裂准备状态属性
  isPreparingSplit?: boolean;
  splitPreparationTime?: number;
  
  // 有性生殖相关属性
  targetPartner?: Organism | null;
  isLookingForPartner?: boolean;
  reproductionCooldown?: number;
  
  // 方法定义
  findNearestFood: (foods: Food[]) => Food | null;
  eat: (food: Food, ecosystemManager?: any) => boolean;
  
  // 地形适应性相关属性
  timeInUnsuitableTerrain?: number; // 在非适宜地形的时间
  isInSuitableTerrain?: boolean; // 当前是否在适宜地形
  lastSuitableTerrainPosition?: {x: number, y: number}; // 最后在适宜地形的位置
  evolve: () => Organism | null;
  update: (foods: Food[], ecosystemManager?: any) => Organism[] | null | undefined;
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
  isPrimordialSoup?: boolean; // 是否为原始汤
  isOrganicDebris?: boolean; // 是否为有机碎屑（第三阶段使用）
  fromOrganismType?: string; // 有机碎屑来源的生物类型
  lifetime?: number; // 有机碎屑的生命周期（用于衰变）
}

// 雷暴接口
export interface Thunderstorm {
  id: number;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  duration: number;
  startTime: number;
  isActive: boolean;
  color: string;
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
  organismTypes: { [key: string]: number };
  terrainDistribution?: TerrainDistribution;
}