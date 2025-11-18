import { Organism, Food, SandboxConfig, TerrainCell, TerrainEffect, TerrainType, Thunderstorm, EcosystemStage, OrganismType } from './types';
import { createOrganism, createFood } from './utils';
import { SpatialPartition } from './spatial-partition';

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
  private spatialPartition: SpatialPartition; // 空间分区系统
  private newOffspring: Organism[] | null = null; // 用于存储分裂产生的新细胞
  
  // 雷暴相关
  private thunderstorms: Thunderstorm[];
  private thunderstormIdCounter: number;
  private lastThunderstormTime: number;
  private thunderstormMinInterval: number; // 雷暴最小间隔时间
  private thunderstormMaxInterval: number; // 雷暴最大间隔时间

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
    
    // 初始化雷暴相关属性
    this.thunderstorms = [];
    this.thunderstormIdCounter = 0;
    this.lastThunderstormTime = 0;
    this.thunderstormMinInterval = 3000; // 3秒
    this.thunderstormMaxInterval = 8000; // 8秒
    
    // 初始化配置中的缺失字段
    if (this.config.prokaryoticCount === undefined) {
        this.config.prokaryoticCount = 0;
      }
      
      if (this.config.prokaryoticThreshold === undefined) {
      this.config.prokaryoticThreshold = 3; // 用户确认的当前值
    }
    
    // 初始化地形效果
    this.initTerrainEffects();
    
    // 生成地形 - 根据当前阶段决定地形类型
    if (this.hasTerrain) {
      this.generateTerrain(this.terrainGridSize);
    }
    
    // 初始化空间分区系统
    this.spatialPartition = new SpatialPartition(this.canvasWidth, this.canvasHeight, 50); // 网格大小设为50以获得良好性能
    
    // 不再直接生成原始汤，当前阶段不需要原始汤
    if (this.config.currentStage === 'primordial_soup') {
      // 不生成原始汤，保持canAdvanceStage为false
      this.config.canAdvanceStage = false;
    }
    
    // 服务器端初始化日志
    console.log(`[SERVER-INIT] EcosystemManager初始化完成，当前阶段: ${this.config.currentStage}, 是否启用地形: ${this.hasTerrain}`);
  }
  
  // 更新原核生物进度检查（用于第二阶段进阶到第三阶段）
  private updateProkaryoticProgress() {
    if (this.config.currentStage !== 'prokaryotic_eukaryotic') return;
    
    // 计算当前原核生物（蓝藻）和原始真核细胞数量
    const cyanobacteriaCount = this.organisms.filter(organism => organism.type === 'cyanobacteria').length;
    const primitiveEukaryoteCount = this.organisms.filter(organism => organism.type === 'primitive_eukaryote').length;
    const totalCount = cyanobacteriaCount + primitiveEukaryoteCount;
    
    this.config.prokaryoticCount = totalCount;
    
    // 设置默认阈值（如果未设置）
    if (!this.config.prokaryoticThreshold) {
      this.config.prokaryoticThreshold = 30; // 与构造函数中的默认值保持一致
    }
    
    // 检查是否达到阈值
    if (totalCount >= this.config.prokaryoticThreshold) {
      this.config.canAdvanceStage = true;
      console.log('可以进阶到真核生物分化时代了！蓝藻数量:', cyanobacteriaCount, '原始真核细胞数量:', primitiveEukaryoteCount, '总数:', totalCount);
    } else {
      this.config.canAdvanceStage = false;
    }
  }
  
  // 更新有机碎屑（不再随时间衰变，除非被吃掉）
  private updateOrganicDebris(): void {
    // 移除有机碎屑的衰变逻辑，让它只在被吃掉时才会消失
    // 保留此方法以保持接口一致性，但不做实际过滤
  }
  
  // 初始化地形效果
  private initTerrainEffects() {
    this.terrainEffects.set('ocean', {
      speedMultiplier: 0.5,  // 降低海洋中的速度，避免消耗过多能量
      hungerRateMultiplier: 1.3, // 降低饥饿率加成，使海洋不再那么危险
      canSpawnFood: false,
      canSpawnOrganism: false,
      canPassThrough: true,
      breedingChanceMultiplier: 0.5,    // 略微提高繁殖概率
      healthRegenerationRate: 0.005,    // 添加少量健康恢复
      foodDetectionRangeMultiplier: 1.0, // 恢复正常食物检测范围
      colorTint: 'rgba(230, 6, 69, 0.2)' // 轻微蓝色调
    });
    
    this.terrainEffects.set('beach', {
      speedMultiplier: 1.1,
      hungerRateMultiplier: 1.2,
      canSpawnFood: true,
      canSpawnOrganism: true,
      canPassThrough: true,
      breedingChanceMultiplier: 1.2,    // 略高的繁殖概率
      healthRegenerationRate: 0.005,    // 轻微健康恢复
      foodDetectionRangeMultiplier: 1.1, // 轻微食物检测范围增加
      colorTint: 'rgba(255, 222, 173, 0.2)' // 沙滩色调
    });
    
    this.terrainEffects.set('forest', {
      speedMultiplier: 0.8,
      hungerRateMultiplier: 0.9,
      canSpawnFood: true,
      canSpawnOrganism: true,
      canPassThrough: true,
      breedingChanceMultiplier: 1.5,    // 高繁殖概率（适合繁殖）
      healthRegenerationRate: 0.01,     // 中等健康恢复
      foodDetectionRangeMultiplier: 1.3, // 高食物检测范围（资源丰富）
      colorTint: 'rgba(0, 100, 0, 0.2)' // 绿色调
    });
    
    this.terrainEffects.set('mountain', {
      speedMultiplier: 0.3,  // 降低山脉中的速度
      hungerRateMultiplier: 1.5,
      canSpawnFood: false,
      canSpawnOrganism: true,
      canPassThrough: false,
      breedingChanceMultiplier: 0.9,    // 稍低的繁殖概率
      healthRegenerationRate: 0.015,    // 高健康恢复（山地生物适应能力强）
      foodDetectionRangeMultiplier: 0.7, // 低食物检测范围（资源稀少）
      colorTint: 'rgba(169, 169, 169, 0.2)' // 灰色调
    });
    
    this.terrainEffects.set('plains', {
      speedMultiplier: 1.3,
      hungerRateMultiplier: 1.0,
      canSpawnFood: true,
      canSpawnOrganism: true,
      canPassThrough: true,
      breedingChanceMultiplier: 1.3,    // 较高的繁殖概率
      healthRegenerationRate: 0.008,    // 轻微健康恢复
      foodDetectionRangeMultiplier: 1.2, // 中等食物检测范围
      colorTint: 'rgba(230, 242, 230, 0.2)' // 草原绿色调
    });
  }
  
  // 生成地形（使用改进的地形分布算法）
  private generateTerrain(gridSize: number) {
    // 根据画布尺寸确定网格大小，确保最小尺寸
    const cellSize = gridSize || 20;
    const widthCells = Math.max(20, Math.floor(this.canvasWidth / cellSize));
    const heightCells = Math.max(20, Math.floor(this.canvasHeight / cellSize));
    
    // 初始化地形网格
    this.terrainGrid = Array(heightCells).fill(0).map(() => Array(widthCells).fill(0).map(() => ({
      type: 'plains' as TerrainType,
      x: 0,
      y: 0,
      size: cellSize
    })));
    
    // 根据当前阶段生成不同的地形
    if (this.config.currentStage === 'primordial_soup') {
      // 原始汤时代：只生成纯海洋地形，不进行任何陆地连通性检查
      for (let y = 0; y < heightCells; y++) {
        for (let x = 0; x < widthCells; x++) {
          this.terrainGrid[y][x] = { type: 'ocean' };
        }
      }
    } else if (this.config.currentStage === 'prokaryotic_eukaryotic') {
      // 原核+原始真核时代：海洋占90%，沙滩占10%
      for (let y = 0; y < heightCells; y++) {
        for (let x = 0; x < widthCells; x++) {
          const terrainType = Math.random() < 0.9 ? 'ocean' : 'beach';
          this.terrainGrid[y][x] = { type: terrainType };
        }
      }
      // 确保沙滩和海洋有合理的过渡
      this.smoothTerrain();
    } else {
      // 其他阶段：生成多样化地形
      // 步骤1: 生成基础地形高度图
      const heightMap: number[][] = Array(heightCells).fill(0).map(() => Array(widthCells).fill(0));
      for (let y = 0; y < heightCells; y++) {
        for (let x = 0; x < widthCells; x++) {
          heightMap[y][x] = this.getNoise(x, y);
        }
      }
      
      // 步骤2: 第一次地形分配
      for (let y = 0; y < heightCells; y++) {
        for (let x = 0; x < widthCells; x++) {
          const noise = heightMap[y][x];
          
          // 五种地形类型的阈值分配
          let terrainType: TerrainType;
          
          // 基础阈值定义
          const oceanThreshold = 0.25;
          const beachThreshold = 0.32;
          const forestThreshold = 0.85;
          
          // 平原概率峰值区域
          const plainsPeakMin = 0.5;
          const plainsPeakMax = 0.7;
          const plainsProbabilityFactor = 0.6;
          
          // 确定地形类型
          if (noise < oceanThreshold) {
            terrainType = 'ocean';
          } else if (noise < beachThreshold) {
            terrainType = 'beach';
          } else {
            const isInPlainsPeak = noise >= plainsPeakMin && noise < plainsPeakMax;
            
            if (isInPlainsPeak) {
              if (Math.random() < plainsProbabilityFactor || noise < forestThreshold - 0.05) {
                terrainType = 'plains';
              } else if (noise < forestThreshold) {
                terrainType = 'forest';
              } else {
                terrainType = 'mountain';
              }
            } else {
              if (noise < forestThreshold - 0.02) {
                terrainType = 'plains';
              } else if (noise < forestThreshold) {
                terrainType = 'forest';
              } else {
                terrainType = 'mountain';
              }
            }
          }
          
          this.terrainGrid[y][x] = { type: terrainType };
        }
      }
      
      // 步骤3: 地形平滑和连续性增强
      this.smoothTerrain();
      
      // 步骤4: 确保地形过渡自然
      this.enforceTerrainTransitions();
      
      // 步骤5: 特殊处理山脉分布
      this.distributeMountains();
      
      // 确保陆地连通性
      this.ensureLandConnectivity();
    }
    
    // 初始化每个网格单元的坐标信息
    for (let y = 0; y < heightCells; y++) {
      for (let x = 0; x < widthCells; x++) {
        this.terrainGrid[y][x].x = x * cellSize;
        this.terrainGrid[y][x].y = y * cellSize;
        this.terrainGrid[y][x].size = cellSize;
      }
    }
    
    // 保存网格大小
    this.terrainGridSize = cellSize;
    this.hasTerrain = true;
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
    
    // 提高森林转换率，确保森林足够多
    const forestConversionRate = 0.4; // 40%的平原转换为森林
    const forestCount = Math.floor(plainAreas.length * forestConversionRate);
    
    // 随机选择平原区域转换为森林
    const shuffledAreas = plainAreas.sort(() => 0.5 - Math.random());
    for (let i = 0; i < forestCount; i++) {
      if (i < shuffledAreas.length) {
        const {x, y} = shuffledAreas[i];
        
        // 创建更大的森林区域
        const forestSize = 3 + Math.floor(Math.random() * 4);
        for (let dy = -forestSize; dy <= forestSize; dy++) {
          for (let dx = -forestSize; dx <= forestSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 创建圆形森林区域
            if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
                distance <= forestSize && 
                this.terrainGrid[ny][nx].type === 'plains') {
              // 提高森林生成概率，让更多区域变成森林
              if (Math.random() > distance / (forestSize + 1.5)) {
                this.terrainGrid[ny][nx].type = 'forest';
              }
            }
          }
        }
      }
    }
    
    // 确保地图上至少有几处大型森林区域
    this.createLargeForestAreas();
  }
  
  // 创建大型森林区域
  private createLargeForestAreas() {
    const heightCells = this.terrainGrid.length;
    const widthCells = this.terrainGrid[0].length;
    
    // 找出大面积的平原区域作为大型森林的候选位置
    const largePlainAreas: {x: number, y: number}[] = [];
    
    // 扫描地图，找到潜在的大型平原区域中心
    for (let y = 10; y < heightCells - 10; y++) {
      for (let x = 10; x < widthCells - 10; x++) {
        if (this.terrainGrid[y][x].type === 'plains') {
          // 检查周围是否有足够大的平原区域
          let plainCount = 0;
          for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
                  this.terrainGrid[ny][nx].type === 'plains') {
                plainCount++;
              }
            }
          }
          
          // 如果有足够大的平原区域，加入候选列表
          if (plainCount > 50) {
            largePlainAreas.push({x, y});
          }
        }
      }
    }
    
    // 确保至少创建2-3个大型森林区域
    const largeForestCount = Math.min(3, Math.max(2, Math.floor(largePlainAreas.length / 3)));
    
    // 从候选位置中随机选择并创建大型森林
    const shuffledLargeAreas = largePlainAreas.sort(() => 0.5 - Math.random());
    for (let i = 0; i < largeForestCount; i++) {
      if (i < shuffledLargeAreas.length) {
        const {x, y} = shuffledLargeAreas[i];
        
        // 创建非常大的森林区域
        const largeForestSize = 6 + Math.floor(Math.random() * 4);
        for (let dy = -largeForestSize; dy <= largeForestSize; dy++) {
          for (let dx = -largeForestSize; dx <= largeForestSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (nx >= 0 && nx < widthCells && ny >= 0 && ny < heightCells && 
                distance <= largeForestSize && 
                this.terrainGrid[ny][nx].type === 'plains') {
              // 高概率转换为森林
              if (Math.random() > distance / (largeForestSize + 1)) {
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
  
  // 创建雷暴
  private createThunderstorm() {
    // 只在原始汤时代创建雷暴
    if (this.config.currentStage !== 'primordial_soup') return;
    
    // 随机位置，但确保在画布内
    const x = Math.random() * this.canvasWidth;
    const y = Math.random() * this.canvasHeight;
    
    // 确保雷暴落在海洋地形上
    const terrainType = this.getTerrainAt(x, y);
    if (terrainType !== 'ocean') return;
    
    // 创建雷暴对象
    const thunderstorm: Thunderstorm = {
      id: this.thunderstormIdCounter++,
      x: x,
      y: y,
      radius: 30 + Math.random() * 50, // 随机半径
      intensity: 0.5 + Math.random() * 0.5, // 0.5到1.0的强度
      duration: 1000 + Math.random() * 2000, // 1到3秒的持续时间
      startTime: performance.now(),
      isActive: true,
      color: `rgba(255, ${200 + Math.floor(Math.random() * 55)}, 0, ${0.6 + Math.random() * 0.4})`
    };
    
    this.thunderstorms.push(thunderstorm);
  }

  // 更新雷暴
  private updateThunderstorms() {
    const now = performance.now();
    
    // 清理已结束的雷暴
    this.thunderstorms = this.thunderstorms.filter(thunderstorm => {
      const elapsed = now - thunderstorm.startTime;
      if (elapsed > thunderstorm.duration) {
        // 雷暴结束时，有概率生成原始汤
        if (Math.random() < 0.7) { // 修复概率从0.4改为0.7，确保更容易生成原始汤
          this.spawnPrimordialSoup(thunderstorm.x, thunderstorm.y);
        }
        return false;
      }
      return true;
    });
    
    // 检查是否需要生成新雷暴
    if (now - this.lastThunderstormTime > this.thunderstormMinInterval) {
      // 在最小间隔和最大间隔之间随机决定是否生成
      const interval = this.thunderstormMinInterval + Math.random() * (this.thunderstormMaxInterval - this.thunderstormMinInterval);
      if (now - this.lastThunderstormTime > interval) {
        this.createThunderstorm();
        this.lastThunderstormTime = now;
      }
    }
  }

  // 生成原始汤
  private spawnPrimordialSoup(x: number, y: number) {
    // 确保在海洋地形上生成
    const terrainType = this.getTerrainAt(x, y);
    if (terrainType !== 'ocean') return;
    
    // 创建原始汤（作为特殊的食物）
    const primordialSoup: Food = {
      id: this.foodIdCounter.current++,
      x: x,
      y: y,
      size: 5 + Math.random() * 5,
      isPrimordialSoup: true,
      terrainType: 'ocean',
      isFlashing: true,
      flashTime: performance.now()
    };
    
    this.foods.push(primordialSoup);
    
    // 更新原始汤计数
    this.config.primordialSoupCount++;
    console.log(`生成原始汤！当前数量: ${this.config.primordialSoupCount}`);
    
    // 检查是否可以解锁下一阶段
    if (this.config.primordialSoupCount >= this.config.primordialSoupThreshold) {
      this.config.canAdvanceStage = true;
      console.log(`原始汤数量达到阈值！现在可以进阶到下一阶段。`);
    }
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
      canSpawnOrganism: true,
      canPassThrough: true
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
  
  // 获取雷暴数组
  public getThunderstorms(): Thunderstorm[] {
    return this.thunderstorms;
  }
  
  // 进入下一阶段
  public advanceStage(): boolean {
    console.log(`尝试进阶阶段: 当前阶段=${this.config.currentStage}, canAdvanceStage=${this.config.canAdvanceStage}`);
    
    // 从原始汤阶段到原核+原始真核时代
    if (this.config.currentStage === 'primordial_soup') {
      // 进入原核+原始真核时代
      this.config.currentStage = 'prokaryotic_eukaryotic';
      this.config.canAdvanceStage = false;
      console.log('成功进入原核+原始真核时代！');
      
      // 重新生成地形以包含陆地（第二阶段需要陆地）
      if (this.hasTerrain) {
        console.log('重新生成地形以包含陆地...');
        this.generateTerrain(this.terrainGridSize);
      }
      
      // 将原始汤转化为蓝藻或原始真核细胞
      this.organisms = [];
      const primordialSoups = this.foods.filter(food => food.isPrimordialSoup);
      console.log(`找到 ${primordialSoups.length} 个原始汤，开始转化为生物...`);
      
      primordialSoups.forEach(soup => {
        // 50%概率变成蓝藻，50%概率变成原始真核细胞
        const organismType = Math.random() > 0.5 ? 'cyanobacteria' : 'primitive_eukaryote';
        const newOrganism = {
          id: this.idCounter.current++,
          x: soup.x,
          y: soup.y,
          size: 8,
          speed: organismType === 'cyanobacteria' ? 0.05 : 0.2,
          direction: Math.random() * Math.PI * 2,
          color: organismType === 'cyanobacteria' ? '#00FF00' : '#00CCFF',
          hunger: 150, // 提高饥饿上限
          type: organismType as any,
          age: 0,
          canEvolve: false,
          isBreeding: false,
          breedingPartnerId: undefined,
          breedingTime: undefined,
          breedingProgress: 0,
          isDetectingFood: false,
          foodDetectionTime: undefined,
          detectedFoodDistance: undefined,
          lastSplitAge: 0,
          // 添加当前地形类型
          currentTerrainType: this.getTerrainAt(soup.x, soup.y),
          // 调整后的速度和饥饿率
          adjustedSpeed: organismType === 'cyanobacteria' ? 0.05 : 0.2,
          hungerRateMultiplier: 1.0,
          isPreparingSplit: false,
          splitPreparationTime: undefined as number | undefined,
          calculateDistance: function(x: number, y: number): number {
            const dx = x - this.x;
            const dy = y - this.y;
            return Math.sqrt(dx * dx + dy * dy);
          },
          findNearestFood: function(foods: any[]): any | null {
            return null; // 第二阶段生物不需要寻找食物
          },
          eat: function(food: any): boolean {
            return false; // 第二阶段生物不需要进食
          },
          evolve: function(): any | null {
            return null; // 第二阶段生物暂时不进化
          },
          update: function(foods: any[], ecosystemManager: any) {
            this.age++;
            const preparationDuration = 1000; // 分裂准备时间（毫秒） - 修改为1秒
            
            // 初始化分裂准备状态属性（如果不存在）
            if (this.isPreparingSplit === undefined) {
              this.isPreparingSplit = false;
              this.splitPreparationTime = undefined;
            }
            
            // 分裂准备阶段：原地旋转
            if (this.isPreparingSplit) {
              const now = Date.now();
              const preparationDuration = 800; // 准备时间0.8秒，确保总分裂时间不超过1秒
              
              // 快速原地旋转
              this.direction += 0.1; // 增加旋转速度
              
              // 暂停移动
              this.speed = 0;
              
              // 准备时间结束，进行分裂
              if (this.splitPreparationTime !== undefined && now - this.splitPreparationTime >= preparationDuration) {
              // 设置随机大小范围，让分裂后的生物大小有变化
              const minSize = 3;
              const maxSize = 6;
              const newOrganism = {
                id: ecosystemManager.idCounter.current++,
                x: this.x + (Math.random() - 0.5) * 20,
                y: this.y + (Math.random() - 0.5) * 20,
                size: minSize + Math.random() * (maxSize - minSize),
                speed: ecosystemManager.config.speed * (0.5 + Math.random() * 0.5),
                isPreparingSplit: false,
                splitPreparationTime: undefined,
                direction: Math.random() * Math.PI * 2,
                color: this.color,
                hunger: 150, // 提高饥饿上限
                type: this.type,
                age: 0,
                canEvolve: false,
                isBreeding: false,
                breedingPartnerId: undefined,
                breedingTime: undefined,
                breedingProgress: 0,
                isDetectingFood: false,
                foodDetectionTime: undefined,
                detectedFoodDistance: undefined,
                lastSplitAge: 0,
                currentTerrainType: ecosystemManager.getTerrainAt(this.x, this.y),
                adjustedSpeed: this.adjustedSpeed,
                hungerRateMultiplier: this.hungerRateMultiplier,
                calculateDistance: this.calculateDistance,
                findNearestFood: this.findNearestFood,
                eat: this.eat,
                evolve: this.evolve,
                update: this.update
              };
              
              // 使用临时数组存储新细胞，避免在遍历过程中修改数组
              if (!ecosystemManager.newOffspring) {
                ecosystemManager.newOffspring = [];
              }
              
              // 只添加一个新细胞，实现一分为二
              ecosystemManager.newOffspring.push(newOrganism);
              
              // 分裂后消耗能量
              this.hunger -= 50;
              this.lastSplitAge = this.age;
              
              // 分裂完成，重置母体状态
              this.isPreparingSplit = false;
              this.splitPreparationTime = undefined;
              this.speed = ecosystemManager.config.speed * (0.5 + Math.random() * 0.5);
            }
          } else {
            // 检查是否可以进入分裂准备状态
            if (this.age > 1000 && this.hunger > 80 && 
                (!this.lastSplitAge || this.age - this.lastSplitAge > 500)) {
              if (Math.random() < 0.002) {
                this.isPreparingSplit = true;
                this.splitPreparationTime = Date.now();
              }
            }
          }
          
          // 寿命限制 - 第三阶段年龄上限对半砍，防止无限生殖
          const maxLifespan = 5000;
          if (this.age >= maxLifespan) {
            this.hunger = 0;
          }
          
          // 移动逻辑
          if (!this.isPreparingSplit) {
            this.direction += (Math.random() - 0.5) * 0.1;
            this.x += Math.cos(this.direction) * this.speed;
            this.y += Math.sin(this.direction) * this.speed;
          }
          
          // 边界检查
          if (this.x < 0) this.x = 0;
          if (this.x > ecosystemManager.canvasWidth) this.x = ecosystemManager.canvasWidth;
          if (this.y < 0) this.y = 0;
          if (this.y > ecosystemManager.canvasHeight) this.y = ecosystemManager.canvasHeight;
          
          // 地形效果
          const terrainType = ecosystemManager.getTerrainAt(this.x, this.y);
          this.currentTerrainType = terrainType;
          const terrainEffect = ecosystemManager.getTerrainEffect(terrainType);
          this.adjustedSpeed = this.speed * terrainEffect.speedMultiplier;
        }
      };
      // @ts-ignore - 暂时忽略类型检查
      this.organisms.push(newOrganism);
    });
    
    // 清除所有食物
    this.foods = [];
    
    // 重新生成地形
    if (this.hasTerrain) {
      this.generateTerrain(this.terrainGridSize);
    }
    
    // 清空雷暴
    this.thunderstorms = [];
    
    return true;
  } else if (this.config.currentStage === 'prokaryotic_eukaryotic') {
      // 进入第三阶段：真核生物分化时代
      this.config.currentStage = 'evolution';
      this.config.canAdvanceStage = false;
      console.log('成功进入真核生物分化时代！');
      
      // 调用专门的方法处理第三阶段转换
      this.advanceToEukaryoticDiversification();
      
      return true;
    }
    
    return false;
  }
  
  // 支持从第二阶段到第三阶段的转换已包含在上方advanceStage方法中
  
  // 生成第三阶段的地形（海洋7:沙滩2:平原1的比例）
  private generateTerrainForThirdStage(gridSize: number) {
    const cols = Math.ceil(this.canvasWidth / gridSize);
    const rows = Math.ceil(this.canvasHeight / gridSize);
    const terrainGrid: TerrainCell[][] = [];
    
    // 修复：确保网格正确初始化，避免地图被压扁
    // 先初始化行，再初始化列，确保数据结构正确
    for (let j = 0; j < rows; j++) {
      terrainGrid[j] = [];
      for (let i = 0; i < cols; i++) {
        terrainGrid[j][i] = { type: 'ocean' }; // 默认为海洋
      }
    }
    
    // 使用Perlin噪声生成地形 - 修复噪声参数，使地形更加自然
    const noiseScale = 0.05; // 减小噪声比例，使地形特征更大
    const octaves = 3;
    const persistence = 0.5;
    const lacunarity = 2.0;
    
    // 计算每种地形的目标比例 - 确保海洋比例比沙滩多
    const targetOceanRatio = 0.5; // 海洋比例提高到50%
    const targetBeachRatio = 0.3; // 沙滩比例调整为30%
    const targetPlainsRatio = 0.2; // 平原比例保持20%
    
    // 计算阈值
    const beachThreshold = targetOceanRatio;
    const plainsThreshold = targetOceanRatio + targetBeachRatio;
    
    // 修复：调整遍历顺序，先遍历行再遍历列，与网格初始化顺序一致
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        let noiseValue = 0;
        let amplitude = 1;
        let frequency = 1;
        let maxValue = 0;
        
        for (let k = 0; k < octaves; k++) {
          // 计算噪声值 - 使用一致的坐标系统
          const x = i * noiseScale * frequency;
          const y = j * noiseScale * frequency;
          const perlinValue = this.perlin(x, y);
          noiseValue += perlinValue * amplitude;
          maxValue += amplitude;
          amplitude *= persistence;
          frequency *= lacunarity;
        }
        
        // 归一化噪声值到[0, 1]范围
        noiseValue = (noiseValue + 1) / 2;
        
        // 根据噪声值和目标比例分配地形
        if (noiseValue < beachThreshold) {
          terrainGrid[j][i] = { type: 'ocean' };
        } else if (noiseValue < plainsThreshold) {
          terrainGrid[j][i] = { type: 'beach' };
        } else {
          terrainGrid[j][i] = { type: 'plains' };
        }
      }
    }
    
    // 确保平原能够正确生成，不会被其他规则影响
    this.ensurePlainsGeneration(terrainGrid);
    
    this.terrainGrid = terrainGrid;
  }
  
  // 确保平原能够正确生成的辅助方法
  private ensurePlainsGeneration(terrainGrid: TerrainCell[][]) {
    const cols = terrainGrid.length;
    const rows = terrainGrid[0].length;
    
    // 统计当前地形分布
    const terrainCount = {
      ocean: 0,
      beach: 0,
      plains: 0
    };
    
    // 收集所有沙滩格子的位置
    const beachPositions: {x: number, y: number}[] = [];
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const type = terrainGrid[i][j].type;
        if (terrainCount.hasOwnProperty(type)) {
          // @ts-ignore - 暂时忽略类型检查
          terrainCount[type]++;
        }
        // 收集沙滩位置
        if (type === 'beach') {
          beachPositions.push({x: i, y: j});
        }
      }
    }
    
    // 计算总格子数
    const totalCells = cols * rows;
    
    // 平原目标比例与生成方法保持一致
    const targetPlainsCount = Math.floor(totalCells * 0.2);
    if (terrainCount.plains < targetPlainsCount) {
      console.log(`检测到平原数量不足，需要添加 ${targetPlainsCount - terrainCount.plains} 个平原`);
      
      let plainsToAdd = targetPlainsCount - terrainCount.plains;
      
      // 如果有沙滩位置，优先在沙滩区域内生成平原
      if (beachPositions.length > 0) {
        // 随机排序沙滩位置，确保分布均匀
        beachPositions.sort(() => Math.random() - 0.5);
        
        // 遍历沙滩位置，将部分沙滩转换为平原
        for (const pos of beachPositions) {
          if (plainsToAdd <= 0) break;
          
          // 有60%的概率将沙滩转换为平原
          if (Math.random() < 0.6) {
            terrainGrid[pos.x][pos.y].type = 'plains';
            terrainCount.beach--;
            terrainCount.plains++;
            plainsToAdd--;
          }
          
          // 同时尝试将周围的沙滩转换为平原
          const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          for (const [dx, dy] of directions) {
            if (plainsToAdd <= 0) break;
            
            const nx = pos.x + dx;
            const ny = pos.y + dy;
            
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
              if (terrainGrid[nx][ny].type === 'beach') {
                terrainGrid[nx][ny].type = 'plains';
                terrainCount.beach--;
                terrainCount.plains++;
                plainsToAdd--;
              }
            }
          }
        }
      }
      
      // 如果还需要更多平原，进行第二次遍历
      if (plainsToAdd > 0) {
        for (let i = 1; i < cols - 1 && plainsToAdd > 0; i++) {
          for (let j = 1; j < rows - 1 && plainsToAdd > 0; j++) {
            // 检查是否在沙滩附近
            if (this.isNearBeach(terrainGrid, i, j)) {
              if (terrainGrid[i][j].type === 'beach' && Math.random() < 0.5) {
                terrainGrid[i][j].type = 'plains';
                plainsToAdd--;
              }
            }
          }
        }
      }
      
      console.log(`平原生成完成，当前数量：${terrainCount.plains}`);
    }
  }
  
  // 检查位置是否靠近沙滩
  private isNearBeach(terrainGrid: TerrainCell[][], x: number, y: number): boolean {
    const directions = [[-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
                      [-1, -2], [-1, -1], [-1, 0], [-1, 1], [-1, 2],
                      [0, -2],  [0, -1],           [0, 1],  [0, 2],
                      [1, -2],  [1, -1],  [1, 0],  [1, 1],  [1, 2],
                      [2, -2],  [2, -1],  [2, 0],  [2, 1],  [2, 2]];
    
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < terrainGrid.length && ny >= 0 && ny < terrainGrid[0].length) {
        if (terrainGrid[nx][ny].type === 'beach') {
          return true;
        }
      }
    }
    
    return false;
  }
  
  // Perlin噪声函数的简化实现
  private perlin(x: number, y: number): number {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;
    
    // 计算平滑插值权重
    const sx = x - x0;
    const sy = y - y0;
    
    // 获取四个角的梯度值
    const n00 = this.dotGridGradient(x0, y0, x, y);
    const n01 = this.dotGridGradient(x0, y1, x, y);
    const n10 = this.dotGridGradient(x1, y0, x, y);
    const n11 = this.dotGridGradient(x1, y1, x, y);
    
    // 双线性插值
    const ix0 = this.lerp(n00, n10, sx);
    const ix1 = this.lerp(n01, n11, sx);
    const value = this.lerp(ix0, ix1, sy);
    
    return value;
  }
  
  // 计算网格点的梯度向量与到点(x,y)的向量的点积
  private dotGridGradient(ix: number, iy: number, x: number, y: number): number {
    // 使用简单的哈希函数生成伪随机梯度
    const rand = Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453123;
    const gx = Math.cos(rand * 2 * Math.PI);
    const gy = Math.sin(rand * 2 * Math.PI);
    
    const dx = x - ix;
    const dy = y - iy;
    
    return dx * gx + dy * gy;
  }
  
  // 线性插值
  private lerp(a: number, b: number, t: number): number {
    // 使用平滑的三次插值函数代替简单线性插值
    const ft = t * Math.PI;
    const f = (1 - Math.cos(ft)) * 0.5;
    return a * (1 - f) + b * f;
  }
  
  // 从第二阶段到第三阶段的转换方法
  private advanceToEukaryoticDiversification(): boolean {
    console.log('尝试进入第三阶段：真核生物分化时代');
    
    // 设置新的阶段
    this.config.currentStage = 'evolution';
    this.config.canAdvanceStage = false;
    console.log('成功进入第三阶段：真核生物分化时代！');
    
    // 重新生成地形，包含海洋、沙滩和平原（比例7:2:1）
    if (this.hasTerrain) {
      console.log('重新生成地形以包含海洋、沙滩和平原...');
      this.generateTerrainForThirdStage(this.terrainGridSize);
    }
    
    // 保存当前的蓝藻位置，用于第三阶段转换
    const cyanobacteriaPositions: Array<{x: number; y: number}> = [];
    // 保存原始真核细胞位置，用于转换为变形虫和水霉菌
    const primitiveEukaryotePositions: Array<{x: number; y: number}> = [];
    
    // 收集当前生物的位置
    this.organisms.forEach(organism => {
      if (organism.type === 'cyanobacteria') {
        cyanobacteriaPositions.push({ x: organism.x, y: organism.y });
      } else if (organism.type === 'primitive_eukaryote') {
        primitiveEukaryotePositions.push({ x: organism.x, y: organism.y });
      }
    });
    
    // 清空现有生物
    this.organisms = [];
    
    // 创建第三阶段的生物 - 蓝藻保持不变
    console.log(`转换 ${cyanobacteriaPositions.length} 个蓝藻到第三阶段...`);
    
    // 为了确保第三阶段有足够的蓝藻，我们先不考虑地形限制，直接创建
    // 之后在update方法中会根据地形进行适当的调整
    cyanobacteriaPositions.forEach((pos: {x: number; y: number}) => {
      const cyanobacteria = this.createOrganismForThirdStage('cyanobacteria', pos.x, pos.y);
      if (cyanobacteria) {
        // @ts-ignore - 暂时忽略类型检查
        this.organisms.push(cyanobacteria);
      }
    });
    
    // 为了确保蓝藻数量充足，额外在海洋区域随机添加一些蓝藻
    const additionalCyanobacteriaCount = Math.max(5, Math.floor(cyanobacteriaPositions.length * 0.5));
    console.log(`额外在海洋区域添加 ${additionalCyanobacteriaCount} 个蓝藻...`);
    
    for (let i = 0; i < additionalCyanobacteriaCount; i++) {
      // 寻找海洋区域
      let attempts = 0;
      let foundOceanSpot = false;
      
      while (attempts < 10 && !foundOceanSpot) {
        const randomX = Math.random() * this.canvasWidth;
        const randomY = Math.random() * this.canvasHeight;
        
        if (this.getTerrainAt(randomX, randomY) === 'ocean') {
          const cyanobacteria = this.createOrganismForThirdStage('cyanobacteria', randomX, randomY);
          if (cyanobacteria) {
            // @ts-ignore - 暂时忽略类型检查
            this.organisms.push(cyanobacteria);
            foundOceanSpot = true;
          }
        }
        attempts++;
      }
    }
    
    // 按照1:1的比例将原始真核细胞转换为变形虫和水霉菌
    console.log(`转换 ${primitiveEukaryotePositions.length} 个原始真核细胞到变形虫和水霉菌，严格按照1:1比例...`);
    
    // 计算需要转换为变形虫的数量（一半）
    const amoebaCount = Math.floor(primitiveEukaryotePositions.length / 2);
    
    // @ts-ignore - 暂时忽略类型检查
    primitiveEukaryotePositions.forEach((pos, index) => {
      // 前一半转换为变形虫，后一半转换为水霉菌，确保严格的1:1比例
      const organismType = index < amoebaCount ? 'amoeba' : 'water_mold' as OrganismType;
      const newOrganism = this.createOrganismForThirdStage(organismType, pos.x, pos.y);
      if (newOrganism) {
        // @ts-ignore - 暂时忽略类型检查
        this.organisms.push(newOrganism);
      }
    });
    
    console.log(`第三阶段生物创建完成：蓝藻 ${cyanobacteriaPositions.length} 个，变形虫 ${amoebaCount} 个，水霉菌 ${primitiveEukaryotePositions.length - amoebaCount} 个`);
    
    // 不再限制生物的活动区域，所有生物都可以在任何地形上活动
    // 已移除地形限制检查和非活动区生物清理逻辑
    
    // 清除所有食物
    this.foods = [];
    
    // 清空雷暴
    this.thunderstorms = [];
    
    return true;
  }
  
  // 为第三阶段创建生物
  private createOrganismForThirdStage(type: OrganismType, x: number, y: number) {
    // 设置生物属性
    let size = 8;
    let speed = 0.05;
    let color = '#00FF00';
    
    switch (type) {
      case 'cyanobacteria':
        // 与第二阶段蓝藻完全一致的属性设置
        size = Math.random() * 3 + 3; // 与第二阶段蓝藻相同的大小范围
        speed = Math.random() * 0.02 + 0.01; // 进一步降低移速
        color = `hsl(${Math.random() * 30 + 120}, 100%, 40%)`; // 绿色调
        break;
      case 'amoeba':
        size = Math.random() * 2 + 5; // 类似原始真核细胞的大小范围
        speed = Math.random() * 0.05 + 0.1 * this.config.speed; // 降低移速
        color = '#FF6600';
        break;
      case 'water_mold':
        size = Math.random() * 2 + 5; // 类似原始真核细胞的大小范围
        speed = Math.random() * 0.03 + 0.08 * this.config.speed; // 降低移速
        color = '#996633';
        break;
      default:
        return null;
    }
    
    // 创建生物对象
    return {
      id: this.idCounter.current++,
      x: x,
      y: y,
      size: size,
      speed: speed,
      direction: Math.random() * Math.PI * 2,
      color: color,
      hunger: 100,
      type: type,
      age: 0,
      canEvolve: false,
      isBreeding: false,
      breedingPartnerId: undefined,
      breedingTime: undefined,
      breedingProgress: 0,
      isDetectingFood: true, // 确保启用食物检测，用于显示绿色光圈
      foodDetectionTime: undefined,
      detectedFoodDistance: undefined,
      lastSplitAge: 0,
      // 添加当前地形类型
      currentTerrainType: this.getTerrainAt(x, y),
      // 调整后的速度和饥饿率
      adjustedSpeed: speed,
      hungerRateMultiplier: 1.0,
      isPreparingSplit: false,
      // 初始化地形适应性相关属性
      timeInUnsuitableTerrain: 0,
      isInSuitableTerrain: false,
      lastSuitableTerrainPosition: {x: x, y: y},
      splitPreparationTime: undefined as number | undefined,
      calculateDistance: function(x: number, y: number): number {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
      },
      findNearestFood: function(foods: any[]): any | null {
        let nearestFood = null;
        let minDistance = Infinity;
        
        // 增加食物检测基础范围
        const baseDetectionRange = 150; // 从100增加到150
        
        // 根据生物类型筛选食物
        const applicableFoods = foods.filter(food => {
          if (this.type === 'amoeba') {
            // 变形虫只吃蓝藻
            return food.type === 'cyanobacteria';
          } else if (this.type === 'water_mold') {
            // 水霉菌只吃有机碎屑
            return food.isOrganicDebris === true;
          }
          return false; // 蓝藻不需要吃任何东西
        });
        
        // 根据地形调整检测范围
        let detectionRange = baseDetectionRange;
        // @ts-ignore - 暂时忽略类型检查
        if (this.currentTerrainType && this.terrainEffect) {
          // @ts-ignore - 暂时忽略类型检查
          detectionRange *= this.terrainEffect.foodDetectionRangeMultiplier || 1.0;
        }
        
        // 找到最近的食物
        applicableFoods.forEach(food => {
          const distance = this.calculateDistance(food.x, food.y);
          if (distance < minDistance && distance < detectionRange) {
            minDistance = distance;
            nearestFood = food;
          }
        });
        
        return nearestFood;
      },
      eat: function(food: Food): boolean {
        if (this.type === 'amoeba') {
          // 变形虫只吃蓝藻
          // @ts-ignore - 暂时忽略类型检查
          if (!food.isOrganicDebris && !food.isPrimordialSoup && food.type === 'cyanobacteria') {
            // 吃蓝藻获得更多能量
            this.hunger = Math.min(150, this.hunger + 35); // 提高饥饿上限
            return true;
          }
        } else if (this.type === 'water_mold' && food.isOrganicDebris === true) {
          // 水霉菌只吃有机碎屑
          this.hunger = Math.min(150, this.hunger + 30); // 提高饥饿上限
          return true;
        }
        return false; // 蓝藻不需要吃任何东西
      },
      evolve: function(): any | null {
        return null; // 第三阶段生物暂时不进化
      },
      update: function(foods: any[], ecosystemManager: any) {
        this.age++;
        
        // 初始化卡住检测属性（如果不存在）
        // @ts-ignore - 暂时忽略类型检查
        if (this.stuckCounter === undefined) this.stuckCounter = 0;
        // @ts-ignore - 暂时忽略类型检查
        if (this.lastPosition === undefined) this.lastPosition = { x: this.x, y: this.y };
        
        // 检测是否卡住（位置变化小于阈值）
        const positionChangeThreshold = 0.1; // 位置变化阈值，小于此值视为卡住
        // @ts-ignore - 暂时忽略类型检查
        const dx = Math.abs(this.x - this.lastPosition.x);
        // @ts-ignore - 暂时忽略类型检查
        const dy = Math.abs(this.y - this.lastPosition.y);
        const positionChanged = dx > positionChangeThreshold || dy > positionChangeThreshold;
        
        if (!positionChanged && !this.isPreparingSplit) { // 分裂准备时不算卡住
          // @ts-ignore - 暂时忽略类型检查
          this.stuckCounter++;
        } else {
          // @ts-ignore - 暂时忽略类型检查
          this.stuckCounter = 0;
        }
        
        // 更新上一帧位置
        // @ts-ignore - 暂时忽略类型检查
        this.lastPosition.x = this.x;
        // @ts-ignore - 暂时忽略类型检查
        this.lastPosition.y = this.y;
        
        // 使用统一的年龄上限检查，大幅提高年龄上限
        if (this.age > 15000) { // 大幅提高年龄上限到15000
          // 有概率生成有机碎屑
          if (Math.random() < 0.7) { // 70%概率
            ecosystemManager.createOrganicDebris(this.x, this.y, this.type);
          }
          // 从生态系统中移除
          const index = ecosystemManager.organisms.findIndex((o: Organism) => o.id === this.id);
          if (index !== -1) {
            ecosystemManager.organisms.splice(index, 1);
          }
          return;
        }
        
        // 当生物卡住超过一定帧数时的处理
          const stuckThreshold = 90; // 增加到1.5秒（90帧）视为卡住
          // @ts-ignore - 暂时忽略类型检查
          if ((this.stuckCounter || 0) > stuckThreshold) {
            // 减少卡住时的饥饿惩罚
            this.hunger = Math.max(0, this.hunger - 0.05); // 从0.1减少到0.05
            
            // 提高卡住死亡的饥饿阈值，给生物更多机会
            // @ts-ignore - 暂时忽略类型检查
            if ((this.stuckCounter || 0) > stuckThreshold * 8 && this.hunger < 20) { // 增加到8倍时间，降低饥饿阈值
              console.log(`${this.type} 生物ID:${this.id} 因长时间卡住而死亡`);
              // @ts-ignore - 暂时忽略类型检查，后续会在类型定义中添加该属性
                this.toBeRemoved = true;
              return;
            }
            
            // 提高改变方向的概率，帮助生物更容易摆脱卡住状态
            // 第三阶段禁止旋转
            // if (Math.random() < 0.5) { // 50%概率尝试改变方向
            //   this.direction += (Math.random() - 0.5) * Math.PI * 1.5; // 增加转向角度范围
            // }
          }
        
        // 初始化分裂准备状态属性（如果不存在）
        if (this.isPreparingSplit === undefined) {
          this.isPreparingSplit = false;
          this.splitPreparationTime = undefined;
        }
        
        // 分裂准备阶段：原地旋转
        if (this.isPreparingSplit) {
          const now = Date.now();
          const preparationDuration = 800; // 准备时间0.8秒，确保总分裂时间不超过1秒
          
          // 第三阶段禁止旋转，保留分裂功能但不旋转
          // this.direction += 0.003; // 禁止旋转
          
          // 暂停移动
          this.speed = 0;
          
          // 准备时间结束，进行分裂
          if (this.splitPreparationTime !== undefined && now - this.splitPreparationTime >= preparationDuration) {
            // 设置随机大小范围，让分裂后的生物大小有变化
            const minSize = 3;
            const maxSize = 6;
            const newOrganism = {
              id: ecosystemManager.idCounter.current++,
              x: this.x + (Math.random() - 0.5) * 20,
              y: this.y + (Math.random() - 0.5) * 20,
              size: minSize + Math.random() * (maxSize - minSize),
              speed: ecosystemManager.config.speed * (0.3 + Math.random() * 0.2), // 降低移速
              isPreparingSplit: false,
              splitPreparationTime: undefined,
              direction: Math.random() * Math.PI * 2,
              color: this.color,
              hunger: 100,
              type: this.type,
              age: 0,
              canEvolve: false,
              isBreeding: false,
              breedingPartnerId: undefined,
              breedingTime: undefined,
              breedingProgress: 0,
              isDetectingFood: this.isDetectingFood,
              foodDetectionTime: undefined,
              detectedFoodDistance: undefined,
              lastSplitAge: 0,
              hasSplitOnce: false,
              currentTerrainType: ecosystemManager.getTerrainAt(this.x, this.y),
              adjustedSpeed: this.adjustedSpeed,
              hungerRateMultiplier: this.hungerRateMultiplier,
              calculateDistance: this.calculateDistance,
              findNearestFood: this.findNearestFood,
              eat: this.eat,
              evolve: this.evolve,
              update: this.update,
              canMoveOnTerrain: this.canMoveOnTerrain
            };
            
            // 使用临时数组存储新细胞，避免在遍历过程中修改数组
            if (!ecosystemManager.newOffspring) {
              ecosystemManager.newOffspring = [];
            }
            
            // 只添加一个新细胞，实现一分为二
            ecosystemManager.newOffspring.push(newOrganism);
            
            // 减少分裂后的能量消耗
            this.hunger -= 30; // 从50减少到30，使母体更容易存活
            this.lastSplitAge = this.age;
            // 使用类型断言确保TypeScript允许设置hasSplitOnce属性
            (this as any).hasSplitOnce = true; // 标记已完成至少一次分裂
            
            // 分裂完成，重置母体状态
            this.isPreparingSplit = false;
            this.splitPreparationTime = undefined;
            this.speed = ecosystemManager.config.speed * (0.3 + Math.random() * 0.2); // 降低移速
          }
        }
        
        // 检查是否需要开始分裂准备
        const minSplitAge = 3000; // 大幅提高最小分裂年龄，拉长分裂间隔时间
        // 根据生物类型调整分裂条件
        const hungerThreshold = this.type === 'cyanobacteria' ? 90 : 100; // 提高分裂所需饥饿阈值，适应更高的饥饿上限
        if (this.age > minSplitAge && !this.isPreparingSplit && this.hunger > hungerThreshold) {
          // 增加分裂概率，特别是对蓝藻
          const splitChance = this.type === 'cyanobacteria' ? 0.005 : 0.003;
          if (Math.random() < splitChance) {
            this.isPreparingSplit = true;
            this.splitPreparationTime = Date.now();
          }
        }
        
        // 更新当前地形类型
        this.currentTerrainType = ecosystemManager.getTerrainAt(this.x, this.y);
        
        // 检查是否可以在当前地形移动
        if (!this.canMoveOnTerrain(this.currentTerrainType, ecosystemManager)) {
          // 第三阶段禁止旋转，不改变方向，只返回
          // this.direction += Math.PI / 2; // 禁止旋转
          return;
        }
        
        // 应用地形效果
        const terrainEffect = ecosystemManager.getTerrainEffect(this.currentTerrainType);
        if (terrainEffect) {
          this.adjustedSpeed = this.speed * terrainEffect.speedMultiplier;
          this.hungerRateMultiplier = terrainEffect.hungerRateMultiplier;
        } else {
          this.adjustedSpeed = this.speed;
          this.hungerRateMultiplier = 1.0;
        }
        
        // 根据生物类型应用不同的饥饿消耗和恢复机制
        if (this.type === 'amoeba' || this.type === 'water_mold') {
          // 超大幅度降低基础饥饿消耗
          this.hunger -= 0.005 * this.hungerRateMultiplier; // 超大幅降低饥饿消耗
          
          // 饥饿值为0或达到年龄上限时死亡
          if (this.hunger <= 0 || this.age > 50000) { // 超大幅提高年龄上限到50000
            // 提高生成有机碎屑的概率，确保生态系统中有足够食物
            if (Math.random() < 0.8) { // 80%概率
              ecosystemManager.createOrganicDebris(this.x, this.y, this.type);
            }
            // 从生态系统中移除
            const index = ecosystemManager.organisms.findIndex((o: Organism) => o.id === this.id);
            if (index !== -1) {
              ecosystemManager.organisms.splice(index, 1);
            }
            return;
          }
          
          // 为不同生物类型添加地形适应优势
          if (this.currentTerrainType === 'beach' && this.type === 'amoeba') {
            this.hunger = Math.min(150, this.hunger + 0.01); // 变形虫在沙滩上缓慢恢复能量
          } else if (this.currentTerrainType === 'plains' && this.type === 'water_mold') {
            this.hunger = Math.min(150, this.hunger + 0.01); // 水霉菌在平原上缓慢恢复能量
          }
          
          // 寻找食物 - 变形虫主动搜寻海藻和有机碎屑，水霉菌主动检索有机碎屑
          const nearestFood = this.findNearestFood(foods);
          if (nearestFood) {
            // 更新检测到的食物距离，用于显示绿色光圈
            // @ts-ignore - 暂时忽略类型检查，后续会在类型定义中添加该属性
            this.detectedFoodDistance = this.calculateDistance(nearestFood.x, nearestFood.y);
            // @ts-ignore - 暂时忽略类型检查，后续会在类型定义中添加该属性
            this.foodDetectionTime = Date.now(); // 记录检测时间
            
            // 向食物移动 - 优化追踪逻辑
            const dx = nearestFood.x - this.x;
            const dy = nearestFood.y - this.y;
            const angle = Math.atan2(dy, dx);
            
            // 第三阶段禁止旋转，保留向食物移动但不改变方向
            // const angleDiff = (angle - this.direction + Math.PI * 2) % (Math.PI * 2);
            // const turnAmount = Math.min(0.1, Math.abs(angleDiff)) * Math.sign(angleDiff);
            // this.direction = (this.direction + turnAmount + Math.PI * 2) % (Math.PI * 2); // 禁止旋转
            
            // 接近食物时增加速度
            const foodDistance = Math.sqrt(dx * dx + dy * dy);
            if (foodDistance < 50) {
              this.adjustedSpeed = this.speed * (1 + (50 - foodDistance) / 100); // 距离越近速度越快
            }
            
            // 尝试进食
            const distance = this.detectedFoodDistance;
            if (distance !== undefined && distance < this.size + (nearestFood.size || 5)) {
              const foodEaten = this.eat(nearestFood);
              if (foodEaten) {
                // 移除食物
                const foodIndex = foods.findIndex(f => f.id === nearestFood.id);
                if (foodIndex !== -1) {
                  foods.splice(foodIndex, 1);
                }
                // 重置检测距离，光圈消失
                this.detectedFoodDistance = undefined;
              }
            }
          } else {
            // 第三阶段禁止旋转，保留随机移动但不改变方向
            this.detectedFoodDistance = undefined;
            // if (Math.random() < 0.01) {
            //   this.direction += (Math.random() - 0.5) * 0.5; // 禁止旋转
            // }
          }
        } else if (this.type === 'cyanobacteria') {
          // 蓝藻特殊处理：通过光合作用恢复能量
          this.hunger = Math.min(300, this.hunger + 0.06); // 蓝藻自养增强，超大幅提高饥饿上限
          
          // 只有当饥饿值非常低时才会死亡
          if (this.hunger <= 0 || this.age > 60000) { // 超大幅提高年龄上限
            if (Math.random() < 0.7) {
              ecosystemManager.createOrganicDebris(this.x, this.y, this.type);
            }
            const index = ecosystemManager.organisms.findIndex((o: Organism) => o.id === this.id);
            if (index !== -1) {
              ecosystemManager.organisms.splice(index, 1);
            }
            return;
          }
          
          // 寻找食物
          const nearestFood = this.findNearestFood(foods);
          if (nearestFood) {
            // 向食物移动
            const dx = nearestFood.x - this.x;
            const dy = nearestFood.y - this.y;
            const angle = Math.atan2(dy, dx);
            // 第三阶段禁止旋转，保留向食物移动但不改变方向
            // this.direction = angle; // 禁止旋转
            
            // 尝试进食
            const distance = this.calculateDistance(nearestFood.x, nearestFood.y);
            if (distance !== undefined && distance < this.size + (nearestFood.size || 5)) {
              const foodEaten = this.eat(nearestFood);
              if (foodEaten) {
                // 移除食物
                const foodIndex = foods.findIndex(f => f.id === nearestFood.id);
                if (foodIndex !== -1) {
                  foods.splice(foodIndex, 1);
                }
              }
            }
          } else {
            // 检测附近是否有变形虫，如果有则躲避
            const nearbyAmoebas = ecosystemManager.organisms.filter((o: Organism) => 
              o.type === 'amoeba' && this.calculateDistance(o.x, o.y) < 80
            );
            
            if (nearbyAmoebas.length > 0) {
              // 找到最近的变形虫
              let nearestAmoeba = nearbyAmoebas[0];
              let minDistance = this.calculateDistance(nearestAmoeba.x, nearestAmoeba.y);
              
              for (const amoeba of nearbyAmoebas) {
                const dist = this.calculateDistance(amoeba.x, amoeba.y);
                if (dist < minDistance) {
                  minDistance = dist;
                  nearestAmoeba = amoeba;
                }
              }
              
              // 向远离变形虫的方向移动
              const dx = this.x - nearestAmoeba.x;
              const dy = this.y - nearestAmoeba.y;
              const angle = Math.atan2(dy, dx);
              
              // 平滑调整方向
              // 第三阶段禁止旋转，保留远离捕食者的逻辑但不改变方向
              // const angleDiff = (angle - this.direction + Math.PI * 2) % (Math.PI * 2);
              // const turnAmount = Math.min(0.2, Math.abs(angleDiff)) * Math.sign(angleDiff);
              // this.direction = (this.direction + turnAmount + Math.PI * 2) % (Math.PI * 2); // 禁止旋转
              
              // 遇到捕食者时加快速度
              this.adjustedSpeed = this.speed * 1.5;
            } else {
              // 没有捕食者时随机移动
              // 第三阶段禁止旋转
              // if (Math.random() < 0.01) {
              //   this.direction += (Math.random() - 0.5) * 0.5;
              // }
            }
          }
        }
        
        // 移除地形限制：所有生物都视为在适宜地形上
        // 不再根据地形应用饥饿惩罚或强制移动
        this.isInSuitableTerrain = true;
        this.timeInUnsuitableTerrain = 0;
        this.lastSuitableTerrainPosition = {x: this.x, y: this.y};
        
        // 移动生物
        this.x += Math.cos(this.direction) * this.adjustedSpeed;
        this.y += Math.sin(this.direction) * this.adjustedSpeed;
        
        // 边界检查
        if (this.x < 0) this.x = 0;
        if (this.x > ecosystemManager.canvasWidth) this.x = ecosystemManager.canvasWidth;
        if (this.y < 0) this.y = 0;
        if (this.y > ecosystemManager.canvasHeight) this.y = ecosystemManager.canvasHeight;
      },
      canMoveOnTerrain: function(terrainType: TerrainType, ecosystemManager: any): boolean {
        // 所有生物都可以在任何地形上活动
        return true;
      }
    };
  }
  
  // 检查位置是否在浅水区（海洋和沙滩交接处两个格子范围）
  private isShallowWater(x: number, y: number): boolean {
    const gridX = Math.floor(x / this.terrainGridSize);
    const gridY = Math.floor(y / this.terrainGridSize);
    
    // 检查周围2x2范围内是否有沙滩
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const neighborGridX = gridX + dx;
        const neighborGridY = gridY + dy;
        
        if (neighborGridX >= 0 && neighborGridX < this.terrainGrid.length && 
            neighborGridY >= 0 && neighborGridY < this.terrainGrid[0].length) {
          if (this.terrainGrid[neighborGridX][neighborGridY].type === 'beach') {
            return true;
          }
        }
      }
    }
    
    return false;
  }
  
  // 检查位置是否在潮湿区（沙滩和平原交接处两个格子范围）
  private isMoistArea(x: number, y: number): boolean {
    const gridX = Math.floor(x / this.terrainGridSize);
    const gridY = Math.floor(y / this.terrainGridSize);
    
    // 检查周围2x2范围内是否有沙滩或平原
    let hasBeach = false;
    let hasPlains = false;
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const neighborGridX = gridX + dx;
        const neighborGridY = gridY + dy;
        
        if (neighborGridX >= 0 && neighborGridX < this.terrainGrid.length && 
            neighborGridY >= 0 && neighborGridY < this.terrainGrid[0].length) {
          const terrainType = this.terrainGrid[neighborGridX][neighborGridY];
          if (terrainType.type === 'beach') hasBeach = true;
          if (terrainType.type === 'plains') hasPlains = true;
        }
      }
    }
    
    // 如果同时有沙滩和平原，则为潮湿区
    return hasBeach && hasPlains;
  }
  
  // 创建有机碎屑
  private createOrganicDebris(x: number, y: number, fromOrganismType: OrganismType) {
    const debris = {
      id: this.foodIdCounter.current++,
      x: x,
      y: y,
      size: 5,
      type: 'organic_debris',
      isPrimordialSoup: false,
      isOrganicDebris: true,
      fromOrganismType: fromOrganismType,
      age: 0,
      // 移除衰变相关属性，让有机碎屑不会自然消失
      createdAt: Date.now()
    };
    
    this.foods.push(debris);
  }
  
  // 获取配置（用于UI更新）
  public getConfig(): SandboxConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<SandboxConfig>) {
    // 创建默认配置对象，包含所有必需字段
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
      terrainGridSize: 20,
      
      // 必需的阶段配置
      currentStage: 'primordial_soup' as EcosystemStage,
      primordialSoupCount: 0,
      primordialSoupThreshold: 100,
      prokaryoticCount: 0,
      prokaryoticThreshold: 30,
      canAdvanceStage: true
    };
    
    // 合并默认配置、现有配置和新配置，确保所有必需字段都存在
    this.config = {
      ...defaultConfig,
      ...this.config,
      ...newConfig
    };

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
        // 当前阶段只生成蓝藻和原始真核细胞
        const organismType = Math.random() > 0.5 ? 'cyanobacteria' : 'primitive_eukaryote';
        organism = createOrganism(organismType, this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
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
      this.spatialPartition.addObject(organism); // 添加到空间分区
    }
  }

  // 批量初始化食物
  initFoods(count: number) {
    // 在第一阶段（原始汤）和第二阶段（原核+原始真核）不初始化食物
    if (this.config.currentStage === 'primordial_soup' || this.config.currentStage === 'prokaryotic_eukaryotic') {
      this.foods = [];
      return;
    }
    
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
          food.isPrimordialSoup = false; // 确保不设置为原始汤
          break;
        }
      } while (attempts < maxAttempts);
      
      this.foods.push(food);
      this.spatialPartition.addObject(food); // 添加到空间分区
    }
  }

  /**
   * 重置整个沙盒
   */
  resetSandbox() {
    // 重置计数器
    this.idCounter.current = 0;
    this.foodIdCounter.current = 0;
    
    // 清空所有生物和食物
    this.organisms = [];
    this.foods = [];
    
    // 清空空间分区
    this.spatialPartition.clear();
    
    // 重新生成地形（如果启用）
    if (this.hasTerrain) {
      this.generateTerrain(this.terrainGridSize);
    }
    
    // 重新初始化生物和食物
    this.initOrganisms(this.config.organismCount);
    this.initFoods(this.config.foodCount);
  }

  // 添加单个生物
  addOrganism(organismObj?: any) {
    // 如果传入了生物对象，直接添加
    if (organismObj) {
      this.organisms.push(organismObj);
      this.spatialPartition.addObject(organismObj);
      return;
    }
    
    // 否则创建新生物，只生成蓝藻和原始真核细胞
    let organism;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
      // 当前阶段只生成蓝藻和原始真核细胞
      const organismType = Math.random() > 0.5 ? 'cyanobacteria' : 'primitive_eukaryote';
      organism = createOrganism(organismType, this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
      const terrainType = this.getTerrainAt(organism.x, organism.y);
      const terrainEffect = this.getTerrainEffect(terrainType);
      attempts++;
      
      if (terrainEffect.canSpawnOrganism) {
        organism.currentTerrainType = terrainType;
        break;
      }
    } while (attempts < maxAttempts);
    
    this.organisms.push(organism);
    this.spatialPartition.addObject(organism); // 添加到空间分区
  }

  // 清空所有生物和原始汤
  clearAllOrganisms() {
    this.organisms = [];
    
    // 第一阶段（原始汤时代）：清空所有原始汤
    if (this.config.currentStage === 'primordial_soup') {
      // 清空所有原始汤
      this.foods = [];
      // 重置原始汤计数
      this.config.primordialSoupCount = 0;
      // 重置进阶状态
      this.config.canAdvanceStage = false;
      // 重新生成全海洋地形
      if (this.hasTerrain) {
        this.generateTerrain(this.terrainGridSize);
      }
      console.log('第一阶段：已清空所有原始汤');
    }
    // 第二阶段（原核+原始真核时代）：清空所有生物
    else if (this.config.currentStage === 'prokaryotic_eukaryotic') {
      // 清空所有生物
      this.organisms = [];
      console.log('第二阶段：已清空所有生物');
    }
    // 清空空间分区
    this.spatialPartition.clear();
  }

  // 重置食物
  resetFoods() {
    // 在第一阶段和第二阶段不重置食物
    if (this.config.currentStage === 'primordial_soup' || this.config.currentStage === 'prokaryotic_eukaryotic') {
      this.foods = [];
      return;
    }
    this.initFoods(this.config.foodCount);
  }

  // 处理一次生态系统更新
  update() {
    if (!this.config.isRunning) return;
    
    // 记录更新前的生物数量
    const beforeCount = this.organisms.length;

    // 更新雷暴（在所有阶段都可以调用，但会在方法内部检查阶段）
    this.updateThunderstorms();
    
    // 检查是否可以进阶阶段（在第二阶段时更新进度）
    if (this.config.currentStage === 'prokaryotic_eukaryotic') {
      this.updateProkaryoticProgress();
    }

    // 原始汤时代特殊处理
    if (this.config.currentStage === 'primordial_soup') {
      // 只保留原始汤，清除其他食物
      this.foods = this.foods.filter(food => food.isPrimordialSoup);
      
      // 调试信息：显示原始汤数量和是否可以进阶
      if (Math.random() < 0.1) { // 每10帧左右显示一次，避免日志过多
        console.log(`原始汤数量: ${this.config.primordialSoupCount}, 是否可以进阶: ${this.config.canAdvanceStage}`);
      }
      
      // 清除所有生物
      this.organisms = [];
      
      return; // 跳过其他更新逻辑
    }
    
    // 第三阶段（真核生物分化时代）特殊处理
    if (this.config.currentStage === 'evolution') {
      // 只保留有机碎屑食物
      this.foods = this.foods.filter(food => food.isOrganicDebris);
      
      // 更新有机碎屑（使其随时间衰变）
      this.updateOrganicDebris();
    }

    // 非原始汤时代的正常更新逻辑
    if (this.organisms.length === 0) return;

    // 在第二阶段（原核+原始真核）不显示任何食物，但允许生物正常更新和移动
    if (this.config.currentStage === 'prokaryotic_eukaryotic') {
      this.foods = [];
      
      // 清空并重新构建空间分区（只添加生物）
      this.spatialPartition.clear();
      for (const organism of this.organisms) {
        this.spatialPartition.addObject(organism);
      }
      
      // 继续执行更新逻辑，但跳过食物相关处理
    } else {
      // 第三阶段和其他阶段：保留有机碎屑食物，清除原始汤
      this.foods = this.foods.filter(food => !food.isPrimordialSoup);
      
      // 清空并重新构建空间分区
      this.spatialPartition.clear();
      for (const organism of this.organisms) {
        this.spatialPartition.addObject(organism);
      }
      for (const food of this.foods) {
        this.spatialPartition.addObject(food);
      }
    }

    // 合并多次遍历为一次，提高性能
    const newOrganisms: Organism[] = [];
    const foodIndicesToRemove = new Set<number>();
    const now = Date.now();
    const hasTerrain = this.config.hasTerrain !== false;

    // 单次遍历完成更新、吃食物和死亡检查
    for (let i = 0; i < this.organisms.length; i++) {
      const organism = this.organisms[i];

      // 更新生物状态，传入地形信息并接收可能的子细胞
      const offspring = organism.update(this.foods, this);
      
      // 如果有分裂产生的子细胞，添加到新列表中
      if (Array.isArray(offspring) && offspring.length > 0) {
        newOrganisms.push(...offspring);
      }
      
      // 如果生物被标记为toBeRemoved（例如分裂后的母细胞或死亡），跳过添加到新列表
      if (organism.toBeRemoved) {
        // 在所有阶段，生物死亡时都应该生成有机碎屑
        // 排除分裂后的母细胞（可以通过额外标记区分，这里暂时保持70%概率）
        if (Math.random() < 0.7) { // 70%概率生成有机碎屑
          this.createOrganicDebris(organism.x, organism.y, organism.type);
          console.log(`${organism.type}死亡，生成有机碎屑`);
        }
        continue;
      }
      
      // 将未标记为toBeRemoved的生物添加到新列表
      newOrganisms.push(organism);
      
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
        organism.hungerRateMultiplier = terrainEffect.hungerRateMultiplier;
          
        // 在第三阶段，检查生物是否在有效的地形上
        if (this.config.currentStage === 'evolution') {
          let isInValidTerrain = false;
          
          // 根据生物类型判断地形有效性
          switch (organism.type) {
            case 'cyanobacteria':
              // 蓝藻不能在沙滩和平原活动，只能在海洋活动
              isInValidTerrain = terrainType !== 'ocean'; // 非海洋地形是无效的
              break;
            case 'amoeba':
              // 变形虫可以在海洋、沙滩、平原活动
              isInValidTerrain = false; // 所有地形都有效
              break;
            case 'water_mold':
              // 水霉菌不能在海洋里活动
              isInValidTerrain = terrainType === 'ocean'; // 海洋地形是无效的
              break;
          }
          
          // 如果在非活动区，标记为移除并创建有机碎屑
          if (isInValidTerrain) {
            organism.toBeRemoved = true;
            this.createOrganicDebris(organism.x, organism.y, organism.type);
            console.log(`移除位于非活动区（${terrainType}）的生物: ID=${organism.id}, 类型=${organism.type}`);
          }
        }
      } else {
        organism.adjustedSpeed = organism.speed;
        organism.hungerRateMultiplier = 1.0;
      }

      // 处理吃食物 - 使用空间分区优化
      const nearbyFoods = this.spatialPartition.getFoodsInRadius(organism.x, organism.y, organism.size * 2);
      
      for (let j = 0; j < nearbyFoods.length; j++) {
        const food = nearbyFoods[j];
        const foodIndex = this.foods.findIndex(f => f.id === food.id);
        
        if (foodIndicesToRemove.has(foodIndex)) continue;

        const dx = organism.x - food.x;
        const dy = organism.y - food.y;
        const distanceSquared = dx * dx + dy * dy;
        const eatRadiusSquared = Math.pow(organism.size * 1.2, 2);

        if (distanceSquared <= eatRadiusSquared) {
          // 吃到食物
          foodIndicesToRemove.add(foodIndex);
          organism.hunger = Math.min(100, organism.hunger + 20);

          // 清道夫效率加成
          if (organism.type === 'scavenger') {
            organism.hunger = Math.min(100, organism.hunger + 10);
          }
          break; // 只吃一个食物
        }
      }

      // 检查死亡 - 只有完成过至少一次分裂后才会因饥饿死亡
      if (organism.hunger <= 0 && (organism.hasSplitOnce || organism.hasSplitOnce === undefined)) {
        // 死亡后直接消失，不生成食物
        organism.toBeRemoved = true;
        continue;
      }

      // 只在非第二阶段和非第三阶段执行有性生殖逻辑
      // 第三阶段生物也使用分裂繁殖而非有性生殖
      if (this.config.currentStage !== 'prokaryotic_eukaryotic' && this.config.currentStage !== 'evolution') {
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
              // 禁止繁殖：注释掉后代生成和添加的代码
              // let offspring;
              // let attempts = 0;
              // const maxAttempts = 10;
              // 
              // do {
              //   offspring = createOrganism(organism.type, this.config, this.canvasWidth, this.canvasHeight, this.idCounter);
              //   // 计算父母中间位置
              //   const centerX = (organism.x + partner.x) / 2;
              //   const centerY = (organism.y + partner.y) / 2;
              //   // 在父母旁边随机位置生成（±20像素范围内）
              //   const offsetAngle = Math.random() * Math.PI * 2;
              //   const offsetDistance = (organism.size + partner.size) * 0.5 + Math.random() * 10;
              //   offspring.x = centerX + Math.cos(offsetAngle) * offsetDistance;
              //   offspring.y = centerY + Math.sin(offsetAngle) * offsetDistance;
              //   
              //   // 确保后代在可生存的地形
              //   if (hasTerrain) {
              //     const terrainType = this.getTerrainAt(offspring.x, offspring.y);
              //     const terrainEffect = this.getTerrainEffect(terrainType);
              //     attempts++;
              //     
              //     if (terrainEffect.canSpawnOrganism) {
              //       offspring.currentTerrainType = terrainType;
              //       break;
              //     }
              //   }
              // } while (hasTerrain && attempts < maxAttempts);
              // 
              // // 继承特性
              // const avgSize = (organism.size + partner.size) / 2;
              // offspring.size = avgSize * (0.8 + Math.random() * 0.4);
              // offspring.hunger = 60;
              // newOrganisms.push(offspring);

              // 禁止繁殖后不再消耗能量
              // organism.hunger = Math.max(30, organism.hunger - 30);
              // partner.hunger = Math.max(30, partner.hunger - 30);

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
            // 获取地形繁殖概率倍数
            let breedingChanceMultiplier = 1;
            if (organism.currentTerrainType) {
              const terrainEffect = this.getTerrainEffect(organism.currentTerrainType);
              if (terrainEffect.breedingChanceMultiplier) {
                breedingChanceMultiplier = terrainEffect.breedingChanceMultiplier;
              }
            }
            
            // 应用地形影响的繁殖概率
            const baseBreedingChance = 0.002; // 大幅降低繁殖概率
            if (Math.random() < baseBreedingChance * breedingChanceMultiplier) { // 降低触发概率
              organism.isBreeding = true;
              organism.breedingTime = now;
              organism.breedingProgress = 0;
              organism.speed = this.config.speed * 0.3; // 设置为正常速度的30%，而不是完全停止
            }
          }

          // 检查繁殖进度和伙伴匹配
          if (organism.isBreeding && !organism.breedingPartnerId) {
            // 寻找同样处于繁殖状态且靠近的伙伴 - 使用空间分区优化
            const nearbyOrganisms = this.spatialPartition.getOrganismsInRadius(organism.x, organism.y, 40);
            const potentialPartners = nearbyOrganisms.filter(
              (other) =>
                other.id !== organism.id &&
                other.isBreeding &&
                !other.breedingPartnerId && // 还没有找到伙伴
                other.type === organism.type
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
      } else {
        // 第二阶段：强制禁用所有繁殖状态
        organism.isBreeding = false;
        organism.breedingPartnerId = undefined;
        organism.breedingTime = undefined;
        organism.breedingProgress = 0;
      }

      // 处理进化 - 每帧只让少数生物尝试进化
      // 禁止进化生成新生物
      if (organism.canEvolve && Math.random() < 0.005 && !organism.isBreeding) {
        // 不执行进化，或者只执行进化但不创建新生物
        // const evolved = organism.evolve();
        // if (evolved) {
        //   // 设置进化后生物的地形类型
        //   if (hasTerrain) {
        //     evolved.currentTerrainType = this.getTerrainAt(evolved.x, evolved.y);
        //   }
        //   newOrganisms.push(evolved);
        //   // 移除原生物，避免重复添加
        //   continue;
        // }
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

      // 生物是否添加到新列表的逻辑已在主循环开始处处理
      // 这里不再需要额外的添加逻辑
    }

    // 删除被吃掉的食物
    const remainingFoods: Food[] = [];
    for (let j = 0; j < this.foods.length; j++) {
      if (!foodIndicesToRemove.has(j)) {
        remainingFoods.push(this.foods[j]);
      }
    }
    this.foods = remainingFoods;

    // 细胞数量更新完成
    
    // 保留toBeRemoved标记，确保死亡的生物能够被正确移除
    // 注意：只有未被标记为toBeRemoved的生物才会被添加到newOrganisms列表中
    
    // 添加分裂产生的新细胞到newOrganisms数组
    if (this.newOffspring && this.newOffspring.length > 0) {
      newOrganisms.push(...this.newOffspring);
      this.newOffspring = null; // 重置newOffspring数组
    }

    // 用构建好的新列表直接覆盖旧列表
    this.organisms = newOrganisms;

    // 批量补充食物（仅在非第一、二阶段）
    if (this.config.currentStage === 'prokaryotic_eukaryotic' || 
        this.config.currentStage === 'evolution' || 
        this.config.currentStage === 'advanced') {
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
        // 注意：新生成的食物将在下一帧的update方法中被添加到空间分区
      }
    }
  }

  // 计算FPS和性能统计
  calculateStats(currentFps: number, currentFrameTime: number): { fps: number; frameTime: number; organismTypes: { [key: string]: number }; terrainDistribution?: { [key: string]: number } } {
    const organismTypes: { [key: string]: number } = { 
      basic: 0, 
      predator: 0, 
      scavenger: 0, 
      cyanobacteria: 0, 
      primitive_eukaryote: 0,
      amoeba: 0,
      water_mold: 0
    };
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