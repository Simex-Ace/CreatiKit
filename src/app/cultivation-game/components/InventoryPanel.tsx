'use client'

import React from 'react';
import { GameState, Equipment, Pill } from '../types';
import { getQualityName } from '../utils';

interface InventoryPanelProps {
  gameState: GameState;
  onAction: (action: string, params?: any) => void;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ gameState, onAction }) => {
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
      default:
        return '📦';
    }
  };

  // 格式化属性效果文本
  const formatEffect = (effectName: string, value: number) => {
    const effectNames = {
      qiCapacity: '法力值上限',
      cultivationSpeed: '修炼速度',
      qiGatherRate: '法力值恢复速率'
    };
    
    return `${effectNames[effectName as keyof typeof effectNames]} +${value}${effectName === 'cultivationSpeed' || effectName === 'qiGatherRate' ? 'x' : ''}`;
  };

  // 获取丹药效果的简短描述
  const getPillShortEffect = (pill: Pill) => {
    if (!pill.effect) return '';
    
    const effectNames = {
      cultivationSpeed: '修炼速度',
      breakthroughChance: '突破概率',
      healthRegen: '生命值恢复',
      resourceGatheringSpeed: '资源采集速度',
      poisonResistance: '毒抗',
      qiRegen: '法力值恢复',
      alchemySuccessRate: '炼丹成功率',
      spiritSense: '灵识',
      damageResistance: '伤害减免',
      skillExpBoost: '技能经验加成',
      reputationBoost: '声望加成'
    };
    
    // 只返回第一个效果作为简短描述
    const firstEffect = Object.entries(pill.effect).find(([key, value]) => value);
    if (firstEffect) {
      const [key, value] = firstEffect;
      return `${effectNames[key as keyof typeof effectNames]} +${value}`;
    }
    
    return '';
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
            <span className="status-label">法力值上限加成</span>
            <span className="status-value" style={{ color: '#4fc3f7' }}>+{totalBonuses.qiCapacity}</span>
          </div>
          <div className="status-item">
            <span className="status-label">修炼速度加成</span>
            <span className="status-value" style={{ color: '#4fc3f7' }}>+{Math.floor(totalBonuses.cultivationSpeed * 100)}%</span>
          </div>
          <div className="status-item">
            <span className="status-label">法力值恢复速率加成</span>
            <span className="status-value" style={{ color: '#4fc3f7' }}>+{Math.floor(totalBonuses.qiGatherRate * 100)}%</span>
          </div>
        </div>
      </div>
      
      {/* 丹药列表 */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>丹药</h3>
        {gameState.resources.pills.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem' }}>
            {gameState.resources.pills.map((pill) => (
              <div key={pill.id} className="pill-item" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0.5rem', borderRadius: '8px', border: '1px solid #4a5568', backgroundColor: 'rgba(30, 41, 59, 0.8)' }}>
                  <span style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>⚗️</span>
                  <div className="pill-name" style={{ fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: '0.25rem' }}>{pill.name}</div>
                  <div className="pill-quality" style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{getQualityName(pill.quality)}</div>
                  <div className="pill-effect" style={{ fontSize: '0.8rem', color: '#a5b4fc', textAlign: 'center', marginBottom: '0.5rem' }}>
                    {getPillShortEffect(pill)}
                  </div>
                  <button 
                    onClick={() => onAction('usePill', { pillId: pill.id })} 
                    style={{ 
                      width: '100%', 
                      padding: '0.25rem 0.5rem', 
                      fontSize: '0.8rem', 
                      backgroundColor: '#6d28d9', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#7c3aed')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#6d28d9')}
                  >
                    使用
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
            暂无丹药
          </div>
        )}
      </div>

      {/* 资源面板 */}
      <div>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>资源储备</h3>
        <div className="resource-list">
          <div className="resource-item">
            <div className="resource-icon">💰</div>
            <div className="resource-name">灵石</div>
            <div className="resource-value">{gameState.resources.spiritStone}</div>
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