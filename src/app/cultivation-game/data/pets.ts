import { PetData } from '../types';

// 宠物数据定义
export const petData: PetData[] = [
  {
    id: 'pet_spirit_fox',
    name: '灵狐',
    type: 'spiritual_animal',
    image: '🦊',
    baseHealth: 100,
    baseAttack: 20,
    baseDefense: 10,
    skills: [
      {
        id: 'pet_skill_fireball',
        name: '火球术',
        description: '释放一个火球攻击敌人，造成30点伤害',
        level: 1,
        maxLevel: 5,
        effect: { damage: 30 },
        cooldown: 3
      },
      {
        id: 'pet_skill_heal',
        name: '治愈术',
        description: '恢复自身或主人15点生命值',
        level: 1,
        maxLevel: 5,
        effect: { healing: 15 },
        cooldown: 5
      }
    ],
    loyalty: 80,
    specialBonus: { cultivationSpeed: 0.1 },
    unlockLevel: 'qi_refining_1',
    catchChance: 0.6
  },
  {
    id: 'pet_demonic_wolf',
    name: '魔狼',
    type: 'demonic_beast',
    image: '🐺',
    baseHealth: 150,
    baseAttack: 25,
    baseDefense: 15,
    skills: [
      {
        id: 'pet_skill_claw_attack',
        name: '利爪攻击',
        description: '用锋利的爪子攻击敌人，造成40点伤害',
        level: 1,
        maxLevel: 5,
        effect: { damage: 40 },
        cooldown: 2
      },
      {
        id: 'pet_skill_defense_boost',
        name: '防御强化',
        description: '暂时提升自身防御20点，持续3回合',
        level: 1,
        maxLevel: 5,
        effect: { defenseBoost: 20, buffDuration: 3 },
        cooldown: 6
      }
    ],
    loyalty: 70,
    specialBonus: { battleDamage: 0.15 },
    unlockLevel: 'qi_refining_2',
    catchChance: 0.4
  },
  {
    id: 'pet_divine_phoenix',
    name: '凤凰',
    type: 'divine_creature',
    image: '🔥',
    baseHealth: 250,
    baseAttack: 40,
    baseDefense: 25,
    skills: [
      {
        id: 'pet_skill_holy_fire',
        name: '神圣之火',
        description: '释放神圣火焰，造成80点伤害并提升自身攻击10点',
        level: 1,
        maxLevel: 5,
        effect: { damage: 80, attackBoost: 10, buffDuration: 4 },
        cooldown: 4
      },
      {
        id: 'pet_skill_immortal_heal',
        name: '不朽治愈',
        description: '恢复自身和主人50点生命值',
        level: 1,
        maxLevel: 5,
        effect: { healing: 50 },
        cooldown: 8
      }
    ],
    loyalty: 95,
    specialBonus: {
      cultivationSpeed: 0.2,
      resourceGatheringSpeed: 0.15,
      battleDamage: 0.2
    },
    unlockLevel: 'golden_core_1',
    catchChance: 0.1
  },
  {
    id: 'pet_ice_spirit',
    name: '冰灵',
    type: 'spiritual_animal',
    image: '❄️',
    baseHealth: 120,
    baseAttack: 18,
    baseDefense: 12,
    skills: [
      {
        id: 'pet_skill_ice_spike',
        name: '冰刺',
        description: '发射冰刺攻击敌人，造成35点伤害',
        level: 1,
        maxLevel: 5,
        effect: { damage: 35 },
        cooldown: 3
      },
      {
        id: 'pet_skill_freeze',
        name: '冻结',
        description: '降低敌人攻击10点，持续2回合',
        level: 1,
        maxLevel: 5,
        effect: { attackBoost: -10, buffDuration: 2 },
        cooldown: 5
      }
    ],
    loyalty: 85,
    specialBonus: { resourceGatheringSpeed: 0.12 },
    unlockLevel: 'foundation_2',
    catchChance: 0.5
  },
  {
    id: 'pet_earth_golem',
    name: '土灵傀儡',
    type: 'demonic_beast',
    image: '🪨',
    baseHealth: 300,
    baseAttack: 22,
    baseDefense: 40,
    skills: [
      {
        id: 'pet_skill_earthquake',
        name: '地震',
        description: '引发地震，造成50点伤害',
        level: 1,
        maxLevel: 5,
        effect: { damage: 50 },
        cooldown: 4
      },
      {
        id: 'pet_skill_stone_skin',
        name: '石肤术',
        description: '提升自身防御50点，持续5回合',
        level: 1,
        maxLevel: 5,
        effect: { defenseBoost: 50, buffDuration: 5 },
        cooldown: 10
      }
    ],
    loyalty: 75,
    specialBonus: { defenseBonus: 0.2 },
    unlockLevel: 'golden_core_2',
    catchChance: 0.3
  }
];
