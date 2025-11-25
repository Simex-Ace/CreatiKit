'use client'

import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameEvent, Pet, Sect, Resources } from './types';
import { getCultivationLevelName, getNextCultivationLevel, levelUp } from './utils';
import { createNewGame, CultivationGame } from './game-core';
import { StatusPanel } from './components/StatusPanel';
import { ActionPanel } from './components/ActionPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { CultivationPanel } from './components/CultivationPanel';
import { QuestPanel } from './components/QuestPanel';
import AchievementsPanel from './components/AchievementsPanel';
import EventPanel from './components/EventPanel';
import AlchemyPanel from './components/AlchemyPanel';
import { BattlePanel } from './components/BattlePanel';
import { ForgePanel } from './components/ForgePanel';
import PetPanel from './components/PetPanel';
import SectPanel from './components/SectPanel';
import { alchemyRecipes } from './data/alchemy-recipes';
import './globals.css';

export default function CultivationGamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isAutoSaved, setIsAutoSaved] = useState(true);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const gameRef = useRef<CultivationGame | null>(null);
  const lastSaveRef = useRef<number>(Date.now());

  // 初始化游戏
  useEffect(() => {
    const savedGame = localStorage.getItem('cultivationGame');
    
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        // 计算离线收益
        const offlineDuration = Math.floor((Date.now() - parsedGame.lastPlayTime) / 1000);
        
        // CultivationGame构造函数会自动处理离线收益
        const game = new CultivationGame(parsedGame);
        setGameState(game.getState());
        gameRef.current = game;
        
        // 显示离线收益通知
        if (offlineDuration > 60) {
          const minutes = Math.floor(offlineDuration / 60);
          showNotification(`您已离线 ${minutes} 分钟，获得了离线收益！`, 'success');
        }
      } catch (error) {
        console.error('加载游戏失败，创建新游戏', error);
        initializeNewGame();
      }
    } else {
      initializeNewGame();
    }
  }, []);

  // 初始化新游戏
  const initializeNewGame = () => {
    const newGameState = createNewGame('修仙者');
    setGameState(newGameState);
    gameRef.current = new CultivationGame(newGameState);
  };

  // 游戏主循环
  useEffect(() => {
    if (!gameRef.current) return;

    // 启动游戏循环
    gameRef.current.startGameLoop();

    const gameLoop = setInterval(() => {
      // 获取更新后的游戏状态
      const newState = gameRef.current ? gameRef.current.getState() : null;
      setGameState(newState);
      setIsAutoSaved(false); // 状态变化时标记为未保存
      
      // 自动保存（每30秒）
      const now = Date.now();
      if (now - lastSaveRef.current > 30000) {
        saveGame();
        lastSaveRef.current = now;
        setIsAutoSaved(true);
      }
    }, 1000); // 每秒更新一次

    return () => {
      clearInterval(gameLoop);
      gameRef.current?.stopGameLoop();
    };
  }, []);

  // 处理游戏事件
  useEffect(() => {
    const handleGameEvent = (eventName: string, params: any) => {
      switch (eventName) {
        case 'level_up':
          // 使用中文名称显示突破结果
          const levelUpNewLevelName = getCultivationLevelName(params.newLevel);
          showNotification(`恭喜突破到${levelUpNewLevelName}！`, 'success');
          // 确保状态更新
          setGameState(gameRef.current?.getState() || gameState);
          break;
        case 'breakthrough_success':
          // 使用中文名称显示突破结果
          const newLevelName = getCultivationLevelName(params.newLevel);
          showNotification(`恭喜突破到${newLevelName}！`, 'success');
          // 确保状态更新
          setGameState(gameRef.current?.getState() || gameState);
          break;
        case 'breakthrough_failed':
          showNotification(params.message, 'error');
          break;
        case 'error':
          showNotification(params.message, 'error');
          break;
        case 'game_updated':
          // 确保界面更新
          setGameState(gameRef.current?.getState() || gameState);
          break;
        case 'quest_updated':
          setGameState(gameRef.current?.getState() || gameState);
          break;
        case 'quest_completed':
          showNotification(`任务完成：${params.quest.description}`, 'success');
          break;
        case 'achievement_unlocked':
          showAchievementNotification(params.achievement.description, params.achievement.reward);
          break;
        case 'event_triggered':
          setCurrentEvent(params.event);
          break;
        case 'offline_rewards':
          showNotification(`获得离线奖励！经验：${params.rewards.exp}，灵气：${params.rewards.qi}`, 'success');
          break;
        case 'alchemy_started':
          showNotification(`开始炼制${params.recipe.name}！`, 'info');
          break;
        case 'alchemy_success':
          showNotification(`炼丹成功！获得${params.pill.name}，经验+${params.expGain}`, 'success');
          break;
        case 'alchemy_failed':
          showNotification(`炼丹失败！失去了所有材料。`, 'error');
          break;
        case 'recipe_unlocked':
          showNotification(`解锁新配方：${params.recipe.name}！`, 'success');
          break;
        case 'battle_started':
          showNotification(`遇到了${params.monster.name}！`, 'info');
          break;
        case 'battle_victory':
          showNotification(`击败了${params.monster.name}！获得经验：${params.expGained}，金币：${params.goldGained}`, 'success');
          break;
        case 'battle_defeat':
          showNotification(`被${params.monster.name}击败了！`, 'error');
          break;
        case 'flee_success':
          showNotification(`成功逃脱了战斗！`, 'success');
          break;
        case 'forge_started':
          showNotification(`开始炼制装备！`, 'info');
          break;
        case 'forge_success':
          showNotification(`炼器成功！获得装备，经验+${params.expGained}`, 'success');
          break;
        case 'forge_failure':
          showNotification(`炼器失败！失去了所有材料。`, 'error');
          break;
        case 'forge_progress_updated':
          // 可以添加进度更新通知，但通常不需要
          break;
        case 'blueprint_unlocked':
          showNotification(`解锁新图谱：${params.blueprint.name}！`, 'success');
          break;
        case 'pet_caught':
          showNotification(`成功捕捉了${params.pet.name}！`, 'success');
          break;
        case 'pet_catch_failed':
          showNotification(`捕捉${params.petData.name}失败了，继续努力！`, 'error');
          break;
        case 'game_updated':
          // 当游戏状态更新时，更新界面
          setGameState(params.state);
          break;
        default:
          console.warn('未知游戏事件:', eventName);
      }
    };

    if (gameRef.current) {
      gameRef.current.setEventCallback(handleGameEvent);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.setEventCallback(null);
      }
    };
  }, []);

  // 保存游戏
  const saveGame = () => {
    if (!gameRef.current) return;
    
    const gameStateToSave = gameRef.current.getState();
    gameStateToSave.lastPlayTime = Date.now();
    
    localStorage.setItem('cultivationGame', JSON.stringify(gameStateToSave));
    setIsAutoSaved(true);
  };

  // 游戏操作处理
  const handleAction = (action: string, params?: any) => {
    if (!gameRef.current) return;

    switch (action) {
      case 'cultivate':
        gameRef.current.cultivate();
        showNotification('开始修炼，增长修为！', 'info');
        break;
      case 'gatherQi':
        gameRef.current.gatherQi();
        showNotification('开始采集灵气！', 'info');
        break;
      case 'usePill':
        if (gameRef.current.usePill()) {
          showNotification('服用了培元丹，修为大涨！', 'success');
        } else {
          showNotification('培元丹不足！', 'error');
        }
        break;
      case 'useSpiritFruit':
        if (gameRef.current.useSpiritFruit()) {
          showNotification('服用了灵果，修为大涨！', 'success');
        } else {
          showNotification('灵果不足！', 'error');
        }
        break;
      case 'useFruit':
        // 暂时移除灵果使用功能，需要在CultivationGame类中添加useFruit方法
        showNotification('功能尚未实现！', 'error');
        break;
      // 炼丹相关的处理将直接在handleStartAlchemy中完成
      case 'toggleAutoCultivate':
        gameRef.current.toggleAutoCultivate();
        const isAutoCultivating = gameRef.current.getState().autoCultivate;
        showNotification(isAutoCultivating ? '开启自动修炼' : '关闭自动修炼', 'info');
        break;
      case 'toggleAutoGatherQi':
        gameRef.current.toggleAutoGatherQi();
        const isAutoGathering = gameRef.current.getState().autoGatherQi;
        showNotification(isAutoGathering ? '开启自动采集灵气' : '关闭自动采集灵气', 'info');
        break;
      case 'breakthrough':
        // 直接调用突破方法，结果由事件处理函数处理
        console.log('Breakthrough action received, calling breakthrough method...');
        if (gameRef.current) {
          const result = gameRef.current.breakthrough();
          console.log('Breakthrough method returned:', result);
          // 手动更新状态，确保界面显示最新状态
          setGameState(gameRef.current?.getState() || gameState);
          if (!result) {
            showNotification('突破条件不足！', 'error');
          }
        }
        break;
      case 'buyPill':
        if (gameRef.current.buyItem('pills')) {
          showNotification('购买了培元丹！', 'success');
        } else {
          showNotification('灵石不足！', 'error');
        }
        break;
      case 'buyFruit':
        if (gameRef.current.buyItem('spiritFruit')) {
          showNotification('购买了灵果！', 'success');
        } else {
          showNotification('灵石不足！', 'error');
        }
        break;
      case 'buyItem':
        if (gameRef.current.buyItem(params.type, params.quantity)) {
          showNotification(`购买了${params.quantity}个${params.type === 'pills' ? '培元丹' : '灵果'}！`, 'success');
        } else {
          showNotification('灵石不足！', 'error');
        }
        break;
      case 'sellResource':
        if (gameRef.current.sellResource(params.type, params.quantity)) {
          const itemNames: Record<string, string> = { pills: '培元丹', spiritFruit: '灵果' };
          showNotification(`出售了${params.quantity}个${itemNames[params.type]}，获得了${params.quantity * (params.type === 'pills' ? 10 : 25)}灵石！`, 'success');
        } else {
          showNotification('资源不足！', 'error');
        }
        break;
      case 'upgradeSkill':
        if (gameRef.current.upgradeSkill(params.skillId)) {
          const skill = gameState?.skills.find(s => s.id === params.skillId);
          showNotification(`成功升级技能「${skill?.name}」！`, 'success');
        } else {
          showNotification('升级条件不满足！', 'error');
        }
        break;
      case 'claimQuestReward':
        if (gameRef.current.claimQuestReward(params.questId)) {
          const quest = gameState?.quests.find(q => q.id === params.questId);
          showNotification(`成功领取任务「${quest?.title}」的奖励！`, 'success');
        } else {
          showNotification('领取奖励失败！', 'error');
        }
        break;
      case 'claimAchievementReward':
        if (gameRef.current.claimAchievementReward(params.achievementId)) {
          showNotification('成功领取成就奖励！', 'success');
        } else {
          showNotification('领取奖励失败！', 'error');
        }
        break;
      case 'resetGame':
        if (window.confirm('确定要重新开始游戏吗？当前进度将会丢失！')) {
          localStorage.removeItem('cultivationGame');
          initializeNewGame();
          showNotification('游戏已重置！', 'info');
        }
        break;
      case 'handleEventChoice':
        if (gameRef.current) {
          gameRef.current.handleEventChoice(params);
          setCurrentEvent(null);
        }
        break;
      case 'battleStart':
        if (gameRef.current) {
          gameRef.current.startBattle(params.monsterId);
        }
        break;
      case 'battleAttack':
        if (gameRef.current) {
          gameRef.current.attackMonster();
        }
        break;
      case 'battleFlee':
        if (gameRef.current) {
          gameRef.current.fleeBattle();
        }
        break;
      case 'exitBattle':
        if (gameRef.current) {
          gameRef.current.exitBattle();
        }
        break;
      case 'forgeStart':
        if (gameRef.current) {
          gameRef.current.startForge(params.blueprintId);
        }
        break;
      case 'catchPet':
        if (gameRef.current) {
          gameRef.current.catchPet(params.petDataId);
        }
        break;
      case 'trainPet':
        if (gameRef.current) {
          gameRef.current.trainPet(params.petId);
        }
        break;
      case 'upgradePetSkill':
        if (gameRef.current) {
          gameRef.current.upgradePetSkill(params.petId, params.skillIndex);
        }
        break;
      case 'togglePetActive':
        if (gameRef.current) {
          gameRef.current.togglePetActive(params.petId);
        }
        break;
      case 'feedPet':
        if (gameRef.current) {
          gameRef.current.feedPet(params.petId);
        }
        break;
      case 'joinSect':
        if (gameRef.current) {
          gameRef.current.joinSect(params.sectId);
        }
        break;
      case 'contributeToSect':
        if (gameRef.current) {
          gameRef.current.contributeToSect(params.amount);
        }
        break;
      case 'completeSectTask':
        if (gameRef.current) {
          gameRef.current.completeSectTask(params.taskId);
        }
        break;
      case 'claimSectTaskReward':
        if (gameRef.current) {
          gameRef.current.claimSectTaskReward(params.taskId);
        }
        break;
      default:
        console.warn('未知操作:', action);
    }

    // 检查任务完成情况
    const hasQuestChanges = gameRef.current.checkAllQuests();
    
    // 更新游戏状态
    setGameState(gameRef.current.getState());
    
    // 如果有任务完成，显示通知
    if (hasQuestChanges) {
      showNotification('有任务完成了！快去领取奖励吧！', 'success');
    }
    
    // 立即保存
    saveGame();
  };

  // 通知定时器引用
  const notificationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // 清除现有的定时器，防止冲突
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({ message, type });
    
    // 设置新的定时器
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 3000);
  };

  // 获取资源的中文名称
  const getResourceName = (resource: keyof Resources): string => {
    const resourceNames: Record<keyof Resources, string> = {
      qi: '灵气',
      gold: '灵石',
      pills: '丹药',
      materials: '基础材料',
      spiritFruit: '灵果',
      spiritGrass: '灵草',
      spiritWater: '灵水',
      spiritStone: '灵石',
      spiritCrystal: '灵晶',
      heavenlyHerb: '天材地宝',
      immortalFruit: '仙果',
      divineEssence: '神髓'
    };
    
    return resourceNames[resource] || resource;
  };

  // 显示成就解锁通知
  const showAchievementNotification = (description: string, reward: any) => {
    // 构建奖励描述
    let rewardText = '';
    if (reward) {
      if (reward.exp) rewardText += `经验: +${reward.exp} `;
      if (reward.resources) {
        for (const [resource, amount] of Object.entries(reward.resources)) {
          const resourceName = getResourceName(resource as keyof Resources);
          rewardText += `${resourceName}: +${amount} `;
        }
      }
    }
    
    // 清除现有的定时器，防止冲突
    if (notificationTimerRef.current) {
      clearTimeout(notificationTimerRef.current);
    }
    
    setNotification({
      message: `🏆 成就解锁：${description}\n奖励：${rewardText}`,
      type: 'success'
    });
    
    // 设置新的定时器
    notificationTimerRef.current = setTimeout(() => {
      setNotification(null);
      notificationTimerRef.current = null;
    }, 5000);
  };

  // 处理开始炼丹
  const handleStartAlchemy = (recipeId: string) => {
    const recipe = alchemyRecipes.find(r => r.id === recipeId);
    if (!recipe || !gameState) return;

    // 检查材料是否足够
    const hasEnoughMaterials = recipe.ingredients.every(ingredient => {
      const currentAmount = gameState.resources[ingredient.id as keyof typeof gameState.resources] || 0;
      return currentAmount >= ingredient.quantity;
    });

    if (!hasEnoughMaterials) return;

    // 扣除材料
    const updatedResources = { ...gameState.resources };
    recipe.ingredients.forEach(ingredient => {
      updatedResources[ingredient.id as keyof typeof updatedResources] = 
        (updatedResources[ingredient.id as keyof typeof updatedResources] || 0) - ingredient.quantity;
    });

    // 开始炼丹
    setGameState({
      ...gameState,
      resources: updatedResources,
      alchemy: {
        ...gameState.alchemy,
        isBrewing: true,
        currentRecipe: recipe,
        progress: 0,
        startTime: Date.now()
      }
    });

    // 设置定时器更新进度
    const alchemyInterval = setInterval(() => {
      setGameState(prev => {
        if (!prev || !prev.alchemy.isBrewing || !prev.alchemy.currentRecipe) {
          clearInterval(alchemyInterval);
          return prev;
        }

        const elapsed = Date.now() - prev.alchemy.startTime!;
        const progress = Math.min(100, (elapsed / (prev.alchemy.currentRecipe.duration * 1000)) * 100);

        if (progress >= 100) {
          clearInterval(alchemyInterval);
          return finishAlchemy(prev);
        }

        return {
          ...prev,
          alchemy: {
            ...prev.alchemy,
            progress
          }
        };
      });
    }, 100);
  };

  // 完成炼丹
  const finishAlchemy = (prevState: GameState) => {
    if (!prevState.alchemy.currentRecipe) return prevState;

    // 获取炼制的丹药
    const recipe = prevState.alchemy.currentRecipe;
    
    // 更新游戏状态
    const updatedResources = { ...prevState.resources };
    updatedResources.pills = (updatedResources.pills || 0) + 1;
    
    // 增加经验
    const expGain = recipe.expGain || 0;
    const updatedCultivation = { ...prevState.cultivation };
    updatedCultivation.exp = prevState.cultivation.exp + expGain;
    
    // 显示通知
    showNotification(`炼丹成功！获得${recipe.name}，经验+${expGain}`, 'success');
    
    // 重置炼丹状态
    return {
      ...prevState,
      cultivation: updatedCultivation,
      resources: updatedResources,
      alchemy: {
        ...prevState.alchemy,
        isBrewing: false,
        currentRecipe: undefined,
        progress: 0,
        startTime: undefined
      }
    };
  };

  // 游戏开始状态
  const [gameStarted, setGameStarted] = useState(false);
  
  // 标签页状态
  const [activeTab, setActiveTab] = useState('inventory');

  // 开始新游戏
  const handleStartGame = () => {
    initializeNewGame();
    setGameStarted(true);
  };

  // 如果gameState为null且游戏未开始，显示开始界面
  if (!gameState && !gameStarted) {
    return (
      <div className="cultivation-game-container">
        <div className="loading-screen">
          <h1 className="game-title">
            <span className="title-glow">🧙‍♂️ 修真模拟器</span>
          </h1>
          <div className="loading-text">欢迎来到修真世界！</div>
          <div className="start-button-container" style={{ marginTop: '2rem' }}>
            <button 
              className="btn btn-primary start-game-button"
              onClick={handleStartGame}
              style={{ 
                padding: '1.5rem 3rem', 
                fontSize: '1.5rem',
                background: 'linear-gradient(135deg, #f5d76e, #f39c12)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(245, 215, 110, 0.6)',
                transition: 'all 0.3s ease'
              }}
            >
              🚀 开始修真之旅
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cultivation-game-container">
      {/* 背景动态效果 */}
      <div className="dynamic-background"></div>
      
      <div className="game-content">
        {/* 游戏标题区域 */}
        <div className="header-section">
          <h1 className="game-title">
            <span className="title-glow">🧙‍♂️ 修真模拟器</span>
          </h1>
          <div className="subtitle">踏上修仙之路，突破境界，成就大道</div>
        </div>
        
        {/* 控制面板 */}
        <div className="game-main">
          {/* 左侧面板 */}
          <div className="left-panel">
            {gameState && <StatusPanel gameState={gameState} />}
            {gameState && <ActionPanel gameState={gameState} onAction={handleAction} />}
            {gameState && <CultivationPanel gameState={gameState} onAction={handleAction} />}
          </div>
          
          {/* 右侧面板 */}
          <div className="right-panel">
            {/* 标签页导航 */}
            <div className="tab-navigation">
              <button 
                className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                🧳 物品
              </button>
              <button 
                className={`tab-button ${activeTab === 'quest' ? 'active' : ''}`}
                onClick={() => setActiveTab('quest')}
              >
                📋 任务
              </button>
              <button 
                className={`tab-button ${activeTab === 'achievements' ? 'active' : ''}`}
                onClick={() => setActiveTab('achievements')}
              >
                🏆 成就
              </button>
              <button 
                className={`tab-button ${activeTab === 'alchemy' ? 'active' : ''}`}
                onClick={() => setActiveTab('alchemy')}
              >
                ⚗️ 炼丹
              </button>
              <button 
                className={`tab-button ${activeTab === 'battle' ? 'active' : ''}`}
                onClick={() => setActiveTab('battle')}
              >
                ⚔️ 战斗
              </button>
              <button 
                className={`tab-button ${activeTab === 'forge' ? 'active' : ''}`}
                onClick={() => setActiveTab('forge')}
              >
                ⚒️ 炼器
              </button>
              <button 
                className={`tab-button ${activeTab === 'pets' ? 'active' : ''}`}
                onClick={() => setActiveTab('pets')}
              >
                🐾 宠物
              </button>
              <button 
                className={`tab-button ${activeTab === 'sect' ? 'active' : ''}`}
                onClick={() => setActiveTab('sect')}
              >
                🏛️ 宗门
              </button>
            </div>
            
            {/* 标签页内容 */}
            <div className="tab-content">
              {activeTab === 'inventory' && gameState && (
                <InventoryPanel gameState={gameState} />
              )}
              {activeTab === 'quest' && gameState && (
                <QuestPanel gameState={gameState} onAction={handleAction} />
              )}
              {activeTab === 'achievements' && gameState && (
                <AchievementsPanel gameState={gameState} onAchievementUnlock={showAchievementNotification} onAction={handleAction} />
              )}
              {activeTab === 'alchemy' && gameState && (
                <AlchemyPanel gameState={gameState} onStartAlchemy={handleStartAlchemy} />
              )}
              {activeTab === 'battle' && gameState && (
                <BattlePanel 
                  gameState={gameState} 
                  onBattleStart={(monsterId) => handleAction('battleStart', { monsterId })} 
                  onAttack={() => handleAction('battleAttack')} 
                  onFlee={() => handleAction('battleFlee')} 
                  onExitBattle={() => handleAction('exitBattle')} 
                />
              )}
              {activeTab === 'forge' && gameState && (
                <ForgePanel 
                  gameState={gameState} 
                  onStartForge={(blueprintId) => handleAction('forgeStart', { blueprintId })} 
                />
              )}
              {activeTab === 'pets' && gameState && (
                <PetPanel
                  gameState={gameState}
                  onCatchPet={(petDataId) => handleAction('catchPet', { petDataId })}
                  onTrainPet={(petId) => handleAction('trainPet', { petId })}
                  onUpgradePetSkill={(petId, skillIndex) => handleAction('upgradePetSkill', { petId, skillIndex })}
                  onTogglePetActive={(petId) => handleAction('togglePetActive', { petId })}
                  onFeedPet={(petId) => handleAction('feedPet', { petId })}
                />
              )}
              {activeTab === 'sect' && gameState && (
                <SectPanel
                  gameState={gameState}
                  onJoinSect={(sectId) => handleAction('joinSect', { sectId })}
                  onContributeToSect={(amount) => handleAction('contributeToSect', { amount })}
                  onCompleteSectTask={(taskId) => handleAction('completeSectTask', { taskId })}
                  onClaimSectTaskReward={(taskId) => handleAction('claimSectTaskReward', { taskId })}
                />
              )}
            </div>
          </div>
        
        {/* 事件面板 */}
        <EventPanel 
          currentEvent={currentEvent} 
          onEventChoice={(choiceIndex) => handleAction('handleEventChoice', choiceIndex)} 
        />
        </div>

        {/* 重置按钮 */}
        <div className="reset-game-container">
          <button 
            className="btn btn-danger"
            onClick={() => handleAction('resetGame')}
          >
            重新开始游戏
          </button>
        </div>
        
        {/* 底部信息栏 */}
        <div className="footer-info">
          <div className="version-info">
            v1.0.1
          </div>
        </div>
      </div>

      {/* 增强的通知提示 */}
      {notification && (
        <div className={`event-notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'info' && 'ℹ️'}
            </div>
            <div className="notification-message">{notification.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}