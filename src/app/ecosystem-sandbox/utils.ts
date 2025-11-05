import { Organism, OrganismType, Food, SandboxConfig } from './types';

// 创建食物
export const createFood = (idCounter: { current: number }, canvasWidth: number, canvasHeight: number): Food => {
  return {
    id: idCounter.current++,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: 3,
    color: 'hsl(120, 100%, 40%)' // 亮绿色
  };
};

// 创建新生物
export const createOrganism = (
  type: OrganismType = 'basic',
  idCounter: { current: number },
  canvasWidth: number,
  canvasHeight: number,
  config: SandboxConfig
): Organism => {
  // 根据类型设置基本属性
  let baseColor = '';
  let baseSize = 0;
  let baseSpeed = 0;
  
  switch (type) {
    case 'predator':
      baseColor = `hsl(${Math.random() * 30}, 100%, 50%)`; // 红色系
      baseSize = Math.random() * 3 + 8; // 8-11px
      baseSpeed = Math.random() * 0.5 + config.speed * 0.8; // 更快
      break;
    case 'scavenger':
      baseColor = `hsl(${Math.random() * 60 + 300}, 80%, 60%)`; // 紫色系
      baseSize = Math.random() * 3 + 6; // 6-9px
      baseSpeed = Math.random() * 0.5 + config.speed * 0.6; // 中等
      break;
    default: // basic
      baseColor = `hsl(${Math.random() * 60 + 180}, 70%, 50%)`; // 绿色系
      baseSize = Math.random() * 5 + 5; // 5-10px
      baseSpeed = Math.random() * 0.5 + config.speed * 0.5; // 配置速度的0.5-1倍
  }
  
  const organism: Organism = {
    id: idCounter.current++,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: baseSize,
    speed: baseSpeed,
    direction: Math.random() * Math.PI * 2,
    color: baseColor,
    hunger: 70, // 初始饥饿值适中
    type: type,
    age: 0,
    canEvolve: type === 'basic', // 只有基本生物可以进化
    
    // 寻找最近的食物
    findNearestFood: function(foods: Food[]): Food | null {
      if (foods.length === 0) return null;
      
      let nearestFood: Food | null = null;
      let minDistance = Infinity;
      // 根据类型和饥饿值调整感知半径
      let perceptionRadius = this.size * 10;
      
      // 饥饿时扩大感知范围
      if (this.hunger < 30) {
        perceptionRadius *= 1.5;
      }
      
      // 捕食者有更大的感知范围
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
    
    // 吃食物
    eat: function(foods: Food[]): Food[] {
      const newFoods = [];
      let ateFood = false;
      const eatRadius = this.size * 1.2;
      
      for (const food of foods) {
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > eatRadius) {
          newFoods.push(food); // 没有被吃掉的食物保留
        } else {
          ateFood = true;
          // 增加饥饿值
          this.hunger = Math.min(100, this.hunger + 20);
          
          // 清道夫吃食物更有效率
          if (this.type === 'scavenger') {
            this.hunger = Math.min(100, this.hunger + 10);
          }
        }
      }
      
      return newFoods;
    },
    
    // 进化方法
    evolve: function(): Organism | null {
      if (!this.canEvolve || this.age < 500 || this.hunger < 60) {
        return null; // 不能进化的条件
      }
      
      // 随机选择进化方向
      const evolutionType = Math.random() > 0.5 ? 'predator' : 'scavenger';
      
      const evolvedOrganism: Organism = {
        ...createOrganism(evolutionType, idCounter, canvasWidth, canvasHeight, config),
        x: this.x,
        y: this.y,
        // 遗传一部分特性
        size: this.size * (1 + Math.random() * 0.2 - 0.1),
        hunger: 80 // 进化后吃饱
      };
      
      // 显示进化效果（闪烁或变色）
      setTimeout(() => {
        this.color = evolvedOrganism.color;
      }, 50);
      
      return evolvedOrganism;
    },
    
    // 更新方法，包含食物感知、饥饿值和进化逻辑
    update: function(foods: Food[]) {
      // 增加年龄
      this.age++;
      
      // 优化：批量计算饥饿减少量
      let hungerDecrease = 0.1;
      
      // 捕食者消耗更快
      if (this.type === 'predator') hungerDecrease = 0.15;
      // 清道夫消耗更慢
      else if (this.type === 'scavenger') hungerDecrease = 0.08;
      
      // 移动时消耗更多
      if (this.speed > config.speed * 0.8) hungerDecrease *= 1.5;
      
      this.hunger = Math.max(0, this.hunger - hungerDecrease);
      
      // 预计算饥饿状态
      const isStarving = this.hunger < 10;
      const isHungry = this.hunger < 30;
      
      // 边界检测和反弹 - 减少重复计算
      if (this.x < 0 || this.x > canvasWidth) {
        this.direction = Math.PI - this.direction;
        this.x = Math.max(0, Math.min(canvasWidth, this.x));
      }
      if (this.y < 0 || this.y > canvasHeight) {
        this.direction = -this.direction;
        this.y = Math.max(0, Math.min(canvasHeight, this.y));
      }
      
      // 优化：食物数量少时才进行查找
      let nearestFood = null;
      if (foods.length > 0 && Math.random() < 0.9) { // 10%概率跳过查找以提高性能
        nearestFood = this.findNearestFood(foods);
      }
      
      if (nearestFood) {
        // 如果发现食物，向食物方向移动
        const dx = nearestFood.x - this.x;
        const dy = nearestFood.y - this.y;
        const targetDirection = Math.atan2(dy, dx);
        
        // 平滑转向，饥饿时转向更快
        const angleDiff = ((targetDirection - this.direction) + Math.PI * 2) % (Math.PI * 2);
        const baseTurnAmount = 0.1;
        const turnAmount = Math.min(isHungry ? baseTurnAmount * 2 : baseTurnAmount, angleDiff);
        
        this.direction += turnAmount * (angleDiff > Math.PI ? -1 : 1);
        
        // 调整速度，靠近食物时加速
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 根据类型调整基础速度
        let baseSpeed;
        if (this.type === 'predator') {
          baseSpeed = Math.random() * 0.5 + config.speed * 0.8;
        } else if (this.type === 'scavenger') {
          baseSpeed = Math.random() * 0.5 + config.speed * 0.6;
        } else {
          baseSpeed = Math.random() * 0.5 + config.speed * 0.5;
        }
        
        // 饥饿状态影响
        if (isStarving) {
          baseSpeed *= 0.7;
        } else if (isHungry) {
          baseSpeed *= 1.3;
        }
        
        // 距离因素
        const perceptionRadius = this.size * 10;
        const speedMultiplier = Math.min(1.8, 1 + (perceptionRadius - distance) / (perceptionRadius * 2));
        this.speed = baseSpeed * speedMultiplier;
      } else {
        // 随机转向
        let randomChangeProbability = 0.02;
        if (isHungry) randomChangeProbability = 0.05;
        
        if (Math.random() < randomChangeProbability) {
          this.direction += (Math.random() - 0.5) * 0.5; // 最多改变45度
        }
        
        // 根据类型设置速度
        let baseSpeed;
        if (this.type === 'predator') {
          baseSpeed = Math.random() * 0.5 + config.speed * 0.8;
        } else if (this.type === 'scavenger') {
          baseSpeed = Math.random() * 0.5 + config.speed * 0.6;
        } else {
          baseSpeed = Math.random() * 0.5 + config.speed * 0.5;
        }
        
        // 饥饿状态影响
        this.speed = isStarving ? Math.max(0.1, baseSpeed * 0.5) : baseSpeed;
      }
      
      // 更新位置
      this.x += Math.cos(this.direction) * this.speed;
      this.y += Math.sin(this.direction) * this.speed;
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
  for (let i = 0; i < count; i++) {
    organisms.push(createOrganism('basic', idCounter, canvasWidth, canvasHeight, config));
  }
  return organisms;
};