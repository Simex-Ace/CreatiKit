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
    id: 'spirit_rat',
    name: '灵鼠',
    description: '偷吃灵草的老鼠，吸收了少量灵气',
    level: 2,
    image: '🐀',
    stats: {
      health: 60,
      maxHealth: 60,
      attack: 12,
      defense: 3,
      expReward: 30,
      goldReward: 15,
      dropChance: {
        pills: 0.15,
        spiritGrass: 0.15
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
    id: 'spirit_fox',
    name: '灵狐',
    description: '修炼百年的狐狸，精通幻术',
    level: 6,
    image: '🦊',
    stats: {
      health: 250,
      maxHealth: 250,
      attack: 30,
      defense: 8,
      expReward: 150,
      goldReward: 75,
      dropChance: {
        pills: 0.45,
        spiritFruit: 0.35,
        spiritGrass: 0.25
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
    id: 'spirit_tiger',
    name: '灵虎',
    description: '吸收了天地灵气的老虎，威风凛凛',
    level: 10,
    image: '🐯',
    stats: {
      health: 450,
      maxHealth: 450,
      attack: 50,
      defense: 18,
      expReward: 300,
      goldReward: 150,
      dropChance: {
        pills: 0.55,
        spiritFruit: 0.45,
        spiritGrass: 0.35
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
  },
  {
    id: 'spirit_dragon',
    name: '幼灵龙',
    description: '龙族的幼崽，虽然年幼但实力不容小觑',
    level: 18,
    image: '🐉',
    stats: {
      health: 1200,
      maxHealth: 1200,
      attack: 100,
      defense: 40,
      expReward: 800,
      goldReward: 400,
      dropChance: {
        pills: 0.85,
        spiritFruit: 0.75,
        spiritGrass: 0.65
      }
    },
    isBoss: false,
    requiredLevel: 'foundation_3'
  },
  {
    id: 'heavenly_guardian',
    name: '天庭守卫',
    description: '守护天庭入口的强大存在',
    level: 20,
    image: '👼',
    stats: {
      health: 1500,
      maxHealth: 1500,
      attack: 120,
      defense: 50,
      expReward: 1000,
      goldReward: 500,
      dropChance: {
        pills: 0.9,
        spiritFruit: 0.8,
        spiritGrass: 0.7
      }
    },
    isBoss: true,
    requiredLevel: 'golden_core_1'
  },
  {
    id: 'demon_lord',
    name: '魔尊',
    description: '统治魔界的强大存在，拥有毁天灭地的力量',
    level: 25,
    image: '😈',
    stats: {
      health: 2500,
      maxHealth: 2500,
      attack: 180,
      defense: 80,
      expReward: 2000,
      goldReward: 1000,
      dropChance: {
        pills: 0.95,
        spiritFruit: 0.9,
        spiritGrass: 0.85
      }
    },
    isBoss: true,
    requiredLevel: 'golden_core_3'
  },
  {
    id: 'immortal_elder',
    name: '仙尊',
    description: '活了上万年的仙人，实力深不可测',
    level: 30,
    image: '🧙‍♂️',
    stats: {
      health: 4000,
      maxHealth: 4000,
      attack: 250,
      defense: 120,
      expReward: 3500,
      goldReward: 2000,
      dropChance: {
        pills: 1.0,
        spiritFruit: 0.95,
        spiritGrass: 0.9
      }
    },
    isBoss: true,
    requiredLevel: 'nascent_soul_1'
  }
];