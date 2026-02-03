'use client'

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Image, Globe, FileCode, Monitor, Lock, Code, BookOpen, Palette, Smile, QrCode, PencilRuler, RotateCw, CloudSun, BarChart2, FlaskConical, Heart, Music, Sparkles, Shapes } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';
import { useI18n } from '@/contexts/I18nContext';

// 动态加载非关键组件（减少首屏 bundle）
const DevelopmentInProgress = dynamic(() => import('@/components/ui/DevelopmentInProgress').then(mod => ({ default: mod.DevelopmentInProgress })), { ssr: false });
const ToolCardFavoriteButton = dynamic(() => import('@/components/ToolCardFavoriteButton').then(mod => ({ default: mod.ToolCardFavoriteButton })), { ssr: false });

export default function Home() {
  const router = useRouter();
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();
  const { t } = useI18n();

  // 处理按钮点击事件
  const handleStartUsing = () => {
    // 跳转到功能区域
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    showAlert(t('home.learnMoreAlert'));
  };

  const handleImageCompressor = () => {
    router.push('/compress');
  };

  const handleModelViewer = () => {
    router.push('/model-viewer');
  };

  const handleCodeTools = () => {
    router.push('/code-tools');
  };

  // 导航到markdown编辑器页面
  const handleMarkdownEditor = () => {
    router.push('/markdown-editor');
  };

  const handleColorPalette = () => {
    router.push('/color-palette');
  };

  const handleTextAnalyzer = () => {
    router.push('/text-analyzer');
  };

  const handleEmojiCollection = () => {
    router.push('/emoji-collection');
  };

  const handleQrCodeGenerator = () => {
    router.push('/qr-code-generator');
  };

  const handlePixelArtGenerator = () => {
    router.push('/pixel-art-generator');
  };

  const handleHashCalculator = () => {
    router.push('/hash-calculator');
  };

  const handleTimestampConverter = () => {
    router.push('/timestamp-converter');
  };

  const handleWhiteboard = () => {
    router.push('/whiteboard');
  };

  const handleGifTool = () => {
    router.push('/gif-tool');
  };

  const handleWeatherTool = () => {
    router.push('/weather-tool');
  };

  const handleDataToChart = () => {
    router.push('/data-to-chart');
  };

  const handlePiano = () => {
    router.push('/piano');
  };

  const handlePhysicsLab = () => {
    router.push('/physics-lab');
  };

  const handleChemistryLab = () => {
    router.push('/chemistry-lab');
  };

  const handleEcosystemSandbox = () => {
    router.push('/ecosystem-sandbox');
  };

  const handleBackgroundRemover = () => {
    router.push('/background-remover');
  };

  const handleCameraGestureDrawing = () => {
    router.push('/camera-gesture-drawing');
  };

  const handleAudioVisualizer = () => {
    router.push('/audio-visualizer');
  };

  const handleCSSAnimator = () => {
    router.push('/css-animator');
  };

  const handleSVGEditor = () => {
    router.push('/svg-editor');
  };

  const handleParticleEditor = () => {
    router.push('/particle-editor');
  };

  const handleFreeUse = () => {
    // 跳转到功能区域
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12">
      <section className="py-16 text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            CreatiKit.io
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          {t('home.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="px-8 py-6 text-lg" onClick={handleStartUsing}>
            {t('home.startUsing')}
          </Button>
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" onClick={handleLearnMore}>
            {t('home.learnMore')}
          </Button>
        </div>
      </section>

      <Separator />

      {/* 功能卡片 */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">{t('home.powerfulTools')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('home.toolsDescription')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 交互式2D化学实验室卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-cyan-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/chemistry-lab" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-cyan-100 p-3 w-fit">
                <FlaskConical className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-cyan-700">{t('home.tools.chemistryLab.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.chemistryLab.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold" onClick={handleChemistryLab}>
                  {t('home.tools.chemistryLab.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 图片压缩工具卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/compress" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-blue-100 p-3 w-fit">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.compress.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.compress.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button variant="default" className="w-full" onClick={handleImageCompressor}>
                  {t('home.tools.compress.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 3D模型预览器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/model-viewer" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-purple-100 p-3 w-fit">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.modelViewer.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.modelViewer.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleModelViewer}>
                  {t('home.tools.modelViewer.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 生物沙盒卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-emerald-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/ecosystem-sandbox" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-emerald-100 p-3 w-fit">
                <CloudSun className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-emerald-700">{t('home.tools.ecosystemSandbox.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.ecosystemSandbox.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleEcosystemSandbox}>
                  {t('home.tools.ecosystemSandbox.button')}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* 背景移除工具卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-pink-200 border-2 border-pink-300 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.hot')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/background-remover" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-pink-100 p-3 w-fit group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <circle cx="10" cy="13" r="2" />
                  <path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 21" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-pink-600">{t('home.tools.backgroundRemover.name')}</h3>
              <p className="text-muted-foreground flex-grow text-sm">
                {t('home.tools.backgroundRemover.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-md hover:shadow-lg transform transition-all duration-300" onClick={handleBackgroundRemover}>
                  {t('home.tools.backgroundRemover.button')}
                </Button>
              </div>
            </div>
            {/* 装饰元素 */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-100 opacity-50 blur-sm z-0"></div>
            <div className="absolute -top-4 -left-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-200 to-blue-100 opacity-50 blur-sm z-0"></div>
          </Card>

          {/* 隔空写字卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-blue-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/camera-gesture-drawing" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-blue-100 p-3 w-fit">
                <PencilRuler className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-700">{t('home.tools.cameraGestureDrawing.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.cameraGestureDrawing.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold" onClick={handleCameraGestureDrawing}>
                  {t('home.tools.cameraGestureDrawing.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 音频可视化器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-indigo-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/audio-visualizer" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-indigo-100 p-3 w-fit">
                <Music className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-indigo-700">{t('home.tools.audioVisualizer.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.audioVisualizer.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold" onClick={handleAudioVisualizer}>
                  {t('home.tools.audioVisualizer.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* CSS动画生成器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-pink-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/css-animator" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-pink-100 p-3 w-fit">
                <Sparkles className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-pink-700">{t('home.tools.cssAnimator.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.cssAnimator.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold" onClick={handleCSSAnimator}>
                  {t('home.tools.cssAnimator.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* SVG路径编辑器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-purple-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/svg-editor" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-purple-100 p-3 w-fit">
                <Shapes className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-purple-700">{t('home.tools.svgEditor.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.svgEditor.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold" onClick={handleSVGEditor}>
                  {t('home.tools.svgEditor.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 粒子系统编辑器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg border-2 border-orange-400 transform hover:-translate-y-1">
            <div className="absolute -top-3 -right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
              {t('home.new')}
            </div>
            <div className="absolute top-4 right-4 z-30">
              <ToolCardFavoriteButton toolPath="/particle-editor" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-orange-100 p-3 w-fit">
                <Sparkles className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-orange-700">{t('home.tools.particleEditor.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.particleEditor.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold" onClick={handleParticleEditor}>
                  {t('home.tools.particleEditor.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 代码工具卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/code-tools" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-green-100 p-3 w-fit">
                <FileCode className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.codeTools.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.codeTools.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleCodeTools}>
                  {t('home.tools.codeTools.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Markdown编辑器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/markdown-editor" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-yellow-100 p-3 w-fit">
                <Code className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.markdown.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.markdown.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleMarkdownEditor}>
                  {t('home.tools.markdown.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 调色板工具卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/color-palette" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-red-100 p-3 w-fit">
                <Palette className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.colorPalette.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.colorPalette.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleColorPalette}>
                  {t('home.tools.colorPalette.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 文本分析工具卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/text-analyzer" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-indigo-100 p-3 w-fit">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.textAnalyzer.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.textAnalyzer.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleTextAnalyzer}>
                  {t('home.tools.textAnalyzer.button')}
                </Button>
              </div>
            </div>
          </Card>
          
          {/* 二维码生成器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/qr-code-generator" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-teal-100 p-3 w-fit">
                <QrCode className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.qrCode.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.qrCode.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleQrCodeGenerator}>
                  {t('home.tools.qrCode.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Emoji大全卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/emoji-collection" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-pink-100 p-3 w-fit">
                <Smile className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.emojiCollection.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.emojiCollection.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleEmojiCollection}>
                  {t('home.tools.emojiCollection.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 像素艺术生成器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/pixel-art-generator" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-orange-100 p-3 w-fit">
                <Monitor className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.pixelArt.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.pixelArt.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handlePixelArtGenerator}>
                  {t('home.tools.pixelArt.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 哈希/散列值计算器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/hash-calculator" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-cyan-100 p-3 w-fit">
                <Lock className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.hashCalculator.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.hashCalculator.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleHashCalculator}>
                  {t('home.tools.hashCalculator.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* Unix 时间戳转换器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/timestamp-converter" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-orange-100 p-3 w-fit">
                <Monitor className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.timestampConverter.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.timestampConverter.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleTimestampConverter}>
                  {t('home.tools.timestampConverter.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* 在线白板工具卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/whiteboard" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-blue-100 p-3 w-fit">
                <PencilRuler className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.whiteboard.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.whiteboard.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleWhiteboard}>
                  {t('home.tools.whiteboard.button')}
                </Button>
              </div>
            </div>
          </Card>

          {/* GIF分解/合成器卡片 */}
          <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
            <div className="absolute top-4 right-4 z-10">
              <ToolCardFavoriteButton toolPath="/gif-tool" />
            </div>
            <div className="p-6 flex-grow flex flex-col space-y-4">
              <div className="rounded-full bg-green-100 p-3 w-fit">
                <RotateCw className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold">{t('home.tools.gifTool.name')}</h3>
              <p className="text-muted-foreground flex-grow">
                {t('home.tools.gifTool.description')}
              </p>
              <div className="mt-auto pt-4">
                <Button className="w-full" onClick={handleGifTool}>
                  {t('home.tools.gifTool.button')}
                </Button>
              </div>
            </div>
          </Card>

            {/* 天气预报工具卡片 */}
            <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-4 right-4 z-10">
                <ToolCardFavoriteButton toolPath="/weather-tool" />
              </div>
              <div className="p-6 flex-grow flex flex-col space-y-4">
                <div className="rounded-full bg-sky-100 p-3 w-fit">
                  <CloudSun className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold">{t('home.tools.weatherTool.name')}</h3>
                <p className="text-muted-foreground flex-grow">
                  {t('home.tools.weatherTool.description')}
                </p>
                <div className="mt-auto pt-4">
                  <Button className="w-full" onClick={handleWeatherTool}>
                    {t('home.tools.weatherTool.button')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* 数据转图表工具卡片 */}
            <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-4 right-4 z-10">
                <ToolCardFavoriteButton toolPath="/data-to-chart" />
              </div>
              <div className="p-6 flex-grow flex flex-col space-y-4">
                <div className="rounded-full bg-purple-100 p-3 w-fit">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">{t('home.tools.dataToChart.name')}</h3>
                <p className="text-muted-foreground flex-grow">
                  {t('home.tools.dataToChart.description')}
                </p>
                <div className="mt-auto pt-4">
                  <Button className="w-full" onClick={handleDataToChart}>
                    {t('home.tools.dataToChart.button')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* 在线电子钢琴卡片 */}
            <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-4 right-4 z-10">
                <ToolCardFavoriteButton toolPath="/piano" />
              </div>
              <div className="p-6 flex-grow flex flex-col space-y-4">
                <div className="rounded-full bg-blue-100 p-3 w-fit">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="18" r="3" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">{t('home.tools.piano.name')}</h3>
                <p className="text-muted-foreground flex-grow">
                  {t('home.tools.piano.description')}
                </p>
                <div className="mt-auto pt-4">
                  <Button className="w-full" onClick={handlePiano}>
                    {t('home.tools.piano.button')}
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* 交互式2D物理实验室卡片 */}
            <Card className="relative min-h-[300px] flex flex-col transition-all duration-300 hover:shadow-lg">
              <div className="absolute top-4 right-4 z-10">
                <ToolCardFavoriteButton toolPath="/physics-lab" />
              </div>
              <div className="p-6 flex-grow flex flex-col space-y-4">
                <div className="rounded-full bg-amber-100 p-3 w-fit">
                  <FlaskConical className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold">{t('home.tools.physicsLab.name')}</h3>
                <p className="text-muted-foreground flex-grow">
                  {t('home.tools.physicsLab.description')}
                </p>
                <div className="mt-auto pt-4">
                  <Button className="w-full" onClick={handlePhysicsLab}>
                    {t('home.tools.physicsLab.button')}
                  </Button>
                </div>
              </div>
            </Card>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="bg-muted rounded-lg p-8 md:p-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">{t('home.whyChooseUs')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('home.whyChooseUsDesc')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center">
            <Monitor className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-semibold">{t('home.crossPlatform')}</h3>
            <p className="text-muted-foreground">
              {t('home.crossPlatformDesc')}
            </p>
          </div>

          <div className="space-y-3 text-center">
            <Lock className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-semibold">{t('home.dataPrivacy')}</h3>
            <p className="text-muted-foreground">
              {t('home.dataPrivacyDesc')}
            </p>
          </div>

          <div className="space-y-3 text-center">
            <Globe className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-semibold">{t('home.continuousUpdates')}</h3>
            <p className="text-muted-foreground">
              {t('home.continuousUpdatesDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">{t('home.readyToImprove')}</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('home.readyToImproveDesc')}
        </p>
        <Button size="lg" className="px-8 py-6 text-lg" onClick={handleFreeUse}>
          {t('home.startFreeNow')}
        </Button>
      </section>



      {/* 开发中提示组件 */}
      <DevelopmentInProgress
        visible={alertVisible}
        onClose={closeAlert}
        duration={alertDuration}
        message={alertMessage}
      />
    </div>
  );
}