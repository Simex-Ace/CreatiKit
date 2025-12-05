"use client";

import React, { useEffect, useRef } from 'react';

const CameraGestureDrawing = () => {
  // DOM 元素引用
  const inputVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewElRef = useRef<HTMLDivElement>(null);
  const previewResizerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const uiCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // 内部状态（使用 useRef 避免不必要的重渲染）
  const dctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const uctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cameraBackgroundModeRef = useRef(false);
  const showPanelRef = useRef(false);
  const panelBoundsRef = useRef<Array<any>>([]);
  const toolsRef = useRef([
    {id:'pen', color:'#60a5fa', size:6},
    {id:'eraser', color:'#000000', size:36},
    {id:'settings', color:'#ffffff', size:8}
  ]);
  const selectedToolRef = useRef({...toolsRef.current[0]});
  const strokesRef = useRef<Array<any>>([]);
  const currentStrokeRef = useRef<{[key: number]: any}>({}); // 支持双手绘画，key为手的索引
  const lastHandsRef = useRef<Array<any>>([]);
  const gestureStateRef = useRef({scaling:false, startDist:0, startScale:1});
  const particlesRef = useRef<Array<any>>([]);
  const lastPanelToggleTimeRef = useRef(0);
  const lastDissolveTimeRef = useRef(0); // 消散手势的防抖时间
  const selectedStrokesRef = useRef<Array<number>>([]);
  
  // MediaPipe 相关引用
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  
  // 初始化 MediaPipe Hands
  const initMediaPipe = () => {
    if (typeof window === 'undefined') return;
    
    // 检查 MediaPipe Hands 和 Camera 是否已加载
    if (!('Hands' in window) || !('Camera' in window)) {
      console.log('MediaPipe Hands or Camera not available yet');
      return;
    }
    
    const hands = new (window as any).Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });
    
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.72,
      minTrackingConfidence: 0.6
    });
    
    hands.onResults((results: any) => {
      onHandsResults(results);
    });
    handsRef.current = hands;
    
    // 启动摄像头
    if (inputVideoRef.current) {
      const camera = new (window as any).Camera(inputVideoRef.current, {
        onFrame: async () => {
          if (inputVideoRef.current && handsRef.current) {
            await handsRef.current.send({image: inputVideoRef.current});
          }
        },
        width: 1280, height: 720
      });
      
      camera.start().then(() => {
        // 当 camera 启动后，如果预览视频没有 stream，则复制主 video 的 stream
        try {
          if(!previewVideoRef.current?.srcObject && inputVideoRef.current?.srcObject) {
            previewVideoRef.current!.srcObject = inputVideoRef.current!.srcObject;
            previewVideoRef.current!.play().catch(()=>{});
          }
        } catch(e) {
          console.warn('无法共享 media stream 到预览视频：', e);
        }
      }).catch((err: any)=>{
        console.error('camera start error', err);
      });
      
      cameraRef.current = camera;
    }
  };
  
  /**********************
   *  手势检测辅助函数
   **********************/
  const fingersStatus = (landmarks: Array<any>) => {
    const tips = {thumb:4, index:8, middle:12, ring:16, pinky:20};
    const pip = {thumb:2, index:6, middle:10, ring:14, pinky:18};
    const res: any = {};
    ['index','middle','ring','pinky'].forEach(k=>{
      res[k] = landmarks[tips[k as keyof typeof tips]].y < landmarks[pip[k as keyof typeof pip]].y - 0.02;
    });
    res.thumb = Math.abs(landmarks[tips.thumb].x - landmarks[pip.thumb].x) > 0.03 && (Math.abs(landmarks[tips.thumb].x - landmarks[0].x) > 0.02);
    return res;
  };
  
  const isPalmOpen = (landmarks: Array<any>) => {
    const s = fingersStatus(landmarks);
    // 张开双手：所有手指都张开（包括拇指）
    return s.thumb && s.index && s.middle && s.ring && s.pinky;
  };
  
  const isPointingIndex = (landmarks: Array<any>) => {
    const s = fingersStatus(landmarks);
    // 只伸出食指
    return s.index && !s.middle && !s.ring && !s.pinky && !s.thumb;
  };
  
  const isPinch = (landmarks: Array<any>) => {
    const dx = landmarks[8].x - landmarks[4].x;
    const dy = landmarks[8].y - landmarks[4].y;
    return Math.hypot(dx, dy) < 0.05;
  };
  
  const isSixGesture = (landmarks: Array<any>) => {
    const s = fingersStatus(landmarks);
    // 比六手势：只伸出拇指和小拇指
    return s.thumb && s.pinky && !s.index && !s.middle && !s.ring;
  };
  
  // 坐标映射：forUI=true -> 返回视觉坐标（视频经过 CSS 镜像）用于 UI 点击检测
  // forUI=false -> 返回原始屏幕坐标（用于绘图，配合 drawCanvas 的镜像 transform）
  const toScreen = (pt: any, options: {forUI?: boolean} = {forUI: false}) => {
    // 使用浏览器窗口尺寸，因为面板现在使用基于浏览器窗口的绝对定位
    const w = window.innerWidth, h = window.innerHeight;
    if(options.forUI) {
      return { x: (1 - pt.x) * w, y: pt.y * h };
    } else {
      // 添加x偏移量，使线条更接近指尖
      const offsetX = -0.1;
      return { x: (pt.x + offsetX) * w, y: pt.y * h };
    }
  };
  
  // MediaPipe onResults 入口
  const onHandsResults = (results: any) => {
    lastHandsRef.current = results.multiHandLandmarks || [];
    
    // 定义手势变量，用于检测冲突
    let hasPalmOpen = false;
    let hasSixGesture = false;
    let hasPinch = false;
    
    // 1. 先检测是否有消散手势（最高优先级）
    if(lastHandsRef.current.length > 0) {
      // 检查消散手势的防抖
      const now = performance.now();
      for(const h of lastHandsRef.current) {
        if(isSixGesture(h)) {
          if(now - lastDissolveTimeRef.current > 1000) { // 1秒防抖
            hasSixGesture = true;
            triggerDissolve();
            lastDissolveTimeRef.current = now;
            break;
          }
        }
      }
      
      // 如果有消散手势，不执行其他手势
      if(hasSixGesture) {
        return;
      }
    }
    
    // 2. 检测张开双手（菜单控制）
    if(lastHandsRef.current.length > 0) {
      const h0 = lastHandsRef.current[0];
      if(isPalmOpen(h0)) {
        hasPalmOpen = true;
        if(performance.now() - lastPanelToggleTimeRef.current > 600) {
          showPanelRef.current = !showPanelRef.current;
          lastPanelToggleTimeRef.current = performance.now();
        }
      }
    }
    
    // 3. 如果显示面板，处理食指点选
    if(showPanelRef.current && lastHandsRef.current.length > 0) {
      const main = lastHandsRef.current[0];
      if(isPointingIndex(main)) {
        handlePanelPointing(main);
      }
    }
    
    // 4. 如果没有张开双手，处理绘画和缩放手势
    if(!hasPalmOpen) {
      // 写字：捏合（pinch）- 支持双手同时绘画
      const currentHands = lastHandsRef.current;
      const activeHands = new Set<number>();
      
      // 处理每只手的绘画
      for(let i = 0; i < currentHands.length; i++) {
        const h = currentHands[i];
        if(isPinch(h)) {
          activeHands.add(i);
          hasPinch = true;
          const pt = toScreen(h[8], {forUI: false});
          
          if(!currentStrokeRef.current[i]) {
            // 为这只手创建新线条
            if(selectedToolRef.current.id === 'eraser') {
              currentStrokeRef.current[i] = {points:[pt], color:'#000000', size:selectedToolRef.current.size, type:'eraser'};
            } else {
              currentStrokeRef.current[i] = {points:[pt], color:selectedToolRef.current.color, size:selectedToolRef.current.size, type:'pen'};
            }
          } else {
            // 继续绘制这只手的线条
            currentStrokeRef.current[i].points.push(pt);
          }
        }
      }
      
      // 结束未捏合的手的线条
      const currentStrokeKeys = Object.keys(currentStrokeRef.current).map(Number);
      for(const handIndex of currentStrokeKeys) {
        if(!activeHands.has(handIndex)) {
          if(currentStrokeRef.current[handIndex]) {
            strokesRef.current.push(currentStrokeRef.current[handIndex]);
            delete currentStrokeRef.current[handIndex];
          }
        }
      }
      
      // 如果没有手检测到，结束所有当前线条
      if(currentHands.length === 0) {
        for(const handIndex in currentStrokeRef.current) {
          if(currentStrokeRef.current[handIndex]) {
            strokesRef.current.push(currentStrokeRef.current[handIndex]);
            delete currentStrokeRef.current[handIndex];
          }
        }
      }
      
      // 双手缩放（两手食指伸出）
      if(lastHandsRef.current.length === 2 && !hasPinch) {
        const A = lastHandsRef.current[0], B = lastHandsRef.current[1];
        const sA = fingersStatus(A), sB = fingersStatus(B);
        if(sA.index && !sA.middle && !sA.ring && !sA.pinky && !sA.thumb &&
           sB.index && !sB.middle && !sB.ring && !sB.pinky && !sB.thumb) {
          if(!gestureStateRef.current.scaling) {
            gestureStateRef.current.scaling = true;
            const pA = toScreen(A[8], {forUI: false}), pB = toScreen(B[8], {forUI: false});
            gestureStateRef.current.startDist = Math.hypot(pA.x-pB.x, pA.y-pB.y);
            gestureStateRef.current.startScale = 1;
            selectedStrokesRef.current = strokesRef.current.map((_,i)=>i);
          } else {
            const pA = toScreen(A[8], {forUI: false}), pB = toScreen(B[8], {forUI: false});
            const cur = Math.hypot(pA.x-pB.x, pA.y-pB.y);
            const f = cur / (gestureStateRef.current.startDist || cur);
            scaleSelectedStrokes(f);
            gestureStateRef.current.startDist = cur;
          }
        } else if(gestureStateRef.current.scaling) {
          gestureStateRef.current.scaling = false;
          selectedStrokesRef.current = [];
        }
      } else if(gestureStateRef.current.scaling) {
        gestureStateRef.current.scaling = false;
        selectedStrokesRef.current = [];
      }
    }
  };
  
  // 面板指向（使用视觉坐标 forUI=true）
  const handlePanelPointing = (landmarks: any) => {
    // 以浏览器窗口为中心左右居中计算面板边界，与 drawPanel 函数保持一致
    if(panelBoundsRef.current.length === 0) {
      const w = 360; const h = 110;
      const left = (window.innerWidth - w) / 2 - 150; // 与drawPanel保持一致，向左偏移150px
      const top = 50; // 固定在上方，距顶部50px
      panelBoundsRef.current = [
        {id:'pen', x:left + 18, y:top + 10, w:80, h:90},
        {id:'eraser', x:left + 18 + 96, y:top + 10, w:80, h:90},
        {id:'settings', x:left + 18 + 192, y:top + 10, w:120, h:90}
      ];
    }
    const pt = toScreen(landmarks[8], {forUI: true});
    for(const b of panelBoundsRef.current) {
      if(pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h) {
        selectTool(b.id);
      }
    }
  };
  
  const selectTool = (id: string) => {
    const t = toolsRef.current.find((x: any) => x.id === id);
    if(!t) return;
    selectedToolRef.current = t;
    if(id === 'settings') {
      // 生成随机颜色
      const generateRandomColor = () => {
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      };
      // 固定所有颜色的线条大小为6，与初始蓝色一致
      const fixedSize = 6;
      selectedToolRef.current.color = generateRandomColor();
      selectedToolRef.current.size = fixedSize;
    }
  };
  
  const scaleSelectedStrokes = (factor: number) => {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    selectedStrokesRef.current.forEach(i => {
      const s = strokesRef.current[i];
      // 添加安全检查，确保s存在且具有points属性
      if(s && s.points) {
        s.points = s.points.map((p: any) => ({x: cx + (p.x - cx) * factor, y: cy + (p.y - cy) * factor}));
        s.size = Math.max(1, s.size * factor);
      }
    });
  };
  
  const triggerDissolve = () => {
    strokesRef.current.forEach(s => {
      for(const p of s.points) {
        particlesRef.current.push({
          x: p.x, y: p.y, 
          vx: (Math.random() - 0.5) * 0.6, 
          vy: 1 + Math.random() * 1.2, 
          life: 2000 + Math.random() * 1600, 
          born: performance.now(), 
          color: s.color, 
          alpha: 1
        });
      }
    });
    strokesRef.current = [];
    currentStrokeRef.current = {}; // 重置为对象，支持双手绘画
  };
  
  // 适应画布尺寸
  const fitCanvasSize = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null, mirror: boolean = false) => {
    const ratio = window.devicePixelRatio || 1;
    const container = document.querySelector('div[style*="position: fixed"]') as HTMLElement;
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;
    
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    if(ctx) {
      if(mirror) {
        // 镜像：scaleX = -ratio, translateX = canvas.width
        ctx.setTransform(-ratio, 0, 0, ratio, canvas.width, 0);
      } else {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };
  
  // 绘制圆角矩形
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  
  // 绘制控制面板到 UICanvas（文字不会镜像）
  const drawPanel = () => {
    const uctx = uctxRef.current;
    if(!uctx) return;
    
    // 调整面板位置，向左偏移
    const w = 360; const h = 110;
    const left = (window.innerWidth - w) / 2 - 150; // 向左偏移150px
    const top = 50; // 固定在上方，距顶部50px
    
    uctx.save();
    roundRect(uctx, left, top, w, h, 14);
    
    // 调整面板样式，使其更明显，不被覆盖
    uctx.fillStyle = 'rgba(12,18,28,0.95)'; // 更不透明的背景，确保清晰可见
    uctx.fill();
    uctx.strokeStyle = 'rgba(255,255,255,0.15)'; // 更明显的边框
    uctx.lineWidth = 1;
    uctx.stroke();
    
    const btns = [
      {id:'pen', x:left + 18, y:top + 10, w:80, h:90, label:'笔', color:selectedToolRef.current.id==='pen' ? selectedToolRef.current.color : '#60a5fa', sel:selectedToolRef.current.id==='pen'},
      {id:'eraser', x:left + 18 + 96, y:top + 10, w:80, h:90, label:'橡皮', color:'#f97316', sel:selectedToolRef.current.id==='eraser'},
      {id:'settings', x:left + 18 + 192, y:top + 10, w:120, h:90, label:'随机', color:'#ffffff', sel:selectedToolRef.current.id==='settings'}
    ];
    
    for(const b of btns) {
      uctx.save();
      roundRect(uctx, b.x, b.y, b.w, b.h, 10);
      uctx.fillStyle = b.sel ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.08)'; // 更明显的按钮背景
      uctx.fill();
      if(b.sel) {
        uctx.shadowColor = 'rgba(96,165,250,0.4)'; // 更明显的选中效果
        uctx.shadowBlur = 25;
      }
      uctx.strokeStyle = 'rgba(255,255,255,0.15)'; // 更明显的按钮边框
      uctx.stroke();
      uctx.beginPath();
      uctx.arc(b.x + b.w / 2, b.y + 28, 18, 0, Math.PI * 2);
      uctx.fillStyle = b.color;
      uctx.fill();
      uctx.fillStyle = '#ffffff'; // 白色文字，更清晰
      uctx.font = '14px system-ui, sans-serif'; // 稍大的字体
      uctx.textAlign = 'center';
      uctx.fillText(b.label, b.x + b.w / 2, b.y + 76);
      uctx.restore();
    }
    
    uctx.restore();
  };
  
  // 在 UI canvas 上绘制手部关键点（视觉坐标）
  const drawHandOverlay = (landmarks: any) => {
    const uctx = uctxRef.current;
    if(!uctx) return;
    
    uctx.save();
    uctx.lineWidth = 2;
    uctx.strokeStyle = 'rgba(255,255,255,0.06)';
    uctx.fillStyle = 'rgba(96,165,250,0.18)';
    for(let i = 0; i < landmarks.length; i++) {
      const p = toScreen(landmarks[i], {forUI: true});
      uctx.beginPath();
      uctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      uctx.fill();
      uctx.stroke();
    }
    uctx.restore();
  };
  
  // 渲染主循环
  const render = () => {
    const uctx = uctxRef.current;
    const dctx = dctxRef.current;
    const uiCanvas = uiCanvasRef.current;
    const drawCanvas = drawCanvasRef.current;
    if(!uctx || !dctx || !uiCanvas || !drawCanvas) return;
    
    // UI canvas 清空（UI 不镜像）
    uctx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    
    // 绘制面板（if showPanel）
    if(showPanelRef.current) {
      drawPanel();
    }
    
    // drawCanvas (其 ctx 已被设置为镜像 transform)
    dctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    
    // 绘制已保存 strokes
    for(const s of strokesRef.current) {
      if(s.type === 'pen') {
        dctx.beginPath();
        for(let j = 0; j < s.points.length; j++) {
          const p = s.points[j];
          if(j === 0) dctx.moveTo(p.x, p.y);
          else dctx.lineTo(p.x, p.y);
        }
        dctx.strokeStyle = s.color;
        dctx.lineWidth = s.size;
        dctx.stroke();
      } else {
        dctx.globalCompositeOperation = 'destination-out';
        dctx.beginPath();
        for(let j = 0; j < s.points.length; j++) {
          const p = s.points[j];
          if(j === 0) dctx.moveTo(p.x, p.y);
          else dctx.lineTo(p.x, p.y);
        }
        dctx.lineWidth = s.size;
        dctx.stroke();
        dctx.globalCompositeOperation = 'source-over';
      }
    }
    
    // 当前 stroke - 支持双手同时绘制
    if(currentStrokeRef.current) {
      for(const handIndex in currentStrokeRef.current) {
        const s = currentStrokeRef.current[handIndex];
        if(s.type === 'pen') {
          dctx.beginPath();
          for(let j = 0; j < s.points.length; j++) {
            const p = s.points[j];
            if(j === 0) dctx.moveTo(p.x, p.y);
            else dctx.lineTo(p.x, p.y);
          }
          dctx.strokeStyle = s.color;
          dctx.lineWidth = s.size;
          dctx.stroke();
        } else {
          dctx.globalCompositeOperation = 'destination-out';
          dctx.beginPath();
          for(let j = 0; j < s.points.length; j++) {
            const p = s.points[j];
            if(j === 0) dctx.moveTo(p.x, p.y);
            else dctx.lineTo(p.x, p.y);
          }
          dctx.lineWidth = s.size;
          dctx.stroke();
          dctx.globalCompositeOperation = 'source-over';
        }
      }
    }
    
    // 粒子动画
    const now = performance.now();
    for(let i = particlesRef.current.length - 1; i >= 0; i--) {
      const pt = particlesRef.current[i];
      const age = now - pt.born;
      if(age > pt.life) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.01;
      pt.alpha = 1 - (age / pt.life);
      dctx.globalAlpha = pt.alpha;
      dctx.beginPath();
      dctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      dctx.fillStyle = pt.color;
      dctx.fill();
      dctx.globalAlpha = 1;
    }
    
    // 在 UI canvas 上绘制手部关键点（视觉坐标）
    if(lastHandsRef.current.length > 0) {
      for(const h of lastHandsRef.current) {
        drawHandOverlay(h);
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(render);
  };
  
  // 切换背景模式
  const toggleCameraBackgroundMode = () => {
    cameraBackgroundModeRef.current = !cameraBackgroundModeRef.current;
    const inputVideo = inputVideoRef.current;
    const previewEl = previewElRef.current;
    const container = document.querySelector('div[style*="position: fixed"]') as HTMLElement;
    
    if(inputVideo) {
      if(cameraBackgroundModeRef.current) {
        // 将主摄像头 video 拉到容器背景（全屏）
        inputVideo.style.left = '0';
        inputVideo.style.top = '0';
        inputVideo.style.right = 'auto';
        inputVideo.style.width = container ? '100%' : '240px';
        inputVideo.style.height = container ? '100%' : '135px';
        inputVideo.style.borderRadius = '0';
        inputVideo.style.boxShadow = 'none';
        inputVideo.style.zIndex = '0';
        inputVideo.style.opacity = '0.95';
      } else {
        // 恢复到小预览模式
        inputVideo.style.right = '1rem';
        inputVideo.style.top = '1rem';
        inputVideo.style.left = 'auto';
        inputVideo.style.width = '240px';
        inputVideo.style.height = '135px';
        inputVideo.style.borderRadius = '12px';
        inputVideo.style.boxShadow = '0 8px 30px rgba(2,6,23,0.7)';
        inputVideo.style.zIndex = '60';
        inputVideo.style.opacity = '0.9';
      }
    }
    
    if(previewEl) {
      previewEl.style.display = cameraBackgroundModeRef.current ? 'none' : 'flex';
    }
  };
  
  // 确保 previewVideo 与 inputVideo 使用相同 stream
  const ensurePreviewStream = () => {
    try {
      const inputVideo = inputVideoRef.current;
      const previewVideo = previewVideoRef.current;
      
      if(inputVideo?.srcObject && previewVideo && !previewVideo.srcObject) {
        previewVideo.srcObject = inputVideo.srcObject;
        previewVideo.play().catch(()=>{});
      }
    } catch(e) {
      console.warn('无法同步预览视频流：', e);
    }
  };
  
  // 预览窗交互：拖动、缩放、单击切换背景模式
  const setupPreview = () => {
    // 元素
    const el = previewElRef.current;
    const resizer = previewResizerRef.current;
    if(!el || !resizer) return;
    
    let dragging = false, resizing = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0, startW = 0, startH = 0;
    
    // 使用 style.left/top/right to position. We'll use right/top for initial but transform to left/top when dragging first begins for simplicity
    const ensurePositioning = () => {
      const cs = getComputedStyle(el);
      if(cs.right !== 'auto') {
        // convert right/top to left/top
        const right = parseFloat(cs.right);
        const top = parseFloat(cs.top);
        el.style.left = (window.innerWidth - right - el.offsetWidth) + 'px';
        el.style.top = top + 'px';
        el.style.right = 'auto';
      }
    };
    ensurePositioning();
    
    // 拖动
    el.addEventListener('pointerdown', (e) => {
      if(e.target === resizer) return; // resize handled separately
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      el.setPointerCapture(e.pointerId);
    });
    
    window.addEventListener('pointermove', (e) => {
      if(dragging) {
        const dx = e.clientX - startX, dy = e.clientY - startY;
        let nx = startLeft + dx, ny = startTop + dy;
        // 边界限制
        nx = Math.max(6, Math.min(nx, window.innerWidth - el.offsetWidth - 6));
        ny = Math.max(6, Math.min(ny, window.innerHeight - el.offsetHeight - 6));
        el.style.left = nx + 'px';
        el.style.top = ny + 'px';
      } else if(resizing) {
        const dx = e.clientX - startX, dy = e.clientY - startY;
        let nw = Math.max(100, Math.min(startW + dx, window.innerWidth - startLeft - 6));
        let nh = Math.max(64, Math.min(startH + dy, window.innerHeight - startTop - 6));
        el.style.width = nw + 'px';
        el.style.height = nh + 'px';
      }
    });
    
    window.addEventListener('pointerup', (e) => {
      if(dragging) {
        dragging = false;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch(err) {}
      }
      if(resizing) {
        resizing = false;
        try {
          resizer.releasePointerCapture(e.pointerId);
        } catch(err) {}
      }
    });
    
    // resize
    resizer.addEventListener('pointerdown', (e) => {
      resizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      startW = rect.width;
      startH = rect.height;
      resizer.setPointerCapture(e.pointerId);
      e.stopPropagation();
    });
    
    // 单击切换背景（click）
    el.addEventListener('click', (e) => {
      // 轻点 (不在拖动时) 切换模式
      if(!dragging && !resizing) {
        toggleCameraBackgroundMode();
      }
    });
  };
  
  // 键盘快捷（调试）
  const handleKeyDown = (e: KeyboardEvent) => {
    if(e.key === 'c') triggerDissolve();
    if(e.key === 'r') {
      strokesRef.current = [];
    currentStrokeRef.current = {}; // 重置为对象，支持双手绘画
      particlesRef.current = [];
    }
  };
  
  // 初始化和清理
  useEffect(() => {
    // 加载 MediaPipe 脚本
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
    script1.async = true;
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
    script2.async = true;
    
    const script3 = document.createElement('script');
    script3.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js';
    script3.async = true;
    
    document.body.appendChild(script1);
    document.body.appendChild(script2);
    document.body.appendChild(script3);
    
    // 等待脚本加载完成后初始化
    const timer = setTimeout(() => {
      initMediaPipe();
    }, 1000);
    
    // 设置画布上下文
    const drawCanvas = drawCanvasRef.current;
    const uiCanvas = uiCanvasRef.current;
    
    if(drawCanvas && uiCanvas) {
      const dctx = drawCanvas.getContext('2d');
      const uctx = uiCanvas.getContext('2d');
      
      if(dctx && uctx) {
        dctxRef.current = dctx;
        uctxRef.current = uctx;
        fitCanvasSize(drawCanvas, dctx, true);
        fitCanvasSize(uiCanvas, uctx, false);
        
        // 启动渲染循环
        render();
        
        // 处理窗口大小变化
        const handleResize = () => {
          fitCanvasSize(drawCanvas, dctx, true);
          fitCanvasSize(uiCanvas, uctx, false);
          panelBoundsRef.current = [];
        };
        window.addEventListener('resize', handleResize);
        
        // 设置预览交互
        setupPreview();
        
        // 键盘事件监听
        window.addEventListener('keydown', handleKeyDown);
        
        // 确保预览视频流
        setTimeout(ensurePreviewStream, 800);
        
        // 视频加载事件
        const inputVideo = inputVideoRef.current;
        if(inputVideo) {
          inputVideo.addEventListener('loadeddata', ensurePreviewStream);
          inputVideo.addEventListener('play', ensurePreviewStream);
        }
        
        return () => {
          window.removeEventListener('resize', handleResize);
          window.removeEventListener('keydown', handleKeyDown);
          cancelAnimationFrame(animationFrameRef.current);
          
          // 停止摄像头
          if(cameraRef.current) {
            cameraRef.current.stop();
          }
          
          // 移除视频事件监听
          if(inputVideo) {
            inputVideo.removeEventListener('loadeddata', ensurePreviewStream);
            inputVideo.removeEventListener('play', ensurePreviewStream);
          }
        };
      }
    }
    
    return () => {
      clearTimeout(timer);
      document.body.removeChild(script1);
      document.body.removeChild(script2);
      document.body.removeChild(script3);
    };
  }, []);
  
  return (
    <div style={{position: 'fixed', left: '5%', right: '5%', top: '10%', bottom: '5%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #071027 0%, #0b1220 60%)', color: '#e6eef8', overflow: 'hidden', boxSizing: 'border-box', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', zIndex: 10}}>
      {/* 主摄像头（用于 MediaPipe / 备用预览） */}
      <video
        ref={inputVideoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'absolute',
          right: '1rem',
          top: '1rem',
          width: '240px',
          height: '135px',
          borderRadius: '12px',
          objectFit: 'cover',
          boxShadow: '0 8px 30px rgba(2,6,23,0.7)',
          border: '1px solid rgba(255,255,255,0.03)',
          zIndex: '60',
          opacity: '0.9',
          transform: 'scaleX(-1)',
          transition: 'all 280ms ease'
        }}
      />
      
      {/* 绘图与 UI 两个 canvas（draw 镜像由 context transform 实现；ui 不镜像） */}
      <canvas
        ref={drawCanvasRef}
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          zIndex: '30',
          pointerEvents: 'none'
        }}
      />
      <canvas
        ref={uiCanvasRef}
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          width: '100%',
          height: '100%',
          zIndex: '100', // 提高z-index，确保控制面板显示在最上面
          pointerEvents: 'none'
        }}
      />
      
      <div style={{position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8', fontSize: '13px', zIndex: '80'}}>隔空写字 · 手势控制（MediaPipe Hands）</div>
      <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '1.8rem', color: '#94a3b8', fontSize: '13px', zIndex: '80', textAlign: 'center', maxWidth: '70%'}}>张开掌心呼出面板 · 食指点选 · 拇指+食指捏合写字 · 张开捏合手指消散</div>
      <footer style={{position: 'absolute', right: '1rem', bottom: '1rem', color: '#94a3b8', fontSize: '12px', zIndex: '80'}}>单文件示例 — 允许摄像头权限后生效</footer>
      
      {/* 真实 DOM 预览窗（可拖动、缩放、点击切换背景模式）*/}
      <div
        ref={previewElRef}
        style={{
          position: 'absolute',
          right: '1rem',
          top: '1rem',
          width: '240px',
          height: '135px',
          zIndex: '70',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12))',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'box-shadow 120ms ease'
        }}
        title="点击切换背景 | 拖动移动 | 右下角拖拽缩放"
      >
        {/* 预览视频与主 video 使用同一视频流（赋值后） */}
        <video
          ref={previewVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)'
          }}
        />
        <div
          ref={previewResizerRef}
          style={{
            position: 'absolute',
            right: '6px',
            bottom: '6px',
            width: '14px',
            height: '14px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '3px',
            cursor: 'se-resize',
            zIndex: '80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="拖动调整大小"
        >
          <div style={{width: '8px', height: '8px', borderRight: '2px solid rgba(255,255,255,0.28)', borderBottom: '2px solid rgba(255,255,255,0.28)', transform: 'rotate(45deg)'}} />
        </div>
      </div>
    </div>
  );
};

export default CameraGestureDrawing;