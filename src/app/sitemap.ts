import { MetadataRoute } from 'next';

// 定义路由项的类型，确保类型安全
type RouteItem = {
  path: string;
  lastModified: Date;
  // 限制changeFrequency为Next.js支持的值
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

// 定义站点的所有路由
const routes: RouteItem[] = [
  { path: '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
  { path: '/compress', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/model-viewer', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/code-tools', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/markdown-editor', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  { path: '/color-palette', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  { path: '/text-analyzer', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { path: '/emoji-collection', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  { path: '/qr-code-generator', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // 获取站点的基础 URL，生产环境中会自动使用实际域名
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://creatikit.io' 
    : 'http://localhost:3000';

  // 将路由项转换为Next.js站点地图格式
  return routes.map((route) => ({
    // 构建完整的URL
    url: `${baseUrl}${route.path}`,
    // 最后修改时间
    lastModified: route.lastModified,
    // 更新频率
    changeFrequency: route.changeFrequency,
    // 优先级（0.0-1.0）
    priority: route.priority,
  }));
}