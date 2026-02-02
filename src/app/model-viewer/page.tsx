'use client'
import dynamic from 'next/dynamic';

// 加载组件
const LoadingComponent = () => {
  return <div className="min-h-screen flex items-center justify-center">加载3D模型查看器...</div>;
};

// 使用动态导入并禁用SSR，确保Three.js组件完全在客户端渲染
const ThreeJSModelViewer = dynamic(
  () => import('@/components/ThreeJSModelViewer'),
  { 
    ssr: false,
    loading: LoadingComponent
  }
);

export default function ModelViewer() {
  return (
    <div className="min-h-screen">
      <ThreeJSModelViewer />
    </div>
  );
}