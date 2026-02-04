'use client'

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, Target, Heart, Sparkles, Zap, Lock, Globe, Code, Image, Palette, FileCode, FlaskConical, Music, BarChart2, TrendingUp, Rocket, MessageSquare, HelpCircle, Star, Award, Coffee, Brain, Users2, Smartphone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import Link from 'next/link';

// 数字递增动画组件 - 只在移出窗口时重置，hover不重新触发
function AnimatedNumber({ value, suffix = '', duration = 2000, className = '' }: { value: number; suffix?: string; duration?: number; className?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimatedRef = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          // 只在第一次进入可视区域时播放动画
          if (!hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            
            const startTime = Date.now();
            const startValue = 0;
            const endValue = value;

            const animate = () => {
              const now = Date.now();
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              
              // 使用easeOutCubic缓动函数
              const easeOutCubic = 1 - Math.pow(1 - progress, 3);
              const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutCubic);
              
              setDisplayValue(currentValue);

              if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
              } else {
                setDisplayValue(endValue);
                animationFrameRef.current = null;
              }
            };

            animationFrameRef.current = requestAnimationFrame(animate);
          }
        } else if (!entry.isIntersecting) {
          // 离开可视区域时重置，允许下次进入时重新播放
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setDisplayValue(0);
          hasAnimatedRef.current = false;
        }
      },
      { 
        threshold: [0, 0.3, 0.5, 1],
        rootMargin: '0px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration]);

  return (
    <div ref={ref} className={className}>
      {displayValue}{suffix}
    </div>
  );
}

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      {/* 头部 */}
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full mb-4">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('aboutPage.title')}</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t('aboutPage.subtitle')}
        </p>
      </div>

      {/* 使命与价值观 */}
      <Card className="p-8 md:p-10 mb-8 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-blue-950/10 dark:via-purple-950/10 dark:to-pink-950/10 border-2 border-primary/10 relative overflow-hidden">
        {/* 背景装饰 - 使用不同的动画效果 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-0 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl -z-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative z-10">
          <div className="text-center mb-10">
            {/* 图标使用3D变换效果 */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 mb-6 shadow-xl hover:shadow-2xl transition-all duration-500 relative transform hover:rotate-y-12 hover:rotate-x-6" style={{ transformStyle: 'preserve-3d' }}>
              <Target className="h-10 w-10 text-white transition-transform duration-500 hover:scale-125" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 hover:opacity-40 blur-xl transition-opacity duration-500"></div>
            </div>
            {/* 标题使用文字阴影和渐变动画 */}
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:drop-shadow-lg transition-all duration-300 hover:tracking-wider">
              {t('aboutPage.mission')}
            </h2>
            {/* 描述文字使用淡入淡出效果 */}
            <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto text-base hover:text-foreground transition-all duration-500 hover:leading-loose">
              {t('aboutPage.missionDesc')}
            </p>
          </div>

          <Separator className="my-8 opacity-50 hover:opacity-100 transition-opacity duration-300" />

          {/* 价值观卡片 - 使用不同的hover效果：滑动和边框动画 */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="group/item text-center p-6 rounded-xl bg-background/60 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-950/30 dark:hover:to-blue-900/20 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 relative overflow-hidden">
              {/* 滑动背景效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 mb-4 shadow-lg group-hover/item:shadow-blue-500/50 transition-all duration-500 group-hover/item:ring-4 group-hover/item:ring-blue-300/50">
                  <Heart className="h-8 w-8 text-white group-hover/item:animate-pulse" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors duration-300">{t('aboutPage.value1Title') || '用户至上'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground/90 transition-all duration-500">
                  {t('aboutPage.value1Desc') || '我们始终将用户体验放在首位，致力于打造最易用、最高效的工具'}
                </p>
              </div>
            </div>
            <div className="group/item text-center p-6 rounded-xl bg-background/60 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-100/50 dark:hover:from-purple-950/30 dark:hover:to-pink-900/20 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 relative overflow-hidden">
              {/* 旋转光效 */}
              <div className="absolute inset-0 bg-conic-gradient from-purple-500/0 via-purple-500/10 to-purple-500/0 opacity-0 group-hover/item:opacity-100 group-hover/item:animate-spin transition-opacity duration-500" style={{ animationDuration: '3s' }}></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4 shadow-lg group-hover/item:shadow-purple-500/50 transition-all duration-500 group-hover/item:ring-4 group-hover/item:ring-purple-300/50">
                  <Sparkles className="h-8 w-8 text-white group-hover/item:animate-spin" style={{ animationDuration: '2s' }} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover/item:text-purple-600 dark:group-hover/item:text-purple-400 transition-colors duration-300">{t('aboutPage.value2Title') || '创新驱动'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground/90 transition-all duration-500">
                  {t('aboutPage.value2Desc') || '不断探索新技术，创造独特的工具体验，让创意无限可能'}
                </p>
              </div>
            </div>
            <div className="group/item text-center p-6 rounded-xl bg-background/60 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-100/50 dark:hover:from-green-950/30 dark:hover:to-emerald-900/20 border-2 border-transparent hover:border-green-300 dark:hover:border-green-700 transition-all duration-500 hover:shadow-2xl hover:shadow-green-500/20 relative overflow-hidden">
              {/* 波纹扩散效果 */}
              <div className="absolute inset-0 rounded-xl border-2 border-green-400/0 group-hover/item:border-green-400/50 group-hover/item:animate-ping transition-all duration-500"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 shadow-lg group-hover/item:shadow-green-500/50 transition-all duration-500 group-hover/item:ring-4 group-hover/item:ring-green-300/50">
                  <Globe className="h-8 w-8 text-white group-hover/item:scale-110 group-hover/item:rotate-180 transition-all duration-500" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground group-hover/item:text-green-600 dark:group-hover/item:text-green-400 transition-colors duration-300">{t('aboutPage.value3Title') || '开放包容'}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground/90 transition-all duration-500">
                  {t('aboutPage.value3Desc') || '免费开放的平台，欢迎所有人使用，共同构建更好的创意生态'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 核心功能 */}
      <Card className="p-8 md:p-10 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">{t('aboutPage.coreFeatures') || '核心功能'}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t('aboutPage.coreFeaturesDesc') || '专业、高效、安全，为您提供全方位的创意工具支持'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="group relative p-6 rounded-xl border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{t('aboutPage.feature1Title') || '强大工具集'}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.feature1Desc') || '提供25+专业工具，涵盖图片处理、3D预览、代码工具、设计工具等多个领域，一站式满足您的创作需求'}
                  </p>
                </div>
              </div>
            </div>
            <div className="group relative p-6 rounded-xl border-2 border-transparent hover:border-green-200 dark:hover:border-green-800 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{t('aboutPage.feature2Title') || '隐私保护'}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.feature2Desc') || '所有处理都在本地浏览器完成，文件不上传服务器，您的数据完全由您掌控'}
                  </p>
                </div>
              </div>
            </div>
            <div className="group relative p-6 rounded-xl border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-800 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{t('aboutPage.feature3Title') || '全平台支持'}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.feature3Desc') || '基于现代Web技术，无需安装任何软件，在任何设备、任何浏览器上都能流畅使用'}
                  </p>
                </div>
              </div>
            </div>
            <div className="group relative p-6 rounded-xl border-2 border-transparent hover:border-orange-200 dark:hover:border-orange-800 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/20 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{t('aboutPage.feature4Title') || '持续更新'}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.feature4Desc') || '根据用户反馈快速迭代，每月都有新功能和改进，让工具越来越强大'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 工具分类 */}
      <Card className="p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">{t('aboutPage.toolCategories') || '工具分类'}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link href="/compress" className="group relative p-5 rounded-xl border-2 border-border hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-br from-blue-50/30 to-transparent dark:from-blue-950/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                <Image className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold ml-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('aboutPage.categoryImage') || '图片处理'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-auto flex-grow">
              {t('aboutPage.categoryImageDesc') || '图片压缩、背景移除、像素艺术、GIF工具'}
            </p>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform">
              {t('aboutPage.viewTools') || '查看工具 →'}
            </span>
          </Link>
          <Link href="/color-palette" className="group relative p-5 rounded-xl border-2 border-border hover:border-purple-400 dark:hover:border-purple-600 bg-gradient-to-br from-purple-50/30 to-transparent dark:from-purple-950/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold ml-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('aboutPage.categoryDesign') || '设计工具'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-auto flex-grow">
              {t('aboutPage.categoryDesignDesc') || '调色板、SVG编辑器、CSS动画、粒子编辑器'}
            </p>
            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform">
              {t('aboutPage.viewTools') || '查看工具 →'}
            </span>
          </Link>
          <Link href="/code-tools" className="group relative p-5 rounded-xl border-2 border-border hover:border-green-400 dark:hover:border-green-600 bg-gradient-to-br from-green-50/30 to-transparent dark:from-green-950/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                <FileCode className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold ml-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{t('aboutPage.categoryCode') || '代码工具'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-auto flex-grow">
              {t('aboutPage.categoryCodeDesc') || '代码格式化、Markdown编辑器、文本分析'}
            </p>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform">
              {t('aboutPage.viewTools') || '查看工具 →'}
            </span>
          </Link>
          <Link href="/chemistry-lab" className="group relative p-5 rounded-xl border-2 border-border hover:border-cyan-400 dark:hover:border-cyan-600 bg-gradient-to-br from-cyan-50/30 to-transparent dark:from-cyan-950/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/40 transition-colors">
                <FlaskConical className="h-5 w-5 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold ml-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{t('aboutPage.categoryEducation') || '教育工具'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-auto flex-grow">
              {t('aboutPage.categoryEducationDesc') || '化学实验室、物理实验室、生物沙盒'}
            </p>
            <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform">
              {t('aboutPage.viewTools') || '查看工具 →'}
            </span>
          </Link>
          <Link href="/audio-visualizer" className="group relative p-5 rounded-xl border-2 border-border hover:border-pink-400 dark:hover:border-pink-600 bg-gradient-to-br from-pink-50/30 to-transparent dark:from-pink-950/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 group-hover:bg-pink-200 dark:group-hover:bg-pink-800/40 transition-colors">
                <Music className="h-5 w-5 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold ml-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">{t('aboutPage.categoryMedia') || '媒体工具'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-auto flex-grow">
              {t('aboutPage.categoryMediaDesc') || '音频可视化、3D模型预览、在线钢琴'}
            </p>
            <span className="text-sm text-pink-600 dark:text-pink-400 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform">
              {t('aboutPage.viewTools') || '查看工具 →'}
            </span>
          </Link>
          <Link href="/qr-code-generator" className="group relative p-5 rounded-xl border-2 border-border hover:border-orange-400 dark:hover:border-orange-600 bg-gradient-to-br from-orange-50/30 to-transparent dark:from-orange-950/10 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors">
                <BarChart2 className="h-5 w-5 text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold ml-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{t('aboutPage.categoryUtility') || '实用工具'}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-auto flex-grow">
              {t('aboutPage.categoryUtilityDesc') || '二维码生成、哈希计算、时间戳转换、天气查询'}
            </p>
            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium inline-flex items-center mt-4 group-hover:translate-x-1 transition-transform">
              {t('aboutPage.viewTools') || '查看工具 →'}
            </span>
          </Link>
        </div>
      </Card>

      {/* 使用场景 */}
      <Card className="p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center gap-2">
            <span className="text-2xl">✨</span>
            {t('aboutPage.useCases') || '适用场景'}
            <span className="text-2xl">✨</span>
          </h2>
          <div className="space-y-5">
            <div className="group flex items-start space-x-5 p-6 rounded-xl bg-gradient-to-r from-blue-50/70 to-blue-100/30 dark:from-blue-950/30 dark:to-blue-900/10 border-2 border-blue-200/50 dark:border-blue-800/30 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:-translate-x-2 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">🎨</div>
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                  {t('aboutPage.useCase1Title') || '设计师工作流'}
                  <span className="text-lg animate-bounce">🎨</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('aboutPage.useCase1Desc') || '快速处理图片、创建配色方案、编辑SVG图形、生成CSS动画，提升设计效率'}
                </p>
              </div>
            </div>
            <div className="group flex items-start space-x-5 p-6 rounded-xl bg-gradient-to-r from-green-50/70 to-green-100/30 dark:from-green-950/30 dark:to-green-900/10 border-2 border-green-200/50 dark:border-green-800/30 hover:border-green-400 dark:hover:border-green-600 hover:shadow-xl hover:-translate-x-2 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">💻</div>
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-2">
                  {t('aboutPage.useCase2Title') || '开发者工具集'}
                  <span className="text-lg animate-pulse">💻</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('aboutPage.useCase2Desc') || '格式化代码、编辑Markdown、生成二维码、计算哈希值，简化开发流程'}
                </p>
              </div>
            </div>
            <div className="group flex items-start space-x-5 p-6 rounded-xl bg-gradient-to-r from-purple-50/70 to-purple-100/30 dark:from-purple-950/30 dark:to-purple-900/10 border-2 border-purple-200/50 dark:border-purple-800/30 hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl hover:-translate-x-2 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">📚</div>
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
                  {t('aboutPage.useCase3Title') || '教育学习'}
                  <span className="text-lg animate-bounce">📚</span>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('aboutPage.useCase3Desc') || '进行化学实验、物理模拟、生物观察，让学习更加直观有趣'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 技术特点 */}
      <Card className="p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 -z-0"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
            {t('aboutPage.techFeatures') || '技术特点'}
            <Zap className="h-6 w-6 text-yellow-500 animate-pulse" />
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="group relative p-6 rounded-xl border-2 border-border hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100/50 dark:hover:from-blue-950/30 dark:hover:to-blue-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-2 right-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">🔒</div>
              <div className="flex items-start mb-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-3 mt-1.5 group-hover:scale-150 group-hover:shadow-lg transition-all animate-pulse"></div>
                <h3 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('aboutPage.tech1Title') || '本地处理'}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {t('aboutPage.tech1Desc') || '所有工具都基于Web技术，在您的浏览器中本地运行，无需服务器上传，保护隐私安全'}
              </p>
            </div>
            <div className="group relative p-6 rounded-xl border-2 border-border hover:border-green-400 dark:hover:border-green-600 hover:shadow-xl hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100/50 dark:hover:from-green-950/30 dark:hover:to-green-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-2 right-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">⚡</div>
              <div className="flex items-start mb-3">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3 mt-1.5 group-hover:scale-150 group-hover:shadow-lg transition-all animate-pulse"></div>
                <h3 className="font-bold text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{t('aboutPage.tech2Title') || '高性能'}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {t('aboutPage.tech2Desc') || '采用现代Web技术栈，优化算法和渲染性能，确保流畅的使用体验'}
              </p>
            </div>
            <div className="group relative p-6 rounded-xl border-2 border-border hover:border-purple-400 dark:hover:border-purple-600 hover:shadow-xl hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100/50 dark:hover:from-purple-950/30 dark:hover:to-purple-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-2 right-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">📱</div>
              <div className="flex items-start mb-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-3 mt-1.5 group-hover:scale-150 group-hover:shadow-lg transition-all animate-pulse"></div>
                <h3 className="font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('aboutPage.tech3Title') || '响应式设计'}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {t('aboutPage.tech3Desc') || '完美适配桌面、平板和移动设备，随时随地使用'}
              </p>
            </div>
            <div className="group relative p-6 rounded-xl border-2 border-border hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100/50 dark:hover:from-orange-950/30 dark:hover:to-orange-900/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-2 right-2 text-3xl opacity-10 group-hover:opacity-20 transition-opacity">🎁</div>
              <div className="flex items-start mb-3">
                <div className="w-3 h-3 rounded-full bg-orange-500 mr-3 mt-1.5 group-hover:scale-150 group-hover:shadow-lg transition-all animate-pulse"></div>
                <h3 className="font-bold text-lg group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{t('aboutPage.tech4Title') || '开源免费'}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                {t('aboutPage.tech4Desc') || '所有工具完全免费使用，部分工具开源，欢迎贡献和反馈'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 数据统计 */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-8 text-center">{t('aboutPage.statsTitle') || '平台数据'}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="group text-center p-4 rounded-xl bg-background/60 hover:bg-background hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={25} suffix="+" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{t('aboutPage.statsToolsLabel') || '专业工具'}</p>
            </div>
            <div className="group text-center p-4 rounded-xl bg-background/60 hover:bg-background hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={6} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{t('aboutPage.statsCategoriesLabel') || '工具分类'}</p>
            </div>
            <div className="group text-center p-4 rounded-xl bg-background/60 hover:bg-background hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={4} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{t('aboutPage.statsLanguagesLabel') || '支持语言'}</p>
            </div>
            <div className="group text-center p-4 rounded-xl bg-background/60 hover:bg-background hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <div className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                <AnimatedNumber value={100} suffix="%" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{t('aboutPage.statsFreeLabel') || '完全免费'}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 特色亮点 */}
      <Card className="p-8 mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-orange-500/5 -z-0"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
            {t('aboutPage.highlightsTitle') || '特色亮点'}
            <Star className="h-6 w-6 text-yellow-500 animate-pulse" />
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="group p-6 rounded-xl border-2 border-dashed border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-950/10 hover:border-yellow-500 dark:hover:border-yellow-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">🏆</div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors flex items-center gap-2">
                    {t('aboutPage.highlight1Title') || '零学习成本'}
                    <span className="text-sm animate-bounce">🎯</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.highlight1Desc') || '所有工具都采用直观的界面设计，无需阅读文档即可上手使用，让您专注于创作本身'}
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-6 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/10 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">☕</div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
                    {t('aboutPage.highlight2Title') || '离线可用'}
                    <span className="text-sm animate-pulse">📴</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.highlight2Desc') || '大部分工具支持离线使用，即使没有网络连接也能完成基本操作，随时随地创作'}
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-6 rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50/50 to-transparent dark:from-green-950/10 hover:border-green-500 dark:hover:border-green-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">📈</div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-2">
                    {t('aboutPage.highlight3Title') || '持续进化'}
                    <span className="text-sm animate-bounce">🚀</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.highlight3Desc') || '我们根据用户反馈不断优化和更新工具，每月都有新功能上线，让平台越来越强大'}
                  </p>
                </div>
              </div>
            </div>
            <div className="group p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 to-transparent dark:from-purple-950/10 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 text-4xl opacity-5 group-hover:opacity-10 transition-opacity">🧪</div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
                    {t('aboutPage.highlight4Title') || '创新实验'}
                    <span className="text-sm animate-pulse">✨</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.highlight4Desc') || '我们不断尝试新的创意工具，如隔空写字、生物沙盒等创新功能，探索Web技术的可能性'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 常见问题 */}
      <Card className="p-8 mb-8 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 -z-0"></div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center gap-2">
            <div className="relative">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            {t('aboutPage.faqTitle') || '常见问题'}
          </h2>
          <div className="space-y-3">
            {/* FAQ 1 */}
            <div className="group relative p-5 rounded-lg bg-background/50 border border-border hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-500 group-hover:scale-110 transition-all duration-300">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm group-hover:text-white transition-colors">Q</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-2 text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t('aboutPage.faq1Question') || '使用这些工具需要注册账号吗？'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">A:</span> {t('aboutPage.faq1Answer') || '大部分工具无需注册即可使用。注册账号可以保存您的作品和历史记录，享受更多个性化功能。'}
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="group relative p-5 rounded-lg bg-background/50 border border-border hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50/50 dark:hover:bg-green-950/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-500 group-hover:scale-110 transition-all duration-300">
                  <span className="text-green-600 dark:text-green-400 font-bold text-sm group-hover:text-white transition-colors">Q</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-2 text-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {t('aboutPage.faq2Question') || '我的文件会被上传到服务器吗？'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">A:</span> {t('aboutPage.faq2Answer') || '不会！所有处理都在您的浏览器本地完成，文件不会上传到任何服务器，完全保护您的隐私安全。'}
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="group relative p-5 rounded-lg bg-background/50 border border-border hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-500 group-hover:scale-110 transition-all duration-300">
                  <span className="text-purple-600 dark:text-purple-400 font-bold text-sm group-hover:text-white transition-colors">Q</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-2 text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {t('aboutPage.faq3Question') || '工具支持哪些文件格式？'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">A:</span> {t('aboutPage.faq3Answer') || '不同工具支持不同格式。图片工具支持JPG、PNG、WebP、GIF；3D工具支持GLB、GLTF、OBJ等；代码工具支持多种编程语言。具体格式请查看各工具页面。'}
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="group relative p-5 rounded-lg bg-background/50 border border-border hover:border-orange-400 dark:hover:border-orange-600 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:bg-orange-500 group-hover:scale-110 transition-all duration-300">
                  <span className="text-orange-600 dark:text-orange-400 font-bold text-sm group-hover:text-white transition-colors">Q</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base mb-2 text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {t('aboutPage.faq4Question') || '如何反馈问题或建议新功能？'}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">A:</span> {t('aboutPage.faq4Answer') || '欢迎通过联系我们页面、GitHub Issues或社交媒体向我们反馈。您的建议对我们非常重要！'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 未来规划 */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center gap-2">
            <Rocket className="h-6 w-6 text-purple-600 animate-bounce" />
            {t('aboutPage.roadmapTitle') || '未来规划'}
            <span className="text-xl animate-bounce" style={{ animationDelay: '0.2s' }}>🚀</span>
          </h2>
          <div className="space-y-4">
            {/* 进行中 - 使用不同的布局和样式 */}
            <div className="group relative p-6 rounded-xl bg-gradient-to-r from-purple-100/80 via-pink-100/60 to-purple-100/80 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-purple-900/30 border-l-4 border-purple-500 hover:border-purple-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl -z-0"></div>
              <div className="absolute top-2 right-2 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">🤖</div>
              <div className="relative z-10 flex items-start space-x-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ring-2 ring-purple-300/50">
                  <CheckCircle2 className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-purple-500 text-white rounded-full">{t('aboutPage.statusInProgress') || '进行中'}</span>
                    <h3 className="font-bold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex items-center gap-2">
                      {t('aboutPage.roadmap1Title') || 'AI增强功能'}
                      <span className="text-base animate-pulse">🤖</span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.roadmap1Desc') || '正在开发AI驱动的图片优化、智能配色建议等功能，让创作更智能'}
                  </p>
                </div>
              </div>
            </div>
            {/* 计划中 - 使用不同的布局 */}
            <div className="group relative p-6 rounded-xl bg-gradient-to-r from-blue-50/80 via-cyan-50/60 to-blue-50/80 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-blue-900/30 border-l-4 border-blue-500 hover:border-blue-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl -z-0"></div>
              <div className="absolute top-2 right-2 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">👥</div>
              <div className="relative z-10 flex items-start space-x-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ring-2 ring-blue-300/50">
                  <Users2 className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-500 text-white rounded-full">{t('aboutPage.statusPlanned') || '计划中'}</span>
                    <h3 className="font-bold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      {t('aboutPage.roadmap2Title') || '协作功能'}
                      <span className="text-base animate-bounce">👥</span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.roadmap2Desc') || '计划添加团队协作、项目分享等功能，让多人协作创作成为可能'}
                  </p>
                </div>
              </div>
            </div>
            {/* 规划中 - 使用不同的布局 */}
            <div className="group relative p-6 rounded-xl bg-gradient-to-r from-green-50/80 via-emerald-50/60 to-green-50/80 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-green-900/30 border-l-4 border-green-500 hover:border-green-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-2xl -z-0"></div>
              <div className="absolute top-2 right-2 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">📱</div>
              <div className="relative z-10 flex items-start space-x-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 ring-2 ring-green-300/50">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full">{t('aboutPage.statusPlanning') || '规划中'}</span>
                    <h3 className="font-bold text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-2">
                      {t('aboutPage.roadmap3Title') || '移动端App'}
                      <span className="text-base animate-pulse">📱</span>
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('aboutPage.roadmap3Desc') || '正在规划原生移动应用，让您随时随地使用CreatiKit的强大功能'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 加入我们 */}
      <Card className="p-8 md:p-10 text-center relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('aboutPage.joinUsTitle') || '加入我们的社区'}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-base leading-relaxed">
            {t('aboutPage.joinUsDesc') || 'CreatiKit.io 是一个开放的平台，我们欢迎所有创意工作者、开发者、学生和爱好者加入我们的社区。分享您的作品、提出建议、参与讨论，让我们一起打造更好的创意工具！'}
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 max-w-lg mx-auto">
            <Link 
              href="/contact" 
              className="group relative px-8 py-4 h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 overflow-hidden flex items-center justify-center"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('aboutPage.contactUs') || '联系我们'}
                <MessageSquare className="h-4 w-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              href="https://github.com/Simex-Ace/CreatiKit" 
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 h-12 bg-background border-2 border-border hover:border-foreground/20 rounded-xl font-semibold hover:bg-muted/50 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
            >
              <span className="flex items-center gap-2 text-foreground">
                <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.532 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.197 22 16.425 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="whitespace-nowrap">{t('aboutPage.viewOnGitHub') || 'GitHub'}</span>
              </span>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

