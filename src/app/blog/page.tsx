'use client'

import { Card } from '@/components/ui/card';
import { BookOpen, PenTool, Sparkles } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function BlogPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-pink-600 text-white p-4 rounded-full mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('blogPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('blogPage.subtitle')}
        </p>
      </div>

      <Card className="p-8 text-center">
        <PenTool className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-4">{t('blogPage.developing')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('blogPage.description')}
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('blogPage.toolTutorials')}</h3>
              <p className="text-sm text-muted-foreground">{t('blogPage.toolTutorialsDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <PenTool className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('blogPage.designInspiration')}</h3>
              <p className="text-sm text-muted-foreground">{t('blogPage.designInspirationDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <BookOpen className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('blogPage.productUpdates')}</h3>
              <p className="text-sm text-muted-foreground">{t('blogPage.productUpdatesDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Sparkles className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('blogPage.industryNews')}</h3>
              <p className="text-sm text-muted-foreground">{t('blogPage.industryNewsDesc')}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

