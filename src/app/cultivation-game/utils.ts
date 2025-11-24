import { CultivationLevel, GameState, Resources, Skill, OfflineRewards } from './types';

// 修真境界顺序和升级需求
export const cultivationLevels: { level: CultivationLevel; maxExp: number; baseQiCapacity: number }[] = [
  { level: '练气初期', maxExp: 100, baseQiCapacity: 100 },
  { level: '练气中期', maxExp: 300, baseQiCapacity: 200 },
  { level: '练气后期', maxExp: 600, baseQiCapacity: 350 },
  { level: '筑基初期', maxExp: 1200, baseQiCapacity: 600 },
  { level: '筑基中期', maxExp: 2400, baseQiCapacity: 1000 },
  { level: '筑基后期', maxExp: 4800, baseQiCapacity: 1600 },
  { level: '金丹初期', maxExp: 10000, baseQiCapacity: 2500 },
  { level: '金丹中期', maxExp: 20000, baseQiCapacity: 4000 },
  { level: '金丹后期', maxExp: 40000, baseQiCapacity: 6500 },
  { level: '元婴初期', maxExp: 80000, baseQiCapacity: 10000 },
  { level: '元婴中期', maxExp: 160000, baseQiCapacity: 15000 },
  { level: '元婴后期', maxExp: 320000, baseQiCapacity: 22000 },
  { level: '化神初期', maxExp: 640000, baseQiCapacity: 30000 },
  { level: '化神中期', maxExp: 1280000, baseQiCapacity: 40000 },
  { level: '化神后期', maxExp: 2560000, baseQiCapacity: 50000 }
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

// 检查是否可以升级
export function canLevelUp(state: GameState): boolean {
  const nextLevel = getNextCultivationLevel(state.cultivation.level);
  if (!nextLevel) return false;
  return state.cultivation.exp >= state.cultivation.maxExp;
}

// 执行升级
export function levelUp(state: GameState): GameState {
  const nextLevel = getNextCultivationLevel(state.cultivation.level);
  if (!nextLevel) return state;

  const nextLevelInfo = getCultivationLevelInfo(nextLevel);
  if (!nextLevelInfo) return state;

  const newState = { ...state };
  newState.cultivation = {
    ...state.cultivation,
    level: nextLevel,
    exp: 0, // 升级后经验清零
    maxExp: nextLevelInfo.maxExp,
    qiCapacity: nextLevelInfo.baseQiCapacity + calculateEquipmentBonus(state, 'qiCapacity'),
    cultivationSpeed: calculateCultivationSpeed(state, nextLevel)
  };

  // 升级时清空灵气
  newState.resources = {
    ...state.resources,
    qi: 0
  };

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
  const baseSpeed = 1 + ((state.skills || []).reduce((speed, skill) => {
    return speed + (skill.effects.cultivationSpeed || 0);
  }, 0));
  
  // 境界加成
  const currentLevel = level || state.cultivation.level;
  const levelIndex = cultivationLevels.findIndex(l => l.level === currentLevel);
  const levelBonus = Math.pow(1.1, levelIndex); // 每境界增加10%修炼速度
  
  // 装备加成
  const equipmentBonus = calculateEquipmentBonus(state, 'cultivationSpeed');
  
  return baseSpeed * levelBonus + equipmentBonus;
}

// 计算灵气采集速率
export function calculateQiGatherRate(state: GameState): number {
  const baseRate = 2;
  const skillBonus = (state.skills || []).reduce((rate, skill) => {
    return rate + (skill.effects.qiGatherRate || 0);
  }, 0);
  
  // 境界影响采集速率
  const levelIndex = cultivationLevels.findIndex(l => l.level === state.cultivation.level);
  const levelBonus = Math.pow(1.05, levelIndex); // 每境界增加5%采集速率
  
  return baseRate * levelBonus + skillBonus;
}

// 格式化数字（如 1000 -> 1K）
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
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
      id: 'basic_qi_gather',
      name: '基础聚灵',
      description: '提高灵气采集速率',
      level: 1,
      maxLevel: 10,
      unlockLevel: '练气初期',
      effects: {
        qiGatherRate: 0.5
      }
    },
    {
      id: 'basic_cultivation',
      name: '基础修炼',
      description: '提高修炼速度',
      level: 1,
      maxLevel: 10,
      unlockLevel: '练气初期',
      effects: {
        cultivationSpeed: 0.3
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
  spiritCrystal: '灵晶',
  heavenlyHerb: '天材地宝',
  immortalFruit: '仙果',
  divineEssence: '神髓',
  qi: '灵气',
  gold: '金币',
  pills: '丹药',
  materials: '基础材料',
  spiritFruit: '灵果'
};

// 获取材料的中文名称
export function getMaterialName(material: string): string {
  return materialNames[material] || material;
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