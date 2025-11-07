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
  
  // 性能优化：缓存上次的动画时间戳
  private lastTimestamp: number = 0;
  private animationProgress: number = 0;
  
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
  
  // 性能优化：缓存CSS像素的画布尺寸
  private cssCanvasWidth: number;
  private cssCanvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, devicePixelRatio: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.devicePixelRatio = devicePixelRatio;
    
    // 计算并缓存CSS像素尺寸
    this.cssCanvasWidth = canvasWidth / devicePixelRatio;
    this.cssCanvasHeight = canvasHeight / devicePixelRatio;
    
    // 设置缩放以支持Hi-DPI显示
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // 禁用图像平滑以提高性能
    this.ctx.imageSmoothingEnabled = false;
    
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
    // 更新缓存的CSS像素尺寸
    this.cssCanvasWidth = canvasWidth / this.devicePixelRatio;
    this.cssCanvasHeight = canvasHeight / this.devicePixelRatio;
    // 不需要重新缩放，因为在构造函数中已经处理过了
  }
  
  // 更新动画进度
  updateAnimation(timestamp: number) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const deltaTime = Math.min(timestamp - this.lastTimestamp, 50); // 限制最大时间增量
    this.lastTimestamp = timestamp;
    
    // 更新动画进度 (0-1之间循环)
    this.animationProgress = (this.animationProgress + deltaTime * 0.004) % 1;
  }

  // 清空画布 - 优化版本
  clear() {
    // 直接使用transformed上下文清除，避免save/restore和getTransform/setTransform的开销
    this.ctx.clearRect(0, 0, this.cssCanvasWidth, this.cssCanvasHeight);
  }

  // 绘制食物 - 优化版本
  drawFoods(ctx: CanvasRenderingContext2D, foods: Food[]) {
    if (foods.length === 0) return;
    
    const flashDuration = 300;
    const now = performance.now();
    
    // 批量处理图片食物和回退显示食物，减少状态切换
    const hasImage = this.primordialSoupImage.complete && this.primordialSoupImage.src;
    
    // 一次性保存状态
    ctx.save();
    
    if (hasImage) {
      foods.forEach(food => {
        // 计算食物尺寸
        const foodSize = food.size * 3; // 调整尺寸以适应图片
        
        // 闪烁效果处理
        if (food.isFlashing && food.flashTime) {
          const progress = (now - food.flashTime) / flashDuration;
          if (progress <= 1) { // 只在闪烁时间范围内处理
            ctx.globalAlpha = 1 - progress;
            
            ctx.drawImage(
              this.primordialSoupImage,
              Math.floor(food.x - foodSize / 2), // 使用整数坐标
              Math.floor(food.y - foodSize / 2),
              foodSize,
              foodSize
            );
            
            ctx.globalAlpha = 1; // 恢复透明度
            return;
          }
        }
        
        // 普通绘制
        ctx.drawImage(
          this.primordialSoupImage,
          Math.floor(food.x - foodSize / 2),
          Math.floor(food.y - foodSize / 2),
          foodSize,
          foodSize
        );
      });
    } else {
      // 图片未加载完成时的回退显示 - 批量设置样式
      // ctx.beginPath();
      // ctx.fillStyle = 'hsl(120, 100%, 40%)';
      
      foods.forEach(food => {
        ctx.moveTo(food.x + food.size, food.y);
        ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
      });
      
      ctx.fill();
    }
    
    ctx.restore();
  }

  // 绘制单个生物 - 优化版本
  private drawOrganism(organism: Organism) {
    // 繁殖中的额外发光效果
    if (organism.isBreeding) {
      // 使用缓存的动画进度代替每次计算Date.now()
      const pulseRadius = organism.size * (1.3 + 0.2 * Math.sin(this.animationProgress * Math.PI * 2));
      
      // 绘制内部发光 - 改为绿色系
      // this.ctx.beginPath();
      // this.ctx.arc(organism.x, organism.y, organism.size * 1.2, 0, Math.PI * 2);
      // this.ctx.fillStyle = `hsla(120, 100%, 40%, ${0.4 + (organism.breedingProgress || 0) / 250})`;
      // this.ctx.fill();
      
      // 绘制脉动圆环 - 改为绿色系
      // this.ctx.beginPath();
      // this.ctx.arc(organism.x, organism.y, pulseRadius, 0, Math.PI * 2);
      // this.ctx.strokeStyle = `hsla(34, 87%, 47%, 0.60)`;
      // this.ctx.lineWidth = 2;
      // this.ctx.stroke();
    }
    
    // 绘制生物图片
    const image = this.organismImages[organism.type] || this.organismImages.basic;
    const imageSize = organism.size * 2;
    const xPos = Math.floor(organism.x - imageSize / 2); // 使用整数坐标避免模糊
    const yPos = Math.floor(organism.y - imageSize / 2);

    // 优化：仅在需要时保存状态
    if (organism.hunger < 30 && !organism.isBreeding) {
      this.ctx.globalAlpha = 0.5 + organism.hunger / 60; // 范围从0.5到1
      this.ctx.drawImage(image, xPos, yPos, imageSize, imageSize);
      this.ctx.globalAlpha = 1; // 直接恢复，避免save/restore
    } else {
      this.ctx.drawImage(image, xPos, yPos, imageSize, imageSize);
    }
    
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
      this.drawDirectionIndicator(organism);
      
      // 饥饿值条 - 繁殖状态不显示
      if (organism.hunger < 50) {
        this.drawHungerBar(organism);
      }
    }
    
    // 繁殖状态显示特殊标记
    if (organism.isBreeding) {
      this.drawBreedingHeart(organism);
    }
  }
  
  // 绘制方向指示器 - 提取为单独方法以减少重复代码
  private drawDirectionIndicator(organism: Organism) {
    if (this.directionIndicatorImage.complete && this.directionIndicatorImage.src) {
      // 计算指示器位置（在生物前面）
      const indicatorDistance = organism.size * 1.2;
      const indicatorX = organism.x + Math.cos(organism.direction) * indicatorDistance;
      const indicatorY = organism.y + Math.sin(organism.direction) * indicatorDistance;
      const indicatorSize = organism.size * 1.2;
      
      // 移动到指示器中心并旋转以匹配生物方向
      this.ctx.save();
      this.ctx.translate(indicatorX, indicatorY);
      this.ctx.rotate(organism.direction + Math.PI / 2);
      
      // 绘制方向图片
      this.ctx.drawImage(
        this.directionIndicatorImage,
        -indicatorSize / 2,
        -indicatorSize / 2,
        indicatorSize,
        indicatorSize
      );
      
      this.ctx.restore();
    } else {
      // 图片未加载完成时的回退显示 - 使用绿色
      this.ctx.beginPath();
      this.ctx.moveTo(organism.x, organism.y);
      this.ctx.lineTo(
        organism.x + Math.cos(organism.direction) * organism.size * 1.5,
        organism.y + Math.sin(organism.direction) * organism.size * 1.5
      );
      this.ctx.strokeStyle = '#00ff64';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  // 绘制饥饿值条
  private drawHungerBar(organism: Organism) {
    const barWidth = organism.size * 2;
    const barY = organism.y + organism.size + 5;
    const xPos = organism.x - barWidth / 2;
    
    // 背景条
    // this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    // this.ctx.fillRect(xPos, barY, barWidth, 2);
    
    // 饥饿值条
    const hungerWidth = (organism.hunger / 100) * barWidth;
    this.ctx.fillStyle = organism.hunger < 20 ? 'rgba(0, 200, 0, 0.8)' : 'rgba(0, 255, 100, 0.8)';
    this.ctx.fillRect(xPos, barY, hungerWidth, 2);
  }
  
  // 绘制繁殖爱心
  private drawBreedingHeart(organism: Organism) {
    const heartSize = organism.size * 0.5;
    
    this.ctx.beginPath();
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
    
    this.ctx.fillStyle = 'rgba(248, 21, 134, 0.9)'; // 红色爱心
    this.ctx.fill();
  }

  // 批量绘制生物 - 优化版本
  drawOrganisms(organisms: Organism[]) {
    if (organisms.length === 0) return;
    
    // 只在需要时保存状态
    this.ctx.save();
    
    // 使用缓存的动画进度代替每次计算Date.now()
    const pulseFactor = 0.8 + 0.2 * Math.sin(this.animationProgress * Math.PI * 2);
    
    organisms.forEach(organism => {
      // 绘制繁殖特效（如果正在繁殖）
      if (organism.isBreeding) {
        // 绘制发光效果 - 更明显的光晕，改为绿色系
        // this.ctx.beginPath();
        // this.ctx.arc(organism.x, organism.y, organism.size * 2, 0, Math.PI * 2);
        // this.ctx.fillStyle = `hsla(120, 100%, 40%, ${0.3 + (organism.breedingProgress || 0) / 300})`;
        // this.ctx.fill();
        
        // 绘制繁殖进度条 - 优化版本，避免渐变创建
        const progressBarWidth = organism.size * 3;
        const progressBarHeight = 4;
        const progressBarY = organism.y - organism.size - 10;
        const xPos = organism.x - progressBarWidth / 2;
        
        // 进度条背景 - 使用普通矩形代替roundRect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(xPos, progressBarY, progressBarWidth, progressBarHeight);
        
        // 进度条填充 - 使用纯色代替渐变，改为绿色系
        const progress = (organism.breedingProgress || 0) / 100;
        this.ctx.fillStyle = `hsl(${270 + progress * 20}, 100%, 50%)`; // 紫色系（基佬紫）色调变化
        this.ctx.fillRect(xPos, progressBarY, progressBarWidth * progress, progressBarHeight);
        
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
        // 优化光环绘制，减少路径复杂度
        this.drawFoodDetectionAura(organism, pulseFactor);
      }
      
      this.drawOrganism(organism);
    });
    
    this.ctx.restore();
  }
  
  // 绘制食物检测光环 - 提取为单独方法并优化
  private drawFoodDetectionAura(organism: Organism, pulseFactor: number) {
    // 根据距离调整光环大小和透明度
    const baseRadius = organism.size * 1.5;
    const maxRadius = organism.size * 5;
    const distanceRatio = Math.min(1, (organism.detectedFoodDistance ?? 100) / 100); // 限制在0-1范围内
    const outerRadius = baseRadius + (maxRadius - baseRadius) * (1 - distanceRatio);
    const ringThickness = organism.size * 0.3;
    const innerRadius = outerRadius - ringThickness;
    
    // 绘制纯绿色光环，无黑色边框
    // 1. 先保存当前状态
    this.ctx.save();
    
    // 2. 重置所有可能导致黑色边框的样式
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0)'; // 透明
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0)'; // 无阴影
    
    // 3. 绘制主光环（实心绿色环）
    this.ctx.beginPath();
    this.ctx.arc(organism.x, organism.y, outerRadius, 0, Math.PI * 2);
    this.ctx.arc(organism.x, organism.y, innerRadius, 0, Math.PI * 2, true); // 内环，反向绘制
    this.ctx.fillStyle = `hsla(120, 100%, 40%, ${0.3 * pulseFactor})`;
    this.ctx.fill();
    
    // 4. 绘制绿色内边缘
    this.ctx.beginPath();
    this.ctx.arc(organism.x, organism.y, innerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = `hsla(120, 100%, 60%, ${0.5 * pulseFactor})`;
    this.ctx.lineWidth = organism.size * 0.2;
    this.ctx.stroke();
    
    // 5. 绘制绿色外边缘
    this.ctx.beginPath();
    this.ctx.arc(organism.x, organism.y, outerRadius, 0, Math.PI * 2);
    this.ctx.strokeStyle = `hsla(120, 100%, 50%, ${0.6 * pulseFactor})`;
    this.ctx.stroke();
    
    // 6. 恢复状态
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
  
  // 绘制地形网格 - 优化版本
  drawTerrain(terrainGrid: TerrainGrid | null, gridSize: number) {
    if (!terrainGrid || terrainGrid.length === 0 || terrainGrid[0].length === 0) {
      return;
    }
    
    // 避免重复计算，使用缓存的CSS尺寸
    const cellWidth = this.cssCanvasWidth / terrainGrid[0].length;
    const cellHeight = this.cssCanvasHeight / terrainGrid.length;
    
    // 使用ImageData批量绘制地形，减少绘制调用次数
    const imageData = this.ctx.createImageData(this.cssCanvasWidth, this.cssCanvasHeight);
    const data = imageData.data;
    
    // 对每个地形类型进行分组绘制，减少状态切换
    const terrainGroups = new Map<string, Array<{x: number, y: number}>>();
    
    // 先分组
    for (let y = 0; y < terrainGrid.length; y++) {
      for (let x = 0; x < terrainGrid[y].length; x++) {
        const terrainType = terrainGrid[y][x].type;
        if (!terrainGroups.has(terrainType)) {
          terrainGroups.set(terrainType, []);
        }
        terrainGroups.get(terrainType)!.push({x, y});
      }
    }
    
    // 然后按组绘制
    terrainGroups.forEach((cells, terrainType) => {
      const color = this.terrainColors[terrainType] || 'hsl(0, 0%, 95%)';
      this.ctx.fillStyle = color;
      
      // 批量绘制相同地形类型的单元格
      cells.forEach(cell => {
        const x = cell.x * cellWidth;
        const y = cell.y * cellHeight;
        
        // 确保单元格之间没有缝隙
        this.ctx.fillRect(
          x,
          y,
          cellWidth + 1,
          cellHeight + 1
        );
      });
    });
  }
  
  // 地形特效方法移至单独模块或按需添加，目前为了性能优化暂时移除
  // 这些特效可以在需要时通过单独的方法调用

  // 绘制网格线（可选）
  private drawGridLines(terrainGrid: TerrainGrid, cellWidth: number, cellHeight: number) {
    // 优化版本：减少stroke()调用次数
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 0.5;
    
    // 批量绘制垂直线
    this.ctx.beginPath();
    for (let x = 0; x <= terrainGrid[0].length; x++) {
      this.ctx.moveTo(x * cellWidth, 0);
      this.ctx.lineTo(x * cellWidth, terrainGrid.length * cellHeight);
    }
    this.ctx.stroke();
    
    // 批量绘制水平线
    this.ctx.beginPath();
    for (let y = 0; y <= terrainGrid.length; y++) {
      this.ctx.moveTo(0, y * cellHeight);
      this.ctx.lineTo(terrainGrid[0].length * cellWidth, y * cellHeight);
    }
    this.ctx.stroke();
  }
}