import { NextResponse } from 'next/server';

/**
 * 生成网站的robots.txt内容
 * 支持 Content-Signal 等自定义指令
 * 控制搜索引擎爬虫的访问权限和行为
 */
export async function GET() {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://creatikit.asia' 
    : 'http://localhost:3000';

  const robotsTxt = `# As a condition of accessing this website, you agree to abide by the following
# content signals:

# (a)  If a Content-Signal = yes, you may collect content for the corresponding
#      use.
# (b)  If a Content-Signal = no, you may not collect content for the
#      corresponding use.
# (c)  If the website operator does not include a Content-Signal for a
#      corresponding use, the website operator neither grants nor restricts
#      permission via Content-Signal with respect to the corresponding use.

# The content signals and their meanings are:

# search:   building a search index and providing search results (e.g., returning
#           hyperlinks and short excerpts from your website's contents). Search does not
#           include providing AI-generated search summaries.
# ai-input: inputting content into one or more AI models (e.g., retrieval
#           augmented generation, grounding, or other real-time taking of content for
#           generative AI search answers).
# ai-train: training or fine-tuning AI models.

# ANY RESTRICTIONS EXPRESSED VIA CONTENT SIGNALS ARE EXPRESS RESERVATIONS OF
# RIGHTS UNDER ARTICLE 4 OF THE EUROPEAN UNION DIRECTIVE 2019/790 ON COPYRIGHT
# AND RELATED RIGHTS IN THE DIGITAL SINGLE MARKET.

# BEGIN Cloudflare Managed content

User-agent: *
Content-Signal: search=yes,ai-train=no
Allow: /
Crawl-delay: 1

# ============================================
# 允许主流搜索引擎爬虫
# ============================================

# Google（全球最大搜索引擎）
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Mobile
Allow: /
Crawl-delay: 0

# Bing（微软搜索引擎，全球第二）
User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: msnbot
Allow: /
Crawl-delay: 1

# 百度（中国最大搜索引擎）
User-agent: Baiduspider
Allow: /
Crawl-delay: 1

User-agent: Baiduspider-image
Allow: /
Crawl-delay: 1

User-agent: Baiduspider-mobile
Allow: /
Crawl-delay: 1

# 搜狗（中国第二大搜索引擎）
User-agent: Sogou web spider
Allow: /
Crawl-delay: 1

User-agent: Sogou inst spider
Allow: /
Crawl-delay: 1

# 360搜索（中国）
User-agent: 360Spider
Allow: /
Crawl-delay: 1

User-agent: 360Spider-Image
Allow: /
Crawl-delay: 1

# 神马搜索（UC浏览器，中国移动端重要）
User-agent: YisouSpider
Allow: /
Crawl-delay: 1

# Yandex（俄罗斯及东欧最大搜索引擎）
User-agent: Yandex
Allow: /
Crawl-delay: 1

User-agent: YandexBot
Allow: /
Crawl-delay: 1

User-agent: YandexImages
Allow: /
Crawl-delay: 1

# Yahoo（日本及部分国家重要）
User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: Yahoo! Slurp
Allow: /
Crawl-delay: 1

User-agent: YahooSeeker
Allow: /
Crawl-delay: 1

# DuckDuckGo（隐私搜索引擎，欧美重要）
User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Naver（韩国最大搜索引擎）
User-agent: Yeti
Allow: /
Crawl-delay: 1

User-agent: NaverBot
Allow: /
Crawl-delay: 1

# Seznam（捷克最大搜索引擎）
User-agent: SeznamBot
Allow: /
Crawl-delay: 1

# Qwant（欧洲隐私搜索引擎）
User-agent: Qwantify
Allow: /
Crawl-delay: 1

# Ecosia（环保搜索引擎，欧洲重要）
User-agent: EcosiaBot
Allow: /
Crawl-delay: 1

# Startpage（隐私搜索引擎）
User-agent: StartpageBot
Allow: /
Crawl-delay: 1

# Facebook（社交媒体爬虫，有助于分享）
User-agent: facebookexternalhit
Allow: /
Crawl-delay: 1

User-agent: Facebot
Allow: /
Crawl-delay: 1

# Twitter（社交媒体爬虫）
User-agent: Twitterbot
Allow: /
Crawl-delay: 1

# LinkedIn（职业社交网络）
User-agent: LinkedInBot
Allow: /
Crawl-delay: 1

# Pinterest（图片社交网络）
User-agent: Pinterest
Allow: /
Crawl-delay: 1

User-agent: Pinterestbot
Allow: /
Crawl-delay: 1

# Telegram（即时通讯）
User-agent: TelegramBot
Allow: /
Crawl-delay: 1

# WhatsApp（即时通讯）
User-agent: WhatsApp
Allow: /
Crawl-delay: 1

# Apple（Siri和Spotlight搜索）
User-agent: Applebot
Allow: /
Crawl-delay: 1

# 其他重要爬虫
User-agent: AhrefsBot
Allow: /
Crawl-delay: 2

User-agent: SemrushBot
Allow: /
Crawl-delay: 2

# 禁止AI训练爬虫
User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /

User-agent: meta-externalagent
Disallow: /

# END Cloudflare Managed Content

# ============================================
# Sitemap 提交（帮助搜索引擎发现和索引网站）
# ============================================
Sitemap: ${baseUrl}/sitemap.xml

# 注意：建议在以下搜索引擎站长平台提交sitemap：
# - Google Search Console: https://search.google.com/search-console
# - 百度站长平台: https://ziyuan.baidu.com
# - Bing Webmaster Tools: https://www.bing.com/webmasters
# - Yandex Webmaster: https://webmaster.yandex.com
# - 搜狗站长平台: https://zhanzhang.sogou.com
# - 360站长平台: https://zhanzhang.so.com
# - 神马搜索站长平台: https://zhanzhang.sm.cn
# - Naver Webmaster: https://searchadvisor.naver.com
`;

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

