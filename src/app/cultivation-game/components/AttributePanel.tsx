'use client'

import React from 'react';
import { GameState } from '../types';
import { formatAttributeValue } from '../utils';

interface AttributePanelProps {
  gameState: GameState;
}

export const AttributePanel: React.FC<AttributePanelProps> = ({ gameState }) => {
  // 确保attributes不会是undefined或null
  const attributes = gameState.cultivation.attributes || {
    constitution: 10,
    rootBone: 10,
    comprehension: 10,
    spirituality: 10,
    charm: 10
  };

  // 属性描述和影响
  const attributeInfo = {
    constitution: {
      name: '体质',
      icon: '💪',
      description: '影响生命值、修炼速度和防御力',
      effects: [
        `每点体质 +5 生命值`,
        `每点体质 +1% 修炼速度`,
        `每点体质 +2 防御力`
      ]
    },
    rootBone: {
      name: '根骨',
      icon: '🦴',
      description: '影响灵气容量、突破成功率和资源采集效率',
      effects: [
        `每点根骨 +10 灵气容量`,
        `每点根骨 +0.5% 突破成功率`,
        `每点根骨 +1% 资源采集效率`
      ]
    },
    comprehension: {
      name: '悟性',
      icon: '🧠',
      description: '影响经验获得、技能学习速度和炼丹成功率',
      effects: [
        `每点悟性 +1% 经验获得`,
        `每点悟性 +1% 技能学习速度`,
        `每点悟性 +0.5% 炼丹成功率`
      ]
    },
    spirituality: {
      name: '灵性',
      icon: '✨',
      description: '影响灵气采集速度、符箓制作成功率和探险成功率',
      effects: [
        `每点灵性 +1% 灵气采集速度`,
        `每点灵性 +0.5% 符箓制作成功率`,
        `每点灵性 +0.5% 探险成功率`
      ]
    },
    charm: {
      name: '魅力',
      icon: '🌟',
      description: '影响宗门贡献、宠物捕捉成功率和交易价格',
      effects: [
        `每点魅力 +1% 宗门贡献`,
        `每点魅力 +0.5% 宠物捕捉成功率`,
        `每点魅力 ±0.5% 交易价格`
      ]
    }
  };

  return (
    <div className="attribute-panel">
      <h3 className="panel-title">个人属性</h3>
      <div className="attribute-grid">
        {Object.entries(attributes).map(([key, value]) => {
          const attrKey = key as keyof typeof attributes;
          const info = attributeInfo[attrKey as keyof typeof attributeInfo];
          
          return (
            <div key={key} className="attribute-item">
              <div className="attribute-header">
                <span className="attribute-icon">{info.icon}</span>
                <div className="attribute-name-container">
                  <span className="attribute-name">{info.name}</span>
                  <span className="attribute-value">{formatAttributeValue(value)}</span>
                </div>
              </div>
              <div className="attribute-description">{info.description}</div>
              <div className="attribute-effects">
                {info.effects.map((effect, index) => (
                  <div key={index} className="attribute-effect">{effect}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
