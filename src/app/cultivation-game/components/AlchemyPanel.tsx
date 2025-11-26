import React from 'react';
import { GameState, AlchemyRecipe, Pill, CultivationLevel } from '../types';
import { pills } from '../data/pills';
import { getMaterialName, getCultivationLevelName } from '../utils';

interface AlchemyPanelProps {
  gameState: GameState;
  onStartAlchemy: (recipeId: string) => void;
}

const AlchemyPanel: React.FC<AlchemyPanelProps> = ({ gameState, onStartAlchemy }) => {
  const { alchemy, resources, cultivation } = gameState;

  // 获取所有可用的丹药数据
  const getPillInfo = (pillId: string): Pill | undefined => {
    return pills.find(pill => pill.id === pillId);
  };

  // 检查玩家是否有足够的材料
  const hasEnoughMaterials = (recipe: AlchemyRecipe): boolean => {
    return recipe.ingredients.every(ingredient => {
      const resource = resources[ingredient.id as keyof typeof resources] || 0;
      // 如果资源是pills数组，则使用长度，否则使用数值
      const currentAmount = ingredient.id === 'pills' && Array.isArray(resource) ? resource.length : Number(resource);
      return currentAmount >= ingredient.quantity;
    });
  };

  // 检查玩家是否达到炼丹所需的修真等级
  const meetsLevelRequirement = (recipe: AlchemyRecipe): boolean => {
    const levelOrder: CultivationLevel[] = [
      'qi_refining_1', 'qi_refining_2', 'qi_refining_3',
      'foundation_1', 'foundation_2', 'foundation_3',
      'golden_core_1', 'golden_core_2', 'golden_core_3',
      'nascent_soul_1', 'nascent_soul_2', 'nascent_soul_3',
      'spirit_transformation_1', 'spirit_transformation_2', 'spirit_transformation_3'
    ];

    const playerLevelIndex = levelOrder.indexOf(cultivation.level);
    const requiredLevelIndex = levelOrder.indexOf(recipe.requiredLevel);

    return playerLevelIndex >= requiredLevelIndex;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-center text-yellow-400">炼丹系统</h2>
      
      {/* 炼丹进度 */}
      {alchemy && alchemy.isBrewing && (
        <div className="mb-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">炼丹中</h3>
          <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
            <div 
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${alchemy.progress || 0}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-300">进度: {Math.round(alchemy.progress || 0)}%</p>
        </div>
      )}

      {/* 炼丹配方列表 */}
      <div className="max-h-96 overflow-y-auto pr-2">
        {alchemy?.recipes && alchemy.recipes.filter(recipe => meetsLevelRequirement(recipe)).length > 0 ? (
          <div className="space-y-3">
            {alchemy?.recipes && alchemy.recipes.filter(recipe => meetsLevelRequirement(recipe)).map(recipe => {
              const pillInfo = getPillInfo(recipe.pills[0]);
              const isCurrentlyBrewing = alchemy?.isBrewing || false;
              const isThisRecipeBrewing = isCurrentlyBrewing && alchemy?.currentRecipe?.id === recipe.id;
              const hasMaterials = hasEnoughMaterials(recipe);
              // 直接使用meetsLevelRequirement的结果，避免重复定义变量
              const canCraft = hasMaterials && meetsLevelRequirement(recipe) && (!isCurrentlyBrewing || isThisRecipeBrewing);
              
              return (
                <div 
                  key={recipe.id} 
                  className="p-3 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-green-400">{pillInfo?.name}</h3>
                      <p className="text-xs text-gray-400">{pillInfo?.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${recipe.baseSuccessRate > 0.7 ? 'bg-green-700' : recipe.baseSuccessRate > 0.4 ? 'bg-yellow-700' : 'bg-red-700'}`}>
                      {Math.round(recipe.baseSuccessRate * 100)}% 成功率
                    </span>
                  </div>
                  
                  {/* 材料需求 */}
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-300 mb-1">材料需求:</p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.ingredients.map((ingredient, idx) => {
                        const resource = resources[ingredient.id as keyof typeof resources] || 0;
                        // 如果资源是pills数组，则使用长度，否则使用数值
                        const currentAmount = ingredient.id === 'pills' && Array.isArray(resource) ? resource.length : Number(resource);
                        const isEnough = currentAmount >= ingredient.quantity;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`px-2 py-1 rounded text-xs ${isEnough ? 'bg-gray-600 text-gray-200' : 'bg-gray-800 text-red-300'}`}
                          >
                            {getMaterialName(ingredient.id)}: {currentAmount}/{ingredient.quantity}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* 其他信息 */}
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                    <span>炼制时间: {recipe.duration}秒</span>
                    <span>等级要求: {getCultivationLevelName(recipe.requiredLevel)}</span>
                  </div>
                  
                  {/* 开始炼丹按钮 */}
                  <button
                    onClick={() => onStartAlchemy(recipe.id)}
                    disabled={!canCraft}
                    className={`w-full py-2 rounded font-semibold transition-all ${canCraft ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                  >
                    {(alchemy && alchemy.isBrewing && alchemy.currentRecipe && alchemy.currentRecipe.id === recipe.id) ? '正在炼制中' : 
                    (alchemy && alchemy.isBrewing) ? '丹炉正在使用中' : 
                    (canCraft ? '开始炼丹' : 
                    (!hasMaterials ? '材料不足' : '无法炼制'))}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">
            <p>暂无可用的炼丹配方</p>
            <p className="text-xs mt-1">提升修真境界以解锁更多配方</p>
          </div>
        )}
      </div>

      {/* 炼丹统计 */}
      {alchemy && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2 text-gray-300">炼丹统计</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">成功次数:</span>
              <span className="text-green-400">{alchemy.successCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">失败次数:</span>
              <span className="text-red-400">{alchemy.failedCount}</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-gray-400">总成功率:</span>
              <span className="text-yellow-400">
                {alchemy.successCount + alchemy.failedCount > 0 ? 
                  Math.round((alchemy.successCount / (alchemy.successCount + alchemy.failedCount)) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlchemyPanel;