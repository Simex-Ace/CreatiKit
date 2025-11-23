// 修真境界类型
export type CultivationLevel = 
  | '练气初期'
  | '练气中期'
  | '练气后期'
  | '筑基初期'
  | '筑基中期'
  | '筑基后期'
  | '金丹初期'
  | '金丹中期'
  | '金丹后期'
  | '元婴初期'
  | '元婴中期'
  | '元婴后期'
  | '化神初期'
  | '化神中期'
  | '化神后期';

// 资源类型
export interface Resources {
  qi: number; // 灵气
  gold: number; // 灵石
  pills: number; // 丹药
  materials: number; // 材料
  spiritFruit: number; // 灵果
}

// 修真信息接口
export interface CultivationInfo {
  level: CultivationLevel;
  exp: number;
  maxExp: number;
  qiCapacity: number; // 灵气容量
  cultivationSpeed: number; // 修炼速度
}

// 技能接口
export interface Skill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlockLevel: CultivationLevel;
  effects: {
    qiGatherRate?: number; // 灵气采集速率提升
    goldFindRate?: number; // 灵石发现率提升
    cultivationSpeed?: number; // 修炼速度提升
    expGain?: number; // 经验获得提升
  };
}

// 装备接口
export interface Equipment {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'accessory';
  level: number;
  effects: {
    qiCapacity?: number;
    cultivationSpeed?: number;
    defense?: number;
    qiGatherRate?: number;
  };
}

// 游戏状态接口
export interface GameState {
  playerName: string;
  cultivation: CultivationInfo;
  resources: Resources;
  skills: Skill[];
  equipment: Equipment[];
  lastUpdateTime: number;
  lastPlayTime: number; // 最后游戏时间
  offlineTime: number; // 离线时间（毫秒）
  autoCultivate: boolean; // 自动修炼
  autoGatherQi: boolean; // 自动采集灵气
  achievements: string[];
  // 统计数据（用于成就系统）
  totalCultivations?: number; // 总修炼次数
  totalQiGathered?: number; // 总灵气采集量
  autoCultivationCount?: number; // 自动修炼次数
  autoGatheringCount?: number; // 自动采集次数
  rewardsReceived?: string[]; // 已领取的奖励ID列表
  lastSave?: number; // 最后保存时间
}

// 离线奖励接口
export interface OfflineRewards {
  exp?: number;
  qi?: number;
  gold?: number;
  pills?: number;
  spiritFruit?: number;
}

// 任务接口
export interface Quest {
  id: string;
  title: string;
  description: string;
  requirements: {
    level?: CultivationLevel;
    resources?: Partial<Resources>;
    skills?: { id: string; level: number }[];
  };
  rewards: {
    resources?: Partial<Resources>;
    skills?: string[];
    exp?: number;
  };
  completed: boolean;
}

// 事件接口
export interface GameEvent {
  id: string;
  type: 'opportunity' | 'danger' | 'encounter';
  title: string;
  description: string;
  choices: {
    id: string;
    text: string;
    requirements?: {
      level?: CultivationLevel;
      resources?: Partial<Resources>;
    };
    outcomes: {
      resources?: Partial<Resources>;
      exp?: number;
      message: string;
    };
  }[];
  probability: number;
}