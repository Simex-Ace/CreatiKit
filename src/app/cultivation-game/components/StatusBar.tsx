'use client'

import React from 'react';
import { GameState } from '../types';

interface StatusBarProps {
  gameState: GameState;
}

export const StatusBar: React.FC<StatusBarProps> = ({ gameState }) => {
  const { cultivation, resources } = gameState;
  // 确保生命值和灵气值不会是NaN
  const health = cultivation.health || 0;
  const maxHealth = cultivation.maxHealth || 100;
  const qi = resources.qi || 0;
  const qiCapacity = cultivation.qiCapacity || 100;

  // 计算百分比，确保分母不为0
  const healthPercentage = Math.min(100, Math.max(0, maxHealth > 0 ? (health / maxHealth) * 100 : 0));
  const qiPercentage = Math.min(100, Math.max(0, qiCapacity > 0 ? (qi / qiCapacity) * 100 : 0));

  return (
    <div className="status-bar">
      {/* 生命值 */}
      <div className="status-section">
        <div className="status-label">
          <span className="status-icon">❤️</span>
          <span>生命值</span>
        </div>
        <div className="status-bar-container">
          <div 
            className="status-bar-fill health-fill"
            style={{ width: `${healthPercentage}%` }}
          />
        </div>
        <div className="status-value">
          {Math.floor(health)}/{maxHealth}
        </div>
      </div>

      {/* 法力值 */}
      <div className="status-section">
        <div className="status-label">
          <span className="status-icon">💧</span>
          <span>法力值</span>
        </div>
        <div className="status-bar-container">
          <div 
            className="status-bar-fill qi-fill"
            style={{ width: `${qiPercentage}%` }}
          />
        </div>
        <div className="status-value">
          {Math.floor(qi)}/{qiCapacity}
        </div>
      </div>
    </div>
  );
};
