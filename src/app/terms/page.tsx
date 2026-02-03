'use client'

import { Card } from '@/components/ui/card';
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function TermsPage() {
  const { t, locale } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-blue-600 text-white p-4 rounded-full mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('termsPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('termsPage.subtitle')}
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
              {t('termsPage.serviceUse')}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('termsPage.serviceUseDesc')}
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{t('termsPage.useForPersonal')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{t('termsPage.noIllegalActivity')}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{t('termsPage.noInterference')}</span>
              </li>
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <Scale className="h-6 w-6 mr-2 text-purple-600" />
              {t('termsPage.disclaimer')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('termsPage.disclaimerDesc')}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-orange-600" />
              {t('termsPage.serviceChanges')}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('termsPage.serviceChangesDesc')}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              {t('termsPage.lastUpdated')}
            </h2>
            <p className="text-muted-foreground">
              {t('termsPage.lastUpdatedDesc')} {new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-muted-foreground mt-2">
              {t('termsPage.contactUs')} <a href="/contact" className="text-blue-600 hover:underline">{t('termsPage.contactPage')}</a> {t('termsPage.page')}
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}

