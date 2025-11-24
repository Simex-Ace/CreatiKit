'use client'

import React, { useState, useEffect, useRef } from 'react';
import { GameState, GameEvent } from './types';
import { createNewGame, CultivationGame } from './game-core';
import { StatusPanel } from './components/StatusPanel';
import { ActionPanel } from './components/ActionPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { CultivationPanel } from './components/CultivationPanel';
import { QuestPanel } from './components/QuestPanel';
import AchievementsPanel from './components/AchievementsPanel';
import EventPanel from './components/EventPanel';
import AlchemyPanel from './components/AlchemyPanel';
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
          showNotification(`恭喜突破到${params.newLevel}！`, 'success');
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

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // 显示成就解锁通知
  const showAchievementNotification = (description: string, reward: string) => {
    setNotification({
      message: `🏆 成就解锁：${description}\n奖励：${reward}`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 5000);
  };

  // 处理开始炼丹
  const handleStartAlchemy = (recipeId: string) => {
    if (gameRef.current?.startAlchemy(recipeId)) {
      showNotification('开始炼丹！', 'info');
      // 更新游戏状态
      setGameState(gameRef.current.getState());
      // 立即保存
      saveGame();
    } else {
      showNotification('炼丹条件不满足！', 'error');
    }
  };

  if (!gameState) {
    return (
      <div className="cultivation-container">
        <div className="loading-screen">
          <p>正在加载修仙世界...</p>
        </div>
      </div>
    );
  }

  // 如果gameState为null，显示加载状态
  if (!gameState) {
    return (
      <div className="cultivation-game-container">
        <div className="loading-screen">
          <h1 className="game-title">
            <span className="title-glow">🧙‍♂️ 修真模拟器</span>
          </h1>
          <div className="loading-text">正在加载游戏...</div>
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
            <StatusPanel gameState={gameState} />
            <ActionPanel gameState={gameState} onAction={handleAction} />
            <CultivationPanel gameState={gameState} onAction={handleAction} />
          </div>
          
          {/* 右侧面板 */}
        <div className="right-panel">
          <InventoryPanel gameState={gameState} />
          
          {/* 任务面板 */}
          <QuestPanel gameState={gameState} onAction={handleAction} />
          
          {/* 成就面板 */}
            <AchievementsPanel gameState={gameState} onAchievementUnlock={showAchievementNotification} />
            
           {/* 炼丹面板 */}
           <AlchemyPanel gameState={gameState} onStartAlchemy={handleStartAlchemy} />
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
        <div className={`notification notification-${notification.type} animate-fade-in`}>
          <span className="notification-icon">
            {notification.type === 'success' ? '✓' : notification.type === 'error' ? '!' : 'ℹ'}
          </span>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}
    </div>
  );
}