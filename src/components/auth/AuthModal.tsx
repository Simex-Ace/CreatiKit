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
import { useI18n } from '@/contexts/I18nContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, defaultMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [oauthProvider, setOauthProvider] = useState<'google' | 'github' | null>(null);
  const { signIn, signUp, signInWithProvider, resetPassword } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  
  // 当 defaultMode 改变时，更新 mode（修复注册按钮问题）
  React.useEffect(() => {
    if (defaultMode === 'login' || defaultMode === 'register') {
      setMode(defaultMode);
    }
  }, [defaultMode]);
  
  // 监听弹窗关闭，重置 loading 状态和模式
  React.useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      // 关闭弹窗时重置为登录模式
      setMode('login');
      setOauthProvider(null);
    }
  }, [isOpen]);
  
  // 监听页面焦点变化和可见性变化，检测用户是否从 OAuth 页面返回
  React.useEffect(() => {
    if (!isOpen || !loading) return;
    
    let checkTimeout: NodeJS.Timeout;
    
    const checkOAuthStatus = () => {
      // 延迟检查，给回调时间处理
      checkTimeout = setTimeout(() => {
        const urlParams = new URLSearchParams(window.location.search);
        // 如果 URL 中没有 code 或 error 参数，说明用户可能取消了登录
        if (!urlParams.has('code') && !urlParams.has('error')) {
          setLoading(false);
        }
      }, 2000);
    };
    
    const handleFocus = () => {
      checkOAuthStatus();
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkOAuthStatus();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (checkTimeout) clearTimeout(checkTimeout);
    };
  }, [isOpen, loading]);

  // 密码强度检查
  const passwordStrength = mode === 'register' && password ? checkPasswordStrength(password) : null;

  // 验证邮箱格式
  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue) {
      setEmailError(t('auth.emailRequired'));
      return false;
    }
    if (!isValidEmail(emailValue)) {
      setEmailError(t('auth.emailInvalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  // 验证密码
  const validatePassword = (passwordValue: string, isRegister = false): boolean => {
    if (!passwordValue) {
      setPasswordError(t('auth.passwordRequired'));
      return false;
    }
    if (passwordValue.length < 8) {
      setPasswordError(t('auth.passwordMinLength'));
      return false;
    }
    if (isRegister) {
      // 重新计算密码强度以确保准确性
      const strength = checkPasswordStrength(passwordValue);
      if (strength.strength === 'weak') {
        setPasswordError(t('auth.passwordTooWeak'));
        return false;
      }
      // 要求至少包含大写字母
      if (!/[A-Z]/.test(passwordValue)) {
        setPasswordError(t('auth.passwordRequiresUppercase'));
        return false;
      }
      // 要求至少包含小写字母
      if (!/[a-z]/.test(passwordValue)) {
        setPasswordError(t('auth.passwordRequiresLowercase'));
        return false;
      }
      // 要求至少包含数字
      if (!/[0-9]/.test(passwordValue)) {
        setPasswordError(t('auth.passwordRequiresNumber'));
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
        setPasswordError(t('auth.passwordsDoNotMatch'));
        return;
      }
      // 重新验证密码强度
      const strength = checkPasswordStrength(password);
      if (strength.strength === 'weak' || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        setPasswordError(t('auth.passwordRequirement'));
        toast({
          title: t('auth.registerFailed'),
          description: t('auth.passwordRequirementDetail'),
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
          let errorMessage = t('auth.checkEmailAndPassword');
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = t('auth.emailOrPasswordIncorrect');
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = t('auth.pleaseVerifyEmail');
          }
          toast({
            title: t('auth.loginFailed'),
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          toast({
            title: t('auth.loginSuccess'),
            description: t('auth.welcomeBack'),
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
          let errorMessage = t('auth.registrationFailedRetry');
          const errorMsg = (error.message || '').toLowerCase();
          const errorCode = error.code || '';
          const errorStatus = error.status || 0;
          
          // 详细日志，帮助调试
          console.log('[AuthModal] Sign up error details:', {
            message: error.message,
            code: errorCode,
            status: errorStatus,
            fullError: error
          });
          
          // 首先检查是否是频率限制错误（429）
          if (errorStatus === 429 || 
              errorMsg.includes('rate limit') || 
              errorMsg.includes('too many requests') ||
              errorMsg.includes('email rate limit exceeded')) {
            errorMessage = t('auth.rateLimitExceeded');
            toast({
              title: t('auth.registerFailed'),
              description: errorMessage,
              variant: 'destructive',
              duration: 5000,
            });
            setLoading(false);
            return;
          }
          
          // 只检查 Supabase 明确返回的"用户已注册"错误
          // 移除过于宽泛的条件，避免误判
          const isEmailAlreadyRegistered = 
            errorMsg.includes('user already registered') || 
            errorMsg.includes('email address is already registered') ||
            (errorCode === 'email_already_exists') ||
            (errorStatus === 422 && errorMsg.includes('already registered')) ||
            (errorStatus === 422 && errorCode === 'email_already_exists');
          
          if (isEmailAlreadyRegistered) {
            // 邮箱已被注册
            errorMessage = t('auth.emailAlreadyRegistered');
            setMode('login');
            toast({
              title: t('auth.registerFailed'),
              description: errorMessage,
              variant: 'destructive',
            });
            // 清空密码字段
            setPassword('');
            setConfirmPassword('');
            setLoading(false);
            return;
          } else if (errorMsg.includes('password') || errorMsg.includes('weak password')) {
            errorMessage = t('auth.passwordDoesNotMeetRequirements');
          } else if (errorMsg.includes('invalid email') || errorMsg.includes('email format')) {
            errorMessage = t('auth.emailFormatIncorrect');
          } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
            errorMessage = t('auth.networkConnectionFailed');
          } else {
            // 其他错误，显示原始错误消息
            errorMessage = error.message || t('auth.registrationFailedRetry');
          }
          
          toast({
            title: t('auth.registerFailed'),
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          // 检查是否真的创建了新用户
          if (data?.user) {
            // 如果用户已存在但未验证，Supabase 可能会返回已存在的用户
            // 我们需要确保这是新创建的用户
            toast({
              title: t('auth.registerSuccess'),
              description: data.user.email_confirmed_at 
                ? t('auth.accountCreated')
                : t('auth.checkEmailToVerify'),
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
              title: t('auth.registerFailed'),
              description: t('auth.emailMayBeRegistered'),
              variant: 'destructive',
            });
            setMode('login');
          }
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          let errorMessage = t('auth.resetPasswordFailed');
          const errorMsg = (error.message || '').toLowerCase();
          const errorCode = error.code || '';
          
          if (errorMsg.includes('email not found') || 
              errorMsg.includes('未注册') ||
              errorCode === 'email_not_found' ||
              error.status === 404) {
            errorMessage = t('auth.emailNotRegistered');
          } else if (errorMsg.includes('rate limit') || 
                     errorMsg.includes('too many') ||
                     errorMsg.includes('too frequent') ||
                     errorCode === 'rate_limit_exceeded' ||
                     error.status === 429) {
            errorMessage = error.message || t('auth.resetPasswordRateLimit');
          } else if (errorMsg.includes('invalid email')) {
            errorMessage = t('auth.emailFormatIncorrect');
          } else if (errorMsg.includes('configuration') || errorMsg.includes('smtp')) {
            errorMessage = t('auth.resetPasswordFailed');
          } else {
            // 使用原始错误消息
            errorMessage = error.message || errorMessage;
          }
          
          toast({
            title: t('auth.resetPasswordFailed'),
            description: errorMessage,
            variant: 'destructive',
            duration: 5000,
          });
        } else {
          toast({
            title: t('auth.resetPasswordEmailSent'),
            description: t('auth.checkEmailForReset'),
            variant: 'success',
            duration: 5000,
          });
          setMode('login');
          setEmail('');
        }
      }
    } catch (error: any) {
      toast({
        title: t('auth.operationFailed'),
        description: error.message || t('auth.unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    try {
      setOauthProvider(provider);
      setLoading(true);
      
      // 延迟 1.5 秒再跳转，让用户看到动画效果
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 设置超时，如果 10 秒内没有重定向，自动重置 loading 状态
      // 正常情况下 OAuth 会立即重定向，所以 10 秒足够检测问题
      const timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setOauthProvider(null);
          console.warn('[OAuth] Timeout: OAuth redirect took too long, resetting loading state');
        }
      }, 10000);
      
      await signInWithProvider(provider);
      
      // 正常情况下，OAuth 会立即重定向，所以这里不会执行
      // 但如果 signInWithProvider 没有立即重定向，清除超时
      clearTimeout(timeoutId);
      
      // OAuth 会重定向到第三方登录页面，所以这里不需要关闭弹窗或重置 loading
    } catch (error: any) {
      setLoading(false);
      setOauthProvider(null);
      toast({
        title: t('auth.loginFailed'),
        description: error.message || t('auth.thirdPartyLoginFailed'),
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 背景遮罩层 - 不覆盖导航栏 */}
      <div 
        className="fixed left-0 right-0 bottom-0 z-[9998] bg-black/50 backdrop-blur-sm"
        style={{ top: '64px' }} // 导航栏高度 h-16 (64px)，遮罩从导航栏下方开始
        onClick={onClose}
        aria-hidden="true"
      />
      {/* 模态框容器 */}
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 py-8 sm:py-4 pointer-events-none"
      >
        <div 
          className="relative w-full max-w-md bg-background rounded-lg shadow-xl p-6 space-y-5 mx-auto my-auto max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto no-scrollbar border pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          aria-label={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>

        {/* 第三方登录提示界面 */}
        {oauthProvider ? (
          <div className="text-center space-y-6 py-8">
            <div className="space-y-3">
              <div className="flex justify-center">
                {oauthProvider === 'google' ? (
                  <svg className="h-12 w-12" viewBox="0 0 24 24">
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
                ) : (
                  <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
              </div>
              <h2 className="text-2xl font-bold">
                {t('auth.redirectingTo')} {oauthProvider === 'google' ? 'Google' : 'GitHub'} {t('auth.loginWith')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('auth.willRedirectTo')} {oauthProvider === 'google' ? 'Google' : 'GitHub'} {t('auth.forAuthorization')}
              </p>
            </div>
            <div className="flex justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('auth.ifNotAutoRedirect')}
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setOauthProvider(null);
                setLoading(false);
              }}
              className="text-sm"
            >
              {t('common.cancel')}
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">
                {mode === 'login' ? t('auth.login') : mode === 'register' ? t('auth.register') : t('auth.forgotPassword')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === 'login'
                  ? t('auth.loginDescription')
                  : mode === 'register'
                  ? t('auth.registerDescription')
                  : t('auth.forgotPasswordDescription')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium block">{t('common.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                id="email"
                type="email"
                placeholder={t('auth.emailPlaceholder')}
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

          {/* 忘记密码模式提示 */}
          {mode === 'forgot' && (
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-orange-800 dark:text-orange-300 space-y-1">
                  <p className="font-medium">{t('auth.importantNotice')}</p>
                  <p className="text-orange-700 dark:text-orange-400">
                    {t('auth.resetPasswordTip')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {mode !== 'forgot' && (
            <>
              <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium block">
                  {t('common.password')}
                  {mode === 'register' && (
                    <span className="text-xs text-muted-foreground ml-2">{t('common.passwordRequirement')}</span>
                  )}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.passwordPlaceholder')}
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
                              {strength.strength === 'weak' ? t('common.weak') : strength.strength === 'medium' ? t('common.medium') : t('common.strong')}
                            </span>
                          </div>
                          {strength.feedback.length > 0 && strength.strength !== 'strong' && (
                            <p className="text-xs text-muted-foreground">
                              {t('common.suggestion')}：{strength.feedback.slice(0, 2).join('、')}
                            </p>
                          )}
                          {/* 明确显示密码要求 */}
                          {!passwordError && (
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <p className={/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                                {/[A-Z]/.test(password) ? '✓' : '○'} {t('common.containsUppercase')}
                              </p>
                              <p className={/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                                {/[a-z]/.test(password) ? '✓' : '○'} {t('common.containsLowercase')}
                              </p>
                              <p className={/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}>
                                {/[0-9]/.test(password) ? '✓' : '○'} {t('common.containsNumber')}
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
                  <Label htmlFor="confirmPassword" className="text-sm font-medium block">{t('common.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t('auth.passwordPlaceholder')}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordError && e.target.value === password) {
                          setPasswordError('');
                        }
                      }}
                      onBlur={() => {
                        if (confirmPassword && confirmPassword !== password) {
                          setPasswordError(t('auth.passwordsDoNotMatch'));
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
                    {t('common.forgotPassword')}？
                  </button>
                </div>
              )}
            </>
          )}

          <Button type="submit" className="w-full h-10 mt-4" disabled={loading}>
            {loading
              ? t('common.processing') || 'Processing...'
              : mode === 'login'
              ? t('auth.login')
              : mode === 'register'
              ? t('auth.register')
              : t('auth.resetPassword')}
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
                  {t('auth.orContinueWith')}
                </span>
              </div>
            </div>

            {/* 第三方登录推荐提示 - 注册模式 */}
            {mode === 'register' && (
              <div className="mt-2 mb-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                    <p className="font-medium">💡 {t('auth.recommended')}</p>
                    <p className="text-blue-700 dark:text-blue-400">
                      {t('auth.registerTip')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 第三方登录推荐提示 - 登录模式（不同样式） */}
            {mode === 'login' && (
              <div className="mt-2 mb-3 p-2.5 rounded-md bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-l-3 border-green-500 dark:border-green-400">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-xs text-green-800 dark:text-green-300">
                    <span className="font-medium">{t('common.tip') || 'Tip'}:</span> {t('auth.loginTip')}
                  </div>
                </div>
              </div>
            )}

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
          </>
        )}

        {/* 底部链接 - 只在非第三方登录模式下显示 */}
        {!oauthProvider && (
          <div className="text-center text-sm pt-2">
            {mode === 'login' ? (
            <span className="text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => {
                  setMode('register');
                  setEmailError('');
                  setPasswordError('');
                }}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                {t('auth.clickToRegister')}
              </button>
            </span>
          ) : mode === 'register' ? (
            <span className="text-muted-foreground">
              {t('auth.haveAccount')}{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setEmailError('');
                  setPasswordError('');
                }}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                {t('auth.clickToLogin')}
              </button>
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t('common.rememberPassword') || 'Remember password?'}{' '}
              <button
                onClick={() => {
                  setMode('login');
                  setEmailError('');
                }}
                className="text-primary hover:underline font-medium"
                type="button"
              >
                {t('common.backToLogin')}
              </button>
            </span>
            )}
          </div>
        )}
        </div>
      </div>
    </>
  );
}

