'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const handleLogin = () => {
    showAlert('登录功能正在开发中，敬请期待！');
  };
  
  const handleRegister = () => {
    showAlert('注册功能正在开发中，敬请期待！');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              CreatiKit
            </span>
          </Link>
          <nav className="hidden md:flex items-center ml-10 space-x-8">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              首页
            </Link>
            <Link href="/compress" className="text-sm font-medium transition-colors hover:text-primary">
              图片压缩
            </Link>
            <Link href="/model-viewer" className="text-sm font-medium transition-colors hover:text-primary">
              3D预览
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Button className="hidden sm:inline-flex" onClick={handleLogin}>登录</Button>
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={handleRegister}>
            注册
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link href="/" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
              首页
            </Link>
            <Link href="/compress" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
              图片压缩
            </Link>
            <Link href="/model-viewer" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
              3D预览
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Button className="w-full" onClick={handleLogin}>登录</Button>
              <Button variant="secondary" className="w-full" onClick={handleRegister}>
                注册
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 开发中提示 */}
      <DevelopmentInProgress 
        visible={alertVisible}
        onClose={closeAlert}
        duration={alertDuration}
        message={alertMessage}
      />
    </header>
  );
}