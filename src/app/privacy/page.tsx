'use client'

import { Card } from '@/components/ui/card';
import { Shield, Lock, Eye, FileCheck, Cookie } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function PrivacyPage() {
  const { t, locale } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-green-600 text-white p-4 rounded-full mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('privacyPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('privacyPage.subtitle')}
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Lock className="h-6 w-6 mr-2 text-green-600" />
              {t('privacyPage.privacyPrinciples')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacyPage.principlesDesc')}
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>{t('privacyPage.localProcessing')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>{t('privacyPage.noDataCollection')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                <span>{t('privacyPage.noTracking')}</span>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-2 text-blue-600" />
              {t('privacyPage.userAccount')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacyPage.userAccountDesc')}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Cookie className="h-6 w-6 mr-2 text-amber-600" />
              {t('privacyPage.cookiesTitle')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('privacyPage.cookiesDesc')}
            </p>
            <h3 className="text-lg font-semibold mb-2">{t('privacyPage.adsenseTitle')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('privacyPage.adsenseDesc')}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FileCheck className="h-6 w-6 mr-2 text-purple-600" />
              {t('privacyPage.lastUpdated')}
            </h2>
            <p className="text-muted-foreground">
              {t('privacyPage.lastUpdatedDesc')} {new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-muted-foreground mt-2">
              {t('privacyPage.contactUs')} <a href="/contact" className="text-blue-600 hover:underline">{t('privacyPage.contactPage')}</a> {t('privacyPage.page')}
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}

