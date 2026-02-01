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
    // 在注册前，先尝试检查邮箱是否已存在
    // 通过尝试登录来检查（使用一个不可能正确的密码）
    // 如果返回 "Invalid login credentials"，说明邮箱已存在
    const { error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password: '__CHECK_EMAIL_EXISTS__' + Date.now(), // 使用时间戳确保唯一
    });
    
    // 如果错误是 "Invalid login credentials"，说明邮箱已存在
    if (checkError) {
      const errorMsg = (checkError.message || '').toLowerCase();
      if (errorMsg.includes('invalid login credentials') || 
          errorMsg.includes('invalid credentials') ||
          errorMsg.includes('email not confirmed')) {
        // 邮箱已存在，返回错误
        return { 
          data: null, 
          error: { 
            message: 'User already registered',
            code: 'email_already_exists',
            status: 422
          } 
        };
      }
      // 其他错误（如网络错误）可以继续尝试注册
    } else {
      // 如果登录成功（不应该发生），说明邮箱已存在
      // 立即退出登录
      await supabase.auth.signOut();
      return { 
        data: null, 
        error: { 
          message: 'User already registered',
          code: 'email_already_exists',
          status: 422
        } 
      };
    }
    
    // 邮箱不存在，可以注册
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
        name: error.name
      });
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
    
    // 先检查邮箱是否已注册
    // 通过尝试登录来检查（使用一个不可能正确的密码）
    const { error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password: '__CHECK_EMAIL_EXISTS__' + Date.now(),
    });
    
    // 如果错误不是 "Invalid login credentials"，说明邮箱可能不存在
    if (checkError) {
      const errorMsg = (checkError.message || '').toLowerCase();
      if (!errorMsg.includes('invalid login credentials') && 
          !errorMsg.includes('invalid credentials') &&
          !errorMsg.includes('email not confirmed')) {
        // 邮箱不存在
        return { 
          error: { 
            message: '该邮箱未注册，请先注册账户',
            code: 'email_not_found',
            status: 404
          } 
        };
      }
      // 如果错误是 "Invalid login credentials"，说明邮箱存在，可以继续
    } else {
      // 如果登录成功（不应该发生），说明邮箱存在
      await supabase.auth.signOut();
    }
    
    // 邮箱存在，发送重置密码邮件
    // 根据环境变量或当前域名确定重定向 URL
    // 优先使用环境变量中的 SITE_URL，如果没有则使用当前域名
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    // 移除末尾的斜杠（如果有），避免双重斜杠
    siteUrl = siteUrl.replace(/\/$/, '');
    
    // redirectTo 指向重置密码页面
    // Supabase 会在链接中添加 token、type=recovery 和 email 参数
    // 重置页面会使用 verifyOtp 验证 token 并获取会话
    const redirectTo = `${siteUrl}/auth/reset-password`;
    
    console.log('[Reset Password] Sending reset email with redirectTo:', redirectTo);
    
    const { error, data } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    
    if (error) {
      console.error('[Reset Password] Error sending reset email:', error);
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

  const signInWithProvider = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
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

