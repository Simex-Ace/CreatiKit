'use client';
import React, { useRef, useState, useEffect } from 'react';

// 增强版白板实现
export default function Whiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;
  
  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 设置固定尺寸
    canvas.width = 800;
    canvas.height = 600;
    
    // 初始化白色背景
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 设置绘制属性
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    // 保存初始状态
    saveState();
  }, []);
  
  // 当颜色或线条宽度改变时更新Canvas上下文
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);
  
  // 获取坐标（兼容鼠标和触摸事件）
  const getCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };
  
  // 绘制线条的通用函数
  const drawLine = (fromX: number, fromY: number, toX: number, toY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    // 绘制线条
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  };
  
  // 鼠标按下事件 - 开始绘制
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e.clientX, e.clientY);
    
    // 更新状态
    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
    
    // 绘制初始点（确保点击时有可见的点）
    ctx.beginPath();
    ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };
  
  // 鼠标移动事件 - 绘制线条
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const { x, y } = getCoordinates(e.clientX, e.clientY);
    
    // 绘制线条
    drawLine(lastX, lastY, x, y);
    
    // 更新上一个点的位置
    setLastX(x);
    setLastY(y);
  };
  
  // 保存当前画布状态到历史记录
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 获取当前画布数据
    const imageData = canvas.toDataURL('image/png');
    
    // 如果正在绘制中，不保存状态
    if (isDrawing) return;
    
    // 不清除当前索引后的历史记录，而是保留所有历史状态
    // 这样即使在撤销后进行绘制，重做功能仍然可用
    const newHistory = [...history];
    
    // 如果当前不在历史记录末尾，先移除后面的状态（保留撤销重做的标准行为）
    // 但确保只在需要时才这样做，防止重复添加相同状态
    if (historyIndex < newHistory.length - 1) {
      newHistory.splice(historyIndex + 1);
    }
    
    // 检查是否与最后一个状态相同，避免重复保存
    if (historyIndex >= 0 && newHistory[historyIndex] === imageData) {
      return;
    }
    
    // 添加新状态
    newHistory.push(imageData);
    
    // 限制历史记录数量
    if (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // 鼠标抬起/离开事件 - 停止绘制
  const handleMouseUpOrLeave = () => {
    setIsDrawing(false);
    // 绘制完成后保存状态
    setTimeout(saveState, 0);
  };
  
  // 触摸开始事件 - 移动端支持
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // 防止页面滚动
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const { x, y } = getCoordinates(touch.clientX, touch.clientY);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        // 绘制初始点
        ctx.beginPath();
        ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
      
      setIsDrawing(true);
      setLastX(x);
      setLastY(y);
    }
  };
  
  // 触摸移动事件 - 移动端支持
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // 防止页面滚动
    if (!isDrawing || e.touches.length === 0) return;
    
    const touch = e.touches[0];
    const { x, y } = getCoordinates(touch.clientX, touch.clientY);
    
    // 绘制线条
    drawLine(lastX, lastY, x, y);
    
    // 更新上一个点的位置
    setLastX(x);
    setLastY(y);
  };
  
  // 触摸结束事件 - 移动端支持
  const handleTouchEnd = () => {
    setIsDrawing(false);
    // 绘制完成后保存状态
    setTimeout(saveState, 0);
  };
  
  // 清除画布
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 清除后保存状态
    setTimeout(saveState, 0);
  };
  
  // 撤销操作
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    applyState(newIndex);
  };
  
  // 重做操作
  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    applyState(newIndex);
  };
  
  // 应用历史状态
  const applyState = (index: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !history[index] || !canvas) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = history[index];
    
    setHistoryIndex(index);
  };
  
  // 保存图片
  const handleSaveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `白板创作_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  // 常用颜色
  const commonColors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#808080'
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">创意白板</h1>
          <p className="text-gray-600">自由绘制你的创意和想法</p>
        </div>
        
        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* 颜色选择器 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">颜色</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 border-2 border-gray-300 rounded-full cursor-pointer"
                />
                <div className="flex gap-1 flex-wrap">
                  {commonColors.map((c) => (
                    <button
                      key={c}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-yellow-400' : 'border-transparent'} hover:opacity-80 transition-opacity`}
                      aria-label={`选择颜色 ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            {/* 笔刷大小 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                笔刷大小: {lineWidth}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* 操作按钮 */}
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                  historyIndex <= 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                }`}
              >
                上一步
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
                  historyIndex >= history.length - 1 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                }`}
              >
                下一步
              </button>
              <button
                onClick={handleSaveImage}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                保存图片
              </button>
              <button
                onClick={handleClearCanvas}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm"
              >
                清除画布
              </button>
            </div>
          </div>
        </div>
        
        {/* 画布容器 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 flex justify-center">
          <div className="relative">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="border border-gray-200 rounded-lg shadow-sm cursor-crosshair bg-white touch-manipulation"
              style={{ maxWidth: '100%', height: 'auto', touchAction: 'none' }}
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {canvasRef.current?.width || 800} × {canvasRef.current?.height || 600}
            </div>
          </div>
        </div>
        
        {/* 使用说明 */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-gray-600 text-sm text-center">
            {window.innerWidth < 768 
              ? '使用手指在画布上绘制，选择不同的颜色和笔刷大小来创作你的作品'
              : '使用鼠标在画布上绘制，选择不同的颜色和笔刷大小来创作你的作品'
            }
          </p>
        </div>
      </div>
    </div>
  );
}