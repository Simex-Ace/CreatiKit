import { Event } from '../types';

// 定义随机事件数据
export const events: Event[] = [
  {
    id: 'strange-herb',
    title: '发现奇异药草',
    description: '在修炼时，你发现了一株散发着奇异光芒的药草，这可能是一种珍贵的炼丹材料。',
    triggerChance: 0.2,
    choices: [
      {
        id: 'collect',
        text: '采集药草',
        outcomes: [
          {
            probability: 0.7,
            result: '你成功采集了药草，获得了珍贵的炼丹材料。',
            effects: {
              resources: {
                materials: 20
              },
              exp: 30
            }
          },
          {
            probability: 0.3,
            result: '在采集过程中，药草突然消失，你只获得了一些普通的材料。',
            effects: {
              resources: {
                materials: 5
              }
            }
          }
        ]
      },
      {
        id: 'ignore',
        text: '忽视药草，继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择忽视药草，继续专注于修炼，获得了额外的修炼效果。',
            effects: {
              resources: {
                qi: 10
              },
              exp: 20
            }
          }
        ]
      }
    ]
  },
  {
    id: 'spirit-beast',
    title: '灵宠出现',
    description: '一只可爱的灵宠出现在你的面前，它似乎对你很感兴趣。',
    triggerChance: 0.15,
    choices: [
      {
        id: 'befriend',
        text: '尝试与其成为朋友',
        outcomes: [
          {
            probability: 0.6,
            result: '灵宠对你产生了好感，成为了你的伙伴，提高了你的修炼效率。',
            effects: {
              cultivationSpeedBoost: 0.1,
              exp: 50
            }
          },
          {
            probability: 0.4,
            result: '灵宠对你保持警惕，离开了，但留下了一些礼物。',
            effects: {
              resources: {
                pills: 2,
                spiritFruit: 1
              },
              exp: 20
            }
          }
        ]
      },
      {
        id: 'capture',
        text: '尝试捕捉灵宠',
        outcomes: [
          {
            probability: 0.3,
            result: '你成功捕捉了灵宠，但它对你有些不满，修炼效率略微提升。',
            effects: {
              cultivationSpeedBoost: 0.05,
              exp: 30
            }
          },
          {
            probability: 0.7,
            result: '灵宠逃脱了，你什么也没有得到。',
            effects: {}
          }
        ]
      },
      {
        id: 'ignore',
        text: '忽视灵宠，继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择忽视灵宠，继续专注于修炼。',
            effects: {
              resources: {
                qi: 15
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: 'mysterious-cave',
    title: '神秘洞穴',
    description: '在探索时，你发现了一个神秘的洞穴，里面似乎散发着微弱的灵气波动。',
    triggerChance: 0.1,
    choices: [
      {
        id: 'explore',
        text: '探索洞穴',
        outcomes: [
          {
            probability: 0.4,
            result: '你在洞穴中发现了一个宝藏，获得了大量的资源。',
            effects: {
              resources: {
                gold: 200,
                pills: 5,
                materials: 30
              },
              exp: 100
            }
          },
          {
            probability: 0.4,
            result: '洞穴中只有一些普通的资源，但你获得了宝贵的探险经验。',
            effects: {
              resources: {
                gold: 50,
                materials: 10
              },
              exp: 50
            }
          },
          {
            probability: 0.2,
            result: '洞穴中什么也没有，你浪费了一些时间。',
            effects: {
              exp: 10
            }
          }
        ]
      },
      {
        id: 'leave',
        text: '离开洞穴，继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择离开洞穴，继续专注于修炼。',
            effects: {
              resources: {
                qi: 20
              },
              exp: 30
            }
          }
        ]
      }
    ]
  },
  {
    id: 'senior-cultivator',
    title: '遇到前辈',
    description: '一位修仙前辈注意到了你，他似乎想给你一些指导。',
    triggerChance: 0.15,
    choices: [
      {
        id: 'ask-advice',
        text: '向前辈请教修炼心得',
        outcomes: [
          {
            probability: 0.8,
            result: '前辈给了你一些宝贵的修炼心得，你的修炼效率得到了提升。',
            effects: {
              cultivationSpeedBoost: 0.15,
              exp: 80
            }
          },
          {
            probability: 0.2,
            result: '前辈只是简单地鼓励了你几句，你获得了一些修炼经验。',
            effects: {
              exp: 40
            }
          }
        ]
      },
      {
        id: 'ask-for-gift',
        text: '向前辈索要礼物',
        outcomes: [
          {
            probability: 0.4,
            result: '前辈大方地给了你一些丹药和资源。',
            effects: {
              resources: {
                pills: 3,
                gold: 100
              },
              exp: 20
            }
          },
          {
            probability: 0.6,
            result: '前辈对你的请求感到不满，只是给了你一些普通的建议。',
            effects: {
              exp: 30
            }
          }
        ]
      },
      {
        id: 'respect',
        text: '礼貌地问候后继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '前辈对你的礼貌表示赞赏，暗中帮助你提升了修炼效果。',
            effects: {
              resources: {
                qi: 25
              },
              exp: 50
            }
          }
        ]
      }
    ]
  },
  {
    id: 'strange-pill',
    title: '奇怪的丹药',
    description: '你在路边发现了一颗散发着奇怪气息的丹药，不确定是否安全。',
    triggerChance: 0.2,
    choices: [
      {
        id: 'take-pill',
        text: '服用丹药',
        outcomes: [
          {
            probability: 0.5,
            result: '丹药具有奇特的效果，大幅提升了你的灵气和经验。',
            effects: {
              resources: {
                qi: 50,
                pills: 2
              },
              exp: 100
            }
          },
          {
            probability: 0.3,
            result: '丹药的效果一般，只提供了少量的提升。',
            effects: {
              resources: {
                qi: 10
              },
              exp: 30
            }
          },
          {
            probability: 0.2,
            result: '丹药有些变质，你感到身体不适，失去了一些灵气。',
            effects: {
              resources: {
                qi: -20
              }
            }
          }
        ]
      },
      {
        id: 'examine',
        text: '仔细研究丹药',
        outcomes: [
          {
            probability: 0.7,
            result: '通过研究，你了解了丹药的配方，获得了炼丹经验。',
            effects: {
              exp: 60,
              resources: {
                pills: 1
              }
            }
          },
          {
            probability: 0.3,
            result: '你无法确定丹药的成分，决定将其丢弃。',
            effects: {
              exp: 10
            }
          }
        ]
      },
      {
        id: 'discard',
        text: '丢弃丹药，避免风险',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择丢弃丹药，避免了潜在的风险，继续安全地修炼。',
            effects: {
              resources: {
                qi: 15
              },
              exp: 20
            }
          }
        ]
      }
    ]
  },
  // 新增事件：修仙拍卖会
  {
    id: 'auction',
    title: '修仙拍卖会',
    description: '你听说附近的城镇将举行一场修仙拍卖会，据说会有珍贵的修炼资源出售。',
    triggerChance: 0.1,
    choices: [
      {
        id: 'attend',
        text: '参加拍卖会',
        outcomes: [
          {
            probability: 0.3,
            result: '你在拍卖会上拍到了一株珍贵的千年灵芝，这对修炼大有裨益。',
            effects: {
              resources: {
                spiritFruit: 3,
                pills: 5
              },
              exp: 100
            }
          },
          {
            probability: 0.4,
            result: '你拍到了一些有用的炼丹材料，但花费了不少金币。',
            effects: {
              resources: {
                materials: 30,
                gold: -150
              },
              exp: 60
            }
          },
          {
            probability: 0.3,
            result: '拍卖会上的物品价格太高，你没有拍到任何东西，只获得了一些见识。',
            effects: {
              exp: 30
            }
          }
        ]
      },
      {
        id: 'skip',
        text: '跳过拍卖会，继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择继续修炼，获得了稳定的进步。',
            effects: {
              resources: {
                qi: 20
              },
              exp: 40
            }
          }
        ]
      }
    ]
  },
  // 新增事件：雷劫预警
  {
    id: 'thunder-warning',
    title: '雷劫预警',
    description: '天空突然乌云密布，你感觉到了即将来临的雷劫气息。这可能是一个突破的机会。',
    triggerChance: 0.08,
    choices: [
      {
        id: 'prepare-breakthrough',
        text: '准备突破，迎接雷劫',
        outcomes: [
          {
            probability: 0.4,
            result: '你成功利用雷劫突破了境界，获得了巨大的提升！',
            effects: {
              resources: {
                qi: 100
              },
              exp: 200,
              breakthroughBonus: true
            }
          },
          {
            probability: 0.3,
            result: '雷劫威力比预期的小，你虽然没有突破，但获得了一些特殊的修炼效果。',
            effects: {
              resources: {
                qi: 50,
                pills: 3
              },
              exp: 100
            }
          },
          {
            probability: 0.3,
            result: '雷劫威力太大，你不得不躲避，浪费了一些修炼时间。',
            effects: {
              exp: 20
            }
          }
        ]
      },
      {
        id: 'hide',
        text: '寻找地方躲避雷劫',
        outcomes: [
          {
            probability: 1.0,
            result: '你成功躲避了雷劫，虽然没有获得突破，但也没有受到损失。',
            effects: {
              resources: {
                qi: 10
              },
              exp: 30
            }
          }
        ]
      }
    ]
  },
  // 新增事件：神秘商人
  {
    id: 'mysterious-merchant',
    title: '神秘商人',
    description: '一位穿着斗篷的神秘商人出现在你面前，他的摊位上摆满了各种奇特的物品。',
    triggerChance: 0.12,
    choices: [
      {
        id: 'buy-pill',
        text: '购买神秘丹药（50金币）',
        outcomes: [
          {
            probability: 0.5,
            result: '这是一颗高级聚气丹，大幅提升了你的灵气储备！',
            effects: {
              resources: {
                qi: 80,
                gold: -50
              },
              exp: 50
            }
          },
          {
            probability: 0.5,
            result: '丹药效果一般，只是普通的聚气丹。',
            effects: {
              resources: {
                qi: 20,
                gold: -50
              },
              exp: 20
            }
          }
        ]
      },
      {
        id: 'buy-material',
        text: '购买炼丹材料（30金币）',
        outcomes: [
          {
            probability: 0.7,
            result: '这些材料非常优质，适合炼制高级丹药。',
            effects: {
              resources: {
                materials: 40,
                gold: -30
              },
              exp: 30
            }
          },
          {
            probability: 0.3,
            result: '材料品质一般，和普通市场上的差不多。',
            effects: {
              resources: {
                materials: 15,
                gold: -30
              },
              exp: 10
            }
          }
        ]
      },
      {
        id: 'decline',
        text: '拒绝购买，继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择继续修炼，商人对你笑了笑，消失在原地。',
            effects: {
              resources: {
                qi: 15
              },
              exp: 20
            }
          }
        ]
      }
    ]
  },
  // 新增事件：同门挑战
  {
    id: 'fellow-challenge',
    title: '同门挑战',
    description: '一位同门修仙者向你发起了挑战，想要与你切磋修炼成果。',
    triggerChance: 0.1,
    choices: [
      {
        id: 'accept',
        text: '接受挑战',
        outcomes: [
          {
            probability: 0.5,
            result: '你轻松击败了同门，获得了大家的认可和奖励。',
            effects: {
              resources: {
                gold: 100,
                pills: 2
              },
              exp: 80
            }
          },
          {
            probability: 0.3,
            result: '你们打成平手，互相学习，都获得了修炼经验。',
            effects: {
              exp: 50
            }
          },
          {
            probability: 0.2,
            result: '你输给了同门，但从失败中获得了宝贵的经验教训。',
            effects: {
              exp: 60
            }
          }
        ]
      },
      {
        id: 'decline',
        text: '委婉拒绝挑战',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择专注于自己的修炼，避免了不必要的消耗。',
            effects: {
              resources: {
                qi: 20
              },
              exp: 40
            }
          }
        ]
      }
    ]
  },
  // 新增事件：梦境启示
  {
    id: 'dream-revelation',
    title: '梦境启示',
    description: '在修炼时，你进入了一个奇怪的梦境，梦中似乎有仙人在传授你修炼心法。',
    triggerChance: 0.1,
    choices: [
      {
        id: 'follow-dream',
        text: '跟随梦境，学习心法',
        outcomes: [
          {
            probability: 0.6,
            result: '你成功领悟了仙人传授的心法，修炼效率大幅提升！',
            effects: {
              cultivationSpeedBoost: 0.2,
              exp: 150
            }
          },
          {
            probability: 0.4,
            result: '你只记住了心法的一部分，但也获得了显著的提升。',
            effects: {
              cultivationSpeedBoost: 0.1,
              exp: 80
            }
          }
        ]
      },
      {
        id: 'wake-up',
        text: '强行醒来，继续修炼',
        outcomes: [
          {
            probability: 1.0,
            result: '你选择回到现实继续修炼，获得了稳定的进步。',
            effects: {
              resources: {
                qi: 30
              },
              exp: 50
            }
          }
        ]
      }
    ]
  }
];
