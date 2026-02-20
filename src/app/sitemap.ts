import { MetadataRoute } from 'next';
import { locales, addLocaleToPath } from '@/lib/i18n-routing';
import { articles } from '@/content/articles';

// 定义路由项的类型，确保类型安全
type RouteItem = {
  path: string;
  lastModified: Date;
  // 限制changeFrequency为Next.js支持的值
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

// 定义站点的所有路由（不包含语言前缀）
const routes: RouteItem[] = [
  // 首页 - 最高优先级
  { path: '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  
  // 图片处理工具 - 高优先级（热门功能）
  { path: '/compress', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { path: '/background-remover', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  { path: '/pixel-art-generator', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/gif-tool', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  
  // 设计工具 - 高优先级
  { path: '/color-palette', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/qr-code-generator', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/whiteboard', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/svg-editor', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/css-animator', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/audio-visualizer', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/particle-editor', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  
  // 3D和预览工具
  { path: '/model-viewer', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  
  // 文本和代码工具
  { path: '/markdown-editor', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/code-tools', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/text-analyzer', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  
  // 实用工具
  { path: '/hash-calculator', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { path: '/timestamp-converter', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { path: '/weather-tool', lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  { path: '/data-to-chart', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  
  // 娱乐和教育工具
  { path: '/piano', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { path: '/physics-lab', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/chemistry-lab', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/ecosystem-sandbox', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/emoji-collection', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { path: '/camera-gesture-drawing', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },

  // 博客与原创文章（30 篇）
  { path: '/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ...articles.map((a) => ({
    path: `/blog/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  // 获取站点的基础 URL，生产环境中会自动使用实际域名
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://creatikit.asia' 
    : 'http://localhost:3000';

  // 为每个路由生成所有语言版本的URL
  // 这样每个语言版本都有独立的URL，有利于SEO
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  routes.forEach((route) => {
    locales.forEach((locale) => {
      const localizedPath = addLocaleToPath(route.path, locale);
      sitemapEntries.push({
        url: `${baseUrl}${localizedPath}`,
        lastModified: route.lastModified,
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    });
  });

  return sitemapEntries;
}

/**
 * SEO优化说明：
 * 
 * 1. Sitemap提交指南：
 *    - Google: https://search.google.com/search-console → Sitemaps → 添加 /sitemap.xml
 *    - 百度: https://ziyuan.baidu.com → 数据引入 → sitemap → 添加 https://creatikit.asia/sitemap.xml
 *    - Bing: https://www.bing.com/webmasters → Sitemaps → 提交 sitemap
 *    - Yandex: https://webmaster.yandex.com → 索引 → Sitemap文件
 *    - 搜狗: https://zhanzhang.sogou.com → 链接提交 → sitemap提交
 *    - 360: https://zhanzhang.so.com → 数据提交 → sitemap提交
 *    - 神马: https://zhanzhang.sm.cn → 链接提交 → sitemap提交
 *    - Naver: https://searchadvisor.naver.com → 网站地图
 * 
 * 2. 验证网站：
 *    - 在各搜索引擎站长平台验证网站所有权
 *    - 添加对应的验证码到 layout.tsx 的 verification 或 other 字段
 * 
 * 3. 定期更新：
 *    - 定期更新 sitemap 中的 lastModified 日期
 *    - 确保新页面及时添加到 routes 数组中
 * 
 * 4. 监控收录：
 *    - 定期检查各搜索引擎的收录情况
 *    - 使用各平台的索引覆盖率报告
 */