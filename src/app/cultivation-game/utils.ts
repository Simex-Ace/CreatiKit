import { CultivationLevel, GameState, Resources, Skill, OfflineRewards } from './types';

// 修真境界顺序和升级需求
export const cultivationLevels: { level: CultivationLevel; maxExp: number; baseQiCapacity: number; baseHealth: number }[] = [
  { level: 'qi_refining_1', maxExp: 100, baseQiCapacity: 100, baseHealth: 100 },
  { level: 'qi_refining_2', maxExp: 300, baseQiCapacity: 200, baseHealth: 150 },
  { level: 'qi_refining_3', maxExp: 600, baseQiCapacity: 350, baseHealth: 200 },
  { level: 'foundation_1', maxExp: 1200, baseQiCapacity: 600, baseHealth: 300 },
  { level: 'foundation_2', maxExp: 2400, baseQiCapacity: 1000, baseHealth: 450 },
  { level: 'foundation_3', maxExp: 4800, baseQiCapacity: 1600, baseHealth: 650 },
  { level: 'golden_core_1', maxExp: 10000, baseQiCapacity: 2500, baseHealth: 1000 },
  { level: 'golden_core_2', maxExp: 20000, baseQiCapacity: 4000, baseHealth: 1500 },
  { level: 'golden_core_3', maxExp: 40000, baseQiCapacity: 6500, baseHealth: 2200 },
  { level: 'nascent_soul_1', maxExp: 80000, baseQiCapacity: 10000, baseHealth: 3000 },
  { level: 'nascent_soul_2', maxExp: 160000, baseQiCapacity: 15000, baseHealth: 4500 },
  { level: 'nascent_soul_3', maxExp: 320000, baseQiCapacity: 22000, baseHealth: 6500 },
  { level: 'spirit_transformation_1', maxExp: 640000, baseQiCapacity: 30000, baseHealth: 10000 },
  { level: 'spirit_transformation_2', maxExp: 1280000, baseQiCapacity: 40000, baseHealth: 15000 },
  { level: 'spirit_transformation_3', maxExp: 2560000, baseQiCapacity: 50000, baseHealth: 20000 }
];

// 获取下一个境界
export function getNextCultivationLevel(currentLevel: CultivationLevel): CultivationLevel | null {
  const currentIndex = cultivationLevels.findIndex(level => level.level === currentLevel);
  if (currentIndex >= 0 && currentIndex < cultivationLevels.length - 1) {
    return cultivationLevels[currentIndex + 1].level;
  }
  return null; // 已是最高境界
}

// 获取境界信息
export function getCultivationLevelInfo(level: CultivationLevel) {
  return cultivationLevels.find(info => info.level === level);
}

// 计算最大生命值
export function calculateMaxHealth(state: GameState): number {
  // 添加全面的空值检查
  if (!state || !state.cultivation) {
    return 100; // 返回基础值，避免崩溃
  }
  
  const levelInfo = getCultivationLevelInfo(state.cultivation.level);
  const baseHealth = levelInfo?.baseHealth || 100;
  const constitutionBonus = (state.cultivation.attributes?.constitution || 0) * 5;
  return baseHealth + constitutionBonus;
}

// 计算属性对特定系统的加成
export function calculateAttributeBonus(state: GameState, bonusType: string): number {
  const attributes = state.cultivation.attributes || {
    constitution: 0,
    rootBone: 0,
    comprehension: 0,
    spirituality: 0,
    charm: 0
  };
  
  switch (bonusType) {
    case 'cultivationSpeed':
      return attributes.constitution * 0.01; // 每点体质+1%修炼速度
    case 'breakthroughChance':
      return attributes.rootBone * 0.005; // 每点根骨+0.5%突破成功率
    case 'qiGatherRate':
      return attributes.spirituality * 0.01; // 每点灵性+1%灵气采集速度
    case 'expGain':
      return attributes.comprehension * 0.01; // 每点悟性+1%经验获得
    case 'resourceGathering':
      return attributes.rootBone * 0.01; // 每点根骨+1%资源采集效率
    case 'alchemySuccess':
      return attributes.comprehension * 0.005; // 每点悟性+0.5%炼丹成功率
    case 'talismanSuccess':
      return attributes.spirituality * 0.005; // 每点灵性+0.5%符箓制作成功率
    case 'explorationSuccess':
      return attributes.spirituality * 0.005; // 每点灵性+0.5%探险成功率
    case 'sectContribution':
      return attributes.charm * 0.01; // 每点魅力+1%宗门贡献
    case 'petCapture':
      return attributes.charm * 0.005; // 每点魅力+0.5%宠物捕捉成功率
    default:
      return 0;
  }
}

// 格式化属性值显示
export function formatAttributeValue(value: number): string {
  return value.toFixed(0);
}

// 将境界标识符转换为中文名称
export function getCultivationLevelName(level: CultivationLevel): string {
  const levelMap: Partial<Record<CultivationLevel, string>> = {
    // 练气期
    'qi_refining_1': '练气期一层',
    'qi_refining_2': '练气期二层',
    'qi_refining_3': '练气期三层',
    'qi_refining_4': '练气期四层',
    'qi_refining_5': '练气期五层',
    'qi_refining_6': '练气期六层',
    'qi_refining_7': '练气期七层',
    'qi_refining_8': '练气期八层',
    'qi_refining_9': '练气期九层',
    
    // 筑基期
    'foundation_1': '筑基期一层',
    'foundation_2': '筑基期二层',
    'foundation_3': '筑基期三层',
    'foundation_4': '筑基期四层',
    'foundation_5': '筑基期五层',
    'foundation_6': '筑基期六层',
    'foundation_7': '筑基期七层',
    'foundation_8': '筑基期八层',
    'foundation_9': '筑基期九层',
    
    // 金丹期
    'golden_core_1': '金丹期一层',
    'golden_core_2': '金丹期二层',
    'golden_core_3': '金丹期三层',
    'golden_core_4': '金丹期四层',
    'golden_core_5': '金丹期五层',
    'golden_core_6': '金丹期六层',
    'golden_core_7': '金丹期七层',
    'golden_core_8': '金丹期八层',
    'golden_core_9': '金丹期九层',
    
    // 元婴期
    'nascent_soul_1': '元婴期一层',
    'nascent_soul_2': '元婴期二层',
    'nascent_soul_3': '元婴期三层',
    'nascent_soul_4': '元婴期四层',
    'nascent_soul_5': '元婴期五层',
    'nascent_soul_6': '元婴期六层',
    'nascent_soul_7': '元婴期七层',
    'nascent_soul_8': '元婴期八层',
    'nascent_soul_9': '元婴期九层',
    
    // 化神期
    'spirit_transformation_1': '化神期一层',
    'spirit_transformation_2': '化神期二层',
    'spirit_transformation_3': '化神期三层'
  };
  return levelMap[level] || level;
}

// 检查是否可以升级
export function canLevelUp(state: GameState): boolean {
  const nextLevel = getNextCultivationLevel(state.cultivation.level);
  if (!nextLevel) return false;
  return state.cultivation.exp >= state.cultivation.maxExp;
}

// 执行升级
export function levelUp(state: GameState): GameState {
  console.log('========= levelUp 函数开始 =========');
  console.log('当前状态:', state.cultivation.level, '当前经验:', state.cultivation.exp);
  
  const nextLevel = getNextCultivationLevel(state.cultivation.level);
  console.log('下一个境界:', nextLevel);
  
  if (!nextLevel) {
    console.log('已经是最高境界，无法再升级');
    return state;
  }

  const nextLevelInfo = getCultivationLevelInfo(nextLevel);
  console.log('下一个境界信息:', nextLevelInfo);
  
  if (!nextLevelInfo) {
    console.log('找不到下一个境界的信息');
    return state;
  }

  // 计算新的最大生命值
  const constitutionBonus = state.cultivation.attributes?.constitution * 5 || 0;
  const newMaxHealth = nextLevelInfo.baseHealth + constitutionBonus;

  // 随机提升1-3点属性
  const attributeKeys = Object.keys(state.cultivation.attributes) as Array<keyof typeof state.cultivation.attributes>;
  const attributesToIncrease = Math.floor(Math.random() * 3) + 1; // 1-3个属性
  const newAttributes = { ...state.cultivation.attributes };
  
  for (let i = 0; i < attributesToIncrease; i++) {
    const randomAttribute = attributeKeys[Math.floor(Math.random() * attributeKeys.length)];
    newAttributes[randomAttribute] += 1;
  }

  const newState = { ...state };
  newState.cultivation = {
    ...state.cultivation,
    level: nextLevel,
    exp: 0, // 升级后经验清零
    maxExp: nextLevelInfo.maxExp,
    qiCapacity: nextLevelInfo.baseQiCapacity + calculateEquipmentBonus(state, 'qiCapacity'),
    cultivationSpeed: calculateCultivationSpeed(state, nextLevel),
    // 更新生命值和属性
    maxHealth: newMaxHealth,
    health: newMaxHealth, // 突破时恢复满生命值
    attributes: newAttributes
  };

  // 升级时清空灵气
  newState.resources = {
    ...state.resources,
    qi: 0
  };

  console.log('升级完成，新状态:', newState.cultivation.level, '新经验:', newState.cultivation.exp);
  console.log('升级后属性:', newState.cultivation.attributes);
  console.log('升级后生命值:', newState.cultivation.health, '/', newState.cultivation.maxHealth);
  console.log('========= levelUp 函数结束 =========');
  
  return newState;
}

// 计算装备加成
export function calculateEquipmentBonus(state: GameState, bonusType: keyof typeof state.cultivation): number {
  return (state.equipment || []).reduce((total, item) => {
    if (item.effects[bonusType as keyof typeof item.effects]) {
      return total + (item.effects[bonusType as keyof typeof item.effects] as number);
    }
    return total;
  }, 0);
}

// 计算修炼速度
export function calculateCultivationSpeed(state: GameState, level?: CultivationLevel): number {
  // 添加全面的空值检查
  if (!state || !state.cultivation) {
    return 1; // 返回基础值，避免崩溃
  }
  
  const baseSpeed = 1 + ((state.skills || []).reduce((speed, skill) => {
    return speed + (skill.effects.cultivationSpeed || 0);
  }, 0));
  
  // 境界加成
  const currentLevel = level || state.cultivation.level;
  const levelIndex = cultivationLevels.findIndex(l => l.level === currentLevel);
  const levelBonus = Math.pow(1.1, levelIndex); // 每境界增加10%修炼速度
  
  // 装备加成
  const equipmentBonus = calculateEquipmentBonus(state, 'cultivationSpeed');
  
  // 体质属性加成
  const attributeBonus = (state.cultivation.attributes?.constitution || 0) * 0.01; // 每点体质+1%修炼速度
  
  return baseSpeed * levelBonus * (1 + attributeBonus) + equipmentBonus;
}

// 计算灵气采集速率
export function calculateQiGatherRate(state: GameState): number {
  // 添加全面的空值检查
  if (!state || !state.cultivation) {
    return 2; // 返回基础值，避免崩溃
  }
  
  const baseRate = 2;
  const skillBonus = (state.skills || []).reduce((rate, skill) => {
    return rate + (skill.effects.qiGatherRate || 0);
  }, 0);
  
  // 境界影响采集速率
  const levelIndex = cultivationLevels.findIndex(l => l.level === state.cultivation.level);
  const levelBonus = Math.pow(1.05, levelIndex); // 每境界增加5%采集速率
  
  // 灵性属性加成
  const attributeBonus = (state.cultivation.attributes?.spirituality || 0) * 0.01; // 每点灵性+1%灵气采集速度
  
  return baseRate * levelBonus * (1 + attributeBonus) + skillBonus;
}

// 格式化数字（如 1000 -> 1K）
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return Math.floor(num / 1000000) + 'M';
  } else if (num >= 1000) {
    return Math.floor(num / 1000) + 'K';
  }
  return Math.floor(num).toString();
}

// 计算离线收益
export function calculateOfflineRewards(state: GameState, offlineTimeMs: number): OfflineRewards {
  const hoursOffline = offlineTimeMs / (1000 * 60 * 60);
  const rewards: OfflineRewards = {};
  
  // 自动修炼收益
  if (state.autoCultivate) {
    const cultivationRate = calculateCultivationSpeed(state);
    rewards.exp = cultivationRate * hoursOffline * 60; // 每分钟的修炼收益
  }
  
  // 自动采集灵气收益
  if (state.autoGatherQi) {
    const qiRate = calculateQiGatherRate(state);
    rewards.qi = Math.min(
      qiRate * hoursOffline * 60, // 每分钟的灵气收益
      state.cultivation.qiCapacity - state.resources.qi
    );
  }
  
  // 随机获得一些资源
  if (Math.random() < hoursOffline * 0.1) { // 每小时10%几率获得额外奖励
    rewards.gold = Math.floor(Math.random() * 100 * (1 + cultivationLevels.findIndex(l => l.level === state.cultivation.level) * 0.5));
    rewards.pills = Math.floor(Math.random() * 3);
    rewards.spiritFruit = Math.floor(Math.random() * 2);
  }
  
  return rewards;
}

// 创建初始技能列表
export function createInitialSkills(): Skill[] {
  return [
    {
      id: 'qiGather',
      name: '灵气采集',
      description: '提高灵气采集速率',
      level: 1,
      maxLevel: 10,
      unlockLevel: 'qi_refining_1',
      effects: {
        qiGatherRate: 0.5
      }
    },
    {
      id: 'cultivation',
      name: '修炼',
      description: '提高修炼速度',
      level: 1,
      maxLevel: 10,
      unlockLevel: 'qi_refining_1',
      effects: {
        cultivationSpeed: 0.3
      }
    },
    {
      id: 'gathering',
      name: '材料采集',
      description: '提高材料采集效率',
      level: 1,
      maxLevel: 10,
      unlockLevel: 'qi_refining_1',
      effects: {
        gatheringRate: 0.5
      }
    },
    {
      id: 'alchemy',
      name: '炼丹',
      description: '提高炼丹成功率',
      level: 1,
      maxLevel: 10,
      unlockLevel: 'qi_refining_2',
      effects: {
        alchemySuccessRate: 0.1
      }
    }
  ];
}

// 保存游戏状态到本地存储
export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem('cultivationGameSave', JSON.stringify(state));
  } catch (error) {
    console.error('保存游戏失败:', error);
  }
}

// 材料名称映射表（英文到中文）
export const materialNames: Record<string, string> = {
  spiritGrass: '灵草',
  spiritWater: '灵水',
  spiritStone: '灵石',
  gold: '灵石', // 兼容旧的gold键名
  spiritCrystal: '灵晶',
  heavenlyHerb: '天材地宝',
  immortalFruit: '仙果',
  divineEssence: '神髓',
  qi: '灵气',
  spiritPaper: '符纸',
  pills: '丹药',
  materials: '基础材料',
  spiritFruit: '灵果'
};

// 获取材料的中文名称
export function getMaterialName(material: string): string {
  // 确保material是字符串
  if (typeof material !== 'string') {
    return String(material);
  }
  return materialNames[material] || material;
}

// 品质名称映射表（英文到中文）
export const qualityNames: Record<string, string> = {
  celestial: '神级',
  perfect: '完美',
  high: '高品质',
  normal: '普通',
  low: '低品质'
};

// 获取品质的中文名称
export function getQualityName(quality: string): string {
  // 确保quality是字符串
  if (typeof quality !== 'string') {
    return String(quality);
  }
  return qualityNames[quality] || quality;
}

// 从本地存储加载游戏状态
export function loadGameState(): GameState | null {
  try {
    const saved = localStorage.getItem('cultivationGameSave');
    if (saved) {
      return JSON.parse(saved) as GameState;
    }
  } catch (error) {
    console.error('加载游戏失败:', error);
  }
  return null;
}