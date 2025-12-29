import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '图片压缩工具 - 免费在线压缩JPG/PNG图片 | CreatiKit',
  description: '免费在线图片压缩工具，支持JPG、PNG格式，可批量压缩，保持画质的同时减小文件体积。无需上传到服务器，所有处理在浏览器本地完成，保护您的隐私。',
  keywords: ['图片压缩', 'JPG压缩', 'PNG压缩', '图片优化', '图片减小', '在线压缩', '免费压缩工具', '批量压缩'],
  openGraph: {
    title: '图片压缩工具 - CreatiKit',
    description: '免费在线图片压缩工具，支持JPG、PNG格式，可批量压缩，保持画质的同时减小文件体积。',
    url: 'https://creatikit.asia/compress',
  },
  alternates: {
    canonical: 'https://creatikit.asia/compress',
  },
};

export default function CompressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

