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
            <Link href="/color-palette" className="text-sm font-medium transition-colors hover:text-primary">
              调色板
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
                    className="hidden sm:inline-flex"
                    title="退出登录"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                  <UserMenu />
                </>
              ) : (
                <>
          <Button className="hidden sm:inline-flex" onClick={handleLogin}>登录</Button>
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={handleRegister}>
            注册
          </Button>
                </>
              )}
            </>
          )}
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
            <Link href="/whiteboard" className="block py-2 text-sm font-medium transition-colors hover:text-primary">
              在线白板
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
              <Button className="w-full" onClick={handleLogin}>登录</Button>
              <Button variant="secondary" className="w-full" onClick={handleRegister}>
                注册
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