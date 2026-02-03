'use client'

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Github, Twitter, Rocket } from 'lucide-react';
import { DevelopmentInProgress } from '@/components/ui/DevelopmentInProgress';
import { useDevelopmentAlert } from '@/lib/useDevelopmentAlert';
import { useI18n } from '@/contexts/I18nContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
            <TooltipProvider delayDuration={200}>
              <div className="flex space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="https://github.com/Simex-Ace/CreatiKit"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <div className="absolute inset-0 rounded-full bg-gray-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
                      <Github className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    sideOffset={8}
                    className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 text-white border-gray-700/50 shadow-xl backdrop-blur-md px-3 py-2 rounded-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1"
                  >
                    <div className="flex items-center gap-2">
                      <Github className="h-3.5 w-3.5 animate-pulse" />
                      <span className="font-semibold text-sm">GitHub</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 border-r border-b border-gray-700/50"></div>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="https://x.com/Simex_Ace"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
                      <Twitter className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    sideOffset={8}
                    className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 text-white border-blue-400/50 shadow-xl backdrop-blur-md px-3 py-2 rounded-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1"
                  >
                    <div className="flex items-center gap-2">
                      <Twitter className="h-3.5 w-3.5 animate-pulse" />
                      <span className="font-semibold text-sm">Twitter / X</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 rotate-45 border-r border-b border-blue-400/50"></div>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="https://www.producthunt.com/@new_user___0322026c227496c9a841bc0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                      aria-label="Product Hunt"
                    >
                      <div className="absolute inset-0 rounded-full bg-orange-500/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300 -z-10"></div>
                      <Rocket className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12 group-hover:translate-y-[-2px]" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top"
                    sideOffset={8}
                    className="bg-gradient-to-br from-orange-500 via-pink-500 to-orange-500 text-white border-orange-400/50 shadow-xl backdrop-blur-md px-3 py-2 rounded-lg animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-1"
                  >
                    <div className="flex items-center gap-2">
                      <Rocket className="h-3.5 w-3.5 animate-bounce" />
                      <span className="font-semibold text-sm">Product Hunt</span>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-orange-500 rotate-45 border-r border-b border-orange-400/50"></div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
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
                <Link href="/code-tools" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.codeTools')}
                </Link>
              </li>
              <li>
                <Link href="/color-palette" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.designTools')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.docs')}
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.api')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.tutorials')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
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