import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { PageTransition } from '@/components/ui/PageTransition';
import { StructuredData } from '@/components/StructuredData';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { Toaster } from '@/components/ui/toast';
import { I18nProvider } from '@/contexts/I18nContext';
import { LanguageWrapper } from '@/components/LanguageWrapper';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'CreatiKit.io - 免费在线创意工具箱 | 图片压缩、3D预览、设计工具',
    template: '%s | CreatiKit.io',
  },
  description: 'CreatiKit.io 提供20+免费在线创意工具：图片压缩、背景移除、3D模型预览、像素艺术生成、二维码生成、调色板、Markdown编辑器、白板工具等。无需注册，完全免费，所有处理在浏览器本地完成，保护您的隐私安全。',
  keywords: [
    '在线工具',
    '图片压缩',
    '图片处理',
    '3D预览',
    '背景移除',
    '像素艺术',
    '二维码生成',
    '调色板',
    'Markdown编辑器',
    '在线白板',
    '创意工具',
    '免费工具',
    '图片转像素',
    'GIF工具',
    '文本分析',
    '时间戳转换',
    '哈希计算',
    '物理实验室',
    '化学实验室',
    '生物沙盒',
    '在线钢琴',
    '数据可视化',
    '表情符号',
    '在线工具箱',
  ],
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
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://creatikit.asia',
    siteName: 'CreatiKit.io',
    title: 'CreatiKit.io - 免费在线创意工具箱',
    description: '提供20+免费在线创意工具：图片压缩、背景移除、3D预览、像素艺术、二维码生成等。无需注册，完全免费，所有处理在浏览器本地完成。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CreatiKit.io - 免费在线创意工具箱',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatiKit.io - 免费在线创意工具箱',
    description: '提供20+免费在线创意工具：图片压缩、背景移除、3D预览、像素艺术、二维码生成等。',
    images: ['/og-image.png'],
    creator: '@creatikit',
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
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    // 可以添加Google Search Console验证码
    // google: 'your-google-verification-code',
  },
};

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
          <StructuredData />
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