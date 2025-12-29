'use client';

import { useEffect } from 'react';

export function StructuredData() {
  useEffect(() => {
    // 网站结构化数据
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CreatiKit.io',
      url: 'https://creatikit.asia',
      description: '免费在线创意工具箱，提供20+实用工具',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://creatikit.asia/?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    };

    // 组织/公司结构化数据
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'CreatiKit',
      url: 'https://creatikit.asia',
      logo: 'https://creatikit.asia/favicon.svg',
      description: '提供免费在线创意工具的在线平台',
      sameAs: [
        // 可以添加社交媒体链接
      ],
    };

    // 软件应用结构化数据
    const softwareApplicationSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'CreatiKit.io',
      applicationCategory: 'UtilityApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
      description: '免费在线创意工具箱，提供图片压缩、3D预览、设计工具等20+实用功能',
      url: 'https://creatikit.asia',
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '100',
      },
    };

    // 工具集合结构化数据
    const itemListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'CreatiKit 工具集合',
      description: '免费在线创意工具集合',
      itemListElement: [
        {
          '@type': 'SoftwareApplication',
          position: 1,
          name: '图片压缩工具',
          url: 'https://creatikit.asia/compress',
          description: '免费在线图片压缩工具，支持JPG、PNG格式',
        },
        {
          '@type': 'SoftwareApplication',
          position: 2,
          name: '背景移除工具',
          url: 'https://creatikit.asia/background-remover',
          description: '一键去除图片背景，创建透明背景图片',
        },
        {
          '@type': 'SoftwareApplication',
          position: 3,
          name: '像素艺术生成器',
          url: 'https://creatikit.asia/pixel-art-generator',
          description: '将图片转换为像素风格艺术',
        },
        {
          '@type': 'SoftwareApplication',
          position: 4,
          name: '3D模型预览器',
          url: 'https://creatikit.asia/model-viewer',
          description: '在线预览3D模型，支持多种格式',
        },
        {
          '@type': 'SoftwareApplication',
          position: 5,
          name: '二维码生成器',
          url: 'https://creatikit.asia/qr-code-generator',
          description: '快速生成各类二维码',
        },
        {
          '@type': 'SoftwareApplication',
          position: 6,
          name: '调色板工具',
          url: 'https://creatikit.asia/color-palette',
          description: '专业在线配色工具',
        },
        {
          '@type': 'SoftwareApplication',
          position: 7,
          name: 'Markdown编辑器',
          url: 'https://creatikit.asia/markdown-editor',
          description: '在线编辑和预览Markdown文档',
        },
        {
          '@type': 'SoftwareApplication',
          position: 8,
          name: '在线白板',
          url: 'https://creatikit.asia/whiteboard',
          description: '无限画布绘图工具',
        },
      ],
    };

    // 将结构化数据添加到页面
    const scripts = [
      { id: 'website-schema', schema: websiteSchema },
      { id: 'organization-schema', schema: organizationSchema },
      { id: 'software-application-schema', schema: softwareApplicationSchema },
      { id: 'item-list-schema', schema: itemListSchema },
    ];

    scripts.forEach(({ id, schema }) => {
      // 移除已存在的脚本
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }

      // 创建新的脚本元素
      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    // 清理函数
    return () => {
      scripts.forEach(({ id }) => {
        const script = document.getElementById(id);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);

  return null;
}

