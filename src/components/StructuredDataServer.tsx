/**
 * 服务端渲染的结构化数据组件
 * 确保 JSON-LD 在 HTML 初始输出中即可被爬虫抓取，解决客户端注入可能导致的问题
 */
export function StructuredDataServer() {
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

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CreatiKit',
    url: 'https://creatikit.asia',
    logo: 'https://creatikit.asia/favicon.svg',
    description: '提供免费在线创意工具的在线平台',
    sameAs: [],
  };

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
    description:
      '免费在线创意工具箱，提供图片压缩、3D预览、设计工具、SVG编辑、CSS动画、音频可视化、粒子特效等25+实用功能',
    url: 'https://creatikit.asia',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
  };

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'CreatiKit 工具集合',
    description: '免费在线创意工具集合，包含25+实用工具',
    numberOfItems: 25,
    itemListElement: [
      { '@type': 'SoftwareApplication', position: 1, name: '图片压缩工具', url: 'https://creatikit.asia/compress', description: '免费在线图片压缩工具，支持JPG、PNG格式，保持画质的同时减小文件体积' },
      { '@type': 'SoftwareApplication', position: 2, name: '背景移除工具', url: 'https://creatikit.asia/background-remover', description: '一键去除图片背景，创建透明背景图片' },
      { '@type': 'SoftwareApplication', position: 3, name: '像素艺术生成器', url: 'https://creatikit.asia/pixel-art-generator', description: '将图片转换为像素风格艺术' },
      { '@type': 'SoftwareApplication', position: 4, name: '3D模型预览器', url: 'https://creatikit.asia/model-viewer', description: '在线预览3D模型，支持GLB、GLTF等多种格式' },
      { '@type': 'SoftwareApplication', position: 5, name: '二维码生成器', url: 'https://creatikit.asia/qr-code-generator', description: '快速生成各类二维码' },
      { '@type': 'SoftwareApplication', position: 6, name: '调色板工具', url: 'https://creatikit.asia/color-palette', description: '专业在线配色工具' },
      { '@type': 'SoftwareApplication', position: 7, name: 'Markdown编辑器', url: 'https://creatikit.asia/markdown-editor', description: '在线编辑和预览Markdown文档' },
      { '@type': 'SoftwareApplication', position: 8, name: '在线白板', url: 'https://creatikit.asia/whiteboard', description: '无限画布绘图工具' },
      { '@type': 'SoftwareApplication', position: 9, name: 'SVG编辑器', url: 'https://creatikit.asia/svg-editor', description: '专业免费在线SVG编辑器' },
      { '@type': 'SoftwareApplication', position: 10, name: 'CSS动画生成器', url: 'https://creatikit.asia/css-animator', description: '可视化创建CSS动画' },
      { '@type': 'SoftwareApplication', position: 11, name: '音频可视化工具', url: 'https://creatikit.asia/audio-visualizer', description: '音频频谱可视化' },
      { '@type': 'SoftwareApplication', position: 12, name: '粒子编辑器', url: 'https://creatikit.asia/particle-editor', description: '创建炫酷的粒子特效' },
      { '@type': 'SoftwareApplication', position: 13, name: 'GIF工具', url: 'https://creatikit.asia/gif-tool', description: 'GIF分解和合成器' },
      { '@type': 'SoftwareApplication', position: 14, name: 'SEO文本分析工具', url: 'https://creatikit.asia/text-analyzer', description: '专业SEO文本分析工具' },
      { '@type': 'SoftwareApplication', position: 15, name: '哈希计算器', url: 'https://creatikit.asia/hash-calculator', description: '计算MD5、SHA等多种哈希值' },
      { '@type': 'SoftwareApplication', position: 16, name: '时间戳转换器', url: 'https://creatikit.asia/timestamp-converter', description: 'Unix时间戳与日期时间转换' },
      { '@type': 'SoftwareApplication', position: 17, name: '天气预报工具', url: 'https://creatikit.asia/weather-tool', description: '实时天气与空气质量' },
      { '@type': 'SoftwareApplication', position: 18, name: '数据转图表工具', url: 'https://creatikit.asia/data-to-chart', description: '将数据转换为图表' },
      { '@type': 'SoftwareApplication', position: 19, name: '在线电子钢琴', url: 'https://creatikit.asia/piano', description: '在线弹奏钢琴' },
      { '@type': 'SoftwareApplication', position: 20, name: '交互式物理实验室', url: 'https://creatikit.asia/physics-lab', description: '模拟力学实验' },
      { '@type': 'SoftwareApplication', position: 21, name: '交互式化学实验室', url: 'https://creatikit.asia/chemistry-lab', description: '虚拟化学实验' },
      { '@type': 'SoftwareApplication', position: 22, name: '生物沙盒模拟', url: 'https://creatikit.asia/ecosystem-sandbox', description: '生态系统模拟' },
      { '@type': 'SoftwareApplication', position: 23, name: 'Emoji大全', url: 'https://creatikit.asia/emoji-collection', description: '浏览和复制表情符号' },
      { '@type': 'SoftwareApplication', position: 24, name: '隔空写字', url: 'https://creatikit.asia/camera-gesture-drawing', description: '手势空中书写' },
      { '@type': 'SoftwareApplication', position: 25, name: '代码工具', url: 'https://creatikit.asia/code-tools', description: '多种实用代码工具' },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: '首页', item: 'https://creatikit.asia' }],
  };

  const scripts = [
    { id: 'website-schema', schema: websiteSchema },
    { id: 'organization-schema', schema: organizationSchema },
    { id: 'software-application-schema', schema: softwareApplicationSchema },
    { id: 'item-list-schema', schema: itemListSchema },
    { id: 'breadcrumb-schema', schema: breadcrumbSchema },
  ];

  return (
    <>
      {scripts.map(({ id, schema }) => (
        <script
          key={id}
          id={id}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
