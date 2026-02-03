'use client';

import { useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';

export function LanguageWrapper() {
  const { locale } = useI18n();

  useEffect(() => {
    // 更新 html lang 属性
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}


