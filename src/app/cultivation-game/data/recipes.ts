import { AlchemyRecipe } from '../types';

// 炼丹配方定义
export const alchemyRecipes: AlchemyRecipe[] = [
  {
    id: 'recipe_peiyuan',
    pillId: 'peiyuan_pill',
    name: '培元丹配方',
    ingredients: [
      { material: 'spiritGrass', amount: 2 },
      { material: 'spiritWater', amount: 1 }
    ],
    requiredLevel: '练气初期',
    successRate: 0.8,
    expGain: 50
  },
  {
    id: 'recipe_juqi',
    pillId: 'juqi_pill',
    name: '聚气丹配方',
    ingredients: [
      { material: 'spiritGrass', amount: 3 },
      { material: 'spiritWater', amount: 2 },
      { material: 'spiritStone', amount: 1 }
    ],
    requiredLevel: '练气中期',
    successRate: 0.7,
    expGain: 80
  },
  {
    id: 'recipe_zhujidan',
    pillId: 'zhujidan',
    name: '筑基丹配方',
    ingredients: [
      { material: 'spiritGrass', amount: 5 },
      { material: 'spiritWater', amount: 3 },
      { material: 'spiritStone', amount: 2 },
      { material: 'spiritCrystal', amount: 1 }
    ],
    requiredLevel: '练气后期',
    successRate: 0.5,
    expGain: 150
  },
  {
    id: 'recipe_jindan',
    pillId: 'jindan_pill',
    name: '金丹丹配方',
    ingredients: [
      { material: 'spiritGrass', amount: 10 },
      { material: 'spiritWater', amount: 5 },
      { material: 'spiritStone', amount: 5 },
      { material: 'spiritCrystal', amount: 3 },
      { material: 'heavenlyHerb', amount: 1 }
    ],
    requiredLevel: '筑基后期',
    successRate: 0.3,
    expGain: 300
  },
  {
    id: 'recipe_yuanying',
    pillId: 'yuanying_pill',
    name: '元婴丹配方',
    ingredients: [
      { material: 'spiritGrass', amount: 20 },
      { material: 'spiritWater', amount: 10 },
      { material: 'spiritStone', amount: 10 },
      { material: 'spiritCrystal', amount: 5 },
      { material: 'heavenlyHerb', amount: 3 },
      { material: 'immortalFruit', amount: 1 }
    ],
    requiredLevel: '金丹后期',
    successRate: 0.1,
    expGain: 600
  },
  {
    id: 'recipe_huashen',
    pillId: 'huashen_pill',
    name: '化神丹配方',
    ingredients: [
      { material: 'spiritGrass', amount: 30 },
      { material: 'spiritWater', amount: 20 },
      { material: 'spiritStone', amount: 20 },
      { material: 'spiritCrystal', amount: 10 },
      { material: 'heavenlyHerb', amount: 5 },
      { material: 'immortalFruit', amount: 3 },
      { material: 'divineEssence', amount: 1 }
    ],
    requiredLevel: '元婴后期',
    successRate: 0.05,
    expGain: 1000
  }
];