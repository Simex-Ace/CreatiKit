'use client'

import { useEffect, useState } from 'react';
import { Construction } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DevelopmentInProgressProps {
  visible: boolean;
  onClose: () => void;
  duration?: number;
  message?: string;
}

export function DevelopmentInProgress({
  visible,
  onClose,
  duration = 3000,
  message = '此功能正在开发中，敬请期待！',
}: DevelopmentInProgressProps) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (visible) {
      // 淡入效果
      const fadeInTimeout = setTimeout(() => setOpacity(1), 10);
      
      // 设置自动关闭
      const closeTimeout = setTimeout(() => {
        // 淡出效果
        setOpacity(0);
        setTimeout(() => {
          onClose();
        }, 300);
      }, duration);

      return () => {
        clearTimeout(fadeInTimeout);
        clearTimeout(closeTimeout);
      };
    } else {
      setOpacity(0);
    }
  }, [visible, duration, onClose]);

  if (!visible && opacity === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50 pointer-events-none',
        'transition-opacity duration-300',
        { 'opacity-0': !visible, 'opacity-100': visible }
      )}
      style={{ opacity }}
    >
      <div className="relative bg-background/90 backdrop-blur-md p-6 rounded-xl border shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-primary/10 rounded-full text-primary animate-pulse">
            <Construction size={24} />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-center mb-2">开发中</h3>
        <p className="text-muted-foreground text-center">
          {message}
        </p>
      </div>
    </div>
  );
}