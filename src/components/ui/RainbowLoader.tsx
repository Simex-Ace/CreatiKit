'use client';

import { useEffect, useState } from 'react';

interface RainbowLoaderProps {
  onAnimationComplete: () => void;
}

export function RainbowLoader({ onAnimationComplete }: RainbowLoaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 缩短动画时间：1秒
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  // 确保客户端渲染完成后再显示内容，避免hydration错误
  if (!isMounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes rainbowMove {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes rainbowRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes rainbowText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        
        .rainbow-circle {
          position: absolute;
          width: 160px;
          height: 160px;
          border-radius: 50%;
          opacity: 0.2;
          animation: rainbowMove 2s ease-in-out infinite;
        }
        
        .rainbow-circle:nth-child(1) { background-color: #ef4444; left: 10px; top: 10px; }
        .rainbow-circle:nth-child(2) { background-color: #f97316; left: 20px; top: 20px; }
        .rainbow-circle:nth-child(3) { background-color: #eab308; left: 30px; top: 30px; }
        .rainbow-circle:nth-child(4) { background-color: #22c55e; left: 40px; top: 40px; }
        .rainbow-circle:nth-child(5) { background-color: #0ea5e9; left: 50px; top: 50px; }
        
        .rainbow-container {
          animation: rainbowRotate 6s linear infinite;
          position: relative;
          width: 150px;
          height: 150px;
          margin-bottom: 32px;
        }
        
        .rainbow-center {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6);
          background-size: 200% 200%;
          animation: rainbowMove 2s ease-in-out infinite, rainbowText 3s linear infinite;
        }
        
        .rainbow-text {
          background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #0ea5e9, #8b5cf6);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: rainbowText 3s linear infinite;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="rainbow-container">
          {/* 彩虹圆环 */}
          <div className="rainbow-circle"></div>
          <div className="rainbow-circle"></div>
          <div className="rainbow-circle"></div>
          <div className="rainbow-circle"></div>
          <div className="rainbow-circle"></div>
          
          {/* 中心彩虹图标 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rainbow-center"></div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold rainbow-text">欢迎来到CreatiKit</h2>
          <p className="text-gray-600 mt-2">
            丰富多彩的创意工具，点亮您的灵感！
          </p>
        </div>
      </div>
    </>
  );
}