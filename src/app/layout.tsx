import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import { headers } from 'next/headers';
import './globals.css';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { StructuredDataServer } from '@/components/StructuredDataServer';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Toaster } from '@/components/ui/toast';
import { I18nProvider } from '@/contexts/I18nContext';
import { LanguageWrapper } from '@/components/LanguageWrapper';
import { GoogleAdsense } from '@/components/GoogleAdsense';
import { getMetadataForLocale, getDefaultMetadata } from '@/lib/metadata';
import { getLocaleFromPath } from '@/lib/i18n-routing';

// 动态导入非关键组件
const Footer = dynamic(() => import('@/components/footer').then(mod => ({ default: mod.Footer })), { ssr: true });
const PageTransition = dynamic(() => import('@/components/ui/PageTransition').then(mod => ({ default: mod.PageTransition })), { ssr: true });

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

/**
 * 动态生成多语言元数据
 * 根据 URL 路径中的语言前缀返回对应的元数据
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '/';
  
  // 从路径中提取语言
  const locale = getLocaleFromPath(pathname) || 'en'; // 默认为英文
  
  // 获取对应语言的元数据
  const localeMetadata = getMetadataForLocale(locale);
  
  // 基础元数据（所有语言共享）
  const baseMetadata: Metadata = {
    authors: [{ name: 'CreatiKit Team' }],
    creator: 'CreatiKit',
    publisher: 'CreatiKit',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://creatikit.asia'),
    alternates: {
      canonical: '/',
      languages: {
        'zh-CN': 'https://creatikit.asia/zh-CN',
        'en': 'https://creatikit.asia/en',
        'ja-JP': 'https://creatikit.asia/ja-JP',
        'ko-KR': 'https://creatikit.asia/ko-KR',
        'x-default': 'https://creatikit.asia/en', // 默认语言（英文，用于 Google 等国际搜索引擎）
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
      // 注意：百度爬虫配置在robots.txt中已设置，这里不需要额外配置
    },
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
    verification: {
      // Google Search Console验证码（在Google Search Console获取）
      // google: 'your-google-verification-code',
      
      // Bing Webmaster Tools验证码（在Bing Webmaster Tools获取）
      // other: {
      //   'msvalidate.01': 'your-bing-verification-code',
      // },
      
      // Yandex验证码（在Yandex Webmaster获取）
      // yandex: 'your-yandex-verification-code',
      
      // 其他搜索引擎验证码可以添加到 other 字段中
    },
    // 搜索引擎验证标签
    other: {
      // 百度网站验证（已配置）
      'baidu-site-verification': 'codeva-vrSUPylANY',

      // Google AdSense 站点验证（Meta tag 方法）
      // 等价于在 <head> 中添加：
      // <meta name="google-adsense-account" content="ca-pub-2256987655979539" />
      'google-adsense-account': 'ca-pub-2256987655979539',

      // 搜狗验证（在搜狗站长平台获取后取消注释）
      // 'sogou_site_verification': 'your-sogou-verification-code',
      
      // 360验证（在360站长平台获取后取消注释）
      // '360-site-verification': 'your-360-verification-code',
      
      // 神马搜索验证（在神马搜索站长平台获取后取消注释）
      // 'shenma-site-verification': 'your-shenma-verification-code',
      
      // Naver验证（在Naver Webmaster获取后取消注释）
      // 'naver-site-verification': 'your-naver-verification-code',
    },
  };
  
  // 合并语言特定的元数据和基础元数据
  return {
    ...localeMetadata,
    ...baseMetadata,
    alternates: {
      ...baseMetadata.alternates,
      ...localeMetadata.alternates,
    },
  };
}

// 移除动态导入，采用正确的方式处理主题水合
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <I18nProvider>
          <LanguageWrapper />
          <GoogleAdsense />
          <StructuredDataServer />
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <PageTransition>
                      {children}
                    </PageTransition>
                  </main>
                  <Footer />
                </div>
                <Toaster />
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}