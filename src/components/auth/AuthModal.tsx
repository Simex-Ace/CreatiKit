'use client';

import { useState } from 'react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { X, Mail, Lock, Github, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { checkPasswordStrength, isValidEmail } from '@/lib/passwordUtils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  
  // 当 defaultMode 改变时，更新 mode（修复注册按钮问题）
  React.useEffect(() => {
    if (defaultMode === 'login' || defaultMode === 'register') {
      setMode(defaultMode);
    }
  }, [defaultMode]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, signUp, signInWithProvider, resetPassword } = useAuth();
  const { toast } = useToast();

  // 密码强度检查
  const passwordStrength = mode === 'register' && password ? checkPasswordStrength(password) : null;

  // 验证邮箱格式
  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue) {
      setEmailError('请输入邮箱地址');
      return false;
    }
    if (!isValidEmail(emailValue)) {
      setEmailError('请输入有效的邮箱地址');
      return false;
    }
    setEmailError('');
    return true;
  };

  // 验证密码
  const validatePassword = (passwordValue: string, isRegister = false): boolean => {
    if (!passwordValue) {
      setPasswordError('请输入密码');
      return false;
    }
    if (passwordValue.length < 8) {
      setPasswordError('密码至少需要8个字符');
      return false;
    }
    if (isRegister) {
      // 重新计算密码强度以确保准确性
      const strength = checkPasswordStrength(passwordValue);
      if (strength.strength === 'weak') {
        setPasswordError('密码强度太弱，请使用更复杂的密码');
        return false;
      }
      // 要求至少包含大写字母
      if (!/[A-Z]/.test(passwordValue)) {
        setPasswordError('密码必须包含至少一个大写字母');
        return false;
      }
      // 要求至少包含小写字母
      if (!/[a-z]/.test(passwordValue)) {
        setPasswordError('密码必须包含至少一个小写字母');
        return false;
      }
      // 要求至少包含数字
      if (!/[0-9]/.test(passwordValue)) {
        setPasswordError('密码必须包含至少一个数字');
        return false;
      }
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证输入
    if (!validateEmail(email)) return;
    if (!validatePassword(password, mode === 'register')) return;
    
    if (mode === 'register') {
      if (password !== confirmPassword) {
        setPasswordError('两次输入的密码不一致');
        return;
      }
      // 重新验证密码强度
      const strength = checkPasswordStrength(password);
      if (strength.strength === 'weak' || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        setPasswordError('密码必须包含大小写字母和数字');
        toast({
          title: '密码不符合要求',
          description: '密码必须包含大小写字母、数字，至少8个字符',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);
    setEmailError('');
    setPasswordError('');

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          let errorMessage = '请检查您的邮箱和密码';
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = '邮箱或密码错误';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = '请先验证您的邮箱地址';
          }
          toast({
            title: '登录失败',
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          toast({
            title: '登录成功',
            description: '欢迎回来！',
            variant: 'success',
            duration: 2000,
          });
          onClose();
          setEmail('');
          setPassword('');
        }
      } else if (mode === 'register') {
        const { error, data } = await signUp(email, password);
        if (error) {
          let errorMessage = '注册时出现问题，请重试';
          const errorMsg = (error.message || '').toLowerCase();
          const errorCode = error.code || '';
          const errorStatus = error.status || 0;
          
          // 检查各种可能的错误情况
          // Supabase 在邮箱已存在时可能返回不同的错误格式
          if (errorMsg.includes('user already registered') || 
              errorMsg.includes('already registered') ||
              errorMsg.includes('email address is already registered') ||
              errorMsg.includes('already exists') ||
              errorMsg.includes('duplicate') ||
              errorCode === 'signup_disabled' ||
              errorStatus === 422 ||
              (errorStatus >= 400 && errorStatus < 500 && errorMsg.includes('email'))) {
            // 邮箱已被注册
            errorMessage = '该邮箱已被注册，请直接登录';
            setMode('login');
            toast({
              title: '注册失败',
              description: errorMessage,
              variant: 'destructive',
            });
            // 清空密码字段
            setPassword('');
            setConfirmPassword('');
            setLoading(false);
            return;
          } else if (errorMsg.includes('password')) {
            errorMessage = '密码不符合要求，请使用更复杂的密码';
          } else if (errorMsg.includes('email')) {
            errorMessage = '邮箱格式不正确或已被使用';
          } else if (errorMsg.includes('invalid')) {
            errorMessage = '输入信息无效，请检查后重试';
          }
          
          toast({
            title: '注册失败',
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          // 检查是否真的创建了新用户
          if (data?.user) {
            // 如果用户已存在但未验证，Supabase 可能会返回已存在的用户
            // 我们需要确保这是新创建的用户
            toast({
              title: '注册成功',
              description: data.user.email_confirmed_at 
                ? '账户已创建，可以开始使用了！'
                : '请检查您的邮箱以验证账户。如果该邮箱已注册，请直接登录。',
              variant: 'success',
              duration: 4000,
            });
            setMode('login');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          } else {
            // 没有返回用户数据，可能是重复注册被阻止了
            toast({
              title: '注册失败',
              description: '该邮箱可能已被注册，请直接登录或使用忘记密码功能',
              variant: 'destructive',
            });
            setMode('login');
          }
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          let errorMessage = '无法发送重置密码邮件';
          const errorMsg = (error.message || '').toLowerCase();
          const errorCode = error.code || '';
          
          if (errorMsg.includes('email not found') || 
              errorMsg.includes('未注册') ||
              errorCode === 'email_not_found' ||
              error.status === 404) {
            errorMessage = '该邮箱未注册，请先注册账户';
          } else if (errorMsg.includes('rate limit') || 
                     errorMsg.includes('too many') ||
                     errorMsg.includes('too frequent') ||
                     errorCode === 'rate_limit_exceeded' ||
                     error.status === 429) {
            errorMessage = error.message || '请求过于频繁，请稍后再试（通常需要等待几分钟）';
          } else if (errorMsg.includes('invalid email')) {
            errorMessage = '邮箱格式不正确';
          } else if (errorMsg.includes('configuration') || errorMsg.includes('smtp')) {
            errorMessage = '邮件服务配置错误，请联系管理员';
          } else {
            // 使用原始错误消息
            errorMessage = error.message || errorMessage;
          }
          
          toast({
            title: '发送失败',
            description: errorMessage,
            variant: 'destructive',
            duration: 5000,
          });
        } else {
          toast({
            title: '邮件已发送',
            description: '请检查您的邮箱（包括垃圾邮件文件夹）以重置密码。如果未收到邮件，请检查邮箱地址是否正确，或稍后重试。',
            variant: 'success',
            duration: 5000,
          });
          setMode('login');
          setEmail('');
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
      setLoading(true);
      await signInWithProvider(provider);
      // OAuth 会重定向，所以这里不需要关闭弹窗
    } catch (error: any) {
      setLoading(false);
      toast({
        title: '登录失败',
        description: error.message || '第三方登录失败，请检查是否已正确配置',
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
            {mode === 'login' ? '登录' : mode === 'register' ? '注册' : '重置密码'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? '登录以保存您的作品和历史记录'
              : mode === 'register'
              ? '创建账户以开始使用'
              : '输入您的邮箱地址，我们将发送重置密码链接'}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={() => validateEmail(email)}
                className={`pl-10 h-10 w-full ${emailError ? 'border-destructive' : ''}`}
                required
                autoComplete="email"
              />
            </div>
            {emailError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {emailError}
              </p>
            )}
          </div>

          {mode !== 'forgot' && (
            <>
              <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium block">
                  密码
                  {mode === 'register' && (
                    <span className="text-xs text-muted-foreground ml-2">(至少8个字符，包含大小写字母和数字)</span>
                  )}
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
                      if (passwordError) validatePassword(e.target.value, mode === 'register');
                    }}
                    onBlur={() => validatePassword(password, mode === 'register')}
                    className={`pl-10 pr-10 h-10 w-full ${passwordError ? 'border-destructive' : ''}`}
                    required
                    minLength={mode === 'register' ? 8 : 6}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                {mode === 'register' && password && (
                  <div className="space-y-1.5">
                    {(() => {
                      const strength = checkPasswordStrength(password);
                      return (
                        <>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  strength.strength === 'weak'
                                    ? 'bg-red-500 w-1/3'
                                    : strength.strength === 'medium'
                                    ? 'bg-yellow-500 w-2/3'
                                    : 'bg-green-500 w-full'
                                }`}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {strength.strength === 'weak' ? '弱' : strength.strength === 'medium' ? '中' : '强'}
                            </span>
                          </div>
                          {strength.feedback.length > 0 && strength.strength !== 'strong' && (
                            <p className="text-xs text-muted-foreground">
                              建议：{strength.feedback.slice(0, 2).join('、')}
                            </p>
                          )}
                          {/* 明确显示密码要求 */}
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
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium block">确认密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError && e.target.value === password) {
                          setPasswordError('');
                        }
                      }}
                      onBlur={() => {
                        if (confirmPassword && confirmPassword !== password) {
                          setPasswordError('两次输入的密码不一致');
                        }
                      }}
                      className={`pl-10 pr-10 h-10 w-full ${passwordError && confirmPassword ? 'border-destructive' : ''}`}
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
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary hover:underline"
                  >
                    忘记密码？
                  </button>
                </div>
              )}
            </>
          )}

          <Button type="submit" className="w-full h-10 mt-4" disabled={loading}>
            {loading
              ? '处理中...'
              : mode === 'login'
              ? '登录'
              : mode === 'register'
              ? '注册'
              : '发送重置链接'}
          </Button>
        </form>

        {mode !== 'forgot' && (
          <>
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
                disabled={loading}
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
                disabled={loading}
                className="w-full h-10 flex items-center justify-center"
              >
                <Github className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-sm">GitHub</span>
              </Button>
            </div>
          </>
        )}

        <div className="text-center text-sm pt-2">
          {mode === 'login' ? (
            <span className="text-muted-foreground">
              还没有账户？{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setEmailError('');
                  setPasswordError('');
                }}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                立即注册
              </button>
            </span>
          ) : mode === 'register' ? (
            <span className="text-muted-foreground">
              已有账户？{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setEmailError('');
                  setPasswordError('');
                }}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                立即登录
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">
              记起密码了？{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setEmailError('');
                }}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                返回登录
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

