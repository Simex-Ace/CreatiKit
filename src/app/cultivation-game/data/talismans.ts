import { Talisman, TalismanRecipe } from '../types';

// 符箓数据
export const talismans: Talisman[] = [
  {
    id: 'talisman_attack',
    name: '攻击符箓',
    description: '临时提升攻击力，在战斗中更具优势',
    type: 'attack',
    effect: {
      attackBoost: 0.2
    },
    duration: 300,
    cooldown: 600,
    rarity: 'common',
    value: 50
  },
  {
    id: 'talisman_defense',
    name: '防御符箓',
    description: '增强防御力，减少受到的伤害',
    type: 'defense',
    effect: {
      defenseBoost: 0.2
    },
    duration: 300,
    cooldown: 600,
    rarity: 'common',
    value: 50
  },
  {
    id: 'talisman_cultivation',
    name: '修炼符箓',
    description: '提高修炼速度，更快地提升修为',
    type: 'cultivation',
    effect: {
      cultivationSpeedBoost: 0.15
    },
    duration: 600,
    cooldown: 1200,
    rarity: 'common',
    value: 75
  },
  {
    id: 'talisman_qi_gather',
    name: '聚气符箓',
    description: '加快灵气采集速度，获取更多灵气',
    type: 'utility',
    effect: {
      qiGatherRateBoost: 0.2
    },
    duration: 600,
    cooldown: 1200,
    rarity: 'common',
    value: 75
  },
  {
    id: 'talisman_exploration',
    name: '探险符箓',
    description: '提高探险成功率，获得更好的奖励',
    type: 'exploration',
    effect: {
      explorationSuccessRateBoost: 0.1
    },
    duration: 1800,
    cooldown: 3600,
    rarity: 'rare',
    value: 150
  },
  {
    id: 'talisman_damage_reduction',
    name: '减伤符箓',
    description: '减少受到的伤害，在危险的战斗中保护自己',
    type: 'defense',
    effect: {
      damageReduction: 0.15
    },
    duration: 300,
    cooldown: 600,
    rarity: 'rare',
    value: 100
  },
  {
    id: 'talisman_powerful_attack',
    name: '强力攻击符箓',
    description: '大幅提升攻击力，适合挑战强大的敌人',
    type: 'attack',
    effect: {
      attackBoost: 0.4
    },
    duration: 180,
    cooldown: 900,
    rarity: 'epic',
    value: 250
  },
  {
    id: 'talisman_supreme_cultivation',
    name: '至尊修炼符箓',
    description: '极大提高修炼速度，是突破境界的得力助手',
    type: 'cultivation',
    effect: {
      cultivationSpeedBoost: 0.4
    },
    duration: 900,
    cooldown: 3600,
    rarity: 'legendary',
    value: 500
  }
];

// 符箓制作配方
export const talismanRecipes: TalismanRecipe[] = [
  {
    id: 'recipe_attack_talisman',
    name: '攻击符箓配方',
    description: '制作攻击符箓的基础配方',
    talismanId: 'talisman_attack',
    ingredients: [
      { id: 'spiritGrass', quantity: 5 },
      { id: 'materials', quantity: 10 }
    ],
    requiredLevel: 'qi_refining_1',
    baseSuccessRate: 0.8,
    expGain: 20,
    duration: 10
  },
  {
    id: 'recipe_defense_talisman',
    name: '防御符箓配方',
    description: '制作防御符箓的基础配方',
    talismanId: 'talisman_defense',
    ingredients: [
      { id: 'spiritGrass', quantity: 5 },
      { id: 'materials', quantity: 10 }
    ],
    requiredLevel: 'qi_refining_1',
    baseSuccessRate: 0.8,
    expGain: 20,
    duration: 10
  },
  {
    id: 'recipe_cultivation_talisman',
    name: '修炼符箓配方',
    description: '制作修炼符箓的基础配方',
    talismanId: 'talisman_cultivation',
    ingredients: [
      { id: 'spiritGrass', quantity: 8 },
      { id: 'spiritFruit', quantity: 2 },
      { id: 'materials', quantity: 15 }
    ],
    requiredLevel: 'qi_refining_2',
    baseSuccessRate: 0.75,
    expGain: 30,
    duration: 15
  },
  {
    id: 'recipe_qi_gather_talisman',
    name: '聚气符箓配方',
    description: '制作聚气符箓的基础配方',
    talismanId: 'talisman_qi_gather',
    ingredients: [
      { id: 'spiritGrass', quantity: 8 },
      { id: 'spiritWater', quantity: 3 },
      { id: 'materials', quantity: 15 }
    ],
    requiredLevel: 'qi_refining_2',
    baseSuccessRate: 0.75,
    expGain: 30,
    duration: 15
  },
  {
    id: 'recipe_exploration_talisman',
    name: '探险符箓配方',
    description: '制作探险符箓的配方',
    talismanId: 'talisman_exploration',
    ingredients: [
      { id: 'spiritGrass', quantity: 10 },
      { id: 'spiritStone', quantity: 5 },
      { id: 'materials', quantity: 20 }
    ],
    requiredLevel: 'foundation_1',
    baseSuccessRate: 0.7,
    expGain: 50,
    duration: 20
  },
  {
    id: 'recipe_damage_reduction_talisman',
    name: '减伤符箓配方',
    description: '制作减伤符箓的配方',
    talismanId: 'talisman_damage_reduction',
    ingredients: [
      { id: 'spiritGrass', quantity: 10 },
      { id: 'spiritStone', quantity: 5 },
      { id: 'materials', quantity: 20 }
    ],
    requiredLevel: 'foundation_1',
    baseSuccessRate: 0.7,
    expGain: 50,
    duration: 20
  },
  {
    id: 'recipe_powerful_attack_talisman',
    name: '强力攻击符箓配方',
    description: '制作强力攻击符箓的高级配方',
    talismanId: 'talisman_powerful_attack',
    ingredients: [
      { id: 'spiritGrass', quantity: 15 },
      { id: 'spiritCrystal', quantity: 3 },
      { id: 'heavenlyHerb', quantity: 1 },
      { id: 'materials', quantity: 30 }
    ],
    requiredLevel: 'golden_core_1',
    baseSuccessRate: 0.6,
    expGain: 100,
    duration: 30
  },
  {
    id: 'recipe_supreme_cultivation_talisman',
    name: '至尊修炼符箓配方',
    description: '制作至尊修炼符箓的顶级配方',
    talismanId: 'talisman_supreme_cultivation',
    ingredients: [
      { id: 'spiritGrass', quantity: 20 },
      { id: 'spiritCrystal', quantity: 5 },
      { id: 'heavenlyHerb', quantity: 3 },
      { id: 'immortalFruit', quantity: 1 },
      { id: 'materials', quantity: 50 }
    ],
    requiredLevel: 'nascent_soul_1',
    baseSuccessRate: 0.5,
    expGain: 200,
    duration: 60
  }
];
