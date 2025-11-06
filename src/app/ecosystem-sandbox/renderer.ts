import { Organism, Food, Stats, TerrainGrid, TerrainType } from './types';
import { EcosystemManager } from './ecosystem-manager';
import cyanobacteriaImage from './image/蓝藻菌.png';
import amoebaImage from './image/变形虫.png';
import waterMoldImage from './image/水霉菌.png';
import primordialSoupImage from './image/原始汤.png';
import directionIndicatorImage from './image/运动方向.png';

export class EcosystemRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private devicePixelRatio: number;
  private ecosystemManager: EcosystemManager | null = null;
  
  // 地形类型对应的颜色映射 - 使用正确的绿色系
  private terrainColors: Record<string, string> = {
    ocean: '#0000ff',       // 海洋蓝色
    beach: '#f5deb3',       // 沙滩米色
    plains: '#aaffaa',      // 真正的浅绿色
    forest: '#006400',      // 森林深绿色
    mountain: '#8b4513'     // 山脉褐色
  };

  // 生物图片缓存
  private organismImages: Record<string, HTMLImageElement> = {
    basic: new Image(),
    predator: new Image(),
    scavenger: new Image()
  };
  
  // 其他图片
  private primordialSoupImage: HTMLImageElement;
  private directionIndicatorImage: HTMLImageElement;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, devicePixelRatio: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.devicePixelRatio = devicePixelRatio;
    
    // 设置缩放以支持Hi-DPI显示
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // 预加载生物图片
    this.organismImages.basic.src = cyanobacteriaImage.src || '';
    this.organismImages.predator.src = amoebaImage.src || '';
    this.organismImages.scavenger.src = waterMoldImage.src || '';
    
    // 预加载其他图片
    this.primordialSoupImage = new Image();
    this.primordialSoupImage.src = primordialSoupImage.src || '';
    this.directionIndicatorImage = new Image();
    this.directionIndicatorImage.src = directionIndicatorImage.src || '';
  }
  
  // 设置生态系统管理器引用
  setEcosystemManager(manager: EcosystemManager) {
    this.ecosystemManager = manager;
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
      
      // 计算食物尺寸
      const foodSize = food.size * 3; // 调整尺寸以适应图片
      
      // 如果图片加载完成，使用原始汤图片
      if (this.primordialSoupImage.complete && this.primordialSoupImage.src) {
        // 闪烁效果处理
        if (food.isFlashing && food.flashTime) {
          const progress = (now - food.flashTime) / flashDuration;
          const alpha = 1 - progress;
          ctx.globalAlpha = alpha;
        }
        
        ctx.drawImage(
          this.primordialSoupImage,
          food.x - foodSize / 2,
          food.y - foodSize / 2,
          foodSize,
          foodSize
        );
      } else {
        // 图片未加载完成时的回退显示
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
        ctx.fillStyle = 'hsl(120, 100%, 40%)';
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    ctx.restore();
  }

  // 绘制单个生物
  private drawOrganism(organism: Organism) {
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
    
    // 绘制生物图片
    const image = this.organismImages[organism.type] || this.organismImages.basic;
    const imageSize = organism.size * 2;

    // 保存上下文状态
    this.ctx.save();

    // 应用饥饿效果 - 饥饿时降低不透明度
    if (organism.hunger < 30 && !organism.isBreeding) {
      this.ctx.globalAlpha = 0.5 + organism.hunger / 60; // 范围从0.5到1
    }

    // 绘制图片
    this.ctx.drawImage(
      image,
      organism.x - imageSize / 2,
      organism.y - imageSize / 2,
      imageSize,
      imageSize
    );

    // 恢复上下文状态
    this.ctx.restore();
    
    // 应用地形色调叠加效果
    if (!organism.isBreeding && organism.currentTerrainType && this.ecosystemManager) {
      const terrainEffect = this.ecosystemManager.getTerrainEffect(organism.currentTerrainType);
      if (terrainEffect?.colorTint) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'overlay';
        this.ctx.fillStyle = terrainEffect.colorTint;
        this.ctx.beginPath();
        this.ctx.arc(organism.x, organism.y, organism.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
    
    // 繁殖状态不显示方向指示器
    if (!organism.isBreeding) {
      // 使用运动方向图片作为指示器
      if (this.directionIndicatorImage.complete && this.directionIndicatorImage.src) {
        this.ctx.save();
        
        // 计算指示器位置（在生物前面）
        const indicatorDistance = organism.size * 1.2;
        const indicatorX = organism.x + Math.cos(organism.direction) * indicatorDistance;
        const indicatorY = organism.y + Math.sin(organism.direction) * indicatorDistance;
        
        // 保存当前状态
        this.ctx.save();
        
        // 移动到指示器中心并旋转以匹配生物方向
        // 调整旋转角度，使箭头方向正确
        this.ctx.translate(indicatorX, indicatorY);
        // 修改旋转角度，使箭头指向生物运动方向
        this.ctx.rotate(organism.direction + Math.PI / 2);
        
        // 绘制方向图片
        const indicatorSize = organism.size * 1.2; // 增大尺寸到原来的1.5倍
        this.ctx.drawImage(
          this.directionIndicatorImage,
          -indicatorSize / 2,
          -indicatorSize / 2,
          indicatorSize,
          indicatorSize
        );
        
        // 恢复状态
        this.ctx.restore();
      } else {
        // 图片未加载完成时的回退显示
        this.ctx.beginPath();
        this.ctx.moveTo(organism.x, organism.y);
        this.ctx.lineTo(
          organism.x + Math.cos(organism.direction) * organism.size * 1.5,
          organism.y + Math.sin(organism.direction) * organism.size * 1.5
        );
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
      
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
        // 确保单元格之间没有缝隙，略微扩大绘制区域
        this.ctx.fillRect(
          x * cellWidth,
          y * cellHeight,
          cellWidth + 1,  // 增加1px避免缝隙
          cellHeight + 1  // 增加1px避免缝隙
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
      const startX = x * cellWidth;
      const startY = y * cellHeight + Math.random() * cellHeight;
      const endX = x * cellWidth + cellWidth;
      const endY = startY + (Math.random() - 0.5) * 10;
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.stroke();
    }
  }
  
  // 平原草地图案
  private addPlainsTexture(x: number, y: number, cellWidth: number, cellHeight: number) {
    this.ctx.fillStyle = 'rgba(0, 150, 50, 0.2)';
    for (let i = 0; i < 8; i++) {
      const px = x * cellWidth + Math.random() * cellWidth;
      const py = y * cellHeight + cellHeight * 0.7 + Math.random() * cellHeight * 0.3;
      const height = Math.random() * 5 + 2;
      const width = 1;
      this.ctx.fillRect(px, py - height, width, height);
    }
  }

  // 绘制网格线（可选）
  private drawGridLines(terrainGrid: TerrainGrid, cellWidth: number, cellHeight: number) {
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= terrainGrid[0].length; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * cellWidth, 0);
      this.ctx.lineTo(x * cellWidth, terrainGrid.length * cellHeight);
      this.ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= terrainGrid.length; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * cellHeight);
      this.ctx.lineTo(terrainGrid[0].length * cellWidth, y * cellHeight);
      this.ctx.stroke();
    }
  }
}