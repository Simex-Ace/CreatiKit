import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getToolMetadata } from '@/lib/tool-metadata';
import { getLocaleFromPath } from '@/lib/i18n-routing';
import { ToolStructuredData } from '@/components/ToolStructuredData';

/**
 * 动态生成多语言元数据
 */
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/data-to-chart';
  
  // 从路径中提取语言
  const locale = getLocaleFromPath(pathname) || 'en';
  
  // 获取工具元数据
  return getToolMetadata('/data-to-chart', locale);
}

export default function DataToChartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ToolStructuredData path="/data-to-chart" />
      {children}
    </>
  );
}

