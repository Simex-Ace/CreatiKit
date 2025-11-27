import { Pill } from '../types';

// 丹药数据
export const pills: Pill[] = [
  // 恢复法力值的丹药
  {
    id: 'pill_mana_small',
    name: '法力丹',
    description: '基础法力恢复丹药，回复少量法力值',
    type: '法力丹',
    quality: 'normal',
    effect: { qiRegen: 50 },
    duration: 0, // 0表示立即生效，无持续时间
    stackable: true,
    maxStacks: 99,
    rarity: 'common',
    value: 10
  },
  {
    id: 'pill_mana_medium',
    name: '大法力丹',
    description: '中级法力恢复丹药，回复中量法力值',
    type: '法力丹',
    quality: 'normal',
    effect: { qiRegen: 150 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'rare',
    value: 200
  },
  {
    id: 'pill_mana_large',
    name: '超级法力丹',
    description: '高级法力恢复丹药，回复大量法力值',
    type: '法力丹',
    quality: 'normal',
    effect: { qiRegen: 300 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'epic',
    value: 600
  },
  {
    id: 'pill_mana_max',
    name: '终极法力丹',
    description: '顶级法力恢复丹药，回复全部法力值',
    type: '法力丹',
    quality: 'normal',
    effect: { qiRegen: 500 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'legendary',
    value: 1000
  },
  
  // 恢复生命值的丹药
  {
    id: 'pill_health_small',
    name: '生命丹',
    description: '基础生命恢复丹药，回复少量生命值',
    type: '生命丹',
    quality: 'normal',
    effect: { healthRegen: 50 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'common',
    value: 15
  },
  {
    id: 'pill_health_medium',
    name: '大生命丹',
    description: '中级生命恢复丹药，回复中量生命值',
    type: '生命丹',
    quality: 'normal',
    effect: { healthRegen: 200 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'rare',
    value: 200
  },
  {
    id: 'pill_health_large',
    name: '超级生命丹',
    description: '高级生命恢复丹药，回复大量生命值',
    type: '生命丹',
    quality: 'normal',
    effect: { healthRegen: 300 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'epic',
    value: 600
  },
  {
    id: 'pill_health_max',
    name: '终极生命丹',
    description: '顶级生命恢复丹药，回复全部生命值',
    type: '生命丹',
    quality: 'normal',
    effect: { healthRegen: 500 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'legendary',
    value: 1000
  },
  
  // 同时恢复生命值和法力值的丹药
  {
    id: 'pill_both_small',
    name: '回春丹',
    description: '基础恢复丹药，同时回复少量生命值和法力值',
    type: '回春丹',
    quality: 'normal',
    effect: { healthRegen: 30, qiRegen: 30 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'common',
    value: 25
  },
  {
    id: 'pill_both_medium',
    name: '大回春丹',
    description: '中级恢复丹药，同时回复中量生命值和法力值',
    type: '回春丹',
    quality: 'normal',
    effect: { healthRegen: 100, qiRegen: 100 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'rare',
    value: 250
  },
  {
    id: 'pill_both_large',
    name: '超级回春丹',
    description: '高级恢复丹药，同时回复大量生命值和法力值',
    type: '回春丹',
    quality: 'normal',
    effect: { healthRegen: 150, qiRegen: 150 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'epic',
    value: 400
  },
  {
    id: 'pill_both_max',
    name: '终极回春丹',
    description: '顶级恢复丹药，同时回复全部生命值和法力值',
    type: '回春丹',
    quality: 'normal',
    effect: { healthRegen: 500, qiRegen: 500 },
    duration: 0,
    stackable: true,
    maxStacks: 99,
    rarity: 'legendary',
    value: 2000
  }
];