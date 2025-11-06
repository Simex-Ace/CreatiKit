'use client';

import React, { useRef, useState, useCallback } from 'react';

export default function BackgroundRemover() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [threshold, setThreshold] = useState<number>(50);
  const [bgColor, setBgColor] = useState<{ r: number; g: number; b: number }>({ r: 255, g: 255, b: 255 });
  const [isColorPickerActive, setIsColorPickerActive] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorPickerCanvasRef = useRef<HTMLCanvasElement>(null);

  // 处理文件上传
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedImage('');
      // 重置为默认白色背景
      setBgColor({ r: 255, g: 255, b: 255 });
    }
  };

  // 处理背景移除
  const removeBackground = useCallback(async () => {
    if (!image || !canvasRef.current) return;

    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // 设置canvas尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制原图
      ctx.drawImage(img, 0, 0);
      
      // 获取像素数据
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // 遍历像素，移除背景色
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // 计算与目标背景色的距离
        const distance = Math.sqrt(
          Math.pow(r - bgColor.r, 2) +
          Math.pow(g - bgColor.g, 2) +
          Math.pow(b - bgColor.b, 2)
        );
        
        // 如果在阈值范围内，设为透明
        if (distance < threshold) {
          data[i + 3] = 0; // Alpha通道设为0
        }
      }
      
      // 绘制处理后的图像
      ctx.putImageData(imageData, 0, 0);
      
      // 获取处理后的图像URL
      const processedUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedUrl);
    } catch (error) {
      console.error('处理图片时出错:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [image, previewUrl, bgColor, threshold]);

  // 下载处理后的图像
  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'no-background.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 处理取色器 - 使用浏览器的EyeDropper API
  const handleColorPick = async () => {
    try {
      // 检查浏览器是否支持EyeDropper API
      if ('EyeDropper' in window) {
        const eyeDropper = new (window as any).EyeDropper();
        setIsColorPickerActive(true); // 用于显示提示
        
        const result = await eyeDropper.open();
        
        // 解析颜色值
        const hexColor = result.sRGBHex;
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        // 更新背景色设置
        setBgColor({ r, g, b });
      } else {
        // 如果浏览器不支持，提供后备方案（使用原始的模态框方法）
        if (!previewUrl || !colorPickerCanvasRef.current) return;
        
        setIsColorPickerActive(true);
        const canvas = colorPickerCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
        };
        img.src = previewUrl;
      }
    } catch (err) {
      console.log('取色器取消或出错:', err);
    } finally {
      setIsColorPickerActive(false);
    }
  };

  // 后备取色方法（用于不支持EyeDropper API的浏览器）
  const handleCanvasColorPick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!colorPickerCanvasRef.current || !isColorPickerActive) return;
    
    const canvas = colorPickerCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    setBgColor({
      r: pixel[0],
      g: pixel[1],
      b: pixel[2]
    });
    
    // 关闭取色器
    setIsColorPickerActive(false);
  };

  // 快速预设颜色
  const presetColors = [
    { r: 255, g: 255, b: 255, name: '白色' },
    { r: 0, g: 0, b: 0, name: '黑色' },
    { r: 255, g: 0, b: 0, name: '红色' },
    { r: 0, g: 128, b: 0, name: '绿色' },
    { r: 0, g: 0, b: 255, name: '蓝色' },
    { r: 255, g: 255, b: 0, name: '黄色' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* 顶部标题 */}
        <div className="text-center mb-10">
          <div className="relative inline-block">
            <h1 className="text-4xl font-bold text-pink-600 mb-3 tracking-tight animate-bounce-in">
              ✨ 魔法背景移除 ✨
            </h1>
            {/* 装饰元素 */}
            <div className="absolute -top-6 -left-8 w-12 h-12 bg-yellow-200 rounded-full opacity-50 blur-sm"></div>
            <div className="absolute -top-4 -right-6 w-10 h-10 bg-blue-200 rounded-full opacity-50 blur-sm"></div>
          </div>
          <p className="text-purple-700 max-w-2xl mx-auto mt-4 text-lg">
            🎨 一键去除图片背景，让你的照片变得超可爱！简单易用，效果超棒～
          </p>
        </div>
        
        {/* 上传和控制面板 */}
        <div className="bg-white shadow-xl rounded-3xl p-6 mb-8 border-2 border-pink-200 transform transition-all duration-300 hover:shadow-2xl hover:shadow-pink-100 relative overflow-hidden">
          {/* 装饰元素 */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 blur-md"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-pink-100 to-yellow-100 rounded-full opacity-50 blur-md"></div>
          <div className="mb-6">
            <label 
              htmlFor="file-upload" 
              className="block text-sm font-medium text-gray-700 mb-3"
            >
              上传图片
            </label>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="border-2 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-pink-500 transition-colors duration-200 hover:shadow-md bg-gradient-to-br from-white to-purple-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-pink-500 mb-3 transform transition-transform duration-300 hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-purple-700 mb-2 font-medium">🎉 拖放图片到这里，或点击选择文件</p>
                <p className="text-pink-600 text-sm">支持 JPG, PNG, GIF 等常见图片格式～</p>
              </div>
            </div>
          </div>
          
          {previewUrl && (
            <div className="mb-6 space-y-6">
              <h2 className="text-xl font-semibold text-pink-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                图片处理设置
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 阈值设置 */}
                <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-100 shadow-sm">
                  <label className="block text-sm font-medium text-purple-700 mb-3 flex justify-between">
                    <span>🪄 魔法强度</span>
                    <span className="text-pink-600 font-medium">{threshold}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-3 bg-purple-200 rounded-full appearance-none cursor-pointer accent-pink-500 transform transition-all duration-300 hover:scale-105"
                  />
                  <div className="flex justify-between text-xs text-purple-600 mt-2">
                    <span>🎯 精确</span>
                    <span>🌈 宽松</span>
                  </div>
                </div>
                
                {/* 颜色选择 */}
                <div className="bg-pink-50 rounded-2xl p-5 border-2 border-pink-100 shadow-sm">
                  <label className="block text-sm font-medium text-pink-700 mb-3">
                    要移除的颜色 🎨
                  </label>
                  
                  <div className="flex flex-col gap-4">
                    {/* 颜色预览和取色器按钮 */}
                <div className="flex items-center gap-3">
                  <div 
                    className="w-24 h-24 rounded-2xl border-2 border-pink-400 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-pink-200 relative overflow-hidden cursor-pointer transform hover:rotate-1"
                    style={{ 
                      backgroundColor: `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`,
                      backgroundImage: 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px' // 透明背景预览
                    }}
                    onClick={handleColorPick}
                  >
                  </div>
                  {/* RGB值显示在下方 */}
                  <div className="text-center font-mono text-sm text-pink-700 mt-1 w-full max-w-[120px] font-medium">
                    #{[bgColor.r, bgColor.g, bgColor.b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}
                  </div>
                      <button
                        onClick={handleColorPick}
                        className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-4 py-3 rounded-2xl transition-all duration-300 ease-in-out font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:scale-105"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M13.104 8.222a1 1 0 01.892 1.784c-.271.152-.553.288-.843.402-.29.113-.592.17-.897.17a1 1 0 01-.892-1.784c.271-.152.553-.288.843-.402.29-.113.592-.17.897-.17a1 1 0 01.892 1.784zm-1.89-1.784a1 1 0 00-1.784-.892c-.152.271-.288.553-.402.843-.113.29-.17.592-.17.897a1 1 0 001.784.892c.152-.271.288-.553.402-.843.113-.29.17-.592.17-.897a1 1 0 00-.892-1.784zm3 1.784a1 1 0 01.892 1.784c-.271.152-.553.288-.843.402-.29.113-.592.17-.897.17a1 1 0 01-.892-1.784c.271-.152.553-.288.843-.402.29-.113.592-.17.897-.17a1 1 0 01.892 1.784zM13 9a1 1 0 100 2h4a1 1 0 100-2h-4zm-3-7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm11 7a1 1 0 100 2h-2a1 1 0 100-2h2zM9 11a1 1 0 100 2H5a1 1 0 100-2h4zm7-7a1 1 0 110 2H9a1 1 0 110-2h7zM7 12a1 1 0 100 2H3a1 1 0 100-2h4zm4-8a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        取色笔
                      </button>
                    </div>
                    
                    {/* 颜色值输入 - 参考调色板样式 */}
                    <div className="mt-4 space-y-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-purple-700 mb-1">🌈 十六进制颜色</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={`#${[bgColor.r, bgColor.g, bgColor.b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`}
                            onChange={(e) => {
                              const hex = e.target.value.replace('#', '').toUpperCase();
                              if (/^[0-9A-F]{6}$/.test(hex)) {
                                const r = parseInt(hex.slice(0, 2), 16);
                                const g = parseInt(hex.slice(2, 4), 16);
                                const b = parseInt(hex.slice(4, 6), 16);
                                setBgColor({ r, g, b });
                              }
                            }}
                            className="w-full p-2 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all font-mono bg-white shadow-sm"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`#${[bgColor.r, bgColor.g, bgColor.b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`);
                            }}
                            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors duration-200 shadow-sm hover:shadow"
                            title="复制颜色值"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-pink-600 mb-1 font-medium">🔴 R</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={bgColor.r}
                            onChange={(e) => setBgColor({ ...bgColor, r: Number(e.target.value) })}
                            className="w-full p-2 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-green-600 mb-1 font-medium">🟢 G</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={bgColor.g}
                            onChange={(e) => setBgColor({ ...bgColor, g: Number(e.target.value) })}
                            className="w-full p-2 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-blue-600 mb-1 font-medium">🔵 B</label>
                          <input
                            type="number"
                            min="0"
                            max="255"
                            value={bgColor.b}
                            onChange={(e) => setBgColor({ ...bgColor, b: Number(e.target.value) })}
                            className="w-full p-2 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 预设颜色 - 参考调色板样式 */}
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-purple-700 mb-2">🎨 快捷颜色</label>
                      <div className="flex gap-4 flex-wrap">
                        {presetColors.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setBgColor(color)}
                            className={`w-12 h-12 rounded-xl shadow-md cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg relative overflow-hidden transform hover:-rotate-3 ${bgColor.r === color.r && bgColor.g === color.g && bgColor.b === color.b ? 'border-2 border-pink-500 scale-110 ring-4 ring-pink-100' : 'border-2 border-purple-100'}`}
                            style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
                            title={color.name}
                          >
                            {bgColor.r === color.r && bgColor.g === color.g && bgColor.b === color.b && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="absolute bottom-1 right-1 h-4 w-4 text-white bg-indigo-600 rounded-full" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-4 pt-2">
            {previewUrl && (
              <button
                onClick={removeBackground}
                disabled={isProcessing}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:from-pink-400 disabled:to-purple-400 text-white px-8 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              >
                {isProcessing ? (
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                {isProcessing ? '处理中...' : '移除背景'}
              </button>
            )}
            {processedImage && (
              <button
                onClick={downloadImage}
                className="bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white px-8 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                下载图片
              </button>
            )}
            {previewUrl && processedImage && (
              <button
                onClick={() => setProcessedImage('')}
                className="bg-gradient-to-r from-orange-200 to-yellow-200 hover:from-orange-300 hover:to-yellow-300 text-orange-700 px-8 py-3 rounded-2xl transition-all duration-300 flex items-center gap-2 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                重新处理
              </button>
            )}
          </div>
        </div>
        
        {/* 图片预览区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {previewUrl && (
            <div className="bg-white shadow-lg rounded-3xl p-6 border-2 border-purple-100 transform transition-all duration-300 hover:shadow-xl hover:shadow-purple-100 relative overflow-hidden">
              <h2 className="text-lg font-semibold text-purple-700 mb-4 text-center flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                原始图片
              </h2>
              <div className="relative flex justify-center items-center min-h-[300px] bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl overflow-hidden border-2 border-purple-100 shadow-sm">
                <img
                  src={previewUrl}
                  alt="原始图片"
                  className="max-w-full max-h-[300px] object-contain transition-transform duration-200 hover:scale-105"
                />
              </div>
            </div>
          )}
          
          {processedImage && (
            <div className="bg-white shadow-lg rounded-3xl p-6 border-2 border-pink-100 transform transition-all duration-300 hover:shadow-xl hover:shadow-pink-100 relative overflow-hidden">
              <h2 className="text-lg font-semibold text-pink-600 mb-4 text-center flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                处理后图片
              </h2>
              <div className="relative flex justify-center items-center min-h-[300px] bg-gradient-to-br from-blue-50 to-pink-50 rounded-2xl overflow-hidden border-2 border-pink-100 shadow-sm">
                {/* 透明背景图案 */}
                <div className="absolute inset-0 opacity-25 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg2MHY2MEgwVjB6bTE1IDE1aDMwdjMwSDBNMCAxNWgzMHYzMEgweiIvPjwvZz48L2c+PC9zdmc+')]"></div>
                <img
                  src={processedImage}
                  alt="处理后图片"
                  className="max-w-full max-h-[300px] object-contain transition-transform duration-200 hover:scale-105 relative z-10"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* 取色模式指示器 - 只在使用EyeDropper API时显示 */}
        {isColorPickerActive && 'EyeDropper' in window && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-10 py-5 rounded-full text-lg font-medium backdrop-blur-sm shadow-2xl animate-pulse transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M13.104 8.222a1 1 0 01.892 1.784c-.271.152-.553.288-.843.402-.29.113-.592.17-.897.17a1 1 0 01-.892-1.784c.271-.152.553-.288.843-.402.29-.113.592-.17.897-.17a1 1 0 01.892 1.784zm-1.89-1.784a1 1 0 00-1.784-.892c-.152.271-.288.553-.402.843-.113.29-.17.592-.17.897a1 1 0 001.784.892c.152-.271.288-.553.402-.843.113-.29.17-.592.17-.897a1 1 0 00-.892-1.784zm3 1.784a1 1 0 01.892 1.784c-.271.152-.553.288-.843.402-.29.113-.592.17-.897.17a1 1 0 01-.892-1.784c.271-.152.553-.288.843-.402.29-.113.592-.17.897-.17a1 1 0 01.892 1.784zM13 9a1 1 0 100 2h4a1 1 0 100-2h-4zm-3-7a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm11 7a1 1 0 100 2h-2a1 1 0 100-2h2zM9 11a1 1 0 100 2H5a1 1 0 100-2h4zm7-7a1 1 0 110 2H9a1 1 0 110-2h7zM7 12a1 1 0 100 2H3a1 1 0 100-2h4zm4-8a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                🎨 点击屏幕任意位置取色（按 Esc 取消）
              </div>
            </div>
          </div>
        )}
        
        {/* 后备取色器模态框（用于不支持EyeDropper API的浏览器） */}
        {isColorPickerActive && !('EyeDropper' in window) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border-2 border-pink-200">
              <div className="p-4 border-b border-pink-100 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-pink-600">🎨 从图片中选择颜色</h3>
                <button
                  onClick={() => setIsColorPickerActive(false)}
                  className="text-pink-500 hover:text-pink-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="text-center mb-4 text-purple-700 font-medium">
                  ✨ 点击图片中的任意位置来选择要移除的颜色
                </div>
                <div className="flex justify-center">
                  <canvas
                    ref={colorPickerCanvasRef}
                    onClick={handleCanvasColorPick}
                    className="cursor-crosshair border-2 border-pink-200 rounded-2xl max-w-full max-h-[60vh] object-contain shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Canvas元素 */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  );
}