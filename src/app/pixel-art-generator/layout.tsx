import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '像素艺术生成器 - 图片转像素风格 | CreatiKit',
  description: '免费在线像素艺术生成器，将普通图片转换为像素风格艺术，支持自定义像素大小、颜色数量和调色板选择。所有处理在浏览器本地完成。',
  keywords: ['像素艺术', '像素化', '图片转像素', '像素风格', '8bit艺术', '像素画', '像素艺术生成'],
  openGraph: {
    title: '像素艺术生成器 - CreatiKit',
    description: '免费在线像素艺术生成器，将普通图片转换为像素风格艺术。',
    url: 'https://creatikit.asia/pixel-art-generator',
  },
  alternates: {
    canonical: 'https://creatikit.asia/pixel-art-generator',
  },
};

export default function PixelArtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

