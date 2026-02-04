'use client'

import { useEffect, useState } from 'react';
import { X, Sparkles, Lock, Globe, ArrowRight, Zap, Shield, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { cn } from '@/lib/utils';

interface LearnMoreModalProps {
  visible: boolean;
  onClose: () => void;
}

export function LearnMoreModal({
  visible,
  onClose,
}: LearnMoreModalProps) {
  const [opacity, setOpacity] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (visible) {
      setIsClosing(false);
      // 淡入效果
      const fadeInTimeout = setTimeout(() => setOpacity(1), 10);
      return () => clearTimeout(fadeInTimeout);
    } else {
      setIsClosing(true);
      setOpacity(0);
    }
  }, [visible]);

  const handleClose = () => {
    setIsClosing(true);
    setOpacity(0);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleViewFullIntro = () => {
    handleClose();
    router.push('/about');
  };

  if (!visible && opacity === 0 && !isClosing) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed inset-0 flex items-center justify-center z-50',
        'transition-opacity duration-300',
        { 'opacity-0 pointer-events-none': !visible && opacity === 0 }
      )}
      style={{ opacity }}
      onClick={handleClose}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* 模态框内容 */}
      <div 
        className={cn(
          'relative bg-background rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden',
          'border border-border',
          'transform transition-all duration-300',
          { 'scale-95': !visible && opacity === 0, 'scale-100': visible }
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label={t('common.close') || '关闭'}
        >
          <X className="h-5 w-5" />
        </button>

        {/* 内容区域 */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* 头部 */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-8 w-8" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-2">
              {t('learnMoreModal.title') || '欢迎来到 CreatiKit.io'}
            </h2>
            <p className="text-center text-white/90 text-lg">
              {t('learnMoreModal.subtitle') || '一站式创意工具箱，赋能您的设计与开发工作流'}
            </p>
          </div>

          {/* 核心功能 */}
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 功能1 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t('learnMoreModal.feature1Title') || '强大工具集'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('learnMoreModal.feature1Desc') || '图片压缩、3D预览、代码工具、设计工具等20+专业工具'}
                  </p>
                </div>
              </div>

              {/* 功能2 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Lock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t('learnMoreModal.feature2Title') || '隐私保护'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('learnMoreModal.feature2Desc') || '所有处理都在本地浏览器完成，不上传您的文件'}
                  </p>
                </div>
              </div>

              {/* 功能3 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t('learnMoreModal.feature3Title') || '全平台支持'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('learnMoreModal.feature3Desc') || '基于浏览器，无需安装，随时随地可用'}
                  </p>
                </div>
              </div>

              {/* 功能4 */}
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
                  <Code className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {t('learnMoreModal.feature4Title') || '持续更新'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('learnMoreModal.feature4Desc') || '不断添加新功能和改进现有工具'}
                  </p>
                </div>
              </div>
            </div>

            {/* 使用场景 */}
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                {t('learnMoreModal.useCasesTitle') || '适用场景'}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{t('learnMoreModal.useCase1') || '设计师快速处理图片和创建配色方案'}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{t('learnMoreModal.useCase2') || '开发者格式化代码和生成二维码'}</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{t('learnMoreModal.useCase3') || '学生和教师进行在线学习和实验'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-5 border-t border-border/50 bg-background">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12 text-base font-medium border-2 hover:bg-muted transition-colors duration-200"
              >
                {t('common.close') || '关闭'}
              </Button>
              <Button
                onClick={handleViewFullIntro}
                className="group flex-1 h-12 text-base font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-purple-600 hover:from-blue-700 hover:via-purple-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <span className="flex items-center justify-center">
                  {t('learnMoreModal.viewFullIntro') || '查看完整介绍'}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

