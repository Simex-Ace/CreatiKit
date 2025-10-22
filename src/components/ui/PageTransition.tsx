'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { WaterDropLoader } from './WaterDropLoader';
import { CodeLoader } from './CodeLoader';
import { ImageCompressorLoader } from './ImageCompressorLoader';
import { MarkdownEditorLoader } from './MarkdownEditorLoader';
import { ModelViewerLoader } from './ModelViewerLoader';
import { StarLoader } from './StarLoader';
import { HeartLoader } from './HeartLoader';
import { RainbowLoader } from './RainbowLoader';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [contentOpacity, setContentOpacity] = useState(0);

  useEffect(() => {
    // 路由变化时重新显示加载动画
    setIsLoading(true);
    setShowContent(false);
    setContentOpacity(0);
  }, [pathname]);

  const handleAnimationComplete = () => {
    setIsLoading(false);
    setShowContent(true);
    
    // 加快内容载入速度
    setTimeout(() => {
      setContentOpacity(1);
    }, 30);
  };

  // 首页加载动画列表
  const homeLoaders = [
    <StarLoader key="star" onAnimationComplete={handleAnimationComplete} />,
    <HeartLoader key="heart" onAnimationComplete={handleAnimationComplete} />,
    <RainbowLoader key="rainbow" onAnimationComplete={handleAnimationComplete} />,
    <WaterDropLoader key="water" onAnimationComplete={handleAnimationComplete} />
  ];

  // 根据路径选择对应的加载动画
  const renderLoader = () => {
    if (pathname.includes('/code-tools')) {
      return <CodeLoader onAnimationComplete={handleAnimationComplete} />;
    } else if (pathname.includes('/compress')) {
      return <ImageCompressorLoader onAnimationComplete={handleAnimationComplete} />;
    } else if (pathname.includes('/markdown-editor')) {
      return <MarkdownEditorLoader onAnimationComplete={handleAnimationComplete} />;
    } else if (pathname.includes('/model-viewer')) {
      return <ModelViewerLoader onAnimationComplete={handleAnimationComplete} />;
    } else {
      // 首页随机选择加载动画
      const randomIndex = Math.floor(Math.random() * homeLoaders.length);
      return homeLoaders[randomIndex];
    }
  };

  return (
    <>
      {isLoading && renderLoader()}
      
      {showContent && (
        <div
          className="transition-opacity duration-1000 ease-in-out"
          style={{ opacity: contentOpacity }}
        >
          {children}
        </div>
      )}
    </>
  );
}