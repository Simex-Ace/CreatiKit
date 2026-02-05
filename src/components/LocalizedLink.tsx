/**
 * 本地化链接组件
 * 自动为所有链接添加语言前缀，确保SEO友好
 */

'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { addLocaleToPath, removeLocaleFromPath } from '@/lib/i18n-routing';
import React from 'react';

interface LocalizedLinkProps extends Omit<React.ComponentPropsWithoutRef<typeof Link>, 'href'> {
  href: string;
  children: React.ReactNode;
}

export const LocalizedLink: React.FC<LocalizedLinkProps> = ({ href, children, ...props }) => {
  const { locale } = useI18n();

  // href 已经是字符串类型，直接使用
  // 如果 href 已经是带有语言前缀的，则先移除，再添加当前语言的
  const cleanHref = removeLocaleFromPath(href);
  const localizedHref = addLocaleToPath(cleanHref, locale);

  return (
    <Link href={localizedHref} {...props}>
      {children}
    </Link>
  );
};

