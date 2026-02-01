'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    
    // 获取当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    // 直接尝试注册，Supabase 会返回明确的错误信息
    // 移除不可靠的邮箱检查逻辑（之前的检查方法会导致误判）
    // 根据环境变量或当前域名确定重定向 URL
    const siteUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
      : undefined;
    
    console.log('[Sign Up] Attempting to sign up:', { email, siteUrl });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // 邮箱验证链接指向 /verify 页面
        emailRedirectTo: siteUrl ? `${siteUrl}/verify` : undefined,
      },
    });
    
    if (error) {
      console.error('[Sign Up] Error:', {
        message: error.message,
        status: error.status,
        name: error.name,
        code: error.code
      });
      
      // 只检查 Supabase 明确返回的"用户已注册"错误
      // 不要使用过于宽泛的条件，避免误判
      const errorMsg = (error.message || '').toLowerCase();
      const errorCode = error.code || '';
      const isEmailAlreadyRegistered = 
        errorMsg.includes('user already registered') || 
        errorMsg.includes('email address is already registered') ||
        (errorCode === 'email_already_exists') ||
        (error.status === 422 && (errorMsg.includes('already registered') || errorCode === 'email_already_exists'));
      
      if (isEmailAlreadyRegistered) {
        // 返回明确的错误信息
        return {
          data: null,
          error: {
            message: '该邮箱已被注册，请直接登录或使用忘记密码功能',
            code: 'email_already_exists',
            status: 422
          }
        };
      }
      
      // 其他错误直接返回，让调用方处理
    } else {
      console.log('[Sign Up] Success:', { 
        userId: data.user?.id, 
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at
      });
    }
    
    return { data, error };
  };

  const resetPassword = async (email: string) => {
    if (typeof window === 'undefined') {
      return { error: { message: '此功能仅在客户端可用' } };
    }
    
    // 直接发送重置密码邮件，Supabase 会处理邮箱是否存在的检查
    // 移除不可靠的邮箱检查逻辑（之前的检查方法会导致误判）
    // 根据环境变量或当前域名确定重定向 URL
    // 优先使用环境变量中的 SITE_URL，如果没有则使用当前域名
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    // 移除末尾的斜杠（如果有），避免双重斜杠
    siteUrl = siteUrl.replace(/\/$/, '');
    
    // redirectTo 指向重置密码页面
    // Supabase 会在链接中添加 token 和 type=recovery 参数
    // 注意：Supabase 可能不会在 URL 中包含 email，所以我们需要保存到 localStorage
    const redirectTo = `${siteUrl}/auth/reset-password`;
    
    // 保存 email 到 localStorage，以便在重置页面验证时使用
    if (typeof window !== 'undefined') {
      localStorage.setItem('reset_password_email', email);
      console.log('[Reset Password] Saved email to localStorage for verification');
    }
    
    console.log('[Reset Password] Sending reset email with redirectTo:', redirectTo);
    
    const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    
    if (error) {
      console.error('[Reset Password] Error sending reset email:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
      
      // 检查是否是频率限制错误
      const errorMsg = (error.message || '').toLowerCase();
      if (errorMsg.includes('rate limit') || 
          errorMsg.includes('too many') ||
          errorMsg.includes('too frequent') ||
          error.status === 429) {
        return {
          error: {
            message: '请求过于频繁，请稍后再试（通常需要等待几分钟）',
            code: 'rate_limit_exceeded',
            status: 429
          }
        };
      }
      
      // 检查是否是邮箱未注册的错误
      if (errorMsg.includes('user not found') || 
          errorMsg.includes('email not found') ||
          error.status === 404) {
        return {
          error: {
            message: '该邮箱未注册，请先注册账户',
            code: 'email_not_found',
            status: 404
          }
        };
      }
    } else {
      console.log('[Reset Password] Reset email sent successfully');
    }
    
    // 即使没有错误，也检查是否真的发送成功
    // Supabase 在某些情况下可能静默失败
    if (error) {
      return { error };
    }
    
    // 检查是否有返回数据或错误
    // 如果没有错误也没有数据，可能是配置问题
    return { error: null, data };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  };

  const signOut = async () => {
    // 先清除本地状态
    setSession(null);
    setUser(null);
    
    // 然后调用 Supabase signOut 清除 cookie
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github'): Promise<void> => {
    // 根据环境变量或当前域名确定重定向 URL
    const siteUrl = typeof window !== 'undefined' 
      ? (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin)
      : undefined;
    
    const redirectTo = siteUrl 
      ? `${siteUrl}/auth/callback`
      : `${window.location.origin}/auth/callback`;
    
    console.log('[OAuth] Signing in with provider:', { provider, redirectTo });
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        // 可选：请求额外的权限范围
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('[OAuth] Error:', error);
      throw error;
    }
    
    // OAuth 会重定向到第三方登录页面，所以这里不需要返回数据
    // 用户授权后会重定向回 /auth/callback，然后自动登录
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        signInWithProvider,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

