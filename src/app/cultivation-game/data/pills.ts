import { Pill } from '../types';

// 丹药数据
export const pills: Pill[] = [
  {
    id: 'pill_1',
    name: '聚气丹',
    description: '帮助修炼者凝聚灵气的基础丹药',
    type: '聚气丹',
    quality: 'normal',
    effect: { cultivationSpeed: 1.2 },
    duration: 300,
    stackable: true,
    maxStacks: 99,
    rarity: 'common',
    value: 10
  },
  {
    id: 'pill_2',
    name: '培元丹',
    description: '固本培元，提升修炼者的基础素质',
    type: '培元丹',
    quality: 'normal',
    effect: { cultivationSpeed: 1.5 },
    duration: 600,
    stackable: true,
    maxStacks: 99,
    rarity: 'common',
    value: 25
  },
  {
    id: 'pill_3',
    name: '筑基丹',
    description: '突破到筑基期所需的关键丹药',
    type: '筑基丹',
    quality: 'normal',
    effect: { breakthroughChance: 1.5 },
    duration: 300,
    stackable: true,
    maxStacks: 99,
    rarity: 'rare',
    value: 100
  },
  {
    id: 'pill_4',
    name: '金丹丹',
    description: '突破到金丹期所需的珍贵丹药',
    type: '金丹丹',
    quality: 'normal',
    effect: { breakthroughChance: 2 },
    duration: 300,
    stackable: true,
    maxStacks: 99,
    rarity: 'epic',
    value: 500
  },
  {
    id: 'pill_5',
    name: '元婴丹',
    description: '突破到元婴期所需的传说丹药',
    type: '元婴丹',
    quality: 'normal',
    effect: { breakthroughChance: 2.5 },
    duration: 300,
    stackable: true,
    maxStacks: 99,
    rarity: 'legendary',
    value: 2000
  },
  // 新增丹药
  {
    id: 'pill_6',
    name: '气血丹',
    description: '补充修炼者气血的丹药，适合战斗后使用',
    type: '气血丹',
    quality: 'normal',
    effect: { healthRegen: 2 },
    duration: 300,
    stackable: true,
    maxStacks: 99,
    rarity: 'common',
    value: 15
  },
  {
    id: 'pill_7',
    name: '通灵丹',
    description: '提升修炼者感知能力，增加发现灵物的几率',
    type: '通灵丹',
    quality: 'normal',
    effect: { resourceGatheringSpeed: 1.3 },
    duration: 600,
    stackable: true,
    maxStacks: 99,
    rarity: 'rare',
    value: 75
  },
  {
    id: 'pill_8',
    name: '避毒丹',
    description: '能够抵御大部分毒物的丹药，适合探险时使用',
    type: '避毒丹',
    quality: 'normal',
    effect: { poisonResistance: 1.5 },
    duration: 1800,
    stackable: true,
    maxStacks: 99,
    rarity: 'rare',
    value: 150
  },
  {
    id: 'pill_9',
    name: '化神丹',
    description: '突破到化神期所需的顶级丹药',
    type: '化神丹',
    quality: 'normal',
    effect: { breakthroughChance: 3 },
    duration: 300,
    stackable: true,
    maxStacks: 99,
    rarity: 'legendary',
    value: 5000
  },
  {
    id: 'pill_10',
    name: '回春丹',
    description: '快速恢复伤势的神奇丹药',
    type: '回春丹',
    quality: 'normal',
    effect: { healthRegen: 3, cultivationSpeed: 1.2 },
    duration: 600,
    stackable: true,
    maxStacks: 99,
    rarity: 'epic',
    value: 300
  }
];