'use client'

import React, { useState } from 'react';
import { GameState } from '../types';

interface ActionPanelProps {
  gameState: GameState;
  onAction: (action: string, params?: any) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({ gameState, onAction }) => {
  const handleAction = (action: string, params?: any) => {
    console.log(`ActionPanel handleAction called: ${action}`, params);
    onAction(action, params);
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
          <div style={{ marginBottom: '0.5rem', color: '#f5d76e' }}>剩余: {gameState.resources.pills.length}</div>
          <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={() => handleAction('usePill')}
              disabled={gameState.resources.pills.length <= 0}
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
        
        <div className="action-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '150px' }}>
          <div className="action-title">突破境界</div>
          <div className="action-description">尝试突破当前境界，需要足够经验</div>
          <div style={{ marginBottom: '0.5rem', color: '#f5d76e' }}>
            当前经验: {Math.floor(gameState.cultivation.exp)} / {gameState.cultivation.maxExp}
          </div>
          <div style={{ marginTop: 'auto', paddingBottom: '16px' }}>
            <button 
              className="btn" 
              onClick={() => handleAction('breakthrough')}
              style={{ background: 'linear-gradient(135deg, #ff9800, #f57c00)' }}
            >
              突破境界
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
      
      {/* 修真坊市 */}
      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '1rem' }}>修真坊市</h3>
        <style jsx>{`
          /* 横向布局样式 */
          .shop-panel {
            display: flex;
            overflow-x: auto;
            gap: 1rem;
            padding: 0.5rem 0;
            scrollbar-width: thin;
            scrollbar-color: rgba(245, 215, 110, 0.5) rgba(0, 0, 0, 0.3);
          }
          
          .shop-panel::-webkit-scrollbar {
            height: 6px;
          }
          
          .shop-panel::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 3px;
          }
          
          .shop-panel::-webkit-scrollbar-thumb {
            background: rgba(245, 215, 110, 0.5);
            border-radius: 3px;
          }
          
          .item-card {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid #f5d76e;
            border-radius: 8px;
            min-width: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 0.75rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: transform 0.2s ease;
          }
          
          .item-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
          }
          
          .item-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
          }
          
          .item-name {
            color: #fff;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          
          .item-price {
            color: #f5d76e;
            margin-bottom: 1rem;
            font-size: 0.9rem;
          }
          
          .item-actions {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            width: 100%;
          }
          
          /* 按钮样式与其他板块保持一致 */
          .btn-buy {
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .btn-buy:hover {
            background: linear-gradient(135deg, #45a049, #388e3c);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          }
          
          .btn-sell {
            background: linear-gradient(135deg, #2196f3, #0b7dda);
            color: white;
            padding: 0.4rem 0.8rem;
            font-size: 0.85rem;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          
          .btn-sell:hover {
            background: linear-gradient(135deg, #0b7dda, #0d47a1);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
          }
          
          /* 当前灵石卡片样式 */
          .gold-card {
            background-color: rgba(245, 215, 110, 0.1);
            border-color: #ffd700;
          }
        `}</style>
        <div className="shop-panel">
          <div className="item-card">
            <div className="item-icon">⚗️</div>
            <div className="item-name">培元丹</div>
            <div className="item-price">20 灵石/个</div>
            <div className="item-actions">
              <button 
                className="btn btn-buy"
                onClick={() => handleAction('buyItem', { type: 'pills', quantity: 1 })}
                disabled={gameState.resources.spiritStone < 20}
              >
                购买
              </button>
              <button 
                className="btn btn-sell"
                onClick={() => handleAction('sellResource', { type: 'pills', quantity: 1 })}
                disabled={!gameState.resources.pills || gameState.resources.pills.length < 1}
              >
                出售 (10)
              </button>
            </div>
          </div>
          
          <div className="item-card">
            <div className="item-icon">🍎</div>
            <div className="item-name">灵果</div>
            <div className="item-price">50 灵石/个</div>
            <div className="item-actions">
              <button 
                className="btn btn-buy"
                onClick={() => handleAction('buyItem', { type: 'spiritFruit', quantity: 1 })}
                disabled={gameState.resources.spiritStone < 50}
              >
                购买
              </button>
              <button 
                className="btn btn-sell"
                onClick={() => handleAction('sellResource', { type: 'spiritFruit', quantity: 1 })}
                disabled={!gameState.resources.spiritFruit || gameState.resources.spiritFruit < 1}
              >
                出售 (25)
              </button>
            </div>
          </div>
          
          <div className="item-card gold-card">
            <div className="item-icon">💰</div>
            <div className="item-name">当前灵石</div>
            <div className="item-price">{gameState.resources.spiritStone}</div>
          </div>
        </div>
      </div>
      

    </div>
  );
};