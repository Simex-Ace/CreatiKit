'use client'

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Instagram } from 'lucide-react';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';
import { useI18n } from '@/contexts/I18nContext';

export function Footer() {
  const { showAlert, alertVisible, alertMessage, alertDuration, closeAlert } = useDevelopmentAlert();
  const { locale } = useI18n();

  const isEn = locale === 'en';

  const handleDevelopmentLink = (e: React.MouseEvent, messageEn: string, messageZh: string) => {
    e.preventDefault();
    showAlert(isEn ? messageEn : messageZh);
  };

  const tText = {
    tagline: isEn
      ? 'A powerful yet minimal online creative toolkit, empowering your design and development workflow'
      : '强大而简洁的在线创意工具箱，赋能您的设计与开发工作流',
    tools: isEn ? 'Tools' : '工具',
    resources: isEn ? 'Resources' : '资源',
    company: isEn ? 'Company' : '公司',
    imageCompress: isEn ? 'Image Compress' : '图片压缩',
    viewer3d: isEn ? '3D Viewer' : '3D预览',
    codeTools: isEn ? 'Code Tools' : '代码工具',
    designTools: isEn ? 'Design Tools' : '设计工具',
    docs: isEn ? 'Docs' : '文档',
    api: 'API',
    blog: isEn ? 'Blog' : '博客',
    tutorials: isEn ? 'Tutorials' : '教程',
    about: isEn ? 'About Us' : '关于我们',
    privacy: isEn ? 'Privacy Policy' : '隐私政策',
    terms: isEn ? 'Terms of Use' : '使用条款',
    contact: isEn ? 'Contact Us' : '联系我们',
    rights: isEn ? 'All rights reserved.' : '保留所有权利。',
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
              {tText.tagline}
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
            <h3 className="text-sm font-semibold mb-4">{tText.tools}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/compress" className="text-sm text-muted-foreground hover:text-primary">
                  {tText.imageCompress}
                </Link>
              </li>
              <li>
                <Link href="/model-viewer" className="text-sm text-muted-foreground hover:text-primary">
                  {tText.viewer3d}
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
                  {tText.codeTools}
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
                  {tText.designTools}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{tText.resources}</h3>
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
                  {tText.docs}
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
                  {tText.api}
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
                  {tText.blog}
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
                  {tText.tutorials}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{tText.company}</h3>
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
                  {tText.about}
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
                  {tText.privacy}
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
                  {tText.terms}
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
                  {tText.contact}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CreatiKit.io. {tText.rights}
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
              {tText.privacy}
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
              {tText.terms}
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