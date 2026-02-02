'use client'

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Instagram } from 'lucide-react';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';
import { useI18n } from '@/contexts/I18nContext';

export function Footer() {
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();
  const { locale, t } = useI18n();

  const isEn = locale === 'en';

  const handleDevelopmentLink = (e: React.MouseEvent, messageEn: string, messageZh: string) => {
    e.preventDefault();
    showAlert(isEn ? messageEn : messageZh);
  };

  return (
    <footer className="w-full border-t bg-background/95">
      <div className="container py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                CreatiKit
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t('footer.tagline')}
            </p>
            <div className="flex space-x-4">
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) =>
                  handleDevelopmentLink(
                    e,
                    'Social media features are under development',
                    '社交媒体功能正在开发中'
                  )
                }
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) =>
                  handleDevelopmentLink(
                    e,
                    'Social media features are under development',
                    '社交媒体功能正在开发中'
                  )
                }
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) =>
                  handleDevelopmentLink(
                    e,
                    'Social media features are under development',
                    '社交媒体功能正在开发中'
                  )
                }
              >
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.tools')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compress" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.imageCompress')}
                </Link>
              </li>
              <li>
                <Link href="/model-viewer" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.viewer3d')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Code tools are under development',
                      '代码工具正在开发中'
                    )
                  }
                >
                  {t('footer.codeTools')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Design tools are under development',
                      '设计工具正在开发中'
                    )
                  }
                >
                  {t('footer.designTools')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Documentation is under development',
                      '文档页面正在开发中'
                    )
                  }
                >
                  {t('footer.docs')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'API features are under development',
                      'API功能正在开发中'
                    )
                  }
                >
                  {t('footer.api')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Blog is under development',
                      '博客功能正在开发中'
                    )
                  }
                >
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Tutorials are under development',
                      '教程功能正在开发中'
                    )
                  }
                >
                  {t('footer.tutorials')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'About page is under development',
                      '关于我们页面正在开发中'
                    )
                  }
                >
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Privacy policy page is under development',
                      '隐私政策页面正在开发中'
                    )
                  }
                >
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Terms of use page is under development',
                      '使用条款页面正在开发中'
                    )
                  }
                >
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={(e) =>
                    handleDevelopmentLink(
                      e,
                      'Contact page is under development',
                      '联系我们功能正在开发中'
                    )
                  }
                >
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatiKit.io. {t('footer.rights')}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={(e) =>
                handleDevelopmentLink(
                  e,
                  'Privacy policy page is under development',
                  '隐私政策页面正在开发中'
                )
              }
            >
              {t('footer.privacy')}
            </Link>
            <Link
              href="#"
              className="text-sm text-muted-foreground hover:text-primary"
              onClick={(e) =>
                handleDevelopmentLink(
                  e,
                  'Terms of use page is under development',
                  '使用条款页面正在开发中'
                )
              }
            >
              {t('footer.terms')}
            </Link>
          </div>
        </div>
      </div>
      
      {/* 开发中提示 */}
      <DevelopmentInProgress 
        visible={alertVisible}
        onClose={closeAlert}
        duration={alertDuration}
        message={alertMessage}
      />
    </footer>
  );
}