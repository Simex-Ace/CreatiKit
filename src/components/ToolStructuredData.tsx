'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { generateToolStructuredData } from '@/lib/tool-structured-data';

interface ToolStructuredDataProps {
  path: string;
}

/**
 * 工具页面的结构化数据组件
 * 为每个工具页面注入 SoftwareApplication 结构化数据
 */
export function ToolStructuredData({ path }: ToolStructuredDataProps) {
  const { locale } = useI18n();
  const createdScriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // 确保在客户端环境执行
    if (typeof window === 'undefined' || !document.head) {
      return;
    }

    // 生成结构化数据
    const structuredData = generateToolStructuredData(path, locale);

    // 如果没有结构化数据，不添加
    if (!structuredData || Object.keys(structuredData).length === 0) {
      return;
    }

    // 安全地移除之前创建的脚本
    if (createdScriptRef.current && createdScriptRef.current.parentNode === document.head) {
      try {
        document.head.removeChild(createdScriptRef.current);
      } catch (error) {
        // 忽略移除错误
      }
    }

    // 创建新的脚本标签
    try {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = `tool-structured-data-${path}`;
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
      createdScriptRef.current = script;
    } catch (error) {
      console.error('Failed to add tool structured data:', error);
    }

    // 清理函数：安全地移除添加的脚本
    return () => {
      if (createdScriptRef.current && createdScriptRef.current.parentNode === document.head) {
        try {
          document.head.removeChild(createdScriptRef.current);
        } catch (error) {
          // 忽略移除错误
        }
      }
      createdScriptRef.current = null;
    };
  }, [path, locale]);

  return null;
}

