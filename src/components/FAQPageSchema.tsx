import { headers } from 'next/headers';
import { getLocaleFromPath } from '@/lib/i18n-routing';
import type { Locale } from '@/lib/i18n-routing';
import { compressFAQ, aboutFAQ, type FAQItem } from '@/lib/faq-schemas';

function buildFAQPageSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question' as const,
      name: question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: answer,
      },
    })),
  };
}

/** 图片压缩页 FAQ 结构化数据 */
export async function CompressFAQPageSchema() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '/compress';
  const locale = (getLocaleFromPath(pathname) || 'en') as Locale;
  const items = compressFAQ[locale] ?? compressFAQ.en;
  const schema = buildFAQPageSchema(items);
  return (
    <script
      id="compress-faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** 关于页 FAQ 结构化数据 */
export async function AboutFAQPageSchema() {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '/about';
  const locale = (getLocaleFromPath(pathname) || 'en') as Locale;
  const items = aboutFAQ[locale] ?? aboutFAQ.en;
  const schema = buildFAQPageSchema(items);
  return (
    <script
      id="about-faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
