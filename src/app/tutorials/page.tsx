'use client'

import { Card } from '@/components/ui/card';
import { Video, PlayCircle, BookOpen, GraduationCap, Image, Code, Palette, Globe, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function TutorialsPage() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
      <div className="text-center mb-12">
        <div className="inline-block bg-green-600 text-white p-4 rounded-full mb-4">
          <Video className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-bold mb-4">{t('tutorialsPage.title')}</h1>
        <p className="text-muted-foreground text-lg">
          {t('tutorialsPage.subtitle')}
        </p>
      </div>

      {/* 新手入门 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <GraduationCap className="h-6 w-6 text-green-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('tutorialsPage.beginnerGuide')}</h2>
        </div>
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:border-green-500 transition-colors">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Image className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold">{t('tutorialsPage.tutorial1Title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t('tutorialsPage.tutorial1Desc')}</p>
              <div className="flex items-center text-sm text-green-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{t('tutorialsPage.duration')}: 5 {t('tutorialsPage.minutes')}</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:border-purple-500 transition-colors">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold">{t('tutorialsPage.tutorial2Title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t('tutorialsPage.tutorial2Desc')}</p>
              <div className="flex items-center text-sm text-purple-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{t('tutorialsPage.duration')}: 8 {t('tutorialsPage.minutes')}</span>
              </div>
            </div>
            <div className="p-4 border rounded-lg hover:border-blue-500 transition-colors">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Code className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold">{t('tutorialsPage.tutorial3Title')}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t('tutorialsPage.tutorial3Desc')}</p>
              <div className="flex items-center text-sm text-blue-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{t('tutorialsPage.duration')}: 6 {t('tutorialsPage.minutes')}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 视频教程 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <Video className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('tutorialsPage.videoTutorials')}</h2>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <PlayCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold">{t('tutorialsPage.video1Title')}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t('tutorialsPage.video1Desc')}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>10 {t('tutorialsPage.minutes')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <PlayCircle className="h-5 w-5 text-purple-600 mr-2" />
                  <h3 className="font-semibold">{t('tutorialsPage.video2Title')}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t('tutorialsPage.video2Desc')}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>15 {t('tutorialsPage.minutes')}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <PlayCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold">{t('tutorialsPage.video3Title')}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{t('tutorialsPage.video3Desc')}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>12 {t('tutorialsPage.minutes')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 图文教程 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <BookOpen className="h-6 w-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('tutorialsPage.textGuides')}</h2>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              {t('tutorialsPage.guide1Title')}
            </h3>
            <div className="ml-7 space-y-2">
              <p className="text-muted-foreground">{t('tutorialsPage.guide1Step1')}</p>
              <p className="text-muted-foreground">{t('tutorialsPage.guide1Step2')}</p>
              <p className="text-muted-foreground">{t('tutorialsPage.guide1Step3')}</p>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              {t('tutorialsPage.guide2Title')}
            </h3>
            <div className="ml-7 space-y-2">
              <p className="text-muted-foreground">{t('tutorialsPage.guide2Step1')}</p>
              <p className="text-muted-foreground">{t('tutorialsPage.guide2Step2')}</p>
              <p className="text-muted-foreground">{t('tutorialsPage.guide2Step3')}</p>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-3 flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              {t('tutorialsPage.guide3Title')}
            </h3>
            <div className="ml-7 space-y-2">
              <p className="text-muted-foreground">{t('tutorialsPage.guide3Step1')}</p>
              <p className="text-muted-foreground">{t('tutorialsPage.guide3Step2')}</p>
              <p className="text-muted-foreground">{t('tutorialsPage.guide3Step3')}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 高级技巧 */}
      <Card className="p-8 mb-8">
        <div className="flex items-center mb-6">
          <PlayCircle className="h-6 w-6 text-orange-600 mr-3" />
          <h2 className="text-2xl font-semibold">{t('tutorialsPage.advancedTips')}</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <ArrowRight className="h-5 w-5 text-orange-600 mr-2" />
              {t('tutorialsPage.tip1Title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('tutorialsPage.tip1Desc')}</p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <ArrowRight className="h-5 w-5 text-blue-600 mr-2" />
              {t('tutorialsPage.tip2Title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('tutorialsPage.tip2Desc')}</p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <ArrowRight className="h-5 w-5 text-purple-600 mr-2" />
              {t('tutorialsPage.tip3Title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('tutorialsPage.tip3Desc')}</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center">
              <ArrowRight className="h-5 w-5 text-green-600 mr-2" />
              {t('tutorialsPage.tip4Title')}
            </h3>
            <p className="text-sm text-muted-foreground">{t('tutorialsPage.tip4Desc')}</p>
          </div>
        </div>
      </Card>

      {/* 开始学习 */}
      <Card className="p-8 bg-gradient-to-r from-green-500 to-blue-500 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">{t('tutorialsPage.startLearning')}</h2>
          <p className="mb-6 opacity-90">{t('tutorialsPage.startLearningDesc')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="secondary" 
              className="bg-white text-green-600 hover:bg-gray-100"
              onClick={() => router.push('/compress')}
            >
              {t('tutorialsPage.tryImageCompress')}
            </Button>
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => router.push('/model-viewer')}
            >
              {t('tutorialsPage.try3DViewer')}
            </Button>
            <Button 
              variant="secondary" 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => router.push('/code-tools')}
            >
              {t('tutorialsPage.tryCodeTools')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
