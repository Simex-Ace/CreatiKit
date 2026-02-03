import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SVG编辑器 - 免费在线SVG路径编辑器 | CreatiKit',
  description: '专业免费在线SVG编辑器，支持路径绘制、形状创建、文本编辑、导入导出SVG文件，实时预览代码。所有处理在浏览器本地完成，保护您的隐私。',
  keywords: ['SVG编辑器', 'SVG编辑', 'SVG工具', '矢量图编辑', 'SVG路径', '在线SVG', 'SVG制作', '矢量图形'],
  openGraph: {
    title: 'SVG编辑器 - CreatiKit',
    description: '专业免费在线SVG编辑器，支持路径绘制、形状创建、文本编辑、导入导出SVG文件。',
    url: 'https://creatikit.asia/svg-editor',
    type: 'website',
  },
  alternates: {
    canonical: 'https://creatikit.asia/svg-editor',
  },
};

export default function SVGEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}



