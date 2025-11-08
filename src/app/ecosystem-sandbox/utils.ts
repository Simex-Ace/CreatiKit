import { Organism, OrganismType, Food, SandboxConfig } from './types';

// 创建食物
export const createFood = (idCounter: { current: number }, canvasWidth: number, canvasHeight: number): Food => {
  return {
    id: idCounter.current++,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: 3
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
    calculateDistance: function(x: number, y: number): number {
      const dx = x - this.x;
      const dy = y - this.y;
      return Math.sqrt(dx * dx + dy * dy);
    },
    findNearestFood: function(foods: Food[]): Food | null {
      if (foods.length === 0) return null;
      
      let nearestFood: Food | null = null;
      let minDistance = Infinity;
      let perceptionRadius = this.size * 10;
      
      if (this.hunger < 30) {
        perceptionRadius *= 1.5;
      }
      
      if (this.type === 'predator') {
        perceptionRadius *= 1.2;
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
    
    eat: function(food: Food): boolean {
      const eatRadius = this.size * 1.2;
      const dx = food.x - this.x;
      const dy = food.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > eatRadius) {
        return false;
      } else {
        this.hunger = Math.min(100, this.hunger + 20);
        
        if (this.type === 'scavenger') {
          this.hunger = Math.min(100, this.hunger + 10);
        }
        return true;
      }
    },
    
    evolve: function(): Organism | null {
      if (!this.canEvolve || this.age < 500 || this.hunger < 60) {
        return null;
      }
      
      const evolutionType = Math.random() > 0.5 ? 'predator' : 'scavenger';
      let evolvedBaseColor = '';
      let evolvedBaseSize = 0;
      let evolvedBaseSpeed = 0;
      
      if (evolutionType === 'predator') {
        evolvedBaseColor = `hsl(${Math.random() * 30}, 100%, 50%)`;
        evolvedBaseSize = this.size * (1 + Math.random() * 0.2 - 0.1);
        evolvedBaseSpeed = Math.random() * 0.2 + config.speed * 0.3;
      } else {
        evolvedBaseColor = `hsl(${Math.random() * 60 + 300}, 80%, 60%)`;
        evolvedBaseSize = this.size * (1 + Math.random() * 0.2 - 0.1);
        evolvedBaseSpeed = Math.random() * 0.2 + config.speed * 0.25;
      }
      
      const evolvedOrganism: Organism = {
        id: counter.current++,
        x: this.x,
        y: this.y,
        size: evolvedBaseSize,
        speed: evolvedBaseSpeed,
        direction: Math.random() * Math.PI * 2,
        color: evolvedBaseColor,
        hunger: 80,
        type: evolutionType,
        age: 0,
        canEvolve: false,
        isBreeding: false,
        breedingPartnerId: undefined,
        breedingTime: undefined,
        breedingProgress: 0,
        isDetectingFood: false,
        foodDetectionTime: undefined,
        detectedFoodDistance: undefined,
        findNearestFood: this.findNearestFood,
        eat: this.eat,
        evolve: this.evolve,
        update: this.update
      };
      
      setTimeout(() => {
        this.color = evolvedOrganism.color;
      }, 50);
      
      return evolvedOrganism;
    },
    
    update: function(foods: Food[], ecosystemManager?: any) {
      this.age++;      
      // 保存当前速度，如果是繁殖状态则不被后续逻辑覆盖
      const isBreedingState = this.isBreeding;
      const breedingSpeed = isBreedingState ? this.speed : undefined;
      
      let hungerDecrease = 0.03;
      
      if (this.type === 'predator') hungerDecrease = 0.05;
      else if (this.type === 'scavenger') hungerDecrease = 0.02;
      
      if (this.speed > config.speed * 0.5) hungerDecrease *= 1.2;
      
      // 移除不存在的属性引用
      // 应用地形对饥饿率的影响 - 直接使用已设置的属性
      if (this.hungerRateMultiplier) {
        hungerDecrease *= this.hungerRateMultiplier;
      }
      
      // 应用地形的健康恢复效果
      if (ecosystemManager && this.currentTerrainType) {
        const terrainEffect = ecosystemManager.getTerrainEffect(this.currentTerrainType);
        if (terrainEffect.healthRegenerationRate) {
          // 健康恢复减缓饥饿减少
          hungerDecrease = Math.max(0, hungerDecrease - terrainEffect.healthRegenerationRate);
        }
      }
      
      this.hunger = Math.max(0, this.hunger - hungerDecrease);
      
      const isStarving = this.hunger < 10;
      const isHungry = this.hunger < 30;
      
      // 改进的边界碰撞检测 - 使用函数参数中的canvasWidth和canvasHeight
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
        
        // 添加一个小的随机性，避免生物重复相同路径
        this.direction += (Math.random() - 0.5) * 0.5;
      }
      
      // 查找最近的食物
      const nearestFood = this.findNearestFood(foods);
      
      // 更新食物检测状态
      this.isDetectingFood = !!nearestFood;
      this.foodDetectionTime = nearestFood ? 0 : (this.foodDetectionTime || 0) + 1;
      this.detectedFoodDistance = nearestFood ? Math.sqrt(Math.pow(nearestFood.x - this.x, 2) + Math.pow(nearestFood.y - this.y, 2)) : undefined;
      
      if (nearestFood) {
          const dx = nearestFood.x - this.x;
          const dy = nearestFood.y - this.y;
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
        if (this.type === 'predator') {
          baseSpeed = Math.random() * 0.2 + config.speed * 0.3;
        } else if (this.type === 'scavenger') {
          baseSpeed = Math.random() * 0.2 + config.speed * 0.25;
        } else {
          baseSpeed = Math.random() * 0.2 + config.speed * 0.2;
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
        if (this.type === 'predator') {
          baseSpeed = Math.random() * 0.2 + config.speed * 0.3;
        } else if (this.type === 'scavenger') {
          baseSpeed = Math.random() * 0.2 + config.speed * 0.25;
        } else {
          baseSpeed = Math.random() * 0.2 + config.speed * 0.2;
        }
        
        this.speed = isStarving ? Math.max(0.1, baseSpeed * 0.5) : baseSpeed;
      }
      
      // 繁殖状态下恢复之前的速度设置
      if (isBreedingState && breedingSpeed !== undefined) {
        this.speed = breedingSpeed;
      }
      
      // 随机改变方向 - 更频繁的方向变化，避免卡住
      if (Math.random() < 0.02) {
        this.direction += (Math.random() - 0.5) * 1.0;
      }
      
      // 使用adjustedSpeed（如果有）或默认速度
      const speedToUse = this.adjustedSpeed !== undefined ? this.adjustedSpeed : this.speed;
      
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
      this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
      this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
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