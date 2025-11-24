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
  materials: number; // 基础材料
  spiritFruit: number; // 灵果
  spiritGrass: number; // 灵草
  spiritWater: number; // 灵水
  spiritStone: number; // 灵石
  spiritCrystal: number; // 灵晶
  heavenlyHerb: number; // 天材地宝
  immortalFruit: number; // 仙果
  divineEssence: number; // 神髓
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
  quests: Quest[]; // 任务列表
  alchemy: AlchemyState; // 炼丹状态
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

// 事件触发条件接口
export interface EventTriggers {
  actionType: string; // 触发的操作类型 (cultivate, gatherQi, any)
  probability: number; // 触发概率 (0-1)
}

// 事件结果接口
export interface EventOutcome {
  type: 'resource' | 'exp' | 'text' | 'skill';
  target?: string;
  amount?: number;
  message?: string;
}

// 事件选择接口
export interface EventChoice {
  id: string;
  text: string;
  requirements?: {
    level?: CultivationLevel;
    resources?: Partial<Resources>;
    skills?: { id: string; level: number }[];
  };
  outcomes: EventOutcome[];
}

// 事件接口
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  triggers: EventTriggers;
  choices: EventChoice[];
}

// 丹药类型定义
export type PillType = 
  | '培元丹'
  | '聚气丹'
  | '筑基丹'
  | '金丹丹'
  | '元婴丹'
  | '化神丹';

// 丹药接口
export interface Pill {
  id: string;
  name: string;
  type: PillType;
  description: string;
  effects: {
    expGain?: number; // 经验增益
    qiGain?: number; // 灵气增益
    cultivationSpeedBoost?: number; // 修炼速度提升
    duration?: number; // 效果持续时间（秒）
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// 炼丹配方接口
export interface AlchemyRecipe {
  id: string;
  pillId: string;
  name: string;
  ingredients: {
    material: string;
    amount: number;
  }[];
  requiredLevel: CultivationLevel; // 所需修真境界
  successRate: number; // 成功率 (0-1)
  expGain: number; // 炼丹获得的经验
}

// 炼丹状态接口
export interface AlchemyState {
  recipes: AlchemyRecipe[]; // 已解锁的炼丹配方
  currentPill?: string; // 当前正在炼制的丹药ID
  progress: number; // 炼丹进度 (0-100)
  isBrewing: boolean; // 是否正在炼丹
  lastBrewTime: number; // 上次炼丹时间
  successCount: number; // 成功炼丹次数
  failedCount: number; // 失败炼丹次数
}