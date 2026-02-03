'use client'

import { Card } from '@/components/ui/card';
import { BookOpen, FileText, Code, Video, Zap, HelpCircle, Lightbulb, Rocket, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { Separator } from '@/components/ui/separator';

export default function DocsPage() {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-blue-600 text-white p-4 rounded-full mb-4">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('docsPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('docsPage.subtitle')}
        </p>
      </div>

      {/* 快速开始 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <Rocket className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('docsPage.quickStart')}</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{t('docsPage.step1Title')}</h3>
              <p className="text-muted-foreground">{t('docsPage.step1Desc')}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{t('docsPage.step2Title')}</h3>
              <p className="text-muted-foreground">{t('docsPage.step2Desc')}</p>
            </div>
          </div>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{t('docsPage.step3Title')}</h3>
              <p className="text-muted-foreground">{t('docsPage.step3Desc')}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 主要功能 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <Zap className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('docsPage.mainFeatures')}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{t('docsPage.feature1Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('docsPage.feature1Desc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{t('docsPage.feature2Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('docsPage.feature2Desc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{t('docsPage.feature3Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('docsPage.feature3Desc')}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{t('docsPage.feature4Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('docsPage.feature4Desc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{t('docsPage.feature5Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('docsPage.feature5Desc')}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">{t('docsPage.feature6Title')}</h3>
                <p className="text-sm text-muted-foreground">{t('docsPage.feature6Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 使用技巧 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <Lightbulb className="h-6 w-6 text-yellow-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('docsPage.tips')}</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <h3 className="font-semibold mb-2">{t('docsPage.tip1Title')}</h3>
            <p className="text-sm text-muted-foreground">{t('docsPage.tip1Desc')}</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold mb-2">{t('docsPage.tip2Title')}</h3>
            <p className="text-sm text-muted-foreground">{t('docsPage.tip2Desc')}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h3 className="font-semibold mb-2">{t('docsPage.tip3Title')}</h3>
            <p className="text-sm text-muted-foreground">{t('docsPage.tip3Desc')}</p>
          </div>
        </div>
      </Card>

      {/* 常见问题 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <HelpCircle className="h-6 w-6 text-orange-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('docsPage.faq')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">{t('docsPage.faq1Question')}</h3>
            <p className="text-muted-foreground">{t('docsPage.faq1Answer')}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">{t('docsPage.faq2Question')}</h3>
            <p className="text-muted-foreground">{t('docsPage.faq2Answer')}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">{t('docsPage.faq3Question')}</h3>
            <p className="text-muted-foreground">{t('docsPage.faq3Answer')}</p>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2">{t('docsPage.faq4Question')}</h3>
            <p className="text-muted-foreground">{t('docsPage.faq4Answer')}</p>
          </div>
        </div>
      </Card>

      {/* 更多资源 */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">{t('docsPage.moreResources')}</h2>
        <div className="grid md:grid-cols-2 gap-4 text-center max-w-2xl mx-auto">
          <div className="flex flex-col items-center space-y-2 p-4 hover:bg-muted rounded-lg transition-colors">
            <Code className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('docsPage.apiDocs')}</h3>
              <p className="text-sm text-muted-foreground">{t('docsPage.apiDocsDesc')}</p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-2 p-4 hover:bg-muted rounded-lg transition-colors">
            <Video className="h-8 w-8 text-purple-600" />
            <div>
              <h3 className="font-semibold mb-1">{t('docsPage.tutorials')}</h3>
              <p className="text-sm text-muted-foreground">{t('docsPage.tutorialsDesc')}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
