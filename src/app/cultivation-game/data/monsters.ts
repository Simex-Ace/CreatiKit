import { Monster } from '../types';

// 怪物数据
export const monsters: Monster[] = [
  {
    id: 'wild_animal',
    name: '野狗',
    description: '普通的野狗，偶尔会攻击修真者',
    level: 1,
    image: '🐕',
    stats: {
      health: 50,
      maxHealth: 50,
      attack: 10,
      defense: 2,
      expReward: 20,
      goldReward: 10,
      dropChance: {
        pills: 0.2,
        spiritGrass: 0.1
      }
    },
    isBoss: false,
    requiredLevel: 'qi_refining_1'
  },
  {
    id: 'spirit_beast',
    name: '灵猫',
    description: '吸收了灵气的猫，具有一定的攻击性',
    level: 3,
    image: '🐱',
    stats: {
      health: 100,
      maxHealth: 100,
      attack: 15,
      defense: 5,
      expReward: 50,
      goldReward: 25,
      dropChance: {
        pills: 0.3,
        spiritFruit: 0.2,
        spiritGrass: 0.15
      }
    },
    isBoss: false,
    requiredLevel: 'qi_refining_1'
  },
  {
    id: 'low_demon',
    name: '小恶魔',
    description: '来自魔界的小恶魔，喜欢攻击修真者',
    level: 5,
    image: '👿',
    stats: {
      health: 200,
      maxHealth: 200,
      attack: 25,
      defense: 10,
      expReward: 100,
      goldReward: 50,
      dropChance: {
        pills: 0.4,
        spiritFruit: 0.3,
        spiritGrass: 0.2
      }
    },
    isBoss: false,
    requiredLevel: 'qi_refining_2'
  },
  {
    id: 'demon_wolf',
    name: '魔狼',
    description: '被魔气侵蚀的狼，具有强大的攻击力',
    level: 8,
    image: '🐺',
    stats: {
      health: 350,
      maxHealth: 350,
      attack: 40,
      defense: 15,
      expReward: 200,
      goldReward: 100,
      dropChance: {
        pills: 0.5,
        spiritFruit: 0.4,
        spiritGrass: 0.3
      }
    },
    isBoss: false,
    requiredLevel: 'qi_refining_3'
  },
  {
    id: 'spiritual_snake',
    name: '灵蛇',
    description: '千年灵蛇，已经开启灵智',
    level: 12,
    image: '🐍',
    stats: {
      health: 500,
      maxHealth: 500,
      attack: 55,
      defense: 20,
      expReward: 350,
      goldReward: 175,
      dropChance: {
        pills: 0.6,
        spiritFruit: 0.5,
        spiritGrass: 0.4
      }
    },
    isBoss: false,
    requiredLevel: 'foundation_1'
  },
  {
    id: 'demon_general',
    name: '魔将军',
    description: '魔界的将军，实力强大',
    level: 15,
    image: '👹',
    stats: {
      health: 800,
      maxHealth: 800,
      attack: 80,
      defense: 30,
      expReward: 600,
      goldReward: 300,
      dropChance: {
        pills: 0.8,
        spiritFruit: 0.7,
        spiritGrass: 0.6
      }
    },
    isBoss: true,
    requiredLevel: 'foundation_2'
  }
];