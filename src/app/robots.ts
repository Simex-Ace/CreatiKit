import { MetadataRoute } from 'next';

/**
 * 生成网站的robots.txt内容
 * 控制搜索引擎爬虫的访问权限和行为
 */
export default function robots(): MetadataRoute.Robots {
  // 获取站点的基础 URL
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://creatikit.asia' 
    : 'http://localhost:3000';

  return {
    // 定义爬虫规则
    rules: [
      {
        // 适用于所有搜索引擎爬虫
        userAgent: '*',
        // 允许访问网站的所有路径
        allow: '/',
        // 禁止访问开发/测试相关路径
        disallow: ['/api/', '/_next/', '/admin/'],
      },
      {
        // 针对Google爬虫的特殊规则
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    // 指向生成的站点地图URL
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}