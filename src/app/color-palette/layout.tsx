import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '调色板工具 - 专业在线配色工具 | CreatiKit',
  description: '专业在线调色板工具，支持颜色选择、配色方案生成、图片取色功能，帮助设计师快速找到完美的配色方案。所有功能免费使用。',
  keywords: ['调色板', '配色工具', '颜色选择器', '取色器', '配色方案', '色彩搭配', '颜色工具'],
  openGraph: {
    title: '调色板工具 - CreatiKit',
    description: '专业在线调色板工具，支持颜色选择、配色方案生成、图片取色功能。',
    url: 'https://creatikit.asia/color-palette',
  },
  alternates: {
    canonical: 'https://creatikit.asia/color-palette',
  },
};

export default function ColorPaletteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

