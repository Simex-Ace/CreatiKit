'use client';
import React, { useRef, useEffect, useState } from 'react';
import Matter from 'matter-js';
import { useI18n } from '@/contexts/I18nContext';

const PhysicsLab: React.FC = () => {
  const { t } = useI18n();
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  
  // 状态管理
  const [selectedShape, setSelectedShape] = useState<'circle' | 'rectangle' | 'triangle' | 'hexagon' | 'trapezoid' | 'ellipse'>('circle');
  const [selectedScene, setSelectedScene] = useState<'custom' | 'lever' | 'spring' | 'pendulum' | 'inclined-plane'>('custom');
  const [friction, setFriction] = useState<number>(0.01);
  const [restitution, setRestitution] = useState<number>(0.8);
  const [mass, setMass] = useState<number>(10);
  const [springStiffness, setSpringStiffness] = useState<number>(0.05);
  const [inclinedAngle, setInclinedAngle] = useState<number>(30);
  
  // 清理函数
  const cleanupPhysics = () => {
    if (runnerRef.current) {
      Matter.Runner.stop(runnerRef.current);
      runnerRef.current = null;
    }
    
    if (renderRef.current) {
      Matter.Render.stop(renderRef.current);
      if (renderRef.current.canvas && renderRef.current.canvas.parentNode) {
        renderRef.current.canvas.remove();
      }
      renderRef.current = null;
    }
    
    if (worldRef.current) {
      Matter.World.clear(worldRef.current, false);
    }
    
    if (engineRef.current) {
      Matter.Engine.clear(engineRef.current);
      engineRef.current = null;
    }
    
    mouseConstraintRef.current = null;
    worldRef.current = null;
  };
  
  // 创建物理世界
  const createPhysicsWorld = (width: number, height: number) => {
    cleanupPhysics();
    
    if (!sceneRef.current) return;
    
    // 创建引擎
    const engine = Matter.Engine.create();
    engine.world.gravity.y = 0.8;  // 稍微减小重力，使运动更可控
    
    // 创建渲染器
    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: '#f0f0f0'
      }
    });
    
    // 创建运行器
    const runner = Matter.Runner.create();
    const canvas = render.canvas;
    const mouse = Matter.Mouse.create(canvas);
    
    // 设置鼠标约束，优化拖拽手感
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,  // 增加刚度减少抖动
        render: {
          visible: true
        },
        damping: 0.05,  // 增加阻尼使拖拽更平滑
        length: 0  // 保持鼠标和物体直接接触
      }
    });
    
    render.canvas.style.touchAction = 'none';
    Matter.World.add(engine.world, mouseConstraint);
    
    // 保存引用
    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;
    mouseConstraintRef.current = mouseConstraint;
    worldRef.current = engine.world;
    
    // 运行引擎
    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);
    
    // 创建边界
    createBoundaries();
    
    // 加载当前选中的场景
    if (selectedScene !== 'custom') {
      switch (selectedScene) {
        case 'lever':
          loadLeverScene();
          break;
        case 'spring':
          loadSpringScene();
          break;
        case 'pendulum':
          loadPendulumScene();
          break;
        case 'inclined-plane':
          loadInclinedPlaneScene();
          break;
      }
    }
  };
  
  // 添加物体位置限制的更新器
  useEffect(() => {
    if (!engineRef.current || !renderRef.current) return;
    
    const updateBodyPositions = () => {
      if (!worldRef.current || !renderRef.current) return;
      
      const options = renderRef.current.options;
    const width = options.width as number;
    const height = options.height as number;
      const bodies = worldRef.current.bodies;
      
      // 检查并限制物体位置，防止它们飞得太远
      for (const body of bodies) {
        if (body.isStatic) continue;
        
        // 限制在可视区域的合理范围内
        if (body.position.x < -500) {
          Matter.Body.setPosition(body, { x: -500, y: body.position.y });
          Matter.Body.setVelocity(body, { x: 0, y: body.velocity.y });
        } else if (body.position.x > width + 500) {
          Matter.Body.setPosition(body, { x: width + 500, y: body.position.y });
          Matter.Body.setVelocity(body, { x: 0, y: body.velocity.y });
        }
        
        if (body.position.y < -500) {
          Matter.Body.setPosition(body, { x: body.position.x, y: -500 });
          Matter.Body.setVelocity(body, { x: body.velocity.x, y: 0 });
        } else if (body.position.y > height + 500) {
          Matter.Body.setPosition(body, { x: body.position.x, y: height + 500 });
          Matter.Body.setVelocity(body, { x: body.velocity.x, y: 0 });
        }
      }
    };
    
    // 在每帧更新时检查和限制物体位置
    Matter.Events.on(engineRef.current, 'afterUpdate', updateBodyPositions);
    
    return () => {
      if (engineRef.current) {
        Matter.Events.off(engineRef.current, 'afterUpdate', updateBodyPositions);
      }
    };
  }, []);
    
  // 监听容器尺寸变化
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 10 && height > 10) {
          createPhysicsWorld(Math.round(width), Math.round(height));
        }
      }
    });
    
    observer.observe(sceneRef.current);
    
    return () => {
      observer.disconnect();
      cleanupPhysics();
    };
  }, []);
  
  // 创建边界
  const createBoundaries = () => {
    if (!worldRef.current || !renderRef.current) return;
    
    const world = worldRef.current;
    const options = renderRef.current.options;
    const width = options.width as number;
    const height = options.height as number;
    
    const thickness = 300;  // 大幅增加边界厚度
    
    // 更大范围的边界，完全防止物体飞出
    const ground = Matter.Bodies.rectangle(
      width / 2,
      height + thickness / 2,
      width + thickness * 4,
      thickness,
      { 
        isStatic: true,
        label: 'ground',
        render: { visible: false }
      }
    );
    
    const leftWall = Matter.Bodies.rectangle(
      -thickness / 2,
      height / 2,
      thickness,
      height * 4,
      { 
        isStatic: true,
        label: 'leftWall',
        render: { visible: false }
      }
    );
    
    const rightWall = Matter.Bodies.rectangle(
      width + thickness / 2,
      height / 2,
      thickness,
      height * 4,
      { 
        isStatic: true,
        label: 'rightWall',
        render: { visible: false }
      }
    );
    
    const ceiling = Matter.Bodies.rectangle(
      width / 2,
      -thickness / 2,
      width + thickness * 4,
      thickness,
      { 
        isStatic: true,
        label: 'ceiling',
        render: { visible: false }
      });
    
    Matter.World.add(world, [ground, leftWall, rightWall, ceiling]);
  };
  
  // 创建物体
  const createBody = (x: number, y: number) => {
    if (!worldRef.current) return;
    
    let body: Matter.Body;
    const defaultDensity = 0.001;
    
    switch (selectedShape) {
      case 'circle':
        body = Matter.Bodies.circle(x, y, 30, {
          friction: friction,  // 使用状态中的摩擦值
          restitution: restitution,  // 使用状态中的弹性值
          density: defaultDensity,
          render: {
            fillStyle: '#FF5733',
            strokeStyle: '#900C3F',
            lineWidth: 3
          }
        });
        break;
      case 'rectangle':
        body = Matter.Bodies.rectangle(x, y, 60, 60, {
          friction: friction,  // 使用状态中的摩擦值
          restitution: restitution,  // 使用状态中的弹性值
          density: defaultDensity,
          render: {
            fillStyle: '#33FF57',
            strokeStyle: '#0C903F',
            lineWidth: 3
          }
        });
        break;
      case 'triangle':
        // 创建三角形（3边形）
        body = Matter.Bodies.polygon(x, y, 3, 40, {
          friction: friction,
          restitution: restitution,
          density: defaultDensity,
          render: {
            fillStyle: '#3357FF',
            strokeStyle: '#0C3F90',
            lineWidth: 3
          }
        });
        break;
      case 'hexagon':
        // 创建六边形（6边形）
        body = Matter.Bodies.polygon(x, y, 6, 30, {
          friction: friction,
          restitution: restitution,
          density: defaultDensity,
          render: {
            fillStyle: '#FF33E5',
            strokeStyle: '#900C78',
            lineWidth: 3
          }
        });
        break;
      case 'trapezoid':
        // 创建梯形（通过顶点定义）
        const vertices = [
          { x: -40, y: -20 },
          { x: 40, y: -20 },
          { x: 30, y: 20 },
          { x: -30, y: 20 }
        ];
        body = Matter.Bodies.fromVertices(x, y, [vertices], {
          friction: friction,
          restitution: restitution,
          density: defaultDensity,
          render: {
            fillStyle: '#FFB333',
            strokeStyle: '#90630C',
            lineWidth: 3
          }
        });
        break;
      case 'ellipse':
        // 创建椭圆形（通过椭圆公式生成多边形近似）
        const ellipseVertices = [];
        const ellipseSegments = 20; // 分段数，越高越平滑
        const radiusX = 50; // 水平半径
        const radiusY = 30; // 垂直半径
        
        for (let i = 0; i < ellipseSegments; i++) {
          const angle = (i / ellipseSegments) * Math.PI * 2;
          ellipseVertices.push({
            x: radiusX * Math.cos(angle),
            y: radiusY * Math.sin(angle)
          });
        }
        
        body = Matter.Bodies.fromVertices(x, y, [ellipseVertices], {
          friction: friction,
          restitution: restitution,
          density: defaultDensity,
          render: {
            fillStyle: '#8E44AD',
            strokeStyle: '#5D2D8E',
            lineWidth: 3
          }
        });
        break;
      default:
        // 默认创建圆形
        body = Matter.Bodies.circle(x, y, 30, {
          friction: friction,
          restitution: restitution,
          density: defaultDensity,
          render: {
            fillStyle: '#FF5733',
            strokeStyle: '#900C3F',
            lineWidth: 3
          }
        });
    }
    
    Matter.World.add(worldRef.current, body);
  };
  
  // 处理画布点击
  const handleCanvasClick = (event: React.MouseEvent) => {
    if (!event.altKey) return;
    
    if (!renderRef.current || !renderRef.current.canvas) return;
    
    const canvas = renderRef.current.canvas;
    const rect = canvas.getBoundingClientRect();
    const options = renderRef.current.options;
    const scaleX = (options.width as number) / rect.width;
    const scaleY = (options.height as number) / rect.height;
    
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    
    createBody(canvasX, canvasY);
  };
  
  // 清除所有物体，包括动态和静态物体（但不包括边界和鼠标约束）
  const clearBodies = () => {
    if (!worldRef.current) return;
    
    // 保存边界物体的引用
    const boundaryLabels = ['ground', 'leftWall', 'rightWall', 'ceiling'];
    const boundaries = worldRef.current.bodies.filter(body => 
      boundaryLabels.includes(body.label || '')
    );
    
    // 保存鼠标约束的引用
    const mouseConstraint = mouseConstraintRef.current;
    
    // 移除所有物体
    Matter.World.clear(worldRef.current, false);
    
    // 重新添加边界
    if (boundaries.length > 0) {
      Matter.World.add(worldRef.current, boundaries);
    }
    
    // 重新添加鼠标约束
    if (mouseConstraint) {
      Matter.World.add(worldRef.current, mouseConstraint);
    }
  };
  
  // 重置实验室 - 完全重置为初始状态
  const resetLab = () => {
    if (!worldRef.current || !renderRef.current) return;
    
    // 清除所有物体
    clearBodies();
    
    // 如果当前是预设场景，重新加载该场景
    // 这样可以恢复到场景的初始状态，而不仅仅是清除物体
    if (selectedScene !== 'custom') {
      switch (selectedScene) {
        case 'lever':
          loadLeverScene();
          break;
        case 'spring':
          loadSpringScene();
          break;
        case 'pendulum':
          loadPendulumScene();
          break;
        case 'inclined-plane':
          loadInclinedPlaneScene();
          break;
      }
    }
  };
  
  // 更新所有现有物体的摩擦和弹性属性
  const updateAllBodiesProperties = () => {
    if (!worldRef.current) return;
    
    const bodies = worldRef.current.bodies;
    for (const body of bodies) {
      // 只更新非静态物体的属性
      if (!body.isStatic) {
        // 直接修改物体属性
        body.friction = friction;
        body.restitution = restitution;
      }
    }
  };
  
  // 当摩擦或弹性值改变时，更新所有现有物体的属性
  useEffect(() => {
    updateAllBodiesProperties();
  }, [friction, restitution]);
  
  // 加载杠杆场景
  const loadLeverScene = () => {
    clearBodies();
    if (!worldRef.current || !renderRef.current) return;
    
    const world = worldRef.current;
    const options = renderRef.current.options;
    const width = options.width as number;
    const height = options.height as number;
    
    const fulcrum = Matter.Bodies.polygon(
      width / 2,
      height / 2 + 30,
      3,
      20,
      { isStatic: true }
    );
    
    const lever = Matter.Bodies.rectangle(
      width / 2,
      height / 2,
      400,
      20,
      {}
    );
    
    const constraint = Matter.Constraint.create({
      bodyA: fulcrum,
      bodyB: lever,
      pointB: { x: 0, y: 0 },
      stiffness: 1
    });
    
    Matter.World.add(world, [fulcrum, lever, constraint]);
  };
  
  // 加载弹簧场景
  const loadSpringScene = () => {
    clearBodies();
    if (!worldRef.current || !renderRef.current) return;
    
    const world = worldRef.current;
    const options = renderRef.current.options;
    const width = options.width as number;
    const height = options.height as number;
    
    const anchor = Matter.Bodies.circle(
      width / 2,
      100,
      10,
      { isStatic: true }
    );
    
    const ball = Matter.Bodies.circle(
      width / 2,
      300,
      20,
      {}
    );
    
    const spring = Matter.Constraint.create({
      bodyA: anchor,
      bodyB: ball,
      stiffness: springStiffness,
      damping: 0.01,
      length: 200
    });
    
    Matter.World.add(world, [anchor, ball, spring]);
  };
  
  // 加载单摆场景
  const loadPendulumScene = () => {
    clearBodies();
    if (!worldRef.current || !renderRef.current) return;
    
    const world = worldRef.current;
    const options = renderRef.current.options;
    const width = options.width as number;
    const height = options.height as number;
    
    const anchor = Matter.Bodies.circle(
      width / 2,
      100,
      10,
      { isStatic: true }
    );
    
    const pendulum = Matter.Bodies.circle(
      width / 2 - 200,
      300,
      30,
      {}
    );
    
    const constraint = Matter.Constraint.create({
      bodyA: anchor,
      bodyB: pendulum,
      stiffness: 1,
      length: 200
    });
    
    Matter.World.add(world, [anchor, pendulum, constraint]);
  };
  
  // 加载斜面场景
  const loadInclinedPlaneScene = () => {
    clearBodies();
    if (!worldRef.current || !renderRef.current) return;
    
    const world = worldRef.current;
    const options = renderRef.current.options;
    const width = options.width as number;
    const height = options.height as number;
    
    const angleRad = (inclinedAngle * Math.PI) / 180;
    const inclinedPlane = Matter.Bodies.rectangle(
      width / 2,
      height / 2,
      500,
      20,
      {
        isStatic: true,
        angle: angleRad,
        friction: friction
      }
    );
    
    const block = Matter.Bodies.rectangle(
      width / 2 - 100,
      height / 2 - 100,
      40,
      40,
      {
        friction: friction,
        restitution: 0.2
      }
    );
    
    Matter.World.add(world, [inclinedPlane, block]);
  };
  
  // 监听场景变化
  useEffect(() => {
    switch (selectedScene) {
      case 'lever':
        loadLeverScene();
        break;
      case 'spring':
        loadSpringScene();
        break;
      case 'pendulum':
        loadPendulumScene();
        break;
      case 'inclined-plane':
        loadInclinedPlaneScene();
        break;
      default:
        clearBodies();
    }
  }, [selectedScene]);
  
  // 监听弹簧劲度系数变化
  useEffect(() => {
    if (selectedScene === 'spring' && worldRef.current) {
      const constraints = worldRef.current.constraints;
      const springConstraint = constraints.find(c => c.stiffness && c.stiffness < 1);
      if (springConstraint) {
        springConstraint.stiffness = springStiffness;
      }
    }
  }, [springStiffness, selectedScene]);
  
  // 监听斜面角度和摩擦系数变化
  useEffect(() => {
    if (selectedScene === 'inclined-plane') {
      loadInclinedPlaneScene();
    }
  }, [inclinedAngle, selectedScene, friction]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white shadow-md p-4 rounded-t-lg">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="text-sm text-gray-600">
            {t('physicsLabPage.hint')}
          </div>
          
          {/* 形状选择 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{t('physicsLabPage.shape')}:</span>
            <button 
              className={selectedShape === 'circle' ? 'px-3 py-1 rounded-md text-sm bg-blue-500 text-white' : 'px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700'}
              onClick={() => setSelectedShape('circle')}
            >
              {t('physicsLabPage.circle')}
            </button>
            <button 
              className={selectedShape === 'rectangle' ? 'px-3 py-1 rounded-md text-sm bg-blue-500 text-white' : 'px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700'}
              onClick={() => setSelectedShape('rectangle')}
            >
              {t('physicsLabPage.rectangle')}
            </button>
            <button 
              className={selectedShape === 'triangle' ? 'px-3 py-1 rounded-md text-sm bg-blue-500 text-white' : 'px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700'}
              onClick={() => setSelectedShape('triangle')}
            >
              {t('physicsLabPage.triangle')}
            </button>
            <button 
              className={selectedShape === 'hexagon' ? 'px-3 py-1 rounded-md text-sm bg-blue-500 text-white' : 'px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700'}
              onClick={() => setSelectedShape('hexagon')}
            >
              {t('physicsLabPage.hexagon')}
            </button>
            <button 
              className={selectedShape === 'trapezoid' ? 'px-3 py-1 rounded-md text-sm bg-blue-500 text-white' : 'px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700'}
              onClick={() => setSelectedShape('trapezoid')}
            >
              {t('physicsLabPage.trapezoid')}
            </button>
            <button 
              className={selectedShape === 'ellipse' ? 'px-3 py-1 rounded-md text-sm bg-blue-500 text-white' : 'px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700'}
              onClick={() => setSelectedShape('ellipse')}
            >
              {t('physicsLabPage.ellipse')}
            </button>
          </div>
          
          {/* 场景选择 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t('physicsLabPage.scene')}:</span>
            <select 
              className="px-3 py-1 rounded-md text-sm border border-gray-300"
              value={selectedScene}
              onChange={(e) => setSelectedScene(e.target.value as any)}
            >
              <option value="custom">{t('physicsLabPage.custom')}</option>
              <option value="lever">{t('physicsLabPage.lever')}</option>
              <option value="spring">{t('physicsLabPage.spring')}</option>
              <option value="pendulum">{t('physicsLabPage.pendulum')}</option>
              <option value="inclined-plane">{t('physicsLabPage.inclinedPlane')}</option>
            </select>
          </div>
          
          {/* 操作按钮 */}
          <button 
            className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700"
            onClick={clearBodies}
          >
            {t('physicsLabPage.clearObjects')}
          </button>
          <button 
            className="px-3 py-1 rounded-md text-sm bg-gray-200 text-gray-700"
            onClick={resetLab}
          >
            {t('physicsLabPage.reset')}
          </button>
          
          {/* 参数控制 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('physicsLabPage.friction')}:</span>
              <input 
                type="range" 
                min="0" 
                max="2" 
                step="0.01" 
                value={friction} 
                onChange={(e) => setFriction(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm">{friction.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{t('physicsLabPage.elasticity')}:</span>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={restitution} 
                onChange={(e) => setRestitution(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm">{restitution.toFixed(2)}</span>
            </div>
            
            {/* 弹簧场景特定参数 */}
            {selectedScene === 'spring' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('physicsLabPage.stiffness')}:</span>
                <input 
                  type="range" 
                  min="0.01" 
                  max="0.5" 
                  step="0.01" 
                  value={springStiffness} 
                  onChange={(e) => setSpringStiffness(Number(e.target.value))}
                  className="w-24"
                />
                <span className="text-sm">{springStiffness.toFixed(2)}</span>
              </div>
            )}
            
            {/* 斜面场景特定参数 */}
            {selectedScene === 'inclined-plane' && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{t('physicsLabPage.inclinedAngle')}:</span>
                <input 
                  type="range" 
                  min="0" 
                  max="180" 
                  value={inclinedAngle} 
                  onChange={(e) => setInclinedAngle(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm">{inclinedAngle}°</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 物理实验区域 */}
      <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden relative border-2 border-gray-200">
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm font-medium">
          {t('physicsLabPage.physicsArea')}
        </div>
        
        <div 
          ref={sceneRef} 
          className="w-full h-full relative bg-gray-100"
          onClick={handleCanvasClick}
        >
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white bg-opacity-70 p-1 rounded">
            {t('physicsLabPage.hint')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhysicsLab;