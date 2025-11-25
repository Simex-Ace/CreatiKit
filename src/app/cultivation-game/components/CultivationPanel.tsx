'use client'

import React from 'react';
import { GameState, Skill } from '../types';

interface CultivationPanelProps {
  gameState: GameState;
  onAction: (action: string, params?: any) => void;
}

export const CultivationPanel: React.FC<CultivationPanelProps> = ({ gameState, onAction }) => {
  // 获取技能图标
  const getSkillIcon = (skillId: string) => {
    const iconMap: Record<string, string> = {
      'basic_cultivation': '🧘',
      'qi_gathering': '🌬️',
      'meditation': '🧠',
      'herbal_medicine': '🌿',
      'alchemy': '⚗️'
    };
    return iconMap[skillId] || '📚';
  };

  // 获取技能描述
  const getSkillDescription = (skillId: string) => {
    const descriptions: Record<string, string> = {
      'basic_cultivation': '提升基础修炼效率',
      'qi_gathering': '增加灵气采集速率',
      'meditation': '提高修炼专注度，增加经验获得',
      'herbal_medicine': '采集药草效率提升',
      'alchemy': '炼制丹药成功率提高'
    };
    return descriptions[skillId] || '未知技能';
  };

  // 格式化技能效果
  const formatSkillEffect = (skill: Skill) => {
    const effects = [];
    
    if (skill.effects.cultivationSpeed) {
      effects.push(`修炼速度 +${Math.floor(skill.effects.cultivationSpeed * 100)}%`);
    }
    
    if (skill.effects.qiGatherRate) {
      effects.push(`灵气采集 +${Math.floor(skill.effects.qiGatherRate * 100)}%`);
    }
    
    if (skill.effects.expGain) {
      effects.push(`经验获得 +${Math.floor(skill.effects.expGain * 100)}%`);
    }
    
    return effects.join(', ');
  };

  // 计算升级费用
  const calculateUpgradeCost = (level: number) => {
    return 100 * level;
  };

  return (
    <div className="panel">
      <h2 className="panel-title">修真技能</h2>
      
      {gameState.skills.length > 0 ? (
        <div className="skill-list">
          {gameState.skills.map((skill: Skill) => {
            const upgradeCost = calculateUpgradeCost(skill.level);
            const canUpgrade = skill.level < skill.maxLevel && gameState.resources.gold >= upgradeCost;
            
            return (
              <div key={skill.id} className="skill-item">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                    {getSkillIcon(skill.id)}
                  </span>
                  <div>
                    <div className="skill-name">{skill.name}</div>
                    <div className="skill-level">等级 {skill.level}/{skill.maxLevel}</div>
                  </div>
                </div>
                
                <div className="skill-effects">
                  <div style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>
                    {getSkillDescription(skill.id)}
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}>
                    效果: {formatSkillEffect(skill)}
                  </div>
                </div>
                
                {skill.level < skill.maxLevel && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '0.5rem' 
                    }}>
                      <span>升级费用</span>
                      <span style={{ color: '#f5d76e' }}>{upgradeCost} 灵石</span>
                    </div>
                    <button
                      className="btn"
                      onClick={() => onAction('upgradeSkill', { skillId: skill.id })}
                      disabled={!canUpgrade}
                    >
                      升级技能
                    </button>
                  </div>
                )}
                
                {skill.level >= skill.maxLevel && (
                  <div style={{ 
                    marginTop: '1rem', 
                    padding: '0.5rem', 
                    backgroundColor: 'rgba(72, 187, 120, 0.2)',
                    borderRadius: '4px',
                    textAlign: 'center',
                    color: '#48bb78'
                  }}>
                    已达最高等级
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
          暂无技能
        </div>
      )}
      
      {/* 技能系统说明 */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px' }}>
        <h3 style={{ color: '#f5d76e', marginBottom: '0.5rem' }}>技能系统说明</h3>
        <ul style={{ color: '#94a3b8', listStyleType: 'none', padding: 0, fontSize: '0.9rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>• 技能可以通过消耗灵石升级，提升各项属性</li>
          <li style={{ marginBottom: '0.5rem' }}>• 等级越高，升级所需的灵石越多</li>
          <li style={{ marginBottom: '0.5rem' }}>• 每个技能都有最高等级限制</li>
          <li style={{ marginBottom: '0.5rem' }}>• 技能效果会直接影响您的修炼和采集效率</li>
        </ul>
      </div>
    </div>
  );
};