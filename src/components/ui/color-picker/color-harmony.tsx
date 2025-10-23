'use client'

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ColorHarmonyGeneratorProps {
  baseColor: string;
  harmonyType: string;
  onHarmonyTypeChange: (type: string) => void;
  onColorSelect: (colors: string[]) => void;
}

type HarmonyType = 'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic' | 'monochromatic';

// 十六进制转HSL
function hexToHsl(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
      case g: h = ((b - r) / d + 2) * 60; break;
      case b: h = ((r - g) / d + 4) * 60; break;
    }
  }
  
  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

// HSL转十六进制
function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // 灰度
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// 计算类似色
function generateAnalogousColors(h: number, s: number, l: number): string[] {
  const colors: string[] = [];
  const step = 30; // 30度间隔
  
  for (let i = -1; i <= 1; i++) {
    const newH = (h + step * i + 360) % 360;
    colors.push(hslToHex(newH, s, l));
  }
  
  return colors;
}

// 计算互补色
function generateComplementaryColors(h: number, s: number, l: number): string[] {
  const complementaryH = (h + 180) % 360;
  return [
    hslToHex(h, s, l),
    hslToHex(complementaryH, s, l)
  ];
}

// 计算三角色
function generateTriadicColors(h: number, s: number, l: number): string[] {
  const colors: string[] = [];
  const step = 120; // 120度间隔
  
  for (let i = 0; i < 3; i++) {
    const newH = (h + step * i) % 360;
    colors.push(hslToHex(newH, s, l));
  }
  
  return colors;
}

// 计算分裂互补色
function generateSplitComplementaryColors(h: number, s: number, l: number): string[] {
  const complementaryH = (h + 180) % 360;
  const split1H = (complementaryH - 30 + 360) % 360;
  const split2H = (complementaryH + 30) % 360;
  
  return [
    hslToHex(h, s, l),
    hslToHex(split1H, s, l),
    hslToHex(split2H, s, l)
  ];
}

// 计算四角色
function generateTetradicColors(h: number, s: number, l: number): string[] {
  const colors: string[] = [];
  const step = 90; // 90度间隔
  
  for (let i = 0; i < 4; i++) {
    const newH = (h + step * i) % 360;
    colors.push(hslToHex(newH, s, l));
  }
  
  return colors;
}

// 计算单色变体
function generateMonochromaticColors(h: number, s: number, l: number): string[] {
  const colors: string[] = [];
  const lightnessSteps = [0.2, 0.4, 0.6, 0.8];
  
  lightnessSteps.forEach(step => {
    colors.push(hslToHex(h, s * 0.8, l * step));
  });
  colors.push(hslToHex(h, s, l)); // 添加原始亮度
  
  return colors;
}

// 生成配色方案
function generateHarmonyColors(baseColor: string, harmonyType: HarmonyType): string[] {
  try {
    const [h, s, l] = hexToHsl(baseColor);
    
    switch (harmonyType) {
      case 'analogous':
        return generateAnalogousColors(h, s, l);
      case 'complementary':
        return generateComplementaryColors(h, s, l);
      case 'triadic':
        return generateTriadicColors(h, s, l);
      case 'split-complementary':
        return generateSplitComplementaryColors(h, s, l);
      case 'tetradic':
        return generateTetradicColors(h, s, l);
      case 'monochromatic':
        return generateMonochromaticColors(h, s, l);
      default:
        return [baseColor];
    }
  } catch (error) {
    console.error('生成配色方案失败:', error);
    return [baseColor];
  }
}

// 获取配色方案说明
function getHarmonyDescription(type: HarmonyType): string {
  const descriptions: Record<HarmonyType, string> = {
    'analogous': '类似色：色相环上相邻的颜色，营造和谐、协调的感觉。',
    'complementary': '互补色：色相环上相对的颜色，形成强烈对比。',
    'triadic': '三角色：色相环上均匀分布的三种颜色，色彩丰富且平衡。',
    'split-complementary': '分裂互补色：选择一个颜色和其互补色相邻的两种颜色，既有对比又不刺眼。',
    'tetradic': '四角色：色相环上两对互补色，色彩丰富但需要精心平衡。',
    'monochromatic': '单色：同一色相的不同亮度变体，简洁统一。'
  };
  
  return descriptions[type] || '';
}

export function ColorHarmonyGenerator({
  baseColor,
  harmonyType,
  onHarmonyTypeChange,
  onColorSelect
}: ColorHarmonyGeneratorProps) {
  const [harmonyColors, setHarmonyColors] = useState<string[]>([baseColor]);

  // 当基础颜色或配色类型变化时，重新生成配色
  useEffect(() => {
    const colors = generateHarmonyColors(baseColor, harmonyType as HarmonyType);
    setHarmonyColors(colors);
  }, [baseColor, harmonyType]);

  // 应用配色方案到调色板
  const applyHarmonyColors = () => {
    onColorSelect(harmonyColors);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">配色方案类型</h3>
        
        <Select 
          value={harmonyType} 
          onValueChange={(value) => onHarmonyTypeChange(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择配色方案" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="analogous">类似色 (Analogous)</SelectItem>
            <SelectItem value="complementary">互补色 (Complementary)</SelectItem>
            <SelectItem value="triadic">三角色 (Triadic)</SelectItem>
            <SelectItem value="split-complementary">分裂互补色 (Split Complementary)</SelectItem>
            <SelectItem value="tetradic">四角色 (Tetradic)</SelectItem>
            <SelectItem value="monochromatic">单色 (Monochromatic)</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {getHarmonyDescription(harmonyType as HarmonyType)}
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">生成的配色方案</h3>
        
        <div className="grid grid-cols-5 gap-2">
          {harmonyColors.map((color, index) => {
            // 确定文本颜色（基于背景色亮度）
            const [r, g, b] = hexToHsl(color);
            const textColor = r < 50 ? 'text-white' : 'text-gray-900';
            
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`w-full aspect-square rounded-lg shadow-md cursor-pointer transition-transform hover:scale-105 flex items-center justify-center font-mono text-xs ${textColor}`}
                      style={{ backgroundColor: color }}
                      onClick={() => onColorSelect([...harmonyColors])}
                    >
                      {color.toUpperCase()}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
        
        <button
          onClick={applyHarmonyColors}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          应用到调色板
        </button>
      </div>
      
      {/* 配色方案预览 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">配色预览</h3>
        
        <div className="space-y-2">
          {/* 色块堆叠预览 */}
          <div className="h-24 rounded-lg overflow-hidden flex">
            {harmonyColors.map((color, index) => (
              <div 
                key={`stack-${index}`}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          
          {/* 卡片样式预览 */}
          <div className="grid grid-cols-2 gap-4">
            {harmonyColors.slice(0, 2).map((color, index) => {
              const [h, s, l] = hexToHsl(color);
              const textColor = l < 50 ? 'text-white' : 'text-gray-900';
              
              return (
                <Card key={`card-${index}`} className="overflow-hidden">
                  <div 
                    className="h-24" 
                    style={{ backgroundColor: color }}
                  />
                  <div className={`p-3 ${textColor}`}>
                    <p className="font-medium">预览卡片</p>
                    <p className="text-sm opacity-80">背景色: {color}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}