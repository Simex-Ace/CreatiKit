import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '二维码生成器 - 免费在线生成二维码 | CreatiKit',
  description: '免费在线二维码生成器，快速生成各类二维码，支持多种内容类型、样式定制和文件格式导出。无需注册，完全免费。',
  keywords: ['二维码生成', 'QR码生成', '二维码制作', '在线二维码', '二维码工具', 'QR码工具'],
  openGraph: {
    title: '二维码生成器 - CreatiKit',
    description: '免费在线二维码生成器，快速生成各类二维码，支持多种内容类型和样式定制。',
    url: 'https://creatikit.asia/qr-code-generator',
  },
  alternates: {
    canonical: 'https://creatikit.asia/qr-code-generator',
  },
};

export default function QRCodeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

