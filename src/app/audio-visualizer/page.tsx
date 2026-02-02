'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Play, Pause, Volume2, VolumeX, Download, Maximize, Minimize, Music, Sparkles } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

type VisualizerMode = 'spectrum' | 'waveform' | 'circular' | 'particles' | 'waterfall';

export default function AudioVisualizer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [mode, setMode] = useState<VisualizerMode>('spectrum');
  const [colorScheme, setColorScheme] = useState('rainbow');
  const [sensitivity, setSensitivity] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const waterfallDataRef = useRef<number[][]>([]);
  
  const { toast } = useToast();

  // 初始化音频上下文
  useEffect(() => {
    if (audioUrl && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
      dataArrayRef.current = dataArray;

      // 音频事件监听
      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));
      audio.addEventListener('ended', () => setIsPlaying(false));
      audio.addEventListener('volumechange', () => {
        setVolume(audio.volume);
        setIsMuted(audio.muted);
      });

      return () => {
        audio.pause();
        audioContext.close();
      };
    }
  }, [audioUrl]);

  // 绘制可视化
  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    const draw = () => {
      // 检查是否还在播放
      if (!audioRef.current || audioRef.current.paused) {
        // 即使暂停也继续绘制（显示静态效果）
        if (!isPlaying) {
          animationFrameRef.current = requestAnimationFrame(draw);
          return;
        }
      }

      // @ts-expect-error - TypeScript incorrectly infers Uint8Array<ArrayBufferLike> instead of Uint8Array<ArrayBuffer>
      analyser.getByteFrequencyData(dataArray);

      // 使用更平滑的清除方式
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      switch (mode) {
        case 'spectrum':
          drawSpectrum(ctx, canvas, dataArray);
          break;
        case 'waveform':
          drawWaveform(ctx, canvas, dataArray);
          break;
        case 'circular':
          drawCircular(ctx, canvas, dataArray);
          break;
        case 'particles':
          drawParticles(ctx, canvas, dataArray);
          break;
        case 'waterfall':
          drawWaterfall(ctx, canvas, dataArray);
          break;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // 始终启动绘制循环
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, mode, colorScheme, sensitivity]);

  // 频谱可视化
  const drawSpectrum = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const barCount = Math.min(dataArray.length, 128); // 限制条形数量以提高性能
    const barWidth = canvas.width / barCount;
    const maxHeight = canvas.height * 0.8;

    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length);
      const barHeight = (dataArray[dataIndex] / 255) * maxHeight * sensitivity;
      const x = i * barWidth;
      const y = canvas.height - barHeight;

      const color = getColor(i / barCount, colorScheme);
      
      // 创建渐变效果
      const gradient = ctx.createLinearGradient(x, y, x, canvas.height);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 2, barHeight);
      
      // 添加高光效果
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(x, y, barWidth - 2, barHeight * 0.2);
    }
  };

  // 波形可视化
  const drawWaveform = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    // 使用时域数据而不是频域数据
    const waveformData = new Uint8Array(new ArrayBuffer(analyserRef.current!.fftSize));
    analyserRef.current!.getByteTimeDomainData(waveformData);
    
    ctx.strokeStyle = getColor(0.5, colorScheme);
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = getColor(0.5, colorScheme);
    ctx.beginPath();

    const sliceWidth = canvas.width / waveformData.length;
    const centerY = canvas.height / 2;
    let x = 0;

    for (let i = 0; i < waveformData.length; i++) {
      const v = (waveformData[i] / 128.0) - 1.0;
      const y = centerY + (v * canvas.height * 0.4 * sensitivity);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  // 圆形频谱
  const drawCircular = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 3;

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2;
      const barHeight = (dataArray[i] / 255) * radius * sensitivity;
      
      const x1 = centerX + Math.cos(angle) * radius;
      const y1 = centerY + Math.sin(angle) * radius;
      const x2 = centerX + Math.cos(angle) * (radius + barHeight);
      const y2 = centerY + Math.sin(angle) * (radius + barHeight);

      const color = getColor(i / dataArray.length, colorScheme);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  };

  // 粒子效果
  const drawParticles = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    for (let i = 0; i < dataArray.length; i++) {
      const angle = (i / dataArray.length) * Math.PI * 2;
      const distance = (dataArray[i] / 255) * Math.min(canvas.width, canvas.height) / 2 * sensitivity;
      
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;

      const color = getColor(i / dataArray.length, colorScheme);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // 瀑布图
  const drawWaterfall = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, dataArray: Uint8Array) => {
    // 向下滚动
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 2);

    // 添加新行
    const barWidth = canvas.width / dataArray.length;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * 50 * sensitivity;
      const x = i * barWidth;
      const color = getColor(i / dataArray.length, colorScheme);
      ctx.fillStyle = color;
      ctx.fillRect(x, 0, barWidth, barHeight);
    }
  };

  // 获取颜色
  const getColor = (position: number, scheme: string): string => {
    switch (scheme) {
      case 'rainbow':
        const hue = position * 360;
        return `hsl(${hue}, 100%, 50%)`;
      case 'fire':
        return `hsl(${position * 60}, 100%, ${50 + position * 50}%)`;
      case 'ocean':
        return `hsl(${180 + position * 60}, 100%, ${30 + position * 40}%)`;
      case 'neon':
        return `hsl(${position * 120 + 240}, 100%, ${50 + position * 30}%)`;
      default:
        return '#3b82f6';
    }
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        title: '文件格式错误',
        description: '请上传音频文件（MP3、WAV、OGG）',
        variant: 'destructive',
      });
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // 播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  // 音量控制
  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // 全屏
  const toggleFullscreen = () => {
    if (!canvasRef.current) return;

    if (!isFullscreen) {
      canvasRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // 导出截图
  const exportScreenshot = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.download = 'audio-visualization.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  // 调整画布大小
  useEffect(() => {
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      const container = canvasRef.current.parentElement;
      if (!container) return;

      canvasRef.current.width = container.clientWidth;
      canvasRef.current.height = container.clientHeight - 200;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Music className="h-8 w-8" />
          音频可视化器
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          上传音频文件，实时生成多种可视化效果，支持频谱、波形、圆形、粒子和瀑布图等模式
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 控制面板 */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-center">控制面板</h2>
            
            {/* 文件上传 */}
            <div className="space-y-2 mb-4">
              <Label>上传音频文件</Label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>

            {/* 播放控制 */}
            {audioUrl && (
              <>
                <div className="flex gap-2 mb-4">
                  <Button onClick={togglePlay} className="flex-1">
                    {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                    {isPlaying ? '暂停' : '播放'}
                  </Button>
                  <Button variant="outline" onClick={toggleFullscreen}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" onClick={exportScreenshot}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {/* 音量控制 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <Label>音量</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.muted = !isMuted;
                        }
                      }}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={handleVolumeChange}
                    max={1}
                    min={0}
                    step={0.01}
                    disabled={isMuted}
                  />
                </div>
              </>
            )}

            {/* 可视化模式 */}
            <div className="space-y-2 mb-4">
              <Label>可视化模式</Label>
              <Select value={mode} onValueChange={(value) => setMode(value as VisualizerMode)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择模式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spectrum">频谱分析器 (Spectrum)</SelectItem>
                  <SelectItem value="waveform">波形显示 (Waveform)</SelectItem>
                  <SelectItem value="circular">圆形频谱 (Circular)</SelectItem>
                  <SelectItem value="particles">粒子效果 (Particles)</SelectItem>
                  <SelectItem value="waterfall">频谱瀑布图 (Waterfall)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 颜色方案 */}
            <div className="space-y-2 mb-4">
              <Label>颜色方案</Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="选择颜色" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rainbow">彩虹</SelectItem>
                  <SelectItem value="fire">火焰</SelectItem>
                  <SelectItem value="ocean">海洋</SelectItem>
                  <SelectItem value="neon">霓虹</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 敏感度 */}
            <div className="space-y-2">
              <Label>敏感度: {sensitivity.toFixed(1)}</Label>
              <Slider
                value={[sensitivity]}
                onValueChange={(value) => setSensitivity(value[0])}
                max={3}
                min={0.1}
                step={0.1}
              />
            </div>
          </Card>
        </div>

        {/* 可视化画布 */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '500px' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: 'block' }}
              />
              {!audioUrl && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>请上传音频文件开始可视化</p>
                  </div>
                </div>
              )}
              {audioUrl && !isPlaying && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm whitespace-nowrap">
                  已加载音频，点击播放开始可视化
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

