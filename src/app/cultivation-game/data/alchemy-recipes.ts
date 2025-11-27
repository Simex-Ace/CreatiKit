import { AlchemyRecipe, CultivationLevel } from '../types';

// 炼丹配方数据
export const alchemyRecipes: AlchemyRecipe[] = [
  {
    id: 'recipe_1',
    name: '聚气丹',
    description: '帮助修炼者凝聚灵气的基础丹药。',
    pills: ['pill_1'],
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
    id: 'recipe_2',
    name: '培元丹',
    description: '固本培元，提升修炼者的基础素质。',
    pills: ['pill_2'],
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
    rarity: 'common',
    expGain: 40
  },
  {
    id: 'recipe_3',
    name: '筑基丹',
    description: '突破到筑基期所需的关键丹药。',
    pills: ['pill_3'],
    ingredients: [
      { id: 'spiritGrass', quantity: 5 },
      { id: 'spiritStone', quantity: 3 },
      { id: 'spiritFruit', quantity: 2 }
    ],
    duration: 20,
    requiredLevel: 'qi_refining_3',
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
    rarity: 'rare',
    expGain: 100
  },
  {
    id: 'recipe_4',
    name: '金丹丹',
    description: '突破到金丹期所需的珍贵丹药。',
    pills: ['pill_4'],
    ingredients: [
      { id: 'spiritGrass', quantity: 8 },
      { id: 'spiritCrystal', quantity: 5 },
      { id: 'spiritFruit', quantity: 4 },
      { id: 'heavenlyHerb', quantity: 1 }
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
    rarity: 'epic',
    expGain: 200
  },
  {
    id: 'recipe_5',
    name: '元婴丹',
    description: '突破到元婴期所需的传说丹药。',
    pills: ['pill_5'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 3 },
      { id: 'spiritCrystal', quantity: 8 },
      { id: 'immortalFruit', quantity: 2 },
      { id: 'divineEssence', quantity: 1 }
    ],
    duration: 60,
    requiredLevel: 'golden_core_3',
    baseSuccessRate: 0.2,
    qualityChances: {
      celestial: 0.01,
      perfect: 0.06,
      high: 0.26,
      normal: 0.86,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.8
    },
    rarity: 'legendary',
    expGain: 500
  },
  // 新增丹药配方
  {
    id: 'recipe_6',
    name: '气血丹',
    description: '补充修炼者气血的丹药，适合战斗后使用。',
    pills: ['pill_6'],
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
    id: 'recipe_7',
    name: '通灵丹',
    description: '提升修炼者感知能力，增加发现灵物的几率。',
    pills: ['pill_7'],
    ingredients: [
      { id: 'spiritGrass', quantity: 4 },
      { id: 'spiritCrystal', quantity: 1 },
      { id: 'spiritFruit', quantity: 2 }
    ],
    duration: 15,
    requiredLevel: 'foundation_1',
    baseSuccessRate: 0.75,
    qualityChances: {
      celestial: 0.05,
      perfect: 0.2,
      high: 0.5,
      normal: 0.9,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.5
    },
    rarity: 'rare',
    expGain: 60
  },
  {
    id: 'recipe_8',
    name: '避毒丹',
    description: '能够抵御大部分毒物的丹药，适合探险时使用。',
    pills: ['pill_8'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 1 },
      { id: 'spiritGrass', quantity: 3 },
      { id: 'spiritWater', quantity: 2 }
    ],
    duration: 25,
    requiredLevel: 'foundation_2',
    baseSuccessRate: 0.7,
    qualityChances: {
      celestial: 0.05,
      perfect: 0.2,
      high: 0.5,
      normal: 0.9,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.8
    },
    rarity: 'rare',
    expGain: 80
  },
  {
    id: 'recipe_9',
    name: '化神丹',
    description: '突破到化神期所需的顶级丹药。',
    pills: ['pill_9'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 5 },
      { id: 'spiritCrystal', quantity: 10 },
      { id: 'immortalFruit', quantity: 4 },
      { id: 'divineEssence', quantity: 2 }
    ],
    duration: 120,
    requiredLevel: 'nascent_soul_3',
    baseSuccessRate: 0.15,
    qualityChances: {
      celestial: 0.15,
      perfect: 0.4,
      high: 0.7,
      normal: 0.95,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.7
    },
    rarity: 'legendary',
    expGain: 1000
  },
  {
    id: 'recipe_10',
    name: '回春丹',
    description: '快速恢复伤势的神奇丹药。',
    pills: ['pill_10'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 2 },
      { id: 'spiritGrass', quantity: 4 },
      { id: 'spiritWater', quantity: 3 }
    ],
    duration: 30,
    requiredLevel: 'foundation_3',
    baseSuccessRate: 0.65,
    qualityChances: {
      celestial: 0.08,
      perfect: 0.28,
      high: 0.6,
      normal: 0.9,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.6
    },
    rarity: 'epic',
    expGain: 150
  },
  // 新增丹药配方
  {
    id: 'recipe_11',
    name: '洗髓丹',
    description: '洗经伐髓，去除体内杂质，提升修炼资质。',
    pills: ['pill_11'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 1 },
      { id: 'spiritGrass', quantity: 5 },
      { id: 'spiritStone', quantity: 3 },
      { id: 'spiritWater', quantity: 2 }
    ],
    duration: 40,
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
    rarity: 'rare',
    expGain: 180
  },
  {
    id: 'recipe_12',
    name: '破障丹',
    description: '打破修炼瓶颈，提高突破成功率。',
    pills: ['pill_12'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 2 },
      { id: 'spiritCrystal', quantity: 3 },
      { id: 'spiritGrass', quantity: 6 }
    ],
    duration: 30,
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
      resourceLossRatio: 0.7
    },
    rarity: 'epic',
    expGain: 250
  },
  {
    id: 'recipe_13',
    name: '固元丹',
    description: '稳固真元，防止走火入魔。',
    pills: ['pill_13'],
    ingredients: [
      { id: 'spiritGrass', quantity: 4 },
      { id: 'spiritStone', quantity: 3 },
      { id: 'spiritWater', quantity: 3 },
      { id: 'spiritFruit', quantity: 2 }
    ],
    duration: 25,
    requiredLevel: 'qi_refining_4',
    baseSuccessRate: 0.65,
    qualityChances: {
      celestial: 0.002,
      perfect: 0.012,
      high: 0.062,
      normal: 0.462,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.5
    },
    rarity: 'rare',
    expGain: 120
  },
  {
    id: 'recipe_14',
    name: '青冥丹',
    description: '蕴含青冥之气，提升灵气容量。',
    pills: ['pill_14'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 2 },
      { id: 'spiritCrystal', quantity: 4 },
      { id: 'spiritFruit', quantity: 3 },
      { id: 'spiritWater', quantity: 2 }
    ],
    duration: 50,
    requiredLevel: 'foundation_2',
    baseSuccessRate: 0.6,
    qualityChances: {
      celestial: 0.003,
      perfect: 0.018,
      high: 0.088,
      normal: 0.538,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.6
    },
    rarity: 'epic',
    expGain: 200
  },
  {
    id: 'recipe_15',
    name: '紫极丹',
    description: '紫色极品丹药，大幅提升修炼速度。',
    pills: ['pill_15'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 4 },
      { id: 'spiritCrystal', quantity: 6 },
      { id: 'immortalFruit', quantity: 2 },
      { id: 'divineEssence', quantity: 1 }
    ],
    duration: 80,
    requiredLevel: 'golden_core_2',
    baseSuccessRate: 0.4,
    qualityChances: {
      celestial: 0.01,
      perfect: 0.06,
      high: 0.26,
      normal: 0.86,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.8
    },
    rarity: 'legendary',
    expGain: 600
  },
  {
    id: 'recipe_16',
    name: '玄元丹',
    description: '蕴含玄元之气，提升各方面能力。',
    pills: ['pill_16'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 3 },
      { id: 'spiritCrystal', quantity: 5 },
      { id: 'spiritStone', quantity: 4 },
      { id: 'spiritFruit', quantity: 3 }
    ],
    duration: 60,
    requiredLevel: 'golden_core_1',
    baseSuccessRate: 0.45,
    qualityChances: {
      celestial: 0.008,
      perfect: 0.048,
      high: 0.198,
      normal: 0.748,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.7
    },
    rarity: 'legendary',
    expGain: 450
  },
  {
    id: 'recipe_17',
    name: '混元丹',
    description: '传说中的混元丹药，拥有强大的全能效果。',
    pills: ['pill_17'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 5 },
      { id: 'immortalFruit', quantity: 4 },
      { id: 'spiritCrystal', quantity: 10 },
      { id: 'divineEssence', quantity: 3 }
    ],
    duration: 180,
    requiredLevel: 'nascent_soul_2',
    baseSuccessRate: 0.2,
    qualityChances: {
      celestial: 0.15,
      perfect: 0.4,
      high: 0.7,
      normal: 0.95,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.9
    },
    rarity: 'legendary',
    expGain: 1500
  },
  {
    id: 'recipe_18',
    name: '灵光丹',
    description: '散发灵光，提升灵气吸收效率。',
    pills: ['pill_18'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 2 },
      { id: 'spiritCrystal', quantity: 4 },
      { id: 'spiritGrass', quantity: 5 },
      { id: 'spiritWater', quantity: 3 }
    ],
    duration: 50,
    requiredLevel: 'foundation_3',
    baseSuccessRate: 0.55,
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
    rarity: 'epic',
    expGain: 300
  },
  {
    id: 'recipe_19',
    name: '神息丹',
    description: '蕴含神息之力，提升精神感知。',
    pills: ['pill_19'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 3 },
      { id: 'spiritCrystal', quantity: 5 },
      { id: 'immortalFruit', quantity: 2 },
      { id: 'spiritWater', quantity: 2 }
    ],
    duration: 60,
    requiredLevel: 'golden_core_1',
    baseSuccessRate: 0.5,
    qualityChances: {
      celestial: 0.008,
      perfect: 0.038,
      high: 0.188,
      normal: 0.738,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.75
    },
    rarity: 'epic',
    expGain: 400
  },
  {
    id: 'recipe_20',
    name: '金刚丹',
    description: '金刚不坏，提升防御力和抗打击能力。',
    pills: ['pill_20'],
    ingredients: [
      { id: 'heavenlyHerb', quantity: 2 },
      { id: 'spiritCrystal', quantity: 4 },
      { id: 'spiritStone', quantity: 5 },
      { id: 'spiritGrass', quantity: 4 }
    ],
    duration: 45,
    requiredLevel: 'foundation_2',
    baseSuccessRate: 0.6,
    qualityChances: {
      celestial: 0.005,
      perfect: 0.025,
      high: 0.125,
      normal: 0.625,
      low: 1.0
    },
    failurePenalty: {
      resourceLossRatio: 0.65
    },
    rarity: 'epic',
    expGain: 280
  }
];