'use client'

import React from 'react';
import { GameState } from '../types';
import { getCultivationLevelName } from '../utils';

interface StatusPanelProps {
  gameState: GameState;
}

export const StatusPanel: React.FC<StatusPanelProps> = ({ gameState }) => {
  const cultivationProgress = (gameState.cultivation.exp / gameState.cultivation.maxExp) * 100;
  const qiProgress = (gameState.resources.qi / gameState.cultivation.qiCapacity) * 100;

  // 计算时间格式化
  const formatOfflineTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟`;
    } else {
      return `${seconds}秒`;
    }
  };

  return (
    <div className="panel">
      <h2 className="panel-title">修真状态</h2>
      
      {/* 离线收益提示 */}
      {gameState.offlineTime > 30000 && (
        <div className="offline-rewards">
          <h3>离线修炼成果</h3>
          <p>您离线了 {formatOfflineTime(gameState.offlineTime)}，获得了丰厚的修炼收益！</p>
        </div>
      )}
      
      <div className="status-info">
        <div className="status-item">
          <span className="status-label">修真者</span>
          <span className="status-value">{gameState.playerName}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">修真境界</span>
          <span className="status-value">{getCultivationLevelName(gameState.cultivation.level)}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">经验值</span>
          <span className="status-value">{Math.floor(gameState.cultivation.exp)} / {gameState.cultivation.maxExp}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">法力值</span>
          <span className="status-value">{Math.floor(gameState.resources.qi)} / {gameState.cultivation.qiCapacity}</span>
        </div>
        
        <div className="status-item">
          <span className="status-label">修炼速度</span>
          <span className="status-value">{Math.floor(gameState.cultivation.cultivationSpeed)}/秒</span>
        </div>
      </div>
      
      {/* 经验进度条 */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>经验进度</span>
          <span>{Math.floor(cultivationProgress)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${Math.floor(cultivationProgress)}%` }}
          ></div>
        </div>
      </div>
      
      {/* 法力值进度条 */}
      <div style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <span>法力值储存</span>
          <span>{Math.floor(qiProgress)}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill qi-effect"
            style={{ 
              width: `${Math.floor(qiProgress)}%`,
              background: 'linear-gradient(90deg, #4fc3f7, #0288d1)'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};