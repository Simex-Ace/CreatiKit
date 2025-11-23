import React from 'react';
import { GameState } from '../types';

interface AchievementsPanelProps {
  gameState: GameState;
  onAchievementUnlock?: (description: string, reward: string) => void;
}


const AchievementsPanel: React.FC<AchievementsPanelProps> = ({ gameState }) => {
  return (
    <div className="achievements-panel">
      <h3>🏆 成就系统</h3>
      <p>成就组件正常工作</p>
    </div>
  );
};

export default AchievementsPanel;