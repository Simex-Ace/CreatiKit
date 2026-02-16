/**
 * 支付宝异步回调 - Next.js API Route (App Router)
 *
 * 【外部系统】此文件用于复制到独立的 Next.js 项目，非本仓库主项目代码。
 *
 * 复制目标：外部 Next 项目的 app/api/alipay-notify/route.js
 * 环境变量：PHP_BACKEND_URL（本仓库 PHP 后端地址，如 cpolar 或部署 URL）
 */

export async function POST(request) {
    const phpBackend = process.env.PHP_BACKEND_URL;
    if (!phpBackend) {
      console.error('PHP_BACKEND_URL 未配置');
      return new Response('Server config error', { status: 500 });
    }
  
    const notifyUrl = `${phpBackend.replace(/\/$/, '')}/order/notify`;
  
    try {
      const body = await request.text();
      const response = await fetch(notifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      });
  
      const text = await response.text();
      return new Response(text, {
        status: response.status,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    } catch (err) {
      console.error('Alipay notify forward error:', err);
      return new Response('Forward failed', { status: 500 });
    }
  }
  