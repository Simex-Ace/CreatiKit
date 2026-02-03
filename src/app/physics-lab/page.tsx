'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useI18n } from '@/contexts/I18nContext';

// 动态加载 PhysicsLab 组件（包含 matter-js）
const PhysicsLab = dynamic(() => import('@/components/physics-lab/PhysicsLab'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
        <p className="text-sm text-muted-foreground">加载物理实验室...</p>
      </div>
    </div>
  ),
});

const PhysicsLabPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t('physicsLabPage.title')}</h1>
        <p className="text-muted-foreground">{t('physicsLabPage.subtitle')}</p>
      </div>
      
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>{t('physicsLabPage.simulator')}</CardTitle>
          <CardDescription>
            {t('physicsLabPage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[70vh]">
          <PhysicsLab />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('physicsLabPage.instructions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• {t('physicsLabPage.instruction1')}</p>
            <p>• {t('physicsLabPage.instruction2')}</p>
            <p>• {t('physicsLabPage.instruction3')}</p>
            <p>• {t('physicsLabPage.instruction4')}</p>
            <p>• {t('physicsLabPage.instruction5')}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('physicsLabPage.experimentalScenes')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• <strong>{t('physicsLabPage.scene1')}</strong>：{t('physicsLabPage.scene1Desc')}</p>
            <p>• <strong>{t('physicsLabPage.scene2')}</strong>：{t('physicsLabPage.scene2Desc')}</p>
            <p>• <strong>{t('physicsLabPage.scene3')}</strong>：{t('physicsLabPage.scene3Desc')}</p>
            <p>• <strong>{t('physicsLabPage.scene4')}</strong>：{t('physicsLabPage.scene4Desc')}</p>
            <p>• <strong>{t('physicsLabPage.scene5')}</strong>：{t('physicsLabPage.scene5Desc')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhysicsLabPage;