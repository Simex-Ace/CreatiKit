import { Organism, OrganismType, Food, SandboxConfig } from './types';

// 创建食物
export const createFood = (idCounter: { current: number }, canvasWidth: number, canvasHeight: number): Food => {
  return {
    id: idCounter.current++,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: 3,
    isPrimordialSoup: false // 默认不创建原始汤
  };
};

// 创建新生物
export const createOrganism = (
  type: OrganismType = 'basic',
  config: SandboxConfig,
  canvasWidth: number,
  canvasHeight: number,
  idCounter?: { current: number }
): Organism => {
  const counter = idCounter || { current: 0 };
  
  // 初始化时默认不标记为toBeRemoved，后续会根据条件修改
  
  let baseColor = '';
  let baseSize = 0;
  let baseSpeed = 0;
  
  switch (type) {
    case 'predator':
      baseColor = `hsl(${Math.random() * 30}, 100%, 50%)`;
      baseSize = Math.random() * 3 + 8;
      baseSpeed = Math.random() * 0.2 + config.speed * 0.3;
      break;
    case 'scavenger':
      baseColor = `hsl(${Math.random() * 60 + 300}, 80%, 60%)`;
      baseSize = Math.random() * 3 + 6;
      baseSpeed = Math.random() * 0.2 + config.speed * 0.25;
      break;
    case 'cyanobacteria':
      baseColor = `hsl(${Math.random() * 30 + 120}, 100%, 40%)`; // 绿色调
      baseSize = Math.random() * 2 + 4; // 较小
      baseSpeed = Math.random() * 0.05 + 0.1; // 稍微增加基础速度，但会在update中进一步降低
      break;
    case 'primitive_eukaryote':
      baseColor = `hsl(${Math.random() * 30 + 180}, 90%, 50%)`; // 蓝绿色调
      baseSize = Math.random() * 2 + 5; // 中等
      baseSpeed = Math.random() * 0.1 + 0.2; // 基础速度
      break;
    default:
      baseColor = `hsl(${Math.random() * 60 + 180}, 70%, 50%)`;
      baseSize = Math.random() * 5 + 5;
      baseSpeed = Math.random() * 0.2 + config.speed * 0.2;
  }
  
  const organism: Organism = {
    id: counter.current++,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: baseSize,
    speed: baseSpeed,
    direction: Math.random() * Math.PI * 2,
    color: baseColor,
    hunger: 80,
    type: type,
    age: 0,
    canEvolve: type === 'basic',
    isBreeding: false,
    breedingPartnerId: undefined,
    breedingTime: undefined,
    breedingProgress: 0,
    isDetectingFood: false,
    foodDetectionTime: undefined,
    detectedFoodDistance: undefined,
    // 用于原核和真核生物的分裂繁殖
    lastSplitAge: 0,
    hasSplitOnce: false, // 新增：标记是否已经完成过至少一次分裂
    // 标记是否需要被移除
    toBeRemoved: false,
    // 添加卡住检测相关属性
    stuckCounter: 0, // 记录卡住的帧数
    lastPosition: { x: 0, y: 0 }, // 记录上一帧的位置

    calculateDistance: function(x: number, y: number): number {
      const dx = x - this.x;
      const dy = y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    findNearestFood: function(foods: Food[]): Food | null {
      if (foods.length === 0) return null;
      
      let nearestFood: Food | null = null;
      let minDistance = Infinity;
      let perceptionRadius = this.size * 15; // 大幅增加感知半径
      
      if (this.hunger < 30) {
        perceptionRadius *= 2; // 饥饿时大幅增加感知范围
      }
      
      // 为所有生物类型提供感知加成
      if (this.type === 'predator') {
        perceptionRadius *= 1.4; // 捕食者更强的感知能力
      } else if (this.type === 'scavenger') {
        perceptionRadius *= 1.3; // 清道夫较强的感知能力
      } else if (this.type === 'amoeba' || this.type === 'water_mold') {
        perceptionRadius *= 1.2; // 第三阶段生物增强感知能力
      }
      
      for (const food of foods) {
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance && distance < perceptionRadius) {
          minDistance = distance;
          nearestFood = food;
        }
      }
      
      return nearestFood;
    },
    
    eat: function(food: Food, ecosystemManager?: any): boolean {
      const eatRadius = this.size * 1.2;
      const dx = food.x - this.x;
      const dy = food.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= eatRadius) {
        // 增加饥饿值
        this.hunger = Math.min(100, this.hunger + 20);
        
        if (this.type === 'scavenger') {
          this.hunger = Math.min(100, this.hunger + 10);
        }
        
        // 重置卡住计数器
        this.stuckCounter = 0;
        return true;
      }
      return false;
    },
    
    evolve: function(): Organism | null {
      // 禁用进化功能，当前阶段只保留蓝藻和原始真核细胞
      return null;
    },
    
    update: function(foods: Food[], ecosystemManager?: any): null {
        // 年龄只增不减
        this.age = (this.age || 0) + 1;
        
        // 初始化卡住检测属性（如果不存在）
        if (this.stuckCounter === undefined) this.stuckCounter = 0;
        if (this.lastPosition === undefined) this.lastPosition = { x: this.x, y: this.y };
        
        // 检测是否卡住（位置变化小于阈值）
        const positionChangeThreshold = 0.1;
        const dx = Math.abs(this.x - this.lastPosition.x);
        const dy = Math.abs(this.y - this.lastPosition.y);
        const positionChanged = dx > positionChangeThreshold || dy > positionChangeThreshold;
        
        if (!positionChanged) {
          this.stuckCounter++;
        } else {
          this.stuckCounter = 0;
        }
        
        // 更新上一帧位置
        this.lastPosition.x = this.x;
        this.lastPosition.y = this.y;
        
        // 当生物卡住超过一定帧数时，增加饥饿消耗
        const stuckThreshold = 60;
        if (this.stuckCounter > stuckThreshold) {
          // 卡住时加速饥饿消耗
          this.hunger = Math.max(0, this.hunger - 0.1);
          
          // 当卡住时间过长时，直接标记为死亡
          if (this.stuckCounter > stuckThreshold * 5) {
            console.log(`${this.type} 生物ID:${this.id} 因长时间卡住而死亡`);
            this.toBeRemoved = true;
            return null;
          }
        }
      
      // 对于蓝藻、原始真核细胞和第三阶段生物的特殊处理
      if (this.type === 'cyanobacteria' || this.type === 'primitive_eukaryote' || 
          this.type === 'amoeba' || this.type === 'water_mold') {
        // 完全禁用有性生殖，强制所有繁殖只能通过分裂
        this.isBreeding = false;
        this.breedingPartnerId = undefined;
        this.breedingTime = undefined;
        this.breedingProgress = 0;
        // 清除所有可能触发有性生殖的属性
        this.targetPartner = null;
        this.isLookingForPartner = false;
        this.reproductionCooldown = 0;

        // 分裂功能已在ecosystem-manager.ts中实现，这里不再生成新细胞
        // 这里只处理基础移动行为
        
        // 第三阶段生物（amoeba和water_mold）禁止旋转，只保留移动功能
        if (this.type !== 'amoeba' && this.type !== 'water_mold') {
          // 仅对蓝藻和原始真核细胞进行方向变化
          if (this.type === 'cyanobacteria' && ecosystemManager) {
            // 蓝藻特殊处理：检测周围地形，避免移动到非海洋区域
            // 预测下一步的位置
            const speedToUse = this.adjustedSpeed || this.speed;
            const nextX = this.x + Math.cos(this.direction) * speedToUse * 10; // 预测更远距离
            const nextY = this.y + Math.sin(this.direction) * speedToUse * 10;
            
            // 检查预测位置的地形类型
            const predictedTerrain = ecosystemManager.getTerrainAt?.(nextX, nextY);
            
            if (predictedTerrain && predictedTerrain !== 'ocean') {
              // 如果预测会移动到非海洋区域，转向180度返回海洋
              this.direction += Math.PI; // 完全反向
            } else {
              // 正常的随机方向变化
              this.direction += (Math.random() - 0.5) * 0.05; // 非常小的方向变化，更平滑的移动
            }
          } else {
            // 原始真核细胞的随机方向变化
            this.direction += (Math.random() - 0.5) * 0.05;
          }
        } else {
          // 第三阶段生物不改变方向，保持初始方向
          // 第三阶段禁止旋转
        }
        
        // 使用调整后的速度移动（考虑地形影响）
        const speedToUse = this.adjustedSpeed || this.speed;
        this.x += Math.cos(this.direction) * speedToUse;
        this.y += Math.sin(this.direction) * speedToUse;
        
        // 边界检查，但不改变方向
        if (ecosystemManager && ecosystemManager.canvasWidth && ecosystemManager.canvasHeight) {
          if (this.x - this.size < 0) this.x = this.size;
          if (this.x + this.size > ecosystemManager.canvasWidth) this.x = ecosystemManager.canvasWidth - this.size;
          if (this.y - this.size < 0) this.y = this.size;
          if (this.y + this.size > ecosystemManager.canvasHeight) this.y = ecosystemManager.canvasHeight - this.size;
        }
        
        // 第三阶段生物直接返回，避免执行后续可能改变方向的逻辑
        return null;
      }
      
      // 确保函数总是返回null，避免生成额外的细胞
      return null;
      
      // 保存当前速度，如果是繁殖状态则不被后续逻辑覆盖
      const isBreedingState = this.isBreeding;
      const breedingSpeed = isBreedingState ? this.speed : undefined;
      
      let hungerDecrease = 0.04; // 略微增加基础饥饿消耗
      
      if (this.type === 'predator') hungerDecrease = 0.06; // 增加捕食者饥饿消耗
      else if (this.type === 'scavenger') hungerDecrease = 0.03; // 增加清道夫饥饿消耗
      
      if (this.speed > config.speed * 0.5) hungerDecrease *= 1.3; // 增加移动对饥饿的影响
        
        // 应用地形的健康恢复效果
        if (ecosystemManager && this.currentTerrainType) {
          const terrainEffect = ecosystemManager.getTerrainEffect(this.currentTerrainType);
          if (terrainEffect.healthRegenerationRate) {
            // 健康恢复减缓饥饿减少
            hungerDecrease = Math.max(0, hungerDecrease - terrainEffect.healthRegenerationRate);
          }
        }
        
        // 确保hungerRateMultiplier有默认值以解决TypeScript错误
        const hungerRateMultiplier = this.hungerRateMultiplier ?? 1.0;
        hungerDecrease *= hungerRateMultiplier;
      
      this.hunger = Math.max(0, this.hunger - hungerDecrease);
      
      const isStarving = this.hunger < 10;
      const isHungry = this.hunger < 30;
      
      // 改进的边界碰撞检测
      if (ecosystemManager && ecosystemManager.canvasWidth && ecosystemManager.canvasHeight) {
        const { canvasWidth, canvasHeight } = ecosystemManager;
        if (this.x - this.size < 0 || this.x + this.size > canvasWidth ||
            this.y - this.size < 0 || this.y + this.size > canvasHeight) {
          // 反弹逻辑 - 使用更平滑的反弹
          if (this.x - this.size < 0) {
            this.x = this.size;
            this.direction = Math.PI - this.direction;
          } else if (this.x + this.size > canvasWidth) {
            this.x = canvasWidth - this.size;
            this.direction = Math.PI - this.direction;
          }
          
          if (this.y - this.size < 0) {
            this.y = this.size;
            this.direction = -this.direction;
          } else if (this.y + this.size > canvasHeight) {
            this.y = canvasHeight - this.size;
            this.direction = -this.direction;
          }
        }
        
        // 添加一个小的随机性，避免生物重复相同路径
        this.direction += (Math.random() - 0.5) * 0.5;
      }
      
      // 查找最近的食物
      const nearestFood = this.findNearestFood(foods);
      
      // 更新食物检测状态
      this.isDetectingFood = !!nearestFood;
      this.foodDetectionTime = nearestFood ? 0 : (this.foodDetectionTime || 0) + 1;
      // 使用非空断言操作符解决TypeScript null检查问题
      this.detectedFoodDistance = nearestFood ? Math.sqrt(Math.pow(nearestFood!.x - this.x, 2) + Math.pow(nearestFood!.y - this.y, 2)) : undefined;
      
      if (nearestFood) {
          // 使用非空断言操作符解决TypeScript null检查问题
          const dx = nearestFood!.x - this.x;
          const dy = nearestFood!.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // 基础检测范围
          let detectionRange = this.size * 10;
          
          // 应用地形对食物检测范围的影响
          if (ecosystemManager && this.currentTerrainType) {
            const terrainEffect = ecosystemManager.getTerrainEffect(this.currentTerrainType);
            if (terrainEffect.foodDetectionRangeMultiplier) {
              detectionRange *= terrainEffect.foodDetectionRangeMultiplier;
            }
          }
          
          const targetDirection = Math.atan2(dy, dx);
        const angleDiff = ((targetDirection - this.direction) + Math.PI * 2) % (Math.PI * 2);
        const baseTurnAmount = 0.1;
        const turnAmount = Math.min(isHungry ? baseTurnAmount * 2 : baseTurnAmount, angleDiff);
        
        this.direction += turnAmount * (angleDiff > Math.PI ? -1 : 1);
        
        let baseSpeed;
      const configSpeed = ecosystemManager?.config?.speed || 1; // 从ecosystemManager获取config.speed
      if (this.type === 'predator') {
        baseSpeed = Math.random() * 0.2 + configSpeed * 0.3;
      } else if (this.type === 'scavenger') {
        baseSpeed = Math.random() * 0.2 + configSpeed * 0.25;
      } else {
        baseSpeed = Math.random() * 0.2 + configSpeed * 0.2;
      }
        
        if (isStarving) {
          baseSpeed *= 0.7;
        } else if (isHungry) {
          baseSpeed *= 1.3;
        }
        
        const speedMultiplier = Math.min(1.8, 1 + (detectionRange - distance) / (detectionRange * 2));
        this.speed = baseSpeed * speedMultiplier;
      } else {
        this.isDetectingFood = false;
        this.detectedFoodDistance = undefined;
        
        let randomChangeProbability = 0.02;
        if (isHungry) randomChangeProbability = 0.05;
        
        if (Math.random() < randomChangeProbability) {
          this.direction += (Math.random() - 0.5) * 0.5;
        }
        
        let baseSpeed;
        const configSpeed = ecosystemManager?.config?.speed || 1; // 从ecosystemManager获取config.speed
        if (this.type === 'predator') {
          baseSpeed = Math.random() * 0.2 + configSpeed * 0.3;
        } else if (this.type === 'scavenger') {
          baseSpeed = Math.random() * 0.2 + configSpeed * 0.25;
        } else {
          baseSpeed = Math.random() * 0.2 + configSpeed * 0.2;
        }
        
        this.speed = isStarving ? Math.max(0.1, baseSpeed * 0.5) : baseSpeed;
      }
      
      // 繁殖状态下恢复之前的速度设置
      if (isBreedingState && breedingSpeed !== undefined) {
        this.speed = breedingSpeed as number; // 类型断言确保speed是number类型
      }
      
      // 随机改变方向 - 更频繁的方向变化，避免卡住
      if (Math.random() < 0.02) {
        this.direction += (Math.random() - 0.5) * 1.0;
      }
      
      // 使用adjustedSpeed（如果有）或默认速度，确保有默认值
      const speedToUse = this.adjustedSpeed ?? this.speed ?? 0.1;
      
      // 计算目标位置
      let newX = this.x + Math.cos(this.direction) * speedToUse;
      let newY = this.y + Math.sin(this.direction) * speedToUse;
      
      // 地形碰撞检测和绕行
      if (ecosystemManager) {
        // 检查目标位置的地形
        const targetTerrain = ecosystemManager.getTerrainAt(newX, newY);
        const terrainEffect = ecosystemManager.getTerrainEffect(targetTerrain);
        
        // 如果目标位置是不可通行的地形，尝试绕行
        if (!terrainEffect.canPassThrough) {
          // 尝试8个方向，每45度一个，平衡性能和寻路效果
          let foundPath = false;
          const directionsToTry = [];
          
          // 生成8个尝试方向，正负45度增量
          for (let i = 1; i <= 4; i++) {
            directionsToTry.push(i * Math.PI / 4);  // 45度增量
            directionsToTry.push(-i * Math.PI / 4); // 负值方向
          }
          
          // 先尝试小角度偏移
          for (const angleOffset of directionsToTry) {
            const testDirection = this.direction + angleOffset;
            const testX = this.x + Math.cos(testDirection) * speedToUse;
            const testY = this.y + Math.sin(testDirection) * speedToUse;
            
            const testTerrain = ecosystemManager.getTerrainAt(testX, testY);
            const testTerrainEffect = ecosystemManager.getTerrainEffect(testTerrain);
            
            const canvasWidth = ecosystemManager.canvasWidth || 800;
            const canvasHeight = ecosystemManager.canvasHeight || 600;
            if (testTerrainEffect.canPassThrough && 
                testX >= this.size && testX <= canvasWidth - this.size &&
                testY >= this.size && testY <= canvasHeight - this.size) {
              // 找到可通行的路径
              newX = testX;
              newY = testY;
              this.direction = testDirection;
              foundPath = true;
              break;
            }
          }
        
            // 如果没有找到可通行的路径，大幅改变方向并稍微后退
            if (!foundPath) {
              // 更剧烈的方向变化，避免卡在原地
              this.direction += (Math.random() - 0.5) * Math.PI; // 最多180度转向
              
              // 尝试稍微后退一点，避免连续卡在同一位置
              newX = this.x - Math.cos(this.direction) * speedToUse * 0.5;
              newY = this.y - Math.sin(this.direction) * speedToUse * 0.5;
              
              // 确保后退位置在边界内
              newX = Math.max(this.size, Math.min(canvasWidth - this.size, newX));
              newY = Math.max(this.size, Math.min(canvasHeight - this.size, newY));
            }
          }
          
          // 更新当前地形类型
          this.currentTerrainType = ecosystemManager.getTerrainAt(newX, newY);
          
          // 应用地形对饥饿率的影响
          const currentTerrainEffect = ecosystemManager.getTerrainEffect(this.currentTerrainType);
          this.hungerRateMultiplier = currentTerrainEffect.hungerRateMultiplier;
        }
      
      // 更新位置
      this.x = newX;
      this.y = newY;
      
      // 确保位置在有效范围内（额外保障）
      const safeCanvasWidth = ecosystemManager?.canvasWidth || 800;
      const safeCanvasHeight = ecosystemManager?.canvasHeight || 600;
      this.x = Math.max(this.size, Math.min(safeCanvasWidth - this.size, this.x));
      this.y = Math.max(this.size, Math.min(safeCanvasHeight - this.size, this.y));
      
      // 确保函数总是返回null，所有分裂逻辑已移至ecosystem-manager.ts
      return null;
    }
  };
  
  return organism;
};

// 初始化食物
export const initFoods = (count: number, foodIdCounter: { current: number }, canvasWidth: number, canvasHeight: number) => {
  const foods = [];
  for (let i = 0; i < count; i++) {
    foods.push(createFood(foodIdCounter, canvasWidth, canvasHeight));
  }
  return foods;
};

// 初始化生物
export const initOrganisms = (count: number, idCounter: { current: number }, canvasWidth: number, canvasHeight: number, config: SandboxConfig) => {
  const organisms = [];
  const typeDistribution = { basic: count * 0.8, predator: count * 0.15, scavenger: count * 0.05 };
  
  // 确保有至少一个基础生物
  if (typeDistribution.basic < 1) typeDistribution.basic = 1;
  
  // 四舍五入并确保总数正确
  let remainingCount = count;
  
  // 创建基础生物
  const basicCount = Math.floor(typeDistribution.basic);
  for (let i = 0; i < basicCount && remainingCount > 0; i++, remainingCount--) {
    organisms.push(createOrganism('basic', config, canvasWidth, canvasHeight, idCounter));
  }
  
  // 创建捕食者
  const predatorCount = Math.floor(typeDistribution.predator);
  for (let i = 0; i < predatorCount && remainingCount > 0; i++, remainingCount--) {
    organisms.push(createOrganism('predator', config, canvasWidth, canvasHeight, idCounter));
  }
  
  // 创建清道夫
  const scavengerCount = Math.floor(typeDistribution.scavenger);
  for (let i = 0; i < scavengerCount && remainingCount > 0; i++, remainingCount--) {
    organisms.push(createOrganism('scavenger', config, canvasWidth, canvasHeight, idCounter));
  }
  
  // 分配剩余的数量为基础生物
  for (let i = 0; i < remainingCount; i++) {
    organisms.push(createOrganism('basic', config, canvasWidth, canvasHeight, idCounter));
  }
  
  return organisms;
};