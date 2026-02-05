'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

// 动态加载加载器组件（减少初始 bundle 大小）
const WaterDropLoader = dynamic(() => import('./WaterDropLoader').then(mod => ({ default: mod.WaterDropLoader })), { ssr: false });
const CodeLoader = dynamic(() => import('./CodeLoader').then(mod => ({ default: mod.CodeLoader })), { ssr: false });
const ImageCompressorLoader = dynamic(() => import('./ImageCompressorLoader').then(mod => ({ default: mod.ImageCompressorLoader })), { ssr: false });
const MarkdownEditorLoader = dynamic(() => import('./MarkdownEditorLoader').then(mod => ({ default: mod.MarkdownEditorLoader })), { ssr: false });
const ModelViewerLoader = dynamic(() => import('./ModelViewerLoader').then(mod => ({ default: mod.ModelViewerLoader })), { ssr: false });
const StarLoader = dynamic(() => import('./StarLoader').then(mod => ({ default: mod.StarLoader })), { ssr: false });
const HeartLoader = dynamic(() => import('./HeartLoader').then(mod => ({ default: mod.HeartLoader })), { ssr: false });
const RainbowLoader = dynamic(() => import('./RainbowLoader').then(mod => ({ default: mod.RainbowLoader })), { ssr: false });

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false); // 初始不显示加载动画，避免首次加载时闪烁
  const [showContent, setShowContent] = useState(true); // 初始显示内容
  const [contentOpacity, setContentOpacity] = useState(1); // 初始完全不透明
  const [prevPathname, setPrevPathname] = useState(pathname);

  useEffect(() => {
    // 只在路径真正变化时显示加载动画（避免首次加载时显示）
    if (prevPathname !== pathname && prevPathname !== '') {
      setIsLoading(true);
      setShowContent(false);
      setContentOpacity(0);
    }
    setPrevPathname(pathname);
  }, [pathname, prevPathname]);

  const handleAnimationComplete = () => {
    setIsLoading(false);
    setShowContent(true);
    
    // 加快内容载入速度
    requestAnimationFrame(() => {
      setContentOpacity(1);
    });
  };

  // 根据路径选择对应的加载动画（动态加载）
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
      // 首页随机选择加载动画（动态加载）
      const loaderComponents = [StarLoader, HeartLoader, RainbowLoader, WaterDropLoader];
      const randomIndex = Math.floor(Math.random() * loaderComponents.length);
      const LoaderComponent = loaderComponents[randomIndex];
      return <LoaderComponent onAnimationComplete={handleAnimationComplete} />;
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