import { Formation } from '../types';

export const formations: Formation[] = [
  {
    id: 'formation_1',
    name: '聚气阵',
    description: '汇聚周围灵气，提高修炼速度',
    type: 'cultivation',
    unlockLevel: 'qi_refining_1',
    effects: {
      cultivationSpeedBoost: 0.1,
      qiGatherRateBoost: 0.15
    },
    upgradeCost: {
      gold: 100,
      spiritStone: 5
    },
    level: 1,
    maxLevel: 5,
    active: false
  },
  {
    id: 'formation_2',
    name: '防御阵',
    description: '增强防御力，减少受到的伤害',
    type: 'defense',
    unlockLevel: 'qi_refining_3',
    effects: {
      defenseBoostBonus: 0.2
    },
    upgradeCost: {
      gold: 200,
      spiritStone: 10
    },
    level: 1,
    maxLevel: 5,
    active: false
  },
  {
    id: 'formation_3',
    name: '攻击阵',
    description: '增强攻击力，提高战斗伤害',
    type: 'attack',
    unlockLevel: 'foundation_1',
    effects: {
      attackBoostBonus: 0.25
    },
    upgradeCost: {
      gold: 500,
      spiritStone: 20,
      spiritCrystal: 5
    },
    level: 1,
    maxLevel: 5,
    active: false
  }
];
