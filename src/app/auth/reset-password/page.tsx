'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { checkPasswordStrength } from '@/lib/passwordUtils';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();
  const { toast } = useToast();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // 使用 ref 来防止重复执行
  const hasCheckedRef = useRef(false);
  const toastShownRef = useRef(false);

  // 检查是否有有效的重置会话
  useEffect(() => {
    // 如果已经检查过，不再执行
    if (hasCheckedRef.current) {
      return;
    }

    let isMounted = true;
    let redirectTimeout: NodeJS.Timeout | null = null;
    
    const checkSession = async () => {
      // 标记为已检查，防止重复执行
      hasCheckedRef.current = true;
      
      // 详细日志
      console.log('[Reset Password] Page loaded, checking session...');
      console.log('[Reset Password] Full URL:', window.location.href);
      console.log('[Reset Password] All search params:', Object.fromEntries(searchParams.entries()));
      
      // 先检查 URL 参数中是否有错误信息
      const error = searchParams.get('error');
      const errorMessage = searchParams.get('message');
      
      if (error || errorMessage) {
        if (!isMounted || toastShownRef.current) return;
        
        setIsValidSession(false);
        toastShownRef.current = true;
        toast({
          title: error === 'expired' ? '链接已过期' : '链接无效',
          description: errorMessage || '请重新申请密码重置',
          variant: 'destructive',
          duration: 5000,
        });
        
        // 延迟跳转，但只执行一次
        redirectTimeout = setTimeout(() => {
          if (isMounted) {
            // 使用 replace 而不是 push，避免在历史记录中留下记录
            router.replace('/');
          }
        }, 5000);
        return;
      }
      
      // 检查 URL 中的参数（支持 code 和 token 两种格式）
      const code = searchParams.get('code');
      const token = searchParams.get('token'); // Supabase 可能使用 token 而不是 code
      const type = searchParams.get('type');
      
      // 优先处理 token 参数（如果存在）
      // 注意：如果 URL 中有 token，说明可能直接访问了重置密码页面
      // 对于这种情况，我们直接检查会话（Supabase 可能已经通过 cookie 设置了会话）
      if (token && type === 'recovery') {
        console.log('[Reset Password] Found token in URL, checking session...');
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        try {
          // 等待一小段时间，确保 cookie 已同步
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // 直接检查会话（如果 token 有效，Supabase 应该已经设置了会话）
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (!isMounted) return;
          
          if (session) {
            console.log('[Reset Password] Session found with token');
            setIsValidSession(true);
            return;
          } else {
            // 如果没有会话，说明 token 可能无效或已过期
            console.warn('[Reset Password] No session found with token', sessionError);
            // 继续下面的逻辑，尝试其他方式或显示错误
          }
        } catch (err: any) {
          console.error('[Reset Password] Exception checking session with token:', err);
          // 继续下面的逻辑，尝试其他方式
        }
      }
      
      // 处理 code 参数（新格式）
      if (code && type === 'recovery') {
        // 如果有 code，优先使用 code 交换会话
        // 这样可以确保即使服务端 cookie 不同步，客户端也能获取会话
        console.log('[Reset Password] Found code in URL, attempting to exchange...');
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        
        try {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (!isMounted) return;
          
          if (exchangeError) {
            console.error('[Reset Password] Error exchanging code:', {
              message: exchangeError.message,
              status: exchangeError.status,
              name: exchangeError.name
            });
            
            // 不要立即判断为过期，可能是其他错误
            setIsValidSession(false);
            if (!toastShownRef.current) {
              toastShownRef.current = true;
              const errorMsg = (exchangeError.message || '').toLowerCase();
              
              // 只有明确是过期错误才显示过期提示
              if (errorMsg.includes('expired') || errorMsg.includes('otp_expired')) {
                toast({
                  title: '链接已过期',
                  description: '密码重置链接已过期，请重新申请',
                  variant: 'destructive',
                  duration: 5000,
                });
              } else if (errorMsg.includes('invalid') || exchangeError.status === 403) {
                // 403 可能是配置问题，不一定是过期
                toast({
                  title: '链接无效',
                  description: '请检查链接是否正确，或重新申请密码重置',
                  variant: 'destructive',
                  duration: 5000,
                });
              } else {
                // 其他错误（如网络错误），给用户更友好的提示
                toast({
                  title: '验证失败',
                  description: exchangeError.message || '请稍后重试或重新申请密码重置',
                  variant: 'destructive',
                  duration: 5000,
                });
              }
            }
            redirectTimeout = setTimeout(() => {
              if (isMounted) {
                router.replace('/');
              }
            }, 5000);
            return;
          }
          
          if (data?.session) {
            console.log('[Reset Password] Session created from code successfully', {
              userId: data.session.user?.id
            });
            setIsValidSession(true);
            return;
          } else {
            console.warn('[Reset Password] No session after code exchange, but no error');
            // 即使没有会话，也继续检查现有会话（可能服务端已经设置了 cookie）
          }
        } catch (err: any) {
          console.error('[Reset Password] Exception during code exchange:', err);
          if (!isMounted) return;
          setIsValidSession(false);
          if (!toastShownRef.current) {
            toastShownRef.current = true;
            toast({
              title: '验证失败',
              description: '请重新申请密码重置',
              variant: 'destructive',
              duration: 5000,
            });
          }
          redirectTimeout = setTimeout(() => {
            if (isMounted) {
              router.replace('/');
            }
          }, 5000);
          return;
        }
      }
      
      // 检查现有会话（无论是否有 code，都检查一下，因为服务端可能已经设置了 cookie）
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // 等待一小段时间，确保 cookie 已同步（特别是在移动端）
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (!isMounted) return;
      
      // 检查是否有有效的会话（通过密码重置链接访问的用户会有临时会话）
      if (session) {
        console.log('[Reset Password] Valid session found', {
          userId: session.user?.id,
          expiresAt: session.expires_at
        });
        setIsValidSession(true);
      } else {
        console.warn('[Reset Password] No valid session found', {
          error: sessionError,
          hadCode: !!code
        });
        setIsValidSession(false);
        
        // 只在没有显示过 toast 时显示
        if (!toastShownRef.current) {
          toastShownRef.current = true;
          const errorMsg = sessionError?.message || '';
          
          // 如果有 code 但交换失败，说明可能是其他问题，不是过期
          if (code) {
            toast({
              title: '验证失败',
              description: '请检查网络连接，或重新申请密码重置',
              variant: 'destructive',
              duration: 5000,
            });
          } else if (errorMsg.includes('expired') || errorMsg.includes('invalid')) {
            toast({
              title: '链接已过期',
              description: '密码重置链接已过期，请重新申请',
              variant: 'destructive',
              duration: 5000,
            });
          } else {
            toast({
              title: '链接无效',
              description: '请从邮箱中的重置链接进入，或重新申请密码重置',
              variant: 'destructive',
              duration: 5000,
            });
          }
        }
        
        // 延迟跳转，但只执行一次
        redirectTimeout = setTimeout(() => {
          if (isMounted) {
            router.replace('/');
          }
        }, 5000);
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
    // 使用具体的参数值作为依赖，而不是整个 searchParams 对象
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('error'), searchParams.get('message')]);

  // 验证密码
  const validatePassword = (passwordValue: string): boolean => {
    if (!passwordValue) {
      setPasswordError('请输入新密码');
      return false;
    }
    if (passwordValue.length < 8) {
      setPasswordError('密码至少需要8个字符');
      return false;
    }
    
    const strength = checkPasswordStrength(passwordValue);
    if (strength.strength === 'weak') {
      setPasswordError('密码强度太弱，请使用更复杂的密码');
      return false;
    }
    
    if (!/[A-Z]/.test(passwordValue)) {
      setPasswordError('密码必须包含至少一个大写字母');
      return false;
    }
    if (!/[a-z]/.test(passwordValue)) {
      setPasswordError('密码必须包含至少一个小写字母');
      return false;
    }
    if (!/[0-9]/.test(passwordValue)) {
      setPasswordError('密码必须包含至少一个数字');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  // 验证确认密码
  const validateConfirmPassword = (confirmValue: string): boolean => {
    if (!confirmValue) {
      setConfirmPasswordError('请确认新密码');
      return false;
    }
    if (confirmValue !== password) {
      setConfirmPasswordError('两次输入的密码不一致');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) return;
    if (!validateConfirmPassword(confirmPassword)) return;
    
    setLoading(true);
    setPasswordError('');
    setConfirmPasswordError('');

    try {
      const { error } = await updatePassword(password);
      if (error) {
        let errorMessage = '密码更新失败，请重试';
        const errorMsg = (error.message || '').toLowerCase();
        
        if (errorMsg.includes('session') || errorMsg.includes('expired')) {
          errorMessage = '重置链接已过期，请重新申请';
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else if (errorMsg.includes('password')) {
          errorMessage = '密码不符合要求';
        }
        
        toast({
          title: '更新失败',
          description: errorMessage,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '密码已更新',
          description: '请使用新密码登录',
          variant: 'success',
          duration: 3000,
        });
        
        // 等待一下让用户看到成功消息，然后跳转到登录页
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: '更新失败',
        description: error.message || '发生了意外错误',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">验证重置链接...</p>
        </div>
      </div>
    );
  }

  if (isValidSession === false) {
    const error = searchParams.get('error');
    const errorMessage = searchParams.get('message');
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">
              {error === 'expired' ? '链接已过期' : '链接无效'}
            </h1>
            <p className="text-muted-foreground">
              {errorMessage || '重置链接已过期或无效，请重新申请密码重置'}
            </p>
            <div className="space-y-3 pt-2">
              <div className="space-y-2">
                <Link href="/">
                  <Button className="w-full" variant="default">
                    返回首页
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center">
                  提示：密码重置链接通常有效期为 1 小时，请尽快使用
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  需要重新申请密码重置？
                </p>
                <p className="text-xs text-muted-foreground">
                  返回首页后，点击"登录"按钮，然后选择"忘记密码？"即可重新申请
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const passwordStrength = password ? checkPasswordStrength(password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">重置密码</h1>
          <p className="text-sm text-muted-foreground">
            请输入您的新密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium block">
              新密码
              <span className="text-xs text-muted-foreground ml-2">(至少8个字符，包含大小写字母和数字)</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                onBlur={() => validatePassword(password)}
                className={`pl-10 pr-10 h-10 w-full ${passwordError ? 'border-destructive' : ''}`}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {passwordError}
              </p>
            )}
            {password && passwordStrength && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 'weak'
                          ? 'bg-red-500 w-1/3'
                          : passwordStrength.strength === 'medium'
                          ? 'bg-yellow-500 w-2/3'
                          : 'bg-green-500 w-full'
                      }`}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {passwordStrength.strength === 'weak' ? '弱' : passwordStrength.strength === 'medium' ? '中' : '强'}
                  </span>
                </div>
                {!passwordError && (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} 包含大写字母
                    </p>
                    <p className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                      {/[a-z]/.test(password) ? '✓' : '○'} 包含小写字母
                    </p>
                    <p className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                      {/[0-9]/.test(password) ? '✓' : '○'} 包含数字
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium block">确认新密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="再次输入新密码"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError && e.target.value === password) {
                    setConfirmPasswordError('');
                  }
                }}
                onBlur={() => validateConfirmPassword(confirmPassword)}
                className={`pl-10 pr-10 h-10 w-full ${confirmPasswordError ? 'border-destructive' : ''}`}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {confirmPasswordError}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                更新中...
              </>
            ) : (
              '更新密码'
            )}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href="/" className="text-primary hover:underline">
            返回首页
          </Link>
        </div>
      </Card>
    </div>
  );
}

