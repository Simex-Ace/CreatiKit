/**
 * 本地化链接组件
 * 自动为所有链接添加语言前缀，确保SEO友好
 */

'use client';

import Link from 'next/link';
import { useI18n } from '@/contexts/I18nContext';
import { addLocaleToPath } from '@/lib/i18n-routing';
import type { LinkProps } from 'next/link';
import { forwardRef } from 'react';

interface LocalizedLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children?: React.ReactNode;
}

export const LocalizedLink = forwardRef<HTMLAnchorElement, LocalizedLinkProps>(
  ({ href, ...props }, ref) => {
    const { locale } = useI18n();
    const localizedHref = addLocaleToPath(href, locale);
    
    return <Link ref={ref} href={localizedHref} {...props} />;
  }
);

LocalizedLink.displayName = 'LocalizedLink';

