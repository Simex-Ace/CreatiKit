'use client'

import React, { useState } from 'react';
import { GameState } from '../types';

interface ActionPanelProps {
  gameState: GameState;
  onAction: (action: string, params?: any) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ gameState, onAction }) => {
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const handleAction = (action: string, params?: any) => {
    onAction(action, params);
  };

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="panel">
      <h2 className="panel-title">修真行动</h2>
      
      {/* 手动操作区 */}
      <div className="action-grid">
        <div className="action-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
          <div className="action-title">盘膝修炼</div>
          <div className="action-description">消耗10点灵气，获得经验值</div>
          <div style={{ marginBottom: '0.5rem', minHeight: '1.2rem' }}></div>
          <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={() => handleAction('cultivate')}
              disabled={gameState.resources.qi < 10}
            >
              立即修炼
            </button>
          </div>
        </div>
        
        <div className="action-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
          <div className="action-title">采集灵气</div>
          <div className="action-description">从天地间采集灵气储存</div>
          <div style={{ marginBottom: '0.5rem', minHeight: '1.2rem' }}></div>
          <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={() => handleAction('gatherQi')}
              disabled={gameState.resources.qi >= gameState.cultivation.qiCapacity}
            >
              采集灵气
            </button>
          </div>
        </div>
        
        <div className="action-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
          <div className="action-title">服用丹药</div>
          <div className="action-description">恢复50点灵气</div>
          <div style={{ marginBottom: '0.5rem', color: '#f5d76e' }}>剩余: {gameState.resources.pills}</div>
          <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={() => handleAction('usePill')}
              disabled={gameState.resources.pills <= 0}
            >
              服用丹药
            </button>
          </div>
        </div>
        
        <div className="action-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
          <div className="action-title">服用灵果</div>
          <div className="action-description">获得100点经验值</div>
          <div style={{ marginBottom: '0.5rem', color: '#f5d76e' }}>剩余: {gameState.resources.spiritFruit}</div>
          <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={() => handleAction('useSpiritFruit')}
              disabled={gameState.resources.spiritFruit <= 0}
            >
              服用灵果
            </button>
          </div>
        </div>
      </div>
      
      {/* 自动模式设置 */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>自动模式</h3>
        
        <div className="auto-mode-toggle">
          <span>自动修炼</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={gameState.autoCultivate}
              onChange={() => handleAction('toggleAutoCultivate')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <div className="auto-mode-toggle">
          <span>自动采集灵气</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={gameState.autoGatherQi}
              onChange={() => handleAction('toggleAutoGatherQi')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
          自动模式效率较低，但可在您离开时持续积累资源。请确保有足够的灵气用于自动修炼。
        </p>
      </div>
      
      {/* 物品购买 */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>修真坊市</h3>
        <div className="shop-panel">
          <div className="item-card">
            <div className="item-icon">⚗️</div>
            <div className="item-name">培元丹</div>
            <div className="item-price">20 灵石/个</div>
            <button 
              className="btn" 
              onClick={() => handleAction('buyItem', { type: 'pills', quantity: 1 })}
              disabled={gameState.resources.gold < 20}
            >
              购买
            </button>
          </div>
          
          <div className="item-card">
            <div className="item-icon">🍎</div>
            <div className="item-name">灵果</div>
            <div className="item-price">50 灵石/个</div>
            <button 
              className="btn" 
              onClick={() => handleAction('buyItem', { type: 'spiritFruit', quantity: 1 })}
              disabled={gameState.resources.gold < 50}
            >
              购买
            </button>
          </div>
          
          <div className="item-card">
            <div className="item-icon">💰</div>
            <div className="item-name">当前灵石</div>
            <div className="item-price">{gameState.resources.gold}</div>
          </div>
        </div>
      </div>
      
      {/* 通知提示 */}
      {notification && (
        <div 
          className="event-notification"
          style={{ 
            borderColor: notification.type === 'success' ? '#48bb78' : '#f56565',
            backgroundColor: notification.type === 'success' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)'
          }}
        >
          <div className="event-title">
            {notification.type === 'success' ? '成功' : '错误'}
          </div>
          <div className="event-message">
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};