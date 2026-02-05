/**
 * 本地化路由Hook
 * 自动为所有路由添加语言前缀，确保SEO友好
 */

import { useRouter as useNextRouter, usePathname } from 'next/navigation';
import { useI18n } from '@/contexts/I18nContext';
import { addLocaleToPath, removeLocaleFromPath } from '@/lib/i18n-routing';

export function useLocalizedRouter() {
  const router = useNextRouter();
  const pathname = usePathname();
  const { locale } = useI18n();

  /**
   * 带语言前缀的push
   */
  const push = (href: string) => {
    const localizedHref = addLocaleToPath(href, locale);
    router.push(localizedHref);
  };

  /**
   * 带语言前缀的replace
   */
  const replace = (href: string) => {
    const localizedHref = addLocaleToPath(href, locale);
    router.replace(localizedHref);
  };

  /**
   * 获取带语言前缀的href
   */
  const getLocalizedHref = (href: string): string => {
    return addLocaleToPath(href, locale);
  };

  return {
    push,
    replace,
    getLocalizedHref,
    locale,
    pathname: removeLocaleFromPath(pathname || '/'),
  };
}

