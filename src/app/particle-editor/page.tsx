'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Download, Sparkles, Copy, Check } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

type ParticleShape = 'circle' | 'square' | 'star' | 'triangle';

export default function ParticleEditor() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [particleCount, setParticleCount] = useState(100);
  const [emissionRate, setEmissionRate] = useState(10);
  const [particleSize, setParticleSize] = useState(3);
  const [particleSpeed, setParticleSpeed] = useState(2);
  const [particleLife, setParticleLife] = useState(2);
  const [gravity, setGravity] = useState(0.1);
  const [wind, setWind] = useState(0);
  const [shape, setShape] = useState<ParticleShape>('circle');
  const [colorStart, setColorStart] = useState('#ff0000');
  const [colorEnd, setColorEnd] = useState('#ffff00');
  const [blendMode, setBlendMode] = useState<'normal' | 'screen' | 'multiply' | 'additive'>('screen');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const emitterXRef = useRef(400);
  const emitterYRef = useRef(300);
  const { toast } = useToast();

  // 初始化画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = 600;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // 创建粒子
  const createParticle = (): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * particleSpeed + 0.5) * 2;
    
    // 颜色插值
    const t = Math.random();
    const color = interpolateColor(colorStart, colorEnd, t);

    return {
      x: emitterXRef.current,
      y: emitterYRef.current,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: particleLife,
      maxLife: particleLife,
      size: particleSize + Math.random() * 2,
      color,
    };
  };

  // 颜色插值
  const interpolateColor = (color1: string, color2: string, t: number): string => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);

    return `rgb(${r}, ${g}, ${b})`;
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // 绘制粒子
  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    const alpha = particle.life / particle.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    
    // 创建渐变效果
    const gradient = ctx.createRadialGradient(
      particle.x, particle.y, 0,
      particle.x, particle.y, particle.size * 2
    );
    gradient.addColorStop(0, particle.color);
    gradient.addColorStop(0.5, particle.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.strokeStyle = particle.color;
    ctx.lineWidth = 1;

    switch (shape) {
      case 'circle':
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(particle.x - particle.size * 0.3, particle.y - particle.size * 0.3, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'square':
        // 添加旋转效果
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.life * 0.1);
        ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        break;
      case 'star':
        drawStar(ctx, particle.x, particle.y, particle.size, 5);
        ctx.fill();
        // 添加旋转
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.life * 0.2);
        ctx.translate(-particle.x, -particle.y);
        drawStar(ctx, particle.x, particle.y, particle.size * 0.7, 5);
        ctx.fill();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        break;
      case 'triangle':
        drawTriangle(ctx, particle.x, particle.y, particle.size);
        ctx.fill();
        // 添加高光
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        drawTriangle(ctx, particle.x, particle.y - particle.size * 0.3, particle.size * 0.4);
        ctx.fill();
        break;
    }

    ctx.restore();
  };

  // 绘制星形
  const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, points: number) => {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const r = i % 2 === 0 ? radius : radius / 2;
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  // 绘制三角形
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
  };

  // 动画循环
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // 使用更平滑的清除方式，创建拖尾效果
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 设置混合模式
      ctx.globalCompositeOperation = blendMode;

      // 发射新粒子
      if (isPlaying && particlesRef.current.length < particleCount) {
        for (let i = 0; i < emissionRate; i++) {
          particlesRef.current.push(createParticle());
        }
      }

      // 更新和绘制粒子
      particlesRef.current = particlesRef.current.filter((particle) => {
        // 更新位置
        particle.x += particle.vx;
        particle.y += particle.vy;

        // 应用重力和风力
        particle.vy += gravity;
        particle.vx += wind;

        // 边界反弹（可选，让效果更丰富）
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        // 更新生命周期
        particle.life -= 0.016;

        // 绘制
        if (particle.life > 0) {
          drawParticle(ctx, particle);
          
          // 添加光晕效果
          if (shape === 'circle' || shape === 'star') {
            ctx.save();
            ctx.globalAlpha = (particle.life / particle.maxLife) * 0.3;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
          
          return true;
        }
        return false;
      });

      // 重置混合模式
      ctx.globalCompositeOperation = 'source-over';

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, particleCount, emissionRate, particleSize, particleSpeed, particleLife, gravity, wind, shape, colorStart, colorEnd, blendMode]);

  // 处理鼠标移动（设置发射器位置）
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    emitterXRef.current = e.clientX - rect.left;
    emitterYRef.current = e.clientY - rect.top;
  };

  // 导出配置（JSON格式）
  const exportConfig = () => {
    const config = {
      particleCount,
      emissionRate,
      particleSize,
      particleSpeed,
      particleLife,
      gravity,
      wind,
      shape,
      colorStart,
      colorEnd,
      blendMode,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'particle-config.json';
    link.click();
    URL.revokeObjectURL(url);
    toast({
      title: '导出成功',
      description: '粒子配置已导出为JSON文件',
      variant: 'success',
    });
  };

  // 导出截图
  const exportScreenshot = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'particle-effect.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    toast({
      title: '导出成功',
      description: '粒子效果已导出为PNG图片',
      variant: 'success',
    });
  };

  // 复制配置
  const copyConfig = () => {
    const config = {
      particleCount,
      emissionRate,
      particleSize,
      particleSpeed,
      particleLife,
      gravity,
      wind,
      shape,
      colorStart,
      colorEnd,
      blendMode,
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({
      title: '已复制',
      description: '粒子配置已复制到剪贴板',
      variant: 'success',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8" />
          粒子系统编辑器
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          创建和编辑粒子效果，实时预览，支持多种形状和混合模式
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 控制面板 */}
        <Card className="p-6 lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4 text-center">粒子设置</h2>
          
          <div className="space-y-4">
            {/* 播放控制 */}
            <div className="flex gap-2">
              <Button onClick={() => setIsPlaying(!isPlaying)} className="flex-1">
                {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isPlaying ? '暂停' : '播放'}
              </Button>
              <Button variant="outline" onClick={() => (particlesRef.current = [])}>
                <Square className="h-4 w-4" />
              </Button>
            </div>

            {/* 粒子数量 */}
            <div className="space-y-2">
              <Label>粒子数量: {particleCount}</Label>
              <Slider
                value={[particleCount]}
                onValueChange={(value) => setParticleCount(value[0])}
                max={500}
                min={10}
                step={10}
              />
            </div>

            {/* 发射速率 */}
            <div className="space-y-2">
              <Label>发射速率: {emissionRate}/帧</Label>
              <Slider
                value={[emissionRate]}
                onValueChange={(value) => setEmissionRate(value[0])}
                max={50}
                min={1}
                step={1}
              />
            </div>

            {/* 粒子大小 */}
            <div className="space-y-2">
              <Label>粒子大小: {particleSize}</Label>
              <Slider
                value={[particleSize]}
                onValueChange={(value) => setParticleSize(value[0])}
                max={20}
                min={1}
                step={0.5}
              />
            </div>

            {/* 粒子速度 */}
            <div className="space-y-2">
              <Label>粒子速度: {particleSpeed}</Label>
              <Slider
                value={[particleSpeed]}
                onValueChange={(value) => setParticleSpeed(value[0])}
                max={10}
                min={0.1}
                step={0.1}
              />
            </div>

            {/* 生命周期 */}
            <div className="space-y-2">
              <Label>生命周期: {particleLife}s</Label>
              <Slider
                value={[particleLife]}
                onValueChange={(value) => setParticleLife(value[0])}
                max={5}
                min={0.1}
                step={0.1}
              />
            </div>

            {/* 重力 */}
            <div className="space-y-2">
              <Label>重力: {gravity.toFixed(2)}</Label>
              <Slider
                value={[gravity]}
                onValueChange={(value) => setGravity(value[0])}
                max={1}
                min={-0.5}
                step={0.01}
              />
            </div>

            {/* 风力 */}
            <div className="space-y-2">
              <Label>风力: {wind.toFixed(2)}</Label>
              <Slider
                value={[wind]}
                onValueChange={(value) => setWind(value[0])}
                max={1}
                min={-1}
                step={0.01}
              />
            </div>

            {/* 粒子形状 */}
            <div className="space-y-2">
              <Label>粒子形状</Label>
              <Select value={shape} onValueChange={(value) => setShape(value as ParticleShape)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="circle">圆形</SelectItem>
                  <SelectItem value="square">方形</SelectItem>
                  <SelectItem value="star">星形</SelectItem>
                  <SelectItem value="triangle">三角形</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 起始颜色 */}
            <div className="space-y-2">
              <Label>起始颜色</Label>
              <Input
                type="color"
                value={colorStart}
                onChange={(e) => setColorStart(e.target.value)}
              />
            </div>

            {/* 结束颜色 */}
            <div className="space-y-2">
              <Label>结束颜色</Label>
              <Input
                type="color"
                value={colorEnd}
                onChange={(e) => setColorEnd(e.target.value)}
              />
            </div>

            {/* 混合模式 */}
            <div className="space-y-2">
              <Label>混合模式</Label>
              <Select value={blendMode} onValueChange={(value) => setBlendMode(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择混合模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">正常</SelectItem>
                  <SelectItem value="screen">屏幕</SelectItem>
                  <SelectItem value="multiply">正片叠底</SelectItem>
                  <SelectItem value="additive">叠加</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-2 pt-4">
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={exportConfig}>
                  <Download className="h-4 w-4 mr-2" />
                  导出配置
                </Button>
                <Button variant="outline" onClick={copyConfig}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full" onClick={exportScreenshot}>
                <Download className="h-4 w-4 mr-2" />
                导出截图 (PNG)
              </Button>
            </div>
          </div>
        </Card>

        {/* 画布 */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 text-center">预览</h2>
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseMove={handleMouseMove}
              className="w-full cursor-crosshair"
              style={{ display: 'block', height: '600px' }}
            />
            {/* 发射器位置指示器 */}
            {isPlaying && (
              <div
                className="absolute pointer-events-none transition-all duration-100"
                style={{
                  left: `${(emitterXRef.current / (canvasRef.current?.width || 800)) * 100}%`,
                  top: `${(emitterYRef.current / (canvasRef.current?.height || 600)) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
                }}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            移动鼠标到画布上设置粒子发射位置
          </p>
        </Card>
      </div>
    </div>
  );
}

