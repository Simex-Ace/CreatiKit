'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';

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
  const [locale, setLocaleState] = useState<Locale>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时从 localStorage 读取语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    // 默认使用英文，如果没有保存的设置或保存的是日文（重置为英文）
    if (!savedLocale || savedLocale === 'ja-JP') {
      setLocaleState('en');
      localStorage.setItem('locale', 'en');
    } else if (savedLocale === 'zh-CN' || savedLocale === 'en' || savedLocale === 'ko-KR') {
      setLocaleState(savedLocale);
    } else {
      // 如果保存的值无效，使用英文
        setLocaleState('en');
      localStorage.setItem('locale', 'en');
    }
  }, []);

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
    // useEffect 会自动处理翻译加载
  }, []);

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

