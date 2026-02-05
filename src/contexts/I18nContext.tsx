'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getLocaleFromPath, addLocaleToPath, removeLocaleFromPath, type Locale as LocaleType } from '@/lib/i18n-routing';

export type Locale = 'zh-CN' | 'en' | 'ja-JP' | 'ko-KR';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: (Record<string, string | number> & { returnObjects?: boolean }) | { returnObjects: boolean }) => string | any;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 翻译文件缓存
const translationCache = new Map<Locale, Record<string, any>>();

// 加载翻译文件（带缓存）
const loadTranslations = async (locale: Locale): Promise<Record<string, any>> => {
  // 如果缓存中有，直接返回
  if (translationCache.has(locale)) {
    return translationCache.get(locale)!;
  }

  try {
    let translations: Record<string, any>;
    if (locale === 'zh-CN') {
      const loaded = await import('@/locales/zh-CN.json');
      translations = loaded.default || loaded;
    } else if (locale === 'ja-JP') {
      const loaded = await import('@/locales/ja-JP.json');
      translations = loaded.default || loaded;
    } else if (locale === 'ko-KR') {
      const loaded = await import('@/locales/ko-KR.json');
      translations = loaded.default || loaded;
    } else {
      const loaded = await import('@/locales/en.json');
      translations = loaded.default || loaded;
    }
    // 缓存翻译文件
    translationCache.set(locale, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // 如果加载失败，尝试加载英文作为后备
    if (locale !== 'en') {
      try {
        const fallback = await import('@/locales/en.json');
        const fallbackTranslations = fallback.default || fallback;
        translationCache.set('en', fallbackTranslations);
        return fallbackTranslations;
      } catch {
        return {};
      }
    }
    return {};
  }
};

// 根据路径获取嵌套值
const getNestedValue = (obj: any, path: string, returnObjects?: boolean): any => {
  // 如果对象为空或不是对象，返回空字符串或undefined
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) {
    return returnObjects ? undefined : '';
  }
  
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return returnObjects ? undefined : ''; // 如果找不到，返回空字符串或undefined
    }
  }
  if (returnObjects && typeof value === 'object') {
    return value;
  }
  return typeof value === 'string' ? value : (returnObjects ? value : '');
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>('zh-CN');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 从URL路径中读取语言代码（优先级最高）
  useEffect(() => {
    const pathLocale = getLocaleFromPath(pathname);
    if (pathLocale) {
      setLocaleState(pathLocale);
      localStorage.setItem('locale', pathLocale);
      return;
    }

    // 如果URL中没有语言代码，检查保存的设置
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'zh-CN' || savedLocale === 'en' || savedLocale === 'ko-KR' || savedLocale === 'ja-JP')) {
      // 重定向到带语言前缀的URL
      const newPath = addLocaleToPath(pathname, savedLocale);
      router.replace(newPath);
      setLocaleState(savedLocale);
      return;
    }

    // 如果都没有，使用默认语言并重定向
    const defaultLocale: Locale = 'zh-CN';
    const newPath = addLocaleToPath(pathname, defaultLocale);
    router.replace(newPath);
    setLocaleState(defaultLocale);
    localStorage.setItem('locale', defaultLocale);
  }, [pathname, router]);

  // 加载翻译文件
  useEffect(() => {
    setIsLoading(true);
    loadTranslations(locale)
      .then((loadedTranslations) => {
        setTranslations(loadedTranslations);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load translations:', error);
        setIsLoading(false);
      });
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    console.log('Setting locale to:', newLocale);
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    
    // 更新URL以包含新的语言前缀
    const currentPath = removeLocaleFromPath(pathname);
    const newPath = addLocaleToPath(currentPath, newLocale);
    router.push(newPath);
    
    // useEffect 会自动处理翻译加载
  }, [pathname, router]);

  const t = useCallback((key: string, params?: (Record<string, string | number> & { returnObjects?: boolean }) | { returnObjects: boolean }): string | any => {
    // 如果正在加载且翻译为空，返回空字符串而不是 key，避免显示 mmmm.mmm 格式
    if (isLoading && Object.keys(translations).length === 0) {
      return '';
    }
    
    const returnObjects = params?.returnObjects;
    let value = getNestedValue(translations, key, returnObjects);
    
    // 如果找不到翻译且不是返回对象，返回空字符串而不是 key
    if (!returnObjects && (value === key || value === undefined || value === null)) {
      return '';
    }
    
    if (returnObjects) {
      return value;
    }
    if (params && typeof value === 'string') {
      // 处理参数插值
      if ('returnObjects' in params && Object.keys(params).length === 1) {
        // 只有 returnObjects 参数，不需要插值
        return value;
      }
      // 遍历所有参数键，跳过 returnObjects
      Object.keys(params).forEach(paramKey => {
        if (paramKey !== 'returnObjects') {
          const paramValue = params[paramKey as keyof typeof params];
          // 确保值是 string 或 number
          if (typeof paramValue === 'string' || typeof paramValue === 'number') {
            value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
          }
        }
      });
    }
    return value || '';
  }, [translations, isLoading]);

  // 使用 useMemo 缓存 context value，避免不必要的重新渲染
  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    t,
    isLoading
  }), [locale, setLocale, t, isLoading]);

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

