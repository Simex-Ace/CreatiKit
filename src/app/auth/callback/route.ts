import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token'); // Supabase 可能使用 token 而不是 code
  const type = requestUrl.searchParams.get('type'); // 'recovery' 表示密码重置
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // 详细日志，记录所有参数
  console.log('[Auth Callback] Full URL:', requestUrl.toString());
  console.log('[Auth Callback] Params:', { 
    code: code ? `${code.substring(0, 20)}...` : 'missing', 
    token: token ? `${token.substring(0, 20)}...` : 'missing',
    type, 
    error, 
    errorDescription,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  });

  // 如果有错误参数，直接处理错误
  if (error) {
    const errorMsg = errorDescription || error;
    console.error('[Auth Callback] Error received:', error, errorDescription);
    
    // 如果是 OTP 过期错误，重定向到重置密码页面并显示错误
    if (error === 'otp_expired' || errorMsg?.toLowerCase().includes('expired')) {
      const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'expired');
      redirectUrl.searchParams.set('message', '链接已过期，请重新申请密码重置');
      return NextResponse.redirect(redirectUrl);
    }
    
    // 其他错误也重定向到重置密码页面（如果是恢复类型）或首页
    if (type === 'recovery') {
      const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'invalid');
      redirectUrl.searchParams.set('message', errorMsg || '链接无效，请重新申请密码重置');
      return NextResponse.redirect(redirectUrl);
    }
    
    // 非恢复类型的错误，重定向到首页（但不带错误参数，避免循环）
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // 【关键修复】密码重置（recovery 类型）不应该使用 exchangeCodeForSession
  // exchangeCodeForSession 仅用于 OAuth 和邮箱验证，密码重置需要使用 verifyOtp
  // 如果检测到 recovery 类型，直接透传 token/email 到重置页，跳过 code 交换
  if (type === 'recovery') {
    console.log('[Auth Callback] Recovery type detected, bypassing exchangeCodeForSession');
    const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
    
    // 透传所有相关参数到重置页
    if (token) {
      redirectUrl.searchParams.set('token', token);
    }
    if (code) {
      // 如果 Supabase 发送的是 code，也传递过去（但重置页会优先使用 token）
      redirectUrl.searchParams.set('code', code);
    }
    redirectUrl.searchParams.set('type', 'recovery');
    
    // 尝试获取 email 参数（如果 Supabase 提供了）
    const email = requestUrl.searchParams.get('email');
    if (email) {
      redirectUrl.searchParams.set('email', email);
    }
    
    console.log('[Auth Callback] Redirecting to reset password page with params:', {
      hasToken: !!token,
      hasCode: !!code,
      hasEmail: !!email
    });
    
    return NextResponse.redirect(redirectUrl);
  }

  // 非 recovery 类型（OAuth、邮箱验证等）才使用 exchangeCodeForSession
  if (code) {
    console.log('[Auth Callback] Non-recovery type, attempting to exchange code for session...');
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[Auth Callback] Error exchanging code:', {
        message: exchangeError.message,
        status: exchangeError.status,
        name: exchangeError.name,
        code: exchangeError.code
      });
      
      // 非 recovery 类型的错误处理
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }
    
    // 成功交换 code，重定向到首页（邮箱验证等）
    if (data?.session) {
      console.log('[Auth Callback] Session created successfully', {
        userId: data.session.user?.id,
        expiresAt: data.session.expires_at
      });
    }
    
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  // 没有 code 也没有错误，可能是直接访问回调页面
  // 重定向到首页（不带任何参数，避免循环）
  console.warn('[Auth Callback] No code and no error, redirecting to home');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

