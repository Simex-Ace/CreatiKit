'use client'

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContrastCheckerProps {
  foregroundColor: string;
  backgroundColor: string;
  onForegroundColorChange: (color: string) => void;
  onBackgroundColorChange: (color: string) => void;
}

// 十六进制转RGB
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

// RGB转十六进制
function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 计算相对亮度
function getRelativeLuminance(r: number, g: number, b: number): number {
  // 将RGB值转换为0-1范围
  const [R, G, B] = [r, g, b].map(component => {
    const value = component / 255;
    return value <= 0.03928 
      ? value / 12.92 
      : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  
  // 计算相对亮度
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// 计算对比度比率
function calculateContrastRatio(foreground: string, background: string): number {
  try {
    const [r1, g1, b1] = hexToRgb(foreground);
    const [r2, g2, b2] = hexToRgb(background);
    
    const L1 = getRelativeLuminance(r1, g1, b1); // 前景色相对亮度
    const L2 = getRelativeLuminance(r2, g2, b2); // 背景色相对亮度
    
    // 确保L1是较亮的颜色，L2是较暗的颜色
    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);
    
    // 对比度比率计算公式：(L1 + 0.05) / (L2 + 0.05)，其中L1 >= L2
    const ratio = (lighter + 0.05) / (darker + 0.05);
    
    return Math.round(ratio * 100) / 100; // 保留两位小数
  } catch (error) {
    console.error('计算对比度失败:', error);
    return 1;
  }
}

// 检查对比度是否符合WCAG标准
function checkWCAGCompliance(contrastRatio: number): {
  normalText: { AA: boolean; AAA: boolean };
  largeText: { AA: boolean; AAA: boolean };
  uiComponents: boolean;
} {
  return {
    normalText: {
      AA: contrastRatio >= 4.5,     // 普通文本AA级别：4.5:1
      AAA: contrastRatio >= 7.0     // 普通文本AAA级别：7:1
    },
    largeText: {
      AA: contrastRatio >= 3.0,     // 大文本AA级别：3:1
      AAA: contrastRatio >= 4.5     // 大文本AAA级别：4.5:1
    },
    uiComponents: contrastRatio >= 3.0  // UI组件和图标：3:1
  };
}

// 获取对比度等级描述
function getContrastLevel(contrastRatio: number): string {
  if (contrastRatio >= 7) return 'AAA级（最佳）';
  if (contrastRatio >= 4.5) return 'AA级（良好）';
  if (contrastRatio >= 3) return 'AA级大文本（可接受）';
  return '不符合标准（需要改进）';
}

// 生成相反颜色 - 优化黑白颜色反转逻辑
function generateOppositeColor(color: string): string {
  // 对于黑白这两个极端颜色，反转和交换的效果应该是一样的
  // 确保黑色和白色能够正确互相反转
  if (color === '#000000') {
    return '#FFFFFF'; // 黑色反转成白色（与交换效果相同）
  }
  if (color === '#FFFFFF') {
    return '#000000'; // 白色反转成黑色（与交换效果相同）
  }
  
  // 对于接近黑色的颜色，直接反转成白色
  try {
    const [r, g, b] = hexToRgb(color);
    
    // 对于暗色和亮色，简化反转逻辑，确保与黑白交换概念一致
    if (r < 100 && g < 100 && b < 100) {
      return '#FFFFFF'; // 深色反转成白色
    }
    if (r > 155 && g > 155 && b > 155) {
      return '#000000'; // 亮色反转成黑色
    }
    
    // 对于其他颜色，使用标准的RGB反转
    return rgbToHex(255 - r, 255 - g, 255 - b);
  } catch (error) {
    // 错误处理：返回白色
    return '#FFFFFF';
  }
}

// 生成更易读的文本颜色
function generateReadableTextColor(backgroundColor: string): string {
  const [r, g, b] = hexToRgb(backgroundColor);
  const luminance = getRelativeLuminance(r, g, b);
  // 如果背景较亮，返回黑色；如果背景较暗，返回白色
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function ContrastChecker({
  foregroundColor,
  backgroundColor,
  onForegroundColorChange,
  onBackgroundColorChange
}: ContrastCheckerProps) {
  const [contrastRatio, setContrastRatio] = useState(1);
  const [compliance, setCompliance] = useState({
    normalText: { AA: false, AAA: false },
    largeText: { AA: false, AAA: false },
    uiComponents: false
  });
  const [contrastLevel, setContrastLevel] = useState('');

  // 当颜色变化时，重新计算对比度
  useEffect(() => {
    const ratio = calculateContrastRatio(foregroundColor, backgroundColor);
    setContrastRatio(ratio);
    setCompliance(checkWCAGCompliance(ratio));
    setContrastLevel(getContrastLevel(ratio));
  }, [foregroundColor, backgroundColor]);

  // 交换前景色和背景色
  const swapColors = () => {
    onForegroundColorChange(backgroundColor);
    onBackgroundColorChange(foregroundColor);
  };

  // 自动调整对比度
  const autoAdjustContrast = () => {
    const readableTextColor = generateReadableTextColor(backgroundColor);
    onForegroundColorChange(readableTextColor);
  };

  // 同时反转前景色和背景色
  const invertColors = () => {
    const invertedForegroundColor = generateOppositeColor(foregroundColor);
    const invertedBackgroundColor = generateOppositeColor(backgroundColor);
    
    // 同时更新前景色和背景色
    onForegroundColorChange(invertedForegroundColor);
    onBackgroundColorChange(invertedBackgroundColor);
  };

  // 获取对比度等级对应的样式类
  const getContrastLevelClass = () => {
    if (contrastRatio >= 7) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    if (contrastRatio >= 4.5) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    if (contrastRatio >= 3) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  };

  return (
    <div className="space-y-6">
      {/* 对比度信息 */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">对比度检查</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getContrastLevelClass()}`}>
            {contrastRatio.toFixed(2)}:1
          </div>
        </div>
        
        <Alert className={getContrastLevelClass().replace('dark:', '')}>
          <AlertDescription className="text-sm">
            {contrastLevel}
          </AlertDescription>
        </Alert>
        
        {/* WCAG标准检查结果 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800 space-y-2">
            <h4 className="font-medium">普通文本 (≤ 18pt)</h4>
            <div className="flex justify-between">
              <span>AA级标准 (4.5:1)</span>
              <span className={compliance.normalText.AA ? 'text-green-500' : 'text-red-500'}>
                {compliance.normalText.AA ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>AAA级标准 (7:1)</span>
              <span className={compliance.normalText.AAA ? 'text-green-500' : 'text-red-500'}>
                {compliance.normalText.AAA ? '✓' : '✗'}
              </span>
            </div>
          </div>
          
          <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800 space-y-2">
            <h4 className="font-medium">大文本 (&gt; 18pt)</h4>
            <div className="flex justify-between">
              <span>AA级标准 (3:1)</span>
              <span className={compliance.largeText.AA ? 'text-green-500' : 'text-red-500'}>
                {compliance.largeText.AA ? '✓' : '✗'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>AAA级标准 (4.5:1)</span>
              <span className={compliance.largeText.AAA ? 'text-green-500' : 'text-red-500'}>
                {compliance.largeText.AAA ? '✓' : '✗'}
              </span>
            </div>
          </div>
          
          <div className="p-3 rounded-md bg-gray-100 dark:bg-gray-800 space-y-2">
            <h4 className="font-medium">UI组件和图标</h4>
            <div className="flex justify-between">
              <span>最低标准 (3:1)</span>
              <span className={compliance.uiComponents ? 'text-green-500' : 'text-red-500'}>
                {compliance.uiComponents ? '✓' : '✗'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 颜色选择器 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="foreground-color">前景色（文本/元素）</Label>
          <div className="flex gap-2">
            <input
              id="foreground-color"
              type="color"
              value={foregroundColor}
              onChange={(e) => onForegroundColorChange(e.target.value)}
              className="w-10 h-10 border-0 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={foregroundColor}
              onChange={(e) => onForegroundColorChange(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="background-color">背景色</Label>
          <div className="flex gap-2">
            <input
              id="background-color"
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="w-10 h-10 border-0 rounded-md cursor-pointer"
            />
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={swapColors}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
        >
          交换颜色
        </button>
        <button
          onClick={autoAdjustContrast}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
        >
          自动调整文本颜色
        </button>
        <button
          onClick={invertColors}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
        >
          反转颜色
        </button>
      </div>
      
      {/* 对比度预览 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">对比度预览</h3>
        
        <div className="space-y-4">
          {/* 文本对比度预览 */}
          <Card className="overflow-hidden">
            <div 
              className="p-6" 
              style={{ backgroundColor: backgroundColor }}
            >
              <div className="space-y-4" style={{ color: foregroundColor }}>
                <p className="text-xl font-normal">普通文本预览 - 16pt</p>
                <p className="text-2xl font-normal">大文本预览 - 24pt</p>
                <p className="text-sm font-normal">小号文本预览 - 12pt</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: foregroundColor }} />
                  <span>小图标预览</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* 按钮预览 */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <button 
                className="w-full py-4 text-center font-medium" 
                style={{ backgroundColor: backgroundColor, color: foregroundColor }}
              >
                按钮预览
              </button>
            </Card>
            <Card className="overflow-hidden">
              <button 
                className="w-full py-4 text-center font-medium" 
                style={{ backgroundColor: foregroundColor, color: backgroundColor }}
              >
                反转按钮
              </button>
            </Card>
          </div>
        </div>
      </div>
      
      {/* WCAG标准说明 */}
      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">WCAG对比度标准说明：</h4>
        <p>• AA级别：普通文本对比度至少4.5:1，大文本至少3:1</p>
        <p>• AAA级别：普通文本对比度至少7:1，大文本至少4.5:1</p>
        <p>• UI组件和图标：对比度至少3:1</p>
        <p>• 大文本定义：18pt及以上，或14pt粗体及以上</p>
      </div>
    </div>
  );
}