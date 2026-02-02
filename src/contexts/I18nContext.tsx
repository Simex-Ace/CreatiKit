'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'zh-CN' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: (Record<string, string | number> & { returnObjects?: boolean }) | { returnObjects: boolean }) => string | any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 加载翻译文件
const loadTranslations = async (locale: Locale): Promise<Record<string, any>> => {
  try {
    if (locale === 'zh-CN') {
      const translations = await import('@/locales/zh-CN.json');
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
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return returnObjects ? undefined : path; // 如果找不到，返回原始key或undefined
    }
  }
  if (returnObjects && typeof value === 'object') {
    return value;
  }
  return typeof value === 'string' ? value : (returnObjects ? value : path);
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh-CN');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // 初始化时从 localStorage 读取语言设置
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && (savedLocale === 'zh-CN' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    } else {
      // 检测浏览器语言
      const browserLang = navigator.language || (navigator as any).userLanguage;
      if (browserLang.startsWith('en')) {
        setLocaleState('en');
      }
    }
  }, []);

  // 加载翻译文件
  useEffect(() => {
    loadTranslations(locale).then(setTranslations);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // 重新加载翻译
    loadTranslations(newLocale).then(setTranslations);
  };

  const t = (key: string, params?: Record<string, string | number> & { returnObjects?: boolean }): string | any => {
    const returnObjects = params?.returnObjects;
    let value = getNestedValue(translations, key, returnObjects);
    if (returnObjects) {
      return value;
    }
    if (params && typeof value === 'string') {
      Object.keys(params).forEach(paramKey => {
        if (paramKey !== 'returnObjects') {
          value = value.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
        }
      });
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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

