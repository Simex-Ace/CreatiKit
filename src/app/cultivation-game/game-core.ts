import { GameState, Resources, Skill, Equipment, OfflineRewards } from './types';
import {
  createInitialSkills,
  canLevelUp,
  levelUp,
  calculateCultivationSpeed,
  calculateQiGatherRate,
  calculateOfflineRewards,
  getCultivationLevelInfo
} from './utils';

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
      spiritFruit: 2
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
  setEventCallback(callback: (eventType: string, data: any) => void) {
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
    
    this.gameState.lastUpdateTime = currentTime;
    this.notifyEvent('game_updated', { state: this.getState() });
  }

  // 手动修炼
  cultivate(auto: boolean = false): boolean {
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
    
    this.notifyEvent('cultivated', { expGain, totalExp: this.gameState.cultivation.exp });
    return true;
  }

  // 采集灵气
  gatherQi(auto: boolean = false): boolean {
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
    
    if (!auto) {
      this.notifyEvent('qi_gathered', { qiGain, totalQi: this.gameState.resources.qi });
    }
    return true;
  }

  // 使用丹药
  usePill(): boolean {
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
    if (this.gameState.resources.spiritFruit <= 0) {
      this.notifyEvent('error', { message: '没有灵果了' });
      return false;
    }
    
    this.gameState.resources.spiritFruit--;
    this.gameState.cultivation.exp += 100;
    
    // 检查是否可以升级
    while (canLevelUp(this.gameState)) {
      this.gameState = levelUp(this.gameState);
      this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
    }
    
    this.notifyEvent('spirit_fruit_used', { expGain: 100 });
    return true;
  }

  // 切换自动修炼
  toggleAutoCultivate(): boolean {
    this.gameState.autoCultivate = !this.gameState.autoCultivate;
    this.notifyEvent('auto_cultivate_toggled', { enabled: this.gameState.autoCultivate });
    return this.gameState.autoCultivate;
  }

  // 切换自动采集灵气
  toggleAutoGatherQi(): boolean {
    this.gameState.autoGatherQi = !this.gameState.autoGatherQi;
    this.notifyEvent('auto_gather_qi_toggled', { enabled: this.gameState.autoGatherQi });
    return this.gameState.autoGatherQi;
  }

  // 升级技能
  upgradeSkill(skillId: string): boolean {
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
  buyItem(itemType: 'pills' | 'spiritFruit', quantity: number = 1): boolean {
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

  // 通知事件
  private notifyEvent(eventType: string, data: any) {
    if (this.eventCallback) {
      this.eventCallback(eventType, data);
    }
  }
}