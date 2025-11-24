'use client'

import React from 'react';
import { GameState, ForgeBlueprint } from '../types';

interface ForgePanelProps {
  gameState: GameState;
  onStartForge: (blueprintId: string) => void;
}

export const ForgePanel: React.FC<ForgePanelProps> = ({
  gameState,
  onStartForge
}) => {
  // 获取炼器状态
  const forgeState = gameState.forge;
  const isForging = forgeState?.isForging;
  const currentProgress = forgeState?.progress || 0;
  
  // 获取可用的炼器图谱
  const availableBlueprints = forgeState?.blueprints || [];

  // 检查是否有足够的材料来炼制某个图谱
  const hasEnoughMaterials = (blueprint: ForgeBlueprint): boolean => {
    if (!blueprint.ingredients || !gameState.resources) return false;
    
    return blueprint.ingredients.every(ingredient => {
      const currentAmount = gameState.resources[ingredient.materialId as keyof typeof gameState.resources] || 0;
      return currentAmount >= ingredient.quantity;
    });
  };

  return (
    <div className="game-panel">
      <h3 className="panel-title">⚒️ 炼器系统</h3>
      
      {isForging ? (
        // 炼器中的界面
        <div className="forge-in-progress">
          <h4>正在炼制装备</h4>
          <div className="forge-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill forge-fill"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
            <div className="progress-text">{Math.round(currentProgress)}%</div>
          </div>
        </div>
      ) : (
        // 非炼器状态界面
        <div className="forge-available">
          <h4>可用图谱</h4>
          <div className="blueprints-list">
            {availableBlueprints.length > 0 ? (
              availableBlueprints.map(blueprint => (
                <div key={blueprint.id} className="blueprint-card">
                  <h5>{blueprint.name}</h5>
                  <div className="blueprint-info">
                    <div>所需境界: {blueprint.requiredLevel}</div>
                    <div>成功率: {Math.round(blueprint.successRate * 100)}%</div>
                    <div>经验获得: {blueprint.expGain}</div>
                    
                    <div className="ingredients-list">
                      <strong>所需材料:</strong>
                      <ul>
                        {blueprint.ingredients.map((ingredient, index) => (
                          <li key={index}>
                            {ingredient.materialId}: {ingredient.quantity}
                            <span className={
                              (gameState.resources[ingredient.materialId as keyof typeof gameState.resources] || 0) >= ingredient.quantity
                                ? ' (充足)'
                                : ' (不足)'
                            }></span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button 
                    className="btn btn-small btn-primary"
                    onClick={() => onStartForge(blueprint.id)}
                    disabled={!hasEnoughMaterials(blueprint)}
                  >
                    开始炼制
                  </button>
                </div>
              ))
            ) : (
              <div className="no-blueprints">当前没有可用的炼器图谱</div>
            )}
          </div>
          
          <div className="forge-stats">
            <div>成功次数: {forgeState?.successCount || 0}</div>
            <div>失败次数: {forgeState?.failedCount || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};