import React from 'react';
import { GameState, Quest } from '../types';

interface QuestPanelProps {
  gameState: GameState;
  onAction: (action: string, params?: any) => void;
}

export const QuestPanel: React.FC<QuestPanelProps> = ({ gameState, onAction }) => {
  return (
    <div className="game-panel quest-panel">
      <h2 className="panel-title">📋 任务</h2>
      <div className="quests-table">
        <table className="quest-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>状态</th>
              <th>进度</th>
              <th>奖励</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {gameState.quests && gameState.quests.length > 0 ? (
              gameState.quests.map(quest => {
                const handleClaimReward = () => {
                  onAction('claimQuestReward', { questId: quest.id });
                };

                // 渲染任务进度
                const renderQuestProgress = () => {
                  const progressItems: string[] = [];
                  
                  // 渲染境界进度
                  if (quest.requirements.level) {
                    const isCompleted = gameState.cultivation.level === quest.requirements.level;
                    progressItems.push(`境界: ${isCompleted ? '✓' : '✗'}`);
                  }
                  
                  // 渲染资源进度
                  if (quest.requirements.resources) {
                    for (const [resource, amount] of Object.entries(quest.requirements.resources)) {
                      const currentAmount = (gameState.resources as any)[resource] || 0;
                      const resourceName = {
                        qi: '灵气',
                        gold: '灵石',
                        pills: '丹药',
                        materials: '材料',
                        spiritFruit: '灵果'
                      }[resource] || resource;
                      
                      progressItems.push(`${resourceName}: ${currentAmount}/${amount}`);
                    }
                  }
                  
                  // 渲染技能进度
                  if (quest.requirements.skills) {
                    for (const skillReq of quest.requirements.skills) {
                      const skill = gameState.skills.find(s => s.id === skillReq.id);
                      const currentLevel = skill ? skill.level : 0;
                      const skillName = skill ? skill.name : skillReq.id;
                      
                      progressItems.push(`${skillName}: ${currentLevel}/${skillReq.level}`);
                    }
                  }
                  
                  return progressItems.join(', ');
                };

                // 渲染任务奖励
                const renderQuestRewards = () => {
                  const rewardItems: string[] = [];
                  
                  if (quest.rewards.exp) {
                    rewardItems.push(`经验: +${quest.rewards.exp}`);
                  }
                  
                  if (quest.rewards.resources) {
                    for (const [resource, amount] of Object.entries(quest.rewards.resources)) {
                      const resourceName = {
                        qi: '灵气',
                        gold: '灵石',
                        pills: '丹药',
                        materials: '材料',
                        spiritFruit: '灵果'
                      }[resource] || resource;
                      rewardItems.push(`${resourceName}: +${amount}`);
                    }
                  }
                  
                  return rewardItems.join(', ');
                };

                return (
                  <tr key={quest.id} className={`quest-item ${quest.completed ? 'quest-completed' : 'quest-active'}`}>
                    <td>
                      <div className="quest-title">{quest.title}</div>
                      <div className="quest-description">{quest.description}</div>
                    </td>
                    <td className={`quest-status ${quest.completed ? 'status-completed' : 'status-in-progress'}`}>
                      {quest.completed ? '已完成' : '进行中'}
                    </td>
                    <td className="quest-progress">
                      {renderQuestProgress()}
                    </td>
                    <td className="quest-rewards">
                      {renderQuestRewards()}
                    </td>
                    <td className="quest-actions">
                      {quest.completed && (
                        <button 
                          className="btn btn-success btn-small"
                          onClick={handleClaimReward}
                        >
                          领取奖励
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="no-quests">
                <td colSpan={5}>
                  <p>暂无任务可接取</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <style jsx>{`
          .quests-table {
            width: 100%;
            overflow-x: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }
          
          .quest-table {
            width: 100%;
            border-collapse: collapse;
            background-color: rgba(26, 32, 44, 0.9);
            border: 1px solid rgba(245, 215, 110, 0.3);
            border-radius: 8px;
            overflow: hidden;
          }
          
          .quest-table th,
          .quest-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid rgba(245, 215, 110, 0.2);
          }
          
          .quest-table th {
            background: linear-gradient(90deg, rgba(245, 215, 110, 0.2), rgba(245, 215, 110, 0.1));
            color: #f5d76e;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.9rem;
            letter-spacing: 0.5px;
          }
          
          .quest-table th:first-child {
            border-radius: 8px 0 0 0;
          }
          
          .quest-table th:last-child {
            border-radius: 0 8px 0 0;
          }
          
          .quest-item {
            transition: all 0.3s ease;
          }
          
          .quest-item:nth-child(even) {
            background-color: rgba(30, 41, 59, 0.5);
          }
          
          .quest-item:hover {
            background-color: rgba(245, 215, 110, 0.1);
            transform: translateY(-1px);
          }
          
          .quest-title {
            color: #ffffff;
            font-weight: bold;
            margin-bottom: 0.5rem;
            font-size: 1.05rem;
          }
          
          .quest-description {
            color: #94a3b8;
            font-size: 0.95rem;
            line-height: 1.5;
          }
          
          .quest-status {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 0.85rem;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            display: inline-block;
          }
          
          .status-completed {
            color: #ffffff;
            background-color: rgba(76, 175, 80, 0.3);
          }
          
          .status-in-progress {
            color: #ffffff;
            background-color: rgba(245, 215, 110, 0.3);
          }
          
          .quest-progress {
            color: #cbd5e0;
            font-size: 0.95rem;
            line-height: 1.4;
          }
          
          .quest-rewards {
            color: #f5d76e;
            font-size: 0.95rem;
            font-weight: 500;
            line-height: 1.4;
          }
          
          .no-quests td {
            text-align: center;
            color: #94a3b8;
            padding: 3rem;
            font-size: 1.1rem;
          }
          
          .btn-small {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
            border-radius: 6px;
            font-weight: bold;
            transition: all 0.3s ease;
            background: linear-gradient(135deg, #4caf50, #45a049);
            color: white;
            border: none;
            cursor: pointer;
          }
          
          .btn-small:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          }
          
          .btn-small:active {
            transform: translateY(0);
          }
          
          /* 响应式设计 */
          @media (max-width: 1024px) {
            .quest-table th,
            .quest-table td {
              padding: 0.8rem;
            }
          }
          
          @media (max-width: 768px) {
            .quest-table {
              font-size: 0.9rem;
            }
            
            .quest-table th,
            .quest-table td {
              padding: 0.6rem;
            }
            
            .quest-status {
              font-size: 0.75rem;
              padding: 0.2rem 0.6rem;
            }
          }
        `}</style>
      </div>
    </div>
  );
};