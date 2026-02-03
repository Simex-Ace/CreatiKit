'use client'

import { Card } from '@/components/ui/card';
import { Users, Target, Heart, Sparkles } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full mb-4">
          <Users className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('aboutPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('aboutPage.subtitle')}
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">{t('aboutPage.mission')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('aboutPage.missionDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="inline-block bg-blue-100 p-3 rounded-full mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('aboutPage.easyToUse')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('aboutPage.easyToUseDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block bg-purple-100 p-3 rounded-full mb-3">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('aboutPage.privacyProtection')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('aboutPage.privacyProtectionDesc')}
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block bg-pink-100 p-3 rounded-full mb-3">
                <Sparkles className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="font-semibold mb-2">{t('aboutPage.continuousUpdates')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('aboutPage.continuousUpdatesDesc')}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

