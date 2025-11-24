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
    successRate: 0.8,
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
    successRate: 0.7,
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
    successRate: 0.6,
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
    successRate: 0.4,
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
    successRate: 0.2,
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
    successRate: 0.85,
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
    successRate: 0.75,
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
    successRate: 0.7,
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
    successRate: 0.15,
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
    successRate: 0.65,
    rarity: 'epic',
    expGain: 150
  }
];