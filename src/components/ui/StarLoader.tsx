'use client';

import { useEffect, useState } from 'react';

interface StarLoaderProps {
  onAnimationComplete: () => void;
}

export function StarLoader({ onAnimationComplete }: StarLoaderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 缩短动画时间：1秒
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);
  
  if (!isMounted) return null;

  return (
    <>
      <style jsx global>{`
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        
        @keyframes starRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .star {
          position: absolute;
          width: 24px;
          height: 24px;
          background-color: #fcd34d;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          animation: starTwinkle 3s ease-in-out infinite;
        }
        
        .star:nth-child(1) { left: 20%; top: 25%; animation-delay: 0s; }
        .star:nth-child(2) { left: 60%; top: 30%; animation-delay: 1s; }
        .star:nth-child(3) { left: 40%; top: 15%; animation-delay: 2s; }
        .star:nth-child(4) { left: 75%; top: 50%; animation-delay: 0.5s; }
        .star:nth-child(5) { left: 25%; top: 65%; animation-delay: 1.5s; }
        
        .star-center {
          position: absolute;
          width: 40px;
          height: 40px;
          background-color: #fbbf24;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          animation: starRotate 8s linear infinite;
        }
        
        .star-container {
          position: relative;
          width: 256px;
          height: 256px;
          margin-bottom: 32px;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="star-container">
          {/* 星星群集 */}
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          <div className="star"></div>
          
          {/* 中心星星 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="star-center"></div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-yellow-300">欢迎来到CreatiKit</h2>
          <p className="text-gray-300 mt-2">
            创意工具集合，激发无限可能！
          </p>
        </div>
      </div>
    </>
  );
}