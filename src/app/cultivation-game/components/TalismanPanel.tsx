import React from 'react';
import { GameState, Talisman, TalismanRecipe } from '../types';
import { getCultivationLevelName, getMaterialName } from '../utils';

interface TalismanPanelProps {
  gameState: GameState;
  onStartCraft: (recipeId: string) => void;
  onUseTalisman: (talismanId: string) => void;
  onSellTalisman: (talismanId: string) => void;
}

export default function TalismanPanel({
  gameState,
  onStartCraft,
  onUseTalisman,
  onSellTalisman
}: TalismanPanelProps) {
  const { talisman } = gameState;
  // 添加标签页切换功能
  const [activeTab, setActiveTab] = React.useState<'craft' | 'inventory'>('craft');

  // 获取符箓类型的中文名称
  const getTalismanTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
      attack: '攻击',
      defense: '防御',
      cultivation: '修炼',
      exploration: '探险',
      utility: '辅助'
    };
    return typeNames[type] || type;
  };

  // 获取符箓稀有度的颜色类名
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return 'text-gray-400';
      case 'rare':
        return 'text-blue-400';
      case 'epic':
        return 'text-purple-400';
      case 'legendary':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };



  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-yellow-400">符箓系统</h2>
      
      {/* 符箓制作技能信息 */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
        <h3 className="font-semibold mb-2">符箓制作技能</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>等级: {talisman.skillLevel}</div>
          <div>经验: {Math.floor(talisman.skillExp)}/{talisman.maxSkillExp}</div>
          <div>成功率: {(talisman.successCount / Math.max(talisman.successCount + talisman.failedCount, 1) * 100).toFixed(1)}%</div>
          <div>制作次数: {talisman.successCount + talisman.failedCount}</div>
        </div>
      </div>
      
      {/* 制作进度 */}
      {talisman.isCrafting && talisman.currentTalisman && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">制作中</h3>
          <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${talisman.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300">进度: {Math.round(talisman.progress || 0)}%</p>
        </div>
      )}
      
      {/* 激活的符箓 */}
      {talisman.activeTalismans.length > 0 && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">激活的符箓</h3>
          <div className="space-y-2">
            {talisman.activeTalismans.map((activeTalisman, index) => {
              const remainingTime = Math.ceil((activeTalisman.talisman.duration * 1000 - (Date.now() - activeTalisman.startTime)) / 1000);
              return (
                <div key={index} className="p-2 bg-gray-600 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{activeTalisman.talisman.name}</span>
                    <span className="text-xs text-gray-400">剩余: {remainingTime}秒</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {activeTalisman.talisman.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* 标签页导航 */}
      <div className="mb-4">
        <div className="flex border-b border-gray-600">
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'craft' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
            onClick={() => setActiveTab('craft')}
          >
            制作符箓
          </button>
          <button 
            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'inventory' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
            onClick={() => setActiveTab('inventory')}
          >
            符箓背包
          </button>
        </div>
      </div>
      
      {/* 制作符箓 */}
      {activeTab === 'craft' && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">可制作的符箓</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {talisman.recipes.map(recipe => (
              <div 
                key={recipe.id} 
                className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-blue-400">{recipe.name}</h4>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${recipe.baseSuccessRate > 0.7 ? 'bg-green-700' : recipe.baseSuccessRate > 0.4 ? 'bg-yellow-700' : 'bg-red-700'}`}>
                    {Math.round(recipe.baseSuccessRate * 100)}% 成功率
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 mb-2">{recipe.description}</p>
                
                {/* 制作信息 */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-2">
                  <div>时间: {recipe.duration}秒</div>
                  <div>经验: +{recipe.expGain}</div>
                  <div>需求境界: {getCultivationLevelName(recipe.requiredLevel)}</div>
                  <div>技能等级: {Math.max(1, recipe.requiredLevel.split('_')[1] as unknown as number)}</div>
                </div>
                
                {/* 材料需求 */}
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-300 mb-1">所需材料:</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ingredient, index) => {
                      // 检查材料是否足够
                      const hasEnough = () => {
                        if (ingredient.id === 'pills') {
                          return gameState.resources.pills.length >= ingredient.quantity;
                        } else {
                          return (gameState.resources as any)[ingredient.id] >= ingredient.quantity;
                        }
                      };
                      
                      return (
                        <span 
                          key={index} 
                          className={`px-2 py-0.5 bg-gray-600 rounded text-xs ${hasEnough() ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {getMaterialName(ingredient.id)}: {ingredient.quantity}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                {/* 制作按钮 */}
                <div className="flex justify-end">
                  <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition-colors"
                    onClick={() => onStartCraft(recipe.id)}
                  >
                    开始制作
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 符箓背包 */}
      {activeTab === 'inventory' && (
        <div>
          <h3 className="font-semibold mb-2">符箓背包</h3>
          {talisman.inventory.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              背包中没有符箓
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {talisman.inventory.map((talismanItem, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-medium ${getRarityColor(talismanItem.rarity)}`}>{talismanItem.name}</h4>
                      <span className="text-xs text-gray-400">{getTalismanTypeName(talismanItem.type)}</span>
                    </div>
                    <span className="text-xs text-gray-400">价值: {talismanItem.value}灵石</span>
                  </div>
                  
                  <p className="text-xs text-gray-300 mb-2">{talismanItem.description}</p>
                  
                  {/* 符箓效果 */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-300 mb-1">效果:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(talismanItem.effect).map(([effectName, value]) => {
                        // 转换效果名称为中文
                        const effectNames: Record<string, string> = {
                          attackBoost: '攻击力提升',
                          defenseBoost: '防御力提升',
                          cultivationSpeedBoost: '修炼速度提升',
                          qiGatherRateBoost: '灵气采集速度提升',
                          explorationSuccessRateBoost: '探险成功率提升',
                          damageReduction: '伤害减免'
                        };
                        
                        return (
                          <span 
                            key={effectName} 
                            className="px-2 py-0.5 bg-green-700 rounded text-xs"
                          >
                            {effectNames[effectName] || effectName}: +{(value as number * 100).toFixed(0)}%
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 符箓属性 */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300 mb-3">
                    <div>持续时间: {talismanItem.duration}秒</div>
                    <div>冷却时间: {talismanItem.cooldown}秒</div>
                  </div>
                  
                  {/* 操作按钮 */}
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-semibold transition-colors"
                      onClick={() => onUseTalisman(talismanItem.id)}
                    >
                      使用
                    </button>
                    <button
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-semibold transition-colors"
                      onClick={() => onSellTalisman(talismanItem.id)}
                    >
                      出售
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
