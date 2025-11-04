// 物质状态枚举
export enum MatterState {
  SOLID = 'solid',
  LIQUID = 'liquid',
  GAS = 'gas'
}

// 设备类型特性定义
export interface EquipmentProperties {
  canHeat: boolean;           // 是否可以加热
  canReact: boolean;          // 是否可以进行化学反应
  canHoldSolids: boolean;     // 是否可以装固体
  canHoldLiquids: boolean;    // 是否可以装液体
  name: string;               // 设备名称
  description: string;        // 设备描述
}

// 定义化学物品接口
export interface ChemicalItem {
  id: string;
  type: 'beaker' | 'testTube' | 'flask' | 'buret' | 'erlenmeyer' | 'crucible' | 'watchGlass' | 'graduatedCylinder';
  x: number;
  y: number;
  liquidType: string;
  liquidAmount: number; // 0-100
  liquidColor: string;
  isSelected: boolean;
  isHeated?: boolean;
  hasPrecipitate?: boolean;
}

// 定义实验任务接口
export interface ExperimentTask {
  id: string;
  title: string;
  description: string;
  steps: string[];
  completed: boolean;
  rewardPoints: number;
}

// 定义化学反应接口
export interface ChemicalReaction {
  reactants: string[];
  products: string[];
  equation: string;
  conditions?: 'heat' | 'mix' | 'catalyst';
  colorChange?: string;
  precipitate?: boolean;
  gasProduction?: boolean;
  energyChange?: 'exothermic' | 'endothermic';
  reactionRate?: 'slow' | 'normal' | 'fast';
  specialNote?: string;
}

// 定义物质接口
export interface Solution {
  name: string;
  type: string;
  color: string;
  amount: number;
  isSolid?: boolean;
  description?: string;
}