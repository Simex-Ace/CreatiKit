'use client';

import React, { useState } from 'react';
import { Pet, PetSkill, PetData, GameState, Resources } from '../types';
import { petData } from '../data/pets';

interface PetPanelProps {
  gameState: GameState;
  onCatchPet: (petDataId: string) => void;
  onTrainPet: (petId: string) => void;
  onUpgradePetSkill: (petId: string, skillIndex: number) => void;
  onTogglePetActive: (petId: string) => void;
  onFeedPet: (petId: string) => void;
}

const PetPanel: React.FC<PetPanelProps> = ({
  gameState,
  onCatchPet,
  onTrainPet,
  onUpgradePetSkill,
  onTogglePetActive,
  onFeedPet
}) => {
  const [selectedTab, setSelectedTab] = useState<'myPets' | 'availablePets'>('myPets');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [catchingPet, setCatchingPet] = useState<string | null>(null);

  // 获取用户可以捕捉的宠物列表
  const availablePets = petData.filter(pet => {
    // 检查是否达到解锁等级
    const meetsLevel = () => {
      const levelOrder = [
        'qi_refining_1', 'qi_refining_2', 'qi_refining_3', 'qi_refining_4', 'qi_refining_5',
        'qi_refining_6', 'qi_refining_7', 'qi_refining_8', 'qi_refining_9',
        'foundation_1', 'foundation_2', 'foundation_3', 'foundation_4', 'foundation_5',
        'foundation_6', 'foundation_7', 'foundation_8', 'foundation_9',
        'golden_core_1', 'golden_core_2', 'golden_core_3', 'golden_core_4', 'golden_core_5',
        'golden_core_6', 'golden_core_7', 'golden_core_8', 'golden_core_9',
        'nascent_soul_1', 'nascent_soul_2', 'nascent_soul_3', 'nascent_soul_4', 'nascent_soul_5',
        'nascent_soul_6', 'nascent_soul_7', 'nascent_soul_8', 'nascent_soul_9'
      ];
      const playerLevelIndex = levelOrder.indexOf(gameState.cultivation.level);
      const requiredLevelIndex = levelOrder.indexOf(pet.unlockLevel);
      return playerLevelIndex >= requiredLevelIndex;
    };

    return meetsLevel();
  });

  // 训练宠物的成本
  const calculateTrainingCost = (petLevel: number) => {
    return {
      spiritGrass: 10 * petLevel,
      spiritStone: 5 * petLevel
    };
  };

  // 升级技能的成本
  const calculateSkillUpgradeCost = (skillLevel: number) => {
    return {
      spiritCrystal: 1 + skillLevel,
      pills: 2 + skillLevel
    };
  };

  // 检查资源是否足够
  const hasEnoughResources = (cost: Record<string, number>) => {
    for (const [resource, amount] of Object.entries(cost)) {
      const resourceAmount = gameState.resources[resource as keyof Resources];
      // 如果资源是pills，比较数组长度
      if (resource === 'pills') {
        const currentAmount = Array.isArray(resourceAmount) ? resourceAmount.length : 0;
        if (currentAmount < (amount as number)) {
          return false;
        }
      } else {
        // 其他资源直接比较数值
        if ((resourceAmount as number || 0) < (amount as number)) {
          return false;
        }
      }
    }
    return true;
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 rounded-lg p-4 shadow-xl border border-purple-500/30">
      <h2 className="text-2xl font-bold text-white mb-4">宠物系统</h2>

      {/* 标签页切换 */}
      <div className="flex mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-t-lg ${selectedTab === 'myPets' ? 'bg-purple-700/80 text-white' : 'bg-purple-800/50 text-purple-200'}`}
          onClick={() => {
            setSelectedTab('myPets');
            setSelectedPet(null);
          }}
        >
          我的宠物
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-t-lg ${selectedTab === 'availablePets' ? 'bg-purple-700/80 text-white' : 'bg-purple-800/50 text-purple-200'}`}
          onClick={() => {
            setSelectedTab('availablePets');
            setSelectedPet(null);
          }}
        >
          可捕捉宠物
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="bg-purple-900/50 rounded-lg p-4">
        {selectedTab === 'myPets' && (
          <div>
            {(gameState.pets?.length || 0) === 0 ? (
              <div className="text-center text-purple-200 py-8">
                <p>你还没有任何宠物</p>
                <p className="text-sm mt-2">前往可捕捉宠物标签页，尝试捕捉你的第一个宠物吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 宠物列表 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">宠物列表</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {gameState.pets?.map(pet => (
                      <div
                        key={pet.id}
                        className={`p-3 rounded-lg cursor-pointer ${selectedPet?.id === pet.id ? 'bg-purple-700/80' : 'bg-purple-800/50'} hover:bg-purple-700/70 transition-colors`}
                        onClick={() => setSelectedPet(pet)}
                      >
                        <div className="flex items-center">
                          <div className="text-3xl mr-3">
                            {pet.image}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-white">{pet.name}</p>
                            <p className="text-xs text-purple-200">{pet.type === 'spiritual_animal' ? '灵兽' : pet.type === 'demonic_beast' ? '魔兽' : '神兽'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-purple-200">等级 {pet.level}</p>
                            {pet.active && (
                              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">活跃</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 宠物详情 */}
                {selectedPet && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">宠物详情</h3>
                    <div className="bg-purple-800/50 rounded-lg p-4">
                      <div className="flex justify-center items-center mb-4">
                        <div className="text-5xl">
                          {selectedPet.image}
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">名称</span>
                          <span className="text-white font-medium">{selectedPet.name}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">类型</span>
                          <span className="text-white">
                            {selectedPet.type === 'spiritual_animal' ? '灵兽' : 
                             selectedPet.type === 'demonic_beast' ? '魔兽' : '神兽'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">等级</span>
                          <span className="text-white">{selectedPet.level}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">经验</span>
                          <span className="text-white">{selectedPet.exp}/{selectedPet.maxExp}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-purple-500 h-2.5 rounded-full"
                            style={{ width: `${(selectedPet.exp / selectedPet.maxExp) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">生命值</span>
                          <span className="text-white">{selectedPet.health}/{selectedPet.maxHealth}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">攻击力</span>
                          <span className="text-white">{selectedPet.attack}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">防御力</span>
                          <span className="text-white">{selectedPet.defense}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-purple-200">忠诚度</span>
                          <span className="text-white">{selectedPet.loyalty}/100</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${(selectedPet.loyalty / 100) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">特殊加成</h4>
                        <div className="space-y-1">
                          {selectedPet.specialBonus.cultivationSpeed && (
                            <p className="text-xs text-purple-200">
                              修炼速度 +{(selectedPet.specialBonus.cultivationSpeed * 100).toFixed(0)}%
                            </p>
                          )}
                          {selectedPet.specialBonus.resourceGatheringSpeed && (
                            <p className="text-xs text-purple-200">
                              资源采集速度 +{(selectedPet.specialBonus.resourceGatheringSpeed * 100).toFixed(0)}%
                            </p>
                          )}
                          {selectedPet.specialBonus.battleDamage && (
                            <p className="text-xs text-purple-200">
                              战斗伤害 +{(selectedPet.specialBonus.battleDamage * 100).toFixed(0)}%
                            </p>
                          )}
                          {selectedPet.specialBonus.defenseBonus && (
                            <p className="text-xs text-purple-200">
                              防御加成 +{(selectedPet.specialBonus.defenseBonus * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white mb-2">技能</h4>
                        <div className="space-y-2">
                          {selectedPet.skills.map((skill, index) => (
                            <div key={skill.id} className="bg-purple-700/50 rounded-lg p-2">
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-medium text-white">{skill.name}</p>
                                <p className="text-xs text-purple-200">等级 {skill.level}/{skill.maxLevel}</p>
                              </div>
                              <p className="text-xs text-purple-200 mb-2">{skill.description}</p>
                              {skill.level < skill.maxLevel && (
                                <button
                                  className={`w-full py-1 text-xs rounded ${hasEnoughResources(calculateSkillUpgradeCost(skill.level)) ? 'bg-purple-600/80 text-white hover:bg-purple-500/80' : 'bg-gray-600/80 text-gray-300 cursor-not-allowed'}`}
                                  onClick={() => onUpgradePetSkill(selectedPet.id, index)}
                                  disabled={!hasEnoughResources(calculateSkillUpgradeCost(skill.level))}
                                >
                                  升级技能
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className={`flex-1 py-2 rounded ${hasEnoughResources(calculateTrainingCost(selectedPet.level)) ? 'bg-purple-600/80 text-white hover:bg-purple-500/80' : 'bg-gray-600/80 text-gray-300 cursor-not-allowed'}`}
                          onClick={() => onTrainPet(selectedPet.id)}
                          disabled={!hasEnoughResources(calculateTrainingCost(selectedPet.level))}
                        >
                          训练宠物
                        </button>
                        <button
                          className={`flex-1 py-2 rounded ${selectedPet.loyalty < 100 && gameState.resources.pills.length > 0 ? 'bg-green-600/80 text-white hover:bg-green-500/80' : 'bg-gray-600/80 text-gray-300 cursor-not-allowed'}`}
                          onClick={() => onFeedPet(selectedPet.id)}
                          disabled={selectedPet.loyalty >= 100 || gameState.resources.pills.length <= 0}
                        >
                          喂食
                        </button>
                      </div>

                      <button
                        className={`w-full mt-2 py-2 rounded ${selectedPet.active ? 'bg-red-600/80 text-white hover:bg-red-500/80' : 'bg-blue-600/80 text-white hover:bg-blue-500/80'}`}
                        onClick={() => onTogglePetActive(selectedPet.id)}
                      >
                        {selectedPet.active ? '取消活跃' : '设置为活跃'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedTab === 'availablePets' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">可捕捉宠物</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePets.map(pet => (
                <div key={pet.id} className="bg-purple-800/50 rounded-lg p-4">
                  <div className="flex justify-center items-center mb-3">
                    <div className={`text-4xl transition-transform duration-300 ${catchingPet === pet.id ? 'animate-pulse' : ''}`}>
                      {pet.image || '🐾'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-white">{pet.name}</p>
                      <p className="text-xs text-purple-200">{pet.type === 'spiritual_animal' ? '灵兽' : pet.type === 'demonic_beast' ? '魔兽' : '神兽'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-purple-200">捕捉几率: {Math.round(pet.catchChance * 100)}%</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-purple-200">基础生命</span>
                      <span className="text-xs text-white">{pet.baseHealth}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-purple-200">基础攻击</span>
                      <span className="text-xs text-white">{pet.baseAttack}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-purple-200">基础防御</span>
                      <span className="text-xs text-white">{pet.baseDefense}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-white mb-2">特殊加成</h4>
                    <div className="space-y-1">
                      {pet.specialBonus.cultivationSpeed && (
                        <p className="text-xs text-purple-200">
                          修炼速度 +{(pet.specialBonus.cultivationSpeed * 100).toFixed(0)}%
                        </p>
                      )}
                      {pet.specialBonus.resourceGatheringSpeed && (
                        <p className="text-xs text-purple-200">
                          资源采集速度 +{(pet.specialBonus.resourceGatheringSpeed * 100).toFixed(0)}%
                        </p>
                      )}
                      {pet.specialBonus.battleDamage && (
                        <p className="text-xs text-purple-200">
                          战斗伤害 +{(pet.specialBonus.battleDamage * 100).toFixed(0)}%
                        </p>
                      )}
                      {pet.specialBonus.defenseBonus && (
                        <p className="text-xs text-purple-200">
                          防御加成 +{(pet.specialBonus.defenseBonus * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    className={`w-full py-2 bg-purple-600/80 text-white rounded hover:bg-purple-500/80 transition-colors ${catchingPet === pet.id ? 'animate-pulse' : ''}`}
                    onClick={() => {
                      setCatchingPet(pet.id);
                      setTimeout(() => {
                        onCatchPet(pet.id);
                        setCatchingPet(null);
                      }, 1500);
                    }}
                    disabled={catchingPet !== null}
                  >
                    {catchingPet === pet.id ? '捕捉中...' : '尝试捕捉'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PetPanel;
