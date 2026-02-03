'use client'
import dynamic from 'next/dynamic';
import { useI18n } from '@/contexts/I18nContext';

// 加载组件
const LoadingComponent = () => {
  const { t } = useI18n();
  return <div className="min-h-screen flex items-center justify-center">{t('modelViewerPage.loading')}</div>;
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