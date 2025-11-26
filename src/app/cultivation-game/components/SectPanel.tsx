import React, { useState } from 'react';
import { GameState, Sect, SectTask } from '../types';
import { sects } from '../data/sects';
import { getMaterialName } from '../utils';

interface SectPanelProps {
  gameState: GameState;
  onJoinSect: (sectId: string) => void;
  onContributeToSect: (amount: number) => void;
  onCompleteSectTask: (taskId: string) => void;
  onClaimSectTaskReward: (taskId: string) => void;
}

const SectPanel: React.FC<SectPanelProps> = ({
  gameState,
  onJoinSect,
  onContributeToSect,
  onCompleteSectTask,
  onClaimSectTaskReward
}) => {
  const [contributionAmount, setContributionAmount] = useState<number>(10);
  const { sect } = gameState.cultivation;

  const handleContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setContributionAmount(value);
    }
  };

  const handleContribute = () => {
    onContributeToSect(contributionAmount);
  };

  // 渲染可加入的宗门列表
  const renderAvailableSects = () => {
    return (
      <div className="sects-list">
        <h3 className="text-xl font-semibold text-purple-200 mb-4">可加入的宗门</h3>
        <p className="text-purple-300 mb-4">需要境界：筑基期一层</p>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">宗门名称</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">描述</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">资源加成</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">经验加成</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">修炼速度</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {sects.map((availableSect) => (
                <tr key={availableSect.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 text-white border-b border-slate-600 font-medium">{availableSect.name}</td>
                  <td className="px-4 py-3 text-purple-200 border-b border-slate-600">{availableSect.description}</td>
                  <td className="px-4 py-3 text-purple-200 border-b border-slate-600">+{availableSect.benefits.resourceBoost * 100}%</td>
                  <td className="px-4 py-3 text-purple-200 border-b border-slate-600">+{availableSect.benefits.expBoost * 100}%</td>
                  <td className="px-4 py-3 text-purple-200 border-b border-slate-600">+{availableSect.benefits.cultivationSpeedBoost * 100}%</td>
                  <td className="px-4 py-3 border-b border-slate-600">
                    <button 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1 rounded transition-all duration-300"
                      onClick={() => onJoinSect(availableSect.id)}
                    >
                      加入宗门
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 渲染已加入的宗门信息
  const renderCurrentSect = () => {
    if (!sect) return null;

    return (
      <div className="current-sect">
        <h3 className="text-xl font-semibold text-purple-200 mb-4">{sect.name} (等级: {sect.level})</h3>
        <p className="text-purple-300 mb-6">{sect.description}</p>
        
        {/* 宗门贡献 */}
        <div className="sect-contribution mb-6">
          <h4 className="text-lg font-medium text-purple-200 mb-3">宗门贡献</h4>
          <div className="progress-bar bg-slate-700 h-3 rounded-full mb-2">
            <div 
              className="progress bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min((sect.contribution / sect.contributionToNextLevel) * 100, 100)}%` 
              }}
            ></div>
          </div>
          <p className="text-purple-200 mb-4">{sect.contribution} / {sect.contributionToNextLevel} (下次升级)</p>
          
          <div className="contribute-controls flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input 
              type="number" 
              value={contributionAmount} 
              onChange={handleContributionChange}
              min="1"
              max={gameState.resources.spiritStone}
              className="bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 w-full sm:w-32"
            />
            <button 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded transition-all duration-300 flex-1 sm:flex-none"
              onClick={handleContribute}
              disabled={gameState.resources.spiritStone < contributionAmount}
            >
              贡献灵石
            </button>
            <p className="text-purple-200 w-full sm:w-auto text-center sm:text-left">当前灵石: {gameState.resources.spiritStone}</p>
          </div>
        </div>

        {/* 宗门加成 */}
        <div className="sect-benefits mb-6">
          <h4 className="text-lg font-medium text-purple-200 mb-3">宗门加成</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">加成类型</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">加成数值</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 text-purple-200 border-b border-slate-600">资源获取速度</td>
                  <td className="px-4 py-3 text-white border-b border-slate-600">+{sect.benefits.resourceBoost * 100}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-purple-200 border-b border-slate-600">经验获取</td>
                  <td className="px-4 py-3 text-white border-b border-slate-600">+{sect.benefits.expBoost * 100}%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-purple-200">修炼速度</td>
                  <td className="px-4 py-3 text-white">+{sect.benefits.cultivationSpeedBoost * 100}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 宗门任务 */}
        <div className="sect-tasks">
          <h4 className="text-lg font-medium text-purple-200 mb-3">宗门任务</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">任务名称</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">任务描述</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">贡献奖励</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">资源奖励</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-purple-200 border-b border-slate-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {sect.tasks.map((task) => (
                  <tr key={task.id} className={`hover:bg-slate-700/50 transition-colors ${task.completed ? 'opacity-70' : ''}`}>
                    <td className="px-4 py-3 text-white border-b border-slate-600 font-medium">{task.name}</td>
                    <td className="px-4 py-3 text-purple-200 border-b border-slate-600">{task.description}</td>
                    <td className="px-4 py-3 text-white border-b border-slate-600">{task.rewards.contribution}</td>
                    <td className="px-4 py-3 text-purple-200 border-b border-slate-600">
                      {task.rewards.resources && Object.entries(task.rewards.resources).map(([resource, amount]) => (
                        <div key={resource}>{getMaterialName(resource)}: +{typeof amount === 'number' ? amount : amount.length}</div>
                      ))}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-600">
                      <div className="task-actions flex flex-col gap-2">
                        {!task.completed && !task.claimed && (
                          <button 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1 rounded transition-all duration-300"
                            onClick={() => onCompleteSectTask(task.id)}
                          >
                            完成任务
                          </button>
                        )}
                        {task.completed && !task.claimed && (
                          <button 
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-3 py-1 rounded transition-all duration-300"
                            onClick={() => onClaimSectTaskReward(task.id)}
                          >
                            领取奖励
                          </button>
                        )}
                        {task.claimed && (
                          <span className="text-green-400 font-medium">已领取</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="sect-panel bg-slate-900 p-6 rounded-lg shadow-xl">
      <h2 className="panel-title text-2xl font-bold text-purple-200 mb-6">🏛️ 宗门系统</h2>
      {!sect ? renderAvailableSects() : renderCurrentSect()}
    </div>
  );
};

export default SectPanel;
