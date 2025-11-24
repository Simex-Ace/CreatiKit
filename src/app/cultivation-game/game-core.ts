import { GameState, Resources, Skill, Equipment, OfflineRewards, Quest, GameEvent } from './types';
import {
  createInitialSkills,
  canLevelUp,
  levelUp,
  calculateCultivationSpeed,
  calculateQiGatherRate,
  calculateOfflineRewards,
  getCultivationLevelInfo
} from './utils';
import { quests as initialQuests } from './data/quests';
import { events as initialEvents } from './data/events';
import { pills as initialPills } from './data/pills';
import { alchemyRecipes as initialRecipes } from './data/recipes';

// 创建新的游戏状态
export function createNewGame(playerName: string = '修真者'): GameState {
  const initialSkills = createInitialSkills();
  const initialLevelInfo = getCultivationLevelInfo('练气初期');
  
  return {
    playerName,
    cultivation: {
      level: '练气初期',
      exp: 0,
      maxExp: initialLevelInfo?.maxExp || 100,
      qiCapacity: initialLevelInfo?.baseQiCapacity || 100,
      cultivationSpeed: calculateCultivationSpeed({} as GameState, '练气初期')
    },
    resources: {
      qi: 0,
      gold: 100,
      pills: 5,
      materials: 20,
      spiritFruit: 2,
      spiritGrass: 10,
      spiritWater: 5,
      spiritStone: 10,
      spiritCrystal: 2,
      heavenlyHerb: 0,
      immortalFruit: 0,
      divineEssence: 0
    },
    skills: initialSkills,
    equipment: [
      {
        id: 'starter_robe',
        name: '粗布道袍',
        type: 'armor',
        level: 1,
        effects: {
          qiCapacity: 20
        }
      },
      {
        id: 'starter_ring',
        name: '聚气戒指',
        type: 'accessory',
        level: 1,
        effects: {
          cultivationSpeed: 0.2
        }
      }
    ],
    lastUpdateTime: Date.now(),
    lastPlayTime: Date.now(),
    offlineTime: 0,
    autoCultivate: false,
    autoGatherQi: false,
    achievements: [],
    quests: [...initialQuests], // 初始化任务列表
    alchemy: {
      recipes: initialRecipes.filter(recipe => recipe.requiredLevel === '练气初期'), // 初始解锁基础配方
      progress: 0,
      isBrewing: false,
      lastBrewTime: Date.now(),
      successCount: 0,
      failedCount: 0
    },
    // 统计数据（用于成就系统）
    totalCultivations: 0,
    totalQiGathered: 0,
    autoCultivationCount: 0,
    autoGatheringCount: 0,
    rewardsReceived: []
  };
}

// 游戏主类
export class CultivationGame {
  private gameState: GameState;
  private gameLoopInterval: number | null = null;
  private eventCallback: ((eventType: string, data: any) => void) | null = null;
  private currentEvent: GameEvent | null = null;

  constructor(savedState?: GameState) {
    this.gameState = savedState || createNewGame();
    // 如果有离线时间，计算离线收益
    this.processOfflineRewards();
  }
  
  // 检查并应用成就奖励
  checkAndApplyAchievementRewards() {
    let hasChanges = false;

    // 1. 初次修炼奖励
    if ((this.gameState.totalCultivations || 0) > 0 && !this.gameState.rewardsReceived?.includes('first-cultivation')) {
      hasChanges = true;
      this.gameState.rewardsReceived = [...(this.gameState.rewardsReceived || []), 'first-cultivation'];
      this.gameState.resources.pills += 3; // 奖励3颗丹药
      this.notifyEvent('achievement_unlocked', { 
        achievement: 'first-cultivation', 
        description: '初次修炼 - 完成第一次修炼',
        reward: '3颗丹药'
      });
    }

    // 2. 灵气大师奖励（采集效率+10%）
    if ((this.gameState.totalQiGathered || 0) >= 100 && !this.gameState.rewardsReceived?.includes('qi-master')) {
      // 提升灵气采集速率
      const gatherSkill = this.gameState.skills.find(s => s.effects.qiGatherRate);
      if (gatherSkill) {
        // 确保effects对象存在且有qiGatherRate属性
        if (!gatherSkill.effects) {
          gatherSkill.effects = {};
        }
        gatherSkill.effects.qiGatherRate = (gatherSkill.effects.qiGatherRate || 0) + 0.1;
      }
      hasChanges = true;
      this.gameState.rewardsReceived = [...(this.gameState.rewardsReceived || []), 'qi-master'];
      this.notifyEvent('achievement_unlocked', { 
        achievement: 'qi-master', 
        description: '灵气大师 - 已采集100点灵气',
        reward: '灵气采集效率+10%'
      });
    }

    // 3. 境界突破奖励（练气中期）
    if (this.gameState.cultivation.level.includes('中期') && !this.gameState.rewardsReceived?.includes('breakthrough')) {
      hasChanges = true;
      this.gameState.rewardsReceived = [...(this.gameState.rewardsReceived || []), 'breakthrough'];
      this.gameState.resources.spiritFruit += 2; // 奖励2个灵果
      this.notifyEvent('achievement_unlocked', { 
        achievement: 'breakthrough', 
        description: '境界突破 - 达到练气中期',
        reward: '2个灵果'
      });
    }

    // 4. 自动化专家奖励（自动模式效率+10%）
    if ((this.gameState.autoCultivationCount || 0) >= 100 && !this.gameState.rewardsReceived?.includes('auto-pro')) {
      // 提升自动模式效率
      hasChanges = true;
      this.gameState.rewardsReceived = [...(this.gameState.rewardsReceived || []), 'auto-pro'];
      this.notifyEvent('achievement_unlocked', { 
        achievement: 'auto-pro', 
        description: '自动化专家 - 自动修炼100次',
        reward: '自动模式效率+10%'
      });
    }

    // 5. 富有的修真者奖励
    if (this.gameState.resources.gold >= 1000 && !this.gameState.rewardsReceived?.includes('rich-cultivator')) {
      hasChanges = true;
      this.gameState.rewardsReceived = [...(this.gameState.rewardsReceived || []), 'rich-cultivator'];
      this.gameState.resources.materials += 50; // 奖励50材料
      this.notifyEvent('achievement_unlocked', { 
        achievement: 'rich-cultivator', 
        description: '富有的修真者 - 积累1000灵石',
        reward: '50材料'
      });
    }

    // 6. 技能精通奖励
    const upgradedSkillsCount = this.gameState.skills.filter(s => s.level > 1).length;
    if (upgradedSkillsCount >= 5 && !this.gameState.rewardsReceived?.includes('skill-master')) {
      hasChanges = true;
      this.gameState.rewardsReceived = [...(this.gameState.rewardsReceived || []), 'skill-master'];
      this.gameState.resources.gold += 200; // 奖励200灵石
      this.notifyEvent('achievement_unlocked', { 
        achievement: 'skill-master', 
        description: '技能精通 - 升级5个技能',
        reward: '200灵石'
      });
    }

    if (hasChanges) {
      this.notifyEvent('game_updated', { state: this.getState() });
    }
  }

  // 设置事件回调
  setEventCallback(callback: ((eventType: string, data: any) => void) | null) {
    this.eventCallback = callback;
  }

  // 获取当前游戏状态
  getState(): GameState {
    return { ...this.gameState };
  }

  // 处理离线收益
  private processOfflineRewards() {
    const currentTime = Date.now();
    const lastUpdateTime = this.gameState.lastUpdateTime;
    const offlineTimeMs = currentTime - lastUpdateTime;
    
    // 只计算超过30秒的离线时间
    if (offlineTimeMs > 30000) {
      const rewards: OfflineRewards = calculateOfflineRewards(this.gameState, offlineTimeMs);
      
      // 应用经验奖励
      if (rewards.exp) {
        this.gameState.cultivation.exp += rewards.exp;
        // 检查并执行升级
        while (canLevelUp(this.gameState)) {
          this.gameState = levelUp(this.gameState);
          this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
        }
      }
      
      // 应用灵气奖励
      if (rewards.qi) {
        this.gameState.resources.qi = Math.min(
          this.gameState.resources.qi + rewards.qi,
          this.gameState.cultivation.qiCapacity
        );
      }
      
      // 应用其他资源奖励
      if (rewards.gold) this.gameState.resources.gold += rewards.gold;
      if (rewards.pills) this.gameState.resources.pills += rewards.pills;
      if (rewards.spiritFruit) this.gameState.resources.spiritFruit += rewards.spiritFruit;
      
      this.gameState.offlineTime = offlineTimeMs;
      this.notifyEvent('offline_rewards', { rewards, offlineTimeMs });
    }
    
    this.gameState.lastUpdateTime = currentTime;
  }

  // 开始游戏循环
  startGameLoop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
    }
    
    // 每秒更新一次游戏状态
    this.gameLoopInterval = window.setInterval(() => {
      this.updateGameState();
    }, 1000);
  }

  // 停止游戏循环
  stopGameLoop() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
  }

  // 更新游戏状态
  private updateGameState() {
    const currentTime = Date.now();
    
    // 自动修炼
    if (this.gameState.autoCultivate) {
      this.cultivate(true);
    }
    
    // 自动采集灵气
    if (this.gameState.autoGatherQi) {
      this.gatherQi(true);
    }
    
    // 更新炼丹进度
    this.updateAlchemyProgress();
    
    // 自动获得灵石（每10秒获得1点）
    if (Math.random() < 0.1) { // 10%概率每秒获得1点灵石
      this.gameState.resources.gold += 1;
    }
    
    // 检查任务完成情况
    this.checkAllQuests();
    
    this.gameState.lastUpdateTime = currentTime;
    this.notifyEvent('game_updated', { state: this.getState() });
  }

  // 手动修炼
  cultivate(auto: boolean = false): boolean {
    if (!this.gameState.resources || !this.gameState.cultivation) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    if (this.gameState.resources.qi < 10 && !auto) {
      this.notifyEvent('error', { message: '灵气不足，无法修炼' });
      return false;
    }
    
    // 消耗灵气
    if (!auto) {
      this.gameState.resources.qi = Math.max(0, this.gameState.resources.qi - 10);
    } else {
      // 自动修炼时每分钟消耗一次灵气
      if (Math.random() < 1/60) { // 60秒一次
        this.gameState.resources.qi = Math.max(0, this.gameState.resources.qi - 10);
      }
    }
    
    const cultivationSpeed = calculateCultivationSpeed(this.gameState);
    const expGain = cultivationSpeed * (auto ? 0.3 : 1); // 自动修炼效率提高
    
    this.gameState.cultivation.exp += expGain;
    
    // 更新统计数据
    this.gameState.totalCultivations = (this.gameState.totalCultivations || 0) + 1;
    if (auto) {
      this.gameState.autoCultivationCount = (this.gameState.autoCultivationCount || 0) + 1;
    }
    
    // 检查是否可以升级
    while (canLevelUp(this.gameState)) {
      this.gameState = levelUp(this.gameState);
      this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
    }
    
    // 有20%几率触发随机事件
    if (!auto && Math.random() < 0.2) {
      this.triggerRandomEvent();
    }
    
    this.notifyEvent('cultivated', { expGain, totalExp: this.gameState.cultivation.exp });
    return true;
  }

  // 采集灵气
  gatherQi(auto: boolean = false): boolean {
    if (!this.gameState.resources || !this.gameState.cultivation) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    if (this.gameState.resources.qi >= this.gameState.cultivation.qiCapacity) {
      if (!auto) {
        this.notifyEvent('error', { message: '灵气已达到上限' });
      }
      return false;
    }
    
    const qiRate = calculateQiGatherRate(this.gameState);
    const qiGain = qiRate * (auto ? 0.3 : 1); // 自动采集效率提高
    
    this.gameState.resources.qi = Math.min(
      this.gameState.resources.qi + qiGain,
      this.gameState.cultivation.qiCapacity
    );
    
    // 更新统计数据
    this.gameState.totalQiGathered = (this.gameState.totalQiGathered || 0) + Math.floor(qiGain);
    if (auto) {
      this.gameState.autoGatheringCount = (this.gameState.autoGatheringCount || 0) + 1;
    }
    
    // 有20%几率触发随机事件
    if (!auto && Math.random() < 0.2) {
      this.triggerRandomEvent();
    }
    
    if (!auto) {
      this.notifyEvent('qi_gathered', { qiGain, totalQi: this.gameState.resources.qi });
    }
    return true;
  }

  // 使用丹药
  usePill(): boolean {
    if (!this.gameState.resources || !this.gameState.cultivation) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    if (this.gameState.resources.pills <= 0) {
      this.notifyEvent('error', { message: '没有丹药了' });
      return false;
    }
    
    this.gameState.resources.pills--;
    this.gameState.resources.qi = Math.min(
      this.gameState.resources.qi + 50,
      this.gameState.cultivation.qiCapacity
    );
    
    this.notifyEvent('pill_used', { remainingPills: this.gameState.resources.pills });
    return true;
  }

  // 使用灵果
  useSpiritFruit(): boolean {
    if (!this.gameState || !this.gameState.resources || !this.gameState.cultivation) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    if (this.gameState.resources.spiritFruit <= 0) {
      this.notifyEvent('error', { message: '灵果不足' });
      return false;
    }
    
    // 消耗灵果并获得效果：增加100点灵气和20点经验
    this.gameState.resources.spiritFruit--;
    this.gameState.resources.qi = Math.min(
      this.gameState.resources.qi + 100,
      this.gameState.cultivation.qiCapacity
    );
    this.gameState.cultivation.exp += 20;
    
    // 检查是否可以升级
    while (canLevelUp(this.gameState)) {
      this.gameState = levelUp(this.gameState);
      this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
    }
    
    this.notifyEvent('spirit_fruit_used', { message: '你服用了一颗灵果，获得了100点灵气和20点经验！' });
    return true;
  }

  // 切换自动修炼
  toggleAutoCultivate(): boolean {
    if (!this.gameState) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    this.gameState.autoCultivate = !this.gameState.autoCultivate;
    this.notifyEvent('auto_cultivate_toggled', { enabled: this.gameState.autoCultivate });
    return this.gameState.autoCultivate;
  }

  // 切换自动采集灵气
  toggleAutoGatherQi(): boolean {
    if (!this.gameState) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    this.gameState.autoGatherQi = !this.gameState.autoGatherQi;
    this.notifyEvent('auto_gather_qi_toggled', { enabled: this.gameState.autoGatherQi });
    return this.gameState.autoGatherQi;
  }

  // 升级技能
  upgradeSkill(skillId: string): boolean {
    if (!this.gameState || !this.gameState.skills || !this.gameState.resources) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    const skill = this.gameState.skills.find(s => s.id === skillId);
    if (!skill) {
      this.notifyEvent('error', { message: '技能不存在' });
      return false;
    }
    
    if (skill.level >= skill.maxLevel) {
      this.notifyEvent('error', { message: '技能已达到最高等级' });
      return false;
    }
    
    const upgradeCost = 100 * skill.level;
    if (this.gameState.resources.gold < upgradeCost) {
      this.notifyEvent('error', { message: '灵石不足' });
      return false;
    }
    
    // 扣除费用并升级技能
    this.gameState.resources.gold -= upgradeCost;
    skill.level++;
    
    // 根据技能类型增加效果
    if (skill.effects.qiGatherRate) {
      skill.effects.qiGatherRate += 0.2; // 每次升级增加0.2的灵气采集速率
    }
    if (skill.effects.cultivationSpeed) {
      skill.effects.cultivationSpeed += 0.1; // 每次升级增加0.1的修炼速度
    }
    
    this.notifyEvent('skill_upgraded', { skillId, newLevel: skill.level });
    return true;
  }

  // 购买物品
  // 出售资源获得灵石
  sellResource(resourceType: 'pills' | 'spiritFruit', quantity: number = 1): boolean {
    if (!this.gameState || !this.gameState.resources) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    const sellPrices = {
      pills: 10,  // 每个丹药卖10灵石
      spiritFruit: 25  // 每个灵果卖25灵石
    };
    
    if (this.gameState.resources[resourceType] < quantity) {
      this.notifyEvent('error', { message: '资源不足' });
      return false;
    }
    
    const totalIncome = sellPrices[resourceType] * quantity;
    this.gameState.resources[resourceType] -= quantity;
    this.gameState.resources.gold += totalIncome;
    
    this.notifyEvent('resource_sold', { resourceType, quantity, totalIncome });
    return true;
  }

  buyItem(itemType: 'pills' | 'spiritFruit', quantity: number = 1): boolean {
    if (!this.gameState || !this.gameState.resources) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    const prices = {
      pills: 20,  // 每个丹药20灵石
      spiritFruit: 50  // 每个灵果50灵石
    };
    
    const totalCost = prices[itemType] * quantity;
    if (this.gameState.resources.gold < totalCost) {
      this.notifyEvent('error', { message: '灵石不足' });
      return false;
    }
    
    this.gameState.resources.gold -= totalCost;
    this.gameState.resources[itemType] += quantity;
    
    this.notifyEvent('item_bought', { itemType, quantity, totalCost });
    return true;
  }

  // 检查所有任务的完成条件
  checkAllQuests() {
    let hasChanges = false;
    
    if (this.gameState && this.gameState.quests) {
      this.gameState.quests.forEach(quest => {
        if (quest && !quest.completed && this.checkQuestCompletion(quest.id)) {
          quest.completed = true;
          hasChanges = true;
          this.notifyEvent('quest_completed', { quest });
        }
      });
    }
    
    return hasChanges;
  }

  // 检查单个任务的完成条件
  checkQuestCompletion(questId: string): boolean {
    if (!this.gameState || !this.gameState.quests || !this.gameState.cultivation || !this.gameState.resources) {
      return false;
    }
    const quest = this.gameState.quests.find(q => q.id === questId);
    if (!quest || quest.completed) return false;
    
    // 检查境界条件
    if (quest.requirements?.level && this.gameState.cultivation.level !== quest.requirements.level) {
      return false;
    }
    
    // 检查资源条件
    if (quest.requirements?.resources) {
      for (const [resource, amount] of Object.entries(quest.requirements.resources)) {
        if ((this.gameState.resources as any)[resource] < amount) {
          return false;
        }
      }
    }
    
    // 检查技能条件
    if (quest.requirements.skills) {
      for (const skillReq of quest.requirements.skills) {
        const skill = this.gameState.skills.find(s => s.id === skillReq.id);
        if (!skill || skill.level < skillReq.level) {
          return false;
        }
      }
    }
    
    return true;
  }

  // 领取任务奖励
  claimQuestReward(questId: string): boolean {
    if (!this.gameState || !this.gameState.quests || !this.gameState.cultivation) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    const quest = this.gameState.quests.find(q => q.id === questId);
    if (!quest || !quest.completed) {
      this.notifyEvent('error', { message: '任务未完成，无法领取奖励' });
      return false;
    }
    
    // 应用经验奖励
    if (quest.rewards.exp) {
      this.gameState.cultivation.exp += quest.rewards.exp;
      // 检查是否可以升级
      while (canLevelUp(this.gameState)) {
        this.gameState = levelUp(this.gameState);
        this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
      }
    }
    
    // 应用资源奖励
    if (quest.rewards.resources) {
      for (const [resource, amount] of Object.entries(quest.rewards.resources)) {
        if (resource === 'qi') {
          this.gameState.resources.qi = Math.min(
            this.gameState.resources.qi + amount,
            this.gameState.cultivation.qiCapacity
          );
        } else {
          (this.gameState.resources as any)[resource] += amount;
        }
      }
    }
    
    this.notifyEvent('quest_reward_claimed', { quest });
    return true;
  }
  
  // 检查事件触发条件
  private checkEventTrigger(event: GameEvent): boolean {
    if (!event.triggers) return false;
    
    // 根据概率决定是否触发
    return Math.random() < event.triggers.probability;
  }
  
  // 触发随机事件
  private triggerRandomEvent(): void {
    // 过滤出符合触发条件的事件
    const availableEvents = initialEvents.filter(event => this.checkEventTrigger(event));
    
    if (availableEvents.length === 0) return;
    
    // 随机选择一个事件
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    this.currentEvent = availableEvents[randomIndex];
    
    this.notifyEvent('event_triggered', { event: this.currentEvent });
  }
  
  // 处理事件选择
  handleEventChoice(choiceIndex: number): void {
    if (!this.currentEvent) return;
    
    const choice = this.currentEvent.choices[choiceIndex];
    if (!choice) return;
    
    // 检查选择条件
    if (choice.requirements) {
      // 检查资源条件
      if (choice.requirements.resources) {
        for (const [resource, amount] of Object.entries(choice.requirements.resources)) {
          if ((this.gameState.resources as any)[resource] < amount) {
            this.notifyEvent('error', { message: '条件不足，无法选择该选项' });
            return;
          }
        }
      }
    }
    
    // 应用选择结果
    if (choice.outcomes) {
      for (const outcome of choice.outcomes) {
        // 应用经验变化
        if (outcome.type === 'exp' && outcome.amount) {
          this.gameState.cultivation.exp += outcome.amount;
          // 检查是否可以升级
          while (canLevelUp(this.gameState)) {
            this.gameState = levelUp(this.gameState);
            this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
          }
        }
        
        // 应用资源变化
        if (outcome.type === 'resource' && outcome.target && outcome.amount) {
          if (outcome.target === 'qi') {
            this.gameState.resources.qi = Math.min(
              this.gameState.resources.qi + outcome.amount,
              this.gameState.cultivation.qiCapacity
            );
          } else {
            (this.gameState.resources as any)[outcome.target] += outcome.amount;
          }
        }
        
        // 应用文本效果
        if (outcome.type === 'text' && outcome.message) {
          // 文本效果可以用于记录事件日志等
        }
      }
    }
    
    this.notifyEvent('event_resolved', { event: this.currentEvent, choice: choice });
    this.currentEvent = null;
  }

  // 开始炼丹
    startAlchemy(recipeId: string): boolean {
      if (!this.gameState.alchemy) {
        this.notifyEvent('error', { message: '炼丹系统未初始化' });
        return false;
      }
      const recipe = this.gameState.alchemy.recipes.find(r => r.id === recipeId);
      if (!recipe) {
        this.notifyEvent('error', { message: '未知的炼丹配方' });
        return false;
      }

      // 检查修真境界是否达到要求
      if (this.gameState.cultivation.level !== recipe.requiredLevel) {
        this.notifyEvent('error', { message: '修真境界不足，无法炼制此丹药' });
        return false;
      }

      // 检查材料是否足够
      for (const ingredient of recipe.ingredients) {
        if ((this.gameState.resources as any)[ingredient.material] < ingredient.amount) {
          this.notifyEvent('error', { message: '材料不足，无法炼制此丹药' });
          return false;
        }
      }

      // 扣除材料
      for (const ingredient of recipe.ingredients) {
        (this.gameState.resources as any)[ingredient.material] -= ingredient.amount;
      }

      // 开始炼丹
      this.gameState.alchemy.currentPill = recipe.pillId;
      this.gameState.alchemy.progress = 0;
      this.gameState.alchemy.isBrewing = true;
      this.gameState.alchemy.lastBrewTime = Date.now();

      this.notifyEvent('alchemy_started', { recipe });
      return true;
    }

    // 更新炼丹进度
    private updateAlchemyProgress() {
      if (!this.gameState.alchemy || !this.gameState.alchemy.isBrewing || !this.gameState.alchemy.currentPill) {
        return;
      }

      const currentTime = Date.now();
      const timeElapsed = currentTime - this.gameState.alchemy.lastBrewTime;
      
      // 每10秒增加10%的进度
      const progressIncrease = (timeElapsed / 10000) * 10;
      this.gameState.alchemy.progress = Math.min(this.gameState.alchemy.progress + progressIncrease, 100);
      this.gameState.alchemy.lastBrewTime = currentTime;

      // 炼丹完成
      if (this.gameState.alchemy.progress >= 100) {
        this.completeAlchemy();
      }
    }

    // 完成炼丹
    private completeAlchemy() {
      if (!this.gameState.alchemy || !this.gameState.alchemy.currentPill) {
        return;
      }

      const recipe = this.gameState.alchemy.recipes.find(r => r.pillId === this.gameState.alchemy.currentPill);
      if (!recipe) {
        return;
      }

      // 检查成功率
      const success = Math.random() < recipe.successRate;
      const pill = initialPills.find(p => p.id === recipe.pillId);

      if (success && pill) {
        // 成功炼制，获得丹药
        this.gameState.resources.pills++;
        this.gameState.alchemy.successCount++;
        this.gameState.cultivation.exp += recipe.expGain;
        
        // 检查是否可以升级
        while (canLevelUp(this.gameState)) {
          this.gameState = levelUp(this.gameState);
          this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
        }

        this.notifyEvent('alchemy_success', { pill, expGain: recipe.expGain });
      } else {
        // 炼丹失败
        this.gameState.alchemy.failedCount++;
        this.notifyEvent('alchemy_failed', { recipe });
      }

      // 重置炼丹状态
      this.gameState.alchemy.isBrewing = false;
      this.gameState.alchemy.currentPill = undefined;
      this.gameState.alchemy.progress = 0;
    }

    // 解锁新的炼丹配方
    unlockAlchemyRecipe(recipeId: string): boolean {
      const recipe = initialRecipes.find(r => r.id === recipeId);
      if (!recipe) {
        return false;
      }

      if (!this.gameState.alchemy) {
        return false;
      }

      // 检查是否已经解锁
      if (this.gameState.alchemy.recipes.find(r => r.id === recipeId)) {
        return false;
      }

      // 检查修真境界是否达到要求
      if (this.gameState.cultivation.level !== recipe.requiredLevel) {
        return false;
      }

      // 解锁配方
      this.gameState.alchemy.recipes.push(recipe);
      this.notifyEvent('recipe_unlocked', { recipe });
      return true;
    }

    // 通知事件
    private notifyEvent(eventType: string, data: any) {
    if (this.eventCallback) {
      this.eventCallback(eventType, data);
    }
  }
}