import { GameEvent } from '../types';

// 游戏事件定义
export const events: GameEvent[] = [
  {
    id: 'strange_herb',
    title: '发现奇异药草',
    description: '在修炼时，你发现了一株散发着淡淡灵光的奇异药草。',
    triggers: {
      actionType: 'cultivate',
      probability: 0.1
    },
    choices: [
      {
        id: 'harvest',
        text: '采集药草',
        requirements: {
          skills: [{ id: 'gathering', level: 1 }]
        },
        outcomes: [
          {
            type: 'resource',
            target: 'materials',
            amount: 5
          },
          {
            type: 'text',
            message: '你成功采集了奇异药草，获得了珍贵的炼丹材料。'
          }
        ]
      },
      {
        id: 'ignore',
        text: '继续修炼',
        outcomes: [
          {
            type: 'text',
            message: '你选择继续修炼，药草最终枯萎消失。'
          }
        ]
      }
    ]
  },
  {
    id: 'spirit_animal',
    title: '灵宠出现',
    description: '一只可爱的灵宠出现在你面前，似乎对你很感兴趣。',
    triggers: {
      actionType: 'gatherQi',
      probability: 0.05
    },
    choices: [
      {
        id: 'feed',
        text: '喂食灵果',
        requirements: {
          resources: {
            spiritFruit: 1
          }
        },
        outcomes: [
          {
            type: 'resource',
            target: 'spiritFruit',
            amount: -1
          },
          {
            type: 'text',
            message: '灵宠开心地吃着灵果，对你更加亲近了。'
          },
          {
            type: 'exp',
            amount: 50
          }
        ]
      },
      {
        id: 'chase',
        text: '驱赶灵宠',
        outcomes: [
          {
            type: 'text',
            message: '灵宠受到惊吓，迅速消失在山林中。'
          }
        ]
      }
    ]
  },
  {
    id: 'wandering_cultivator',
    title: '偶遇散修',
    description: '你遇到了一位游历的散修，他似乎有一些有趣的信息。',
    triggers: {
      actionType: 'any',
      probability: 0.08
    },
    choices: [
      {
        id: 'chat',
        text: '交流修炼心得',
        outcomes: [
          {
            type: 'exp',
            amount: 100
          },
          {
            type: 'text',
            message: '通过交流，你获得了不少修炼心得，修为有所提升。'
          }
        ]
      },
      {
        id: 'trade',
        text: '交易物品',
        requirements: {
          resources: {
            gold: 50
          }
        },
        outcomes: [
          {
            type: 'resource',
            target: 'gold',
            amount: -50
          },
          {
            type: 'resource',
            target: 'pills',
            amount: 3
          },
          {
            type: 'text',
            message: '你花费50灵石购买了3颗培元丹。'
          }
        ]
      },
      {
        id: 'ignore',
        text: '继续自己的修炼',
        outcomes: [
          {
            type: 'text',
            message: '你礼貌地婉拒了散修，继续自己的修炼之路。'
          }
        ]
      }
    ]
  },
  {
    id: 'treasure_chest',
    title: '发现宝箱',
    description: '在采集灵气时，你意外发现了一个古老的宝箱。',
    triggers: {
      actionType: 'gatherQi',
      probability: 0.03
    },
    choices: [
      {
        id: 'open',
        text: '打开宝箱',
        outcomes: [
          {
            type: 'resource',
            target: 'gold',
            amount: 100
          },
          {
            type: 'resource',
            target: 'materials',
            amount: 10
          },
          {
            type: 'text',
            message: '宝箱中装满了灵石和炼丹材料！'
          }
        ]
      },
      {
        id: 'leave',
        text: '谨慎离开',
        outcomes: [
          {
            type: 'text',
            message: '你觉得宝箱可能有陷阱，选择了离开。'
          }
        ]
      }
    ]
  },
  {
    id: 'meditation_insight',
    title: '冥想顿悟',
    description: '在深度冥想中，你突然对修炼有了新的领悟。',
    triggers: {
      actionType: 'cultivate',
      probability: 0.07
    },
    choices: [
      {
        id: 'focus',
        text: '集中精力，深入领悟',
        outcomes: [
          {
            type: 'resource',
            target: 'exp',
            amount: 200
          },
          {
            type: 'text',
            message: '你成功领悟了修炼真谛，修为突飞猛进！'
          }
        ]
      },
      {
        id: 'rest',
        text: '适可而止，稍作休息',
        outcomes: [
          {
            type: 'resource',
            target: 'exp',
            amount: 50
          },
          {
            type: 'text',
            message: '你选择了稳健的方式，获得了一定的修为提升。'
          }
        ]
      }
    ]
  }
];