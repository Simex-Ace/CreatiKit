/**
 * 多语言路由工具函数
 * 统一处理语言路径，确保SEO友好
 */

export type Locale = 'zh-CN' | 'en' | 'ja-JP' | 'ko-KR';

export const locales: Locale[] = ['zh-CN', 'en', 'ja-JP', 'ko-KR'];
export const defaultLocale: Locale = 'en'; // 默认英文，用于 Google 等国际搜索引擎（x-default 指向英文）

/**
 * 检查路径是否包含语言前缀
 */
export function hasLocalePrefix(pathname: string): boolean {
  return locales.some(locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
}

/**
 * 从路径中提取语言代码
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return null;
}

/**
 * 从路径中移除语言前缀，获取实际路径
 */
export function removeLocaleFromPath(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(`/${locale}`.length);
    }
    if (pathname === `/${locale}`) {
      return '/';
    }
  }
  return pathname;
}

/**
 * 为路径添加语言前缀
 */
export function addLocaleToPath(pathname: string, locale: Locale): string {
  // 如果路径已经是根路径，直接返回 /locale
  if (pathname === '/') {
    return `/${locale}`;
  }
  
  // 如果路径已经包含语言前缀，先移除
  const cleanPath = removeLocaleFromPath(pathname);
  
  // 添加新的语言前缀
  return `/${locale}${cleanPath}`;
}

/**
 * 切换路径的语言版本
 */
export function switchLocale(pathname: string, newLocale: Locale): string {
  const cleanPath = removeLocaleFromPath(pathname);
  return addLocaleToPath(cleanPath, newLocale);
}

/**
 * 获取所有语言版本的URL
 */
export function getAllLocaleUrls(pathname: string): Record<Locale, string> {
  const cleanPath = removeLocaleFromPath(pathname);
  const result: Partial<Record<Locale, string>> = {};
  
  for (const locale of locales) {
    result[locale] = addLocaleToPath(cleanPath, locale);
  }
  
  return result as Record<Locale, string>;
}

/**
 * 获取完整的URL（包含域名）
 */
export function getFullUrl(path: string, locale?: Locale): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creatikit.asia';
  const localePath = locale ? addLocaleToPath(path, locale) : path;
  return `${baseUrl}${localePath}`;
}

