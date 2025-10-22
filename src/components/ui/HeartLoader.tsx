'use client';

import { useEffect, useState } from 'react';

interface HeartLoaderProps {
  onAnimationComplete: () => void;
}

export function HeartLoader({ onAnimationComplete }: HeartLoaderProps) {
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
        @keyframes heartBeat {
          0%, 100% { transform: scale(0.9); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes heartFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        
        .heart {
          position: absolute;
          width: 24px;
          height: 24px;
          background-color: #f472b6;
          transform: rotate(45deg);
          animation: heartBeat 1.5s ease-in-out infinite;
        }
        
        .heart:before,
        .heart:after {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          background-color: inherit;
          border-radius: 50%;
        }
        
        .heart:before {
          top: -12px;
          left: 0;
        }
        
        .heart:after {
          top: 0;
          left: -12px;
        }
        
        .heart:nth-child(1) { left: 20%; top: 25%; background-color: #f87171; animation-delay: 0s; }
        .heart:nth-child(2) { left: 60%; top: 30%; background-color: #f9a8d4; animation-delay: 0.5s; }
        .heart:nth-child(3) { left: 40%; top: 15%; background-color: #ef4444; animation-delay: 1s; }
        .heart:nth-child(4) { left: 75%; top: 50%; background-color: #fbcfe8; animation-delay: 0.3s; }
        .heart:nth-child(5) { left: 25%; top: 65%; background-color: #f87171; animation-delay: 0.7s; }
        
        .heart-center {
          position: absolute;
          width: 60px;
          height: 60px;
          background-color: #ec4899;
          transform: rotate(45deg);
          animation: heartFloat 2s ease-in-out infinite;
        }
        
        .heart-center:before,
        .heart-center:after {
          content: '';
          position: absolute;
          width: 60px;
          height: 60px;
          background-color: #ec4899;
          border-radius: 50%;
        }
        
        .heart-center:before {
          top: -30px;
          left: 0;
        }
        
        .heart-center:after {
          top: 0;
          left: -30px;
        }
        
        .heart-container {
          position: relative;
          width: 192px;
          height: 192px;
          margin-bottom: 32px;
        }
      `}</style>
      
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-red-100">
        <div className="heart-container">
          {/* 心形群集 */}
          <div className="heart"></div>
          <div className="heart"></div>
          <div className="heart"></div>
          <div className="heart"></div>
          <div className="heart"></div>
          
          {/* 中心心形 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="heart-center"></div>
          </div>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-bold text-pink-600">欢迎来到CreatiKit</h2>
          <p className="text-gray-600 mt-2">
            充满爱的创意工具，让创作更美好！
          </p>
        </div>
      </div>
    </>
  );
}