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
  spiritStone: number; // 灵石
  pills: Pill[]; // 丹药列表
  materials: number; // 基础材料
  spiritFruit: number; // 灵果
  spiritGrass: number; // 灵草
  spiritWater: number; // 灵水
  spiritCrystal: number; // 灵晶
  heavenlyHerb: number; // 天材地宝
  immortalFruit: number; // 仙果
  divineEssence: number; // 神髓
  spiritPaper: number; // 符纸
  items: any[]; // 物品列表
}

// 阵法类型
export type FormationType = 'cultivation' | 'defense' | 'attack' | 'forge' | 'alchemy';

// 阵法接口
export interface Formation {
  id: string;
  name: string;
  description: string;
  type: FormationType;
  unlockLevel: CultivationLevel;
  effects: {
    cultivationSpeedBoost?: number;
    qiGatherRateBoost?: number;
    defenseBoostBonus?: number;
    attackBoostBonus?: number;
    forgeSuccessRateBoost?: number;
    alchemySuccessRateBoost?: number;
    battleDamageBoost?: number;
  };
  upgradeCost: {
    gold: number;
    spiritStone: number;
    spiritCrystal?: number;
    heavenlyHerb?: number;
  };
  level: number;
  maxLevel: number;
  active: boolean;
}

// 灵田接口
export interface Farmland {
  id: string;
  name: string;
  description: string;
  soilQuality: number;
  upgradeCost: {
    gold: number;
    spiritStone: number;
    spiritCrystal?: number;
    heavenlyHerb?: number;
  };
  unlockRequirements: {
    level: CultivationLevel;
    gold?: number;
  };
  level: number;
  maxLevel: number;
  currentCrop: Crop | null;
  isLocked: boolean;
}

// 作物类型
export type CropType = 'spirit_grass' | 'spirit_fruit' | 'heavenly_herb';

// 生长阶段接口
export interface GrowthStage {
  name: string;
  duration: number;
  image: string;
  yield: number;
}

// 作物接口
export interface Crop {
  id: string;
  name: string;
  description: string;
  type: CropType;
  growthStages: GrowthStage[];
  currentStage: number;
  plantedTime: number;
  harvestYield: {
    spiritGrass?: number;
    spiritFruit?: number;
    heavenlyHerb?: number;
    exp: number;
    gold?: number;
  };
  requirements: {
    farmlandLevel: number;
  };
  unlockLevel: CultivationLevel;
  growthSpeed: number;
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
  cultivationSpeedBonus: number; // 修炼速度加成
  breakthroughChanceBonus: number; // 突破成功率加成
  qiGatherRateBonus: number; // 灵气采集速率加成
  expGainBonus: number; // 经验获得加成
  resourceGatheringSpeedBonus: number; // 资源采集速度加成
  alchemySuccessRateBonus: number; // 炼丹成功率加成
  skillExpBoostBonus: number; // 技能经验加成
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
  exploration: ExplorationState; // 探险状态
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
  // 阵法相关属性
  formations: Formation[];
  activeFormation?: string; // 当前激活的阵法ID
  // 灵田种植相关属性
  farmlands: Farmland[];
  crops: Crop[];
  unlockedCrops: string[];
  farmlandLevel: number; // 灵田总等级
  maxFarmlands: number; // 最大灵田数量
  fertilizer: number; // 肥料数量
  waterStorage: number; // 水储量
  maxWaterStorage: number; // 最大水储量
  farmingSkillLevel: number; // 种植技能等级
  farmingSkillExp: number; // 种植技能经验
  maxFarmingSkillExp: number; // 升级所需种植技能经验
  // 每日签到相关属性
  dailyCheckIn: {
    lastCheckInDate: number; // 上次签到日期
    consecutiveDays: number; // 连续签到天数
    totalCheckIns: number; // 总签到次数
    canCheckIn: boolean; // 当前是否可以签到
  };
  // 符箓系统相关属性
  talisman: TalismanState;
}

// 离线奖励接口
export interface OfflineRewards {
  exp?: number;
  qi?: number;
  gold?: number;
  spiritStone?: number;
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
      recipeCount?: number;
    };
    events?: {
      encountered?: number;
      specificEventIds?: string[];
    };
    totalCultivations?: number;
    totalQiGathered?: number;
    autoCultivationCount?: number;
    autoGatheringCount?: number;
    gathering?: {
      totalCount?: number;
      resourceTypes?: Array<{
        id: string;
        count: number;
      }>;
    };
    monsters?: Array<{
      id: string;
      count?: number;
    }>;
  };
  rewards: {
    resources?: AchievementRewardResources;
    skills?: string[];
    exp?: number;
    recipes?: string[]; // 炼丹配方奖励
    equipment?: string[]; // 装备奖励
    pills?: string[]; // 丹药奖励
    achievements?: string[]; // 成就奖励
    reputation?: number; // 声望奖励
  };
  completed: boolean;
  accepted: boolean; // 是否已接受
  rewardClaimed: boolean; // 是否已领取奖励
  dueDate?: number; // 截止日期（用于限时任务）
  questChain?: string; // 所属任务链ID
  nextQuest?: string; // 后续任务ID
  progress?: Record<string, number>; // 任务进度跟踪
  priority?: 'high' | 'medium' | 'low'; // 任务优先级
}

// 事件触发条件接口
export interface EventTriggers {
  actionType: string; // 触发的操作类型 (cultivate, gatherQi, alchemy, any)
  probability: number; // 触发概率 (0-1)
  levelRequirement?: CultivationLevel; // 境界要求
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'; // 时间要求
  season?: 'spring' | 'summer' | 'autumn' | 'winter'; // 季节要求
  weather?: 'clear' | 'rainy' | 'snowy' | 'foggy'; // 天气要求
  cooldown?: number; // 冷却时间（秒）
  requiredEventIds?: string[]; // 需要先触发的事件
  requiredQuestIds?: string[]; // 需要完成的任务
}

// 事件结果接口
export interface EventOutcome {
  probability: number;
  result: string;
  effects: {
    resources?: AchievementRewardResources;
    exp?: number;
    cultivationSpeedBoost?: number;
    breakthroughBonus?: boolean;
    gatheringSpeedBoost?: number;
    alchemySuccessRateBoost?: number;
    skillExp?: Record<string, number>;
    reputationChange?: number;
    questTrigger?: string;
    newEvent?: string;
    petEncounter?: string;
    monsterEncounter?: string;
    [key: string]: any;
  };
  nextEvent?: string; // 后续事件ID
}

// 事件选择接口
export interface EventChoice {
  id: string;
  text: string;
  requirements?: {
    level?: CultivationLevel;
    resources?: Partial<Resources>;
    skills?: { id: string; level: number }[];
    alchemySuccess?: number;
    gatheringCount?: number;
    monsterKills?: number;
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
// 成就奖励资源接口（允许pills为数字类型）
export interface AchievementRewardResources {
  qi?: number;
  gold?: number;
  pills?: number | Pill[];
  materials?: number;
  spiritFruit?: number;
  spiritGrass?: number;
  spiritWater?: number;
  spiritStone?: number;
  spiritCrystal?: number;
  heavenlyHerb?: number;
  immortalFruit?: number;
  divineEssence?: number;
  spiritPaper?: number;
}

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
    resources?: AchievementRewardResources;
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
  | '回春丹'
  | '洗髓丹'
  | '破障丹'
  | '固元丹'
  | '青冥丹'
  | '紫极丹'
  | '玄元丹'
  | '混元丹'
  | '灵光丹'
  | '神息丹'
  | '金刚丹';

// 丹药品质类型
export type PillQuality = 'low' | 'normal' | 'high' | 'perfect' | 'celestial';

// 丹药接口
export interface Pill {
  id: string;
  name: string;
  description: string;
  type: PillType;
  quality: PillQuality;
  effect: {
    cultivationSpeed?: number;
    breakthroughChance?: number;
    healthRegen?: number;
    resourceGatheringSpeed?: number;
    poisonResistance?: number;
    qiRegen?: number;
    alchemySuccessRate?: number;
    spiritSense?: number;
    damageResistance?: number;
    skillExpBoost?: number;
    reputationBoost?: number;
  };
  duration: number; // 效果持续时间（秒）
  stackable: boolean; // 是否可叠加
  maxStacks: number; // 最大叠加数量
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
  duration: number; // 炼制时间（秒）
  requiredLevel: CultivationLevel;
  baseSuccessRate: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  expGain: number;
  qualityChances?: {
    low: number;
    normal: number;
    high: number;
    perfect: number;
    celestial: number;
  };
  failurePenalty?: {
    resourceLossRatio?: number; // 资源损失比例 (0-1)
    expLoss?: number;
    cooldown?: number;
  };
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
  skillLevel: number; // 炼丹技能等级
  skillExp: number; // 炼丹技能经验
  maxSkillExp: number; // 升级所需经验
  qualityModifier: number; // 品质提升修饰符
  totalQualityPoints: number; // 总品质点数
  activePills: Array<{
    pill: Pill;
    startTime: number;
  }>; // 当前激活的丹药效果
  knownPills: string[]; // 已知的丹药ID列表
  maxConcurrentPills: number; // 最大同时使用的丹药数量
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

// 探险系统相关接口

// 探险区域类型
export type ExplorationAreaType = 'mountain' | 'forest' | 'cave' | 'ruins' | 'lake' | 'desert' | 'sky' | 'hell';

// 探险资源范围接口
export interface ExplorationResourceRange {
  min: number;
  max: number;
}

// 探险区域接口
export interface ExplorationArea {
  id: string;
  name: string;
  description: string;
  type: ExplorationAreaType;
  requiredLevel: CultivationLevel;
  duration: number; // 探险时间（秒）
  baseSuccessRate: number; // 基础成功率
  rewards: {
    resources?: Record<string, ExplorationResourceRange>;
    pills?: { id: string; quantity: number; chance: number }[];
    equipment?: { id: string; quantity: number; chance: number }[];
    exp: number;
    reputation?: number;
  };
  encounters: {
    monster?: { id: string; chance: number }[];
    event?: { id: string; chance: number }[];
    pet?: { id: string; chance: number }[];
    treasure?: { chance: number };
  };
  difficulty: 'easy' | 'normal' | 'hard' | 'epic' | 'legendary';
  cooldown: number; // 冷却时间（秒）
  unlockRequirements?: {
    quests?: string[];
    achievements?: string[];
    level?: CultivationLevel;
  };
  recommendedLevel: CultivationLevel;
}

// 探险奖励类型
export interface ExplorationRewards {
  resources?: Resources;
  pills?: Pill[];
  equipment?: Equipment[];
  items?: any[];
  exp: number;
  reputation: number;
}

// 探险结果接口
export interface ExplorationResult {
  success: boolean;
  areaId: string;
  areaName: string;
  timestamp: number;
  rewards?: ExplorationRewards;
  encounterType?: 'monster' | 'event' | 'pet' | 'treasure' | 'none';
  encounterId?: string;
  message: string;
  eventText?: string; // 探险过程中的事件文本
  difficulty: string;
}

// 探险状态接口
export interface ExplorationState {
  areas: ExplorationArea[]; // 已解锁的探险区域
  currentExploration?: {
    areaId: string;
    startTime: number;
    duration: number;
    difficulty: string;
    eventText?: string;
  } | null; // 当前正在进行的探险
  isExploring: boolean; // 是否正在探险
  lastExploreTime: number; // 上次探险时间
  lastEventUpdate: number; // 上次事件更新时间
  progress: number; // 探险进度
  totalExplorations: number; // 总探险次数
  successfulExplorations: number; // 成功探险次数
  failedExplorations: number; // 失败探险次数
  explorationSkillLevel: number; // 探险技能等级
  explorationSkillExp: number; // 探险技能经验
  maxExplorationSkillExp: number; // 升级所需经验
  areaCooldowns: Record<string, number>; // 各区域的冷却时间（时间戳）
  explorationHistory: ExplorationResult[]; // 探险历史记录
  explorationCount: number; // 探险次数计数
  skillLevel: number; // 探险技能等级（备用属性）
}

// 符箓系统相关接口

// 符箓类型
export type TalismanType = 'attack' | 'defense' | 'cultivation' | 'exploration' | 'utility';

// 符箓接口
export interface Talisman {
  id: string;
  name: string;
  description: string;
  type: TalismanType;
  effect: {
    attackBoost?: number;
    defenseBoost?: number;
    cultivationSpeedBoost?: number;
    qiGatherRateBoost?: number;
    explorationSuccessRateBoost?: number;
    damageReduction?: number;
    [key: string]: any;
  };
  duration: number; // 效果持续时间（秒）
  cooldown: number; // 冷却时间（秒）
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  value: number;
}

// 符箓制作配方接口
export interface TalismanRecipe {
  id: string;
  name: string;
  description: string;
  talismanId: string;
  ingredients: {
    id: string;
    quantity: number;
  }[];
  requiredLevel: CultivationLevel;
  baseSuccessRate: number;
  expGain: number;
  duration: number; // 制作时间（秒）
}

// 符箓状态接口
export interface TalismanState {
  recipes: TalismanRecipe[]; // 已解锁的符箓配方
  currentTalisman?: string; // 当前正在制作的符箓ID
  progress: number; // 制作进度 (0-100)
  isCrafting: boolean; // 是否正在制作符箓
  startTime?: number; // 开始制作的时间
  lastCraftTime: number; // 上次制作时间
  successCount: number; // 成功制作次数
  failedCount: number; // 失败制作次数
  skillLevel: number; // 符箓制作技能等级
  skillExp: number; // 符箓制作技能经验
  maxSkillExp: number; // 升级所需经验
  activeTalismans: Array<{
    talisman: Talisman;
    startTime: number;
  }>; // 当前激活的符箓效果
  knownTalismans: string[]; // 已知的符箓ID列表
  maxConcurrentTalismans: number; // 最大同时使用的符箓数量
  inventory: Talisman[]; // 符箓背包
}