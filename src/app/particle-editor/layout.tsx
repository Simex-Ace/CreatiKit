import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '粒子编辑器 - 粒子特效生成器 | CreatiKit',
  description: '免费在线粒子编辑器，创建炫酷的粒子特效，支持自定义粒子参数、形状、颜色和混合模式，导出配置和截图。所有处理在浏览器本地完成。',
  keywords: ['粒子特效', '粒子编辑器', '粒子系统', '特效生成', '粒子动画', '粒子工具', '视觉特效', '粒子效果'],
  openGraph: {
    title: '粒子编辑器 - CreatiKit',
    description: '免费在线粒子编辑器，创建炫酷的粒子特效，支持自定义参数和导出。',
    url: 'https://creatikit.asia/particle-editor',
    type: 'website',
  },
  alternates: {
    canonical: 'https://creatikit.asia/particle-editor',
  },
};

export default function ParticleEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

