"use client";

import React, { useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';

const CameraGestureDrawing = () => {
  const { t } = useI18n();
  // DOM 元素引用
  const inputVideoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const previewElRef = useRef<HTMLDivElement>(null);
  const previewResizerRef = useRef<HTMLDivElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const uiCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 内部状态（使用 useRef 避免不必要的重渲染）
  const dctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const uctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const cameraBackgroundModeRef = useRef(false);
  const showPanelRef = useRef(false);
  const panelBoundsRef = useRef<Array<any>>([]);
  const toolsRef = useRef([
    {id:'pen', color:'#60a5fa', size:6},
    {id:'eraser', color:'#000000', size:36},
    {id:'settings', color:'#ffffff', size:8},
    {id:'background', color:'#34d399', size:8}
  ]);
  const selectedToolRef = useRef({...toolsRef.current[0]});
  const strokesRef = useRef<Array<any>>([]);
  const currentStrokeRef = useRef<{[key: number]: any}>({}); // 支持双手绘画，key为手的索引
  const lastHandsRef = useRef<Array<any>>([]);
  const gestureStateRef = useRef({scaling:false, startDist:0, startScale:1});
  const particlesRef = useRef<Array<any>>([]);
  const kiBlastsRef = useRef<Array<{
    x: number;
    y: number;
    size: number;
    startTime: number;
    maxLifeTime: number;
    alpha: number;
    explosionStage: 'exploding' | 'fading';
    currentExplosionSize: number;
  }>>([]);
  const previousHandsRef = useRef<Array<any>>([]); // 用于存储上一帧的手部地标点，检测手势方向
  const lastPanelToggleTimeRef = useRef(0);
  const lastDissolveTimeRef = useRef(0); // 消散手势的防抖时间
  const lastSnapTimeRef = useRef(0); // 响指手势的防抖时间
  const fireActiveRef = useRef(false); // 火焰是否处于激活状态
  const fireStartTimeRef = useRef(0); // 火焰开始时间
  const fireToolActiveRef = useRef(false); // 火焰工具是否开启
  const kiBlastToolActiveRef = useRef(false); // 爆炸效果工具是否开启
  const lightningToolActiveRef = useRef(false); // 闪电效果工具是否开启
  const kiBlastChargingRef = useRef(false); // 是否正在聚集爆炸能量
  const kiBlastSizeRef = useRef(0); // 爆炸能量球大小
  const kiBlastChargeStartTimeRef = useRef(0); // 聚集能量开始时间
  const selectedStrokesRef = useRef<Array<number>>([]);
  // MediaPipe 初始化防重复 & 重试计数
  const initializedRef = useRef(false);
  const mediaPipeRetryRef = useRef(0);
  
  // I18n 引用：用于在渲染循环中获取最新的 t，避免首次渲染时文本为空
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  // MediaPipe 相关引用
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  
  // 初始化 MediaPipe Hands
  const initMediaPipe = () => {
    if (typeof window === 'undefined') return;
    // 已成功初始化则直接返回，避免重复创建 Hands / Camera
    if (initializedRef.current) return;
    
    // 检查 MediaPipe Hands 和 Camera 是否已加载；未就绪时进行有限次数重试
    const hasHands = 'Hands' in window;
    const hasCamera = 'Camera' in window;
    if (!hasHands || !hasCamera) {
      const MAX_RETRY = 20; // 最多重试约 20 次（配合 300ms 间隔，约 6 秒）
      if (mediaPipeRetryRef.current >= MAX_RETRY) {
        console.warn('MediaPipe Hands or Camera not available after retries');
        return;
      }
      mediaPipeRetryRef.current += 1;
      setTimeout(initMediaPipe, 300);
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
      initializedRef.current = true;
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
  
  const isFistGesture = (landmarks: Array<any>) => {
    const s = fingersStatus(landmarks);
    // 握拳：所有手指都弯曲
    return !s.thumb && !s.index && !s.middle && !s.ring && !s.pinky;
  };

  const isOpenHandGesture = (landmarks: Array<any>) => {
    const s = fingersStatus(landmarks);
    // 张开手：手指稍微张开即可触发爆炸，食指和中指伸直就足够
    return (s.index || s.middle) && !(isFistGesture(landmarks));
  };

  const isPinch = (landmarks: Array<any>) => {
    const dx = landmarks[8].x - landmarks[4].x;
    const dy = landmarks[8].y - landmarks[4].y;
    return Math.hypot(dx, dy) < 0.05;
  };
  
  const isSnapGesture = (landmarks: Array<any>) => {
    // 响指手势检测：拇指和中指指尖距离很近
    const dx = landmarks[4].x - landmarks[12].x;
    const dy = landmarks[4].y - landmarks[12].y;
    return Math.hypot(dx, dy) < 0.04;
  };
  

  const isSixGesture = (landmarks: Array<any>) => {
    const s = fingersStatus(landmarks);
    // 比六手势：只伸出拇指和小拇指
    return s.thumb && s.pinky && !s.index && !s.middle && !s.ring;
  };
  
  // 坐标映射：forUI=true -> 返回视觉坐标用于 UI 点击检测
  // forUI=false -> 返回原始屏幕坐标（用于绘图，配合 drawCanvas 的镜像 transform）
  const toScreen = (pt: any, options: {forUI?: boolean} = {forUI: false}) => {
    // 恢复使用窗口尺寸（这是你从卡片进入时一直觉得“手感正确”的坐标系）
    const w = window.innerWidth, h = window.innerHeight;
    
    // 优化基础偏移量，调整为更精确的值以匹配实际手部位置
    const baseOffsetY = -0.05; // y方向向上偏移，略微减少偏移量以提高准确性
    
    if(options.forUI) {
      // 无论是否处于摄像头背景模式，视频始终是镜像的，所以UI点击检测始终需要 (1 - pt.x)
      // UI模式使用默认的x偏移
      const uiOffsetX = -0.05; // 调整为更精确的偏移值
      return { 
        x: (1 - pt.x + uiOffsetX) * w, 
        y: (pt.y + baseOffsetY) * h 
      };
    } else {
      // 根据是否处于摄像头背景模式选择不同的x偏移量
      let xOffset;
      if (cameraBackgroundModeRef.current) {
        // 摄像头背景模式下使用更精确的偏移量
        xOffset = -0.05; // 统一偏移值以提高一致性
        // 在摄像头背景模式下，使用镜像坐标 + 偏移
        return { 
          x: (1 - pt.x + xOffset) * w, 
          y: (pt.y + baseOffsetY) * h 
        };
      } else {
        // 非摄像头背景模式下使用相同的偏移量以保持一致性
        xOffset = -0.05; // 统一偏移值以提高一致性
        // 非摄像头背景模式下，使用原始坐标 + 偏移
        return { 
          x: (pt.x + xOffset) * w, 
          y: (pt.y + baseOffsetY) * h 
        };
      }
    }
  };
  
  // MediaPipe onResults 入口
  const onHandsResults = (results: any) => {
    lastHandsRef.current = results.multiHandLandmarks || [];
    
    // 定义手势变量，用于检测冲突
    let hasPalmOpen = false;
    let hasSixGesture = false;
    let hasPinch = false;
    let hasSnapGesture = false;
    let hasPointingGesture = false;
    let hasFistGesture = false;
    let hasOpenHandGesture = false;
    
    // 1. 先检测是否有响指手势（用于触发火焰效果）
    if(lastHandsRef.current.length > 0) {
      // 检查响指手势的防抖
      const now = performance.now();
      for(const h of lastHandsRef.current) {
        if(isPointingIndex(h)) {
          // 只有当火焰工具开启时，才响应食指手势
          if(fireToolActiveRef.current && now - lastSnapTimeRef.current > 1000) { // 1秒防抖
            hasSnapGesture = true;
            // 使用食指指尖坐标作为火焰效果的中心
            const centerPoint = toScreen(h[8], {forUI: false}); // 食指指尖坐标
            triggerFireEffect(centerPoint.x, centerPoint.y);
            lastSnapTimeRef.current = now;
            break;
          }
        }
      }
    }

    // 2. 检测闪电效果手势
    const now = performance.now();
    
    // 情况1: 单只手的拇指和食指间产生闪电
    if(lastHandsRef.current.length === 1 && lightningToolActiveRef.current) {
      const hand = lastHandsRef.current[0];
      // 获取拇指和食指指尖位置
      const thumbTip = toScreen(hand[4], {forUI: false}); // 拇指指尖 - 关键点4
      const indexTip = toScreen(hand[8], {forUI: false}); // 食指指尖 - 关键点8
      
      // 计算指尖之间的距离
      const distance = Math.sqrt(
        Math.pow(indexTip.x - thumbTip.x, 2) + 
        Math.pow(indexTip.y - thumbTip.y, 2)
      );
      
      // 增大距离阈值到250像素，提高触发频率
      if(distance < 250) {
        // 直接使用拇指和食指指尖坐标，确保闪电连接到指尖位置
      // 根据用户要求，闪电两端必须从食指和大拇指指尖出来
      const startX = thumbTip.x;
      const startY = thumbTip.y;
      const endX = indexTip.x;
      const endY = indexTip.y;
      
      // 使用maxCount=3参数严格控制闪电数量，防止增长到5个
      drawLightningEffect(dctxRef.current!, startX, startY, endX, endY, distance, 3);
      }
    }
    
    // 情况2: 两只手场景
    else if(lastHandsRef.current.length >= 2 && lightningToolActiveRef.current) {
      const hand1 = lastHandsRef.current[0];
      const hand2 = lastHandsRef.current[1];
      
      // 检测是否是握拳只伸食指的情况（检测食指是否伸直，其他手指弯曲）
      const isHand1PointingIndex = isPointingIndex(hand1);
      const isHand2PointingIndex = isPointingIndex(hand2);
      
      if(isHand1PointingIndex && isHand2PointingIndex) {
        // 握拳只伸出食指：两个食指指尖产生闪电
        const indexTip1 = toScreen(hand1[8], {forUI: false}); // 第一只手的食指指尖
        const indexTip2 = toScreen(hand2[8], {forUI: false}); // 第二只手的食指指尖
        
        // 计算距离
        const distance = Math.sqrt(
          Math.pow(indexTip2.x - indexTip1.x, 2) + 
          Math.pow(indexTip2.y - indexTip1.y, 2)
        );
        
        // 限制距离范围
        if(distance > 30 && distance < 2000) {
          // 使用maxCount=2参数限制闪电数量为1-2根
          drawLightningEffect(dctxRef.current!, indexTip1.x, indexTip1.y, indexTip2.x, indexTip2.y, distance, 2);
        }
      } else {
        // 情况3: 两只手张开时的原有闪电效果（闪电数量随时间增加）
        const palm1 = toScreen(hand1[9], {forUI: false}); // 第一只手的掌心位置
        const palm2 = toScreen(hand2[9], {forUI: false}); // 第二只手的掌心位置
        
        // 计算两只手之间的距离和方向
        const dx = palm2.x - palm1.x;
        const dy = palm2.y - palm1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // 计算偏移距离
        const offsetDistance = 30; // 向外偏移30像素
        
        // 计算偏移后的闪电起始点和终点
        const lightningStartX = palm1.x + Math.cos(angle) * offsetDistance;
        const lightningStartY = palm1.y + Math.sin(angle) * offsetDistance;
        const lightningEndX = palm2.x - Math.cos(angle) * offsetDistance;
        const lightningEndY = palm2.y - Math.sin(angle) * offsetDistance;
        
        // 优化闪电效果性能，限制距离范围
      if(distance > 30 && distance < 2000) {
        // 根据用户要求，手掌模式下闪电最多到5个，但保持性能优化
        drawLightningEffect(dctxRef.current!, lightningStartX, lightningStartY, lightningEndX, lightningEndY, distance, 5);
        }
      }
    }
    
    // 3. 检测爆炸效果手势
    if(lastHandsRef.current.length > 0 && kiBlastToolActiveRef.current) {
      const h = lastHandsRef.current[0];
      const now = performance.now();
      
      // 握拳手势：开始/继续聚集能量
      if(isFistGesture(h)) {
        hasFistGesture = true;
        if(!kiBlastChargingRef.current) {
          // 开始聚集
          kiBlastChargingRef.current = true;
          kiBlastChargeStartTimeRef.current = now;
          kiBlastSizeRef.current = 0;
        } else {
          // 继续聚集，增加能量球大小
          const chargeDuration = now - kiBlastChargeStartTimeRef.current;
          // 能量球大小随时间增长，最大100px
          kiBlastSizeRef.current = Math.min(100, chargeDuration / 50);
        }
      } 
      // 张开手手势：触发爆炸
    else if(isOpenHandGesture(h) && kiBlastChargingRef.current) {
        hasOpenHandGesture = true;
        
        // 检测手掌的移动方向（推送动作）
        let angle = Math.PI / 2; // 默认向上
        
        // 如果有上一帧的数据，计算移动方向
        if(previousHandsRef.current.length > 0 && previousHandsRef.current[0]) {
          const prevPalmCenter = previousHandsRef.current[0][9]; // 上一帧的掌心位置
          const currPalmCenter = h[9]; // 当前帧的掌心位置
          
          // 计算移动向量
          const dx = currPalmCenter.x - prevPalmCenter.x;
          const dy = currPalmCenter.y - prevPalmCenter.y;
          
          // 只有当移动足够大时才认为是推送动作
          const moveDistance = Math.sqrt(dx * dx + dy * dy);
          if(moveDistance > 0.05) { // 移动阈值，可调整
            // 计算移动方向的角度
            angle = Math.atan2(dy, dx);
          }
        }
        
        // 触发爆炸
          const palmCenter = toScreen({x: h[9].x, y: h[9].y}, {forUI: false}); // 掌心位置
          triggerKiBlast(palmCenter.x, palmCenter.y, kiBlastSizeRef.current, angle);
        
        // 重置状态
        kiBlastChargingRef.current = false;
        kiBlastSizeRef.current = 0;
      }
      // 其他手势：停止聚集
      else {
        kiBlastChargingRef.current = false;
      }
    }
    
    // 2. 检测是否有消散手势（最高优先级）
    if(lastHandsRef.current.length > 0 && !hasSnapGesture) {
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
      
      // 处理每只手的绘画 - 只有在选中画笔/橡皮擦/随机工具且没有激活火焰或爆炸效果时才能绘画
      if(['pen', 'eraser', 'settings'].includes(selectedToolRef.current.id) && !fireToolActiveRef.current && !kiBlastToolActiveRef.current) {
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
  
  // 添加防抖引用
  const lastToolClickRef = useRef({ id: '', time: 0 });
  
  // 面板指向（使用视觉坐标 forUI=true）
  const handlePanelPointing = (landmarks: any) => {
    // 以浏览器窗口为中心左右居中计算面板边界，与 drawPanel 函数保持一致
    if(panelBoundsRef.current.length === 0) {
      const w = 762; const h = 110; // 与drawPanel保持一致，宽度调整为762px
      const left = (window.innerWidth - w) / 2 - 150; // 与drawPanel保持一致，向左偏移150px
      const top = 50; // 固定在上方，距顶部50px
      panelBoundsRef.current = [
        {id:'pen', x:left + 18, y:top + 10, w:80, h:90},
        {id:'eraser', x:left + 18 + 96, y:top + 10, w:80, h:90},
        {id:'settings', x:left + 18 + 192, y:top + 10, w:80, h:90},
        {id:'background', x:left + 18 + 288, y:top + 10, w:90, h:90},
        {id:'fire', x:left + 18 + 384, y:top + 10, w:90, h:90},
        {id:'kiBlast', x:left + 18 + 480, y:top + 10, w:90, h:90},
        {id:'lightning', x:left + 18 + 576, y:top + 10, w:90, h:90} // 添加闪电按钮
      ];
    }
    const pt = toScreen(landmarks[8], {forUI: true});
    for(const b of panelBoundsRef.current) {
      if(pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h) {
        const now = performance.now();
        // 防抖：同一按钮至少1秒后才能再次点击
        if(b.id !== lastToolClickRef.current.id || now - lastToolClickRef.current.time > 1000) {
          selectTool(b.id);
          lastToolClickRef.current = { id: b.id, time: now };
        }
        break; // 只点击第一个匹配的按钮
      }
    }
  };
  
  const selectTool = (id: string) => {
    if(id === 'background') {
      toggleCameraBackgroundMode();
      return;
    }
    if(id === 'fire') {
    // 火焰效果按钮点击处理
    fireToolActiveRef.current = !fireToolActiveRef.current;
    if(fireToolActiveRef.current) {
      kiBlastToolActiveRef.current = false; // 关闭爆炸效果
      // 如果当前选中的是画笔或橡皮或随机工具，确保它们的功能不会与火焰效果冲突
      if(['pen', 'eraser', 'settings'].includes(selectedToolRef.current.id)) {
        // 不改变selectedToolRef，只需要确保绘画工具不会在火焰/爆炸激活时生效
      }
    } else {
      // 关闭火焰工具时，重置防抖时间戳，避免手指仍在画面中时触发火焰
      lastSnapTimeRef.current = performance.now();
    }
    return;
  }
  if(id === 'kiBlast') {
    // 爆炸效果按钮点击处理
    kiBlastToolActiveRef.current = !kiBlastToolActiveRef.current;
    if(kiBlastToolActiveRef.current) {
      fireToolActiveRef.current = false; // 关闭火焰
      lightningToolActiveRef.current = false; // 关闭闪电
      // 如果当前选中的是画笔或橡皮，取消选中
      if(['pen', 'eraser'].includes(selectedToolRef.current.id)) {
        // 不改变selectedToolRef，只需要确保画笔工具不会在火焰/爆炸激活时生效
      }
    }
    return;
  }
  if(id === 'lightning') {
    // 闪电效果按钮点击处理
    lightningToolActiveRef.current = !lightningToolActiveRef.current;
    if(lightningToolActiveRef.current) {
      fireToolActiveRef.current = false; // 关闭火焰
      kiBlastToolActiveRef.current = false; // 关闭爆炸效果
      // 关闭其他绘画工具的影响
      if(['pen', 'eraser', 'settings'].includes(selectedToolRef.current.id)) {
        // 不改变selectedToolRef，只需要确保绘画工具不会与闪电效果冲突
      }
    }
    return;
  }
    
    const t = toolsRef.current.find((x: any) => x.id === id);
    if(!t) return;
    selectedToolRef.current = t;
    // 选择画笔/橡皮/随机工具时，关闭火焰、爆炸和闪电效果，并重置火焰防抖时间
    if(['pen', 'eraser', 'settings'].includes(id)) {
      fireToolActiveRef.current = false;
      kiBlastToolActiveRef.current = false;
      lightningToolActiveRef.current = false;
      // 关闭火焰工具时，重置防抖时间戳，避免手指仍在画面中时触发火焰
      lastSnapTimeRef.current = performance.now();
    }
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
          alpha: 1,
          type: 'dissolve'
        });
      }
    });
    strokesRef.current = [];
    currentStrokeRef.current = {}; // 重置为对象，支持双手绘画
  };
  
  // 添加闪电效果相关的引用变量
  const lightningStartTimeRef = useRef<number>(0);
  const lastLightningTimeRef = useRef<number>(0);
  const lastBothHandsDetectedRef = useRef<number>(0); // 记录上一次两只手都被检测到的时间
  const lightningActiveRef = useRef<boolean>(false); // 记录闪电效果是否应该保持活跃

  // 绘制闪电效果 - 改为绘制多条闪电
  const drawLightningEffect = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, distance: number = 250, maxCount?: number) => {
    const now = performance.now();
    
    // 如果是第一次调用或上一次调用时间超过500ms，重置开始时间
    if (now - lastLightningTimeRef.current > 500) {
      lightningStartTimeRef.current = now;
    }
    
    // 计算闪电效果持续时间（支持到1分钟）
    const duration = now - lightningStartTimeRef.current;
    lastLightningTimeRef.current = now;
    
    // 优化性能：降低强度因子，减少计算复杂度和渲染负担
    const intensityFactor = 1 + Math.min(1.0, duration / 60000); // 1分钟内从1缓慢增长到2.0，降低增长速度
    
    ctx.save();
    ctx.strokeStyle = '#38bdf8'; // 闪电的主要颜色
    // 根据距离和强度调整线条宽度，降低最大宽度
    ctx.lineWidth = Math.min(5, 1.5 * intensityFactor + Math.min(1, distance / 700)); // 减少线条宽度，降低渲染负载
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // 优化性能：根据用户要求，闪电最多到5条，保持良好性能
    const maxLightningCount = maxCount !== undefined ? Math.min(5, maxCount) : 5; // 限制最大为5条
    
    // 简化增长函数，降低计算复杂度
    const growthRate = Math.min(1, duration / 60000); // 将时间归一化到0-1范围
    // 使用线性增长，简单高效
    const lightningCount = Math.max(1, Math.min(maxLightningCount, Math.floor(growthRate * (maxLightningCount - 1) + 1)));
    // 确保即使在短时间内也至少有1条闪电
    
    // 绘制多条闪电
    for (let l = 0; l < lightningCount; l++) {
      // 减少偏移量范围，降低闪电波动剧烈程度，提高性能
      const offsetX1 = (Math.random() - 0.5) * 30 * intensityFactor; // 从70减少到30，降低波动范围
      const offsetY1 = (Math.random() - 0.5) * 30 * intensityFactor;
      const offsetX2 = (Math.random() - 0.5) * 30 * intensityFactor;
      const offsetY2 = (Math.random() - 0.5) * 30 * intensityFactor;
      
      // 降低平稳度因子的最大值，使闪电更加稳定
      const stabilityFactor = 0.1 + (distance - 30) / (1000 - 30) * 1.0; // 最大值从2.3减少到1.1
      
      // 缩小随机性范围，降低计算复杂度
      const randomFactor = 0.9 + Math.random() * 0.2; // 从0.7-1.3缩小到0.9-1.1
      
      // 大幅增加displacement，显著提高闪电的扭曲程度
      // 降低displacement值，减少闪电扭曲程度，提高性能
      const displacement = 0.3 * intensityFactor * randomFactor * stabilityFactor; // 从0.5降低到0.3
      
      // 减少segments数量，降低计算复杂度
      const segments = Math.min(8, Math.floor(4 + (stabilityFactor - 0.1) * 5 * intensityFactor * randomFactor)); // 从最大12减少到最大8，最低4
      
      // 创建闪电的主路径
      const path = createLightningPath(
        x1 + offsetX1,
        y1 + offsetY1,
        x2 + offsetX2,
        y2 + offsetY2,
        segments,
        displacement
      );
      
      // 简化脉动因子计算，降低频率
      const pulseFactor = 0.95 + 0.05 * Math.sin(now * 0.004);
      
      // 降低亮度计算复杂度
      const baseBrightness = Math.min(1.0, 0.8 + duration / 120000); // 降低初始亮度和增长速度
      
      // 降低随机性，减少计算量
      const lightningBrightness = baseBrightness * (1.0 + Math.random() * 0.2); // 减少随机性范围
      const lightningPulseFactor = pulseFactor * (1.0 + Math.random() * 0.1); // 降低闪烁效果复杂度
      
      // 简化渐变效果，降低计算复杂度
      const gradient = ctx.createLinearGradient(path[0][0], path[0][1], path[path.length-1][0], path[path.length-1][1]);
      gradient.addColorStop(0, `rgba(125, 211, 252, ${0.8 * lightningBrightness})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * lightningBrightness * lightningPulseFactor})`);
      gradient.addColorStop(1, `rgba(56, 189, 248, ${0.8 * lightningBrightness})`);
      
      // 降低线宽，减少渲染负担
      const currentLineWidth = Math.min(4, 2 * intensityFactor * randomFactor);
      ctx.lineWidth = currentLineWidth;
      
      // 绘制主闪电
      ctx.strokeStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
      
      // 添加内部更亮的闪电核心
      ctx.globalAlpha = 0.5 * lightningPulseFactor;
      ctx.strokeStyle = `rgba(255, 255, 255, ${lightningBrightness})`;
      ctx.lineWidth = Math.min(2, currentLineWidth * 0.3);
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
      ctx.globalAlpha = 1; // 重置透明度
      
      // 绘制较弱的分支闪电 - 减少分支数量和复杂度
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = Math.min(3, 1.2 * intensityFactor * randomFactor); // 减少分支线宽
      
      // 为主路径上的每个点尝试创建分支 - 直接内联实现
      for (let i = 1; i < path.length - 1; i++) {
        // 随机决定是否在该点创建分支
        if (Math.random() > 0.6) { // 降低到40%的概率产生分支
          // 基于时间和强度计算分支参数
          const branchSegments = Math.min(2, Math.floor(1.5 * intensityFactor)); // 减少分支段数
          const branchDisplacement = 0.2 * intensityFactor * randomFactor; // 降低分支位移
          const branchLengthFactor = 0.3 + Math.random() * 0.15; // 缩短分支长度
          
          // 创建分支路径
          const branchPath = createLightningBranch(
            path[i][0], path[i][1], 
            path[i+1][0], path[i+1][1], 
            branchSegments, 
            branchDisplacement, 
            branchLengthFactor
          );
          
          // 确保分支路径有效
          if (branchPath && branchPath.length > 0) {
            // 为分支创建渐变效果
            const branchGradient = ctx.createLinearGradient(
              branchPath[0][0], branchPath[0][1], 
              branchPath[branchPath.length-1][0], branchPath[branchPath.length-1][1]
            );
            
            // 设置分支颜色
            const branchBrightness = lightningBrightness * (0.8 + Math.random() * 0.2) * lightningPulseFactor;
            branchGradient.addColorStop(0, `rgba(125, 211, 252, ${0.7 * branchBrightness})`);
            branchGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.9 * branchBrightness})`);
            branchGradient.addColorStop(1, `rgba(125, 211, 252, ${0.7 * branchBrightness})`);
            
            // 绘制分支
            ctx.strokeStyle = branchGradient;
            ctx.beginPath();
            ctx.moveTo(branchPath[0][0], branchPath[0][1]);
            for (let j = 1; j < branchPath.length; j++) {
              ctx.lineTo(branchPath[j][0], branchPath[j][1]);
            }
            ctx.stroke();
          }
        }
      }
    
    // 绘制额外的闪电分支（这里简化实现，避免重复定义）
    // 每个闪电已经在内部循环中生成了自己的分支，这里不再需要额外处理
    
      // 添加多层次辉光效果 - 降低强度增长速度
      // 1. 内圈强光 - 降低亮度和范围增长
      ctx.save();
      ctx.globalAlpha = 0.6 * baseBrightness * pulseFactor * (0.8 + Math.random() * 0.2); // 降低透明度
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = Math.min(30, 15 * intensityFactor); // 降低阴影模糊度增长
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.min(4, 1.8 * intensityFactor * randomFactor); // 降低线宽增长
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
      ctx.restore();
      
      // 2. 外圈蓝色辉光 - 降低亮度和扩散范围增长
      ctx.save();
      ctx.globalAlpha = 0.4 * baseBrightness * (0.8 + Math.random() * 0.2); // 降低透明度
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = Math.min(45, 20 * intensityFactor); // 降低阴影模糊度增长
      ctx.strokeStyle = 'transparent'; // 只显示阴影产生的辉光
      ctx.lineWidth = Math.min(5, 2 * intensityFactor * randomFactor); // 降低线宽增长
      ctx.beginPath();
      ctx.moveTo(path[0][0], path[0][1]);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i][0], path[i][1]);
      }
      ctx.stroke();
      ctx.restore();
      
      // 3. 超外圈扩散辉光 - 仅在高强度时显示
      if (intensityFactor > 1.5) {
        ctx.save();
        ctx.globalAlpha = 0.2 * baseBrightness * (0.7 + Math.random() * 0.3);
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = Math.min(60, 35 * intensityFactor);
        ctx.strokeStyle = 'transparent';
        ctx.lineWidth = Math.min(8, 4 * intensityFactor * randomFactor);
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i][0], path[i][1]);
        }
        ctx.stroke();
        ctx.restore();
      }
    } // 结束闪电循环
    
    ctx.restore();
  };
  
  // 创建闪电主路径
  const createLightningPath = (x1: number, y1: number, x2: number, y2: number, segments: number, displacement: number): number[][] => {
    const path: number[][] = [[x1, y1]];
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // 使用递归细分创建闪电的锯齿状效果
    subdividePath(path, x1, y1, x2, y2, segments, displacement);
    
    path.push([x2, y2]);
    return path;
  };
  
  // 细分路径创建闪电效果
  const subdividePath = (path: number[][], x1: number, y1: number, x2: number, y2: number, segments: number, displacement: number) => {
    if (segments === 0) return;
    
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    
    // 在垂直于线段的方向上添加随机偏移
    const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    // 大幅增加波动幅度系数，从原来的1倍增加到1.8倍，使闪电形状更加扭曲
    const offset = (Math.random() - 0.5) * displacement * Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) * 1.8;
    
    const mxOffset = mx + Math.cos(angle) * offset;
    const myOffset = my + Math.sin(angle) * offset;
    
    // 减少衰减系数，从0.6改为0.75，使波动幅度在更深层的细分中保持较大值
    subdividePath(path, x1, y1, mxOffset, myOffset, segments - 1, displacement * 0.75);
    path.push([mxOffset, myOffset]);
    subdividePath(path, mxOffset, myOffset, x2, y2, segments - 1, displacement * 0.75);
  };
  
  // 创建闪电分支 - 优化分支参数以增加闪电复杂度
  const createLightningBranch = (x1: number, y1: number, x2: number, y2: number, segments: number, displacement: number, lengthFactor: number = 0.7): number[][] => {
    // 计算主线段的角度
    const mainAngle = Math.atan2(y2 - y1, x2 - x1);
    // 大幅增加分支角度范围，从30-75度扩大到20-100度，使闪电分支更加多样
    const branchAngle = mainAngle + (Math.random() * Math.PI / 1.8 - Math.PI / 3.6);
    
    // 增加分支长度范围和基数，使分支更长更明显
    const mainLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const branchLength = mainLength * (0.4 + Math.random() * 0.6) * lengthFactor;
    
    // 计算分支的终点
    const endX = x1 + Math.cos(branchAngle) * branchLength;
    const endY = y1 + Math.sin(branchAngle) * branchLength;
    
    // 创建分支路径 - 增加波动幅度使分支更加扭曲
    const branchPath: number[][] = [[x1, y1]];
    // 使用更大的displacement参数增加分支的波动幅度
    subdividePath(branchPath, x1, y1, endX, endY, segments, displacement * 1.3);
    branchPath.push([endX, endY]);
    
    return branchPath;
  };

  const triggerFireEffect = (x: number, y: number) => {
    // 触发火焰粒子效果
    const fireColors = [
      '#ff4500', '#ff6b35', '#f7931e', '#ffd23f', '#ffeb3b', '#ffffff'
    ];
    
    for(let i = 0; i < 200; i++) {
      const size = 5 + Math.random() * 10;
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -1 - Math.random() * 3.0, // 火焰向上
        life: 2000 + Math.random() * 1500,
        born: performance.now(),
        color: fireColors[Math.floor(Math.random() * fireColors.length)],
        alpha: 1,
        type: 'fire',
        size: size,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15
      });
    }
    
    // 设置火焰激活状态，启动持续生成逻辑
    fireActiveRef.current = true;
    fireStartTimeRef.current = performance.now();
  };

  // 能量球爆炸效果 - 手掌张开时能量球爆炸
  const triggerKiBlast = (x: number, y: number, size: number, angle: number) => {
    // 添加新的能量球爆炸效果
    kiBlastsRef.current.push({
      x: x, // 爆炸中心点X
      y: y, // 爆炸中心点Y
      size: size, // 能量球原始大小
      startTime: performance.now(),
      maxLifeTime: 2000, // 2秒后自动结束
      alpha: 1,
      explosionStage: 'exploding', // 初始为爆炸阶段
      currentExplosionSize: size // 初始爆炸大小与能量球大小一致
    });
    
    // 同时添加大量爆炸粒子效果增强视觉
    const blastColors = [
      '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#e0f2fe', '#ffffff'
    ];
    
    // 向所有方向发射的粒子
    for(let i = 0; i < 100; i++) {
      const randomAngle = Math.random() * Math.PI * 2;
      const randomSpeed = 3 + Math.random() * 7;
      particlesRef.current.push({
        x: x,
        y: y,
        vx: Math.cos(randomAngle) * randomSpeed,
        vy: Math.sin(randomAngle) * randomSpeed,
        life: 800 + Math.random() * 400,
        born: performance.now(),
        color: blastColors[Math.floor(Math.random() * blastColors.length)],
        alpha: 1,
        type: 'explosion',
        size: 2 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    }
  };
  
  // 适应画布尺寸
  const fitCanvasSize = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D | null, mirror: boolean = false) => {
    const ratio = window.devicePixelRatio || 1;
    const container = containerRef.current;
    const width = container ? container.clientWidth : window.innerWidth;
    const height = container ? container.clientHeight : window.innerHeight;
    
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    if(ctx) {
      // 检查是否是drawCanvas并且当前是摄像头背景模式
      const isDrawCanvas = canvas === drawCanvasRef.current;
      const isCameraBackground = cameraBackgroundModeRef.current;
      
      // 在摄像头背景模式下，取消drawCanvas的镜像变换，因为视频已经是镜像的了
      // 这避免了双重镜像导致的线条偏移问题
      const shouldMirror = mirror && !(isDrawCanvas && isCameraBackground);
      
      if(shouldMirror) {
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
    
    // 调整面板位置，适应七个按钮
  const w = 762; const h = 110;
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
      {id:'pen', x:left + 18, y:top + 10, w:80, h:90, label:tRef.current('cameraGestureDrawingPage.pen'), color:selectedToolRef.current.id==='pen' ? selectedToolRef.current.color : '#60a5fa', sel:selectedToolRef.current.id==='pen'},
      {id:'eraser', x:left + 18 + 96, y:top + 10, w:80, h:90, label:tRef.current('cameraGestureDrawingPage.eraser'), color:'#f97316', sel:selectedToolRef.current.id==='eraser'},
      {id:'settings', x:left + 18 + 192, y:top + 10, w:80, h:90, label:tRef.current('cameraGestureDrawingPage.settings'), color:'#ffffff', sel:selectedToolRef.current.id==='settings'},
      {id:'background', x:left + 18 + 288, y:top + 10, w:90, h:90, label:tRef.current('cameraGestureDrawingPage.background'), color:cameraBackgroundModeRef.current ? '#34d399' : '#94a3b8', sel:false},
      {id:'fire', x:left + 18 + 384, y:top + 10, w:90, h:90, label:tRef.current('cameraGestureDrawingPage.fire'), color:fireToolActiveRef.current ? '#f97316' : '#f59e0b', sel:fireToolActiveRef.current},
      {id:'kiBlast', x:left + 18 + 480, y:top + 10, w:90, h:90, label:tRef.current('cameraGestureDrawingPage.kiBlast'), color:kiBlastToolActiveRef.current ? '#8b5cf6' : '#6366f1', sel:kiBlastToolActiveRef.current},
      {id:'lightning', x:left + 18 + 576, y:top + 10, w:90, h:90, label:tRef.current('cameraGestureDrawingPage.lightning'), color:lightningToolActiveRef.current ? '#38bdf8' : '#94a3b8', sel:lightningToolActiveRef.current}
    ];
    
    for(const b of btns) {
      uctx.save();
      roundRect(uctx, b.x, b.y, b.w, b.h, 10);
      uctx.fillStyle = b.sel ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.08)'; // 加深选中按钮的背景色
      uctx.fill();
      if(b.sel) {
        uctx.shadowColor = 'rgba(96,165,250,0.6)'; // 加深选中按钮的阴影效果
        uctx.shadowBlur = 35;
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
    
    // 火焰持续生成和自动结束逻辑
    const now = performance.now();
    
    // 如果火焰处于激活状态
    if(fireActiveRef.current) {
      // 检查是否超过5秒
      if(now - fireStartTimeRef.current > 5000) {
        // 5秒后自动结束火焰
        fireActiveRef.current = false;
      } else {
        // 持续生成火焰粒子
        // 获取当前检测到的主要手部
        if(lastHandsRef.current.length > 0) {
          const main = lastHandsRef.current[0];
          // 检查是否仍然保持食指手势
          if(isPointingIndex(main)) {
            // 使用食指指尖位置生成火焰
            const fingertipPoint = toScreen(main[8], {forUI: false}); // 食指指尖坐标
            // 每帧生成少量火焰粒子，保持火焰持续效果
            for(let i = 0; i < 5; i++) {
              const fireColors = ['#ff4500', '#ff6b35', '#f7931e', '#ffd23f', '#ffeb3b', '#ffffff'];
              const size = 5 + Math.random() * 10;
              particlesRef.current.push({
                x: fingertipPoint.x + (Math.random() - 0.5) * 40,
                y: fingertipPoint.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 1.2,
                vy: -1 - Math.random() * 3.0, // 火焰向上
                life: 2000 + Math.random() * 1500,
                born: now,
                color: fireColors[Math.floor(Math.random() * fireColors.length)],
                alpha: 1,
                type: 'fire',
                size: size,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.15
              });
            }
          }
        }
      }
    }
    
    // 绘制能量球（当正在聚集时）
    if(kiBlastChargingRef.current && lastHandsRef.current.length > 0 && kiBlastToolActiveRef.current) {
      const h = lastHandsRef.current[0];
      const palmCenter = toScreen({x: h[9].x, y: h[9].y}, {forUI: false}); // 掌心位置
      const now = performance.now();
      
      // 改为蓝白色能量球
      const pulseFactor = 1 + Math.sin(now * 0.01) * 0.1;
      const currentSize = kiBlastSizeRef.current * pulseFactor;
      
      // 绘制能量球外层光晕（蓝白色）
      const gradient = dctx.createRadialGradient(palmCenter.x, palmCenter.y, 0, palmCenter.x, palmCenter.y, currentSize * 2);
      gradient.addColorStop(0, 'rgba(14, 165, 233, 0.8)');
      gradient.addColorStop(0.5, 'rgba(56, 189, 248, 0.5)');
      gradient.addColorStop(1, 'rgba(125, 211, 252, 0)');
      
      dctx.save();
      dctx.fillStyle = gradient;
      dctx.beginPath();
      dctx.arc(palmCenter.x, palmCenter.y, currentSize * 2, 0, Math.PI * 2);
      dctx.fill();
      dctx.restore();
      
      // 绘制能量球核心（蓝白色渐变）
      const coreGradient = dctx.createRadialGradient(palmCenter.x, palmCenter.y, 0, palmCenter.x, palmCenter.y, currentSize);
      coreGradient.addColorStop(0, '#ffffff');
      coreGradient.addColorStop(0.3, '#0ea5e9');
      coreGradient.addColorStop(0.6, '#bae6fd');
      coreGradient.addColorStop(1, '#0ea5e9');
      
      dctx.save();
      dctx.fillStyle = coreGradient;
      dctx.beginPath();
      dctx.arc(palmCenter.x, palmCenter.y, currentSize, 0, Math.PI * 2);
      dctx.fill();
      
      // 绘制内部能量波纹（脉动）
      const rippleSize = currentSize * 0.5 * (1 + Math.sin(now * 0.02) * 0.2);
      dctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      dctx.lineWidth = 2;
      dctx.beginPath();
      dctx.arc(palmCenter.x, palmCenter.y, rippleSize, 0, Math.PI * 2);
      dctx.stroke();
      
      // 添加第二个波纹
      const rippleSize2 = currentSize * 0.7 * (1 + Math.sin(now * 0.02 + Math.PI) * 0.15);
      dctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      dctx.lineWidth = 1;
      dctx.beginPath();
      dctx.arc(palmCenter.x, palmCenter.y, rippleSize2, 0, Math.PI * 2);
      dctx.stroke();
      
      // 绘制能量粒子
      for(let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + now * 0.01;
        const radius = currentSize * (1.2 + Math.sin(now * 0.03 + i) * 0.3);
        const particleX = palmCenter.x + Math.cos(angle) * radius;
        const particleY = palmCenter.y + Math.sin(angle) * radius;
        
        dctx.fillStyle = '#ffffff';
        dctx.globalAlpha = 0.7;
        dctx.beginPath();
        dctx.arc(particleX, particleY, 2, 0, Math.PI * 2);
        dctx.fill();
      }
      
      dctx.restore();
    }
    
    // 能量球爆炸动画
    for(let i = kiBlastsRef.current.length - 1; i >= 0; i--) {
      const blast = kiBlastsRef.current[i];
      const age = now - blast.startTime;
      
      // 检查是否超过生命周期
      if(age > blast.maxLifeTime) {
        kiBlastsRef.current.splice(i, 1);
        continue;
      }
      
      // 更新爆炸状态和大小
      const explosionDuration = blast.maxLifeTime * 0.4; // 爆炸阶段占40%
      const fadeDuration = blast.maxLifeTime * 0.6; // 衰减阶段占60%
      
      if(blast.explosionStage === 'exploding') {
        if(age < explosionDuration) {
          // 爆炸阶段：快速膨胀
          const explosionProgress = age / explosionDuration;
          // 使用缓动函数使爆炸更自然
          const easeOut = 1 - Math.pow(1 - explosionProgress, 3);
          blast.currentExplosionSize = blast.size + (blast.size * 3) * easeOut;
        } else {
          // 进入衰减阶段
          blast.explosionStage = 'fading';
        }
      } else {
        // 衰减阶段：逐渐消失
        const fadeProgress = (age - explosionDuration) / fadeDuration;
        blast.alpha = Math.max(0, 1 - fadeProgress);
        // 略微继续扩大
        const fadeEaseOut = 1 - Math.pow(1 - fadeProgress, 2);
        blast.currentExplosionSize = blast.size + (blast.size * 3) + (blast.size * 1.5) * fadeEaseOut;
      }
      
      // 绘制爆炸效果
      dctx.save();
      dctx.translate(blast.x, blast.y);
      
      // 爆炸外围光晕效果
      const glowRadius = blast.currentExplosionSize * 0.8;
      const glowGradient = dctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
      glowGradient.addColorStop(0, `rgba(14, 165, 233, ${blast.alpha * 0.4})`);
      glowGradient.addColorStop(0.4, `rgba(56, 189, 248, ${blast.alpha * 0.2})`);
      glowGradient.addColorStop(0.7, `rgba(125, 211, 252, ${blast.alpha * 0.1})`);
      glowGradient.addColorStop(1, `rgba(14, 165, 233, 0)`);
      
      dctx.fillStyle = glowGradient;
      dctx.beginPath();
      dctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
      dctx.fill();
      
      // 爆炸主体（发光圆环）
      const ringRadius = blast.currentExplosionSize * 0.6;
      const ringGradient = dctx.createRadialGradient(0, 0, ringRadius * 0.3, 0, 0, ringRadius);
      ringGradient.addColorStop(0, `rgba(224, 242, 254, ${blast.alpha * 0.3})`);
      ringGradient.addColorStop(0.5, `rgba(186, 230, 253, ${blast.alpha * 0.8})`);
      ringGradient.addColorStop(0.7, `rgba(56, 189, 248, ${blast.alpha * 0.9})`);
      ringGradient.addColorStop(1, `rgba(14, 165, 233, ${blast.alpha * 0.1})`);
      
      dctx.fillStyle = ringGradient;
      dctx.beginPath();
      dctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
      dctx.fill();
      
      // 爆炸中心亮点
      const centerRadius = blast.currentExplosionSize * 0.2;
      const centerGradient = dctx.createRadialGradient(0, 0, 0, 0, 0, centerRadius);
      centerGradient.addColorStop(0, `rgba(255, 255, 255, ${blast.alpha})`);
      centerGradient.addColorStop(0.6, `rgba(186, 230, 253, ${blast.alpha * 0.8})`);
      centerGradient.addColorStop(1, `rgba(56, 189, 248, ${blast.alpha * 0.2})`);
      
      dctx.fillStyle = centerGradient;
      dctx.beginPath();
      dctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
      dctx.fill();
      
      dctx.restore();
    }

    // 粒子动画
    for(let i = particlesRef.current.length - 1; i >= 0; i--) {
      const pt = particlesRef.current[i];
      const age = now - pt.born;
      if(age > pt.life) {
        particlesRef.current.splice(i, 1);
        continue;
      }
      
      // 更新粒子位置和属性
      if(pt.type === 'fire') {
        // 火焰粒子特殊行为
        pt.x += pt.vx + (Math.sin(age * 0.002) * 0.2); // 火焰摇曳效果
        pt.y += pt.vy + (Math.cos(age * 0.003) * 0.1);
        pt.vy += 0.005; // 重力影响
        pt.rotation += pt.rotationSpeed;
        pt.alpha = 1 - (age / pt.life);
        pt.size = Math.max(0.5, pt.size * (1 - age / pt.life)); // 火焰粒子逐渐变小
      } else if(pt.type === 'kiBlast' || pt.type === 'kiBlastTrail') {
        // 爆炸粒子特殊行为
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.rotation += pt.rotationSpeed;
        pt.alpha = 1 - (age / pt.life);
        // 爆炸粒子保持大小或略微增大
        if(pt.type === 'kiBlast') {
          pt.size = Math.min(pt.size * 1.01, 15);
        } else {
          pt.size = Math.max(0.5, pt.size * (1 - age / pt.life));
        }
      } else {
        // 普通粒子行为
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.vy += 0.01;
        pt.alpha = 1 - (age / pt.life);
      }
      
      // 渲染粒子
      dctx.globalAlpha = pt.alpha;
      dctx.fillStyle = pt.color;
      
      if(pt.type === 'fire' && pt.size) {
        // 火焰粒子使用方形或多边形渲染，增加火焰质感
        dctx.save();
        dctx.translate(pt.x, pt.y);
        dctx.rotate(pt.rotation);
        dctx.beginPath();
        dctx.rect(-pt.size/2, -pt.size/2, pt.size, pt.size * 2); // 长方形火焰形状
        dctx.fill();
        dctx.restore();
      } else if((pt.type === 'kiBlast' || pt.type === 'kiBlastTrail') && pt.size) {
        // 爆炸粒子使用圆形渲染，带有发光效果
        dctx.save();
        
        // 添加发光效果
        if(pt.type === 'kiBlast') {
          const glowGradient = dctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, pt.size * 2);
          glowGradient.addColorStop(0, pt.color);
          glowGradient.addColorStop(0.5, pt.color + '80');
          glowGradient.addColorStop(1, pt.color + '00');
          
          dctx.fillStyle = glowGradient;
          dctx.beginPath();
          dctx.arc(pt.x, pt.y, pt.size * 2, 0, Math.PI * 2);
          dctx.fill();
        }
        
        // 绘制粒子核心
        dctx.fillStyle = pt.color;
        dctx.beginPath();
        dctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        dctx.fill();
        
        dctx.restore();
      } else {
        // 普通粒子使用圆形渲染
        dctx.beginPath();
        dctx.arc(pt.x, pt.y, pt.size || 2, 0, Math.PI * 2);
        dctx.fill();
      }
      
      dctx.globalAlpha = 1;
    }
    
    // 在 UI canvas 上绘制手部关键点（视觉坐标）
    if(lastHandsRef.current.length > 0) {
      for(const h of lastHandsRef.current) {
        drawHandOverlay(h);
      }
    }
    
    // 更新上一帧的手部地标点，用于检测手势方向
    previousHandsRef.current = JSON.parse(JSON.stringify(lastHandsRef.current));
    
    animationFrameRef.current = requestAnimationFrame(render);
  };
  
  // 切换背景模式
  const toggleCameraBackgroundMode = () => {
    cameraBackgroundModeRef.current = !cameraBackgroundModeRef.current;
    const inputVideo = inputVideoRef.current;
    const previewEl = previewElRef.current;
    // 使用容器 ref，而不是通过 style 字符串查询，避免开发/生产构建差异
    const container = containerRef.current;
    
    if(container) {
      // 添加过渡效果，与video保持一致
      container.style.transition = 'background 280ms ease';
      
      if(cameraBackgroundModeRef.current) {
        // 隐藏容器的纯色背景
        container.style.background = 'transparent';
      } else {
        // 恢复容器的纯色背景
        container.style.background = 'linear-gradient(180deg, #071027 0%, #0b1220 60%)';
      }
    }
    
    if(inputVideo) {
      // 确保所有video元素都在UI元素之下
      const uiCanvas = uiCanvasRef.current;
      if(uiCanvas) {
        uiCanvas.style.zIndex = '100'; // 确保UI层始终在最上面
      }
      
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
        inputVideo.style.opacity = '1';
        // 全屏模式下保持镜像效果，用户习惯看到镜像的自己
        inputVideo.style.transform = 'scaleX(-1)';
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
        // 小预览模式下保持镜像效果
        inputVideo.style.transform = 'scaleX(-1)';
      }
    }
    
    // 确保drawCanvas也在UI层之下
    const drawCanvas = drawCanvasRef.current;
    if(drawCanvas) {
      drawCanvas.style.zIndex = '30';
    }
    
    // 确保背景切换后手势检测仍然正常工作
    // 重置面板边界，确保坐标计算正确
    panelBoundsRef.current = [];
    
    if(previewEl) {
      previewEl.style.display = cameraBackgroundModeRef.current ? 'none' : 'flex';
    }
    
    // 重新调整画布大小和镜像设置，确保切换背景模式后坐标正确
    const ctx = dctxRef.current;
    if(drawCanvas && ctx) {
      fitCanvasSize(drawCanvas, ctx, true); // true表示需要考虑镜像（但会根据背景模式自动调整）
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
    
    // 使用脚本 onload 事件更可靠地触发初始化（兼容直接刷新 / URL 进入）
    let loadedCount = 0;
    const handleScriptLoad = () => {
      loadedCount += 1;
      // hands.js 和 camera_utils.js 就绪后再尝试初始化
      if (loadedCount >= 2) {
        initMediaPipe();
      }
    };

    script1.addEventListener('load', handleScriptLoad);
    script2.addEventListener('load', handleScriptLoad);

    // 兜底定时器：即使 onload 丢失，也会在几秒内重试初始化
    const timer = setTimeout(() => {
      initMediaPipe();
    }, 4000);
    
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
      script1.removeEventListener('load', handleScriptLoad);
      script2.removeEventListener('load', handleScriptLoad);
      document.body.removeChild(script1);
      document.body.removeChild(script2);
      document.body.removeChild(script3);
    };
  }, []);
  
  return (
    <>
      {/* Fixed 定位的主容器 */}
    <div
      ref={containerRef}
      style={{position: 'fixed', left: '5%', right: '5%', top: '10%', bottom: '5%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #071027 0%, #0b1220 60%)', color: '#e6eef8', overflow: 'hidden', boxSizing: 'border-box', borderRadius: '16px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)', zIndex: 10}}
    >
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
      
      <div style={{position: 'absolute', left: '1rem', top: '1rem', color: '#94a3b8', fontSize: '13px', zIndex: '80'}}>{t('cameraGestureDrawingPage.title')}</div>
      <div style={{position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '1.8rem', color: '#94a3b8', fontSize: '13px', zIndex: '80', textAlign: 'center', maxWidth: '70%'}}>{t('cameraGestureDrawingPage.instructions')}</div>
      <footer style={{position: 'absolute', right: '1rem', bottom: '1rem', color: '#94a3b8', fontSize: '12px', zIndex: '80'}}>{t('cameraGestureDrawingPage.footer')}</footer>
      
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
        title={t('cameraGestureDrawingPage.previewHint')}
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
          title={t('cameraGestureDrawingPage.resizeHint')}
        >
          <div style={{width: '8px', height: '8px', borderRight: '2px solid rgba(255,255,255,0.28)', borderBottom: '2px solid rgba(255,255,255,0.28)', transform: 'rotate(45deg)'}} />
        </div>
      </div>
    </div>
      
      {/* 占位元素：确保页面有足够高度，避免 footer 与 fixed 内容重叠 */}
      <div style={{height: '85vh', width: '100%', pointerEvents: 'none'}} aria-hidden="true" />
    </>
  );
};

export default CameraGestureDrawing;