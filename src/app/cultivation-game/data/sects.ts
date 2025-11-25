import { Sect, SectTask } from '../types';

export const sectTasks: SectTask[] = [
  {
    id: 'sect_task_1',
    name: '清理山门',
    description: '清理山门附近的魔狼，保护宗门安全。',
    requirements: {
      monstersDefeated: 10
    },
    rewards: {
      contribution: 50,
      resources: {
        spiritStone: 100
      }
    },
    completed: false,
    claimed: false
  },
  {
    id: 'sect_task_2',
    name: '采集灵草',
    description: '为宗门炼丹房采集100份灵草。',
    requirements: {
      resourcesGathered: 100
    },
    rewards: {
      contribution: 30,
      resources: {
        qi: 500
      }
    },
    completed: false,
    claimed: false
  },
  {
    id: 'sect_task_3',
    name: '炼制丹药',
    description: '为宗门炼制10颗聚气丹。',
    requirements: {
      pillsCrafted: 10
    },
    rewards: {
      contribution: 80,
      resources: {
        spiritStone: 200
      }
    },
    completed: false,
    claimed: false
  },
  {
    id: 'sect_task_4',
    name: '锻造装备',
    description: '为宗门弟子锻造5件基础武器。',
    requirements: {
      itemsForged: 5
    },
    rewards: {
      contribution: 100,
      resources: {
        materials: 50
      }
    },
    completed: false,
    claimed: false
  },
  {
    id: 'sect_task_5',
    name: '培养灵宠',
    description: '将一只灵宠培养到10级。',
    requirements: {
      petLevel: 10
    },
    rewards: {
      contribution: 150,
      resources: {
        spiritStone: 500
      }
    },
    completed: false,
    claimed: false
  }
];

export const sects: Sect[] = [
  {
    id: 'sect_lingyun',
    name: '凌云宗',
    level: 1,
    description: '一个历史悠久的修真宗门，以凌云剑法闻名天下。',
    contribution: 0,
    contributionToNextLevel: 1000,
    members: 100,
    benefits: {
      resourceBoost: 0.1,
      expBoost: 0.1,
      cultivationSpeedBoost: 0.1
    },
    tasks: sectTasks,
    unlocked: false
  },
  {
    id: 'sect_moonglow',
    name: '月辉门',
    level: 1,
    description: '擅长炼丹和治疗的宗门，弟子多为女性。',
    contribution: 0,
    contributionToNextLevel: 1000,
    members: 80,
    benefits: {
      resourceBoost: 0.05,
      expBoost: 0.05,
      cultivationSpeedBoost: 0.15
    },
    tasks: sectTasks,
    unlocked: false
  },
  {
    id: 'sect_blackfire',
    name: '黑火教',
    level: 1,
    description: '修炼邪道功法的宗门，以强大的攻击力著称。',
    contribution: 0,
    contributionToNextLevel: 1000,
    members: 50,
    benefits: {
      resourceBoost: 0.15,
      expBoost: 0.15,
      cultivationSpeedBoost: 0.05
    },
    tasks: sectTasks,
    unlocked: false
  }
];
