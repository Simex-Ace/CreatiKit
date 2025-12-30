import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' 表示密码重置
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // 如果有错误参数，直接处理错误
  if (error) {
    const errorMsg = errorDescription || error;
    console.error('Auth callback error:', error, errorDescription);
    
    // 如果是 OTP 过期错误，重定向到重置密码页面并显示错误
    if (error === 'otp_expired' || errorMsg?.toLowerCase().includes('expired')) {
      return NextResponse.redirect(
        new URL(`/auth/reset-password?error=expired&message=${encodeURIComponent('链接已过期，请重新申请密码重置')}`, requestUrl.origin)
      );
    }
    
    // 其他错误重定向到首页
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(errorMsg || 'auth_error')}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      
      // 检查是否是 OTP 过期错误
      const errorMsg = (exchangeError.message || '').toLowerCase();
      if (errorMsg.includes('expired') || errorMsg.includes('invalid') || exchangeError.status === 403) {
        // OTP 过期或无效，重定向到重置密码页面并显示错误
        return NextResponse.redirect(
          new URL(`/auth/reset-password?error=expired&message=${encodeURIComponent('链接已过期，请重新申请密码重置')}`, requestUrl.origin)
        );
      }
      
      // 其他错误重定向到首页
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(exchangeError.message || 'auth_error')}`, requestUrl.origin)
      );
    }
    
    // 成功交换 code，检查是否有会话
    if (data?.session) {
      // 如果是密码重置，重定向到重置密码页面
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin));
      }
      
      // 其他情况（如邮箱验证）重定向到首页
      return NextResponse.redirect(new URL('/', requestUrl.origin));
    } else {
      // 没有会话，可能是 OTP 已过期
      if (type === 'recovery') {
        return NextResponse.redirect(
          new URL(`/auth/reset-password?error=expired&message=${encodeURIComponent('链接已过期，请重新申请密码重置')}`, requestUrl.origin)
        );
      }
    }
  }

  // 没有 code 也没有错误，重定向到首页
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}

