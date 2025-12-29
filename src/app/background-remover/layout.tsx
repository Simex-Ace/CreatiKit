import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '背景移除工具 - 一键去除图片背景 | CreatiKit',
  description: '免费在线背景移除工具，一键去除图片背景，支持自定义颜色选择和阈值调整，轻松创建透明背景图片。所有处理在浏览器本地完成，保护您的隐私安全。',
  keywords: ['背景移除', '去背景', '透明背景', '抠图', '图片处理', '背景去除工具', '在线抠图'],
  openGraph: {
    title: '背景移除工具 - CreatiKit',
    description: '免费在线背景移除工具，一键去除图片背景，支持自定义颜色选择和阈值调整。',
    url: 'https://creatikit.asia/background-remover',
  },
  alternates: {
    canonical: 'https://creatikit.asia/background-remover',
  },
};

export default function BackgroundRemoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

