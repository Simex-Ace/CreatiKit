import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token = requestUrl.searchParams.get('token'); // Supabase 可能使用 token 而不是 code
  const type = requestUrl.searchParams.get('type'); // 'recovery' 表示密码重置
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  console.log('[Auth Callback]', { 
    code: code ? 'present' : 'missing', 
    token: token ? 'present' : 'missing',
    type, 
    error, 
    errorDescription 
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

  // 如果有 token 参数（旧格式），直接重定向到重置密码页面并传递参数
  if (token && type === 'recovery') {
    console.log('[Auth Callback] Found token parameter, redirecting to reset password page');
    const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('type', 'recovery');
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('[Auth Callback] Error exchanging code:', exchangeError);
      
      // 检查是否是 OTP 过期错误
      const errorMsg = (exchangeError.message || '').toLowerCase();
      if (errorMsg.includes('expired') || errorMsg.includes('invalid') || exchangeError.status === 403) {
        // OTP 过期或无效，重定向到重置密码页面并显示错误
        const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
        redirectUrl.searchParams.set('error', 'expired');
        redirectUrl.searchParams.set('message', '链接已过期，请重新申请密码重置');
        return NextResponse.redirect(redirectUrl);
      }
      
      // 其他错误，如果是恢复类型，也重定向到重置密码页面
      if (type === 'recovery') {
        const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
        redirectUrl.searchParams.set('error', 'invalid');
        redirectUrl.searchParams.set('message', exchangeError.message || '链接无效，请重新申请密码重置');
        return NextResponse.redirect(redirectUrl);
      }
      
      // 非恢复类型的错误，重定向到首页（不带错误参数）
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }
    
    // 成功交换 code，检查是否有会话
    if (data?.session) {
      console.log('[Auth Callback] Session created successfully', {
        userId: data.session.user?.id,
        expiresAt: data.session.expires_at
      });
      
      // 如果是密码重置，重定向到重置密码页面
      // 注意：即使服务端成功交换了 code，客户端可能还需要重新交换以确保 cookie 同步
      // 所以我们将 code 也传递给重置密码页面，让客户端也能交换
      if (type === 'recovery') {
        const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
        // 将 code 也传递过去，以防客户端 cookie 不同步
        redirectUrl.searchParams.set('code', code);
        redirectUrl.searchParams.set('type', 'recovery');
        return NextResponse.redirect(redirectUrl);
      }
      
      // 其他情况（如邮箱验证）重定向到首页
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    } else {
      // 没有会话，可能是 OTP 已过期或其他问题
      console.warn('[Auth Callback] No session after code exchange', {
        hasData: !!data,
        exchangeError: exchangeError
      });
      
      if (type === 'recovery') {
        const redirectUrl = new URL('/auth/reset-password', requestUrl.origin);
        // 即使没有会话，也尝试传递 code，让客户端再试一次
        if (code) {
          redirectUrl.searchParams.set('code', code);
          redirectUrl.searchParams.set('type', 'recovery');
        } else {
          redirectUrl.searchParams.set('error', 'expired');
          redirectUrl.searchParams.set('message', '链接已过期，请重新申请密码重置');
        }
        return NextResponse.redirect(redirectUrl);
      }
      
      // 非恢复类型，重定向到首页
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    }
  }

  // 没有 code 也没有错误，可能是直接访问回调页面
  // 重定向到首页（不带任何参数，避免循环）
  console.warn('[Auth Callback] No code and no error, redirecting to home');
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

