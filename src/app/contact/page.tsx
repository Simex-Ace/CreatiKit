'use client'

import { Card } from '@/components/ui/card';
import { Mail, MessageSquare, Github, Twitter } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function ContactPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full mb-4">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('contactPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('contactPage.subtitle')}
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">{t('contactPage.contactMethods')}</h2>
            <p className="text-muted-foreground mb-6">
              {t('contactPage.contactDesc')}
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                <div className="bg-blue-600 text-white p-3 rounded-full">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('contactPage.emailContact')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('contactPage.emailAddress')}
                  </p>
                </div>
              </div>

              <a 
                href="https://github.com/Simex-Ace/CreatiKit"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start space-x-4 p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="bg-purple-600 text-white p-3 rounded-full">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{t('contactPage.github')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('contactPage.githubContact')}
                  </p>
                </div>
              </a>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">{t('contactPage.feedbackTypes')}</h2>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{t('contactPage.featureSuggestions')}</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{t('contactPage.bugReports')}</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{t('contactPage.businessInquiry')}</span>
              </div>
            </div>
          </section>

          <section className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>{t('contactPage.note')}：</strong>{t('contactPage.responseTime')}
            </p>
          </section>
        </div>
      </Card>
    </div>
  );
}

