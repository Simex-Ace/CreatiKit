'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'zh-CN' | 'en' | 'ja-JP' | 'ko-KR';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: (Record<string, string | number> & { returnObjects?: boolean }) | { returnObjects: boolean }) => string | any;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 加载翻译文件
const loadTranslations = async (locale: Locale): Promise<Record<string, any>> => {
  try {
    if (locale === 'zh-CN') {
      const translations = await import('@/locales/zh-CN.json');
      return translations.default || translations;
    } else if (locale === 'ja-JP') {
      const translations = await import('@/locales/ja-JP.json');
      console.log('Japanese translations loaded:', translations);
      return translations.default || translations;
    } else if (locale === 'ko-KR') {
      const translations = await import('@/locales/ko-KR.json');
      return translations.default || translations;
    } else {
      const translations = await import('@/locales/en.json');
      return translations.default || translations;
    }
  } catch (error) {
    console.error(`Failed to load translations for ${locale}:`, error);
    // 如果加载失败，尝试加载英文作为后备
    if (locale !== 'en') {
      try {
        const fallback = await import('@/locales/en.json');
        return fallback.default || fallback;
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

  const setLocale = (newLocale: Locale) => {
    console.log('Setting locale to:', newLocale);
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // useEffect 会自动处理翻译加载
  };

  const t = (key: string, params?: (Record<string, string | number> & { returnObjects?: boolean }) | { returnObjects: boolean }): string | any => {
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
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, isLoading }}>
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

