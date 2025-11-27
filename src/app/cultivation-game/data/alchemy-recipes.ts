import { AlchemyRecipe, CultivationLevel } from '../types';

// 炼丹配方数据
export const alchemyRecipes: AlchemyRecipe[] = [
  // 恢复法力值的丹药配方
  {
    id: 'recipe_mana_small',
    name: '法力丹',
    description: '基础法力恢复丹药，回复少量法力值。',
    pills: ['pill_mana_small'],
    ingredients: [
      { id: 'spiritGrass', quantity: 2 },
      { id: 'spiritWater', quantity: 1 }
    ],
    duration: 5,
    requiredLevel: 'qi_refining_1',
    baseSuccessRate: 0.8,
    qualityChances: {
      celestial: 0.001,
      perfect: 0.006,
      high: 0.026,
      normal: 0.326,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.5
    },
    rarity: 'common',
    expGain: 20
  },
  {
    id: 'recipe_mana_medium',
    name: '大法力丹',
    description: '中级法力恢复丹药，回复中量法力值。',
    pills: ['pill_mana_medium'],
    ingredients: [
      { id: 'spiritGrass', quantity: 3 },
      { id: 'spiritStone', quantity: 1 },
      { id: 'spiritWater', quantity: 2 }
    ],
    duration: 10,
    requiredLevel: 'qi_refining_2',
    baseSuccessRate: 0.7,
    qualityChances: {
      celestial: 0.001,
      perfect: 0.006,
      high: 0.026,
      normal: 0.326,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.5
    },
    rarity: 'rare',
    expGain: 40
  },
  {
    id: 'recipe_mana_large',
    name: '超级法力丹',
    description: '高级法力恢复丹药，回复大量法力值。',
    pills: ['pill_mana_large'],
    ingredients: [
      { id: 'spiritGrass', quantity: 5 },
      { id: 'spiritStone', quantity: 3 },
      { id: 'spiritFruit', quantity: 2 }
    ],
    duration: 20,
    requiredLevel: 'foundation_1',
    baseSuccessRate: 0.6,
    qualityChances: {
      celestial: 0.002,
      perfect: 0.012,
      high: 0.062,
      normal: 0.462,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.6
    },
    rarity: 'epic',
    expGain: 100
  },
  {
    id: 'recipe_mana_max',
    name: '终极法力丹',
    description: '顶级法力恢复丹药，回复全部法力值。',
    pills: ['pill_mana_max'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 2 },
      { id: 'spiritCrystal', quantity: 3 },
      { id: 'immortalFruit', quantity: 1 }
    ],
    duration: 30,
    requiredLevel: 'foundation_3',
    baseSuccessRate: 0.4,
    qualityChances: {
      celestial: 0.005,
      perfect: 0.025,
      high: 0.125,
      normal: 0.625,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.7
    },
    rarity: 'legendary',
    expGain: 200
  },
  
  // 恢复生命值的丹药配方
  {
    id: 'recipe_health_small',
    name: '生命丹',
    description: '基础生命恢复丹药，回复少量生命值。',
    pills: ['pill_health_small'],
    ingredients: [
      { id: 'spiritGrass', quantity: 2 },
      { id: 'spiritFruit', quantity: 1 },
      { id: 'spiritWater', quantity: 1 }
    ],
    duration: 8,
    requiredLevel: 'qi_refining_1',
    baseSuccessRate: 0.85,
    qualityChances: {
      celestial: 0.001,
      perfect: 0.006,
      high: 0.026,
      normal: 0.326,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.5
    },
    rarity: 'common',
    expGain: 30
  },
  {
    id: 'recipe_health_medium',
    name: '大生命丹',
    description: '中级生命恢复丹药，回复中量生命值。',
    pills: ['pill_health_medium'],
    ingredients: [
      { id: 'spiritGrass', quantity: 4 },
      { id: 'spiritStone', quantity: 2 },
      { id: 'spiritFruit', quantity: 2 }
    ],
    duration: 15,
    requiredLevel: 'qi_refining_3',
    baseSuccessRate: 0.75,
    qualityChances: {
      celestial: 0.002,
      perfect: 0.012,
      high: 0.062,
      normal: 0.462,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.6
    },
    rarity: 'rare',
    expGain: 60
  },
  {
    id: 'recipe_health_large',
    name: '超级生命丹',
    description: '高级生命恢复丹药，回复大量生命值。',
    pills: ['pill_health_large'],
    ingredients: [
      { id: 'spiritGrass', quantity: 6 },
      { id: 'spiritCrystal', quantity: 2 },
      { id: 'heavenlyHerb', quantity: 1 },
      { id: 'spiritFruit', quantity: 3 }
    ],
    duration: 25,
    requiredLevel: 'foundation_2',
    baseSuccessRate: 0.65,
    qualityChances: {
      celestial: 0.003,
      perfect: 0.018,
      high: 0.088,
      normal: 0.538,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.7
    },
    rarity: 'epic',
    expGain: 120
  },
  {
    id: 'recipe_health_max',
    name: '终极生命丹',
    description: '顶级生命恢复丹药，回复全部生命值。',
    pills: ['pill_health_max'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 3 },
      { id: 'spiritCrystal', quantity: 4 },
      { id: 'immortalFruit', quantity: 2 }
    ],
    duration: 40,
    requiredLevel: 'foundation_3',
    baseSuccessRate: 0.5,
    qualityChances: {
      celestial: 0.005,
      perfect: 0.025,
      high: 0.125,
      normal: 0.625,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.8
    },
    rarity: 'legendary',
    expGain: 300
  }
];