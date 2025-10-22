'use client';

import { useEffect } from 'react';

interface ImageCompressorLoaderProps {
  onAnimationComplete: () => void;
}

export function ImageCompressorLoader({ onAnimationComplete }: ImageCompressorLoaderProps) {
  useEffect(() => {
    // 缩短动画时间：1秒
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <>
      <style jsx global>{`
        @keyframes compressShrink {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
        
        @keyframes compressPulse {
          0% { stroke-width: 2; r: 30; }
          50% { stroke-width: 5; r: 25; }
          100% { stroke-width: 2; r: 30; }
        }
        
        @keyframes compressArrow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        
        .compress-image {
          animation: compressShrink 1s ease-in-out infinite alternate;
        }
        
        .compress-circle {
          animation: compressPulse 1.5s ease-in-out infinite;
        }
        
        .compress-arrow {
          animation: compressArrow 1s ease-in-out infinite;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="relative mb-8">
          {/* 压缩动画容器 */}
          <div className="relative w-40 h-40">
            {/* 第一个图片 */}
            <div className="absolute inset-0 flex items-center justify-center compress-image">
              <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
                <rect x="20" y="20" width="60" height="50" rx="5" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="35" cy="40" r="8" fill="#60a5fa" />
                <path d="M50 30 L80 50 L50 70" stroke="#3b82f6" strokeWidth="3" fill="none" />
              </svg>
            </div>
            
            {/* 箭头 */}
            <div className="absolute top-1/2 left-full ml-2 transform -translate-y-1/2 compress-arrow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10 L15 10 M15 10 L10 5 M15 10 L10 15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            
            {/* 压缩后的图片 */}
            <div className="absolute inset-0 flex items-center justify-center ml-24 compress-image" style={{animationDirection: 'alternate-reverse'}}>
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <rect x="25" y="25" width="50" height="40" rx="4" fill="#93c5fd" stroke="#3b82f6" strokeWidth="2" />
                <circle cx="40" cy="45" r="6" fill="#60a5fa" />
                <path d="M55 35 L75 50 L55 65" stroke="#3b82f6" strokeWidth="2" fill="none" />
              </svg>
            </div>
            
            {/* 环绕的压缩圈 */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="30" className="compress-circle" fill="none" stroke="#3b82f6" />
            </svg>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-blue-600">🖼️ 正在准备图片压缩工具 🖼️</h2>
          <p className="text-gray-600 mt-2">
            <span className="animate-pulse">⚡</span> 优化图像质量，节省存储空间 <span className="animate-pulse">⚡</span>
          </p>
        </div>
      </div>
    </>
  );
}