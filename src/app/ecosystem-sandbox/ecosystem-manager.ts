import { Organism, Food, SandboxConfig, TerrainCell, TerrainEffect, TerrainType } from './types';
import { createOrganism, createFood } from './utils';

export class EcosystemManager {
  private organisms: Organism[];
  private foods: Food[];
  private config: SandboxConfig;
  private idCounter: { current: number };
  private foodIdCounter: { current: number };
  private canvasWidth: number;
  private canvasHeight: number;
  private terrainGrid: TerrainCell[][];
  private terrainEffects: Map<TerrainType, TerrainEffect>;
  private terrainGridSize: number;
  private hasTerrain: boolean;

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
    this.terrainGrid = [];
    this.terrainEffects = new Map<TerrainType, TerrainEffect>();
    this.terrainGridSize = config.terrainGridSize || 20;
    this.hasTerrain = config.hasTerrain !== false;
    
    // 初始化地形效果
    this.initTerrainEffects();
    
    // 生成地形
    if (this.hasTerrain) {
      this.generateTerrain(this.terrainGridSize);
    }
  }
  
  // 初始化地形效果
  private initTerrainEffects() {
    this.terrainEffects.set('ocean', {
      speedMultiplier: 0.3,
      hungerRateMultiplier: 2.0,
      canSpawnFood: false,
      canSpawnOrganism: false
    });
    
    this.terrainEffects.set('beach', {
      speedMultiplier: 1.1,
      hungerRateMultiplier: 1.2,
      canSpawnFood: true,
      canSpawnOrganism: true
    });
    
    this.terrainEffects.set('forest', {
      speedMultiplier: 0.8,
      hungerRateMultiplier: 0.9,
      canSpawnFood: true,
      canSpawnOrganism: true
    });
    
    this.terrainEffects.set('mountain', {
      speedMultiplier: 0.5,
      hungerRateMultiplier: 1.5,
      canSpawnFood: false,
      canSpawnOrganism: true
    });
    
    this.terrainEffects.set('plains', {
      speedMultiplier: 1.3,
      hungerRateMultiplier: 1.0,
      canSpawnFood: true,
      canSpawnOrganism: true
    });
  }
  
  // 生成地形（使用改进的地形分布算法）
  private generateTerrain(gridSize: number) {
    // 根据画布尺寸确定网格大小，确保最小尺寸
    const cellSize = gridSize || 20;
    const widthCells = Math.max(20, Math.floor(this.canvasWidth / cellSize));
    const heightCells = Math.max(20, Math.floor(this.canvasHeight / cellSize));
    
    this.terrainGrid = Array(heightCells).fill(0).map(() => Array(widthCells).fill(0).map(() => ({
      type: 'plains' as TerrainType,
      x: 0,
      y: 0,
      size: cellSize
    })));
    
    // 步骤1: 生成基础地形高度图
    const heightMap: number[][] = Array(heightCells).fill(0).map(() => Array(widthCells).fill(0));
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        heightMap[y][x] = this.getNoise(x, y);
      }
    }
    
    // 步骤2: 第一次地形分配，使用更低的海洋阈值确保海洋是一整块
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        const noise = heightMap[y][x];
        const cellX = x * cellSize;
        const cellY = y * cellSize;
        
        // 五种地形类型的阈值分配
        let terrainType: TerrainType;
        if (noise < 0.25) {  // 海洋
          terrainType = 'ocean';
        } else if (noise < 0.32) {  // 沙滩
          terrainType = 'beach';
        } else if (noise < 0.55) {  // 平原
          terrainType = 'plains';
        } else if (noise < 0.75) {  // 森林
          terrainType = 'forest';
        } else {  // 山脉
          terrainType = 'mountain';
        }
        
        this.terrainGrid[y][x] = { type: terrainType };
      }
    }
    
    // 步骤3: 地形平滑和连续性增强
    this.smoothTerrain();
    
    // 步骤4: 确保地形过渡自然
    this.enforceTerrainTransitions();
    
    // 步骤5: 特殊处理山脉分布，确保它们分布在平原中部或地图角落
    this.distributeMountains();
    
    // 确保陆地连通性
    this.ensureLandConnectivity();
  }
  
  // 地形平滑，确保所有地形形成大片连续区域
  private smoothTerrain() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    const tempGrid: TerrainCell[][] = JSON.parse(JSON.stringify(this.terrainGrid));
    
    // 多次平滑迭代，确保地形大面积连续
    for (let iteration = 0; iteration < 3; iteration++) {
      for (let y = 1; y < heightCells - 1; y++) {
        for (let x = 1; x < widthCells - 1; x++) {
            // 统计五种地形类型的邻居
            const neighborTypes: Record<TerrainType, number> = {
              'ocean': 0,
              'beach': 0,
              'forest': 0,
              'mountain': 0,
              'plains': 0
            };
          
          // 检查周围8个邻居
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue; // 跳过自己
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells) {
                neighborTypes[tempGrid[ny][nx].type]++;
              }
            }
          }
          
          // 找出最常见的邻居类型
          let maxCount = 0;
          let dominantType = tempGrid[y][x].type;
          for (const [type, count] of Object.entries(neighborTypes)) {
            if (count > maxCount && count >= 4) { // 至少有4个邻居是相同类型
              maxCount = count;
              dominantType = type as TerrainType;
            }
          }
          
          // 80%的概率使用主导类型，增强连续性
          if (Math.random() < 0.8) {
            this.terrainGrid[y][x].type = dominantType;
          }
        }
      }
    }
  }
  
  // 确保地形过渡自然，遵循合理的地理分布规则
  private enforceTerrainTransitions() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        const currentType = this.terrainGrid[y][x].type;
        
        // 检查所有邻居
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells) {
              const neighborType = this.terrainGrid[ny][nx].type;
              
              // 执行地形过渡规则
              if (currentType === 'ocean') {
                // 海洋只能与沙滩相邻
                if (neighborType !== 'ocean' && neighborType !== 'beach') {
                  // 有30%的概率将邻居变为沙滩
                  if (Math.random() < 0.3) {
                    this.terrainGrid[ny][nx].type = 'beach';
                  }
                }
              } else if (currentType === 'beach') {
                // 沙滩只能与海洋、平原或森林相邻
                if (neighborType !== 'ocean' && neighborType !== 'beach' && 
                    neighborType !== 'plains' && neighborType !== 'forest') {
                  // 将不合法的邻居变为平原
                  this.terrainGrid[ny][nx].type = 'plains';
                }
              } else if (currentType === 'mountain') {
                // 山脉不应与海洋相邻
                if (neighborType === 'ocean') {
                  // 将山脉改为森林或平原
                  this.terrainGrid[y][x].type = Math.random() < 0.5 ? 'forest' : 'plains';
                }
                // 山脉不应与沙滩直接相邻
                if (neighborType === 'beach') {
                  // 在山脉和沙滩之间添加平原
                  this.terrainGrid[y][x].type = 'plains';
                }
              }
            }
          }
        }
      }
    }
  }
  
  // 特殊处理山脉分布，确保它们分布在平原中部或地图角落
  private distributeMountains() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    // 移除不合理的山脉
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        if (this.terrainGrid[y][x].type === 'mountain') {
          // 检查是否靠近海洋或沙滩
          const isNearWater = this.checkIfNearWater(x, y);
          if (isNearWater) {
            // 改为平原或森林
            this.terrainGrid[y][x].type = Math.random() < 0.5 ? 'forest' : 'plains';
          }
        }
      }
    }
    
    // 在平原中部添加一些山脉
    this.addMountainsInPlains();
    
    // 增加森林分布
    this.increaseForestDistribution();
  }
  
  // 检查指定位置是否靠近水域
  private checkIfNearWater(x: number, y: number): boolean {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    // 检查周围5x5的区域是否有海洋或沙滩
    const range = 3;
    for (let dy = -range; dy <= range; dy++) {
      for (let dx = -range; dx <= range; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells) {
          const type = this.terrainGrid[ny][nx].type;
          if (type === 'ocean' || type === 'beach') {
            return true;
          }
        }
      }
    }
    return false;
  }
  
  // 增加森林分布
  private increaseForestDistribution() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    // 找出平原区域作为潜在的森林区域
    const plainAreas: {x: number, y: number}[] = [];
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        if (this.terrainGrid[y][x].type === 'plains') {
          plainAreas.push({x, y});
        }
      }
    }
    
    // 确保至少有一定比例的平原转换为森林
    const forestConversionRate = 0.3; // 30%的平原转换为森林
    const forestCount = Math.floor(plainAreas.length * forestConversionRate);
    
    // 随机选择平原区域转换为森林
    const shuffledAreas = plainAreas.sort(() => 0.5 - Math.random());
    for (let i = 0; i < forestCount; i++) {
      if (i < shuffledAreas.length) {
        const {x, y} = shuffledAreas[i];
        
        // 创建小型森林区域
        const forestSize = 2 + Math.floor(Math.random() * 3);
        for (let dy = -forestSize; dy <= forestSize; dy++) {
          for (let dx = -forestSize; dx <= forestSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 创建圆形森林区域
            if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
                distance <= forestSize && 
                this.terrainGrid[ny][nx].type === 'plains') {
              // 中心更容易形成森林
              if (Math.random() > distance / (forestSize + 2)) {
                this.terrainGrid[ny][nx].type = 'forest';
              }
            }
          }
        }
      }
    }
  }
  private addMountainsInPlains() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    // 找出平原区域
    const plainAreas: {x: number, y: number}[] = [];
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        if (this.terrainGrid[y][x].type === 'plains' || this.terrainGrid[y][x].type === 'forest') {
          // 允许在森林和平原中添加山脉
          plainAreas.push({x, y});
        }
      }
    }
    
    // 增加山脉数量，确保至少有几处山脉
    const mountainCount = Math.max(3, Math.floor(Math.sqrt(plainAreas.length) / 3));
    for (let i = 0; i < mountainCount; i++) {
      if (plainAreas.length > 0) {
        const randomIndex = Math.floor(Math.random() * plainAreas.length);
        const {x, y} = plainAreas[randomIndex];
        
        // 创建更大的山脉区域
        const mountainSize = 3 + Math.floor(Math.random() * 3);
        for (let dy = -mountainSize; dy <= mountainSize; dy++) {
          for (let dx = -mountainSize; dx <= mountainSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 创建圆形山脉区域，允许将森林转换为山脉
            if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
                distance <= mountainSize && 
                (this.terrainGrid[ny][nx].type === 'plains' || this.terrainGrid[ny][nx].type === 'forest')) {
              // 提高山脉生成概率
              if (Math.random() > distance / (mountainSize + 2)) {
                this.terrainGrid[ny][nx].type = 'mountain';
              }
            }
          }
        }
        
        // 从候选列表中移除已处理的区域
        plainAreas.splice(randomIndex, 1);
      }
    }
    
    // 在地图角落添加一些山脉
    const corners = [
      {x: 5, y: 5},           // 左上角
      {x: widthCells - 5, y: 5}, // 右上角
      {x: 5, y: heightCells - 5}, // 左下角
      {x: widthCells - 5, y: heightCells - 5} // 右下角
    ];
    
    // 随机选择2-3个角落添加山脉
    const cornerCount = 2 + Math.floor(Math.random() * 2);
    const selectedCorners = corners.sort(() => 0.5 - Math.random()).slice(0, cornerCount);
    
    selectedCorners.forEach(corner => {
      const mountainSize = 3 + Math.floor(Math.random() * 2);
      for (let dy = -mountainSize; dy <= mountainSize; dy++) {
        for (let dx = -mountainSize; dx <= mountainSize; dx++) {
          const nx = corner.x + dx;
          const ny = corner.y + dy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
              distance <= mountainSize && 
              this.terrainGrid[ny][nx].type !== 'ocean' && this.terrainGrid[ny][nx].type !== 'beach') {
            // 角落山脉生成概率更高
            if (Math.random() > distance / (mountainSize + 1.5)) {
              this.terrainGrid[ny][nx].type = 'mountain';
            }
          }
        }
      }
    });
  }
  
  // 在地图角落添加山脉
  private addMountainsInCorners() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    // 定义四个角落区域
    const corners = [
      { startX: 0, startY: 0, width: widthCells * 0.3, height: heightCells * 0.3 },
      { startX: widthCells * 0.7, startY: 0, width: widthCells * 0.3, height: heightCells * 0.3 },
      { startX: 0, startY: heightCells * 0.7, width: widthCells * 0.3, height: heightCells * 0.3 },
      { startX: widthCells * 0.7, startY: heightCells * 0.7, width: widthCells * 0.3, height: heightCells * 0.3 }
    ];
    
    // 为每个角落添加一些山脉
    corners.forEach(corner => {
      const cornerWidth = Math.floor(corner.width);
      const cornerHeight = Math.floor(corner.height);
      const mountainCount = 2 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < mountainCount; i++) {
        const x = Math.floor(corner.startX + Math.random() * cornerWidth);
        const y = Math.floor(corner.startY + Math.random() * cornerHeight);
        
        // 只在平原或森林上添加山脉
        if (x >= 0 && x < widthCells && y >= 0 && y < heightCells && 
            (this.terrainGrid[y][x].type === 'plains' || 
             this.terrainGrid[y][x].type === 'forest')) {
          
          // 创建小型山脉区域
          const mountainSize = 1 + Math.floor(Math.random() * 2);
          for (let dy = -mountainSize; dy <= mountainSize; dy++) {
            for (let dx = -mountainSize; dx <= mountainSize; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
                  distance <= mountainSize && 
                  (this.terrainGrid[ny][nx].type === 'plains' || 
                   this.terrainGrid[ny][nx].type === 'forest')) {
                
                if (Math.random() > distance / (mountainSize + 1)) {
                  this.terrainGrid[ny][nx].type = 'mountain';
                }
              }
            }
          }
        }
      }
    });
  }
  
  // 改进的噪声函数，生成更合理的地形分布
  private getNoise(x: number, y: number): number {
    // 使用更低的频率，确保地形大范围连续
    const scale = 0.03; // 进一步降低频率，使地形变化更缓慢
    const nx = x * scale;
    const ny = y * scale;
    
    // 生成基础噪声，模拟大陆和海洋分布
    let noise = 0;
    let frequency = 1.0;
    let amplitude = 0.6;
    
    // 使用多层噪声，但确保主要趋势是连续的
    for (let i = 0; i < 3; i++) {
      // 使用正弦函数的组合生成平滑噪声
      const s1 = Math.sin(nx * frequency * 12.9898 + ny * frequency * 78.233);
      const s2 = Math.sin(nx * frequency * 39.346 + ny * frequency * 11.131);
      const s3 = Math.sin(Math.sqrt(nx * nx + ny * ny) * frequency * 4.2 + 0.5);
      const hash = (s1 + s2 + s3) * 43758.5453123;
      noise += Math.abs(hash - Math.floor(hash)) * amplitude;
      
      frequency *= 2.0;
      amplitude *= 0.3; // 降低高频分量的影响
    }
    
    // 添加大陆偏移，确保海洋更集中在地图边缘
    const centerX = this.terrainGrid[0]?.length || 0;
    const centerY = this.terrainGrid.length;
    const distFromCenter = Math.sqrt(
      Math.pow(x - centerX/2, 2) + Math.pow(y - centerY/2, 2)
    );
    const maxDistance = Math.sqrt(
      Math.pow(centerX/2, 2) + Math.pow(centerY/2, 2)
    );
    const edgeFactor = distFromCenter / maxDistance;
    
    // 让边缘更倾向于成为海洋（降低噪声值）
    noise = noise * (1 - edgeFactor * 0.3);
    
    // 规范化到0-1范围
    return Math.max(0, Math.min(1, noise));
  }
  
  // 确保陆地连通性
  private ensureLandConnectivity() {
    // 检查是否有陆地
    let hasLand = false;
    for (let y = 0; y < this.terrainGrid.length && !hasLand; y++) {
      for (let x = 0; x < this.terrainGrid[y].length; x++) {
        if (this.terrainGrid[y][x].type !== 'ocean') {
          hasLand = true;
          break;
        }
      }
    }
    
    // 如果全是海洋，添加一些陆地
    if (!hasLand) {
      const centerX = Math.floor(this.terrainGrid[0].length / 2);
      const centerY = Math.floor(this.terrainGrid.length / 2);
      for (let y = Math.max(0, centerY - 2); y < Math.min(this.terrainGrid.length, centerY + 3); y++) {
        for (let x = Math.max(0, centerX - 2); x < Math.min(this.terrainGrid[y].length, centerX + 3); x++) {
          this.terrainGrid[y][x].type = 'plains';
        }
      }
    }
  }
  
  // 获取指定位置的地形
  public getTerrainAt(x: number, y: number): TerrainType {
    if (!this.terrainGrid.length || x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) {
      return 'plains';
    }
    
    // 由于TerrainCell接口只包含type属性，我们直接使用terrainGridSize作为网格大小
    const gridSize = this.terrainGridSize;
    const gridX = Math.floor(x / gridSize);
    const gridY = Math.floor(y / gridSize);
    
    if (gridY >= 0 && gridY < this.terrainGrid.length && gridX >= 0 && gridX < this.terrainGrid[gridY].length) {
      return this.terrainGrid[gridY][gridX].type;
    }
    
    return 'plains';
  }
  
  // 获取地形效果
  public getTerrainEffect(type: TerrainType): TerrainEffect {
    return this.terrainEffects.get(type) || {
      speedMultiplier: 1.0,
      hungerRateMultiplier: 1.0,
      canSpawnFood: true,
      canSpawnOrganism: true
    };
  }
  
  // 获取地形网格
  public getTerrainGrid(): TerrainCell[][] {
    return this.terrainGrid;
  }
  
  // 获取地形网格大小
  public getTerrainGridSize(): number {
    return this.terrainGridSize;
  }
  
  // 获取是否有地形
  public getHasTerrain(): boolean {
    return this.hasTerrain;
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
    
    // 处理地形配置变更
    if (newConfig.hasTerrain !== undefined || newConfig.terrainGridSize !== undefined) {
      if (newConfig.hasTerrain !== false) {
        this.generateTerrain(newConfig.terrainGridSize || this.config.terrainGridSize || 20);
      }
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
      isRunning: true,
      
      // 地形配置
      hasTerrain: true,
      terrainGridSize: 20
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
      // 确保生物不在海洋生成
      let organism;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        organism = createOrganism('basic', this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
        const terrainType = this.getTerrainAt(organism.x, organism.y);
        const terrainEffect = this.getTerrainEffect(terrainType);
        attempts++;
        
        // 如果在可生成生物的地形，设置初始地形
        if (terrainEffect.canSpawnOrganism) {
          organism.currentTerrainType = terrainType;
          break;
        }
      } while (attempts < maxAttempts);
      
      this.organisms.push(organism);
    }
  }

  // 批量初始化食物
  initFoods(count: number) {
    this.foods = [];
    for (let i = 0; i < count; i++) {
      let food;
      let attempts = 0;
      const maxAttempts = 10;
      
      // 确保食物在可生成食物的地形生成
      do {
        food = createFood(this.foodIdCounter, this.canvasWidth, this.canvasHeight);
        const terrainType = this.getTerrainAt(food.x, food.y);
        const terrainEffect = this.getTerrainEffect(terrainType);
        attempts++;
        
        if (terrainEffect.canSpawnFood) {
          food.terrainType = terrainType;
          break;
        }
      } while (attempts < maxAttempts);
      
      this.foods.push(food);
    }
  }

  // 添加单个生物
  addOrganism() {
    let organism;
    let attempts = 0;
    const maxAttempts = 10;
    
    // 确保生物不在海洋生成
    do {
      organism = createOrganism('basic', this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
      const terrainType = this.getTerrainAt(organism.x, organism.y);
      const terrainEffect = this.getTerrainEffect(terrainType);
      attempts++;
      
      if (terrainEffect.canSpawnOrganism) {
        organism.currentTerrainType = terrainType;
        break;
      }
    } while (attempts < maxAttempts);
    
    this.organisms.push(organism);
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
    const hasTerrain = this.config.hasTerrain !== false;

    // 单次遍历完成更新、吃食物和死亡检查
    for (let i = 0; i < this.organisms.length; i++) {
      const organism = this.organisms[i];

      // 更新生物状态，传入地形信息
      organism.update(this.foods, this);
      
      // 处理地形影响
      if (hasTerrain) {
        const terrainType = this.getTerrainAt(organism.x, organism.y);
        const terrainEffect = this.getTerrainEffect(terrainType);
        
        // 更新当前地形类型
        if (organism.currentTerrainType !== terrainType) {
          organism.currentTerrainType = terrainType;
        }
        
        // 应用地形对速度的影响
        organism.adjustedSpeed = organism.speed * terrainEffect.speedMultiplier;
        
        // 应用地形对饥饿率的影响
        organism.hungerRateMultiplier = terrainEffect.hungerRateMultiplier;
      } else {
        organism.adjustedSpeed = organism.speed;
        organism.hungerRateMultiplier = 1.0;
      }

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
          const food = {
            id: this.foodIdCounter.current++,
            x: organism.x,
            y: organism.y,
            size: 4,
            color: 'hsl(120, 100%, 60%)'
          };
          
          // 地形类型信息已通过其他方式处理，不再需要单独存储在食物对象上
          
          this.foods.push(food);
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
              // 生成后代，确保在合适的地形
              let offspring;
              let attempts = 0;
              const maxAttempts = 10;
              
              do {
                offspring = createOrganism(organism.type, this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
                // 计算父母中间位置
                const centerX = (organism.x + partner.x) / 2;
                const centerY = (organism.y + partner.y) / 2;
                // 在父母旁边随机位置生成（±20像素范围内）
                const offsetAngle = Math.random() * Math.PI * 2;
                const offsetDistance = (organism.size + partner.size) * 0.5 + Math.random() * 10;
                offspring.x = centerX + Math.cos(offsetAngle) * offsetDistance;
                offspring.y = centerY + Math.sin(offsetAngle) * offsetDistance;
                
                // 确保后代在可生存的地形
                if (hasTerrain) {
                  const terrainType = this.getTerrainAt(offspring.x, offspring.y);
                  const terrainEffect = this.getTerrainEffect(terrainType);
                  attempts++;
                  
                  if (terrainEffect.canSpawnOrganism) {
                    offspring.currentTerrainType = terrainType;
                    break;
                  }
                }
              } while (hasTerrain && attempts < maxAttempts);
              
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
            organism.speed = Math.random() * 0.2 + this.config.speed * 0.3; // 恢复移动能力，增加随机性

            // 重置伙伴的繁殖状态
            partner.isBreeding = false;
            partner.breedingPartnerId = undefined;
            partner.breedingTime = undefined;
            partner.breedingProgress = 0;
            partner.speed = Math.random() * 0.2 + this.config.speed * 0.3; // 恢复移动能力，增加随机性
          }
        } else {
          // 伙伴不在了或状态不一致，取消繁殖
          organism.isBreeding = false;
            organism.breedingPartnerId = undefined;
            organism.breedingTime = undefined;
            organism.breedingProgress = 0;
            organism.speed = Math.random() * 0.2 + this.config.speed * 0.3; // 恢复移动能力，增加随机性
        }
      } else {
        // 繁殖系统 - 改进版：需要双方都确认繁殖状态
        if (!organism.isBreeding && organism.hunger > 80 && organism.age > 100) {
          // 有概率进入繁殖准备状态
        if (Math.random() < 0.005) { // 降低触发概率
          organism.isBreeding = true;
          organism.breedingTime = now;
          organism.breedingProgress = 0;
          organism.speed = this.config.speed * 0.3; // 设置为正常速度的30%，而不是完全停止
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
          // 设置进化后生物的地形类型
          if (hasTerrain) {
            evolved.currentTerrainType = this.getTerrainAt(evolved.x, evolved.y);
          }
          newOrganisms.push(evolved);
          // 移除原生物，避免重复添加
          continue;
        }
      }

      // 繁殖中的生物停止移动
      if (organism.isBreeding) {
        // 设置较低的繁殖状态速度，而不是完全静止
        const breedingSpeed = this.config.speed * 0.3; // 繁殖状态下的速度为正常的30%
        organism.speed = breedingSpeed;
        
        // 如果有繁殖伙伴，调整位置使其互相吸引
        if (organism.breedingPartnerId) {
          const partner = this.organisms.find(o => o.id === organism.breedingPartnerId);
          if (partner && partner.isBreeding) {
            const dx = partner.x - organism.x;
            const dy = partner.y - organism.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = organism.size + partner.size; // 目标距离：两个生物半径之和

            // 如果距离太远，以适当速度靠近
            if (distance > targetDistance + 2) {
              // 增加移动量，使繁殖中的生物更容易靠近
              const moveAmount = Math.min(breedingSpeed * 2, distance - targetDistance); 
              organism.x += (dx / distance) * moveAmount;
              organism.y += (dy / distance) * moveAmount;
              
              // 同时也让伙伴稍微移动，增加互动感
              if (Math.random() < 0.5) { // 50%的概率让伙伴也移动一点
                partner.x -= (dx / distance) * (moveAmount * 0.3);
                partner.y -= (dy / distance) * (moveAmount * 0.3);
              }
            } else if (distance < targetDistance - 1) {
              // 如果太近，稍微分开一点
              const moveAmount = Math.min(breedingSpeed, targetDistance - distance);
              organism.x -= (dx / distance) * moveAmount;
              organism.y -= (dy / distance) * moveAmount;
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
      let food;
      let attempts = 0;
      const maxAttempts = 10;
      
      // 确保食物在可生成食物的地形生成
      do {
        food = createFood(this.foodIdCounter, this.canvasWidth, this.canvasHeight);
        if (hasTerrain) {
          const terrainType = this.getTerrainAt(food.x, food.y);
          const terrainEffect = this.getTerrainEffect(terrainType);
          attempts++;
          
          if (terrainEffect.canSpawnFood) {
            food.terrainType = terrainType;
            break;
          }
        } else {
          break;
        }
      } while (hasTerrain && attempts < maxAttempts);
      
      this.foods.push(food);
    }
  }

  // 计算FPS和性能统计
  calculateStats(currentFps: number, currentFrameTime: number): { fps: number; frameTime: number; organismTypes: { basic: number; predator: number; scavenger: number }; terrainDistribution?: { [key: string]: number } } {
    const organismTypes = { basic: 0, predator: 0, scavenger: 0 };
    this.organisms.forEach(organism => {
      if (organism.type && organismTypes.hasOwnProperty(organism.type)) {
        organismTypes[organism.type]++;
      }
    });
    
    // 计算地形分布统计
    let terrainDistribution;
    if (this.config.hasTerrain !== false && this.terrainGrid.length > 0) {
      terrainDistribution = {
        'ocean': 0,
        'beach': 0,
        'forest': 0,
        'mountain': 0,
        'plains': 0
      };
      
      this.terrainGrid.forEach(row => {
        row.forEach(cell => {
          terrainDistribution![cell.type]++;
        });
      });
    }

    const stats: any = {
      fps: Math.round(currentFps),
      frameTime: currentFrameTime || 0,
      organismTypes
    };
    
    if (terrainDistribution) {
      stats.terrainDistribution = terrainDistribution;
    }
    
    return stats;
  }
}