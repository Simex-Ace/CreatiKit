import { Organism, OrganismType, Food, SandboxConfig } from './types';

// 创建食物
export const createFood = (idCounter: { current: number }, canvasWidth: number, canvasHeight: number): Food => {
  return {
    id: idCounter.current++,
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    size: 3,
    color: 'hsl(120, 100%, 40%)'
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
    
    eat: function(foods: Food[]): Food[] {
      const newFoods = [];
      const eatRadius = this.size * 1.2;
      
      for (const food of foods) {
        const dx = food.x - this.x;
        const dy = food.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > eatRadius) {
          newFoods.push(food);
        } else {
          this.hunger = Math.min(100, this.hunger + 20);
          
          if (this.type === 'scavenger') {
            this.hunger = Math.min(100, this.hunger + 10);
          }
        }
      }
      
      return newFoods;
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
    
    update: function(foods: Food[]) {
      this.age++;
      
      let hungerDecrease = 0.03;
      
      if (this.type === 'predator') hungerDecrease = 0.05;
      else if (this.type === 'scavenger') hungerDecrease = 0.02;
      
      if (this.speed > config.speed * 0.5) hungerDecrease *= 1.2;
      
      this.hunger = Math.max(0, this.hunger - hungerDecrease);
      
      const isStarving = this.hunger < 10;
      const isHungry = this.hunger < 30;
      
      if (this.x < 0 || this.x > canvasWidth) {
        this.direction = Math.PI - this.direction;
        this.x = Math.max(0, Math.min(canvasWidth, this.x));
      }
      if (this.y < 0 || this.y > canvasHeight) {
        this.direction = -this.direction;
        this.y = Math.max(0, Math.min(canvasHeight, this.y));
      }
      
      let nearestFood = null;
      if (foods.length > 0 && Math.random() < 0.9) {
        nearestFood = this.findNearestFood(foods);
      }
      
      const now = Date.now();
      const detectionRange = this.size * 10;
      
      if (nearestFood) {
        const dx = nearestFood.x - this.x;
        const dy = nearestFood.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= detectionRange) {
          this.isDetectingFood = true;
          this.foodDetectionTime = now;
          this.detectedFoodDistance = distance;
        } else {
          this.isDetectingFood = false;
          this.detectedFoodDistance = undefined;
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
    organisms.push(createOrganism('basic', config, canvasWidth, canvasHeight, idCounter));
  }
  return organisms;
};