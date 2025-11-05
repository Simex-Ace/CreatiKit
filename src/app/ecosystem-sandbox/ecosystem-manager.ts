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
        // 进一步降低基础速度，使生物移动更慢
        organism.speed = Math.random() * 0.15 + newConfig.speed! * 0.15;
      });
    }

    // 先创建默认配置对象
    const defaultConfig = {
      // 基本配置
      width: 800,
      height: 600,
      organismCount: 10,
      foodCount: 30,
      
      // 限制配置
      maxOrganisms: 50,
      maxFood: 100,
      
      // 行为配置
      speed: 0.3,
      foodSpawnRate: 0.05,
      foodSpawnThreshold: 0.7,
      evolutionThreshold: 300,
      breedingThreshold: 200,
      
      // 运行状态
      isRunning: true
    };
    
    // 合并默认配置和用户配置
    this.config = {
      ...defaultConfig,
      ...(this.config || {})
    };
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
      this.organisms.push(createOrganism('basic', this.config, this.canvasWidth, this.canvasHeight, this.idCounter));
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
    this.organisms.push(createOrganism('basic', this.config, this.canvasWidth, this.canvasHeight, this.idCounter));
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
    const now = Date.now();

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

      // 处理繁殖过程
      if (organism.isBreeding && organism.breedingPartnerId) {
        const partner = this.organisms.find(o => o.id === organism.breedingPartnerId);

        // 如果伙伴仍然存在且处于繁殖状态
        if (partner && partner.isBreeding && partner.breedingPartnerId === organism.id) {
          // 更新繁殖进度
          const breedingDuration = 3000; // 繁殖需要3秒
          const progress = Math.min(100, ((now - organism.breedingTime!) / breedingDuration) * 100);
          organism.breedingProgress = progress;
          partner.breedingProgress = progress; // 同步伙伴的进度

          // 繁殖完成
          if (progress >= 100) {
            // 生成后代
            const offspring = createOrganism(organism.type, this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
            // 计算父母中间位置
            const centerX = (organism.x + partner.x) / 2;
            const centerY = (organism.y + partner.y) / 2;
            // 在父母旁边随机位置生成（±20像素范围内）
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDistance = (organism.size + partner.size) * 0.5 + Math.random() * 10;
            offspring.x = centerX + Math.cos(offsetAngle) * offsetDistance;
            offspring.y = centerY + Math.sin(offsetAngle) * offsetDistance;
            // 继承特性
            const avgSize = (organism.size + partner.size) / 2;
            offspring.size = avgSize * (0.8 + Math.random() * 0.4);
            offspring.hunger = 60;
            newOrganisms.push(offspring);

            // 繁殖消耗能量
            organism.hunger = Math.max(30, organism.hunger - 30);
            partner.hunger = Math.max(30, partner.hunger - 30);

            // 重置繁殖状态
            organism.isBreeding = false;
            organism.breedingPartnerId = undefined;
            organism.breedingTime = undefined;
            organism.breedingProgress = 0;
            organism.speed = Math.random() * 0.3 + this.config.speed * 0.3; // 恢复移动能力

            // 重置伙伴的繁殖状态
            partner.isBreeding = false;
            partner.breedingPartnerId = undefined;
            partner.breedingTime = undefined;
            partner.breedingProgress = 0;
            partner.speed = Math.random() * 0.3 + this.config.speed * 0.3; // 恢复移动能力
          }
        } else {
          // 伙伴不在了或状态不一致，取消繁殖
          organism.isBreeding = false;
          organism.breedingPartnerId = undefined;
          organism.breedingTime = undefined;
          organism.breedingProgress = 0;
          organism.speed = Math.random() * 0.3 + this.config.speed * 0.3; // 恢复移动能力
        }
      } else {
        // 繁殖系统 - 改进版：需要双方都确认繁殖状态
        if (!organism.isBreeding && organism.hunger > 80 && organism.age > 100) {
          // 有概率进入繁殖准备状态
          if (Math.random() < 0.005) { // 降低触发概率
            organism.isBreeding = true;
            organism.breedingTime = now;
            organism.breedingProgress = 0;
            organism.speed = 0; // 停止移动
          }
        }

        // 检查繁殖进度和伙伴匹配
        if (organism.isBreeding && !organism.breedingPartnerId) {
          // 寻找同样处于繁殖状态且靠近的伙伴
          const potentialPartners = this.organisms.filter(
            (other) =>
              other.id !== organism.id &&
              other.isBreeding &&
              !other.breedingPartnerId && // 还没有找到伙伴
              other.type === organism.type &&
              Math.sqrt(Math.pow(other.x - organism.x, 2) + Math.pow(other.y - organism.y, 2)) < 40 // 适当增加距离要求
          );

          if (potentialPartners.length > 0) {
            const partner = potentialPartners[0];
            // 双方匹配成功，互相设置伙伴ID
            organism.breedingPartnerId = partner.id;
            partner.breedingPartnerId = organism.id;
            // 确保双方开始时间一致
            organism.breedingTime = now;
            partner.breedingTime = now;
            console.log(`繁殖匹配成功: 生物 ${organism.id} 与生物 ${partner.id} 配对`);
          } else {
            // 如果15秒内没找到伙伴，取消繁殖状态
            const waitDuration = now - organism.breedingTime!;
            if (waitDuration > 15000) {
              organism.isBreeding = false;
              organism.breedingTime = undefined;
              organism.breedingProgress = 0;
              // 恢复移动能力，使用适中的速度
              const baseSpeed = Math.random() * 0.2 + this.config.speed * 0.25;
              organism.speed = baseSpeed;
            }
          }
        }
      }

      // 处理进化 - 每帧只让少数生物尝试进化
      if (organism.canEvolve && Math.random() < 0.005 && !organism.isBreeding) {
        const evolved = organism.evolve();
        if (evolved) {
          newOrganisms.push(evolved);
          // 移除原生物，避免重复添加
          continue;
        }
      }

      // 繁殖中的生物停止移动
      if (organism.isBreeding) {
        organism.speed = 0;

        // 如果有繁殖伙伴，调整位置使其靠近并保持相对静止（黏在一起）
        if (organism.breedingPartnerId) {
          const partner = this.organisms.find(o => o.id === organism.breedingPartnerId);
          if (partner && partner.isBreeding) {
            const dx = partner.x - organism.x;
            const dy = partner.y - organism.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = organism.size + partner.size; // 目标距离：两个生物半径之和

            // 如果距离太远，慢慢靠近
            if (distance > targetDistance + 2) {
              const moveAmount = Math.min(0.5, distance - targetDistance); // 每次移动一点
              organism.x += (dx / distance) * moveAmount;
              organism.y += (dy / distance) * moveAmount;
            }
          }
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
    while (this.foods.length < this.config.foodCount * 0.8 && Math.random() < 0.1) {
      this.foods.push(createFood(this.foodIdCounter, this.canvasWidth, this.canvasHeight));
    }
  }

  // 计算FPS和性能统计
  calculateStats(currentFps: number, currentFrameTime: number): { fps: number; frameTime: number; organismTypes: { basic: number; predator: number; scavenger: number } } {
    const organismTypes = { basic: 0, predator: 0, scavenger: 0 };
    this.organisms.forEach(organism => {
      if (organism.type && organismTypes.hasOwnProperty(organism.type)) {
        organismTypes[organism.type]++;
      }
    });

    return {
      fps: Math.round(currentFps),
      frameTime: currentFrameTime || 0,
      organismTypes
    };
  }
}