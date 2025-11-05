import { Organism, Food, Stats, TerrainGrid, TerrainType } from './types';

export class EcosystemRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private devicePixelRatio: number;
  
  // 地形类型对应的颜色映射 - 使用高对比度颜色
  private terrainColors: Record<string, string> = {
    ocean: '#0000ff',       // 海洋蓝色（更鲜艳）
    beach: '#f5deb3',       // 沙滩米色（更浅更真实）
    plains: '#00ff00',      // 平原绿色（更亮）
    forest: '#8b4513',      // 森林棕色（对比明显）
    mountain: '#808080'     // 山脉灰色（更自然）
  };

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, devicePixelRatio: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.devicePixelRatio = devicePixelRatio;
    
    // 设置缩放以支持Hi-DPI显示
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
  }

  // 更新Canvas尺寸
  updateSize(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    // 不需要重新缩放，因为在构造函数中已经处理过了
  }

  // 清空画布
  clear() {
    this.ctx.save();
    // 保存当前变换状态
    const currentTransform = this.ctx.getTransform();
    // 重置变换矩阵
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    // 完全清空画布
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    // 恢复之前的变换矩阵
    this.ctx.setTransform(currentTransform);
    this.ctx.restore();
  }

  // 绘制食物
  drawFoods(ctx: CanvasRenderingContext2D, foods: Food[]) {
    if (foods.length === 0) return;
    
    const now = Date.now();
    const flashDuration = 300;
    
    ctx.save();
    
    foods.forEach(food => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
      
      if (food.isFlashing && food.flashTime) {
        // 计算闪烁进度（0-1）
        const progress = (now - food.flashTime) / flashDuration;
        // 创建脉动效果：亮度先增加后减少
        const brightness = 80 - Math.abs(progress - 0.5) * 40;
        // 使用亮绿色并设置透明度渐变
        const alpha = 1 - progress;
        
        // 绘制外圈光晕
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(120, 100%, ${brightness + 10}%, ${alpha * 0.5})`;
        ctx.fill();
        
        // 重新绘制食物本体
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(120, 100%, 50%, ${alpha})`;
      } else {
        // 普通食物显示为绿色
        ctx.fillStyle = 'hsl(120, 100%, 40%)';
      }
      
      ctx.fill();
      ctx.restore();
    });
    
    ctx.restore();
  }

  // 绘制单个生物
  private drawOrganism(organism: Organism) {
    // 根据饥饿值和繁殖状态调整颜色
    let displayColor = organism.color;
    
    if (organism.isBreeding) {
      // 繁殖中的特殊粉色系
      displayColor = `hsl(300, 100%, ${60 - (organism.breedingProgress || 0) / 3}%)`;
    } else if (organism.hunger < 30) {
      const green = Math.floor(100 * (organism.hunger / 30));
      displayColor = `rgba(255, ${green}, ${green}, 0.9)`;
    }
    
    // 繁殖中的额外发光效果
    if (organism.isBreeding) {
      // 绘制内部发光
      this.ctx.beginPath();
      this.ctx.arc(organism.x, organism.y, organism.size * 1.2, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(300, 100%, 80%, ${0.4 + (organism.breedingProgress || 0) / 250})`;
      this.ctx.fill();
      
      // 绘制脉动圆环
      const pulseRadius = organism.size * (1.3 + 0.2 * Math.sin(Date.now() * 0.004));
      this.ctx.beginPath();
      this.ctx.arc(organism.x, organism.y, pulseRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = `hsla(300, 100%, 70%, ${0.6})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
    
    // 绘制生物主体
    this.ctx.beginPath();
    this.ctx.arc(organism.x, organism.y, organism.size, 0, Math.PI * 2);
    this.ctx.fillStyle = displayColor;
    this.ctx.fill();
    
    // 添加类型标记
    if (organism.type === 'predator') {
      this.ctx.beginPath();
      this.ctx.arc(organism.x, organism.y, organism.size * 0.8, 0, Math.PI * 2);
      this.ctx.strokeStyle = '#660000';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    } else if (organism.type === 'scavenger') {
      this.ctx.beginPath();
      this.ctx.arc(organism.x, organism.y, organism.size * 0.8, 0, Math.PI);
      this.ctx.strokeStyle = '#660066';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();
    }
    
    // 繁殖状态不显示方向指示器
    if (!organism.isBreeding) {
      // 方向指示器
      this.ctx.beginPath();
      this.ctx.moveTo(organism.x, organism.y);
      this.ctx.lineTo(
        organism.x + Math.cos(organism.direction) * organism.size * 1.5,
        organism.y + Math.sin(organism.direction) * organism.size * 1.5
      );
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // 饥饿值条 - 繁殖状态不显示
      if (organism.hunger < 50) {
        const barWidth = organism.size * 2;
        const barY = organism.y + organism.size + 5;
        const xPos = organism.x - barWidth / 2;
        
        // 背景条
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(xPos, barY, barWidth, 2);
        
        // 饥饿值条
        const hungerWidth = (organism.hunger / 100) * barWidth;
        this.ctx.fillStyle = organism.hunger < 20 ? 'rgba(255, 0, 0, 0.8)' : 'rgba(255, 165, 0, 0.8)';
        this.ctx.fillRect(xPos, barY, hungerWidth, 2);
      }
    }
    
    // 繁殖状态显示特殊标记
    if (organism.isBreeding) {
      // 中心爱心标记
      this.ctx.beginPath();
      const heartSize = organism.size * 0.5;
      this.ctx.moveTo(organism.x, organism.y - heartSize * 0.2);
      
      // 绘制简化的爱心形状
      const curveControl = heartSize * 0.8;
      this.ctx.bezierCurveTo(
        organism.x - heartSize, organism.y - heartSize * 1.2,
        organism.x - heartSize * 1.2, organism.y + heartSize * 0.2,
        organism.x, organism.y + heartSize * 0.8
      );
      this.ctx.bezierCurveTo(
        organism.x + heartSize * 1.2, organism.y + heartSize * 0.2,
        organism.x + heartSize, organism.y - heartSize * 1.2,
        organism.x, organism.y - heartSize * 0.2
      );
      
      this.ctx.fillStyle = 'rgba(255, 0, 128, 0.9)';
      this.ctx.fill();
    }
  }

  // 批量绘制生物
  drawOrganisms(organisms: Organism[]) {
    if (organisms.length === 0) return;
    
    this.ctx.save();
    const now = Date.now();
    
    organisms.forEach(organism => {
      // 绘制繁殖特效（如果正在繁殖）
      if (organism.isBreeding) {
        // 绘制发光效果 - 更明显的光晕
        this.ctx.beginPath();
        this.ctx.arc(organism.x, organism.y, organism.size * 2, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(300, 100%, 70%, ${0.3 + (organism.breedingProgress || 0) / 300})`;
        this.ctx.fill();
        
        // 绘制繁殖进度条 - 更美观的设计
        const progressBarWidth = organism.size * 3;
        const progressBarHeight = 4;
        const progressBarY = organism.y - organism.size - 10;
        
        // 进度条圆角背景
        this.ctx.beginPath();
        this.ctx.roundRect(
          organism.x - progressBarWidth / 2,
          progressBarY,
          progressBarWidth,
          progressBarHeight,
          2
        );
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fill();
        
        // 进度条填充 - 带渐变效果
        this.ctx.beginPath();
        this.ctx.roundRect(
          organism.x - progressBarWidth / 2,
          progressBarY,
          progressBarWidth * ((organism.breedingProgress || 0) / 100),
          progressBarHeight,
          2
        );
        
        // 创建进度条渐变
        const progressGradient = this.ctx.createLinearGradient(
          organism.x - progressBarWidth / 2,
          progressBarY,
          organism.x + progressBarWidth / 2,
          progressBarY
        );
        progressGradient.addColorStop(0, 'hsl(280, 100%, 60%)');
        progressGradient.addColorStop(1, 'hsl(320, 100%, 60%)');
        this.ctx.fillStyle = progressGradient;
        this.ctx.fill();
        
        // 进度百分比文本
        if ((organism.breedingProgress || 0) > 10) {
          this.ctx.fillStyle = 'white';
          this.ctx.font = `${Math.floor(organism.size * 0.8)}px Arial`;
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(
            `${Math.round(organism.breedingProgress || 0)}%`,
            organism.x,
            progressBarY + progressBarHeight / 2
          );
        }
      }
      
      // 如果检测到食物，绘制绿色光环
      if (organism.isDetectingFood && organism.detectedFoodDistance !== undefined) {
        // 根据距离调整光环大小和透明度
        const baseRadius = organism.size * 1.5;
        const maxRadius = organism.size * 5;
        const distanceRatio = Math.min(1, organism.detectedFoodDistance / 100); // 限制在0-1范围内
        const outerRadius = baseRadius + (maxRadius - baseRadius) * (1 - distanceRatio);
        const ringThickness = organism.size * 0.3; // 环的厚度减小，使环更细
        const innerRadius = outerRadius - ringThickness;
        
        // 创建脉动效果 - 更强的变化
        const pulseFactor = 0.8 + 0.2 * Math.sin(now * 0.004);
        
        // 绘制外层发光模糊效果（光晕）
        this.ctx.beginPath();
        this.ctx.arc(organism.x, organism.y, outerRadius + ringThickness * 0.5, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsla(120, 100%, 60%, ${0.2 * pulseFactor})`;
        this.ctx.lineWidth = ringThickness;
        this.ctx.stroke();
        
        // 绘制主要空心环
        this.ctx.beginPath();
        this.ctx.arc(organism.x, organism.y, outerRadius, 0, Math.PI * 2);
        this.ctx.arc(organism.x, organism.y, innerRadius, 0, Math.PI * 2, true); // 内环，反向绘制
        this.ctx.fillStyle = `hsla(120, 100%, 50%, ${0.4 * pulseFactor})`;
        this.ctx.fill();
        
        // 添加内环发光边缘
        this.ctx.beginPath();
        this.ctx.arc(organism.x, organism.y, innerRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsla(120, 100%, 80%, ${0.6 * pulseFactor})`;
        this.ctx.lineWidth = organism.size * 0.2;
        this.ctx.stroke();
        
        // 添加外环发光边缘
        this.ctx.beginPath();
        this.ctx.arc(organism.x, organism.y, outerRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `hsla(120, 100%, 70%, ${0.7 * pulseFactor})`;
        this.ctx.lineWidth = organism.size * 0.2;
        this.ctx.stroke();
      }
      
      this.drawOrganism(organism);
    });
    
    this.ctx.restore();
  }

  // 计算生物类型统计
  calculateOrganismStats(organisms: Organism[]): { basic: number; predator: number; scavenger: number } {
    const stats = { basic: 0, predator: 0, scavenger: 0 };
    organisms.forEach(org => stats[org.type]++);
    return stats;
  }

  // 绘制暂停覆盖层
  drawPauseOverlay() {
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvasWidth / this.devicePixelRatio, this.canvasHeight / this.devicePixelRatio);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '已暂停',
      this.canvasWidth / (2 * this.devicePixelRatio),
      this.canvasHeight / (2 * this.devicePixelRatio)
    );
    this.ctx.restore();
  }
  
  // 绘制地形网格
  drawTerrain(terrainGrid: TerrainGrid | null, gridSize: number) {
    if (!terrainGrid || terrainGrid.length === 0 || terrainGrid[0].length === 0) {
      return;
    }
    
    this.ctx.save();
    
    // 使用设备像素比正确处理画布绘制
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    
    // 计算实际的网格单元格大小（基于CSS像素）
    const cssWidth = this.canvasWidth / this.devicePixelRatio;
    const cssHeight = this.canvasHeight / this.devicePixelRatio;
    const cellWidth = cssWidth / terrainGrid[0].length;
    const cellHeight = cssHeight / terrainGrid.length;
    
    // 绘制每个地形单元格
    for (let y = 0; y < terrainGrid.length; y++) {
      for (let x = 0; x < terrainGrid[y].length; x++) {
        const terrainCell = terrainGrid[y][x];
        const terrainType = terrainCell.type;
        const color = this.terrainColors[terrainType] || 'hsl(0, 0%, 95%)'; // 默认灰色
        
        // 设置基础填充色
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
          Math.floor(x * cellWidth),
          Math.floor(y * cellHeight),
          Math.ceil(cellWidth),
          Math.ceil(cellHeight)
        );
      }
    }
    
    this.ctx.restore();
  }
  
  // 添加地形特效
  private addTerrainEffects(x: number, y: number, cellWidth: number, cellHeight: number, terrainType: TerrainType) {
    switch (terrainType) {
      case 'ocean':
        // 添加海洋波纹效果
        this.addOceanRipple(x, y, cellWidth, cellHeight);
        break;
      case 'beach':
        // 添加沙滩颗粒感
        this.addBeachTexture(x, y, cellWidth, cellHeight);
        break;
      case 'plains':
        // 添加平原草地图案
        this.addPlainsTexture(x, y, cellWidth, cellHeight);
        break;
      case 'forest':
        // 添加森林斑点效果
        this.addForestSpots(x, y, cellWidth, cellHeight);
        break;
      case 'mountain':
        // 添加山脉条纹效果
        this.addMountainStripes(x, y, cellWidth, cellHeight);
        break;
    }
  }
  
  // 海洋波纹特效
  private addOceanRipple(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.fillStyle = 'rgba(0, 100, 200, 0.1)';
    this.ctx.beginPath();
    this.ctx.arc(x * cellWidth + cellWidth / 2, y * cellHeight + cellHeight / 2, Math.min(cellWidth, cellHeight) / 4, 0, Math.PI * 2);
    this.ctx.fill();
  }
  
  // 沙滩颗粒感
  private addBeachTexture(x: number, y: number, cellWidth: number, cellHeight: number) {
    for (let i = 0; i < 5; i++) {
      const px = x * cellWidth + Math.random() * cellWidth;
      const py = y * cellHeight + Math.random() * cellHeight;
      this.ctx.fillStyle = 'rgba(255, 240, 180, 0.5)';
      this.ctx.fillRect(px, py, 1, 1);
    }
  }
  
  // 森林斑点效果
  private addForestSpots(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.fillStyle = 'rgba(0, 80, 0, 0.3)';
    for (let i = 0; i < 3; i++) {
      const px = x * cellWidth + Math.random() * cellWidth;
      const py = y * cellHeight + Math.random() * cellHeight;
      const radius = Math.random() * 3 + 1;
      this.ctx.beginPath();
      this.ctx.arc(px, py, radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // 山脉条纹效果
  private addMountainStripes(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const yPos = y * cellHeight + Math.random() * cellHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellWidth, yPos);
      this.ctx.lineTo((x + 1) * cellWidth, yPos);
      this.ctx.stroke();
    }
  }
  
  // 平原草地图案
  private addPlainsTexture(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.fillStyle = 'rgba(0, 150, 50, 0.2)';
    for (let i = 0; i < 4; i++) {
      const px = x * cellWidth + Math.random() * cellWidth;
      const py = y * cellHeight + Math.random() * cellHeight;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 1, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  // 绘制网格线
  private drawGridLines(terrainGrid: TerrainGrid, cellWidth: number, cellHeight: number) {
    // 只有在网格大小适中时才绘制网格线
    if (terrainGrid.length <= 50 && terrainGrid[0].length <= 50) {
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      this.ctx.lineWidth = 0.5;
      
      // 水平线
      for (let y = 0; y <= terrainGrid.length; y++) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y * cellHeight);
        this.ctx.lineTo(terrainGrid[0].length * cellWidth, y * cellHeight);
        this.ctx.stroke();
      }
      
      // 垂直线
      for (let x = 0; x <= terrainGrid[0].length; x++) {
        this.ctx.beginPath();
        this.ctx.moveTo(x * cellWidth, 0);
        this.ctx.lineTo(x * cellWidth, terrainGrid.length * cellHeight);
        this.ctx.stroke();
      }
    }
  }
}