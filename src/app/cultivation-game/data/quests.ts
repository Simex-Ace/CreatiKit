import { Quest, CultivationLevel } from '../types';

// 定义游戏任务数据
export const quests: Quest[] = [
  // 主线任务
  {
    id: 'main_1',
    title: '初次修炼',
    description: '作为一名新晋修仙者，你需要进行第一次修炼，感受灵气的流动。',
    type: 'main',
    difficulty: 'easy',
    requirements: {
      level: 'qi_refining_1'
    },
    rewards: {
      resources: {
        pills: 3,
        gold: 100
      },
      exp: 50
    },
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_2'
  },
  {
    id: 'main_2',
    title: '灵气采集',
    description: '修炼需要消耗灵气，你需要采集足够的灵气来支持修炼。',
    type: 'main',
    difficulty: 'easy',
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
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_3'
  },
  {
    id: 'main_3',
    title: '技能提升',
    description: '提升你的修炼技能，以获得更强大的修炼效果。',
    type: 'main',
    difficulty: 'normal',
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
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_4'
  },
  {
    id: 'main_4',
    title: '境界突破',
    description: '达到练气中期，开启新的修仙境界。',
    type: 'main',
    difficulty: 'normal',
    requirements: {
      level: 'qi_refining_2'
    },
    rewards: {
      resources: {
        pills: 5,
        spiritFruit: 2,
        gold: 500
      },
      exp: 300
    },
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_5'
  },
  {
    id: 'main_5',
    title: '资源收集',
    description: '收集足够的资源，为后续的修仙之路做准备。',
    type: 'main',
    difficulty: 'normal',
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
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_6'
  },
  {
    id: 'main_6',
    title: '初次炼丹',
    description: '作为修仙者，炼丹是必备技能，尝试炼制你的第一炉丹药吧。',
    type: 'main',
    difficulty: 'normal',
    requirements: {
      alchemy: {
        successCount: 1
      }
    },
    rewards: {
      resources: {
        pills: 5,
        materials: 20
      },
      exp: 200
    },
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_7'
  },
  {
    id: 'main_7',
    title: '技能精通',
    description: '将任意一项技能提升到3级，展现你的修仙天赋。',
    type: 'main',
    difficulty: 'hard',
    requirements: {
      skills: [
        { id: 'qiGather', level: 3 },
        { id: 'cultivation', level: 3 },
        { id: 'gathering', level: 3 },
        { id: 'alchemy', level: 3 }
      ]
    },
    rewards: {
      resources: {
        gold: 500,
        spiritFruit: 3
      },
      exp: 300
    },
    completed: false,
    accepted: false,
    questChain: 'main_story',
    nextQuest: 'main_8'
  },
  {
    id: 'main_8',
    title: '筑基成功',
    description: '突破到筑基期，成为一名真正的修仙者。',
    type: 'main',
    difficulty: 'hard',
    requirements: {
      level: 'foundation_1'
    },
    rewards: {
      resources: {
        pills: 20,
        gold: 2000,
        spiritFruit: 10
      },
      exp: 1000
    },
    completed: false,
    accepted: false,
    questChain: 'main_story'
  },
  // 支线任务
  {
    id: 'side_1',
    title: '事件达人',
    description: '经历10个随机事件，积累修仙经验。',
    type: 'side',
    difficulty: 'normal',
    requirements: {
      events: {
        encountered: 10
      }
    },
    rewards: {
      resources: {
        gold: 800,
        materials: 50
      },
      exp: 400
    },
    completed: false,
    accepted: false
  },
  {
    id: 'side_2',
    title: '炼丹大师',
    description: '成功炼制20炉丹药，成为炼丹大师。',
    type: 'side',
    difficulty: 'hard',
    requirements: {
      alchemy: {
        successCount: 20
      }
    },
    rewards: {
      resources: {
        pills: 30,
        materials: 100,
        gold: 1500
      },
      exp: 800,
      recipes: ['recipe_3']
    },
    completed: false,
    accepted: false
  },
  {
    id: 'side_3',
    title: '自动修炼专家',
    description: '使用自动修炼功能修炼100次。',
    type: 'side',
    difficulty: 'normal',
    requirements: {
      autoCultivationCount: 100
    },
    rewards: {
      resources: {
        gold: 500,
        pills: 10
      },
      exp: 300
    },
    completed: false,
    accepted: false
  },
  {
    id: 'side_4',
    title: '灵气大师',
    description: '累计采集1000点灵气。',
    type: 'side',
    difficulty: 'normal',
    requirements: {
      totalQiGathered: 1000
    },
    rewards: {
      resources: {
        gold: 600,
        spiritFruit: 3
      },
      exp: 400
    },
    completed: false,
    accepted: false
  },
  // 日常任务
  {
    id: 'daily_1',
    title: '每日修炼',
    description: '每天修炼10次，保持修炼状态。',
    type: 'daily',
    difficulty: 'easy',
    requirements: {
      totalCultivations: 10
    },
    rewards: {
      resources: {
        gold: 200,
        pills: 3
      },
      exp: 100
    },
    completed: false,
    accepted: false,
    dueDate: Date.now() + 86400000 // 24小时后过期
  },
  {
    id: 'daily_2',
    title: '每日采集',
    description: '每天采集50点灵气。',
    type: 'daily',
    difficulty: 'easy',
    requirements: {
      totalQiGathered: 50
    },
    rewards: {
      resources: {
        gold: 150,
        materials: 20
      },
      exp: 80
    },
    completed: false,
    accepted: false,
    dueDate: Date.now() + 86400000
  },
  {
    id: 'daily_3',
    title: '每日炼丹',
    description: '每天炼制1炉丹药。',
    type: 'daily',
    difficulty: 'normal',
    requirements: {
      alchemy: {
        successCount: 1
      }
    },
    rewards: {
      resources: {
        gold: 300,
        materials: 10
      },
      exp: 150
    },
    completed: false,
    accepted: false,
    dueDate: Date.now() + 86400000
  },
  // 限时任务（示例）
  {
    id: 'limited_1',
    title: '灵果丰收',
    description: '限时任务：在24小时内收集10个灵果。',
    type: 'limited',
    difficulty: 'normal',
    requirements: {
      resources: {
        spiritFruit: 10
      }
    },
    rewards: {
      resources: {
        gold: 1000,
        spiritFruit: 5
      },
      exp: 500
    },
    completed: false,
    accepted: false,
    dueDate: Date.now() + 86400000
  }
];