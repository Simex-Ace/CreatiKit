import { ExplorationArea } from '../types';

export const explorationAreas: ExplorationArea[] = [
  {
    id: 'area_1',
    name: '青灵山脉',
    description: '一座充满灵气的山脉，适合初入修真界的修士探险。',
    type: 'mountain',
    requiredLevel: 'qi_refining_1',
    duration: 30,
    baseSuccessRate: 0.85,
    rewards: {
      resources: {
        spiritGrass: { min: 1, max: 3 },
        spiritStone: { min: 11, max: 32 },
        qi: { min: 100, max: 300 }
      },
      pills: [
        { id: 'pill_1', quantity: 1, chance: 0.2 }
      ],
      exp: 50,
      reputation: 10
    },
    encounters: {
      monster: [
        { id: 'monster_1', chance: 0.3 },
        { id: 'monster_2', chance: 0.15 }
      ],
      event: [
        { id: 'event_1', chance: 0.2 },
        { id: 'event_2', chance: 0.15 }
      ],
      pet: [
        { id: 'pet_1', chance: 0.1 }
      ],
      treasure: { chance: 0.05 }
    },
    difficulty: 'easy',
    cooldown: 120,
    recommendedLevel: 'qi_refining_1'
  },
  {
    id: 'area_2',
    name: '迷雾森林',
    description: '被神秘迷雾笼罩的森林，隐藏着各种危险与机遇。',
    type: 'forest',
    requiredLevel: 'qi_refining_3',
    duration: 60,
    baseSuccessRate: 0.75,
    rewards: {
      resources: {
        spiritGrass: { min: 2, max: 4 },
        spiritStone: { min: 21, max: 53 },
        spiritFruit: { min: 1, max: 2 },
        qi: { min: 200, max: 500 }
      },
      pills: [
        { id: 'pill_1', quantity: 1, chance: 0.3 },
        { id: 'pill_2', quantity: 1, chance: 0.15 }
      ],
      equipment: [
        { id: 'equipment_1', quantity: 1, chance: 0.1 },
        { id: 'equipment_2', quantity: 1, chance: 0.05 }
      ],
      exp: 120,
      reputation: 20
    },
    encounters: {
      monster: [
        { id: 'monster_2', chance: 0.3 },
        { id: 'monster_3', chance: 0.2 },
        { id: 'monster_4', chance: 0.1 }
      ],
      event: [
        { id: 'event_3', chance: 0.2 },
        { id: 'event_4', chance: 0.15 }
      ],
      pet: [
        { id: 'pet_1', chance: 0.15 },
        { id: 'pet_2', chance: 0.08 }
      ],
      treasure: { chance: 0.1 }
    },
    difficulty: 'normal',
    cooldown: 180,
    recommendedLevel: 'qi_refining_3'
  },
  {
    id: 'area_3',
    name: '幽暗洞穴',
    description: '深入地下的洞穴系统，充满了未知的危险。',
    type: 'cave',
    requiredLevel: 'foundation_1',
    duration: 120,
    baseSuccessRate: 0.65,
    rewards: {
      resources: {
        spiritGrass: { min: 3, max: 5 },
        spiritStone: { min: 52, max: 104 },
        spiritCrystal: { min: 1, max: 3 },
        qi: { min: 500, max: 1000 }
      },
      pills: [
        { id: 'pill_2', quantity: 1, chance: 0.3 },
        { id: 'pill_3', quantity: 1, chance: 0.2 },
        { id: 'pill_4', quantity: 1, chance: 0.1 }
      ],
      equipment: [
        { id: 'equipment_3', quantity: 1, chance: 0.15 },
        { id: 'equipment_4', quantity: 1, chance: 0.08 },
        { id: 'equipment_5', quantity: 1, chance: 0.05 }
      ],
      exp: 250,
      reputation: 40
    },
    encounters: {
      monster: [
        { id: 'monster_3', chance: 0.3 },
        { id: 'monster_4', chance: 0.25 },
        { id: 'monster_5', chance: 0.15 },
        { id: 'monster_6', chance: 0.1 }
      ],
      event: [
        { id: 'event_5', chance: 0.25 },
        { id: 'event_6', chance: 0.15 }
      ],
      pet: [
        { id: 'pet_2', chance: 0.12 },
        { id: 'pet_3', chance: 0.08 }
      ],
      treasure: { chance: 0.15 }
    },
    difficulty: 'hard',
    cooldown: 300,
    recommendedLevel: 'foundation_1'
  },
  {
    id: 'area_4',
    name: '远古遗迹',
    description: '一座古老的修真者遗迹，隐藏着强大的宝藏和危险。',
    type: 'ruins',
    requiredLevel: 'foundation_3',
    duration: 180,
    baseSuccessRate: 0.55,
    rewards: {
      resources: {
        spiritGrass: { min: 5, max: 8 },
        spiritStone: { min: 104, max: 206 },
        spiritCrystal: { min: 3, max: 5 },
        heavenlyHerb: { min: 1, max: 3 },
        qi: { min: 1000, max: 2000 }
      },
      pills: [
        { id: 'pill_4', quantity: 1, chance: 0.3 },
        { id: 'pill_5', quantity: 1, chance: 0.2 },
        { id: 'pill_6', quantity: 1, chance: 0.1 }
      ],
      equipment: [
        { id: 'equipment_6', quantity: 1, chance: 0.2 },
        { id: 'equipment_7', quantity: 1, chance: 0.12 },
        { id: 'equipment_8', quantity: 1, chance: 0.08 }
      ],
      exp: 500,
      reputation: 80
    },
    encounters: {
      monster: [
        { id: 'monster_4', chance: 0.3 },
        { id: 'monster_5', chance: 0.25 },
        { id: 'monster_6', chance: 0.2 },
        { id: 'monster_7', chance: 0.15 }
      ],
      event: [
        { id: 'event_7', chance: 0.3 },
        { id: 'event_8', chance: 0.2 }
      ],
      pet: [
        { id: 'pet_3', chance: 0.15 },
        { id: 'pet_4', chance: 0.1 }
      ],
      treasure: { chance: 0.2 }
    },
    difficulty: 'epic',
    cooldown: 600,
    recommendedLevel: 'foundation_3'
  },
  {
    id: 'area_5',
    name: '天池',
    description: '高山之巅的神秘湖泊，蕴含着强大的灵气。',
    type: 'lake',
    requiredLevel: 'golden_core_1',
    duration: 240,
    baseSuccessRate: 0.45,
    rewards: {
      resources: {
        spiritGrass: { min: 8, max: 12 },
        spiritStone: { min: 206, max: 410 },
        spiritCrystal: { min: 5, max: 8 },
        heavenlyHerb: { min: 3, max: 5 },
        immortalFruit: { min: 1, max: 2 },
        qi: { min: 2000, max: 5000 }
      },
      pills: [
        { id: 'pill_7', quantity: 1, chance: 0.3 },
        { id: 'pill_8', quantity: 1, chance: 0.25 },
        { id: 'pill_9', quantity: 1, chance: 0.15 },
        { id: 'pill_10', quantity: 1, chance: 0.08 }
      ],
      equipment: [
        { id: 'equipment_9', quantity: 1, chance: 0.25 },
        { id: 'equipment_10', quantity: 1, chance: 0.15 },
        { id: 'equipment_11', quantity: 1, chance: 0.08 }
      ],
      exp: 1000,
      reputation: 150
    },
    encounters: {
      monster: [
        { id: 'monster_5', chance: 0.25 },
        { id: 'monster_6', chance: 0.25 },
        { id: 'monster_7', chance: 0.2 },
        { id: 'monster_8', chance: 0.15 },
        { id: 'monster_9', chance: 0.1 }
      ],
      event: [
        { id: 'event_9', chance: 0.3 },
        { id: 'event_10', chance: 0.25 }
      ],
      pet: [
        { id: 'pet_4', chance: 0.15 },
        { id: 'pet_5', chance: 0.1 }
      ],
      treasure: { chance: 0.25 }
    },
    difficulty: 'legendary',
    cooldown: 1200,
    unlockRequirements: {
      quests: ['quest_10'],
      level: 'golden_core_1'
    },
    recommendedLevel: 'golden_core_1'
  },
  {
    id: 'area_6',
    name: '炼狱沙漠',
    description: '一片被火焰覆盖的沙漠，充满了致命的高温和危险的生物。',
    type: 'desert',
    requiredLevel: 'golden_core_2',
    duration: 300,
    baseSuccessRate: 0.35,
    rewards: {
      resources: {
        spiritGrass: { min: 10, max: 15 },
        spiritStone: { min: 308, max: 612 },
        spiritCrystal: { min: 7, max: 10 },
        heavenlyHerb: { min: 4, max: 6 },
        immortalFruit: { min: 2, max: 3 },
        spiritFire: { min: 1, max: 2 },
        qi: { min: 3000, max: 8000 }
      },
      pills: [
        { id: 'pill_8', quantity: 1, chance: 0.3 },
        { id: 'pill_9', quantity: 1, chance: 0.25 },
        { id: 'pill_10', quantity: 1, chance: 0.2 },
        { id: 'pill_12', quantity: 1, chance: 0.15 }
      ],
      equipment: [
        { id: 'equipment_12', quantity: 1, chance: 0.3 },
        { id: 'equipment_13', quantity: 1, chance: 0.2 },
        { id: 'equipment_14', quantity: 1, chance: 0.1 }
      ],
      exp: 2000,
      reputation: 250
    },
    encounters: {
      monster: [
        { id: 'monster_6', chance: 0.3 },
        { id: 'monster_7', chance: 0.25 },
        { id: 'monster_8', chance: 0.25 },
        { id: 'monster_9', chance: 0.2 },
        { id: 'monster_10', chance: 0.15 }
      ],
      event: [
        { id: 'event_11', chance: 0.35 },
        { id: 'event_12', chance: 0.25 }
      ],
      pet: [
        { id: 'pet_5', chance: 0.15 },
        { id: 'pet_6', chance: 0.1 }
      ],
      treasure: { chance: 0.3 }
    },
    difficulty: 'legendary',
    cooldown: 1800,
    unlockRequirements: {
      quests: ['quest_15'],
      level: 'golden_core_2'
    },
    recommendedLevel: 'golden_core_2'
  }
];
