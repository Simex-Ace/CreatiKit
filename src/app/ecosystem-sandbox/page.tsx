'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// 导入类型和工具
import { SandboxConfig, Stats, TerrainDistribution } from './types';
import { EcosystemRenderer } from './renderer';
import { EcosystemManager } from './ecosystem-manager';
import { RuleDescription } from './RuleDescription';

// 主组件

const EcosystemSandbox = () => {
  // Canvas相关引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const idCounterRef = useRef(0);
  const foodIdCounterRef = useRef(0);
  
  // 管理器和渲染器引用
  const ecosystemManagerRef = useRef<EcosystemManager | null>(null);
  const rendererRef = useRef<EcosystemRenderer | null>(null);
  
  // 性能统计相关引用
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const lastFpsUpdateRef = useRef(performance.now());
  const lastFps = useRef(0);
  
  // 状态管理
  const [config, setConfig] = useState<SandboxConfig>({
    width: 800,
    height: 600,
    organismCount: 10,
    foodCount: 30,
    speed: 0.5, // 初始速度设为较低值
    isRunning: true,
    maxOrganisms: 100,
    maxFood: 100,
    foodSpawnRate: 0.02,
    foodSpawnThreshold: 20,
    evolutionThreshold: 100,
    breedingThreshold: 80,
    hasTerrain: true, // 明确启用地形
    terrainGridSize: 20
  });
  
  const [stats, setStats] = useState<Stats>({ 
    fps: 0, 
    frameTime: 0,
    organismTypes: { basic: 0, predator: 0, scavenger: 0 }
  });
  
  // 组件加载标志
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 渲染函数 - 高性能Canvas绘制
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current || !ecosystemManagerRef.current) return;

    // 计算帧率和帧时间 - 更精确的性能监控
    const now = performance.now();
    const deltaTime = now - lastFrameTimeRef.current;
    lastFrameTimeRef.current = now;
    
    frameCountRef.current++;
    if (!lastFpsUpdateRef.current) lastFpsUpdateRef.current = now;
    if (now - lastFpsUpdateRef.current > 1000) { // 每1秒更新一次FPS
      // 精确计算FPS值
      const newFps = Math.round(frameCountRef.current * 1000 / (now - lastFpsUpdateRef.current));
      
      // 有显著变化时才更新状态
      if (Math.abs(lastFps.current - newFps) > 2 || 
          Math.abs(lastFrameTimeRef.current - deltaTime) > 5) {
        
        lastFps.current = newFps;
            
        // 获取统计数据
        const statsData = ecosystemManagerRef.current?.calculateStats(newFps, deltaTime);
        
        setStats({
          fps: newFps,
          frameTime: deltaTime,
          organismTypes: statsData?.organismTypes || { basic: 0, predator: 0, scavenger: 0 },
          terrainDistribution: (statsData?.terrainDistribution as unknown as TerrainDistribution) || { ocean: 0, beach: 0, forest: 0, mountain: 0, plains: 0 }
        });
      }
      
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    // 更新生态系统状态（仅在运行时）
    if (config.isRunning) {
      ecosystemManagerRef.current.update();
    }
    
    // 获取当前生态系统状态
    const { organisms, foods } = ecosystemManagerRef.current.getState();
    
    // 清空画布
    rendererRef.current.clear();
    
    // 绘制地形（如果启用）
    if (ecosystemManagerRef.current?.getHasTerrain() !== false) {
      const terrainGrid = ecosystemManagerRef.current.getTerrainGrid();
      if (terrainGrid && terrainGrid.length > 0) {
        rendererRef.current.drawTerrain(
          terrainGrid,
          ecosystemManagerRef.current.getTerrainGridSize() || 20
        );
      }
    }
    
    // 获取画布上下文
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 绘制场景
    rendererRef.current.drawFoods(ctx, foods);
    rendererRef.current.drawOrganisms(organisms);
    
    // 确保暂停状态正确显示
    if (!config.isRunning) {
      rendererRef.current.drawPauseOverlay();
    }
    
    // 继续下一帧动画
    animationRef.current = requestAnimationFrame(render);
  };

  // 添加单个生物
  const addOrganism = () => {
    ecosystemManagerRef.current?.addOrganism();
  };

  // 清空所有生物
  const clearAll = () => {
    ecosystemManagerRef.current?.clearAllOrganisms();
  };
  
  // 重置整个沙盒
  const resetSandbox = () => {
    ecosystemManagerRef.current?.resetSandbox();
  };
  
  // 重置食物
  const resetFoods = () => {
    ecosystemManagerRef.current?.initFoods(config.foodCount);
  };

  // 调整速度
  const handleSpeedChange = (value: number[]) => {
    setConfig(prev => ({ ...prev, speed: value[0] }));
    ecosystemManagerRef.current?.updateConfig({ speed: value[0] });
  };

  // 切换运行状态
  const toggleRunning = () => {
    setConfig(prev => ({ ...prev, isRunning: !prev.isRunning }));
    ecosystemManagerRef.current?.updateConfig({ isRunning: !config.isRunning });
  };

  // 重置生物
  const initOrganisms = (count: number) => {
    ecosystemManagerRef.current?.clearAllOrganisms();
    ecosystemManagerRef.current?.initOrganisms(count);
  };

  // 直接初始化食物（供重置按钮使用）
  const initFoods = (count: number) => {
    ecosystemManagerRef.current?.initFoods(count);
  };

  // 初始化和清理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置Canvas尺寸为CSS尺寸的2倍（Hi-DPI显示支持）
    const rect = canvas.getBoundingClientRect();
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 初始化渲染器
    rendererRef.current = new EcosystemRenderer(ctx, rect.width * devicePixelRatio, rect.height * devicePixelRatio, devicePixelRatio);
      // 设置生态系统管理器引用，用于获取地形效果
      if (ecosystemManagerRef.current) {
        rendererRef.current.setEcosystemManager(ecosystemManagerRef.current);
      }
    
    // 初始化生态系统管理器
    ecosystemManagerRef.current = new EcosystemManager(
      config,
      idCounterRef,
      foodIdCounterRef,
      rect.width,
      rect.height
    );

    // 初始化生物和食物
    ecosystemManagerRef.current.initOrganisms(config.organismCount);
    ecosystemManagerRef.current.initFoods(config.foodCount);
    
    // 开始渲染
    render();

    // 处理窗口大小变化
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      
      if (rendererRef.current) {
        rendererRef.current.updateSize(rect.width * devicePixelRatio, rect.height * devicePixelRatio);
      }
      
      if (ecosystemManagerRef.current) {
        ecosystemManagerRef.current.setCanvasSize(rect.width, rect.height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-8 bg-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          生物沙盒模拟
        </h1>
        <p className="text-center text-slate-600 mt-2">
          高性能纯前端生态系统模拟演示
        </p>
      </header>

      <main className="flex-grow flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
        {/* 控制面板 */}
        <Card className="p-4 w-full md:w-72 flex-shrink-0 min-w-72" style={{ maxWidth: '280px' }}>
          <h2 className="text-xl font-semibold mb-4">控制面板</h2>
          
          <div className="space-y-6">
            {/* 运行/暂停控制 */}
            <div className="flex items-center justify-between">
              <Label htmlFor="running-toggle">运行模拟</Label>
              <Button 
                id="running-toggle"
                className={`px-4 ${config.isRunning ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                onClick={toggleRunning}
              >
                {config.isRunning ? '暂停' : '运行'}
              </Button>
            </div>
            
            <Separator />
            
            {/* 速度控制 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="speed-slider">移动速度</Label>
                <span className="text-sm font-mono">{config.speed.toFixed(1)}px/帧</span>
              </div>
              <Slider
                id="speed-slider"
                value={[config.speed]}
                min={0.1}
                max={5}
                step={0.1}
                onValueChange={handleSpeedChange}
              />
            </div>
            
            <Separator />
            
            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700" 
                onClick={addOrganism}
              >
                添加生物
              </Button>
              
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600" 
                onClick={() => initOrganisms(config.organismCount)}
              >
                重置生物（{config.organismCount}个）
              </Button>
              
              <Button 
                className="w-full bg-emerald-500 hover:bg-emerald-600" 
                onClick={resetFoods}
              >
                重置食物（{config.foodCount}个）
              </Button>
              
              <Button 
                className="w-full bg-red-500 hover:bg-red-600" 
                onClick={clearAll}
              >
                清空所有
              </Button>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => ecosystemManagerRef.current?.resetSandbox()}
              >
                重置沙盒
              </Button>
            </div>
            
            <Separator />
            
            {/* 性能统计 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">性能统计</h3>
              <div className="text-sm font-mono">
                <div>FPS: {stats.fps}</div>
                <div>帧时间: {stats.frameTime.toFixed(2)}ms</div>
                <div>生物总数: {stats.organismTypes.basic + stats.organismTypes.predator + stats.organismTypes.scavenger}</div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span>基础生物:</span>
                    <span className="text-green-600">{stats.organismTypes.basic || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>捕食者:</span>
                    <span className="text-red-600">{stats.organismTypes.predator || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>清道夫:</span>
                    <span className="text-purple-600">{stats.organismTypes.scavenger || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* 沙盒画布 */}
        <Card className="flex-grow overflow-hidden flex flex-col">
          <div className="relative w-full h-full min-h-[500px] flex-grow" style={{ aspectRatio: '16/9' }}>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full bg-slate-100"
              style={{
                cursor: config.isRunning ? 'crosshair' : 'not-allowed'
              }}
              onClick={addOrganism}
            />
            {!config.isRunning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 text-white font-bold text-xl pointer-events-none">
                已暂停
              </div>
            )}
          </div>
        </Card>
      </main>
      
        {/* 规则说明组件 */}
        <RuleDescription />

        <footer className="mt-6 mb-4 text-center text-sm text-slate-500">
          <p>点击沙盒区域也可以添加生物</p>
        </footer>
    </div>
  );
};

export default EcosystemSandbox;