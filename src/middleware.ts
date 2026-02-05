import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale, getLocaleFromPath, addLocaleToPath, removeLocaleFromPath } from '@/lib/i18n-routing';

/**
 * 中间件：处理多语言路由
 * 
 * 策略：
 * 1. 如果URL包含语言前缀（如 /zh-CN/compress），提取语言并rewrite到实际路径（/compress）
 * 2. 如果URL没有语言前缀，根据Accept-Language重定向到带语言前缀的URL
 * 3. 这样既保证了URL包含语言信息（SEO友好），又不需要移动页面文件
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 跳过静态资源和API路由
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/og-image') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 检查路径是否已包含语言前缀
  const pathLocale = getLocaleFromPath(pathname);
  
  if (pathLocale) {
    // URL包含语言前缀，提取语言并rewrite到实际路径
    const cleanPath = removeLocaleFromPath(pathname);
    const url = request.nextUrl.clone();
    url.pathname = cleanPath;
    
    // 添加语言信息和路径信息到header，供页面组件和元数据生成使用
    const response = NextResponse.rewrite(url);
    response.headers.set('x-locale', pathLocale);
    response.headers.set('x-pathname', pathname); // 传递完整路径用于元数据生成
    return response;
  }

  // 如果没有语言前缀，需要重定向到带语言前缀的URL
  // 优先使用Accept-Language头，其次使用默认语言（英文）
  const acceptLanguage = request.headers.get('accept-language') || '';
  let detectedLocale = defaultLocale; // 默认为英文

  // 从Accept-Language检测语言
  if (acceptLanguage.includes('zh')) {
    detectedLocale = 'zh-CN';
  } else if (acceptLanguage.includes('ja')) {
    detectedLocale = 'ja-JP';
  } else if (acceptLanguage.includes('ko')) {
    detectedLocale = 'ko-KR';
  } else {
    // 默认使用英文（用于 Google 等国际搜索引擎）
    detectedLocale = 'en';
  }

  // 构建新的URL，添加语言前缀
  const newPathname = addLocaleToPath(pathname, detectedLocale);
  const url = request.nextUrl.clone();
  url.pathname = newPathname;

  // 301永久重定向，有利于SEO
  return NextResponse.redirect(url, { status: 301 });
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api路由
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico, robots.txt, sitemap.xml等
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};

