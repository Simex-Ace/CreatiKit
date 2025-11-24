import { GameState, Resources, Skill, Equipment, OfflineRewards, Quest, GameEvent, Event, Achievement, Monster, BattleResult, CultivationLevel } from './types';
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
      cultivationSpeed: calculateCultivationSpeed({} as GameState, 'qi_refining_1')
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
    monsters: initialMonsters,
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
      failedCount: 0
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
          if ((this.gameState.resources[resource as keyof Resources] || 0) < amount) {
            isUnlocked = false;
            break;
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

      // 如果所有条件都满足，解锁成就但不自动应用奖励
      if (isUnlocked) {
        hasChanges = true;
        this.gameState.achievements.push(achievement.id);
        this.gameState.unlockedAchievements.push(achievement.id);

        // 发送成就解锁通知
        this.notifyEvent('achievement_unlocked', { 
          achievement: achievement.id, 
          description: `${achievement.name} - ${achievement.description}`,
          reward: `资源: ${JSON.stringify(achievement.reward.resources || {})}, 经验: ${achievement.reward.exp || 0}`
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
    
    // 更新炼器进度
    this.updateForgeProgress();
    
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
      this.triggerRandomEvent('cultivate');
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
      if (this.gameState.resources[ingredient.materialId as keyof Resources] < ingredient.quantity) {
        this.notifyEvent('error', { message: `材料不足: ${ingredient.materialId}` });
        return false;
      }
    }
    
    // 扣除材料
    for (const ingredient of blueprint.ingredients) {
      this.gameState.resources[ingredient.materialId as keyof Resources] -= ingredient.quantity;
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
      this.gameState.cultivation.exp += achievement.reward.exp;
      // 检查是否可以升级
      while (canLevelUp(this.gameState)) {
        this.gameState = levelUp(this.gameState);
        this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
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
          this.gameState.cultivation.exp += outcome.effects.exp;
          // 检查是否可以升级
          while (canLevelUp(this.gameState)) {
            this.gameState = levelUp(this.gameState);
            this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
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
            } else if (amount) {
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
    private completeAlchemy() {
      if (!this.gameState.alchemy || !this.gameState.alchemy.currentRecipe) {
        return;
      }

      const recipe = this.gameState.alchemy.currentRecipe;
      
      // 检查成功率
      const success = Math.random() < recipe.successRate;
      
      if (success && recipe.pills && recipe.pills.length > 0) {
        // 成功炼制，获得丹药
        const pillId = recipe.pills[0];
        const pill = initialPills.find(p => p.id === pillId);
        
        if (pill) {
          // 更新丹药数量
          this.gameState.resources.pills++;
          
          // 更新统计数据
          this.gameState.alchemy.successCount++;
          
          // 增加经验值
          if (recipe.expGain) {
            this.gameState.cultivation.exp += recipe.expGain;
            
            // 检查是否可以升级
            while (canLevelUp(this.gameState)) {
              this.gameState = levelUp(this.gameState);
              this.notifyEvent('level_up', { newLevel: this.gameState.cultivation.level });
            }
          }

          this.notifyEvent('alchemy_success', { pill, expGain: recipe.expGain });
        }
      } else {
        // 炼丹失败
        this.gameState.alchemy.failedCount++;
        this.notifyEvent('alchemy_failed', { recipe });
      }

      // 重置炼丹状态
      this.gameState.alchemy.isBrewing = false;
      this.gameState.alchemy.currentRecipe = undefined;
      this.gameState.alchemy.progress = 0;
      this.gameState.alchemy.startTime = undefined;
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

    // 通知事件
    private notifyEvent(eventType: string, data: any) {
    if (this.eventCallback) {
      this.eventCallback(eventType, data);
    }
  }
}