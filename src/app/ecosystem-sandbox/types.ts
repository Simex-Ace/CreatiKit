// 食物类型定义
export interface Food {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
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