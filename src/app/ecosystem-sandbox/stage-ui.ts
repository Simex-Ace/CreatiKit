import { EcosystemStage } from './types';

export class EcosystemStageUI {
  private container: HTMLDivElement;
  private stageDisplay: HTMLDivElement;
  private advanceButton: HTMLButtonElement;
  private primordialSoupCounter: HTMLDivElement;
  
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'ecosystem-stage-ui';
    this.container.style.position = 'absolute';
    this.container.style.top = '20px';
    this.container.style.right = '20px';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    this.container.style.color = 'white';
    this.container.style.padding = '15px';
    this.container.style.borderRadius = '8px';
    this.container.style.fontFamily = 'Arial, sans-serif';
    this.container.style.zIndex = '1000';
    
    // 阶段显示
    this.stageDisplay = document.createElement('div');
    this.stageDisplay.style.fontSize = '18px';
    this.stageDisplay.style.fontWeight = 'bold';
    this.stageDisplay.style.marginBottom = '10px';
    
    // 原始汤计数器
    this.primordialSoupCounter = document.createElement('div');
    this.primordialSoupCounter.style.fontSize = '14px';
    this.primordialSoupCounter.style.marginBottom = '10px';
    
    // 前进按钮
    this.advanceButton = document.createElement('button');
    this.advanceButton.textContent = '进入下一阶段';
    this.advanceButton.style.backgroundColor = '#4CAF50';
    this.advanceButton.style.color = 'white';
    this.advanceButton.style.border = 'none';
    this.advanceButton.style.padding = '8px 16px';
    this.advanceButton.style.borderRadius = '4px';
    this.advanceButton.style.cursor = 'pointer';
    this.advanceButton.style.fontSize = '14px';
    this.advanceButton.disabled = true;
    
    // 添加到容器
    this.container.appendChild(this.stageDisplay);
    this.container.appendChild(this.primordialSoupCounter);
    this.container.appendChild(this.advanceButton);
    
    // 添加到文档
    document.body.appendChild(this.container);
  }
  
  updateUI(stage: EcosystemStage, primordialSoupCount: number, primordialSoupThreshold: number, canAdvance: boolean, prokaryoticCount?: number, prokaryoticThreshold?: number) {
    // 更新阶段显示
    let stageName = '';
    switch (stage) {
      case 'primordial_soup':
        stageName = '原始汤时代';
        break;
      case 'prokaryotic_eukaryotic':
        stageName = '早期生命';
        break;
      case 'evolution':
        stageName = '进化阶段';
        break;
      case 'advanced':
        stageName = '高级生命';
        break;
    }
    
    this.stageDisplay.textContent = `当前阶段：${stageName}`;
    
    // 更新原始汤计数器（仅在原始汤时代显示）
    if (stage === 'primordial_soup') {
      this.primordialSoupCounter.textContent = `原始汤数量：${primordialSoupCount} / ${primordialSoupThreshold}`;
      this.primordialSoupCounter.style.display = 'block';
      
      // 更新进度条样式
      const progress = Math.min(100, (primordialSoupCount / primordialSoupThreshold) * 100);
      this.primordialSoupCounter.style.background = `linear-gradient(to right, #00ffff ${progress}%, transparent ${progress}%)`;
      this.primordialSoupCounter.style.padding = '5px 10px';
      this.primordialSoupCounter.style.borderRadius = '4px';
    } 
    // 在第二阶段显示生物总数进度条
    else if (stage === 'prokaryotic_eukaryotic' && prokaryoticCount !== undefined && prokaryoticThreshold !== undefined) {
      this.primordialSoupCounter.textContent = `生物总数：${prokaryoticCount} / ${prokaryoticThreshold}`;
      this.primordialSoupCounter.style.display = 'block';
      
      // 更新进度条样式
      const progress = Math.min(100, (prokaryoticCount / prokaryoticThreshold) * 100);
      this.primordialSoupCounter.style.background = `linear-gradient(to right, #00ff00 ${progress}%, transparent ${progress}%)`;
      this.primordialSoupCounter.style.padding = '5px 10px';
      this.primordialSoupCounter.style.borderRadius = '4px';
    }
    else {
      this.primordialSoupCounter.style.display = 'none';
    }
    
    // 更新按钮状态
    this.advanceButton.disabled = !canAdvance;
    this.advanceButton.style.backgroundColor = canAdvance ? '#4CAF50' : '#cccccc';
    this.advanceButton.style.cursor = canAdvance ? 'pointer' : 'not-allowed';
  }
  
  setAdvanceCallback(callback: () => void) {
    this.advanceButton.onclick = callback;
  }
  
  destroy() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}