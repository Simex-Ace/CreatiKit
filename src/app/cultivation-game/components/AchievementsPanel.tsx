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
      {/* 成就列表将在此处显示 */}
    </div>
  );
};

export default AchievementsPanel;