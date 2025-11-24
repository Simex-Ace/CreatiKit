import { Quest, CultivationLevel } from '../types';

// 定义游戏任务数据
export const quests: Quest[] = [
  {
    id: 'first-cultivation',
    title: '初次修炼',
    description: '作为一名新晋修仙者，你需要进行第一次修炼，感受灵气的流动。',
    requirements: {
      level: '练气初期'
    },
    rewards: {
      resources: {
        pills: 3,
        gold: 100
      },
      exp: 50
    },
    completed: false
  },
  {
    id: 'qi-gathering',
    title: '灵气采集',
    description: '修炼需要消耗灵气，你需要采集足够的灵气来支持修炼。',
    requirements: {
      resources: {
        qi: 100
      }
    },
    rewards: {
      resources: {
        gold: 200,
        materials: 50
      },
      exp: 100
    },
    completed: false
  },
  {
    id: 'skill-upgrade',
    title: '技能提升',
    description: '提升你的修炼技能，以获得更强大的修炼效果。',
    requirements: {
      skills: [
        { id: 'qiGather', level: 2 }
      ]
    },
    rewards: {
      resources: {
        gold: 300
      },
      exp: 150
    },
    completed: false
  },
  {
    id: 'breakthrough',
    title: '境界突破',
    description: '达到练气中期，开启新的修仙境界。',
    requirements: {
      level: '练气中期'
    },
    rewards: {
      resources: {
        pills: 5,
        spiritFruit: 2,
        gold: 500
      },
      exp: 300
    },
    completed: false
  },
  {
    id: 'resource-collection',
    title: '资源收集',
    description: '收集足够的资源，为后续的修仙之路做准备。',
    requirements: {
      resources: {
        gold: 1000,
        materials: 100
      }
    },
    rewards: {
      resources: {
        pills: 10,
        spiritFruit: 5
      },
      exp: 500
    },
    completed: false
  }
];