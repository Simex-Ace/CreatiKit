'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Play, Square, Download, Sparkles, Code2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

type AnimationType = 'fade' | 'slide' | 'rotate' | 'scale' | 'bounce' | 'shake' | 'custom';
type EasingType = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier';

export default function CSSAnimator() {
  const [animationType, setAnimationType] = useState<AnimationType>('fade');
  const [duration, setDuration] = useState(1);
  const [delay, setDelay] = useState(0);
  const [iterationCount, setIterationCount] = useState(1);
  const [direction, setDirection] = useState<'normal' | 'reverse' | 'alternate' | 'alternate-reverse'>('normal');
  const [easing, setEasing] = useState<EasingType>('ease');
  const [customEasing, setCustomEasing] = useState('0.25, 0.1, 0.25, 1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customCSS, setCustomCSS] = useState('');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // 生成CSS动画代码
  const generateCSS = () => {
    if (animationType === 'custom' && customCSS) {
      return customCSS;
    }

    const easingValue = easing === 'cubic-bezier' ? `cubic-bezier(${customEasing})` : easing;
    
    const keyframes = getKeyframes(animationType);
    const animationName = `anim-${animationType}`;

    // 处理无限循环
    const iterationValue = iterationCount === Infinity ? 'infinite' : iterationCount;
    
    return `
@keyframes ${animationName} {
  ${keyframes}
}

.animated-element {
  animation: ${animationName} ${duration}s ${easingValue} ${delay}s ${iterationValue} ${direction};
  animation-fill-mode: both;
}
`.trim();
  };

  // 获取关键帧
  const getKeyframes = (type: AnimationType): string => {
    switch (type) {
      case 'fade':
        return `0% { opacity: 1; }
100% { opacity: 0; }`;
      case 'slide':
        return `0% { transform: translateX(0); }
100% { transform: translateX(100px); }`;
      case 'rotate':
        return `0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }`;
      case 'scale':
        return `0% { transform: scale(1); }
100% { transform: scale(1.5); }`;
      case 'bounce':
        return `0%, 100% { transform: translateY(0); }
50% { transform: translateY(-30px); }`;
      case 'shake':
        return `0%, 100% { transform: translateX(0); }
25% { transform: translateX(-10px); }
75% { transform: translateX(10px); }`;
      default:
        return `0% { opacity: 1; }
100% { opacity: 0; }`;
    }
  };

  // 应用动画到预览元素
  useEffect(() => {
    if (!previewRef.current) return;

    const element = previewRef.current;
    let css = generateCSS();
    
    // 如果是自定义CSS，需要确保包含.animated-element类
    if (animationType === 'custom' && customCSS) {
      // 检查是否已经包含.animated-element
      if (!customCSS.includes('.animated-element')) {
        // 如果没有，添加一个默认的动画应用
        const easingValue = easing === 'cubic-bezier' ? `cubic-bezier(${customEasing})` : easing;
        const iterationValue = iterationCount === Infinity ? 'infinite' : iterationCount;
        css += `\n\n.animated-element {\n  animation: ${duration}s ${easingValue} ${delay}s ${iterationValue} ${direction};\n  animation-fill-mode: both;\n}`;
      }
    }
    
    // 创建style标签
    let styleTag = document.getElementById('dynamic-animation-style');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-animation-style';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = css;

    // 应用动画类（保留原有样式类）
    const baseClasses = 'w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg relative z-10';
    element.className = `animated-element ${baseClasses}`;
    
    // 确保元素可见
    element.style.display = 'block';
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    
    // 强制重新应用动画
    element.style.animation = 'none';
    // 使用 requestAnimationFrame 确保样式已更新
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (element) {
          element.style.animation = '';
          // 确保动画状态正确
          element.style.animationPlayState = isPlaying ? 'running' : 'paused';
        }
      });
    });
  }, [animationType, duration, delay, iterationCount, direction, easing, customEasing, customCSS, isPlaying]);

  // 复制CSS代码
  const handleCopy = () => {
    const css = generateCSS();
    navigator.clipboard.writeText(css);
    setCopied(true);
    toast({
      title: '已复制',
      description: 'CSS代码已复制到剪贴板',
      variant: 'success',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // 下载CSS文件
  const handleDownload = () => {
    const css = generateCSS();
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'animation.css';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 播放/停止动画
  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    if (previewRef.current) {
      // 重置动画以重新开始
      const element = previewRef.current;
      const animation = element.style.animation;
      element.style.animation = 'none';
      requestAnimationFrame(() => {
        if (element) {
          element.style.animation = animation;
          element.style.animationPlayState = newState ? 'running' : 'paused';
        }
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8" />
          CSS 动画生成器
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          可视化创建CSS动画，实时预览效果，导出代码直接使用
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 控制面板 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">动画设置</h2>
          
          <div className="space-y-4">
            {/* 动画类型 */}
            <div className="space-y-2">
              <Label>动画类型</Label>
              <Select value={animationType} onValueChange={(value) => setAnimationType(value as AnimationType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择动画类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fade">淡入淡出</SelectItem>
                  <SelectItem value="slide">滑动</SelectItem>
                  <SelectItem value="rotate">旋转</SelectItem>
                  <SelectItem value="scale">缩放</SelectItem>
                  <SelectItem value="bounce">弹跳</SelectItem>
                  <SelectItem value="shake">摇晃</SelectItem>
                  <SelectItem value="custom">自定义</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 自定义CSS */}
            {animationType === 'custom' && (
              <div className="space-y-2">
                <Label>自定义CSS</Label>
                <Textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  placeholder="@keyframes myAnimation { ... }"
                  className="font-mono text-sm"
                  rows={8}
                />
              </div>
            )}

            {/* 持续时间 */}
            <div className="space-y-2">
              <Label>持续时间: {duration}s</Label>
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                max={5}
                min={0.1}
                step={0.1}
              />
            </div>

            {/* 延迟 */}
            <div className="space-y-2">
              <Label>延迟: {delay}s</Label>
              <Slider
                value={[delay]}
                onValueChange={(value) => setDelay(value[0])}
                max={3}
                min={0}
                step={0.1}
              />
            </div>

            {/* 重复次数 */}
            <div className="space-y-2">
              <Label>重复次数</Label>
              <Select
                value={iterationCount === Infinity ? 'infinite' : iterationCount.toString()}
                onValueChange={(value) => setIterationCount(value === 'infinite' ? Infinity : parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择重复次数" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1次</SelectItem>
                  <SelectItem value="2">2次</SelectItem>
                  <SelectItem value="3">3次</SelectItem>
                  <SelectItem value="infinite">无限</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 方向 */}
            <div className="space-y-2">
              <Label>方向</Label>
              <Select value={direction} onValueChange={(value) => setDirection(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择方向" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="reverse">反向</SelectItem>
                  <SelectItem value="alternate">交替</SelectItem>
                  <SelectItem value="alternate-reverse">交替反向</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 缓动函数 */}
            <div className="space-y-2">
              <Label>缓动函数</Label>
              <Select value={easing} onValueChange={(value) => setEasing(value as EasingType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择缓动函数" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">linear</SelectItem>
                  <SelectItem value="ease">ease</SelectItem>
                  <SelectItem value="ease-in">ease-in</SelectItem>
                  <SelectItem value="ease-out">ease-out</SelectItem>
                  <SelectItem value="ease-in-out">ease-in-out</SelectItem>
                  <SelectItem value="cubic-bezier">cubic-bezier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {easing === 'cubic-bezier' && (
              <div className="space-y-2">
                <Label>Cubic Bezier 参数</Label>
                <Input
                  value={customEasing}
                  onChange={(e) => setCustomEasing(e.target.value)}
                  placeholder="0.25, 0.1, 0.25, 1"
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 pt-4">
              <Button onClick={togglePlay} className="flex-1">
                {isPlaying ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? '停止' : '播放'}
              </Button>
              <Button variant="outline" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* 预览和代码 */}
        <div className="space-y-6">
          {/* 预览 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">实时预览</h2>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg p-8 min-h-[300px] flex items-center justify-center relative overflow-hidden">
              <div
                ref={previewRef}
                className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-lg relative z-10"
                style={{
                  animationPlayState: isPlaying ? 'running' : 'paused',
                  display: 'block',
                  opacity: 1,
                }}
              />
              {/* 背景网格 */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} />
            </div>
          </Card>

          {/* 生成的代码 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">生成的CSS代码</h2>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                复制
              </Button>
            </div>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generateCSS()}</code>
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
}

