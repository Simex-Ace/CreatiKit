'use client'

import React, { useState, useEffect, useRef } from 'react';
import { GameState, Monster } from '../types';

interface BattlePanelProps {
  gameState: GameState;
  onBattleStart: (monsterId: string) => void;
  onAttack: () => void;
  onFlee: () => void;
  onExitBattle: () => void;
}

export const BattlePanel: React.FC<BattlePanelProps> = ({
  gameState,
  onBattleStart,
  onAttack,
  onFlee,
  onExitBattle
}) => {
  // 从战斗状态中获取当前怪物
  const currentMonster = gameState.battle?.currentMonster;
  const isInBattle = gameState.battle?.isInBattle;
  const battle = gameState.battle;
  const battleWon = gameState.battle?.battleWon || false;
  const fleeSuccess = gameState.battle?.fleeSuccess || false;
  const battleLost = gameState.battle?.battleLost || false;
  const battleEnded = battleWon || fleeSuccess || battleLost;

  // 获取可用的怪物列表
  const availableMonsters = gameState.monsters || [];

  // 战斗动画状态
  const [showAttackAnimation, setShowAttackAnimation] = useState(false);
  const [showMonsterAttackAnimation, setShowMonsterAttackAnimation] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number; value: string; x: number; y: number; type: 'player' | 'monster' }[]>([]);
  // 战斗操作状态
  const [isAttacking, setIsAttacking] = useState(false);
  const [isFleeing, setIsFleeing] = useState(false);
  const damageIdRef = useRef(0);
  const battleLogRef = useRef<HTMLDivElement>(null);

  // 监听战斗日志变化，自动滚动到底部
  useEffect(() => {
    if (battleLogRef.current && battle?.battleLog) {
      // 确保在DOM更新后执行滚动
      setTimeout(() => {
        const logElement = battleLogRef.current;
        if (logElement) {
          logElement.scrollTop = logElement.scrollHeight || 0;
        }
      }, 100);
    }
  }, [battle?.battleLog, battle?.battleLog?.length]);

  // 监听战斗状态变化，添加攻击动画
  useEffect(() => {
    if (battle?.battleLog && Array.isArray(battle.battleLog)) {
      // 检查最新的战斗日志条目
      const latestLog = battle.battleLog[battle.battleLog.length - 1];
      if (latestLog && latestLog.includes('你攻击了')) {
        triggerAttackAnimation();
        addDamageNumber('monster', Math.floor(Math.random() * 20) + 10);
      }
      if (latestLog && latestLog.includes('攻击了你')) {
        triggerMonsterAttackAnimation();
        addDamageNumber('player', Math.floor(Math.random() * 10) + 5);
      }
    }
  }, [battle?.battleLog]);

  // 触发玩家攻击动画
  const triggerAttackAnimation = () => {
    setShowAttackAnimation(true);
    setTimeout(() => setShowAttackAnimation(false), 500);
  };

  // 触发怪物攻击动画
  const triggerMonsterAttackAnimation = () => {
    setShowMonsterAttackAnimation(true);
    setTimeout(() => setShowMonsterAttackAnimation(false), 500);
  };

  // 添加伤害数字
  const addDamageNumber = (type: 'player' | 'monster', value: number) => {
    const id = damageIdRef.current++;
    const newDamage = {
      id,
      value: `-${value}`,
      x: Math.random() * 100,
      y: Math.random() * 100,
      type
    };
    
    setDamageNumbers(prev => [...prev, newDamage]);
    
    // 2秒后移除伤害数字
    setTimeout(() => {
      setDamageNumbers(prev => prev.filter(d => d.id !== id));
    }, 2000);
  };

  return (
    <div className="game-panel">
      <h3 className="panel-title">🧟 战斗系统</h3>
      
      {isInBattle && currentMonster ? (
        // 战斗中的界面
        <div className="battle-in-progress">
          {/* 战斗画面区域 */}
          <div style={{ 
            position: 'relative', 
            height: '300px', 
            background: 'linear-gradient(180deg, rgba(26, 32, 44, 0.8), rgba(17, 24, 39, 0.9))',
            borderRadius: '12px',
            marginBottom: '2rem',
            overflow: 'hidden',
            border: '2px solid rgba(245, 215, 110, 0.3)'
          }}>
            
            {/* 战斗背景效果 */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10h10v10H0V10zM10 0h10v10H10V0zM20 10h10v10H20V10zM10 20h10v10H10V20z' fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              opacity: 0.3
            }}></div>
            
            {/* 玩家角色 */}
            <div style={{ 
              position: 'absolute', 
              left: '15%', 
              bottom: '20%', 
              width: '80px', 
              height: '120px',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              borderRadius: '50% 50% 10px 10px',
              transform: showMonsterAttackAnimation ? 'translateX(-20px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
              boxShadow: '0 0 20px rgba(52, 152, 219, 0.6)',
              zIndex: 2
            }}>
              {/* 玩家武器/攻击效果 */}
              {showAttackAnimation && (
                <div style={{ 
                  position: 'absolute', 
                  left: '100%', 
                  top: '40%', 
                  width: '100px', 
                  height: '4px',
                  background: 'linear-gradient(90deg, #f5d76e, transparent)',
                  animation: 'slash 0.5s ease-out'
                }}></div>
              )}
            </div>
            
            {/* 怪物角色 */}
            <div style={{ 
              position: 'absolute', 
              right: '15%', 
              bottom: '20%', 
              width: '100px', 
              height: '120px',
              background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
              borderRadius: '50% 50% 10px 10px',
              transform: showAttackAnimation ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
              boxShadow: '0 0 20px rgba(231, 76, 60, 0.6)',
              zIndex: 2
            }}>
              {/* 怪物形象和名称 */}
              <div style={{ 
                position: 'absolute', 
                top: '-50px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{currentMonster.image}</div>
                <div style={{ 
                  color: '#f5d76e', 
                  fontWeight: 'bold'
                }}>
                  {currentMonster.name}
                </div>
              </div>
            </div>
            
            {/* 伤害数字 */}
            {damageNumbers.map(damage => (
              <div 
                key={damage.id}
                style={{
                  position: 'absolute',
                  left: damage.type === 'player' ? '20%' : '70%',
                  top: '30%',
                  color: damage.type === 'player' ? '#e74c3c' : '#27ae60',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  animation: 'floatUp 2s ease-out',
                  opacity: 0
                }}
              >
                {damage.value}
              </div>
            ))}
          </div>

          {/* 生命值显示 */}
          <div className="monster-info">
            <h4>{currentMonster?.name || '未知怪物'}</h4>
            <div className="monster-stats">
              <div className="stat-bar">
                <span>生命值:</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill health-fill"
                    style={{ 
                      width: `${(battle?.monsterHealth || 0) / (currentMonster?.stats.maxHealth || 1) * 100}%`,
                      transition: 'width 0.5s ease'
                    }}
                  ></div>
                </div>
                <span>{Math.round(battle?.monsterHealth || 0)}/{currentMonster?.stats.maxHealth || 0}</span>
              </div>
              <div className="monster-level">等级: {currentMonster?.level || 1}</div>
              <div className="monster-desc">{currentMonster?.description || '无描述'}</div>
            </div>
          </div>
          
          <div className="battle-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => {
                setIsAttacking(true);
                onAttack();
                triggerAttackAnimation();
                // 设置短暂延迟后重置状态，确保动画完成
                setTimeout(() => setIsAttacking(false), 1000);
              }}
              disabled={battleEnded || isAttacking}
              style={{ 
                padding: '1rem 2rem', 
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                opacity: battleEnded ? 0.5 : 1,  // 战斗结束时半透明
                cursor: battleEnded ? 'not-allowed' : 'pointer'  // 战斗结束时显示禁止光标
              }}
            >
              {isAttacking ? '攻击中...' : '⚔️ 攻击'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsFleeing(true);
                onFlee();
                // 设置短暂延迟后重置状态
                setTimeout(() => setIsFleeing(false), 1000);
              }}
              disabled={battleEnded || isFleeing}
              style={{ 
                padding: '1rem 2rem', 
                fontSize: '1.1rem',
                background: 'linear-gradient(135deg, #95a5a6, #7f8c8d)',
                opacity: battleEnded ? 0.5 : 1,
                cursor: battleEnded ? 'not-allowed' : 'pointer'
              }}
            >
              {isFleeing ? '逃跑中...' : '🏃 逃跑'}
            </button>
            {battleEnded && (
              <button 
                className="btn btn-success" 
                onClick={onExitBattle}
                style={{ 
                  padding: '1rem 2rem', 
                  fontSize: '1.1rem',
                  background: 'linear-gradient(135deg, #2ecc71, #27ae60)'
                }}
              >
                🚪 退出战斗
              </button>
            )}
          </div>

          {/* 战斗日志 */}
          {battle?.battleLog && (
            <div 
              ref={battleLogRef}
              style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                background: 'rgba(30, 41, 59, 0.8)', 
                borderRadius: '8px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}
            >
              <h4 style={{ color: '#f5d76e', marginBottom: '0.5rem' }}>战斗日志</h4>
              <div 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                {battle.battleLog.map((log, index) => (
                  <div key={index} style={{ color: '#e2e8f0' }}>{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        // 非战斗状态界面
        <div className="monster-list">
          <h4>可挑战怪物</h4>
          <div className="available-monsters" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', margin: '1.5rem 0' }}>
            {availableMonsters.length > 0 ? (
              availableMonsters.map(monster => (
                <div key={monster.id} className="monster-card" style={{ 
                  padding: '1.5rem', 
                  background: 'rgba(30, 41, 59, 0.5)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: 'none',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{monster.image}</div>
                  <h5 style={{ color: '#f5d76e', marginBottom: '1rem' }}>{monster.name}</h5>
                  <div className="monster-card-stats">
                    <div>等级: {monster.level}</div>
                    <div>生命值: {monster.stats.maxHealth}</div>
                    <div>攻击力: {monster.stats.attack}</div>
                    <div>经验值: {monster.stats.expReward}</div>
                  </div>
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => onBattleStart(monster.id)}
                    style={{ width: '100%', marginTop: '1rem' }}
                  >
                    挑战
                  </button>
                </div>
              ))
            ) : (
              <div className="no-monsters">当前没有可挑战的怪物</div>
            )}
          </div>
          
          <div className="battle-stats">
            <div>胜利次数: {gameState.totalBattlesWon || 0}</div>
            <div>失败次数: {gameState.totalBattlesLost || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};