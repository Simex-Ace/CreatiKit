import { GameState, Resources, Skill, Equipment, OfflineRewards, Quest, GameEvent, Event, Achievement, Monster, BattleResult, CultivationLevel, Pet, Sect, SectTask, PillQuality, Pill, AlchemyRecipe } from './types';
import { monsters as initialMonsters } from './data/monsters';
import { forgeBlueprints as initialForgeBlueprints } from './data/forge-blueprints';
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
import { achievements as initialAchievements } from './data/achievements';
import { alchemyRecipes as initialRecipes } from './data/alchemy-recipes';
import { petData } from './data/pets';
import { sects } from './data/sects';

// 创建新的游戏状态
export function createNewGame(playerName: string = '修真者'): GameState {
  const initialSkills = createInitialSkills();
  const initialLevelInfo = getCultivationLevelInfo('qi_refining_1');
  
  return {
    playerName,
    cultivation: {
      level: 'qi_refining_1',
      exp: 0,
      maxExp: initialLevelInfo?.maxExp || 100,
      qiCapacity: initialLevelInfo?.baseQiCapacity || 100,
      cultivationSpeed: calculateCultivationSpeed({} as GameState, 'qi_refining_1'),
      cultivationSpeedBonus: 0,
      breakthroughChanceBonus: 0,
      qiGatherRateBonus: 0,
      expGainBonus: 0,
      resourceGatheringSpeedBonus: 0,
      alchemySuccessRateBonus: 0,
      skillExpBoostBonus: 0,
      sect: undefined // 初始化宗门为undefined
    },
    resources: {
      qi: 0,
      gold: 100,
      pills: [],
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
    monsters: initialMonsters,
    pets: [], // 初始化宠物数组
    lastUpdateTime: Date.now(),
    lastPlayTime: Date.now(),
    offlineTime: 0,
    autoCultivate: false,
    autoGatherQi: false,
    achievements: [],
    unlockedAchievements: [], // 已解锁但未领取奖励的成就
    quests: [...initialQuests], // 初始化任务列表
    alchemy: {
      recipes: initialRecipes.filter(recipe => recipe.requiredLevel === 'qi_refining_1'), // 初始解锁基础配方
      progress: 0,
      isBrewing: false,
      currentPill: undefined,
      lastBrewTime: Date.now(),
      successCount: 0,
      failedCount: 0,
      skillLevel: 1,
      skillExp: 0,
      maxSkillExp: 100,
      qualityModifier: 1.0,
      totalQualityPoints: 0,
      activePills: [],
      knownPills: [],
      maxConcurrentPills: 3
    },
    forge: {
      blueprints: initialForgeBlueprints.filter(blueprint => blueprint.requiredLevel === 'qi_refining_1'), // 初始解锁基础图谱
      progress: 0,
      isForging: false,
      currentItem: undefined,
      lastForgeTime: Date.now(),
      successCount: 0,
      failedCount: 0
    },
    // 统计数据（用于成就系统）
    totalCultivations: 0,
    totalQiGathered: 0,
    autoCultivationCount: 0,
    autoGatheringCount: 0,
    rewardsReceived: [],
    totalEventsEncountered: 0,
    // 战斗系统相关
    battle: {
      isInBattle: false,
      currentMonster: undefined,
      playerHealth: 100,
      playerMaxHealth: 100,
      monsterHealth: 0,
      battleLog: []
    },
    // 战斗统计
    totalBattlesWon: 0,
    totalBattlesLost: 0,
    lastSave: Date.now()
  };
}

// 游戏主类
export class CultivationGame {
  private gameState: GameState;
  private gameLoopInterval: number | null = null;
  private eventCallback: ((eventType: string, data: any) => void) | null = null;
  private currentEvent: (GameEvent | Event) | null = null;

  constructor(savedState?: GameState) {
    this.gameState = savedState || createNewGame();
    // 确保unlockedAchievements存在
    if (!this.gameState.unlockedAchievements) {
      this.gameState.unlockedAchievements = [];
    }
    // 确保pets存在
    if (!this.gameState.pets) {
      this.gameState.pets = [];
    }
    // 确保alchemy和alchemy.activePills存在
    if (!this.gameState.alchemy) {
      this.gameState.alchemy = {
        recipes: initialRecipes.filter(recipe => recipe.requiredLevel === 'qi_refining_1'),
        progress: 0,
        isBrewing: false,
        currentPill: undefined,
        lastBrewTime: Date.now(),
        successCount: 0,
        failedCount: 0,
        skillLevel: 1,
        skillExp: 0,
        maxSkillExp: 100,
        qualityModifier: 1.0,
        totalQualityPoints: 0,
        activePills: [],
        knownPills: [],
        maxConcurrentPills: 3
      };
    } else if (!this.gameState.alchemy.activePills) {
      this.gameState.alchemy.activePills = [];
    }
    // 如果有离线时间，计算离线收益
    this.processOfflineRewards();
  }
  
  // 检查并应用成就奖励
  checkAndApplyAchievementRewards() {
    let hasChanges = false;

    // 遍历所有成就，检查条件并应用奖励
    for (const achievement of initialAchievements) {
      if (this.gameState.achievements.includes(achievement.id)) {
        continue; // 成就已解锁
      }

      // 检查成就条件
      let isUnlocked = true;

      if (achievement.requirements.level && this.gameState.cultivation.level !== achievement.requirements.level) {
        isUnlocked = false;
      }

      if (achievement.requirements.resources) {
        for (const [resource, amount] of Object.entries(achievement.requirements.resources)) {
          if (resource === 'pills') {
            // 对于丹药，使用数组长度进行比较
            if (this.gameState.resources.pills.length < (amount as number)) {
              isUnlocked = false;
              break;
            }
          } else {
            if ((this.gameState.resources[resource as keyof Resources] as number || 0) < (amount as number)) {
              isUnlocked = false;
              break;
            }
          }
        }
      }

      if (achievement.requirements.totalCultivations && 
          (this.gameState.totalCultivations || 0) < achievement.requirements.totalCultivations) {
        isUnlocked = false;
      }

      if (achievement.requirements.totalQiGathered && 
          (this.gameState.totalQiGathered || 0) < achievement.requirements.totalQiGathered) {
        isUnlocked = false;
      }

      if (achievement.requirements.autoCultivationCount && 
          (this.gameState.autoCultivationCount || 0) < achievement.requirements.autoCultivationCount) {
        isUnlocked = false;
      }

      if (achievement.requirements.autoGatheringCount && 
          (this.gameState.autoGatheringCount || 0) < achievement.requirements.autoGatheringCount) {
        isUnlocked = false;
      }

      if (achievement.requirements.alchemySuccess && 
          (this.gameState.alchemy.successCount || 0) < achievement.requirements.alchemySuccess) {
        isUnlocked = false;
      }

      if (achievement.requirements.skillMaxLevel) {
        const hasMaxLevelSkill = this.gameState.skills.some(skill => skill.level >= skill.maxLevel);
        if (!hasMaxLevelSkill) {
          isUnlocked = false;
        }
      }

      if (achievement.requirements.eventHandled && 
          (this.gameState.totalEventsEncountered || 0) < achievement.requirements.eventHandled) {
        isUnlocked = false;
      }

      if (achievement.requirements.petsCaught && 
          (this.gameState.pets.length || 0) < achievement.requirements.petsCaught) {
        isUnlocked = false;
      }

      if (achievement.requirements.petLevelMaxed) {
        const hasMaxLevelPet = this.gameState.pets.some(pet => pet.level >= 10); // 假设最大等级为10
        if (!hasMaxLevelPet) {
          isUnlocked = false;
        }
      }

      // 如果所有条件都满足，解锁成就但不自动应用奖励
      if (isUnlocked) {
        hasChanges = true;
        this.gameState.achievements.push(achievement.id);
        
        // 检查成就是否已经在unlockedAchievements数组中，如果不在，则添加
        if (!this.gameState.unlockedAchievements.includes(achievement.id)) {
          this.gameState.unlockedAchievements.push(achievement.id);
        }

        // 发送成就解锁通知
        this.notifyEvent('achievement_unlocked', { 
          achievement: { 
            id: achievement.id,
            description: `${achievement.name} - ${achievement.description}`,
            reward: achievement.reward
          }
        });
      }
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
    // 返回游戏状态的副本，并确保monsters字段是通过getAvailableMonsters方法过滤后的结果
    return {
      ...this.gameState,
      monsters: this.getAvailableMonsters()
    };
  }

  // 设置游戏状态（用于测试和调试）
  setState(newState: GameState): void {
    this.gameState = newState;
    // 触发游戏状态更新事件
    this.notifyEvent('game_updated', { state: this.getState() });
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
        // 经验满时不自动突破，只显示提示
        const expAfterGain = this.gameState.cultivation.exp + rewards.exp;
        if (expAfterGain >= this.gameState.cultivation.maxExp) {
          this.gameState.cultivation.exp = this.gameState.cultivation.maxExp;
          this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
        } else {
          this.gameState.cultivation.exp = expAfterGain;
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
      if (rewards.pills) {
        // 处理数字类型的丹药奖励（如成就奖励）
        for (let i = 0; i < rewards.pills; i++) {
          this.gameState.resources.pills.push({
            id: `pill_basic_${Date.now()}_${i}`,
            name: '聚气丹',
            description: '帮助修炼者凝聚灵气的基础丹药',
            type: '聚气丹',
            quality: 'normal',
            effect: { cultivationSpeed: 1.2 },
            duration: 300,
            stackable: true,
            maxStacks: 99,
            rarity: 'common',
            value: 10
          });
        }
      }
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
    
    // 更新炼器进度
    this.updateForgeProgress();
    
    // 检查和移除过期的丹药效果
    this.checkExpiredPills(currentTime);
    
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
    
    // 经验满时不自动突破，只显示提示
    if (canLevelUp(this.gameState)) {
      this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
    }
    
    // 有20%几率触发随机事件
    if (!auto && Math.random() < 0.2) {
      this.triggerRandomEvent('cultivate');
    }
    
    this.notifyEvent('cultivated', { expGain, totalExp: this.gameState.cultivation.exp });
    return true;
  }

  // 手动突破境界
  breakthrough(): boolean {
    try {
      console.log('========= 突破方法开始 =========');
      if (!this.gameState || !this.gameState.cultivation) {
        console.error('游戏状态未初始化');
        this.notifyEvent('error', { message: '游戏状态未初始化' });
        return false;
      }
      
      console.log('开始突破，当前经验:', this.gameState.cultivation.exp, '/', this.gameState.cultivation.maxExp);
      console.log('当前境界:', this.gameState.cultivation.level);
      
      // 检查是否可以突破
      const canBreakthrough = canLevelUp(this.gameState);
      console.log('是否可以突破:', canBreakthrough);
      
      // 检查是否可以突破
      if (!canBreakthrough) {
        this.notifyEvent('error', { message: '经验不足，无法突破' });
        return false;
      }
      
      // 计算突破成功率
      let successChance = 0.6; // 基础成功率60%
      
      // 如果有突破丹药，提高成功率
      let usedPill = false;
      if (this.gameState.resources.pills.length > 0) {
        successChance += 0.2; // 使用丹药增加20%成功率
        this.gameState.resources.pills.pop(); // 消耗一颗丹药
        usedPill = true;
        console.log('使用了一颗突破丹药，成功率提升至', successChance * 100, '%');
      }
      
      // 实际突破逻辑：根据成功率决定是否成功
      const isSuccess = Math.random() < successChance;
      console.log('突破结果:', isSuccess ? '成功' : '失败');
      
      if (isSuccess) {
        // 突破成功
        const oldLevel = this.gameState.cultivation.level;
        const updatedState = levelUp(this.gameState);
        const newLevel = updatedState.cultivation.level;
        
        // 更新游戏状态
        this.gameState = updatedState;
        
        console.log('突破成功！从', oldLevel, '升级到', newLevel);
        
        // 确保状态正确更新
        this.notifyEvent('breakthrough_success', { newLevel, oldLevel });
        // 同时触发game_updated事件以确保界面更新
        this.notifyEvent('game_updated', { state: updatedState });
        return true;
      } else {
        // 突破失败
        // 失败惩罚：损失一些经验
        const oldExp = this.gameState.cultivation.exp;
        const expLoss = this.gameState.cultivation.maxExp * 0.2;
        this.gameState.cultivation.exp = Math.max(0, this.gameState.cultivation.exp - expLoss);
        
        console.log('突破失败，损失了', expLoss, '点经验');
        
        this.notifyEvent('breakthrough_failed', { 
          message: '突破失败，损失了20%的经验',
          oldExp,
          newExp: this.gameState.cultivation.exp,
          expLoss
        });
        // 同时触发game_updated事件以确保界面更新
        this.notifyEvent('game_updated', { state: this.getState() });
        return false;
      }
    } catch (error) {
      console.error('突破功能出错:', error);
      this.notifyEvent('error', { message: '突破功能出错' });
      return false;
    }
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
      this.triggerRandomEvent('gatherQi');
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
    if (this.gameState.resources.pills.length === 0) {
      this.notifyEvent('error', { message: '没有丹药了' });
      return false;
    }
    
    // 取出第一颗丹药
    const pill = this.gameState.resources.pills.shift();
    if (!pill) {
      return false;
    }
    
    // 应用丹药效果
    this.applyPillEffects(pill);
    
    this.notifyEvent('pill_used', { remainingPills: this.gameState.resources.pills.length });
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
    
    // 经验满时不自动突破，只显示提示
    const expAfterGain = this.gameState.cultivation.exp + 20;
    if (expAfterGain >= this.gameState.cultivation.maxExp) {
      this.gameState.cultivation.exp = this.gameState.cultivation.maxExp;
      this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
    } else {
      this.gameState.cultivation.exp = expAfterGain;
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

  // 战斗系统相关方法
  getAvailableMonsters(): Monster[] {
    if (!this.gameState) return [];
    
    // 根据当前境界过滤可用怪物
    return initialMonsters.filter(monster => {
      // 这里可以根据玩家的修炼境界来过滤怪物
      return true; // 暂时返回所有怪物
    });
  }

  startBattle(monsterId: string): boolean {
    if (!this.gameState) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    
    // 确保battle属性存在，如果不存在则初始化
    if (!this.gameState.battle) {
      this.gameState.battle = {
        isInBattle: false,
        currentMonster: undefined,
        playerHealth: 100,
        playerMaxHealth: 100,
        monsterHealth: 0,
        battleLog: []
      };
    }
    
    if (this.gameState.battle.isInBattle) {
      this.notifyEvent('error', { message: '当前正在战斗中' });
      return false;
    }
    
    const monster = initialMonsters.find(m => m.id === monsterId);
    if (!monster) {
      this.notifyEvent('error', { message: '怪物不存在' });
      return false;
    }
    
    // 开始战斗
    this.gameState.battle.isInBattle = true;
    this.gameState.battle.currentMonster = { ...monster };
    this.gameState.battle.playerHealth = 100; // 重置玩家生命值
    this.gameState.battle.playerMaxHealth = 100; // 确保玩家最大生命值已设置
    this.gameState.battle.monsterHealth = monster.stats.maxHealth;
    this.gameState.battle.battleLog = [`战斗开始！你遇到了${monster.name}！`]; // 初始化战斗日志
    
    this.notifyEvent('battle_started', { monster });
    return true;
  }

  attackMonster(): BattleResult {
    if (!this.gameState) {
      return { victory: false, expGained: 0, goldGained: 0, drops: {}, message: '不在战斗中' };
    }
    
    // 确保battle属性存在，如果不存在则初始化
    if (!this.gameState.battle) {
      this.gameState.battle = {
        isInBattle: false,
        currentMonster: undefined,
        playerHealth: 100,
        playerMaxHealth: 100,
        monsterHealth: 0,
        battleLog: []
      };
      return { victory: false, expGained: 0, goldGained: 0, drops: {}, message: '不在战斗中' };
    }
    
    if (!this.gameState.battle.isInBattle || !this.gameState.battle.currentMonster) {
      this.notifyEvent('error', { message: '不在战斗中或没有当前怪物' });
      return { victory: false, expGained: 0, goldGained: 0, drops: {}, message: '不在战斗中或没有当前怪物' };
    }
    
    // 检查战斗是否已经结束（胜利、逃跑成功或失败）
    if (this.gameState.battle.battleWon || this.gameState.battle.fleeSuccess || this.gameState.battle.battleLost) {
      this.notifyEvent('error', { message: '战斗已经结束' });
      return { victory: false, expGained: 0, goldGained: 0, drops: {}, message: '战斗已经结束' };
    }
    
    const monster = this.gameState.battle.currentMonster;
    
    // 计算玩家伤害
    let playerAttack = 10; // 基础攻击力
    // 可以根据技能、装备等增加攻击力
    this.gameState.skills.forEach(skill => {
      if (skill.effects.attack) {
        playerAttack += skill.effects.attack * skill.level;
      }
    });
    
    // 计算怪物伤害
    let monsterAttack = monster.stats.attack;
    
    // 玩家攻击怪物
    let monsterDamage = Math.max(1, playerAttack - monster.stats.defense / 2);
    this.gameState.battle.monsterHealth = Math.max(0, this.gameState.battle.monsterHealth - monsterDamage);
    
    // 添加战斗日志 - 玩家攻击
    if (!Array.isArray(this.gameState.battle.battleLog)) {
      this.gameState.battle.battleLog = [];
    }
    this.gameState.battle.battleLog.push(`你攻击了${monster.name}，造成了${Math.round(monsterDamage)}点伤害！`);
    
    // 计算玩家防御
    let playerDefense = 5; // 基础防御
    // 从技能中获取防御加成
    this.gameState.skills.forEach(skill => {
      if (skill.effects.defense) {
        playerDefense += skill.effects.defense * skill.level;
      }
    });
    // 从装备中获取防御加成
    this.gameState.equipment.forEach(item => {
      if (item.effects.defense) {
        playerDefense += item.effects.defense;
      }
    });
    
    // 怪物攻击玩家
    let playerDamage = Math.max(1, monsterAttack - playerDefense / 2); // 考虑玩家防御
    this.gameState.battle.playerHealth = Math.max(0, this.gameState.battle.playerHealth - playerDamage);
    
    // 添加战斗日志 - 怪物攻击
    if (!Array.isArray(this.gameState.battle.battleLog)) {
      this.gameState.battle.battleLog = [];
    }
    this.gameState.battle.battleLog.push(`${monster.name}攻击了你，造成了${Math.round(playerDamage)}点伤害！`);
    
    // 检查战斗结果
    if (this.gameState.battle.monsterHealth <= 0) {
      // 玩家胜利
      const expGained = monster.stats.expReward;
      const goldGained = monster.stats.goldReward;
      
      // 应用奖励
      this.gameState.cultivation.exp += expGained;
      this.gameState.resources.gold += goldGained;
      this.gameState.totalBattlesWon++;
      
      // 添加战斗胜利日志
      this.gameState.battle.battleLog.push(`你击败了${monster.name}！`);
      this.gameState.battle.battleLog.push(`获得了${expGained}点经验和${goldGained}金币！`);
      this.gameState.battle.battleLog.push('点击「退出战斗」按钮返回地图。');
      
      // 战斗胜利但保持战斗状态，直到用户主动退出
      this.gameState.battle.battleWon = true;
      
      this.notifyEvent('battle_victory', { expGained, goldGained, monster });
      return { victory: true, expGained, goldGained, drops: {}, message: '战斗胜利' };
    } else if (this.gameState.battle.playerHealth <= 0) {
      // 玩家失败
      this.gameState.totalBattlesLost++;
      
      // 确保生命值不会变成负数
      this.gameState.battle.playerHealth = 0;
      
      // 添加战斗失败日志
      this.gameState.battle.battleLog.push(`你被${monster.name}击败了！`);
      this.gameState.battle.battleLog.push('战斗失败，点击「退出战斗」按钮返回地图。');
      
      // 战斗失败但保持战斗状态，直到用户主动退出
      this.gameState.battle.battleLost = true;
      
      this.notifyEvent('battle_defeat', { monster });
      return { victory: false, expGained: 0, goldGained: 0, drops: {}, message: '战斗失败' };
    }
    
    // 战斗继续
    this.notifyEvent('battle_round', { playerDamage, monsterDamage });
    return { victory: false, expGained: 0, goldGained: 0, drops: {}, message: '战斗进行中' };
  }

  exitBattle(): void {
    if (!this.gameState || !this.gameState.battle) {
      return;
    }
    
    // 重置战斗状态
    this.gameState.battle.isInBattle = false;
    this.gameState.battle.currentMonster = undefined;
    this.gameState.battle.playerHealth = 100;
    this.gameState.battle.playerMaxHealth = 100;
    this.gameState.battle.monsterHealth = 0;
    this.gameState.battle.battleLog = [];
    this.gameState.battle.battleWon = false;
    this.gameState.battle.fleeSuccess = false;
    this.gameState.battle.battleLost = false;
    
    this.notifyEvent('battle_exited', {});
  }

  fleeBattle(): boolean {
    if (!this.gameState) {
      this.notifyEvent('error', { message: '不在战斗中' });
      return false;
    }
    
    // 确保battle属性存在，如果不存在则初始化
    if (!this.gameState.battle) {
      this.gameState.battle = {
        isInBattle: false,
        currentMonster: undefined,
        playerHealth: 100,
        playerMaxHealth: 100,
        monsterHealth: 0,
        battleLog: []
      };
      this.notifyEvent('error', { message: '不在战斗中' });
      return false;
    }
    
    if (!this.gameState.battle.isInBattle) {
      this.notifyEvent('error', { message: '不在战斗中' });
      return false;
    }
    
    // 有一定概率逃跑成功
    const fleeSuccess = Math.random() > 0.3; // 70%成功率
    const monster = this.gameState.battle.currentMonster;
    
    if (fleeSuccess) {
      // 添加战斗日志
      if (!Array.isArray(this.gameState.battle.battleLog)) {
        this.gameState.battle.battleLog = [];
      }
      this.gameState.battle.battleLog.push('你成功逃离了战斗！');
      this.gameState.battle.battleLog.push('点击「退出战斗」按钮返回地图。');
      
      // 逃跑成功但保持战斗状态，直到用户主动退出
      this.gameState.battle.fleeSuccess = true;
      
      this.notifyEvent('battle_flee', { success: true });
      return true;
    } else {
      // 逃跑失败，怪物反击
      if (monster) {
        const monsterAttack = monster.stats.attack;
        const playerDamage = Math.max(1, monsterAttack - 5);
        this.gameState.battle.playerHealth = Math.max(0, this.gameState.battle.playerHealth - playerDamage);
        
        // 添加战斗日志
        if (!Array.isArray(this.gameState.battle.battleLog)) {
          this.gameState.battle.battleLog = [];
        }
        this.gameState.battle.battleLog.push('你尝试逃跑但失败了！');
        this.gameState.battle.battleLog.push(`${monster.name}攻击了你，造成了${Math.round(playerDamage)}点伤害！`);
        
        // 检查玩家是否被击败
        if (this.gameState.battle.playerHealth <= 0) {
          this.gameState.totalBattlesLost++;
          
          // 确保生命值不会变成负数
          this.gameState.battle.playerHealth = 0;
          
          // 添加战斗失败日志
          this.gameState.battle.battleLog.push(`你被${monster.name}击败了！`);
          this.gameState.battle.battleLog.push('战斗失败，点击「退出战斗」按钮返回地图。');
          
          // 战斗失败但保持战斗状态，直到用户主动退出
          this.gameState.battle.battleLost = true;
          
          this.notifyEvent('battle_defeat', { monster });
        } else {
          this.notifyEvent('battle_flee', { success: false, playerDamage });
        }
      }
      return false;
    }
  }

  // 炼器系统相关方法
  startForge(blueprintId: string): boolean {
    if (!this.gameState) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    
    if (this.gameState.forge.isForging) {
      this.notifyEvent('error', { message: '当前正在炼器中' });
      return false;
    }
    
    const blueprint = initialForgeBlueprints.find(b => b.id === blueprintId);
    if (!blueprint) {
      this.notifyEvent('error', { message: '炼器图谱不存在' });
      return false;
    }
    
    // 检查是否解锁该图谱
    const unlockedBlueprint = this.gameState.forge.blueprints.find(b => b.id === blueprintId);
    if (!unlockedBlueprint) {
      this.notifyEvent('error', { message: '未解锁该炼器图谱' });
      return false;
    }
    
    // 检查材料是否足够
    for (const ingredient of blueprint.ingredients) {
      const materialId = ingredient.materialId as keyof Resources;
      if (materialId === 'pills') {
        // 检查丹药数量是否足够
        if (this.gameState.resources.pills.length < ingredient.quantity) {
          this.notifyEvent('error', { message: `丹药数量不足: ${ingredient.quantity}` });
          return false;
        }
      } else {
        // 检查其他资源是否足够
        const resourceAmount = this.gameState.resources[materialId] as number;
        if (resourceAmount < ingredient.quantity) {
          this.notifyEvent('error', { message: `材料不足: ${ingredient.materialId}` });
          return false;
        }
      }
    }
    
    // 扣除材料
    for (const ingredient of blueprint.ingredients) {
      const materialId = ingredient.materialId as keyof Resources;
      if (materialId === 'pills') {
        // 扣除丹药（从数组末尾开始移除）
        this.gameState.resources.pills.splice(-ingredient.quantity, ingredient.quantity);
      } else {
        // 扣除其他资源
        (this.gameState.resources[materialId] as number) -= ingredient.quantity;
      }
    }
    
    // 开始炼器
    if (!this.gameState.forge) {
      this.gameState.forge = {
        blueprints: [],
        progress: 0,
        isForging: true,
        currentItem: blueprint.itemId,
        lastForgeTime: Date.now(),
        successCount: 0,
        failedCount: 0
      };
    } else {
      this.gameState.forge.isForging = true;
      this.gameState.forge.currentItem = blueprint.itemId;
      this.gameState.forge.progress = 0;
      this.gameState.forge.lastForgeTime = Date.now();
    }
    
    this.notifyEvent('forge_started', { blueprint });
    return true;
  }

  updateForgeProgress(): void {
    if (!this.gameState || !this.gameState.forge || !this.gameState.forge.isForging) return;
    
    const now = Date.now();
    const elapsedTime = now - this.gameState.forge.lastForgeTime;
    
    // 每100毫秒增加1%进度
    const progressIncrease = (elapsedTime / 100) * 1;
    this.gameState.forge.progress += progressIncrease;
    this.gameState.forge.lastForgeTime = now;
    
    if (this.gameState.forge.progress >= 100) {
      this.completeForge();
    }
    
    this.notifyEvent('forge_progress_updated', { progress: this.gameState.forge.progress });
  }

  private completeForge(): void {
    if (!this.gameState || !this.gameState.forge || !this.gameState.forge.isForging || !this.gameState.forge.currentItem) return;
    
    // 查找当前使用的图谱
    const blueprint = initialForgeBlueprints.find(b => b.itemId === this.gameState.forge.currentItem);
    if (!blueprint) {
      this.notifyEvent('error', { message: '无法找到对应的炼器图谱' });
      this.resetForgeState();
      return;
    }
    
    // 计算是否成功
    const isSuccess = Math.random() < blueprint.successRate;
    
    if (isSuccess) {
      // 炼器成功
      this.gameState.cultivation.exp += blueprint.expGain;
      this.gameState.forge.successCount++;
      
      // 这里可以添加获得装备的逻辑
      this.notifyEvent('forge_success', { 
        itemId: blueprint.itemId, 
        expGained: blueprint.expGain 
      });
    } else {
      // 炼器失败
      this.gameState.forge.failedCount++;
      this.notifyEvent('forge_failure', { itemId: blueprint.itemId });
    }
    
    this.resetForgeState();
  }

  private resetForgeState(): void {
    if (!this.gameState || !this.gameState.forge) return;
    
    this.gameState.forge.isForging = false;
    this.gameState.forge.currentItem = undefined;
    this.gameState.forge.progress = 0;
  }

  unlockForgeBlueprint(blueprintId: string): boolean {
    if (!this.gameState) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }
    
    const blueprint = initialForgeBlueprints.find(b => b.id === blueprintId);
    if (!blueprint) {
      this.notifyEvent('error', { message: '炼器图谱不存在' });
      return false;
    }
    
    // 检查是否已经解锁
    const alreadyUnlocked = this.gameState.forge.blueprints.some(b => b.id === blueprintId);
    if (alreadyUnlocked) {
      this.notifyEvent('error', { message: '该炼器图谱已经解锁' });
      return false;
    }
    
    // 检查境界是否达到要求
    if (this.gameState.cultivation.level < blueprint.requiredLevel) {
      this.notifyEvent('error', { message: '境界不足，无法解锁该图谱' });
      return false;
    }
    
    // 解锁图谱
    this.gameState.forge.blueprints.push(blueprint);
    this.notifyEvent('forge_blueprint_unlocked', { blueprint });
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
    
    if (resourceType === 'pills') {
      // 检查丹药数量是否足够
      if (this.gameState.resources.pills.length < quantity) {
        this.notifyEvent('error', { message: '丹药数量不足' });
        return false;
      }
      
      // 移除对应数量的丹药（从数组末尾开始移除）
      this.gameState.resources.pills.splice(-quantity);
    } else {
      // 检查灵果数量是否足够
      if ((this.gameState.resources[resourceType] as number) < quantity) {
        this.notifyEvent('error', { message: '灵果数量不足' });
        return false;
      }
      
      // 减少灵果数量
      (this.gameState.resources[resourceType] as number) -= quantity;
    }
    
    const totalIncome = sellPrices[resourceType] * quantity;
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
    
    if (itemType === 'pills') {
      // 对于丹药，创建相应数量的基础丹药
      for (let i = 0; i < quantity; i++) {
        this.gameState.resources.pills.push({
          id: `pill_basic_${Date.now()}_${i}`,
          name: '聚气丹',
          description: '帮助修炼者凝聚灵气的基础丹药',
          type: '聚气丹',
          quality: 'normal',
          effect: { cultivationSpeed: 1.2 },
          duration: 300,
          stackable: true,
          maxStacks: 99,
          rarity: 'common',
          value: 10
        });
      }
    } else {
      // 对于其他资源，直接增加数量
      (this.gameState.resources[itemType] as number) += quantity;
    }
    
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
    if (quest.requirements?.level) {
      // 确保境界检查是兼容的，支持不同的命名格式
      const playerLevel = this.gameState.cultivation.level;
      const requiredLevel = quest.requirements.level;
      
      // 检查是否达到或超过要求的境界
      const meetsLevel = this.meetsLevelRequirement(requiredLevel);
      if (!meetsLevel) {
        return false;
      }
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
    
    // 检查炼丹条件
    if (quest.requirements.alchemy) {
      if (quest.requirements.alchemy.successCount) {
        const currentSuccesses = this.gameState.alchemy ? this.gameState.alchemy.successCount : 0;
        if (currentSuccesses < quest.requirements.alchemy.successCount) {
          return false;
        }
      }
      if (quest.requirements.alchemy.failedCount) {
        const currentFailures = this.gameState.alchemy ? this.gameState.alchemy.failedCount : 0;
        if (currentFailures < quest.requirements.alchemy.failedCount) {
          return false;
        }
      }
      if (quest.requirements.alchemy.recipeCount) {
        const recipeCount = this.gameState.alchemy ? this.gameState.alchemy.recipes.length : 0;
        if (recipeCount < quest.requirements.alchemy.recipeCount) {
          return false;
        }
      }
    }
    
    // 检查事件条件
    if (quest.requirements.events) {
      if (quest.requirements.events.encountered) {
        // 在游戏状态中添加事件统计
        const currentEncounters = this.gameState.totalEventsEncountered || 0;
        if (currentEncounters < quest.requirements.events.encountered) {
          return false;
        }
      }
      if (quest.requirements.events.specificEventIds) {
        // TODO: 实现特定事件检查逻辑
        // 需要记录玩家遇到的具体事件ID
      }
    }
    
    // 检查采集条件
    if (quest.requirements.gathering) {
      if (quest.requirements.gathering.totalCount) {
        const totalGathering = (this.gameState.autoGatheringCount || 0);
        if (totalGathering < quest.requirements.gathering.totalCount) {
          return false;
        }
      }
      
      if (quest.requirements.gathering.resourceTypes) {
        // TODO: 实现特定资源采集数量检查
        // 需要记录玩家采集的具体资源数量
      }
    }
    
    // 检查怪物条件
    if (quest.requirements.monsters) {
      // TODO: 实现怪物击杀数量检查
      // 需要记录玩家击杀的怪物数量
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
    if (quest.rewardClaimed) {
      this.notifyEvent('error', { message: '奖励已经领取过了' });
      return false;
    }
    
    // 应用经验奖励
    if (quest.rewards.exp) {
      // 经验满时不自动突破，只显示提示
      const expAfterGain = this.gameState.cultivation.exp + quest.rewards.exp;
      if (expAfterGain >= this.gameState.cultivation.maxExp) {
        this.gameState.cultivation.exp = this.gameState.cultivation.maxExp;
        this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
      } else {
        this.gameState.cultivation.exp = expAfterGain;
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
        } else if (resource === 'pills' && typeof amount === 'number') {
          // 处理数字类型的丹药奖励
          for (let i = 0; i < amount; i++) {
            this.gameState.resources.pills.push({
              id: `pill_basic_${Date.now()}_${i}`,
              name: '聚气丹',
              description: '帮助修炼者凝聚灵气的基础丹药',
              type: '聚气丹',
              quality: 'normal',
              effect: { cultivationSpeed: 1.2 },
              duration: 300,
              stackable: true,
              maxStacks: 99,
              rarity: 'common',
              value: 10
            });
          }
        } else {
          (this.gameState.resources as any)[resource] += amount;
        }
      }
    }
    
    // 设置奖励已领取
    quest.rewardClaimed = true;
    
    this.notifyEvent('quest_reward_claimed', { quest });
    return true;
  }

  // 领取成就奖励
  claimAchievementReward(achievementId: string): boolean {
    if (!this.gameState || !this.gameState.unlockedAchievements || !this.gameState.cultivation) {
      this.notifyEvent('error', { message: '游戏状态未初始化' });
      return false;
    }

    // 检查成就是否存在
    const achievement = initialAchievements.find(a => a.id === achievementId);
    if (!achievement) {
      this.notifyEvent('error', { message: '成就不存在' });
      return false;
    }

    // 检查成就是否已解锁且未领取
    if (!this.gameState.unlockedAchievements.includes(achievementId)) {
      this.notifyEvent('error', { message: '成就奖励已领取或未解锁' });
      return false;
    }

    // 从unlockedAchievements数组中移除
    this.gameState.unlockedAchievements = this.gameState.unlockedAchievements.filter(id => id !== achievementId);

    // 应用经验奖励
    if (achievement.reward.exp) {
      // 经验满时不自动突破，只显示提示
      const expAfterGain = this.gameState.cultivation.exp + achievement.reward.exp;
      if (expAfterGain >= this.gameState.cultivation.maxExp) {
        this.gameState.cultivation.exp = this.gameState.cultivation.maxExp;
        this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
      } else {
        this.gameState.cultivation.exp = expAfterGain;
      }
    }

    // 应用资源奖励
    if (achievement.reward.resources) {
      for (const [resource, amount] of Object.entries(achievement.reward.resources)) {
        if (resource === 'qi') {
          this.gameState.resources.qi = Math.min(
            this.gameState.resources.qi + amount,
            this.gameState.cultivation.qiCapacity
          );
        } else if (resource === 'pills' && typeof amount === 'number') {
          // 处理数字类型的丹药奖励
          for (let i = 0; i < amount; i++) {
            this.gameState.resources.pills.push({
              id: `pill_basic_${Date.now()}_${i}`,
              name: '聚气丹',
              description: '帮助修炼者凝聚灵气的基础丹药',
              type: '聚气丹',
              quality: 'normal',
              effect: { cultivationSpeed: 1.2 },
              duration: 300,
              stackable: true,
              maxStacks: 99,
              rarity: 'common',
              value: 10
            });
          }
        } else {
          (this.gameState.resources as any)[resource] += amount;
        }
      }
    }

    this.notifyEvent('achievement_reward_claimed', { achievementId });
    return true;
  }
  
  // 检查事件触发条件
  private checkEventTrigger(event: GameEvent | Event, actionType?: string): boolean {
    // 处理Event类型（具有triggerChance属性）
    if ('triggerChance' in event) {
      // 使用类型断言来确保TypeScript知道这是Event类型
      const eventWithTriggerChance = event as Event;
      // 对于Event类型，我们只需要检查概率
      return Math.random() < eventWithTriggerChance.triggerChance;
    }
    
    // 处理GameEvent类型（具有triggers属性）
    if (!event.triggers) return false;
    
    const triggers = event.triggers;
    
    // 检查actionType
    if (triggers.actionType !== 'any' && triggers.actionType !== actionType) {
      return false;
    }
    
    // 检查概率
    return Math.random() < triggers.probability;
  }
  
  // 触发随机事件
  private triggerRandomEvent(actionType?: string): void {
    // 过滤出符合触发条件的事件
    const availableEvents = initialEvents.filter(event => this.checkEventTrigger(event, actionType));
    
    if (availableEvents.length === 0) return;
    
    // 随机选择一个事件
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    this.currentEvent = availableEvents[randomIndex];
    
    // 更新事件统计
    this.gameState.totalEventsEncountered = (this.gameState.totalEventsEncountered || 0) + 1;
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
        if (outcome.effects && outcome.effects.exp) {
          // 经验满时不自动突破，只显示提示
          const expAfterGain = this.gameState.cultivation.exp + outcome.effects.exp;
          if (expAfterGain >= this.gameState.cultivation.maxExp) {
            this.gameState.cultivation.exp = this.gameState.cultivation.maxExp;
            this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
          } else {
            this.gameState.cultivation.exp = expAfterGain;
          }
        }
        
        // 应用资源变化
        if (outcome.effects && outcome.effects.resources) {
          for (const [resource, amount] of Object.entries(outcome.effects.resources)) {
            if (resource === 'qi' && amount) {
              this.gameState.resources.qi = Math.min(
                this.gameState.resources.qi + amount,
                this.gameState.cultivation.qiCapacity
              );
            } else if (resource === 'pills' && amount) {
              // 处理丹药奖励
              if (typeof amount === 'number') {
                // 如果是数字类型，创建对应数量的基础丹药
                for (let i = 0; i < amount; i++) {
                  this.gameState.resources.pills.push({
                    id: `pill_basic_${Date.now()}_${i}`,
                    name: '聚气丹',
                    description: '帮助修炼者凝聚灵气的基础丹药',
                    type: '聚气丹',
                    quality: 'normal',
                    effect: { cultivationSpeed: 1.2 },
                    duration: 300,
                    stackable: true,
                    maxStacks: 99,
                    rarity: 'common',
                    value: 10
                  });
                }
              } else if (Array.isArray(amount)) {
                // 如果是数组类型，直接添加到丹药列表
                this.gameState.resources.pills.push(...amount);
              }
            } else if (amount) {
              // 处理其他资源
              (this.gameState.resources as any)[resource] += amount;
            }
          }
        }
        
        // 应用其他效果
        if (outcome.effects) {
          // 应用修炼速度提升
          if (outcome.effects.cultivationSpeedBoost) {
            // 这里可以添加修炼速度提升的逻辑
          }
          
          // 应用突破奖励
          if (outcome.effects.breakthroughBonus) {
            // 这里可以添加突破奖励的逻辑
          }
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
      
      // 检查是否已经在炼丹
      if (this.gameState.alchemy.isBrewing) {
        this.notifyEvent('error', { message: '正在炼丹中，无法同时炼制多个丹药' });
        return false;
      }
      const recipe = this.gameState.alchemy.recipes.find(r => r.id === recipeId);
      if (!recipe) {
        this.notifyEvent('error', { message: '未知的炼丹配方' });
        return false;
      }

      // 检查修真境界是否达到要求
      const meetsLevel = this.meetsLevelRequirement(recipe.requiredLevel);
      if (!meetsLevel) {
        this.notifyEvent('error', { message: '修真境界不足，无法炼制此丹药' });
        return false;
      }

      // 检查材料是否足够
      for (const ingredient of recipe.ingredients) {
        if ((this.gameState.resources as any)[ingredient.id] < ingredient.quantity) {
          this.notifyEvent('error', { message: '材料不足，无法炼制此丹药' });
          return false;
        }
      }

      // 扣除材料
      for (const ingredient of recipe.ingredients) {
        (this.gameState.resources as any)[ingredient.id] -= ingredient.quantity;
      }

      // 开始炼丹
      this.gameState.alchemy.currentRecipe = recipe;
      this.gameState.alchemy.currentPill = recipe.pills[0]; // 设置当前炼制的丹药
      this.gameState.alchemy.progress = 0;
      this.gameState.alchemy.isBrewing = true;
      this.gameState.alchemy.startTime = Date.now();

      this.notifyEvent('alchemy_started', { recipe });
      return true;
    }

    // 更新炼丹进度
    private updateAlchemyProgress() {
      if (!this.gameState.alchemy || !this.gameState.alchemy.isBrewing || !this.gameState.alchemy.currentRecipe) {
        return;
      }

      const currentTime = Date.now();
      // 使用非空断言，因为我们已经检查了isBrewing和currentRecipe
      const timeElapsed = currentTime - this.gameState.alchemy.startTime!;
      
      // 根据配方持续时间计算进度
      const progressIncrease = (timeElapsed / (this.gameState.alchemy.currentRecipe!.duration * 1000)) * 100;
      this.gameState.alchemy.progress = Math.min(progressIncrease, 100);

      // 炼丹完成
      if (this.gameState.alchemy.progress >= 100) {
        this.completeAlchemy();
      }
    }

    // 完成炼丹
    public completeAlchemy() {
      if (!this.gameState.alchemy || !this.gameState.alchemy.currentRecipe) {
        return;
      }

      const recipe = this.gameState.alchemy.currentRecipe;
      
      // 计算实际成功率（基础成功率 + 技能加成）
      const skillLevel = this.gameState.alchemy.skillLevel;
      const skillBonus = skillLevel * 0.02; // 每级增加2%成功率
      const actualSuccessRate = Math.min(recipe.baseSuccessRate + skillBonus, 0.95); // 最高95%
      
      // 检查成功率
      const success = Math.random() < actualSuccessRate;
      
      if (success && recipe.pills && recipe.pills.length > 0) {
        // 成功炼制，选择丹药
        const pillId = recipe.pills[Math.floor(Math.random() * recipe.pills.length)];
        const basePill = initialPills.find(p => p.id === pillId);
        
        if (basePill) {
          // 计算丹药品质
          const qualityBonus = skillLevel * 0.005; // 每级增加0.5%高品质概率
          const qualityRoll = Math.random();
          let quality: PillQuality;
          
          if (recipe.qualityChances) {
            if (qualityRoll < recipe.qualityChances.celestial + qualityBonus) {
              quality = 'celestial';
            } else if (qualityRoll < recipe.qualityChances.perfect + qualityBonus) {
              quality = 'perfect';
            } else if (qualityRoll < recipe.qualityChances.high + qualityBonus) {
              quality = 'high';
            } else if (qualityRoll < recipe.qualityChances.normal + qualityBonus) {
              quality = 'normal';
            } else {
              quality = 'low';
            }
          } else {
            // 默认品质
            quality = qualityRoll < 0.1 + qualityBonus ? 'high' : qualityRoll < 0.4 + qualityBonus ? 'normal' : 'low';
          }
          
          // 计算品质倍数
          const qualityMultiplier = this.getQualityMultiplier(quality);
          
          // 创建丹药实例
          const pill: Pill = {
            ...basePill,
            quality,
            id: `${basePill.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}` // 唯一ID
          };
          
          // 将丹药添加到背包中
          this.gameState.resources.pills.push(pill);
          
          // 更新统计数据
          this.gameState.alchemy.successCount++;
          this.gameState.alchemy.totalQualityPoints += this.getQualityPoints(quality);
          
          // 增加经验值
          if (recipe.expGain) {
            // 品质加成经验值
            const qualityExpBonus = Math.round(recipe.expGain * (qualityMultiplier - 1));
            const totalExpGain = recipe.expGain + qualityExpBonus;
            
            // 经验满时不自动突破，只显示提示
            const expAfterGain = this.gameState.cultivation.exp + totalExpGain;
            if (expAfterGain >= this.gameState.cultivation.maxExp) {
              this.gameState.cultivation.exp = this.gameState.cultivation.maxExp;
              this.notifyEvent('info', { message: '经验已满，可以尝试突破境界' });
            } else {
              this.gameState.cultivation.exp = expAfterGain;
            }
          }
          
          // 增加炼丹技能经验
          const skillExpGain = this.calculateAlchemySkillExp(recipe, quality);
          this.gameState.alchemy.skillExp += skillExpGain;
          
          // 检查炼丹技能升级
          this.checkAlchemySkillLevelUp();

          this.notifyEvent('alchemy_success', { pill, expGain: recipe.expGain });
        }
      } else {
        // 炼丹失败
        this.gameState.alchemy.failedCount++;
        
        // 应用失败惩罚
        if (recipe.failurePenalty) {
          if (recipe.failurePenalty.resourceLossRatio) {
            // 计算并应用资源损失比例
            const lossRatio = recipe.failurePenalty.resourceLossRatio;
            for (const ingredient of recipe.ingredients) {
              const resourceKey = ingredient.id as keyof Resources;
              const lossAmount = Math.ceil(ingredient.quantity * lossRatio);
              if (resourceKey === 'pills') {
                // 对于丹药，从数组中移除对应数量（从末尾开始移除）
                this.gameState.resources.pills.splice(-lossAmount, lossAmount);
              } else if ((this.gameState.resources[resourceKey] as number) >= lossAmount) {
                // 对于其他资源，直接减少数量
                (this.gameState.resources[resourceKey] as number) -= lossAmount;
              }
            }
          }
        }
        
        this.notifyEvent('alchemy_failed', { recipe });
      }

      // 重置炼丹状态
      this.gameState.alchemy.isBrewing = false;
      this.gameState.alchemy.currentRecipe = undefined;
      this.gameState.alchemy.progress = 0;
      this.gameState.alchemy.startTime = undefined;
    }

    // 获取品质倍数
    private getQualityMultiplier(quality: PillQuality): number {
      switch (quality) {
        case 'celestial':
          return 2.0;
        case 'perfect':
          return 1.7;
        case 'high':
          return 1.4;
        case 'normal':
          return 1.2;
        case 'low':
          return 1.0;
        default:
          return 1.0;
      }
    }

    // 获取品质点数
    private getQualityPoints(quality: PillQuality): number {
      switch (quality) {
        case 'celestial':
          return 50;
        case 'perfect':
          return 30;
        case 'high':
          return 15;
        case 'normal':
          return 5;
        case 'low':
          return 1;
        default:
          return 1;
      }
    }

    // 计算炼丹技能经验
    private calculateAlchemySkillExp(recipe: AlchemyRecipe, quality: PillQuality): number {
      const baseExp = recipe.expGain / 2;
      const qualityBonus = this.getQualityPoints(quality) / 10;
      return Math.round(baseExp + qualityBonus);
    }

    // 检查炼丹技能升级
    private checkAlchemySkillLevelUp(): void {
      const currentLevel = this.gameState.alchemy.skillLevel;
      const currentExp = this.gameState.alchemy.skillExp;
      const requiredExp = this.getRequiredAlchemySkillExp(currentLevel);
      
      if (currentExp >= requiredExp) {
        this.gameState.alchemy.skillLevel++;
        this.gameState.alchemy.skillExp -= requiredExp;
        this.gameState.alchemy.qualityModifier += 0.005; // 每级增加0.5%高品质概率
        this.notifyEvent('alchemy_skill_up', { newLevel: this.gameState.alchemy.skillLevel });
      }
    }

    // 获取所需的炼丹技能经验
    private getRequiredAlchemySkillExp(level: number): number {
      return Math.round(100 * Math.pow(1.5, level - 1));
    }

    // 应用丹药效果
    private applyPillEffects(pill: Pill): void {
      // 确保activePills存在
      if (!this.gameState.alchemy.activePills) {
        this.gameState.alchemy.activePills = [];
      }
      // 添加丹药到激活列表
      this.gameState.alchemy.activePills.push({
        pill,
        startTime: Date.now()
      });
      
      // 应用即时效果
      if (pill.effect.qiRegen) {
        this.gameState.resources.qi = Math.min(
          this.gameState.resources.qi + pill.effect.qiRegen,
          this.gameState.cultivation.qiCapacity
        );
      }
      
      // 应用持续效果
      if (pill.effect.cultivationSpeed) {
        this.gameState.cultivation.cultivationSpeedBonus += pill.effect.cultivationSpeed;
      }
      
      if (pill.effect.breakthroughChance) {
        this.gameState.cultivation.breakthroughChanceBonus += pill.effect.breakthroughChance;
      }
      
      if (pill.effect.resourceGatheringSpeed) {
        this.gameState.cultivation.resourceGatheringSpeedBonus += pill.effect.resourceGatheringSpeed;
      }
      
      if (pill.effect.alchemySuccessRate) {
        this.gameState.cultivation.alchemySuccessRateBonus += pill.effect.alchemySuccessRate;
      }
      
      if (pill.effect.skillExpBoost) {
        this.gameState.cultivation.skillExpBoostBonus += pill.effect.skillExpBoost;
      }
    }
    
    // 检查和移除过期的丹药效果
    private checkExpiredPills(currentTime: number): void {
      if (!this.gameState.alchemy || !this.gameState.alchemy.activePills || this.gameState.alchemy.activePills.length === 0) {
        return;
      }
      
      // 过滤出未过期的丹药效果
      const expiredPills = [];
      const remainingPills = [];
      
      for (const activePill of this.gameState.alchemy.activePills) {
        const { pill, startTime } = activePill;
        const durationMs = (pill.duration || 0) * 1000;
        
        if (currentTime - startTime >= durationMs) {
          // 丹药效果已过期
          expiredPills.push(activePill);
        } else {
          // 丹药效果未过期
          remainingPills.push(activePill);
        }
      }
      
      // 如果有过期的丹药效果，移除它们的加成
      for (const expiredPill of expiredPills) {
        const { pill } = expiredPill;
        
        // 移除持续效果加成
        if (pill.effect.cultivationSpeed) {
          this.gameState.cultivation.cultivationSpeedBonus -= pill.effect.cultivationSpeed;
        }
        
        if (pill.effect.breakthroughChance) {
          this.gameState.cultivation.breakthroughChanceBonus -= pill.effect.breakthroughChance;
        }
        
        if (pill.effect.resourceGatheringSpeed) {
          this.gameState.cultivation.resourceGatheringSpeedBonus -= pill.effect.resourceGatheringSpeed;
        }
        
        if (pill.effect.alchemySuccessRate) {
          this.gameState.cultivation.alchemySuccessRateBonus -= pill.effect.alchemySuccessRate;
        }
        
        if (pill.effect.skillExpBoost) {
          this.gameState.cultivation.skillExpBoostBonus -= pill.effect.skillExpBoost;
        }
      }
      
      // 更新激活的丹药效果列表
      this.gameState.alchemy.activePills = remainingPills;
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
      const meetsLevel = this.meetsLevelRequirement(recipe.requiredLevel);
      if (!meetsLevel) {
        return false;
      }

      // 解锁配方
      this.gameState.alchemy.recipes.push(recipe);
      this.notifyEvent('recipe_unlocked', { recipe });
      return true;
    }

    // 检查玩家是否达到炼丹所需的修真等级
    private meetsLevelRequirement(requiredLevel: CultivationLevel): boolean {
      const levelOrder: CultivationLevel[] = [
        'qi_refining_1', 'qi_refining_2', 'qi_refining_3', 'qi_refining_4', 'qi_refining_5',
        'qi_refining_6', 'qi_refining_7', 'qi_refining_8', 'qi_refining_9',
        'foundation_1', 'foundation_2', 'foundation_3', 'foundation_4', 'foundation_5',
        'foundation_6', 'foundation_7', 'foundation_8', 'foundation_9',
        'golden_core_1', 'golden_core_2', 'golden_core_3', 'golden_core_4', 'golden_core_5',
        'golden_core_6', 'golden_core_7', 'golden_core_8', 'golden_core_9',
        'nascent_soul_1', 'nascent_soul_2', 'nascent_soul_3', 'nascent_soul_4', 'nascent_soul_5',
        'nascent_soul_6', 'nascent_soul_7', 'nascent_soul_8', 'nascent_soul_9'
      ];

      const playerLevelIndex = levelOrder.indexOf(this.gameState.cultivation.level);
      const requiredLevelIndex = levelOrder.indexOf(requiredLevel);

      return playerLevelIndex >= requiredLevelIndex;
    }

    // 捕捉宠物
    catchPet(targetPetDataId: string): boolean {
      const targetPetData = petData.find(p => p.id === targetPetDataId);
      if (!targetPetData) {
        return false;
      }

      // 检查是否达到解锁等级
      if (!this.meetsLevelRequirement(targetPetData.unlockLevel)) {
        return false;
      }

      // 尝试捕捉宠物
      const success = Math.random() < targetPetData.catchChance;
      if (success) {
        // 创建宠物实例
        const pet: Pet = {
          id: `${targetPetData.id}_${Date.now()}`, // 确保每个宠物实例有唯一ID
          name: targetPetData.name,
          type: targetPetData.type,
          image: targetPetData.image,
          level: 1,
          exp: 0,
          maxExp: 100,
          health: targetPetData.baseHealth,
          maxHealth: targetPetData.baseHealth,
          attack: targetPetData.baseAttack,
          defense: targetPetData.baseDefense,
          skills: targetPetData.skills.map(skill => ({
            ...skill,
            currentCooldown: 0
          })),
          loyalty: targetPetData.loyalty,
          active: false,
          specialBonus: { ...targetPetData.specialBonus }
        };

        // 添加到宠物列表
        this.gameState.pets.push(pet);

        // 更新成就进度
        this.checkAndApplyAchievementRewards();

        // 发送宠物捕捉成功事件
        this.notifyEvent('pet_caught', { pet });
        return true;
      } else {
        // 发送宠物捕捉失败事件
        this.notifyEvent('pet_catch_failed', { petData: targetPetData });
        return false;
      }
    }

    // 训练宠物
    trainPet(petId: string): boolean {
      const pet = this.gameState.pets.find(p => p.id === petId);
      if (!pet) {
        return false;
      }

      // 训练消耗资源（可以根据游戏平衡调整）
      const trainingCost = {
        spiritGrass: 10 * pet.level,
        spiritStone: 5 * pet.level
      };

      // 检查资源是否足够
      for (const [resource, amount] of Object.entries(trainingCost)) {
        if (resource === 'pills') {
          // 对于丹药，使用数组长度进行比较
          if (this.gameState.resources.pills.length < amount) {
            return false;
          }
        } else {
          if ((this.gameState.resources[resource as keyof Resources] as number || 0) < amount) {
            return false;
          }
        }
      }

      // 扣除资源
      for (const [resource, amount] of Object.entries(trainingCost)) {
        if (resource === 'pills') {
          // 对于丹药，从数组中移除相应数量的元素
          this.gameState.resources.pills.splice(0, amount);
        } else {
          (this.gameState.resources[resource as keyof Resources] as number) -= amount;
        }
      }

      // 增加宠物经验
      const expGained = 20 + Math.floor(Math.random() * 10);
      pet.exp += expGained;

      // 检查宠物升级
      if (pet.exp >= pet.maxExp) {
        pet.level++;
        pet.exp -= pet.maxExp;
        pet.maxExp = Math.floor(pet.maxExp * 1.5);
        pet.maxHealth += 20;
        pet.health = pet.maxHealth;
        pet.attack += 3;
        pet.defense += 2;

        // 发送宠物升级事件
        this.notifyEvent('pet_level_up', { pet });
      }

      // 更新成就进度
      this.checkAndApplyAchievementRewards();

      // 发送宠物训练成功事件
      this.notifyEvent('pet_trained', { pet, expGained });
      return true;
    }

    // 升级宠物技能
    upgradePetSkill(petId: string, skillIndex: number): boolean {
      const pet = this.gameState.pets.find(p => p.id === petId);
      if (!pet || !pet.skills[skillIndex]) {
        return false;
      }

      const skill = pet.skills[skillIndex];
      if (skill.level >= skill.maxLevel) {
        return false;
      }

      // 升级技能消耗资源
      const upgradeCost = {
        spiritCrystal: 1 + skill.level,
        pills: 2 + skill.level
      };

      // 检查资源是否足够
      for (const [resource, amount] of Object.entries(upgradeCost)) {
        if (resource === 'pills') {
          // 对于丹药，使用数组长度进行比较
          if (this.gameState.resources.pills.length < amount) {
            return false;
          }
        } else {
          if ((this.gameState.resources[resource as keyof Resources] as number || 0) < amount) {
            return false;
          }
        }
      }

      // 扣除资源
      for (const [resource, amount] of Object.entries(upgradeCost)) {
        if (resource === 'pills') {
          // 对于丹药，从数组中移除相应数量的元素
          this.gameState.resources.pills.splice(0, amount);
        } else {
          (this.gameState.resources[resource as keyof Resources] as number) -= amount;
        }
      }

      // 升级技能
      skill.level++;

      // 增强技能效果（可以根据技能类型调整）
      if (skill.effect.damage) {
        skill.effect.damage *= 1.2;
      }
      if (skill.effect.healing) {
        skill.effect.healing *= 1.2;
      }
      if (skill.effect.defenseBoost) {
        skill.effect.defenseBoost *= 1.2;
      }
      if (skill.effect.attackBoost) {
        skill.effect.attackBoost *= 1.2;
      }

      // 发送宠物技能升级事件
      this.notifyEvent('pet_skill_upgraded', { pet, skill });
      return true;
    }

    // 切换宠物活跃状态
    togglePetActive(petId: string): boolean {
      const petIndex = this.gameState.pets.findIndex(p => p.id === petId);
      if (petIndex === -1) {
        return false;
      }

      // 如果宠物已经活跃，将其设置为非活跃
      if (this.gameState.pets[petIndex].active) {
        this.gameState.pets[petIndex].active = false;
      } else {
        // 将其他宠物设置为非活跃
        this.gameState.pets.forEach(p => p.active = false);
        // 将当前宠物设置为活跃
        this.gameState.pets[petIndex].active = true;
      }

      // 发送宠物状态切换事件
      this.notifyEvent('pet_active_toggled', { pet: this.gameState.pets[petIndex] });
      return true;
    }

    // 喂食宠物（增加忠诚度）
    feedPet(petId: string): boolean {
      const pet = this.gameState.pets.find(p => p.id === petId);
      if (!pet) {
        return false;
      }

      // 检查忠诚度是否已满
      if (pet.loyalty >= 100) {
        return false;
      }

      // 喂食消耗资源
      if (this.gameState.resources.pills.length <= 0) {
        return false;
      }

      // 扣除资源
      this.gameState.resources.pills.pop();

      // 增加忠诚度
      pet.loyalty = Math.min(pet.loyalty + 10, 100);

      // 发送宠物喂食事件
      this.notifyEvent('pet_fed', { pet });
      return true;
    }

    // 获取活跃宠物
    getActivePet(): Pet | null {
      return this.gameState.pets.find(p => p.active) || null;
    }

    // 加入宗门
    joinSect(sectId: string): boolean {
      const sect = sects.find(s => s.id === sectId);
      if (!sect) {
        return false;
      }

      // 检查是否已经加入宗门
      if (this.gameState.cultivation.sect) {
        this.notifyEvent('error', { message: '你已经加入了一个宗门！' });
        return false;
      }

      // 检查玩家境界是否满足要求
      const requiredLevel = 'qi_refining_1';
      const levelOrder: CultivationLevel[] = [
        'qi_refining_1', 'qi_refining_2', 'qi_refining_3', 'qi_refining_4', 'qi_refining_5',
        'qi_refining_6', 'qi_refining_7', 'qi_refining_8', 'qi_refining_9',
        'foundation_1', 'foundation_2', 'foundation_3', 'foundation_4', 'foundation_5',
        'foundation_6', 'foundation_7', 'foundation_8', 'foundation_9',
        'golden_core_1', 'golden_core_2', 'golden_core_3', 'golden_core_4', 'golden_core_5',
        'golden_core_6', 'golden_core_7', 'golden_core_8', 'golden_core_9',
        'nascent_soul_1', 'nascent_soul_2', 'nascent_soul_3', 'nascent_soul_4', 'nascent_soul_5',
        'nascent_soul_6', 'nascent_soul_7', 'nascent_soul_8', 'nascent_soul_9'
      ];

      const playerLevelIndex = levelOrder.indexOf(this.gameState.cultivation.level);
      const requiredLevelIndex = levelOrder.indexOf(requiredLevel);

      if (playerLevelIndex < requiredLevelIndex) {
        this.notifyEvent('error', { message: '你的境界不足，无法加入宗门！' });
        return false;
      }

      // 加入宗门
      this.gameState.cultivation.sect = {
        ...sect,
        unlocked: true,
        contribution: 0,
        contributionToNextLevel: 1000
      };

      // 发送加入宗门事件
      this.notifyEvent('sect_joined', { sect: this.gameState.cultivation.sect });
      return true;
    }

    // 贡献资源给宗门
    contributeToSect(amount: number): boolean {
      if (!this.gameState.cultivation.sect || amount <= 0) {
        return false;
      }

      // 检查资源是否足够
      if (this.gameState.resources.spiritStone < amount) {
        this.notifyEvent('error', { message: '灵石不足！' });
        return false;
      }

      // 贡献资源
      this.gameState.resources.spiritStone -= amount;
      this.gameState.cultivation.sect.contribution += amount;
      this.gameState.cultivation.sect.contributionToNextLevel = 1000 * Math.pow(1.5, this.gameState.cultivation.sect.level);

      // 检查宗门是否升级
      if (this.gameState.cultivation.sect.contribution >= this.gameState.cultivation.sect.contributionToNextLevel) {
        this.levelUpSect();
      }

      // 发送贡献成功事件
      this.notifyEvent('sect_contributed', { amount, contribution: this.gameState.cultivation.sect.contribution });
      return true;
    }

    // 宗门升级
    private levelUpSect(): void {
      if (!this.gameState.cultivation.sect) {
        return;
      }

      this.gameState.cultivation.sect.level++;
      this.gameState.cultivation.sect.contribution -= this.gameState.cultivation.sect.contributionToNextLevel;
      this.gameState.cultivation.sect.contributionToNextLevel = 1000 * Math.pow(1.5, this.gameState.cultivation.sect.level);
      
      // 提升宗门加成
      this.gameState.cultivation.sect.benefits.resourceBoost += 0.05;
      this.gameState.cultivation.sect.benefits.expBoost += 0.05;
      this.gameState.cultivation.sect.benefits.cultivationSpeedBoost += 0.05;

      // 发送宗门升级事件
      this.notifyEvent('sect_level_up', { sect: this.gameState.cultivation.sect });
    }

    // 完成宗门任务
    completeSectTask(taskId: string): boolean {
      if (!this.gameState.cultivation.sect) {
        return false;
      }

      const task = this.gameState.cultivation.sect.tasks.find(t => t.id === taskId);
      if (!task || task.completed || task.claimed) {
        return false;
      }

      // 检查任务是否完成（这里只是示例，实际逻辑需要根据任务类型实现）
      // 这里简化处理，直接标记为完成
      task.completed = true;

      // 发送任务完成事件
      this.notifyEvent('sect_task_completed', { task });
      return true;
    }

    // 领取宗门任务奖励
    claimSectTaskReward(taskId: string): boolean {
      if (!this.gameState.cultivation.sect) {
        return false;
      }

      const task = this.gameState.cultivation.sect.tasks.find(t => t.id === taskId);
      if (!task || !task.completed || task.claimed) {
        return false;
      }

      // 领取奖励
      task.claimed = true;
      this.gameState.cultivation.sect.contribution += task.rewards.contribution;

      // 领取资源奖励
      if (task.rewards.resources) {
        Object.entries(task.rewards.resources).forEach(([key, value]) => {
          if (key === 'pills') {
            // 对于丹药，创建相应数量的基础丹药并添加到数组
            if (typeof value === 'number') {
              for (let i = 0; i < value; i++) {
                this.gameState.resources.pills.push({
                  id: `pill_basic_${Date.now()}_${i}`,
                  name: '聚气丹',
                  description: '帮助修炼者凝聚灵气的基础丹药',
                  type: '聚气丹',
                  quality: 'normal',
                  effect: { cultivationSpeed: 1.2 },
                  duration: 300,
                  stackable: true,
                  maxStacks: 99,
                  rarity: 'common',
                  value: 10
                });
              }
            } else if (Array.isArray(value)) {
              // 如果是数组类型，直接添加到丹药列表
              this.gameState.resources.pills.push(...value);
            }
          } else if (key in this.gameState.resources) {
            // 对于其他资源，确保value是数字类型
            if (typeof value === 'number') {
              (this.gameState.resources[key as keyof Resources] as number) += value;
            }
          }
        });
      }



      // 检查宗门是否升级
      if (this.gameState.cultivation.sect.contribution >= this.gameState.cultivation.sect.contributionToNextLevel) {
        this.levelUpSect();
      }

      // 发送奖励领取事件
      this.notifyEvent('sect_task_reward_claimed', { task });
      return true;
    }

    // 通知事件
    private notifyEvent(eventType: string, data: any) {
      if (this.eventCallback) {
        this.eventCallback(eventType, data);
      }
    }
  }