'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { usePathname } from 'next/navigation';
import { getAllLocaleUrls, removeLocaleFromPath, locales } from '@/lib/i18n-routing';

export function LanguageWrapper() {
  const { locale } = useI18n();
  const pathname = usePathname();
  const createdLinksRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    // 确保在客户端环境执行
    if (typeof window === 'undefined' || !document.head) {
      return;
    }

    // 更新 html lang 属性
    document.documentElement.lang = locale;

    // 添加 hreflang 标签支持多语言SEO（使用语言路径）
    const baseUrl = 'https://creatikit.asia';
    const cleanPath = removeLocaleFromPath(pathname || '/');
    
    // 获取所有语言版本的URL
    const localeUrls = getAllLocaleUrls(cleanPath);

    // 安全地移除之前创建的 hreflang 标签
    createdLinksRef.current.forEach(link => {
      try {
        if (link && link.parentNode === document.head) {
          document.head.removeChild(link);
        }
      } catch (error) {
        // 忽略移除错误，元素可能已经被移除
      }
    });
    createdLinksRef.current = [];

    // 添加所有语言版本的 hreflang 标签
    locales.forEach((code) => {
      try {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = code;
        link.href = `${baseUrl}${localeUrls[code]}`;
        document.head.appendChild(link);
        createdLinksRef.current.push(link);
      } catch (error) {
        console.error('Failed to add hreflang tag:', error);
      }
    });

    // 添加 x-default（指向默认语言：英文，用于 Google 等国际搜索引擎）
    try {
      const defaultLink = document.createElement('link');
      defaultLink.rel = 'alternate';
      defaultLink.hreflang = 'x-default';
      defaultLink.href = `${baseUrl}${localeUrls['en']}`;
      document.head.appendChild(defaultLink);
      createdLinksRef.current.push(defaultLink);
    } catch (error) {
      console.error('Failed to add x-default hreflang tag:', error);
    }

    // 清理函数：安全地移除添加的 hreflang 标签
    return () => {
      createdLinksRef.current.forEach(link => {
        try {
          if (link && link.parentNode === document.head) {
            document.head.removeChild(link);
          }
        } catch (error) {
          // 忽略移除错误，元素可能已经被移除
        }
      });
      createdLinksRef.current = [];
    };
  }, [locale, pathname]);

  return null;
}


