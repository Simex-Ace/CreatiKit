'use client';

import { useEffect, useRef } from 'react';

export function StructuredData() {
  const createdScriptsRef = useRef<HTMLScriptElement[]>([]);

  useEffect(() => {
    // 确保在客户端环境执行
    if (typeof window === 'undefined' || !document.head) {
      return;
    }
    // 网站结构化数据
    const websiteSchema = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'CreatiKit.io',
      url: 'https://creatikit.asia',
      description: '免费在线创意工具箱，提供25+实用工具',
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
      description: '免费在线创意工具箱，提供图片压缩、3D预览、设计工具、SVG编辑、CSS动画、音频可视化、粒子特效等25+实用功能',
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
      description: '免费在线创意工具集合，包含25+实用工具',
      numberOfItems: 25,
      itemListElement: [
        {
          '@type': 'SoftwareApplication',
          position: 1,
          name: '图片压缩工具',
          url: 'https://creatikit.asia/compress',
          description: '免费在线图片压缩工具，支持JPG、PNG格式，保持画质的同时减小文件体积',
        },
        {
          '@type': 'SoftwareApplication',
          position: 2,
          name: '背景移除工具',
          url: 'https://creatikit.asia/background-remover',
          description: '一键去除图片背景，创建透明背景图片，支持自定义颜色选择和阈值调整',
        },
        {
          '@type': 'SoftwareApplication',
          position: 3,
          name: '像素艺术生成器',
          url: 'https://creatikit.asia/pixel-art-generator',
          description: '将图片转换为像素风格艺术，支持自定义像素大小、颜色数量和调色板选择',
        },
        {
          '@type': 'SoftwareApplication',
          position: 4,
          name: '3D模型预览器',
          url: 'https://creatikit.asia/model-viewer',
          description: '在线预览3D模型，支持GLB、GLTF等多种格式，可旋转、缩放等交互操作',
        },
        {
          '@type': 'SoftwareApplication',
          position: 5,
          name: '二维码生成器',
          url: 'https://creatikit.asia/qr-code-generator',
          description: '快速生成各类二维码，支持多种内容类型、样式定制和文件格式导出',
        },
        {
          '@type': 'SoftwareApplication',
          position: 6,
          name: '调色板工具',
          url: 'https://creatikit.asia/color-palette',
          description: '专业在线配色工具，支持颜色选择、配色方案生成、图片取色功能',
        },
        {
          '@type': 'SoftwareApplication',
          position: 7,
          name: 'Markdown编辑器',
          url: 'https://creatikit.asia/markdown-editor',
          description: '在线编辑和预览Markdown文档，支持实时渲染，可导出为HTML或PDF格式',
        },
        {
          '@type': 'SoftwareApplication',
          position: 8,
          name: '在线白板',
          url: 'https://creatikit.asia/whiteboard',
          description: '无限画布绘图工具，支持画笔、橡皮擦、文本输入和形状绘制',
        },
        {
          '@type': 'SoftwareApplication',
          position: 9,
          name: 'SVG编辑器',
          url: 'https://creatikit.asia/svg-editor',
          description: '专业免费在线SVG编辑器，支持路径绘制、形状创建、文本编辑、导入导出SVG文件',
        },
        {
          '@type': 'SoftwareApplication',
          position: 10,
          name: 'CSS动画生成器',
          url: 'https://creatikit.asia/css-animator',
          description: '可视化创建CSS动画，实时预览效果，支持多种动画类型和参数调整，导出代码直接使用',
        },
        {
          '@type': 'SoftwareApplication',
          position: 11,
          name: '音频可视化工具',
          url: 'https://creatikit.asia/audio-visualizer',
          description: '音频频谱可视化，支持频谱、波形、圆形频谱、粒子效果和瀑布图等多种可视化效果',
        },
        {
          '@type': 'SoftwareApplication',
          position: 12,
          name: '粒子编辑器',
          url: 'https://creatikit.asia/particle-editor',
          description: '创建炫酷的粒子特效，支持自定义粒子参数、形状、颜色和混合模式，导出配置和截图',
        },
        {
          '@type': 'SoftwareApplication',
          position: 13,
          name: 'GIF工具',
          url: 'https://creatikit.asia/gif-tool',
          description: 'GIF分解和合成器，可将GIF动图分解为单帧静态图片，或将多张图片合成为动态GIF',
        },
        {
          '@type': 'SoftwareApplication',
          position: 14,
          name: 'SEO文本分析工具',
          url: 'https://creatikit.asia/text-analyzer',
          description: '专业SEO文本分析工具，提供关键词密度检测、相关关键词建议、文本热力图和智能优化功能',
        },
        {
          '@type': 'SoftwareApplication',
          position: 15,
          name: '哈希计算器',
          url: 'https://creatikit.asia/hash-calculator',
          description: '计算文本或文件的MD5、SHA-1、SHA-256、SHA-512等多种哈希值，支持自定义算法选择',
        },
        {
          '@type': 'SoftwareApplication',
          position: 16,
          name: '时间戳转换器',
          url: 'https://creatikit.asia/timestamp-converter',
          description: '在标准日期时间和Unix时间戳之间进行转换，显示相对时间',
        },
        {
          '@type': 'SoftwareApplication',
          position: 17,
          name: '天气预报工具',
          url: 'https://creatikit.asia/weather-tool',
          description: '实时获取当前位置天气，查看未来3天预报和空气质量，支持城市搜索功能',
        },
        {
          '@type': 'SoftwareApplication',
          position: 18,
          name: '数据转图表工具',
          url: 'https://creatikit.asia/data-to-chart',
          description: '输入CSV或JSON数据，通过简单配置将数据映射到图表轴，生成并导出柱状图、折线图或饼图',
        },
        {
          '@type': 'SoftwareApplication',
          position: 19,
          name: '在线电子钢琴',
          url: 'https://creatikit.asia/piano',
          description: '使用电脑键盘或鼠标弹奏钢琴，体验真实的钢琴音色，支持一个完整八度的音符',
        },
        {
          '@type': 'SoftwareApplication',
          position: 20,
          name: '交互式物理实验室',
          url: 'https://creatikit.asia/physics-lab',
          description: '模拟初中力学实验，自由创造、交互和观察符合物理规律的物体运动',
        },
        {
          '@type': 'SoftwareApplication',
          position: 21,
          name: '交互式化学实验室',
          url: 'https://creatikit.asia/chemistry-lab',
          description: '安全直观地学习和观察初中化学的核心反应现象，拖拽仪器、混合试剂进行虚拟实验',
        },
        {
          '@type': 'SoftwareApplication',
          position: 22,
          name: '生物沙盒模拟',
          url: 'https://creatikit.asia/ecosystem-sandbox',
          description: '高性能纯前端生态系统模拟，观察生物在沙盒中随机移动，支持添加、暂停和调整速度',
        },
        {
          '@type': 'SoftwareApplication',
          position: 23,
          name: 'Emoji大全',
          url: 'https://creatikit.asia/emoji-collection',
          description: '浏览、搜索和一键复制各种表情符号，支持收藏夹和最近使用功能',
        },
        {
          '@type': 'SoftwareApplication',
          position: 24,
          name: '隔空写字',
          url: 'https://creatikit.asia/camera-gesture-drawing',
          description: '使用手势控制进行空中书写，支持多种工具、缩放和消散效果，带来全新的交互体验',
        },
        {
          '@type': 'SoftwareApplication',
          position: 25,
          name: '代码工具',
          url: 'https://creatikit.asia/code-tools',
          description: '提供多种实用的代码工具，帮助开发者提高工作效率',
        },
      ],
    };

    // 面包屑导航结构化数据（首页）
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '首页',
          item: 'https://creatikit.asia',
        },
      ],
    };

    // 将结构化数据添加到页面
    const scripts = [
      { id: 'website-schema', schema: websiteSchema },
      { id: 'organization-schema', schema: organizationSchema },
      { id: 'software-application-schema', schema: softwareApplicationSchema },
      { id: 'item-list-schema', schema: itemListSchema },
      { id: 'breadcrumb-schema', schema: breadcrumbSchema },
    ];

    // 安全地移除之前创建的脚本
    createdScriptsRef.current.forEach(script => {
      try {
        if (script && script.parentNode === document.head) {
          document.head.removeChild(script);
        }
      } catch (error) {
        // 忽略移除错误，元素可能已经被移除
      }
    });
    createdScriptsRef.current = [];

    // 创建并添加新的脚本元素
    scripts.forEach(({ id, schema }) => {
      try {
        // 安全地移除已存在的脚本
        const existingScript = document.getElementById(id);
        if (existingScript && existingScript.parentNode === document.head) {
          document.head.removeChild(existingScript);
        }

        // 创建新的脚本元素
        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
        createdScriptsRef.current.push(script);
      } catch (error) {
        console.error(`Failed to add structured data script ${id}:`, error);
      }
    });

    // 清理函数：安全地移除添加的脚本
    return () => {
      createdScriptsRef.current.forEach(script => {
        try {
          if (script && script.parentNode === document.head) {
            document.head.removeChild(script);
          }
        } catch (error) {
          // 忽略移除错误，元素可能已经被移除
        }
      });
      createdScriptsRef.current = [];
    };
  }, []);

  return null;
}

