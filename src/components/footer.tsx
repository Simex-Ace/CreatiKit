'use client'

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Instagram } from 'lucide-react';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';

export function Footer() {
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();
  
  const handleDevelopmentLink = (e: React.MouseEvent, message?: string) => {
    e.preventDefault();
    showAlert(message || '此页面正在开发中，敬请期待！');
  };

  return (
    <footer className="w-full border-t bg-background/95">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                CreatiKit
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              强大而简洁的在线创意工具箱，赋能您的设计与开发工作流
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '社交媒体功能正在开发中')}>
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '社交媒体功能正在开发中')}>
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '社交媒体功能正在开发中')}>
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">工具</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compress" className="text-sm text-muted-foreground hover:text-primary">
                  图片压缩
                </Link>
              </li>
              <li>
                <Link href="/model-viewer" className="text-sm text-muted-foreground hover:text-primary">
                  3D预览
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '代码工具正在开发中')}>
                  代码工具
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '设计工具正在开发中')}>
                  设计工具
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">资源</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '文档页面正在开发中')}>
                  文档
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, 'API功能正在开发中')}>
                  API
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '博客功能正在开发中')}>
                  博客
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '教程功能正在开发中')}>
                  教程
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">公司</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '关于我们页面正在开发中')}>
                  关于我们
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '隐私政策页面正在开发中')}>
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '使用条款页面正在开发中')}>
                  使用条款
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '联系我们功能正在开发中')}>
                  联系我们
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatiKit.io. 保留所有权利。
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '隐私政策页面正在开发中')}>
              隐私政策
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-primary" onClick={(e) => handleDevelopmentLink(e, '使用条款页面正在开发中')}>
              使用条款
            </Link>
          </div>
        </div>
      </div>
      
      {/* 开发中提示 */}
      <DevelopmentInProgress 
        visible={alertVisible}
        onClose={closeAlert}
        duration={alertDuration}
        message={alertMessage}
      />
    </footer>
  );
}