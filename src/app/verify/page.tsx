'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('正在验证邮箱...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      const code = searchParams.get('code');
      
      // 如果没有 token 和 code，说明链接无效
      if (!token && !code) {
        setStatus('error');
        setMessage('验证链接无效，请检查链接是否正确');
        return;
      }

      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();

        // 如果有 code，使用 exchangeCodeForSession
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            const errorMsg = (error.message || '').toLowerCase();
            if (errorMsg.includes('expired') || errorMsg.includes('invalid') || error.status === 403) {
              setStatus('expired');
              setMessage('验证链接已过期，请重新申请');
            } else {
              setStatus('error');
              setMessage(error.message || '验证失败，请重试');
            }
            return;
          }

          if (data?.session) {
            setStatus('success');
            setMessage('邮箱验证成功！');
            // 3 秒后跳转到首页
            setTimeout(() => {
              router.push('/');
            }, 3000);
          } else {
            setStatus('error');
            setMessage('验证失败，请重试');
          }
          return;
        }

        // 如果有 token，尝试验证（Supabase 通常使用 code，但有些配置可能使用 token）
        if (token) {
          // 尝试通过验证 token 来确认邮箱
          // 注意：Supabase 通常使用 code 而不是 token
          // 这里我们尝试通过获取会话来验证
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            setStatus('error');
            setMessage('验证链接无效或已过期');
            return;
          }

          setStatus('success');
          setMessage('邮箱验证成功！');
          setTimeout(() => {
            router.push('/');
          }, 3000);
        }
      } catch (error: any) {
        console.error('Verify error:', error);
        setStatus('error');
        setMessage(error.message || '验证过程中发生错误，请重试');
      }
    };

    verifyEmail();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-6">
        <div className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h1 className="text-2xl font-bold">验证中...</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
              <h1 className="text-2xl font-bold text-green-600">验证成功</h1>
              <p className="text-muted-foreground">{message}</p>
              <p className="text-sm text-muted-foreground">正在跳转到首页...</p>
              <Link href="/">
                <Button className="w-full mt-4">立即前往首页</Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
              <h1 className="text-2xl font-bold text-destructive">验证失败</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="space-y-2 mt-4">
                <Link href="/">
                  <Button variant="outline" className="w-full">返回首页</Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  如果问题持续存在，请重新注册或联系支持
                </p>
              </div>
            </>
          )}

          {status === 'expired' && (
            <>
              <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
              <h1 className="text-2xl font-bold text-yellow-600">链接已过期</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="space-y-2 mt-4">
                <Link href="/">
                  <Button variant="outline" className="w-full">返回首页</Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  验证链接通常有效期为 1 小时，请重新申请验证
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

