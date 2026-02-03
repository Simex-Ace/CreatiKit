'use client'

import { Card } from '@/components/ui/card';
import { Code, Zap, Shield, Globe } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function ApiPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-purple-600 text-white p-4 rounded-full mb-4">
          <Code className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('apiPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('apiPage.subtitle')}
        </p>
      </div>

      <Card className="p-8 text-center">
        <Zap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-4">{t('apiPage.developing')}</h2>
        <p className="text-muted-foreground mb-6">
          {t('apiPage.description')}
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2">
            <Code className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('apiPage.restfulApi')}</h3>
              <p className="text-sm text-muted-foreground">{t('apiPage.restfulApiDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('apiPage.apiKey')}</h3>
              <p className="text-sm text-muted-foreground">{t('apiPage.apiKeyDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Globe className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('apiPage.webhook')}</h3>
              <p className="text-sm text-muted-foreground">{t('apiPage.webhookDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <Zap className="h-8 w-8 text-orange-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('apiPage.rateLimit')}</h3>
              <p className="text-sm text-muted-foreground">{t('apiPage.rateLimitDesc')}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

