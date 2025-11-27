import { Crop } from '../types';

export const crops: Crop[] = [
  {
    id: 'crop_spirit_grass',
    name: '灵草',
    description: '基础灵草，可用于炼制丹药',
    type: 'spirit_grass',
    growthStages: [
      { name: '种子', duration: 10, image: '🌱', yield: 0 },
      { name: '幼苗', duration: 20, image: '🌿', yield: 0 },
      { name: '成熟', duration: 30, image: '🌾', yield: 1 }
    ],
    currentStage: 0,
    plantedTime: 0,
    harvestYield: {
      spiritGrass: 1,
      exp: 5
    },
    requirements: {
      farmlandLevel: 1
    },
    unlockLevel: 'qi_refining_1',
    growthSpeed: 1.0
  },
  {
    id: 'crop_spirit_fruit',
    name: '灵果',
    description: '蕴含灵气的果实，可直接食用',
    type: 'spirit_fruit',
    growthStages: [
      { name: '种子', duration: 15, image: '🌱', yield: 0 },
      { name: '幼苗', duration: 30, image: '🌿', yield: 0 },
      { name: '开花', duration: 45, image: '🌸', yield: 0 },
      { name: '结果', duration: 60, image: '🍎', yield: 1 }
    ],
    currentStage: 0,
    plantedTime: 0,
    harvestYield: {
      spiritFruit: 1,
      exp: 15
    },
    requirements: {
      farmlandLevel: 2
    },
    unlockLevel: 'qi_refining_3',
    growthSpeed: 0.8
  },
  {
    id: 'crop_heavenly_herb',
    name: '天材地宝',
    description: '珍稀的天材地宝，用于炼制高级丹药',
    type: 'heavenly_herb',
    growthStages: [
      { name: '种子', duration: 30, image: '🌱', yield: 0 },
      { name: '幼苗', duration: 60, image: '🌿', yield: 0 },
      { name: '成长', duration: 90, image: '🍃', yield: 0 },
      { name: '成熟', duration: 120, image: '💎', yield: 1 }
    ],
    currentStage: 0,
    plantedTime: 0,
    harvestYield: {
      heavenlyHerb: 1,
      exp: 50,
      gold: 100
    },
    requirements: {
      farmlandLevel: 3
    },
    unlockLevel: 'foundation_1',
    growthSpeed: 0.5
  }
];
