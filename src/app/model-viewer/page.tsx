'use client'
import dynamic from 'next/dynamic';

// 使用动态导入并禁用SSR，确保Three.js组件完全在客户端渲染
const ThreeJSModelViewer = dynamic(
  () => import('@/components/ThreeJSModelViewer'),
  { 
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center">加载3D模型查看器...</div>
  }
);

export default function ModelViewer() {
  return (
    <div className="min-h-screen">
      <ThreeJSModelViewer />
    </div>
  );
}