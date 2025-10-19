'use client'

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Image, Globe, FileCode, Monitor, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';

export default function Home() {
  const router = useRouter();
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();

  // 处理按钮点击事件
  const handleStartUsing = () => {
    // 跳转到功能区域
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  const handleLearnMore = () => {
    showAlert('了解更多功能将在后续版本中提供详细介绍');
  };

  const handleImageCompressor = () => {
    router.push('/compress');
  };

  const handleModelViewer = () => {
    router.push('/model-viewer');
  };

  const handleCodeTools = () => {
    showAlert('代码工具功能正在开发中，敬请期待');
  };

  const handleFreeUse = () => {
    // 跳转到功能区域
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div className="space-y-12">
      {/* 英雄区域 */}
      <section className="py-16 text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            CreatiKit.io
          </span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          强大而简洁的在线创意工具箱，赋能您的设计与开发工作流
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button size="lg" className="px-8 py-6 text-lg" onClick={handleStartUsing}>
            开始使用
          </Button>
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" onClick={handleLearnMore}>
            了解更多
          </Button>
        </div>
      </section>

      <Separator />

      {/* 功能卡片 */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">强大工具集</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            一站式解决您的创意需求，从图片处理到3D预览，提升工作效率
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 图片压缩工具卡片 */}
          <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg">
            <div className="p-6 space-y-4">
              <div className="rounded-full bg-blue-100 p-3 w-fit">
                <Image className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold">图片压缩工具</h3>
              <p className="text-muted-foreground">
                轻松压缩JPG、PNG图片，保持画质的同时减小文件体积
              </p>
              <Button variant="default" className="w-full" onClick={handleImageCompressor}>
                立即使用
              </Button>
            </div>
          </Card>

          {/* 3D模型预览器卡片 */}
          <Card className="p-6 transition-all duration-300 hover:shadow-lg">
            <Globe className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">3D模型预览器</h3>
            <p className="text-muted-foreground mb-4">
              在线预览各种格式的3D模型，支持旋转、缩放等交互操作
            </p>
            <Button className="w-full" onClick={handleModelViewer}>
              预览模型
            </Button>
          </Card>

          {/* 开发工具卡片 */}
          <Card className="p-6 transition-all duration-300 hover:shadow-lg">
            <FileCode className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">代码工具</h3>
            <p className="text-muted-foreground mb-4">
              代码格式化、压缩和转换工具，提升开发效率
            </p>
            <Button disabled className="w-full" onClick={handleCodeTools}>
              即将推出
            </Button>
          </Card>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="bg-muted rounded-lg p-8 md:p-12 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">为什么选择我们</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            我们致力于提供最优质的在线工具体验
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3 text-center">
            <Monitor className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-semibold">全平台支持</h3>
            <p className="text-muted-foreground">
              基于浏览器的解决方案，无需安装，随时随地可用
            </p>
          </div>

          <div className="space-y-3 text-center">
            <Lock className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-semibold">数据隐私</h3>
            <p className="text-muted-foreground">
              本地处理，不上传您的敏感文件，确保数据安全
            </p>
          </div>

          <div className="space-y-3 text-center">
            <Globe className="h-12 w-12 mx-auto text-primary mb-2" />
            <h3 className="text-xl font-semibold">持续更新</h3>
            <p className="text-muted-foreground">
              不断添加新功能和改进现有工具，满足您的需求
            </p>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">准备好提升您的创意工作流了吗？</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          加入数千名创意专业人士的行列，使用CreatiKit.io提升工作效率
        </p>
        <Button size="lg" className="px-8 py-6 text-lg" onClick={handleFreeUse}>
          立即开始免费使用
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