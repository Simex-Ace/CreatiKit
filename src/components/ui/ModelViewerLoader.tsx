'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/contexts/I18nContext';

interface ModelViewerLoaderProps {
  onAnimationComplete?: () => void;
}

export function ModelViewerLoader({ onAnimationComplete }: ModelViewerLoaderProps) {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // 缩短动画时间：0.8秒，提升性能
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  if (!isMounted) return null;

  return (
    <>
      <style jsx>{`
        .loading-container {
          position: fixed;
          inset: 0;
          z-50;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #faf5ff 0%, #fdf4ff 100%);
          overflow: hidden;
          will-change: opacity;
        }
        
        .loading-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          will-change: transform;
        }
        
        .model-cube {
          width: 80px;
          height: 80px;
          transform-style: preserve-3d;
          animation: rotateCube 2s ease-in-out infinite;
          position: relative;
          will-change: transform;
        }
        
        .cube-face {
          position: absolute;
          width: 80px;
          height: 80px;
          opacity: 0.85;
          border: 2px solid rgba(139, 92, 246, 0.7);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
          transition: all 0.3s ease;
        }
        
        .front {
          transform: translateZ(40px);
          background: linear-gradient(135deg, #c4b5fd, #a78bfa);
        }
        
        .back {
          transform: rotateY(180deg) translateZ(40px);
          background: linear-gradient(135deg, #a78bfa, #c4b5fd);
        }
        
        .right {
          transform: rotateY(90deg) translateZ(40px);
          background: linear-gradient(135deg, #8b5cf6, #a78bfa);
        }
        
        .left {
          transform: rotateY(-90deg) translateZ(40px);
          background: linear-gradient(135deg, #a78bfa, #8b5cf6);
        }
        
        .top {
          transform: rotateX(90deg) translateZ(40px);
          background: linear-gradient(135deg, #7c3aed, #8b5cf6);
        }
        
        .bottom {
          transform: rotateX(-90deg) translateZ(40px);
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        
        @keyframes rotateCube {
          0%, 100% { transform: rotateX(0deg) rotateY(0deg) scale(1); }
          25% { transform: rotateX(180deg) rotateY(180deg) scale(1.05); }
          50% { transform: rotateX(360deg) rotateY(360deg) scale(1); }
          75% { transform: rotateX(180deg) rotateY(180deg) scale(1.05); }
        }
        
        .orbiting-spheres {
          position: absolute;
          width: 200px;
          height: 200px;
          transform-style: preserve-3d;
          animation: orbitRotate 6s linear infinite;
          will-change: transform;
        }
        
        .orbiting-sphere {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: radial-gradient(circle, #c084fc, #8b5cf6);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
          transform-style: preserve-3d;
        }
        
        .sphere-1 {
          top: 50%;
          left: 0;
          transform: translateY(-50%) translateX(0);
        }
        
        .sphere-2 {
          top: 50%;
          right: 0;
          transform: translateY(-50%) translateX(0);
        }
        
        .sphere-3 {
          top: 0;
          left: 50%;
          transform: translateY(0) translateX(-50%);
        }
        
        .sphere-4 {
          bottom: 0;
          left: 50%;
          transform: translateY(0) translateX(-50%);
        }
        
        @keyframes orbitRotate {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          100% { transform: rotateY(360deg) rotateX(360deg); }
        }
        
        .particles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }
        
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background-color: rgba(139, 92, 246, 0.6);
          opacity: 0;
          will-change: transform, opacity;
        }
        
        /* 减少粒子数量，只保留4个以提升性能 */
        .particle:nth-child(1) { top: 20%; left: 30%; animation: float 6s infinite ease-in-out; }
        .particle:nth-child(2) { top: 60%; left: 70%; animation: float 5s infinite ease-in-out; }
        .particle:nth-child(3) { top: 40%; left: 50%; animation: float 7s infinite ease-in-out; }
        .particle:nth-child(4) { top: 80%; left: 20%; animation: float 6.5s infinite ease-in-out; }
        
        @keyframes float {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
          50% { transform: translateY(-40px) translateX(0); opacity: 1; }
          75% { transform: translateY(-20px) translateX(-10px); opacity: 0.8; }
          100% { transform: translateY(0) translateX(0); opacity: 0; }
        }
        
        .loading-text {
          text-align: center;
          margin-top: 2rem;
        }
        
        .loading-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #7e22ce;
          margin-bottom: 0.75rem;
          text-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
        }
        
        .loading-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        
        .loading-dots {
          display: flex;
          gap: 8px;
        }
        
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #8b5cf6;
          animation: bounce 1.9s infinite ease-in-out both;
          box-shadow: 0 0 6px rgba(139, 92, 246, 0.8);
        }
        
        .dot:nth-child(1) { animation-delay: -0.32s; }
        .dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.7; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
      
      <div className="loading-container">
        {/* 背景粒子 - 减少数量以提升性能 */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* 主要内容区域 */}
        <div className="loading-content">
          {/* 轨道球体 */}
          <div className="orbiting-spheres">
            <div className="orbiting-sphere sphere-1"></div>
            <div className="orbiting-sphere sphere-2"></div>
            <div className="orbiting-sphere sphere-3"></div>
            <div className="orbiting-sphere sphere-4"></div>
          </div>
          
          {/* 3D立方体 */}
          <div className="model-cube">
            <div className="cube-face front"></div>
            <div className="cube-face back"></div>
            <div className="cube-face right"></div>
            <div className="cube-face left"></div>
            <div className="cube-face top"></div>
            <div className="cube-face bottom"></div>
          </div>
          
          {/* 文字信息 */}
          <div className="loading-text">
            <h2 className="loading-title">{t('loaderPage.preparing3DViewer')}</h2>
            <p className="loading-subtitle">
              {t('loaderPage.initializing3DEngine')}
              <span className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}