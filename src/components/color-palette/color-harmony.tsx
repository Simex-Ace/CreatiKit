import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ColorHarmonyProps {
  baseColor: string;
  onColorSelect: (colors: string[]) => void;
}

export function ColorHarmony({ baseColor, onColorSelect }: ColorHarmonyProps) {
  const [harmonyType, setHarmonyType] = useState('analogous');

  // 色彩和谐算法
  const generateHarmonyColors = (base: string, type: string): string[] => {
    // 将十六进制转换为HSL以便于色彩计算
    const hexToHSL = (hex: string) => {
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
      }

      r /= 255;
      g /= 255;
      b /= 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
      }

      return { h, s, l };
    };

    // 将HSL转换回十六进制
    const hslToHex = (h: number, s: number, l: number): string => {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h / 360 + 1/3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, h / 360 - 1/3);
      }

      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };

      return '#' + toHex(r) + toHex(g) + toHex(b);
    };

    const hsl = hexToHSL(base);
    const colors = [base];

    switch (type) {
      case 'monochromatic':
        // 单色 - 同一色相，不同亮度和饱和度
        for (let i = 1; i <= 4; i++) {
          const lightness = Math.max(0, Math.min(1, hsl.l + (i - 2) * 0.15));
          const saturation = Math.max(0, Math.min(1, hsl.s + (i - 2) * 0.1));
          colors.push(hslToHex(hsl.h, saturation, lightness));
        }
        break;
      case 'analogous':
        // 类似色 - 色相环上相邻的颜色
        for (let i = 1; i <= 4; i++) {
          const hue = (hsl.h + (i - 2) * 30 + 360) % 360;
          colors.push(hslToHex(hue, hsl.s, hsl.l));
        }
        break;
      case 'complementary':
        // 互补色 - 色相环上相对的颜色
        colors.push(hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l));
        // 添加一些过渡色
        for (let i = 1; i <= 3; i++) {
          const hue = (hsl.h + i * 60) % 360;
          colors.push(hslToHex(hue, hsl.s, hsl.l));
        }
        break;
      case 'triadic':
        // 三角色 - 色相环上均匀分布的三个颜色
        for (let i = 1; i <= 4; i++) {
          const hue = (hsl.h + i * 90) % 360;
          colors.push(hslToHex(hue, hsl.s, hsl.l));
        }
        break;
      case 'tetradic':
        // 四角色 - 两对互补色
        for (let i = 1; i <= 4; i++) {
          const hue = (hsl.h + i * 60) % 360;
          colors.push(hslToHex(hue, hsl.s, hsl.l));
        }
        break;
    }

    return colors;
  };

  const harmonyColors = generateHarmonyColors(baseColor, harmonyType);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">配色方案类型</label>
        <select 
          value={harmonyType} 
          onChange={(e) => setHarmonyType(e.target.value)} 
          className="w-[180px] px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="monochromatic">单色</option>
          <option value="analogous">类似色</option>
          <option value="complementary">互补色</option>
          <option value="triadic">三角色</option>
          <option value="tetradic">四角色</option>
        </select>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {harmonyColors.map((color, index) => (
          <div
            key={index}
            className="aspect-square rounded-md cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: color }}
            onClick={() => onColorSelect(harmonyColors)}
          />
        ))}
      </div>
    </div>
  );
}