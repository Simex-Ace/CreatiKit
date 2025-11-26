import React from 'react';
import { GameState, ExplorationArea, CultivationLevel } from '../types';
import { getCultivationLevelName, getMaterialName } from '../utils';

interface ExplorationPanelProps {
  gameState: GameState;
  onStartExploration: (areaId: string) => void;
  onCancelExploration: () => void;
}

const ExplorationPanel: React.FC<ExplorationPanelProps> = ({ gameState, onStartExploration, onCancelExploration }) => {
  const { exploration, cultivation } = gameState;

  // 检查玩家是否达到探险所需的修真等级
  const meetsLevelRequirement = (area: ExplorationArea): boolean => {
    const levelOrder: CultivationLevel[] = [
      'qi_refining_1', 'qi_refining_2', 'qi_refining_3',
      'foundation_1', 'foundation_2', 'foundation_3',
      'golden_core_1', 'golden_core_2', 'golden_core_3',
      'nascent_soul_1', 'nascent_soul_2', 'nascent_soul_3',
      'spirit_transformation_1', 'spirit_transformation_2', 'spirit_transformation_3'
    ];

    const playerLevelIndex = levelOrder.indexOf(cultivation.level);
    const requiredLevelIndex = levelOrder.indexOf(area.requiredLevel);

    return playerLevelIndex >= requiredLevelIndex;
  };

  // 检查区域是否处于冷却中
  const isOnCooldown = (areaId: string): boolean => {
    const cooldownTime = exploration.areaCooldowns[areaId] || 0;
    return Date.now() < cooldownTime;
  };

  // 获取区域冷却剩余时间
  const getCooldownRemaining = (areaId: string): number => {
    const cooldownTime = exploration.areaCooldowns[areaId] || 0;
    return Math.max(0, Math.ceil((cooldownTime - Date.now()) / 1000));
  };

  // 检查是否可以开始探险
  const canExplore = (area: ExplorationArea): boolean => {
    const isCurrentlyExploring = exploration.isExploring;
    const isThisAreaExploring = isCurrentlyExploring && exploration.currentExploration?.areaId === area.id;
    const meetsLevel = meetsLevelRequirement(area);
    const onCooldown = isOnCooldown(area.id);

    return meetsLevel && !onCooldown && (!isCurrentlyExploring || isThisAreaExploring);
  };

  // 获取区域难度颜色
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'normal':
        return 'text-blue-400';
      case 'hard':
        return 'text-orange-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // 获取中文难度文本
  const getDifficultyText = (difficulty: string): string => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'normal':
        return '普通';
      case 'hard':
        return '困难';
      case 'epic':
        return '史诗';
      case 'legendary':
        return '传奇';
      default:
        return difficulty;
    }
  };

  // 获取区域类型图标
  const getAreaTypeIcon = (type: string): string => {
    switch (type) {
      case 'mountain':
        return '⛰️';
      case 'forest':
        return '🌲';
      case 'cave':
        return '🕳️';
      case 'ruins':
        return '🏛️';
      case 'lake':
        return '🏞️';
      case 'desert':
        return '🏜️';
      case 'sky':
        return '☁️';
      case 'hell':
        return '🔥';
      default:
        return '📌';
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-yellow-400">探险系统</h2>
      
      {/* 最近探险记录 */}
      {exploration.explorationHistory.length > 0 && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">最近探险</h3>
          <div className="text-sm text-gray-300 max-h-32 overflow-y-auto">
            {exploration.explorationHistory.slice(-5).reverse().map((history, index) => (
              <div key={index} className="mb-2 pb-2 border-b border-gray-600 last:border-0 last:mb-0 last:pb-0">
                <p className="font-medium">{history.areaName}</p>
                <p className="text-xs text-gray-400">{new Date(history.timestamp).toLocaleString()}</p>
                {history.eventText && (
                  <p className="italic mt-1">{history.eventText}</p>
                )}
                <div className="mt-1 text-xs">
                  获得: {history.rewards ? Object.entries(history.rewards).map(([resource, amount]) => {
                    // 处理数组类型的奖励（equipment、pills）
                    if (Array.isArray(amount)) {
                      // 跳过空数组
                      if (amount.length === 0) {
                        return null;
                      }
                       
                      // 统计每种物品/丹药的数量
                      const itemCounts: Record<string, number> = {};
                      amount.forEach(itemId => {
                        itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
                      });
                       
                      // 获取中文名称
                      const resourceType = resource === 'equipment' ? '装备' : resource === 'pills' ? '丹药' : '其他';
                      
                      // 显示每种物品/丹药的数量
                      return Object.entries(itemCounts).map(([itemId, count]) => {
                        // 使用现有的getMaterialName函数获取中文名称
                        const itemName = getMaterialName(itemId) || itemId;
                        return (
                          <span key={itemId} className="inline-block mr-2">
                            {itemName}: +{count}
                          </span>
                        );
                      });
                    }
                    
                    // 使用现有的getMaterialName函数获取中文名称
                    const chineseName = resource === 'gold' ? '金币' : 
                                      resource === 'qi' ? '灵气' :
                                      resource === 'exp' ? '经验' :
                                      resource === 'reputation' ? '声望' :
                                      getMaterialName(resource);
                    return (
                      <span key={resource} className="inline-block mr-2">
                        {chineseName}: +{amount}
                      </span>
                    );
                  }).filter(Boolean) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 探险进度 */}
      {exploration && exploration.isExploring && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">探险中</h3>
          <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${exploration.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300">进度: {Math.round(exploration.progress || 0)}%</p>
          
          {/* 探险过程文本 */}
          <div className="mt-3 p-2 bg-gray-800 rounded text-sm text-gray-200 italic">
            {exploration.currentExploration && exploration.currentExploration.eventText ? (
              exploration.currentExploration.eventText
            ) : (
              '你正在探索...'
            )}
          </div>
        </div>
      )}

      {/* 探险区域列表 */}
      <div className="max-h-96 overflow-y-auto pr-2">
        {exploration.areas.filter(area => meetsLevelRequirement(area)).length > 0 ? (
          <div className="space-y-3">
            {exploration.areas
              .filter(area => meetsLevelRequirement(area))
              .map(area => {
                const canStartExploration = canExplore(area);
                const onCooldown = isOnCooldown(area.id);
                const remainingCooldown = getCooldownRemaining(area.id);

                return (
                  <div 
                    key={area.id} 
                    className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getAreaTypeIcon(area.type)}</span>
                        <h3 className="font-semibold text-blue-400">{area.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getDifficultyColor(area.difficulty)}`}>
                          {getDifficultyText(area.difficulty)}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${area.baseSuccessRate > 0.7 ? 'bg-green-700' : area.baseSuccessRate > 0.4 ? 'bg-yellow-700' : 'bg-red-700'}`}>
                        {Math.round(area.baseSuccessRate * 100)}% 成功率
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2">{area.description}</p>
                    
                    {/* 探险信息 */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-2">
                      <div>时间: {area.duration}秒</div>
                      <div>经验: +{area.rewards.exp}</div>
                      <div>声望: +{area.rewards.reputation || 0}</div>
                      <div>需求境界: {getCultivationLevelName(area.requiredLevel)}</div>
                    </div>

                    {/* 资源奖励预览 */}
                    {area.rewards.resources && (
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-300 mb-1">可能获得:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(area.rewards.resources).map(([resourceName, range]) => {
                            // 使用现有的getMaterialName函数获取中文名称
                            const chineseName = resourceName === 'gold' ? '金币' : 
                                              resourceName === 'qi' ? '灵气' :
                                              resourceName === 'exp' ? '经验' :
                                              resourceName === 'reputation' ? '声望' :
                                              getMaterialName(resourceName);
                            return (
                              <span 
                                key={resourceName} 
                                className="px-2 py-0.5 bg-gray-600 rounded text-xs"
                              >
                                {chineseName}: {range.min}-{range.max}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 探险按钮 */}
                    <div className="flex justify-end">
                      {onCooldown ? (
                        <button 
                          className="px-3 py-1 bg-gray-600 rounded text-sm font-semibold text-gray-400 cursor-not-allowed"
                          disabled
                        >
                          冷却中 ({remainingCooldown}s)
                        </button>
                      ) : (
                        <button
                          className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${exploration.isExploring && exploration.currentExploration?.areaId === area.id ? 'bg-red-600 hover:bg-red-700 text-white' : canStartExploration ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
                          onClick={() => exploration.isExploring && exploration.currentExploration?.areaId === area.id ? onCancelExploration() : onStartExploration(area.id)}
                          disabled={!canStartExploration}
                        >
                          {exploration.isExploring && exploration.currentExploration?.areaId === area.id ? '取消探险' : '开始探险'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center p-4 text-gray-400">
            <p>暂无可用的探险区域</p>
            <p className="text-xs mt-2">提升你的修真境界以解锁更多区域</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorationPanel;
