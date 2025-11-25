'use client'

import React from 'react';
import { GameState, Equipment } from '../types';

interface InventoryPanelProps {
  gameState: GameState;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ gameState }) => {
  // 计算总属性加成
  const calculateTotalBonuses = () => {
    const bonuses = {
      qiCapacity: 0,
      cultivationSpeed: 0,
      qiGatherRate: 0
    };
    
    if (gameState.equipment) {
      gameState.equipment.forEach(item => {
        if (item.effects.qiCapacity) bonuses.qiCapacity += item.effects.qiCapacity;
        if (item.effects.cultivationSpeed) bonuses.cultivationSpeed += item.effects.cultivationSpeed;
        if (item.effects.qiGatherRate) bonuses.qiGatherRate += item.effects.qiGatherRate;
      });
    }
    
    return bonuses;
  };

  const totalBonuses = calculateTotalBonuses();

  // 获取装备图标
  const getEquipmentIcon = (type: string) => {
    switch (type) {
      case 'armor':
        return '🛡️';
      case 'weapon':
        return '⚔️';
      case 'accessory':
        return '💍';
      case 'shoes':
        return '👟';
      default:
        return '📦';
    }
  };

  // 格式化属性效果文本
  const formatEffect = (effectName: string, value: number) => {
    const effectNames = {
      qiCapacity: '灵气上限',
      cultivationSpeed: '修炼速度',
      qiGatherRate: '灵气采集速率'
    };
    
    return `${effectNames[effectName as keyof typeof effectNames]} +${value}${effectName === 'cultivationSpeed' || effectName === 'qiGatherRate' ? 'x' : ''}`;
  };

  return (
    <div className="panel">
      <h2 className="panel-title">装备与物品</h2>
      
      {/* 装备列表 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>已装备</h3>
        
        {gameState.equipment.length > 0 ? (
          <div className="equipment-list">
            {gameState.equipment.map((item: Equipment) => (
              <div key={item.id} className="equipment-item">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                    {getEquipmentIcon(item.type)}
                  </span>
                  <div>
                    <div className="equipment-name">{item.name}</div>
                    <div className="equipment-level">等级 {item.level}</div>
                  </div>
                </div>
                <div className="equipment-effects">
                  {Object.entries(item.effects).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: '0.25rem' }}>
                      {formatEffect(key, value as number)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
            暂无装备
          </div>
        )}
      </div>
      
      {/* 总属性加成 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>总属性加成</h3>
        <div className="status-info">
          <div className="status-item">
            <span className="status-label">灵气上限加成</span>
            <span className="status-value" style={{ color: '#4fc3f7' }}>+{totalBonuses.qiCapacity}</span>
          </div>
          <div className="status-item">
            <span className="status-label">修炼速度加成</span>
            <span className="status-value" style={{ color: '#4fc3f7' }}>+{Math.floor(totalBonuses.cultivationSpeed * 100)}%</span>
          </div>
          <div className="status-item">
            <span className="status-label">灵气采集加成</span>
            <span className="status-value" style={{ color: '#4fc3f7' }}>+{Math.floor(totalBonuses.qiGatherRate * 100)}%</span>
          </div>
        </div>
      </div>
      
      {/* 资源面板 */}
      <div>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>资源储备</h3>
        <div className="resource-list">
          <div className="resource-item">
            <div className="resource-icon">💰</div>
            <div className="resource-name">灵石</div>
            <div className="resource-value">{gameState.resources.gold}</div>
          </div>
          <div className="resource-item">
            <div className="resource-icon">⚗️</div>
            <div className="resource-name">丹药</div>
            <div className="resource-value">{gameState.resources.pills}</div>
          </div>
          <div className="resource-item">
            <div className="resource-icon">🍎</div>
            <div className="resource-name">灵果</div>
            <div className="resource-value">{gameState.resources.spiritFruit}</div>
          </div>
          <div className="resource-item">
            <div className="resource-icon">🧪</div>
            <div className="resource-name">材料</div>
            <div className="resource-value">{gameState.resources.materials}</div>
          </div>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem', textAlign: 'center' }}>
          材料可用于将来的装备锻造和升级
        </p>
      </div>
    </div>
  );
};