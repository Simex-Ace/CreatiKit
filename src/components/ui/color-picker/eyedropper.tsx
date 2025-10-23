'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Eye, AlertCircle } from 'lucide-react';

interface EyedropperProps {
  onColorPick: (color: string) => void;
}

// 辅助函数：十六进制转RGB
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

// 辅助函数：RGB转十六进制
function rgbToHex(r: number, g: number, b: number): string {
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 辅助函数：获取鼠标位置的颜色（回退方案）
async function getColorFromCanvas(x: number, y: number): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('无法创建Canvas上下文');
  }
  
  try {
    const screenshot = await navigator.mediaDevices.getDisplayMedia({
      video: {
        width: window.screen.width,
        height: window.screen.height
      },
      audio: false
    });
    
    const video = document.createElement('video');
    video.srcObject = screenshot;
    
    return new Promise((resolve) => {
      video.onloadedmetadata = () => {
        context.drawImage(video, -x, -y, window.screen.width, window.screen.height);
        const imageData = context.getImageData(0, 0, 1, 1).data;
        const hexColor = rgbToHex(imageData[0], imageData[1], imageData[2]);
        
        // 停止屏幕共享
        screenshot.getTracks().forEach(track => track.stop());
        resolve(hexColor);
      };
    });
  } catch (error) {
    console.error('屏幕共享失败:', error);
    throw new Error('无法获取屏幕颜色');
  }
}

export function Eyedropper({ onColorPick }: EyedropperProps) {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEyeDropperAPI, setHasEyeDropperAPI] = useState(false);

  // 检查浏览器是否支持EyeDropper API
  useEffect(() => {
    setHasEyeDropperAPI('EyeDropper' in window);
  }, []);

  // 使用原生EyeDropper API
  const useNativeEyeDropper = async () => {
    if ('EyeDropper' in window) {
      try {
        setIsActive(true);
        setError(null);
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        const color = result.sRGBHex;
        onColorPick(color);
      } catch (err) {
        // 用户取消取色不算错误
        if ((err as Error).name !== 'AbortError') {
          setError('取色失败，请重试');
          console.error('EyeDropper错误:', err);
        }
      } finally {
        setIsActive(false);
      }
    }
  };

  // 使用回退方案（仅在支持屏幕共享时）
  const useFallbackEyeDropper = async () => {
    try {
      setIsActive(true);
      setError(null);
      
      // 提示用户点击屏幕
      const message = document.createElement('div');
      message.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-none';
      message.innerHTML = `
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl text-center">
          <p className="text-lg font-medium mb-2">点击屏幕上的任意位置进行取色</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">按ESC键取消</p>
        </div>
      `;
      document.body.appendChild(message);
      
      // 创建十字光标
      const cursor = document.createElement('div');
      cursor.className = 'fixed w-40 h-px bg-red-500 left-1/2 top-0 -translate-x-1/2 pointer-events-none';
      cursor.style.zIndex = '60';
      cursor.style.pointerEvents = 'none';
      const cursor2 = document.createElement('div');
      cursor2.className = 'fixed w-px h-40 bg-red-500 top-1/2 left-0 -translate-y-1/2 pointer-events-none';
      cursor2.style.zIndex = '60';
      cursor2.style.pointerEvents = 'none';
      document.body.appendChild(cursor);
      document.body.appendChild(cursor2);
      
      // 更新十字光标位置
      const updateCursor = (e: MouseEvent) => {
        cursor.style.left = `${e.clientX}px`;
        cursor2.style.top = `${e.clientY}px`;
      };
      window.addEventListener('mousemove', updateCursor);
      
      // 处理鼠标点击
      const handleClick = async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          const color = await getColorFromCanvas(e.clientX, e.clientY);
          onColorPick(color);
        } catch (err) {
          setError('屏幕取色失败，请使用原生取色器');
          console.error('回退取色器错误:', err);
        } finally {
          cleanup();
        }
      };
      
      // 处理ESC键取消
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          cleanup();
        }
      };
      
      // 清理函数
      const cleanup = () => {
        document.body.removeChild(message);
        document.body.removeChild(cursor);
        document.body.removeChild(cursor2);
        window.removeEventListener('mousemove', updateCursor);
        window.removeEventListener('click', handleClick, true);
        window.removeEventListener('keydown', handleEsc);
        setIsActive(false);
      };
      
      window.addEventListener('click', handleClick, true);
      window.addEventListener('keydown', handleEsc);
      
    } catch (err) {
      setError('不支持屏幕取色，请使用原生浏览器功能');
      console.error('初始化回退取色器失败:', err);
      setIsActive(false);
    }
  };

  // 开始取色
  const startEyeDropper = () => {
    if (hasEyeDropperAPI) {
      useNativeEyeDropper();
    } else {
      useFallbackEyeDropper();
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant={hasEyeDropperAPI ? "default" : "secondary"}
        onClick={startEyeDropper}
        disabled={isActive}
        className="flex items-center gap-2"
      >
        <Eye size={16} />
        {isActive ? '取色中...' : '屏幕取色'}
      </Button>
      
      {error && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!hasEyeDropperAPI && !error && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          提示：您的浏览器不支持原生取色器，将使用屏幕共享功能作为回退方案
        </div>
      )}
    </div>
  );
}