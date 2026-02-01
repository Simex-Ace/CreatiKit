'use client'

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/auth/UserMenu';
import { LogOut } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // 当用户登录成功后，自动关闭弹窗
  useEffect(() => {
    if (user && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [user, authModalOpen]);
  
  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };
  
  const handleRegister = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: '已退出登录',
        description: '期待您的再次使用',
      });
    } catch (error) {
      toast({
        title: '退出失败',
        description: '请重试',
        variant: 'destructive',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 transition-transform duration-300 ease-out hover:scale-[1.02]">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300 ease-out hover:from-blue-500 hover:to-purple-500">
              CreatiKit
            </span>
          </Link>
          <nav className="hidden md:flex items-center ml-10 space-x-8">
            <Link href="/" className="text-sm font-medium relative px-3 py-1.5 rounded-md transition-colors duration-300 ease-out hover:text-primary before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">首页</span>
            </Link>
            <Link href="/compress" className="text-sm font-medium relative px-3 py-1.5 rounded-md transition-colors duration-300 ease-out hover:text-primary before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">图片压缩</span>
            </Link>
            <Link href="/model-viewer" className="text-sm font-medium relative px-3 py-1.5 rounded-md transition-colors duration-300 ease-out hover:text-primary before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">3D预览</span>
            </Link>
            <Link href="/color-palette" className="text-sm font-medium relative px-3 py-1.5 rounded-md transition-colors duration-300 ease-out hover:text-primary before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">调色板</span>
            </Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {!loading && (
            <>
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="hidden sm:inline-flex transition-all duration-300 ease-out"
                    title="退出登录"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <UserMenu />
                </>
              ) : (
                <>
          <Button 
            className="hidden sm:inline-flex relative overflow-hidden transition-all duration-300 ease-out hover:bg-primary/85 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:bg-primary/90" 
            onClick={handleLogin}
          >
            <span className="relative z-10">登录</span>
          </Button>
          <Button 
            variant="secondary" 
            className="hidden sm:inline-flex relative overflow-hidden transition-all duration-300 ease-out hover:bg-secondary/60 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 active:translate-y-0 active:bg-secondary/50 border" 
            onClick={handleRegister}
          >
            <span className="relative z-10">注册</span>
          </Button>
                </>
              )}
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden transition-all duration-300 ease-out" onClick={toggleMenu}>
            {isMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link href="/" className="block py-2 px-3 text-sm font-medium relative rounded-md transition-all duration-300 ease-out hover:text-primary hover:translate-x-1 before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">首页</span>
            </Link>
            <Link href="/compress" className="block py-2 px-3 text-sm font-medium relative rounded-md transition-all duration-300 ease-out hover:text-primary hover:translate-x-1 before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">图片压缩</span>
            </Link>
            <Link href="/model-viewer" className="block py-2 px-3 text-sm font-medium relative rounded-md transition-all duration-300 ease-out hover:text-primary hover:translate-x-1 before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">3D预览</span>
            </Link>
            <Link href="/whiteboard" className="block py-2 px-3 text-sm font-medium relative rounded-md transition-all duration-300 ease-out hover:text-primary hover:translate-x-1 before:absolute before:inset-0 before:rounded-md before:bg-accent/30 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out hover:before:opacity-100">
              <span className="relative z-10">在线白板</span>
            </Link>
            {!loading && (
            <div className="pt-2 flex flex-col space-y-2">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>退出登录</span>
                    </Button>
                    <UserMenu />
                  </>
                ) : (
                  <>
              <Button 
                className="w-full relative overflow-hidden transition-all duration-300 ease-out hover:bg-primary/85 hover:shadow-md active:bg-primary/90" 
                onClick={handleLogin}
              >
                <span className="relative z-10">登录</span>
              </Button>
              <Button 
                variant="secondary" 
                className="w-full relative overflow-hidden transition-all duration-300 ease-out hover:bg-secondary/60 hover:shadow-md hover:border-primary/30 active:bg-secondary/50 border" 
                onClick={handleRegister}
              >
                <span className="relative z-10">注册</span>
              </Button>
                  </>
                )}
            </div>
            )}
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
      
      {/* 登录/注册弹窗 - 只在未登录时显示，确保登录后完全移除 */}
      {!user && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode={authMode}
        />
      )}
    </header>
  );
}