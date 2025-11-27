import { Farmland } from '../types';

export const farmlands: Farmland[] = [
  {
    id: 'farmland_1',
    name: '初级灵田',
    description: '适合种植基础灵草的灵田',
    soilQuality: 1.0,
    upgradeCost: {
      gold: 50,
      spiritStone: 3
    },
    unlockRequirements: {
      level: 'qi_refining_1'
    },
    level: 1,
    maxLevel: 5,
    currentCrop: null,
    isLocked: false
  },
  {
    id: 'farmland_2',
    name: '中级灵田',
    description: '可以种植更高级灵草的灵田',
    soilQuality: 1.5,
    upgradeCost: {
      gold: 150,
      spiritStone: 8
    },
    unlockRequirements: {
      level: 'qi_refining_3',
      gold: 100
    },
    level: 1,
    maxLevel: 5,
    currentCrop: null,
    isLocked: true
  },
  {
    id: 'farmland_3',
    name: '高级灵田',
    description: '能够种植珍稀灵草的灵田',
    soilQuality: 2.0,
    upgradeCost: {
      gold: 300,
      spiritStone: 15,
      spiritCrystal: 5
    },
    unlockRequirements: {
      level: 'foundation_1',
      gold: 500
    },
    level: 1,
    maxLevel: 5,
    currentCrop: null,
    isLocked: true
  },
  {
    id: 'farmland_4',
    name: '仙田',
    description: '传说中可以种植仙药的灵田',
    soilQuality: 3.0,
    upgradeCost: {
      gold: 1000,
      spiritStone: 50,
      spiritCrystal: 20,
      heavenlyHerb: 5
    },
    unlockRequirements: {
      level: 'golden_core_1',
      gold: 2000
    },
    level: 1,
    maxLevel: 5,
    currentCrop: null,
    isLocked: true
  }
];
