'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowUp, Search, Moon, Sun, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/contexts/I18nContext';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useI18n();

  // 监听滚动事件
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false); // 滚动到顶部时自动收起
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setIsExpanded(false); // 点击后收起
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    setIsExpanded(false); // 点击后收起
  };

  // 搜索功能（跳转到工具区域）
  const scrollToTools = () => {
    const toolsSection = document.querySelector('[data-tools-section]');
    if (toolsSection) {
      toolsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
    setIsExpanded(false); // 点击后收起
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
      {/* 展开的便捷功能按钮组 */}
      <div 
        className={`flex flex-col gap-3 items-end transition-all duration-500 ease-out ${
          isExpanded 
            ? 'opacity-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <TooltipProvider delayDuration={200}>
          {/* 回到顶部按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={scrollToTop}
                className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 group ${
                  isExpanded ? 'animate-[bounceIn_0.4s_ease-out_0.1s_both]' : ''
                }`}
              >
                <ArrowUp className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="left" 
              sideOffset={16}
              className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 backdrop-blur-md border-0 text-white shadow-2xl px-4 py-3 rounded-2xl font-semibold text-sm animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none"
            >
              <div className="relative flex items-center gap-2 z-10">
                <span className="text-base">⬆️</span>
                <span className="drop-shadow-sm">{t('common.backToTop') || '回到顶部'}</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-purple-500 drop-shadow-lg"></div>
            </TooltipContent>
          </Tooltip>

          {/* 主题切换按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleTheme}
                className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-background/80 backdrop-blur-sm border-2 ${
                  isExpanded ? 'animate-[bounceIn_0.4s_ease-out_0.2s_both]' : ''
                }`}
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="left" 
              sideOffset={16}
              className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 backdrop-blur-md border-0 text-white shadow-2xl px-4 py-3 rounded-2xl font-semibold text-sm animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none"
            >
              <div className="relative flex items-center gap-2 z-10">
                <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span className="drop-shadow-sm">{theme === 'dark' ? (t('common.switchToLight') || '切换到浅色模式') : (t('common.switchToDark') || '切换到深色模式')}</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-purple-500 drop-shadow-lg"></div>
            </TooltipContent>
          </Tooltip>

          {/* 跳转到工具区域按钮 */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollToTools}
                className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-background/80 backdrop-blur-sm border-2 ${
                  isExpanded ? 'animate-[bounceIn_0.4s_ease-out_0.3s_both]' : ''
                }`}
              >
                <Search className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent 
              side="left" 
              sideOffset={16}
              className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 backdrop-blur-md border-0 text-white shadow-2xl px-4 py-3 rounded-2xl font-semibold text-sm animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none"
            >
              <div className="relative flex items-center gap-2 z-10">
                <span className="text-base">🔍</span>
                <span className="drop-shadow-sm">{t('common.scrollToTools') || '跳转到工具区域'}</span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-purple-500 drop-shadow-lg"></div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* 主按钮 - 加号/关闭按钮 */}
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-500 ease-out bg-background/80 backdrop-blur-sm border-2 hover:scale-110 ${
                isExpanded 
                  ? 'rotate-45 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 scale-110' 
                  : 'rotate-0 bg-background/80 hover:bg-background/90 border-border scale-100'
              } ${isVisible ? 'animate-[bounceIn_0.5s_ease-out]' : ''}`}
            >
              {isExpanded ? (
                <X className="h-5 w-5 transition-all duration-300 text-red-500" />
              ) : (
                <span className="text-2xl font-bold transition-all duration-300 text-foreground">+</span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            sideOffset={16}
            className="relative bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 backdrop-blur-md border-0 text-white shadow-2xl px-4 py-3 rounded-2xl font-semibold text-sm animate-in fade-in-0 zoom-in-95 slide-in-from-right-2 duration-300 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none"
          >
            <div className="relative flex items-center gap-2 z-10">
              <span className="text-base animate-pulse">✨</span>
              <span className="drop-shadow-sm">{isExpanded ? (t('common.hideTools') || '隐藏工具') : (t('common.showQuickTools') || '展开快捷工具')}</span>
            </div>
            {/* 小箭头 - 指向按钮 */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[8px] border-l-purple-500 drop-shadow-lg"></div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

