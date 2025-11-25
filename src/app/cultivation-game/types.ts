// 修真境界类型
export type CultivationLevel = 
  | 'qi_refining_1'
  | 'qi_refining_2'
  | 'qi_refining_3'
  | 'qi_refining_4'
  | 'qi_refining_5'
  | 'qi_refining_6'
  | 'qi_refining_7'
  | 'qi_refining_8'
  | 'qi_refining_9'
  | 'foundation_1'
  | 'foundation_2'
  | 'foundation_3'
  | 'foundation_4'
  | 'foundation_5'
  | 'foundation_6'
  | 'foundation_7'
  | 'foundation_8'
  | 'foundation_9'
  | 'golden_core_1'
  | 'golden_core_2'
  | 'golden_core_3'
  | 'golden_core_4'
  | 'golden_core_5'
  | 'golden_core_6'
  | 'golden_core_7'
  | 'golden_core_8'
  | 'golden_core_9'
  | 'nascent_soul_1'
  | 'nascent_soul_2'
  | 'nascent_soul_3'
  | 'nascent_soul_4'
  | 'nascent_soul_5'
  | 'nascent_soul_6'
  | 'nascent_soul_7'
  | 'nascent_soul_8'
  | 'nascent_soul_9'
  | 'spirit_transformation_1'
  | 'spirit_transformation_2'
  | 'spirit_transformation_3';

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

// 宗门接口
export interface Sect {
  id: string;
  name: string;
  level: number;
  description: string;
  contribution: number;
  contributionToNextLevel: number;
  members: number;
  benefits: {
    resourceBoost: number;
    expBoost: number;
    cultivationSpeedBoost: number;
  };
  tasks: SectTask[];
  unlocked: boolean;
}

// 宗门任务接口
export interface SectTask {
  id: string;
  name: string;
  description: string;
  requirements: {
    monstersDefeated?: number;
    resourcesGathered?: number;
    pillsCrafted?: number;
    itemsForged?: number;
    petLevel?: number;
  };
  rewards: {
    contribution: number;
    resources?: Partial<Resources>;
  };
  completed: boolean;
  claimed: boolean;
}

// 修真信息接口
export interface CultivationInfo {
  level: CultivationLevel;
  exp: number;
  maxExp: number;
  qiCapacity: number; // 灵气容量
  cultivationSpeed: number; // 修炼速度
  sect?: Sect;
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
    attack?: number; // 攻击力提升
    defense?: number; // 防御力提升
    gatheringRate?: number; // 材料采集速率提升
    alchemySuccessRate?: number; // 炼丹成功率提升
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

// 怪物接口
export interface Monster {
  id: string;
  name: string;
  description: string;
  level: number;
  image: string; // 怪物形象（使用emoji）
  stats: {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
    expReward: number;
    goldReward: number;
    dropChance: {
      pills?: number;
      spiritFruit?: number;
      spiritGrass?: number;
    };
  };
  isBoss: boolean;
  requiredLevel: CultivationLevel;
}

// 战斗状态接口
export interface BattleState {
  isInBattle: boolean;
  currentMonster?: Monster;
  playerHealth: number;
  playerMaxHealth: number;
  monsterHealth: number;
  battleLog: string[];
  battleWon?: boolean;
  fleeSuccess?: boolean;
  battleLost?: boolean;
}

// 战斗结果接口
export interface BattleResult {
  victory: boolean;
  message: string;
  expGained: number;
  goldGained: number;
  drops: Partial<Resources>;
}

// 游戏状态接口
export interface GameState {
  playerName: string;
  cultivation: CultivationInfo;
  resources: Resources;
  skills: Skill[];
  equipment: Equipment[];
  pets: Pet[];
  monsters: Monster[]; // 可用怪物列表
  lastUpdateTime: number;
  lastPlayTime: number; // 最后游戏时间
  offlineTime: number; // 离线时间（毫秒）
  autoCultivate: boolean; // 自动修炼
  autoGatherQi: boolean; // 自动采集灵气
  achievements: string[];
  quests: Quest[]; // 任务列表
  alchemy: AlchemyState; // 炼丹状态
  forge: ForgeState; // 炼器状态
  battle: BattleState; // 战斗状态
  // 统计数据（用于成就系统）
  totalCultivations: number; // 总修炼次数
  totalQiGathered: number; // 总灵气采集量
  autoCultivationCount: number; // 自动修炼次数
  autoGatheringCount: number; // 自动采集次数
  rewardsReceived: string[]; // 已领取的奖励ID列表
  lastSave: number; // 最后保存时间
  totalEventsEncountered: number; // 总遇到的事件数量
  totalBattlesWon: number; // 总胜利次数
  totalBattlesLost: number; // 总失败次数
  unlockedAchievements: string[]; // 已解锁但未领取奖励的成就ID列表
}

// 离线奖励接口
export interface OfflineRewards {
  exp?: number;
  qi?: number;
  gold?: number;
  pills?: number;
  spiritFruit?: number;
}

// 任务类型
export type QuestType = 'main' | 'side' | 'daily' | 'limited';

// 任务接口
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType; // 任务类型
  difficulty: 'easy' | 'normal' | 'hard' | 'epic'; // 任务难度
  requirements: {
    level?: CultivationLevel;
    resources?: Partial<Resources>;
    skills?: { id: string; level: number }[];
    alchemy?: {
      successCount?: number;
      failedCount?: number;
    };
    events?: {
      encountered?: number;
    };
    totalCultivations?: number;
    totalQiGathered?: number;
    autoCultivationCount?: number;
    autoGatheringCount?: number;
  };
  rewards: {
    resources?: Partial<Resources>;
    skills?: string[];
    exp?: number;
    recipes?: string[]; // 炼丹配方奖励
    equipment?: string[]; // 装备奖励
  };
  completed: boolean;
  accepted: boolean; // 是否已接受
  rewardClaimed: boolean; // 是否已领取奖励
  dueDate?: number; // 截止日期（用于限时任务）
  questChain?: string; // 所属任务链ID
  nextQuest?: string; // 后续任务ID
}

// 事件触发条件接口
export interface EventTriggers {
  actionType: string; // 触发的操作类型 (cultivate, gatherQi, any)
  probability: number; // 触发概率 (0-1)
}

// 事件结果接口
export interface EventOutcome {
  probability: number;
  result: string;
  effects: {
    resources?: Partial<Resources>;
    exp?: number;
    cultivationSpeedBoost?: number;
    breakthroughBonus?: boolean;
    [key: string]: any;
  };
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

// 宠物接口
export interface Pet {
  id: string;
  name: string;
  type: 'spiritual_animal' | 'demonic_beast' | 'divine_creature';
  image: string;
  level: number;
  exp: number;
  maxExp: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  skills: PetSkill[];
  loyalty: number; // 忠诚度 0-100
  active: boolean; // 是否处于活跃状态
  specialBonus: {
    cultivationSpeed?: number;
    resourceGatheringSpeed?: number;
    battleDamage?: number;
    defenseBonus?: number;
  };
}

// 宠物技能接口
export interface PetSkill {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  effect: {
    damage?: number;
    healing?: number;
    defenseBoost?: number;
    attackBoost?: number;
    buffDuration?: number;
  };
  cooldown: number;
  currentCooldown: number;
}

// 宠物数据接口（用于初始化）
export interface PetData {
  id: string;
  name: string;
  type: 'spiritual_animal' | 'demonic_beast' | 'divine_creature';
  image: string;
  baseHealth: number;
  baseAttack: number;
  baseDefense: number;
  skills: Omit<PetSkill, 'currentCooldown'>[];
  loyalty: number;
  specialBonus: Pet['specialBonus'];
  unlockLevel: CultivationLevel;
  catchChance: number; // 捕捉几率 0-1
}

// 成就接口
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  completed: boolean;
  progress: number;
  requirements: {
    level?: CultivationLevel;
    resources?: Partial<Resources>;
    totalCultivations?: number;
    totalQiGathered?: number;
    autoCultivationCount?: number;
    autoGatheringCount?: number;
    alchemySuccess?: number;
    skillMaxLevel?: boolean;
    eventHandled?: number;
    petsCaught?: number;
    petLevelMaxed?: boolean;
    sectContribution?: number;
    sectLevel?: number;
  };
  reward: {
    resources?: Partial<Resources>;
    exp?: number;
  };
}

// 事件接口
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  triggers: EventTriggers;
  choices: EventChoice[];
}

// 随机事件接口
export interface Event {
  id: string;
  title: string;
  description: string;
  triggerChance: number;
  choices: EventChoice[];

}

// 丹药类型定义
export type PillType = 
  | '培元丹'
  | '聚气丹'
  | '筑基丹'
  | '金丹丹'
  | '元婴丹'
  | '化神丹'
  | '气血丹'
  | '通灵丹'
  | '避毒丹'
  | '回春丹';

// 丹药接口
export interface Pill {
  id: string;
  name: string;
  description: string;
  effect: {
    cultivationSpeed?: number;
    breakthroughChance?: number;
    healthRegen?: number;
    resourceGatheringSpeed?: number;
    poisonResistance?: number;
  };
  duration: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number;
}

// 炼丹配方接口
export interface AlchemyRecipe {
  id: string;
  name: string;
  description: string;
  pills: string[];
  ingredients: {
    id: string;
    quantity: number;
  }[];
  duration: number;
  requiredLevel: CultivationLevel;
  successRate: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  expGain?: number;
}

// 炼丹状态接口
export interface AlchemyState {
  recipes: AlchemyRecipe[]; // 已解锁的炼丹配方
  currentPill?: string; // 当前正在炼制的丹药ID
  currentRecipe?: AlchemyRecipe; // 当前正在使用的炼丹配方
  progress: number; // 炼丹进度 (0-100)
  isBrewing: boolean; // 是否正在炼丹
  startTime?: number; // 开始炼丹的时间
  lastBrewTime: number; // 上次炼丹时间
  successCount: number; // 成功炼丹次数
  failedCount: number; // 失败炼丹次数
}

// 炼器系统相关接口
// 炼器图谱接口
export interface ForgeBlueprint {
  id: string;
  name: string;
  description: string;
  itemId: string; // 对应的装备ID
  requiredLevel: CultivationLevel; // 所需境界
  ingredients: {
    materialId: string;
    quantity: number;
  }[];
  successRate: number; // 成功概率
  expGain: number; // 获得经验
}

// 炼器状态接口
export interface ForgeState {
  blueprints: ForgeBlueprint[]; // 已解锁的炼器图谱
  currentItem?: string; // 当前正在炼制的装备ID
  progress: number; // 炼器进度 (0-100)
  isForging: boolean; // 是否正在炼器
  lastForgeTime: number; // 上次炼器时间
  successCount: number; // 成功炼器次数
  failedCount: number; // 失败炼器次数
}