'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { X, Mail, Lock, Github } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithProvider } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: '登录失败',
            description: error.message || '请检查您的邮箱和密码',
            variant: 'destructive',
          });
        } else {
          toast({
            title: '登录成功',
            description: '欢迎回来！',
          });
          onClose();
          setEmail('');
          setPassword('');
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: '注册失败',
            description: error.message || '注册时出现问题，请重试',
            variant: 'destructive',
          });
        } else {
          toast({
            title: '注册成功',
            description: '请检查您的邮箱以验证账户',
          });
          setMode('login');
          setEmail('');
          setPassword('');
        }
      }
    } catch (error: any) {
      toast({
        title: '操作失败',
        description: error.message || '发生了意外错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    try {
      await signInWithProvider(provider);
    } catch (error: any) {
      toast({
        title: '登录失败',
        description: error.message || '第三方登录失败',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-32 md:pt-40"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md bg-background rounded-lg shadow-xl p-6 space-y-5 mx-auto mt-0 max-h-[85vh] overflow-y-auto border"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label="关闭"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? '登录以保存您的作品和历史记录'
              : '创建账户以开始使用'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium block">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-10 w-full"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium block">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-10 w-full"
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-10 mt-4" disabled={loading}>
            {loading
              ? '处理中...'
              : mode === 'login'
              ? '登录'
              : '注册'}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground text-xs">
              或使用第三方登录
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleProviderSignIn('google')}
            className="w-full h-10 flex items-center justify-center"
          >
            <svg className="mr-2 h-4 w-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm">Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleProviderSignIn('github')}
            className="w-full h-10 flex items-center justify-center"
          >
            <Github className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="text-sm">GitHub</span>
          </Button>
        </div>

        <div className="text-center text-sm pt-2">
          {mode === 'login' ? (
            <span className="text-muted-foreground">
              还没有账户？{' '}
              <button
                onClick={() => setMode('register')}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                立即注册
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">
              已有账户？{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                立即登录
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

