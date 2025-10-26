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
    rules: {
      // 适用于所有搜索引擎爬虫
      userAgent: '*',
      // 允许访问网站的所有路径
      allow: '/',
      // 这里可以根据需要添加disallow规则
      // disallow: '/private/'
    },
    // 指向生成的站点地图URL
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}