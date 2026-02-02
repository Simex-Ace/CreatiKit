import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '音频可视化工具 - 音乐频谱可视化 | CreatiKit',
  description: '免费在线音频可视化工具，上传音频文件实时显示频谱、波形、圆形频谱、粒子效果和瀑布图等多种可视化效果。支持多种颜色方案和灵敏度调节。',
  keywords: ['音频可视化', '频谱分析', '音频波形', '音乐可视化', '音频分析', '频谱图', '音频特效', '音乐频谱'],
  openGraph: {
    title: '音频可视化工具 - CreatiKit',
    description: '免费在线音频可视化工具，上传音频文件实时显示频谱、波形等多种可视化效果。',
    url: 'https://creatikit.asia/audio-visualizer',
    type: 'website',
  },
  alternates: {
    canonical: 'https://creatikit.asia/audio-visualizer',
  },
};

export default function AudioVisualizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

