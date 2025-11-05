import { Organism, Food, SandboxConfig } from './types';
import { createOrganism, createFood } from './utils';

export class EcosystemManager {
  private organisms: Organism[];
  private foods: Food[];
  private config: SandboxConfig;
  private idCounter: { current: number };
  private foodIdCounter: { current: number };
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(
    config: SandboxConfig,
    idCounter: { current: number },
    foodIdCounter: { current: number },
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.organisms = [];
    this.foods = [];
    this.config = config;
    this.idCounter = idCounter;
    this.foodIdCounter = foodIdCounter;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  // 更新配置
  updateConfig(newConfig: Partial<SandboxConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // 如果速度改变，更新现有生物的速度
    if (newConfig.speed !== undefined) {
      this.organisms.forEach(organism => {
        organism.speed = Math.random() * 0.5 + newConfig.speed! * 0.5;
      });
    }
  }

  // 获取当前状态
  getState() {
    return {
      organisms: this.organisms,
      foods: this.foods
    };
  }

  // 设置画布尺寸
  setCanvasSize(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  // 批量初始化生物
  initOrganisms(count: number) {
    this.organisms = [];
    for (let i = 0; i < count; i++) {
      this.organisms.push(createOrganism('basic', this.idCounter, this.canvasWidth, this.canvasHeight, this.config));
    }
  }

  // 批量初始化食物
  initFoods(count: number) {
    this.foods = [];
    for (let i = 0; i < count; i++) {
      this.foods.push(createFood(this.foodIdCounter, this.canvasWidth, this.canvasHeight));
    }
  }

  // 添加单个生物
  addOrganism() {
    this.organisms.push(createOrganism('basic', this.idCounter, this.canvasWidth, this.canvasHeight, this.config));
  }

  // 清空所有生物
  clearAllOrganisms() {
    this.organisms = [];
  }

  // 重置食物
  resetFoods() {
    this.initFoods(this.config.foodCount);
  }

  // 处理一次生态系统更新
  update() {
    if (!this.config.isRunning || this.organisms.length === 0) return;
    
    // 合并多次遍历为一次，提高性能
    const newOrganisms: Organism[] = [];
    const foodIndicesToRemove = new Set<number>();
    
    // 单次遍历完成更新、吃食物和死亡检查
    for (let i = 0; i < this.organisms.length; i++) {
      const organism = this.organisms[i];
      
      // 更新生物状态
      organism.update(this.foods);
      
      // 处理吃食物 - 直接计算，避免重复调用findNearestFood
      for (let j = 0; j < this.foods.length; j++) {
        if (foodIndicesToRemove.has(j)) continue;
        
        const dx = organism.x - this.foods[j].x;
        const dy = organism.y - this.foods[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const eatRadius = organism.size * 1.2;
        
        if (distance <= eatRadius) {
          // 吃到食物
          foodIndicesToRemove.add(j);
          organism.hunger = Math.min(100, organism.hunger + 20);
          
          // 清道夫效率加成
          if (organism.type === 'scavenger') {
            organism.hunger = Math.min(100, organism.hunger + 10);
          }
          break; // 只吃一个食物
        }
      }
      
      // 检查死亡
      if (organism.hunger <= 0) {
        // 死亡生成食物
        if (Math.random() < 0.7) {
          this.foods.push({
            id: this.foodIdCounter.current++,
            x: organism.x,
            y: organism.y,
            size: 4,
            color: 'hsl(120, 100%, 60%)'
          });
        }
        continue;
      }
      
      // 处理进化 - 每帧只让少数生物尝试进化
      if (organism.canEvolve && Math.random() < 0.005) {
        const evolved = organism.evolve();
        if (evolved) {
          newOrganisms.push(evolved);
        }
      }
      
      newOrganisms.push(organism);
    }
    
    // 删除被吃掉的食物
    const remainingFoods: Food[] = [];
    for (let j = 0; j < this.foods.length; j++) {
      if (!foodIndicesToRemove.has(j)) {
        remainingFoods.push(this.foods[j]);
      }
    }
    this.foods = remainingFoods;
    
    // 更新生物列表
    this.organisms = newOrganisms;
    
    // 批量补充食物
    while (this.foods.length < this.config.foodCount * 0.7 && Math.random() < 0.05) {
      this.foods.push(createFood(this.foodIdCounter, this.canvasWidth, this.canvasHeight));
    }
  }

  // 计算FPS和性能统计
  calculateStats(currentFps: number, currentFrameTime: number): { fps: number; frameTime: number; organismTypes: { basic: number; predator: number; scavenger: number } } {
    const organismTypes = { basic: 0, predator: 0, scavenger: 0 };
    this.organisms.forEach(org => organismTypes[org.type]++);
    
    return {
      fps: currentFps,
      frameTime: currentFrameTime,
      organismTypes
    };
  }
}