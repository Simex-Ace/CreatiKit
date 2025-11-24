import { ForgeBlueprint } from '../types';

export const forgeBlueprints: ForgeBlueprint[] = [
  {
    id: 'blueprint_1',
    name: '基础飞剑图谱',
    description: '可以锻造基础的飞剑',
    itemId: 'basic_flying_sword',
    requiredLevel: 'qi_refining_1',
    ingredients: [
      { materialId: 'materials', quantity: 20 },
      { materialId: 'spiritStone', quantity: 5 }
    ],
    successRate: 0.8,
    expGain: 50
  },
  {
    id: 'blueprint_2',
    name: '强化道袍图谱',
    description: '可以锻造强化的道袍',
    itemId: 'enhanced_robe',
    requiredLevel: 'qi_refining_2',
    ingredients: [
      { materialId: 'materials', quantity: 30 },
      { materialId: 'spiritGrass', quantity: 10 }
    ],
    successRate: 0.75,
    expGain: 80
  },
  {
    id: 'blueprint_3',
    name: '聚气腰带图谱',
    description: '可以锻造聚气腰带',
    itemId: 'qi_gathering_belt',
    requiredLevel: 'qi_refining_3',
    ingredients: [
      { materialId: 'materials', quantity: 40 },
      { materialId: 'spiritWater', quantity: 8 },
      { materialId: 'spiritStone', quantity: 10 }
    ],
    successRate: 0.7,
    expGain: 120
  },
  {
    id: 'blueprint_4',
    name: '筑基剑图谱',
    description: '可以锻造筑基期使用的飞剑',
    itemId: 'foundation_sword',
    requiredLevel: 'foundation_1',
    ingredients: [
      { materialId: 'materials', quantity: 50 },
      { materialId: 'spiritCrystal', quantity: 5 },
      { materialId: 'spiritStone', quantity: 20 }
    ],
    successRate: 0.65,
    expGain: 200
  }
];
