import React from 'react';
import { GameState } from '../types';
import { achievements } from '../data/achievements';

interface AchievementsPanelProps {
  gameState: GameState;
  onAchievementUnlock?: (description: string, reward: string) => void;
  onAction: (action: string, params?: any) => void;
}

const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ gameState, onAction }) => {
  // 计算成就进度
  const calculateAchievementProgress = (achievement: any) => {
    if (gameState.achievements?.includes(achievement.id)) {
      return 100; // 已解锁
    }

    const { requirements } = achievement;
    
    // 处理等级要求
    if (requirements.level && gameState.cultivation.level !== requirements.level) {
      return 0;
    }

    // 处理资源要求
    if (requirements.resources) {
      for (const [resource, amount] of Object.entries(requirements.resources)) {
          const currentAmount = (gameState.resources as any)[resource] || 0;
          if (currentAmount < Number(amount)) {
            return Math.min(100, Math.floor((currentAmount / Number(amount)) * 100));
          }
        }
    }

    // 处理统计数据要求
    if (requirements.totalCultivations && gameState.totalCultivations) {
      return Math.min(100, Math.floor((gameState.totalCultivations / requirements.totalCultivations) * 100));
    }

    if (requirements.totalQiGathered && gameState.totalQiGathered) {
      return Math.min(100, Math.floor((gameState.totalQiGathered / requirements.totalQiGathered) * 100));
    }

    if (requirements.autoCultivationCount && gameState.autoCultivationCount) {
      return Math.min(100, Math.floor((gameState.autoCultivationCount / requirements.autoCultivationCount) * 100));
    }

    // 处理技能等级要求
    if (requirements.skillMaxLevel) {
      const hasMaxLevelSkill = gameState.skills.some(skill => skill.level === skill.maxLevel);
      return hasMaxLevelSkill ? 100 : 0;
    }

    return 100; // 如果所有要求都满足但尚未解锁（可能是因为需要手动触发）
  };

  // 渲染成就奖励
  const renderAchievementReward = (achievement: any) => {
    const rewardItems: string[] = [];
    
    if (achievement.reward.exp) {
      rewardItems.push(`经验: +${achievement.reward.exp}`);
    }
    
    if (achievement.reward.resources) {
      for (const [resource, amount] of Object.entries(achievement.reward.resources)) {
        const resourceName = {
          qi: '灵气',
          gold: '灵石',
          pills: '丹药',
          materials: '材料',
          spiritFruit: '灵果',
          spiritCrystal: '灵晶'
        }[resource] || resource;
        rewardItems.push(`${resourceName}: +${amount}`);
      }
    }
    
    return rewardItems.join(', ');
  };

  // 渲染成就进度文本
  const renderProgressText = (achievement: any) => {
    const { requirements } = achievement;
    
    if (requirements.totalCultivations && gameState.totalCultivations) {
      return `${gameState.totalCultivations}/${requirements.totalCultivations}`;
    }
    
    if (requirements.totalQiGathered && gameState.totalQiGathered) {
      return `${gameState.totalQiGathered}/${requirements.totalQiGathered}`;
    }
    
    if (requirements.resources) {
      for (const [resource, amount] of Object.entries(requirements.resources)) {
        const currentAmount = (gameState.resources as any)[resource] || 0;
        return `${currentAmount}/${amount} ${{
          qi: '灵气',
          gold: '灵石',
          pills: '丹药',
          materials: '材料',
          spiritFruit: '灵果'
        }[resource]}`;
      }
    }
    
    return '';
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return gameState.achievements?.includes(achievementId) || false;
  };

  const isAchievementRewardUnclaimed = (achievementId: string) => {
    return gameState.unlockedAchievements?.includes(achievementId) || false;
  };

  const handleClaimReward = (achievementId: string) => {
    onAction('claimAchievementReward', { achievementId });
  };

  return (
    <div className="game-panel achievements-panel">
      <h2 className="panel-title">🏆 成就系统</h2>
      <div className="achievements-list">
        {achievements.map(achievement => {
          const unlocked = isAchievementUnlocked(achievement.id);
          const progress = calculateAchievementProgress(achievement);
          
          return (
            <div 
              key={achievement.id} 
              className={`achievement-item ${unlocked ? 'achievement-unlocked' : 'achievement-locked'}`}
            >
              <div className="achievement-header">
                <div className="achievement-icon">
                  {unlocked ? '✓' : '🔒'}
                </div>
                <div className="achievement-title-section">
                  <h3 className="achievement-title">{achievement.name}</h3>
                  <p className="achievement-description">{achievement.description}</p>
                </div>
              </div>
              
              {!unlocked && (
                <div className="achievement-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {renderProgressText(achievement)}
                  </div>
                </div>
              )}
              
              <div className="achievement-reward">
                <span className="reward-label">奖励:</span>
                <span className="reward-text">{renderAchievementReward(achievement)}</span>
                {isAchievementRewardUnclaimed(achievement.id) && (
                  <button 
                    className="claim-reward-btn"
                    onClick={() => handleClaimReward(achievement.id)}
                  >
                    领取奖励
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .achievements-list {
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .achievement-item {
          background-color: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(245, 215, 110, 0.2);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }
        
        .achievement-item:hover {
          background-color: rgba(30, 41, 59, 1);
          border-color: rgba(245, 215, 110, 0.4);
          transform: translateY(-2px);
        }
        
        .achievement-unlocked {
          border-color: rgba(76, 175, 80, 0.5);
        }
        
        .achievement-locked {
          opacity: 0.7;
        }
        
        .achievement-header {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }
        
        .achievement-icon {
          font-size: 1.5rem;
          font-weight: bold;
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(245, 215, 110, 0.2);
          border-radius: 50%;
          margin-right: 1rem;
          color: #f5d76e;
        }
        
        .achievement-unlocked .achievement-icon {
          background-color: rgba(76, 175, 80, 0.3);
          color: #4caf50;
        }
        
        .achievement-title-section {
          flex: 1;
        }
        
        .achievement-title {
          color: #ffffff;
          font-weight: bold;
          margin-bottom: 0.25rem;
          font-size: 1.1rem;
        }
        
        .achievement-description {
          color: #94a3b8;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        
        .achievement-progress {
          margin-bottom: 0.75rem;
        }
        
        .progress-bar {
          height: 8px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }
        
        .progress-fill {
          height: 100%;
          background-color: #f5d76e;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        
        .progress-text {
          color: #94a3b8;
          font-size: 0.8rem;
          text-align: right;
        }
        
        .achievement-reward {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
        }
        
        .reward-label {
          color: #f5d76e;
          font-weight: bold;
          margin-right: 0.5rem;
        }
        
        .reward-text {
          color: #cbd5e0;
        }
        
        .claim-reward-btn {
          margin-left: auto;
          padding: 0.4rem 0.8rem;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          font-weight: bold;
          transition: all 0.3s ease;
        }
        
        .claim-reward-btn:hover {
          background-color: #45a049;
          transform: translateY(-1px);
        }
        
        .claim-reward-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};

export default AchievementsPanel;