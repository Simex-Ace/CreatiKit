'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useI18n } from '@/contexts/I18nContext';

// 定义调色板类型
type ColorPalette = 'default' | 'limited' | 'grayscale' | 'pastel' | 'vibrant';

// 定义边框样式类型
type BorderStyle = 'none' | 'solid' | 'dashed' | 'dotted';

// 定义背景效果类型
type BackgroundEffect = 'none' | 'checkerboard' | 'gradient' | 'noise';

// 定义RGB颜色类型
interface RGBColor {
  r: number;
  g: number;
  b: number;
}

// 历史记录项接口
interface HistoryItem {
  pixelatedImage: string;
  originalImage: string;
  pixelSize: number;
  colorPalette: ColorPalette;
  brightness: number;
  contrast: number;
  borderStyle: BorderStyle;
  borderColor: string;
  backgroundEffect: BackgroundEffect;
  backgroundColor: string;
  showGrid: boolean;
  enhanceEdges: boolean;
}

const PixelArtGenerator: React.FC = () => {
  const { t } = useI18n();
  
  // 状态管理
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [pixelatedImage, setPixelatedImage] = useState<string | null>(null);
  const [pixelSize, setPixelSize] = useState<number>(8);
  const [palette, setPalette] = useState<ColorPalette>('default');
  const [brightness, setBrightness] = useState<number>(0); // -100 到 100
  const [contrast, setContrast] = useState<number>(0); // -100 到 100
  const [edgeEnhance, setEdgeEnhance] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpeg'>('png');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('none');
  const [borderColor, setBorderColor] = useState<string>('#000000');
  const [backgroundEffect, setBackgroundEffect] = useState<BackgroundEffect>('none');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(-1);
  const [notifications, setNotifications] = useState<{message: string, type: 'success' | 'error' | 'info'}[]>([]);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Canvas引用
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showNotification(t('pixelArtGeneratorPage.invalidImageFile'), 'error');
      return;
    }

    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      showNotification(t('pixelArtGeneratorPage.imageTooLarge'), 'error');
      return;
    }

    // 读取图片文件
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      setOriginalImage(imageDataUrl);
      setPixelatedImage(null); // 重置像素化图片
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showNotification(t('pixelArtGeneratorPage.imageUploadSuccess'), 'success');
    };
    reader.readAsDataURL(file);
  };

  // 获取像素块的平均颜色
  const getAverageColor = (ctx: CanvasRenderingContext2D, x: number, y: number, blockSize: number) => {
    const imageData = ctx.getImageData(x, y, blockSize, blockSize);
    const data = imageData.data;
    let r = 0, g = 0, b = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
      // 跳过完全透明的像素
      if (data[i + 3] > 0) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }

    if (count === 0) return { r: 255, g: 255, b: 255, a: 0 }; // 默认返回透明白色

    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count),
      a: 255
    };
  };

  // 应用调色板
  const applyPalette = (color: RGBColor, paletteType: ColorPalette): RGBColor => {
    switch (paletteType) {
      case 'limited':
        // 限制为16种颜色
        return {
          r: Math.round(color.r / 64) * 64,
          g: Math.round(color.g / 64) * 64,
          b: Math.round(color.b / 64) * 64
        };
      case 'grayscale':
        // 转换为灰度
        const gray = Math.round(0.299 * color.r + 0.587 * color.g + 0.114 * color.b);
        return { r: gray, g: gray, b: gray };
      case 'pastel':
        // 转换为柔和色调
        return {
          r: Math.round(128 + (color.r - 128) * 0.7),
          g: Math.round(128 + (color.g - 128) * 0.7),
          b: Math.round(128 + (color.b - 128) * 0.7)
        };
      case 'vibrant':
        // 增强饱和度
        const avg = (color.r + color.g + color.b) / 3;
        const factor = 1.5;
        return {
          r: Math.min(255, Math.round(avg + (color.r - avg) * factor)),
          g: Math.min(255, Math.round(avg + (color.g - avg) * factor)),
          b: Math.min(255, Math.round(avg + (color.b - avg) * factor))
        };
      default:
        return color;
    }
  };

  // 应用亮度和对比度
  const applyBrightnessContrast = (color: RGBColor): RGBColor => {
    let r = color.r;
    let g = color.g;
    let b = color.b;

    // 应用亮度
    if (brightness !== 0) {
      const brightnessFactor = brightness / 100;
      r = Math.min(255, Math.max(0, r + brightnessFactor * 255));
      g = Math.min(255, Math.max(0, g + brightnessFactor * 255));
      b = Math.min(255, Math.max(0, b + brightnessFactor * 255));
    }

    // 应用对比度
    if (contrast !== 0) {
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      r = Math.min(255, Math.max(0, contrastFactor * (r - 128) + 128));
      g = Math.min(255, Math.max(0, contrastFactor * (g - 128) + 128));
      b = Math.min(255, Math.max(0, contrastFactor * (b - 128) + 128));
    }

    return { r, g, b };
  };

  // 主像素化处理函数
  const pixelateImage = () => {
    if (!originalImage || !canvasRef.current) return;
    
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 创建图像对象
    const img = new window.Image();
    img.crossOrigin = 'anonymous'; // 允许跨域图像操作
    
    img.onload = () => {
      try {
        // 计算合适的画布大小（最大宽度/高度为800px）
        const maxSize = 800;
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvasWidth = img.width * scale;
        const canvasHeight = img.height * scale;
        
        // 设置画布尺寸
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        // 绘制原始图像到画布
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
        
        // 获取原始图像数据
        const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
        
        // 创建一个新的图像数据对象用于像素化
        const pixelatedData = ctx.createImageData(canvasWidth, canvasHeight);
        
        // 像素化处理
        const blockSize = pixelSize;
        
        for (let y = 0; y < canvasHeight; y += blockSize) {
          for (let x = 0; x < canvasWidth; x += blockSize) {
            // 获取当前像素块的平均颜色
            const avgColor = getAverageColor(ctx, x, y, blockSize);
            
            // 应用调色板
            const paletteColor = applyPalette({
              r: avgColor.r,
              g: avgColor.g,
              b: avgColor.b
            }, palette);
            
            // 应用亮度和对比度
            const finalColor = applyBrightnessContrast(paletteColor);
            
            // 填充整个像素块
            for (let py = 0; py < blockSize && y + py < canvasHeight; py++) {
              for (let px = 0; px < blockSize && x + px < canvasWidth; px++) {
                const index = ((y + py) * canvasWidth + (x + px)) * 4;
                pixelatedData.data[index] = finalColor.r;      // R
                pixelatedData.data[index + 1] = finalColor.g;  // G
                pixelatedData.data[index + 2] = finalColor.b;  // B
                pixelatedData.data[index + 3] = 255;           // A
              }
            }
          }
        }
        
        // 应用边缘增强
        if (edgeEnhance) {
          for (let y = 0; y < canvasHeight; y += blockSize) {
            for (let x = 0; x < canvasWidth; x += blockSize) {
              // 检查右侧相邻像素块
              if (x + blockSize < canvasWidth) {
                const currentColor = getAverageColor(ctx, x, y, blockSize);
                const rightColor = getAverageColor(ctx, x + blockSize, y, blockSize);
                
                // 计算颜色差异
                const colorDiff = Math.abs(currentColor.r - rightColor.r) +
                                 Math.abs(currentColor.g - rightColor.g) +
                                 Math.abs(currentColor.b - rightColor.b);
                
                // 如果颜色差异较大，绘制深色边界线
                if (colorDiff > 50) {
                  for (let py = 0; py < blockSize && y + py < canvasHeight; py++) {
                    const index = ((y + py) * canvasWidth + (x + blockSize - 1)) * 4;
                    pixelatedData.data[index] = 0;       // R
                    pixelatedData.data[index + 1] = 0;   // G
                    pixelatedData.data[index + 2] = 0;   // B
                    pixelatedData.data[index + 3] = 255; // A
                  }
                }
              }
              
              // 检查底部相邻像素块
              if (y + blockSize < canvasHeight) {
                const currentColor = getAverageColor(ctx, x, y, blockSize);
                const bottomColor = getAverageColor(ctx, x, y + blockSize, blockSize);
                
                // 计算颜色差异
                const colorDiff = Math.abs(currentColor.r - bottomColor.r) +
                                 Math.abs(currentColor.g - bottomColor.g) +
                                 Math.abs(currentColor.b - bottomColor.b);
                
                // 如果颜色差异较大，绘制深色边界线
                if (colorDiff > 50) {
                  for (let px = 0; px < blockSize && x + px < canvasWidth; px++) {
                    const index = (((y + blockSize - 1) * canvasWidth) + (x + px)) * 4;
                    pixelatedData.data[index] = 0;       // R
                    pixelatedData.data[index + 1] = 0;   // G
                    pixelatedData.data[index + 2] = 0;   // B
                    pixelatedData.data[index + 3] = 255; // A
                  }
                }
              }
            }
          }
        }
        
        // 绘制像素化后的图像
        ctx.putImageData(pixelatedData, 0, 0);
        
        // 应用网格线
        if (showGrid) {
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.globalAlpha = 0.3;
          
          // 绘制垂直网格线
          for (let x = 0; x <= canvasWidth; x += blockSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasHeight);
            ctx.stroke();
          }
          
          // 绘制水平网格线
          for (let y = 0; y <= canvasHeight; y += blockSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasWidth, y);
            ctx.stroke();
          }
          
          ctx.globalAlpha = 1.0;
        }
        
        // 应用边框
        if (borderStyle !== 'none') {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 4;
          ctx.setLineDash(borderStyle === 'dashed' ? [8, 4] : borderStyle === 'dotted' ? [2, 2] : []);
          ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
          ctx.setLineDash([]); // 重置线条样式
        }
        
        // 转换为图片URL
        const pixelatedDataUrl = canvas.toDataURL(`image/${downloadFormat}`, 1.0);
        setPixelatedImage(pixelatedDataUrl);
        
        // 保存到历史记录
        if (originalImage) {
          saveToHistory();
        }
        
        showNotification(t('pixelArtGeneratorPage.pixelArtGenerated'), 'success');
      } catch (error) {
        console.error('像素化处理出错:', error);
        showNotification(t('pixelArtGeneratorPage.processingError'), 'error');
      } finally {
        setIsProcessing(false);
      }
    };
    
    img.onerror = () => {
      showNotification(t('pixelArtGeneratorPage.cannotLoadImage'), 'error');
      setIsProcessing(false);
    };
    
    img.src = originalImage;
  };

  // 保存到历史记录
  const saveToHistory = () => {
    if (!pixelatedImage || !originalImage) return;
    
    const newHistoryItem: HistoryItem = {
      pixelatedImage,
      originalImage,
      pixelSize,
      colorPalette: palette,
      brightness,
      contrast,
      borderStyle,
      borderColor,
      backgroundEffect,
      backgroundColor: '#ffffff',
      showGrid,
      enhanceEdges: edgeEnhance
    };
    
    // 保存当前状态到历史记录
    setHistory(prev => {
      // 如果当前不是最新状态，删除当前索引后的历史记录
      const newHistory = prev.slice(0, currentHistoryIndex + 1);
      // 添加新状态
      newHistory.push(newHistoryItem);
      // 限制历史记录数量
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      return newHistory;
    });
    // 更新当前索引
    setCurrentHistoryIndex(prev => prev + 1);
  };

  // 撤销操作
  const undo = () => {
    if (currentHistoryIndex <= 0) return;
    
    const newIndex = currentHistoryIndex - 1;
    const prevState = history[newIndex];
    
    // 恢复之前的状态
    setPixelatedImage(prevState.pixelatedImage);
    setPixelSize(prevState.pixelSize);
    setPalette(prevState.colorPalette);
    setBrightness(prevState.brightness);
    setContrast(prevState.contrast);
    setBorderStyle(prevState.borderStyle);
    setBorderColor(prevState.borderColor);
    setBackgroundEffect(prevState.backgroundEffect);
    setShowGrid(prevState.showGrid);
    setEdgeEnhance(prevState.enhanceEdges);
    
    setCurrentHistoryIndex(newIndex);
    showNotification(t('pixelArtGeneratorPage.operationUndone'), 'info');
  };

  // 重做操作
  const redo = () => {
    if (currentHistoryIndex >= history.length - 1) return;
    
    const newIndex = currentHistoryIndex + 1;
    const nextState = history[newIndex];
    
    // 恢复之后的状态
    setPixelatedImage(nextState.pixelatedImage);
    setPixelSize(nextState.pixelSize);
    setPalette(nextState.colorPalette);
    setBrightness(nextState.brightness);
    setContrast(nextState.contrast);
    setBorderStyle(nextState.borderStyle);
    setBorderColor(nextState.borderColor);
    setBackgroundEffect(nextState.backgroundEffect);
    setShowGrid(nextState.showGrid);
    setEdgeEnhance(nextState.enhanceEdges);
    
    setCurrentHistoryIndex(newIndex);
    showNotification(t('pixelArtGeneratorPage.operationRedone'), 'info');
  };

  // 重置所有设置
  const resetAll = () => {
    setOriginalImage(null);
    setPixelatedImage(null);
    setPixelSize(8);
    setPalette('default');
    setBrightness(0);
    setContrast(0);
    setEdgeEnhance(false);
    setShowGrid(false);
    setBorderStyle('none');
    setBorderColor('#000000');
    setBackgroundEffect('none');
    setHistory([]);
    setCurrentHistoryIndex(-1);
    
    // 重置文件输入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    showNotification(t('pixelArtGeneratorPage.allSettingsReset'), 'info');
  };

  // 下载图片
  const downloadImage = () => {
    if (!pixelatedImage) return;
    
    try {
      // 创建下载链接
      const link = document.createElement('a');
      link.href = pixelatedImage;
      link.download = `pixel-art-${new Date().toISOString().slice(0, 10)}.${downloadFormat}`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification(t('pixelArtGeneratorPage.imageDownloadSuccess'), 'success');
    } catch (error) {
      console.error('下载图片出错:', error);
      showNotification(t('pixelArtGeneratorPage.downloadError'), 'error');
    }
  };

  // 通知系统
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotificationMessage(message);
    setShowNotifications(true);
    
    // 3秒后自动隐藏通知
    setTimeout(() => {
      setShowNotifications(false);
    }, 3000);
  };

  // 实时生成功能的useEffect钩子
  useEffect(() => {
    // 只有在开启自动生成且有原图时才执行
    if (autoGenerate && originalImage) {
      // 使用防抖避免频繁生成
      const timer = setTimeout(() => {
        pixelateImage();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [autoGenerate, originalImage, pixelSize, palette, brightness, contrast, borderStyle, borderColor, backgroundEffect, showGrid, edgeEnhance]);

  // 渲染组件
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">{t('pixelArtGeneratorPage.title')}</h1>
      
      {/* 图片上传区域 */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{t('pixelArtGeneratorPage.uploadImage')}</h2>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" onChange={handleImageUpload} accept="image/*" className="hidden" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-gray-600">{t('pixelArtGeneratorPage.clickOrDrag')}</p>
          <p className="mt-2 text-sm text-gray-500">{t('pixelArtGeneratorPage.supportedFormats')}</p>
        </div>
      </div>
      
      {/* 图片预览区域 */}
      {(originalImage || pixelatedImage) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 原图预览 */}
          {originalImage && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{t('pixelArtGeneratorPage.originalImage')}</h2>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src={originalImage} alt={t('pixelArtGeneratorPage.originalImage')} width={500} height={500} className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}
          
          {/* 像素化预览 */}
          {pixelatedImage && (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">{t('pixelArtGeneratorPage.pixelatedResult')}</h2>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                <Image src={pixelatedImage} alt={t('pixelArtGeneratorPage.pixelatedImage')} width={500} height={500} className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 控制选项区域 */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-6">{t('pixelArtGeneratorPage.parameterSettings')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 像素大小 */}
          <div>
            <label htmlFor="pixelSize" className="block text-sm font-medium text-gray-700 mb-2">{t('pixelArtGeneratorPage.pixelSize')}</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="pixelSize"
                min="2"
                max="32"
                value={pixelSize}
                onChange={(e) => setPixelSize(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-medium min-w-[30px] text-center">{pixelSize}</span>
            </div>
          </div>
          
          {/* 调色板 */}
          <div>
            <label htmlFor="palette" className="block text-sm font-medium text-gray-700 mb-2">{t('pixelArtGeneratorPage.palette')}</label>
            <select
              id="palette"
              value={palette}
              onChange={(e) => setPalette(e.target.value as ColorPalette)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">{t('pixelArtGeneratorPage.default')}</option>
              <option value="limited">{t('pixelArtGeneratorPage.limited')}</option>
              <option value="grayscale">{t('pixelArtGeneratorPage.grayscale')}</option>
              <option value="pastel">{t('pixelArtGeneratorPage.pastel')}</option>
              <option value="vibrant">{t('pixelArtGeneratorPage.vibrant')}</option>
            </select>
          </div>
          
          {/* 自动生成 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerate}
                onChange={(e) => setAutoGenerate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('pixelArtGeneratorPage.autoGenerate')}</span>
            </label>
          </div>
          
          {/* 显示网格 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('pixelArtGeneratorPage.showGrid')}</span>
            </label>
          </div>
          
          {/* 边缘增强 */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={edgeEnhance}
                onChange={(e) => setEdgeEnhance(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('pixelArtGeneratorPage.edgeEnhance')}</span>
            </label>
          </div>
        </div>
        
        {/* 高级调整选项 */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">{t('pixelArtGeneratorPage.advancedAdjustments')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 亮度 */}
            <div>
              <label htmlFor="brightness" className="block text-sm font-medium text-gray-700 mb-2">{t('pixelArtGeneratorPage.brightness')} ({brightness})</label>
              <input
                type="range"
                id="brightness"
                min="-100"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
              </div>
            </div>
            
            {/* 对比度 */}
            <div>
              <label htmlFor="contrast" className="block text-sm font-medium text-gray-700 mb-2">{t('pixelArtGeneratorPage.contrast')} ({contrast})</label>
              <input
                type="range"
                id="contrast"
                min="-100"
                max="100"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>-100</span>
                <span>0</span>
                <span>+100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 动作按钮 */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          type="button"
          onClick={pixelateImage}
          disabled={!originalImage || isProcessing}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${!originalImage || isProcessing ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm' : 'bg-blue-500 text-white shadow-sm hover:shadow hover:bg-blue-600 active:bg-blue-700 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'}`}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {t('pixelArtGeneratorPage.processing')}
            </span>
          ) : (
            t('pixelArtGeneratorPage.generatePixelArt')
          )}
        </button>
        
        <button
          type="button"
          onClick={downloadImage}
          disabled={!pixelatedImage}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${!pixelatedImage ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm' : 'bg-blue-500 text-white shadow-sm hover:shadow hover:bg-blue-600 active:bg-blue-700 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'}`}
        >
          {t('pixelArtGeneratorPage.downloadImage')}
        </button>
        
        <button
          type="button"
          onClick={undo}
          disabled={currentHistoryIndex <= 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentHistoryIndex <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm' : 'bg-blue-500 text-white shadow-sm hover:shadow hover:bg-blue-600 active:bg-blue-700 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'}`}
        >
          {t('pixelArtGeneratorPage.undo')}
        </button>
        
        <button
          type="button"
          onClick={redo}
          disabled={currentHistoryIndex >= history.length - 1}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${currentHistoryIndex >= history.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm' : 'bg-blue-500 text-white shadow-sm hover:shadow hover:bg-blue-600 active:bg-blue-700 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'}`}
        >
          {t('pixelArtGeneratorPage.redo')}
        </button>
        
        <button
          type="button"
          onClick={resetAll}
          disabled={!originalImage}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${!originalImage ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-sm' : 'bg-blue-500 text-white shadow-sm hover:shadow hover:bg-blue-600 active:bg-blue-700 active:shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50'}`}
        >
          {t('pixelArtGeneratorPage.resetAll')}
        </button>
      </div>
      
      {/* 通知组件 */}
      {showNotifications && notificationMessage && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300 transform translate-x-0 ${notificationMessage.includes('成功') ? 'bg-green-50 text-green-800 border-l-4 border-green-500' : notificationMessage.includes('错误') ? 'bg-red-50 text-red-800 border-l-4 border-red-500' : 'bg-blue-50 text-blue-800 border-l-4 border-blue-500'}`}>
          <p className="font-medium">{notificationMessage}</p>
        </div>
      )}
      
      {/* 隐藏的Canvas元素 */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default PixelArtGenerator;