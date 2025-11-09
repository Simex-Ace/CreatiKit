import { Organism, Food, Stats, TerrainGrid, TerrainType, Thunderstorm } from './types';
import { EcosystemManager } from './ecosystem-manager';
import cyanobacteriaImage from './image/蓝藻菌.png';
import amoebaImage from './image/变形虫.png';
import waterMoldImage from './image/水霉菌.png';
import primordialSoupImage from './image/原始汤.png';
import directionIndicatorImage from './image/运动方向.png';
// 导入地形图片
import oceanImage from './image/bg/海洋.png';
import beachImage from './image/bg/沙滩.png';
import plainsImage from './image/bg/平原.png';
import forestImage from './image/bg/森林.png';
import mountainImage from './image/bg/山脉.png';

export class EcosystemRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private devicePixelRatio: number;
  private ecosystemManager: EcosystemManager | null = null;
  private lastRenderTime: number = performance.now();
  private darknessBase: number = 0.6; // 基础暗度
  private darknessVariation: number = 0.3; // 变化范围
  private randomUpdateInterval: number = 1000; // 增加随机更新间隔，使变化更慢（1000毫秒即1秒）
  private currentDarkness: number = 0.6; // 当前暗度值
  private targetDarkness: number = 0.6; // 目标暗度值（用于平滑过渡）
  private transitionSpeed: number = 0.02; // 过渡速度（值越小过渡越平滑）
  
  // 地形类型对应的图片映射
  private terrainImages: Record<string, HTMLImageElement> = {
    ocean: new Image(),
    beach: new Image(),
    plains: new Image(),
    forest: new Image(),
    mountain: new Image()
  };
  
  // 地形类型对应的颜色映射（作为图片加载失败的后备）
  private terrainColors: Record<string, string> = {
    ocean: '#0000ff',       // 海洋蓝色
    beach: '#f5deb3',       // 沙滩米色
    plains: '#aaffaa',      // 真正的浅绿色
    forest: '#006400',      // 森林深绿色
    mountain: '#8b4513'     // 山脉褐色
  };

  // 生物图片
  private organismImages: Record<string, HTMLImageElement> = {
    basic: new Image(),
    predator: new Image(),
    scavenger: new Image()
  };
  
  // 其他图片
  private primordialSoupImage: HTMLImageElement;
  private directionIndicatorImage: HTMLImageElement;
  
  // CSS像素的画布尺寸
  private cssCanvasWidth: number;
  private cssCanvasHeight: number;

  constructor(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number, devicePixelRatio: number) {
    this.ctx = ctx;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.devicePixelRatio = devicePixelRatio;
    
    // 计算CSS像素尺寸
    this.cssCanvasWidth = canvasWidth / devicePixelRatio;
    this.cssCanvasHeight = canvasHeight / devicePixelRatio;
    
    // 设置缩放以支持Hi-DPI显示
    this.ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // 禁用图像平滑以提高性能
    this.ctx.imageSmoothingEnabled = false;
    
    // 加载生物图片
    this.organismImages.basic.src = cyanobacteriaImage.src || '';
    this.organismImages.predator.src = amoebaImage.src || '';
    this.organismImages.scavenger.src = waterMoldImage.src || '';
    
    // 加载其他图片
    this.primordialSoupImage = new Image();
    this.primordialSoupImage.src = primordialSoupImage.src || '';
    this.directionIndicatorImage = new Image();
    this.directionIndicatorImage.src = directionIndicatorImage.src || '';
    
    // 加载地形图片
    this.terrainImages.ocean.src = oceanImage.src || '';
    this.terrainImages.beach.src = beachImage.src || '';
    this.terrainImages.plains.src = plainsImage.src || '';
    this.terrainImages.forest.src = forestImage.src || '';
    this.terrainImages.mountain.src = mountainImage.src || '';
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
  }
  
  // 更新动画进度（简化版本）
  updateAnimation(deltaTime: number) {
    // 简化实现，移除复杂的动画计算
  }

  // 清空画布 - 高性能版本
  clear() {
    // 直接使用transformed上下文清除，避免save/restore和getTransform/setTransform的开销
    this.ctx.clearRect(0, 0, this.cssCanvasWidth, this.cssCanvasHeight);
  }

  // 简单的视口剔除
  private isInViewport(x: number, y: number, size: number): boolean {
    return x + size >= 0 && x - size <= this.cssCanvasWidth && 
           y + size >= 0 && y - size <= this.cssCanvasHeight;
  }

  // 简化的食物绘制
  drawFoods(ctx: CanvasRenderingContext2D, foods: Food[]) {
    if (foods.length === 0) return;
    
    const hasImage = this.primordialSoupImage.complete && this.primordialSoupImage.src;
    const flashDuration = 300;
    
    for (let i = 0; i < foods.length; i++) {
      const food = foods[i];
      
      // 简单的视口剔除
      if (!this.isInViewport(food.x, food.y, food.size * 3)) continue;
      
      if (hasImage) {
        // 处理闪烁效果
        if (food.isFlashing && food.flashTime) {
          const progress = (performance.now() - food.flashTime) / flashDuration;
          if (progress <= 1) {
            ctx.globalAlpha = 1 - progress;
          }
        }
        
        const foodSize = food.size * 3;
        ctx.drawImage(
          this.primordialSoupImage,
          Math.floor(food.x - foodSize / 2),
          Math.floor(food.y - foodSize / 2),
          foodSize,
          foodSize
        );
        
        // 恢复透明度
        if (food.isFlashing && food.flashTime) {
          ctx.globalAlpha = 1;
        }
      } else {
        // 图片未加载时的回退方案
        ctx.fillStyle = 'hsl(120, 100%, 40%)';
        ctx.beginPath();
        ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  // 绘制雷暴和闪电
  drawThunderstorms(ctx: CanvasRenderingContext2D, thunderstorms: any[]) {
    if (!thunderstorms || thunderstorms.length === 0) return;

    for (let i = 0; i < thunderstorms.length; i++) {
      const storm = thunderstorms[i];
      if (storm && storm.isActive && typeof storm.x === 'number' && typeof storm.y === 'number') {
        // 直接使用storm的x和y属性，而不是storm.position
        const x = storm.x;
        const y = storm.y;
        
        // 计算闪电动画进度（基于持续时间和已过时间）
        let alpha = storm.flashProgress || 0;
        if (storm.startTime && storm.duration) {
          const now = performance.now();
          const elapsed = now - storm.startTime;
          // 创建闪烁效果
          if (elapsed < storm.duration) {
            // 使用正弦波创建闪烁效果
            alpha = 0.5 + 0.5 * Math.sin(elapsed * 0.01);
          }
        }

        // 始终绘制雷暴效果，即使alpha较低
        if (alpha > 0) {
          // 绘制发光效果
          ctx.save();
          ctx.globalAlpha = alpha * 0.1;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(x - 50, y - 50, 100, 100);
          ctx.restore();

          // 绘制闪电（更频繁地触发闪电）
          if (alpha > 0.3) {
            const numBranches = 1 + Math.floor(Math.random() * 3); // 1-3道闪电
            for (let b = 0; b < numBranches; b++) {
              const offsetX = (Math.random() - 0.5) * 30;
              const offsetY = Math.random() * 20;
              // 调整闪电终点更接近雷暴中心，使原始汤生成位置与闪电更匹配
              const endX = x + (Math.random() - 0.5) * 20;
              const endY = y + 40 + Math.random() * 30;
              
              this.drawLightningBolt(ctx, x + offsetX, y + offsetY, endX, endY, 2, '#FFFFFF', alpha * 0.8);
            }
          }
        }
      }
    }
  }
  

  
  // 绘制闪电形状的辅助方法
  private drawLightningBolt(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number, width: number, color: string, alpha: number) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 保存状态
    ctx.save();
    
    // 创建闪电路径
    const points = this.createLightningPoints(startX, startY, endX, endY, 5 + Math.floor(Math.random() * 5));
    
    // 绘制主闪电
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    
    ctx.stroke();
    
    // 添加发光效果
    ctx.lineWidth = width * 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    
    // 恢复状态
    ctx.restore();
  }
  
  // 创建闪电路径点的辅助方法
  private createLightningPoints(startX: number, startY: number, endX: number, endY: number, segments: number) {
    const points = [{ x: startX, y: startY }];
    const dx = endX - startX;
    const dy = endY - startY;
    const segmentLength = Math.sqrt(dx * dx + dy * dy) / segments;
    
    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      // 基础位置
      const baseX = startX + dx * progress;
      const baseY = startY + dy * progress;
      
      // 添加随机偏移
      const offsetX = (Math.random() - 0.5) * segmentLength * 1.2;
      const offsetY = (Math.random() - 0.5) * segmentLength * 0.5;
      
      points.push({ x: baseX + offsetX, y: baseY + offsetY });
    }
    
    // 添加终点
    points.push({ x: endX, y: endY });
    
    return points;
  }

  // 简化的生物绘制
  drawOrganisms(organisms: Organism[]) {
    if (organisms.length === 0) return;
    
    for (let i = 0; i < organisms.length; i++) {
      const organism = organisms[i];
      
      // 简单的视口剔除
      if (!this.isInViewport(organism.x, organism.y, organism.size * 5)) continue;
      
      // 获取对应的生物图片
      const image = this.organismImages[organism.type];
      
      // 处理饥饿状态的透明度
      if (organism.hunger < 30 && !organism.isBreeding) {
        this.ctx.globalAlpha = 0.5 + organism.hunger / 60;
      }
      
      // 绘制生物图片
      const imageSize = organism.size * 2;
      const xPos = Math.floor(organism.x - imageSize / 2);
      const yPos = Math.floor(organism.y - imageSize / 2);
      this.ctx.drawImage(image, xPos, yPos, imageSize, imageSize);
      
      // 恢复透明度
      this.ctx.globalAlpha = 1;
      
      // 绘制地形色调叠加效果
      this.drawTerrainTint(organism);
      
      // 绘制食物检测光环（如果需要）
      if (organism.isDetectingFood && organism.detectedFoodDistance !== undefined) {
        this.drawFoodDetectionAura(organism);
      }
      
      // 绘制繁殖特效（如果需要）
      if (organism.isBreeding) {
        this.drawBreedingEffect(organism);
        this.drawBreedingHeart(organism);
      } else {
        // 绘制方向指示器和饥饿条
        this.drawDirectionIndicator(organism);
        if (organism.hunger < 50) {
          this.drawHungerBar(organism);
        }
      }
    }
  }
  
  // 简化的繁殖特效绘制
  private drawBreedingEffect(organism: Organism) {
    // 绘制繁殖进度条
    const progressBarWidth = organism.size * 3;
    const progressBarHeight = 4;
    const progressBarY = organism.y - organism.size - 10;
    const xPos = organism.x - progressBarWidth / 2;
    
    // 进度条背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.ctx.fillRect(xPos, progressBarY, progressBarWidth, progressBarHeight);
    
    // 进度条填充
    const progress = (organism.breedingProgress || 0) / 100;
    this.ctx.fillStyle = `hsl(${270 + progress * 20}, 100%, 50%)`;
    this.ctx.fillRect(xPos, progressBarY, progressBarWidth * progress, progressBarHeight);
    
    // 进度百分比文本（仅在进度大于10%时显示）
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
  
  // 简化的食物检测光环绘制
  private drawFoodDetectionAura(organism: Organism) {
    // 根据距离调整光环大小和透明度
    const baseRadius = organism.size * 1.5;
    const maxRadius = organism.size * 5;
    const distanceRatio = Math.min(1, (organism.detectedFoodDistance ?? 100) / 100);
    const outerRadius = baseRadius + (maxRadius - baseRadius) * (1 - distanceRatio);
    const ringThickness = organism.size * 0.3;
    const innerRadius = outerRadius - ringThickness;
    
    // 绘制主光环（实心绿色环）
    this.ctx.beginPath();
    this.ctx.arc(organism.x, organism.y, outerRadius, 0, Math.PI * 2);
    this.ctx.arc(organism.x, organism.y, innerRadius, 0, Math.PI * 2, true);
    this.ctx.fillStyle = 'hsla(120, 100%, 40%, 0.3)';
    this.ctx.fill();
  }
  
  // 绘制地形色调叠加效果
  private drawTerrainTint(organism: Organism) {
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
  }
  
  // 使用箭头图标绘制方向指示器 - 在生物体前方指引
  private drawDirectionIndicator(organism: Organism) {
    // 确保所有生物类型都有方向指示器，包括蓝藻
    // 确保生物体有有效的方向属性
    const direction = organism.direction !== undefined ? organism.direction : 0;
    
    // 计算方向指示器的大小
    const indicatorSize = organism.size * 1.2;
    
    // 计算方向指示器的位置（在生物体移动方向的前方）
    const offsetDistance = organism.size * 1.8; // 偏移距离，确保在生物前方
    const indicatorX = organism.x + Math.cos(direction) * offsetDistance;
    const indicatorY = organism.y + Math.sin(direction) * offsetDistance;
    
    // 尝试使用图片绘制
    try {
      // 保存当前状态
      this.ctx.save();
      
      // 移动到生物体前方位置并旋转
      this.ctx.translate(indicatorX, indicatorY);
      
      // 对于方向键图片（竖直向上），旋转角度需要调整，使其指向移动方向
      // 因为图片本身是竖直向上的，而0角度在Canvas中是向右的
      // 修正旋转方向，让图片正确指向移动方向
      this.ctx.rotate(direction + Math.PI / 2);
      
      // 检查方向指示器图片是否可用
      if (this.directionIndicatorImage && this.directionIndicatorImage.complete && this.directionIndicatorImage.src) {
        // 使用图片绘制
        this.ctx.drawImage(
          this.directionIndicatorImage,
          -indicatorSize / 2,
          -indicatorSize / 2,
          indicatorSize,
          indicatorSize
        );
      } else {
        // 直接绘制一个箭头形状，确保箭头指向正确的方向
        this.ctx.fillStyle = '#00ff64';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -indicatorSize / 2); // 箭头顶部
        this.ctx.lineTo(-indicatorSize / 2, indicatorSize / 2); // 左下
        this.ctx.lineTo(-indicatorSize / 4, indicatorSize / 2); // 左中
        this.ctx.lineTo(-indicatorSize / 4, indicatorSize / 4); // 底部
        this.ctx.lineTo(indicatorSize / 4, indicatorSize / 4); // 底部右侧
        this.ctx.lineTo(indicatorSize / 4, indicatorSize / 2); // 右中
        this.ctx.lineTo(indicatorSize / 2, indicatorSize / 2); // 右下
        this.ctx.closePath();
        this.ctx.fill();
      }
      
      // 恢复状态
      this.ctx.restore();
    } catch (error) {
      // 如果出现任何错误，绘制简单线条作为最终回退方案
      console.warn('绘制方向指示器时出错:', error);
      
      this.ctx.beginPath();
      // 从生物体前方开始绘制线条，避免重叠
      const startX = organism.x + Math.cos(direction) * organism.size * 1.2;
      const startY = organism.y + Math.sin(direction) * organism.size * 1.2;
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(
        startX + Math.cos(direction) * organism.size * 1.5,
        startY + Math.sin(direction) * organism.size * 1.5
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
    
    this.ctx.fillStyle = 'rgba(248, 21, 134, 0.9)';
    this.ctx.fill();
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
    this.ctx.fillRect(0, 0, this.cssCanvasWidth, this.cssCanvasHeight);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 24px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(
      '已暂停',
      this.cssCanvasWidth / 2,
      this.cssCanvasHeight / 2
    );
    this.ctx.restore();
  }
  
  // 使用图片绘制地形
  drawTerrain(terrainGrid: TerrainGrid | null, gridSize: number) {
    if (!terrainGrid || terrainGrid.length === 0 || terrainGrid[0].length === 0) {
      return;
    }
    
    const cellWidth = this.cssCanvasWidth / terrainGrid[0].length;
    const cellHeight = this.cssCanvasHeight / terrainGrid.length;
    
    // 直接绘制地形
    for (let y = 0; y < terrainGrid.length; y++) {
      for (let x = 0; x < terrainGrid[y].length; x++) {
        const terrainType = terrainGrid[y][x].type;
        const image = this.terrainImages[terrainType];
        
        if (image && image.complete && image.src) {
          // 使用图片绘制地形
          this.ctx.drawImage(
            image,
            x * cellWidth,
            y * cellHeight,
            cellWidth + 1,  // 加1避免缝隙
            cellHeight + 1
          );
        } else {
          // 图片加载失败时使用颜色作为后备
          const color = this.terrainColors[terrainType] || 'hsl(0, 0%, 95%)';
          this.ctx.fillStyle = color;
          this.ctx.fillRect(
            x * cellWidth,
            y * cellHeight,
            cellWidth + 1,
            cellHeight + 1
          );
        }
      }
    }
  }
  
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
  
  // 主渲染函数
  render() {
    // 清除画布
    this.clear();
    
    // 绘制地形
    if (this.ecosystemManager) {
      const terrainGrid = this.ecosystemManager.getTerrainGrid();
      const gridSize = this.ecosystemManager.getTerrainGridSize();
      this.drawTerrain(terrainGrid, gridSize);
      
      // 绘制食物
      const { foods } = this.ecosystemManager.getState();
      this.drawFoods(this.ctx, foods);
      
      // 绘制生物
      const { organisms } = this.ecosystemManager.getState();
      this.drawOrganisms(organisms);
      
      // 绘制雷暴（放在最后确保不被覆盖）
      const thunderstorms = this.ecosystemManager.getThunderstorms();
      this.drawThunderstorms(this.ctx, thunderstorms);
      
      // 计算随机变化的暗度值，不规律更新以营造恶劣天气效果
      const currentTime = performance.now();
      const elapsed = currentTime - this.lastRenderTime;
      
      // 每隔一段时间随机更新目标暗度值
      if (elapsed >= this.randomUpdateInterval) {
        this.lastRenderTime = currentTime;
        // 随机生成新的目标暗度值，在基础暗度附近波动
        const randomFactor = (Math.random() - 0.5) * 2; // 生成 -1 到 1 之间的随机数
        this.targetDarkness = Math.max(0, Math.min(1, this.darknessBase + this.darknessVariation * randomFactor));
      }
      
      // 使用平滑过渡算法更新当前暗度值
      // 向目标暗度值逐渐靠拢，创造缓和的过渡效果
      this.currentDarkness += (this.targetDarkness - this.currentDarkness) * this.transitionSpeed;
      
      // 使用当前平滑过渡后的暗度值
      const alpha = this.currentDarkness;
      
      // 添加动态变化的半透明黑色覆盖层
      this.ctx.save();
      this.ctx.globalAlpha = alpha; // 动态变化的透明度
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.ctx.restore();
    }
  }
}