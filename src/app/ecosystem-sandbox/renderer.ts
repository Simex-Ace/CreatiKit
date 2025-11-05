import { Organism, Food, Stats } from './types';

export class EcosystemRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvasWidth: number;
  private canvasHeight: number;
  private devicePixelRatio: number;

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
  }

  // 清空画布
  clear() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  // 绘制食物
  drawFoods(foods: Food[]) {
    if (foods.length === 0) return;
    
    this.ctx.save();
    this.ctx.fillStyle = 'hsl(120, 100%, 40%)';
    
    foods.forEach(food => {
      this.ctx.beginPath();
      this.ctx.arc(food.x, food.y, food.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.restore();
  }

  // 绘制单个生物
  private drawOrganism(organism: Organism) {
    // 根据饥饿值调整颜色
    let displayColor = organism.color;
    if (organism.hunger < 30) {
      const green = Math.floor(100 * (organism.hunger / 30));
      displayColor = `rgba(255, ${green}, ${green}, 0.9)`;
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
    
    // 饥饿值条
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

  // 批量绘制生物
  drawOrganisms(organisms: Organism[]) {
    if (organisms.length === 0) return;
    
    this.ctx.save();
    
    organisms.forEach(organism => {
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
}