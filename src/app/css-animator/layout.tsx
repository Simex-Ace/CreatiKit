import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CSS动画生成器 - 可视化创建CSS动画 | CreatiKit',
  description: '免费在线CSS动画生成器，可视化创建CSS动画，实时预览效果，支持多种动画类型和参数调整，导出代码直接使用。无需注册，完全免费。',
  keywords: ['CSS动画', '动画生成器', 'CSS动画工具', '动画制作', 'CSS keyframes', '动画编辑器', 'CSS特效', '前端动画'],
  openGraph: {
    title: 'CSS动画生成器 - CreatiKit',
    description: '免费在线CSS动画生成器，可视化创建CSS动画，实时预览效果，导出代码直接使用。',
    url: 'https://creatikit.asia/css-animator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://creatikit.asia/css-animator',
  },
};

export default function CSSAnimatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}





