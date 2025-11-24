import { Pill } from '../types';

// 丹药定义
export const pills: Pill[] = [
  {
    id: 'peiyuan_pill',
    name: '培元丹',
    type: '培元丹',
    description: '基础修炼丹药，能够快速提升修真者的经验值。',
    effects: {
      expGain: 100
    },
    rarity: 'common'
  },
  {
    id: 'juqi_pill',
    name: '聚气丹',
    type: '聚气丹',
    description: '能够大幅增加修真者的灵气储备，是修炼的好帮手。',
    effects: {
      qiGain: 200
    },
    rarity: 'common'
  },
  {
    id: 'zhujidan',
    name: '筑基丹',
    type: '筑基丹',
    description: '突破筑基期的必备丹药，能够提高突破成功率。',
    effects: {
      expGain: 500,
      cultivationSpeedBoost: 0.5,
      duration: 3600 // 1小时
    },
    rarity: 'rare'
  },
  {
    id: 'jindan_pill',
    name: '金丹丹',
    type: '金丹丹',
    description: '帮助修真者凝结金丹的珍贵丹药，效果非凡。',
    effects: {
      expGain: 2000,
      cultivationSpeedBoost: 1.0,
      duration: 7200 // 2小时
    },
    rarity: 'epic'
  },
  {
    id: 'yuanying_pill',
    name: '元婴丹',
    type: '元婴丹',
    description: '帮助金丹期修真者凝结元婴的传奇丹药，极为罕见。',
    effects: {
      expGain: 5000,
      cultivationSpeedBoost: 2.0,
      duration: 14400 // 4小时
    },
    rarity: 'legendary'
  },
  {
    id: 'huashen_pill',
    name: '化神丹',
    type: '化神丹',
    description: '传说中的丹药，能够帮助修真者突破到化神期。',
    effects: {
      expGain: 10000,
      cultivationSpeedBoost: 3.0,
      duration: 28800 // 8小时
    },
    rarity: 'legendary'
  }
];