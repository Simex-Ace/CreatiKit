import { AlchemyRecipe } from '../types';

// 炼丹配方定义
export const alchemyRecipes: AlchemyRecipe[] = [
  {
    id: 'recipe_peiyuan',
    name: '培元丹配方',
    description: '培元固本，增强体质',
    pills: ['peiyuan_pill'],
    ingredients: [
      { id: 'spiritGrass', quantity: 2 },
      { id: 'spiritWater', quantity: 1 }
    ],
    duration: 3000,
    requiredLevel: 'qi_refining_1',
    successRate: 0.8,
    rarity: 'common',
    expGain: 50
  },
  {
    id: 'recipe_juqi',
    name: '聚气丹配方',
    description: '汇聚灵气，加速修炼',
    pills: ['juqi_pill'],
    ingredients: [
      { id: 'spiritGrass', quantity: 3 },
      { id: 'spiritWater', quantity: 2 },
      { id: 'spiritStone', quantity: 1 }
    ],
    duration: 4000,
    requiredLevel: 'qi_refining_2',
    successRate: 0.7,
    rarity: 'common',
    expGain: 80
  },
  {
    id: 'recipe_zhujidan',
    name: '筑基丹配方',
    description: '突破筑基期的关键丹药',
    pills: ['zhujidan'],
    ingredients: [
      { id: 'spiritGrass', quantity: 5 },
      { id: 'spiritWater', quantity: 3 },
      { id: 'spiritStone', quantity: 2 },
      { id: 'spiritCrystal', quantity: 1 }
    ],
    duration: 5000,
    requiredLevel: 'qi_refining_3',
    successRate: 0.5,
    rarity: 'rare',
    expGain: 150
  },
  {
    id: 'recipe_jindan',
    name: '金丹丹配方',
    description: '突破金丹期的关键丹药',
    pills: ['jindan_pill'],
    ingredients: [
      { id: 'spiritGrass', quantity: 10 },
      { id: 'spiritWater', quantity: 5 },
      { id: 'spiritStone', quantity: 5 },
      { id: 'spiritCrystal', quantity: 3 },
      { id: 'heavenlyHerb', quantity: 1 }
    ],
    duration: 6000,
    requiredLevel: 'foundation_3',
    successRate: 0.3,
    rarity: 'epic',
    expGain: 300
  },
  {
    id: 'recipe_yuanying',
    name: '元婴丹配方',
    description: '突破元婴期的关键丹药',
    pills: ['yuanying_pill'],
    ingredients: [
      { id: 'spiritGrass', quantity: 20 },
      { id: 'spiritWater', quantity: 10 },
      { id: 'spiritStone', quantity: 10 },
      { id: 'spiritCrystal', quantity: 5 },
      { id: 'heavenlyHerb', quantity: 3 },
      { id: 'immortalFruit', quantity: 1 }
    ],
    duration: 8000,
    requiredLevel: 'golden_core_3',
    successRate: 0.1,
    rarity: 'legendary',
    expGain: 600
  },
  {
    id: 'recipe_huashen',
    name: '化神丹配方',
    description: '突破化神期的关键丹药',
    pills: ['huashen_pill'],
    ingredients: [
      { id: 'spiritGrass', quantity: 30 },
      { id: 'spiritWater', quantity: 20 },
      { id: 'spiritStone', quantity: 20 },
      { id: 'spiritCrystal', quantity: 10 },
      { id: 'heavenlyHerb', quantity: 5 },
      { id: 'immortalFruit', quantity: 3 },
      { id: 'divineEssence', quantity: 1 }
    ],
    duration: 10000,
    requiredLevel: 'nascent_soul_3',
    successRate: 0.05,
    rarity: 'legendary',
    expGain: 1000
  }
];