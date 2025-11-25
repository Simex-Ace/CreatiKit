import { Achievement } from '../types';

// 成就定义
export const achievements: Achievement[] = [
  {
    id: 'first_step',
    name: '修仙初成',
    description: '完成第一次修炼',
    requirements: {
      totalCultivations: 1
    },
    reward: {
      resources: {
        gold: 100,
        pills: 5
      },
      exp: 50
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'qi_master',
    name: '灵气大师',
    description: '累计采集1000点灵气',
    requirements: {
      totalQiGathered: 1000
    },
    reward: {
      resources: {
        gold: 500,
        spiritFruit: 3
      },
      exp: 200
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'cultivation_master',
    name: '修炼达人',
    description: '累计修炼100次',
    requirements: {
      totalCultivations: 100
    },
    reward: {
      resources: {
        gold: 1000,
        pills: 10
      },
      exp: 500
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'wealthy_cultivator',
    name: '富甲一方',
    description: '拥有10000灵石',
    requirements: {
      resources: {
        gold: 10000
      }
    },
    reward: {
      resources: {
        spiritCrystal: 5
      },
      exp: 1000
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'breakthrough_expert',
    name: '突破专家',
    description: '突破到练气中期',
    requirements: {
      level: 'qi_refining_2'
    },
    reward: {
      resources: {
        gold: 2000,
        pills: 15
      },
      exp: 800
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'alchemy_apprentice',
    name: '炼丹学徒',
    description: '成功炼制10颗丹药',
    requirements: {
      alchemySuccess: 10
    },
    reward: {
      resources: {
        materials: 200
      },
      exp: 300
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'alchemy_master',
    name: '炼丹大师',
    description: '成功炼制100颗丹药',
    requirements: {
      alchemySuccess: 100
    },
    reward: {
      resources: {
        materials: 1000,
        spiritCrystal: 10
      },
      exp: 2000
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'skill_master',
    name: '技能大师',
    description: '将任意技能升级到最高级',
    requirements: {
      skillMaxLevel: true
    },
    reward: {
      resources: {
        gold: 3000,
        spiritFruit: 10
      },
      exp: 1500
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'auto_cultivator',
    name: '自动修炼者',
    description: '累计自动修炼100次',
    requirements: {
      autoCultivationCount: 100
    },
    reward: {
      resources: {
        pills: 20
      },
      exp: 600
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'event_protagonist',
    name: '事件主角',
    description: '成功处理10个随机事件',
    requirements: {
      eventHandled: 10
    },
    reward: {
      resources: {
        gold: 1500,
        materials: 300
      },
      exp: 700
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'alchemy_master_new',
    name: '炼丹大师',
    description: '成功炼制50炉丹药',
    requirements: {
      alchemySuccess: 50
    },
    reward: {
      resources: {
        pills: 20,
        materials: 100,
        gold: 1000
      },
      exp: 1000
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'event_handler',
    name: '事件达人',
    description: '处理20个随机事件',
    requirements: {
      eventHandled: 20
    },
    reward: {
      resources: {
        gold: 800,
        spiritFruit: 10
      },
      exp: 800
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'skill_max_level',
    name: '技能专精',
    description: '将任意一项技能提升到最大等级',
    requirements: {
      skillMaxLevel: true
    },
    reward: {
      resources: {
        gold: 1500,
        pills: 15
      },
      exp: 1500
    },
    unlocked: false,
    completed: false,
    progress: 0
  },
  {
    id: 'foundation_building',
    name: '筑基成功',
    description: '突破到筑基期',
    requirements: {
      level: 'foundation_1'
    },
    reward: {
      resources: {
        gold: 2000,
        spiritFruit: 20,
        pills: 30
      },
      exp: 2000
    },
    unlocked: false,
    completed: false,
    progress: 0
  }
];