'use client'

import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface HexColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

// 十六进制转HSL
function hexToHsl(hex: string): [number, number, number] {
  // 移除#号
  hex = hex.replace('#', '');
  
  // 解析RGB值
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  // 计算最大值和最小值
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

// RGB转十六进制
function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 十六进制转RGB
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ];
}

export function HexColorPicker({ color, onChange }: HexColorPickerProps) {
  const [hsl, setHsl] = useState<[number, number, number]>([0, 0, 0]);
  const [rgb, setRgb] = useState<[number, number, number]>([0, 0, 0]);
  const [activeTab, setActiveTab] = useState<'hsl' | 'rgb'>('hsl');

  // 当外部color变化时更新内部状态
  useEffect(() => {
    try {
      setHsl(hexToHsl(color));
      setRgb(hexToRgb(color));
    } catch (error) {
      console.error('Invalid color format:', error);
    }
  }, [color]);

  // 处理HSL变化
  const handleHslChange = (index: number, value: number) => {
    const newHsl = [...hsl] as [number, number, number];
    newHsl[index] = value;
    setHsl(newHsl);
    const newHex = hslToHex(newHsl[0], newHsl[1], newHsl[2]);
    onChange(newHex);
  };

  // 处理RGB变化
  const handleRgbChange = (index: number, value: number) => {
    const newRgb = [...rgb] as [number, number, number];
    newRgb[index] = value;
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb[0], newRgb[1], newRgb[2]);
    onChange(newHex);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${activeTab === 'hsl' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-800'}`}
          onClick={() => setActiveTab('hsl')}
        >
          HSL
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md transition-colors ${activeTab === 'rgb' ? 'bg-primary text-primary-foreground' : 'bg-gray-100 dark:bg-gray-800'}`}
          onClick={() => setActiveTab('rgb')}
        >
          RGB
        </button>
      </div>

      {activeTab === 'hsl' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="hue">色相 (H)</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{hsl[0]}°</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <Slider
                  id="hue"
                  min={0}
                  max={360}
                  step={1}
                  value={[hsl[0]]}
                  onValueChange={(value) => handleHslChange(0, value[0])}
                  className="h-2"
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: hslToHex(hsl[0], 100, 50) }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="saturation">饱和度 (S)</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{hsl[1]}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <Slider
                  id="saturation"
                  min={0}
                  max={100}
                  step={1}
                  value={[hsl[1]]}
                  onValueChange={(value) => handleHslChange(1, value[0])}
                  className="h-2"
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: hslToHex(hsl[0], hsl[1], 50) }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="lightness">亮度 (L)</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{hsl[2]}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <Slider
                  id="lightness"
                  min={0}
                  max={100}
                  step={1}
                  value={[hsl[2]]}
                  onValueChange={(value) => handleHslChange(2, value[0])}
                  className="h-2"
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: hslToHex(hsl[0], hsl[1], hsl[2]) }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rgb' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="red">红色 (R)</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{rgb[0]}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <Slider
                  id="red"
                  min={0}
                  max={255}
                  step={1}
                  value={[rgb[0]]}
                  onValueChange={(value) => handleRgbChange(0, value[0])}
                  className="h-2"
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: rgbToHex(rgb[0], 0, 0) }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="green">绿色 (G)</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{rgb[1]}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <Slider
                  id="green"
                  min={0}
                  max={255}
                  step={1}
                  value={[rgb[1]]}
                  onValueChange={(value) => handleRgbChange(1, value[0])}
                  className="h-2"
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: rgbToHex(0, rgb[1], 0) }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="blue">蓝色 (B)</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{rgb[2]}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-full">
                <Slider
                  id="blue"
                  min={0}
                  max={255}
                  step={1}
                  value={[rgb[2]]}
                  onValueChange={(value) => handleRgbChange(2, value[0])}
                  className="h-2"
                />
              </div>
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700"
                style={{ backgroundColor: rgbToHex(0, 0, rgb[2]) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}