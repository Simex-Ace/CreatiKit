'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// 导入类型和工具
import { SandboxConfig, Stats, TerrainDistribution, EcosystemStage } from './types';
import { EcosystemRenderer } from './renderer';
import { EcosystemManager } from './ecosystem-manager';
import { RuleDescription } from './RuleDescription';
import { EcosystemStageUI } from './stage-ui';

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
  
  // 阶段UI引用
  const stageUIRef = useRef<EcosystemStageUI | null>(null);
  
  // 缩放和偏移状态引用 - 用于重置功能
  const scaleRef = useRef(1);
  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);
  
  // 重置视角函数
  const resetView = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 重置缩放和偏移
    scaleRef.current = 1;
    offsetXRef.current = 0;
    offsetYRef.current = 0;
    
    // 应用重置后的变换
    canvas.style.transform = `translate(0px, 0px) scale(1)`;
    canvas.style.transformOrigin = '0 0';
    
    // 更新鼠标样式
    canvas.style.cursor = 'crosshair';
  };
  
  // 性能统计相关引用
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const lastFps = useRef(0);
  
  // 状态管理
  const [config, setConfig] = useState<SandboxConfig>({
    width: 800,
    height: 600,
    organismCount: 10,
    foodCount: 30,
    speed: 0.5, // 保留配置但不在UI中显示
    isRunning: true,
    maxOrganisms: 100,
    maxFood: 100,
    foodSpawnRate: 0.02,
    foodSpawnThreshold: 20,
    evolutionThreshold: 100,
    breedingThreshold: 80,
    hasTerrain: true,
    terrainGridSize: 20,
    
    // 世代阶段相关配置
    currentStage: 'primordial_soup' as EcosystemStage,
    primordialSoupCount: 0,
    primordialSoupThreshold: 20, // 需要收集20个原始汤才能进入下一阶段
    canAdvanceStage: false
  });
  
  const [stats, setStats] = useState<Stats>({ 
    fps: 0, 
    frameTime: 0,
    organismTypes: { basic: 0, predator: 0, scavenger: 0 }
  });
  
  // 简化的渲染函数
  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas || !rendererRef.current || !ecosystemManagerRef.current) return;

    // 计算帧率
    const now = performance.now();
    frameCountRef.current++;
    
    // 每秒更新一次FPS
    if (now - lastFpsUpdateRef.current > 1000) {
      const newFps = Math.round(frameCountRef.current * 1000 / (now - lastFpsUpdateRef.current));
      lastFps.current = newFps;
      
      // 获取生物统计数据
      const organismStats = rendererRef.current.calculateOrganismStats(ecosystemManagerRef.current.getState().organisms);
      
      setStats({
        fps: newFps,
        frameTime: 16.67, // 简化为固定值
        organismTypes: organismStats
      });
      
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }

    // 更新生态系统（如果运行中）
    if (config.isRunning) {
      ecosystemManagerRef.current.update();
    }
    
    // 更新阶段UI
    if (stageUIRef.current && ecosystemManagerRef.current) {
      const currentConfig = ecosystemManagerRef.current.getConfig();
      stageUIRef.current.updateUI(
        currentConfig.currentStage,
        currentConfig.primordialSoupCount,
        currentConfig.primordialSoupThreshold,
        currentConfig.canAdvanceStage
      );
    }
    
    // 更新渲染器
    rendererRef.current.updateAnimation(16.67); // 使用固定的增量时间
    
    // 清空画布
    rendererRef.current.clear();
    
    // 使用renderer的内部render方法绘制所有内容
    rendererRef.current.render();
    
    // 显示暂停覆盖层
    if (!config.isRunning) {
      rendererRef.current.drawPauseOverlay();
    }
    
    // 继续动画循环
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

  // 速度控制已移除 - 当前阶段不需要

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

    // 初始化生态系统管理器
    ecosystemManagerRef.current = new EcosystemManager(
      config,
      idCounterRef,
      foodIdCounterRef,
      rect.width,
      rect.height
    );
    
    // 初始化渲染器
    rendererRef.current = new EcosystemRenderer(ctx, rect.width * devicePixelRatio, rect.height * devicePixelRatio, devicePixelRatio);
    rendererRef.current.setEcosystemManager(ecosystemManagerRef.current);
    
    // 初始化阶段UI
    stageUIRef.current = new EcosystemStageUI();
    stageUIRef.current.setAdvanceCallback(() => {
      if (ecosystemManagerRef.current?.advanceStage()) {
        // 更新配置中的阶段信息
        setConfig(prev => ({
          ...prev,
          currentStage: 'early_life' as EcosystemStage,
          canAdvanceStage: false
        }));
      }
    });

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

    // 添加缩放和平移相关状态
    const minScale = 1; // 最小缩放为原始尺寸
    const maxScale = 3;
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    // 明确的鼠标悬停状态跟踪
    let isMouseOnCanvas = false;
    
    // 应用变换到canvas
    const applyTransform = () => {
      canvas.style.transform = `translate(${offsetXRef.current}px, ${offsetYRef.current}px) scale(${scaleRef.current})`;
      canvas.style.transformOrigin = '0 0';
    };
    
    // 处理鼠标进入canvas事件
    const handleMouseEnter = function() {
      isMouseOnCanvas = true;
      canvas.style.cursor = scaleRef.current > 1 ? 'grab' : 'crosshair';
    };
    
    // 处理鼠标离开canvas事件
    const handleMouseLeave = function() {
      isMouseOnCanvas = false;
      isDragging = false;
      canvas.style.cursor = 'default';
    };
    
    // 处理滚轮缩放事件
    const handleWheel = function(e: WheelEvent) {
      // 只有当按下Ctrl/Meta键时才需要处理
      if (e.ctrlKey || e.metaKey) {
        // 阻止浏览器默认的缩放行为 - 这很重要，防止整个页面缩放
        e.preventDefault();
        
        // 只有当鼠标确实在canvas上时，才执行自定义缩放逻辑
        if (isMouseOnCanvas) {
          const rect = canvas.getBoundingClientRect();
          
          // 根据滚轮方向计算缩放因子
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          const newScale = scaleRef.current * delta;
          
          // 限制缩放范围
          if (newScale >= minScale && newScale <= maxScale) {
            // 计算鼠标在canvas上的位置
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // 调整偏移量以实现以鼠标为中心的缩放
            const scaleRatio = newScale / scaleRef.current;
            offsetXRef.current = mouseX - (mouseX - offsetXRef.current) * scaleRatio;
            offsetYRef.current = mouseY - (mouseY - offsetYRef.current) * scaleRatio;
            
            scaleRef.current = newScale;
            applyTransform();
          }
        }
        // 当鼠标不在canvas上时，虽然阻止了默认行为，但不执行自定义缩放
      }
    };
    
    // 处理鼠标按下事件（开始拖动）
    const handleMouseDown = function(e: MouseEvent) {
      // 只有当缩放大于1时才允许拖动
      if (scaleRef.current > 1) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
      }
    };
    
    // 处理鼠标移动事件（拖动中）
    const handleMouseMove = function(e: MouseEvent) {
      if (isDragging) {
        const deltaX = e.clientX - lastX;
        const deltaY = e.clientY - lastY;
        
        offsetXRef.current += deltaX;
        offsetYRef.current += deltaY;
        
        applyTransform();
        
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    
    // 处理鼠标释放事件（结束拖动）
    const handleMouseUp = function() {
      isDragging = false;
      canvas.style.cursor = 'grab';
    };
    
    // 添加事件监听器 - 滚轮事件绑定到document
    document.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('mouseenter', handleMouseEnter); // 添加鼠标进入事件
    
    // 初始设置鼠标样式
    canvas.style.cursor = 'default'; // 初始为默认，鼠标进入后会更新
    canvas.style.userSelect = 'none'; // 防止拖动时选中文本

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('mouseenter', handleMouseEnter); // 移除鼠标进入事件监听器
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // 销毁阶段UI
      if (stageUIRef.current) {
        stageUIRef.current.destroy();
        stageUIRef.current = null;
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
            
            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-red-500 hover:bg-red-600" 
                onClick={clearAll}
              >
                清空所有
              </Button>
              
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700" 
                onClick={resetView}
              >
                重置视角
              </Button>
            </div>
            
            <Separator />
            
            {/* 性能统计 */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-slate-500">性能统计</h3>
              <div className="text-sm font-mono">
                <div>FPS: {stats.fps} <span className={`${stats.fps < 30 ? 'text-red-500' : stats.fps < 50 ? 'text-amber-500' : 'text-green-500'}`}>({stats.fps < 30 ? '低' : stats.fps < 50 ? '中' : '高'})</span></div>
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