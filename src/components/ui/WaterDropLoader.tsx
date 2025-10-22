'use client';

import { useEffect, useState } from 'react';

interface WaterDropLoaderProps {
  onAnimationComplete?: () => void;
}

export function WaterDropLoader({ onAnimationComplete }: WaterDropLoaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 缩短动画时间：1秒
    const timer = setTimeout(() => {
      onAnimationComplete?.();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  // 确保客户端渲染完成后再显示内容，避免hydration错误
  if (!isMounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes waterDropBounce {
          0%, 100% { transform: scale(0.9) translateY(0); }
          50% { transform: scale(1.1) translateY(-20px); }
        }

        .water-drop-bounce {
          animation: waterDropBounce 1.5s ease-in-out infinite;
        }

        .water-center {
          position: relative;
          width: 40px;
          height: 40px;
          background-color: #3b82f6;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
        }

        .water-center::after {
          content: '';
          position: absolute;
          width: 30px;
          height: 30px;
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          top: 5px;
          left: 5px;
        }
        
        .sparkle {
          width: 12px;
          height: 12px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          display: inline-block;
          margin: 0 4px;
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="relative w-32 h-32 mb-6">
          {/* 水滴动画 */}
          <div className="absolute inset-0 rounded-full bg-blue-400 opacity-80 water-drop-bounce scale-90"></div>
          <div className="absolute inset-2 rounded-full bg-blue-300 opacity-90 water-drop-bounce scale-80" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute inset-4 rounded-full bg-blue-200 water-drop-bounce scale-70" style={{ animationDelay: '0.2s' }}></div>
          
          {/* 中心水滴图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="water-center"></div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-blue-800 mb-2">
            <span className="sparkle" style={{animationDelay: '0s'}}></span>
            正在准备魔法
            <span className="sparkle" style={{animationDelay: '0.3s'}}></span>
          </h2>
          <p className="text-blue-600">
            <span className="sparkle" style={{animationDelay: '0.1s'}}></span>
            页面马上就好啦
            <span className="sparkle" style={{animationDelay: '0.2s'}}></span>
          </p>
        </div>
      </div>
    </>
  );
}