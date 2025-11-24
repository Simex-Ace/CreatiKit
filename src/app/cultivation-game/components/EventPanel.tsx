import React from 'react';
import { GameEvent, Event } from '../types';
import { getMaterialName } from '../utils';

interface EventPanelProps {
  currentEvent: (GameEvent | Event) | null;
  onEventChoice: (choiceIndex: number) => void;
}

const EventPanel: React.FC<EventPanelProps> = ({ currentEvent, onEventChoice }) => {
  if (!currentEvent) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-md w-full border border-gray-700">
        {/* 事件标题 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white">{currentEvent.title}</h2>
        </div>

        {/* 事件描述 */}
        <div className="p-6 text-gray-200">
          <p className="mb-6 leading-relaxed">{currentEvent.description}</p>

          {/* 选择选项 */}
          <div className="space-y-3">
            {currentEvent.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => onEventChoice(index)}
                className="w-full text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-200 border border-gray-600"
                disabled={choice.requirements?.resources ? 
                  Object.entries(choice.requirements.resources).some(([resource, amount]) => {
                    // 这里应该有资源检查逻辑，但在组件中暂时不做，由游戏核心处理
                    return false;
                  }) : false
                }
              >
                <div className="font-medium text-white mb-1">{choice.text}</div>
                
                {/* 显示选择要求 */}
                {choice.requirements?.resources && (
                  <div className="text-sm text-gray-400 mb-2">
                    需要: {Object.entries(choice.requirements.resources).map(([resource, amount]) => (
                      <span key={resource} className="inline-block mr-2">
                        {getMaterialName(resource)} ×{amount}
                      </span>
                    ))}
                  </div>
                )}

                {/* 显示选择结果预览 */}
                <div className="text-sm">
                  {choice.outcomes?.map((outcome, index) => (
                    <span key={index} className={`inline-block mr-3 text-gray-300`}>
                      {outcome.effects && outcome.effects.exp && (
                        <> {outcome.effects.exp > 0 ? '+' : ''}{outcome.effects.exp} 经验</>
                      )}
                      {outcome.effects && outcome.effects.resources && Object.entries(outcome.effects.resources).map(([resource, amount]) => (
                        <span key={resource} className="inline-block mr-2">
                          {amount && amount > 0 ? '+' : ''}{amount} {getMaterialName(resource)}
                        </span>
                      ))}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPanel;