'use client'

import React from 'react';
import { GameState, ForgeBlueprint, CultivationLevel } from '../types';
import { getMaterialName, getCultivationLevelName } from '../utils';

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
      const resource = gameState.resources[ingredient.materialId as keyof typeof gameState.resources] || 0;
      // 如果资源是pills数组，则使用长度，否则使用数值
      const currentAmount = ingredient.materialId === 'pills' && Array.isArray(resource) ? resource.length : Number(resource);
      return currentAmount >= ingredient.quantity;
    });
  };

  return (
    <div className="game-panel bg-slate-900 p-6 rounded-lg shadow-xl">
      <h3 className="panel-title text-xl font-semibold text-purple-200 mb-6">⚒️ 炼器系统</h3>
      
      {isForging ? (
        // 炼器中的界面
        <div className="forge-in-progress bg-slate-800 p-6 rounded-lg">
          <h4 className="text-lg font-medium text-purple-200 mb-4">正在炼制装备</h4>
          <div className="forge-progress">
            <div className="progress-bar bg-slate-700 h-4 rounded-full mb-2">
              <div 
                className="progress-fill forge-fill bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${currentProgress}%` }}
              ></div>
            </div>
            <div className="progress-text text-purple-200 text-center font-medium">{Math.round(currentProgress)}%</div>
          </div>
        </div>
      ) : (
        // 非炼器状态界面
        <div className="forge-available">
          <h4 className="text-lg font-medium text-purple-200 mb-4">可用图谱</h4>
          
          {availableBlueprints.length > 0 ? (
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">图谱名称</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">所需境界</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">成功率</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">经验获得</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">所需材料</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {availableBlueprints.map(blueprint => (
                    <tr key={blueprint.id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="px-4 py-3 text-white border-b border-slate-600 font-medium">{blueprint.name}</td>
                      <td className="px-4 py-3 text-purple-200 border-b border-slate-600">{getCultivationLevelName(blueprint.requiredLevel as CultivationLevel)}</td>
                      <td className="px-4 py-3 text-purple-200 border-b border-slate-600">{Math.round(blueprint.successRate * 100)}%</td>
                      <td className="px-4 py-3 text-white border-b border-slate-600">{blueprint.expGain}</td>
                      <td className="px-4 py-3 text-purple-200 border-b border-slate-600">
                        <div className="ingredients-list">
                          {blueprint.ingredients.map((ingredient, index) => {
                            const resource = gameState.resources[ingredient.materialId as keyof typeof gameState.resources] || 0;
                            // 如果资源是pills数组，则使用长度，否则使用数值
                            const currentAmount = ingredient.materialId === 'pills' && Array.isArray(resource) ? resource.length : Number(resource);
                            const hasEnough = currentAmount >= ingredient.quantity;
                            return (
                              <div key={index} className="flex justify-between">
                                <span>{getMaterialName(ingredient.materialId)}:</span>
                                <span className={hasEnough ? 'text-green-400' : 'text-red-400'}>
                                  {ingredient.quantity} ({currentAmount}/{ingredient.quantity})
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-b border-slate-600">
                        <button 
                          className={`bg-gradient-to-r ${hasEnoughMaterials(blueprint) ? 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' : 'from-slate-600 to-slate-500'} text-white px-4 py-2 rounded transition-all duration-300`}
                          onClick={() => onStartForge(blueprint.id)}
                          disabled={!hasEnoughMaterials(blueprint)}
                        >
                          开始炼制
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-blueprints bg-slate-800 p-6 rounded-lg text-center text-purple-200 mb-6">
              当前没有可用的炼器图谱
            </div>
          )}
          
          <div className="forge-stats bg-slate-800 p-4 rounded-lg grid grid-cols-2 gap-4">
            <div className="stat-item">
              <span className="text-purple-300">成功次数:</span>
              <span className="text-white font-medium ml-2">{forgeState?.successCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="text-purple-300">失败次数:</span>
              <span className="text-white font-medium ml-2">{forgeState?.failedCount || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};