// 食物类型定义
export interface Food {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  isFlashing?: boolean; // 是否正在闪烁（被吃掉时的效果）
  flashTime?: number; // 闪烁开始的时间
}

// 生物类型枚举
export type OrganismType = 'basic' | 'predator' | 'scavenger';

// 生物类型定义
export interface Organism {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number; // 角度（弧度）
  color: string;
  hunger: number; // 饥饿值：0-100，0表示极度饥饿，100表示饱腹
  type: OrganismType; // 生物类型
  age: number; // 年龄
  canEvolve: boolean; // 是否可以进化
  isDetectingFood?: boolean; // 是否探测到食物
  foodDetectionTime?: number; // 探测到食物的时间
  detectedFoodDistance?: number; // 探测到的食物距离
  isBreeding?: boolean; // 是否正在繁殖
  breedingPartnerId?: number; // 繁殖伙伴的ID
  breedingTime?: number; // 开始繁殖的时间
  breedingProgress?: number; // 繁殖进度 (0-100)
  update: (foods: Food[]) => void;
  eat: (foods: Food[]) => Food[];
  findNearestFood: (foods: Food[]) => Food | null;
  evolve: () => Organism | null; // 进化方法
}

// 沙盒配置
export interface SandboxConfig {
  width: number;
  height: number;
  organismCount: number;
  foodCount: number;
  speed: number;
  isRunning: boolean;
}

// 统计信息
export interface Stats {
  fps: number;
  frameTime: number;
  organismTypes: {
    basic: number;
    predator: number;
    scavenger: number;
  };
}