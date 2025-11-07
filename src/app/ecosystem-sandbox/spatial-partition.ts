import { Organism, Food } from './types';

/**
 * 空间分区系统 - 使用网格划分优化碰撞检测
 * 将地图划分为固定大小的网格单元，每个对象存储在对应的网格中
 * 大幅减少碰撞检测时需要检查的对象数量
 */
export class SpatialPartition {
  private grid: Map<string, (Organism | Food)[]>;
  private cellSize: number;
  private width: number;
  private height: number;
  private cols: number;
  private rows: number;

  constructor(width: number, height: number, cellSize: number = 50) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Map();
    this.initializeGrid();
  }

  /**
   * 初始化网格数据结构
   */
  private initializeGrid(): void {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.grid.set(`${x},${y}`, []);
      }
    }
  }

  /**
   * 获取指定位置的网格坐标
   */
  private getGridPosition(x: number, y: number): { x: number; y: number } {
    // 确保坐标在有效范围内
    const gridX = Math.max(0, Math.min(this.cols - 1, Math.floor(x / this.cellSize)));
    const gridY = Math.max(0, Math.min(this.rows - 1, Math.floor(y / this.cellSize)));
    return { x: gridX, y: gridY };
  }

  /**
   * 获取网格键
   */
  private getGridKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  /**
   * 清空所有网格
   */
  clear(): void {
    this.grid.forEach((cell) => {
      cell.length = 0;
    });
  }

  /**
   * 添加对象到网格
   */
  addObject(obj: Organism | Food): void {
    const { x, y } = this.getGridPosition(obj.x, obj.y);
    const key = this.getGridKey(x, y);
    const cell = this.grid.get(key);
    if (cell) {
      cell.push(obj);
    }
  }

  /**
   * 从网格中移除对象
   * 注意：这个方法依赖于对象具有唯一ID属性
   */
  removeObject(obj: Organism | Food): void {
    // 先获取对象可能存在的网格位置
    const { x, y } = this.getGridPosition(obj.x, obj.y);
    const key = this.getGridKey(x, y);
    const cell = this.grid.get(key);
    
    if (cell) {
      const index = cell.findIndex((item) => item.id === obj.id);
      if (index !== -1) {
        cell.splice(index, 1);
      }
    }
  }

  /**
   * 更新对象在网格中的位置
   * 当对象移动时调用此方法
   */
  updateObjectPosition(obj: Organism | Food, oldX: number, oldY: number): void {
    // 从旧位置移除
    const oldGridPos = this.getGridPosition(oldX, oldY);
    const oldKey = this.getGridKey(oldGridPos.x, oldGridPos.y);
    const oldCell = this.grid.get(oldKey);
    
    if (oldCell) {
      const index = oldCell.findIndex((item) => item.id === obj.id);
      if (index !== -1) {
        oldCell.splice(index, 1);
      }
    }
    
    // 添加到新位置
    this.addObject(obj);
  }

  /**
   * 获取指定位置周围的所有对象
   * @param x 中心点x坐标
   * @param y 中心点y坐标
   * @param radius 搜索半径
   */
  getObjectsInRadius(x: number, y: number, radius: number): (Organism | Food)[] {
    // 计算需要检查的网格范围
    const minGridX = Math.max(0, Math.floor((x - radius) / this.cellSize));
    const maxGridX = Math.min(this.cols - 1, Math.floor((x + radius) / this.cellSize));
    const minGridY = Math.max(0, Math.floor((y - radius) / this.cellSize));
    const maxGridY = Math.min(this.rows - 1, Math.floor((y + radius) / this.cellSize));
    
    const result: (Organism | Food)[] = [];
    const radiusSquared = radius * radius;
    
    // 检查范围内的所有网格
    for (let gridY = minGridY; gridY <= maxGridY; gridY++) {
      for (let gridX = minGridX; gridX <= maxGridX; gridX++) {
        const key = this.getGridKey(gridX, gridY);
        const cell = this.grid.get(key);
        
        if (cell) {
          // 过滤出真正在半径内的对象
          for (const obj of cell) {
            const dx = obj.x - x;
            const dy = obj.y - y;
            const distanceSquared = dx * dx + dy * dy;
            
            if (distanceSquared <= radiusSquared) {
              result.push(obj);
            }
          }
        }
      }
    }
    
    return result;
  }

  /**
   * 获取指定位置周围的所有生物
   */
  getOrganismsInRadius(x: number, y: number, radius: number): Organism[] {
    return this.getObjectsInRadius(x, y, radius).filter(
      (obj): obj is Organism => 'type' in obj && 'hunger' in obj
    );
  }

  /**
   * 获取指定位置周围的所有食物
   */
  getFoodsInRadius(x: number, y: number, radius: number): Food[] {
    return this.getObjectsInRadius(x, y, radius).filter(
      (obj): obj is Food => !('type' in obj) && !('hunger' in obj)
    );
  }

  /**
   * 获取所有对象（用于调试）
   */
  getAllObjects(): (Organism | Food)[] {
    const allObjects: (Organism | Food)[] = [];
    this.grid.forEach((cell) => {
      allObjects.push(...cell);
    });
    return allObjects;
  }

  /**
   * 获取网格统计信息（用于调试）
   */
  getStats(): { cells: number; averageObjectsPerCell: number; emptyCells: number } {
    let totalObjects = 0;
    let emptyCells = 0;
    let cellCount = 0;
    
    this.grid.forEach((cell) => {
      cellCount++;
      totalObjects += cell.length;
      if (cell.length === 0) {
        emptyCells++;
      }
    });
    
    return {
      cells: cellCount,
      averageObjectsPerCell: totalObjects / cellCount,
      emptyCells
    };
  }
}