'use client';

import Script from 'next/script';

/**
 * 全站 Google AdSense 脚本
 *
 * 官方要求将以下代码放在每个页面的 <head> 中：
 *
 * <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2256987655997953"
 *      crossorigin="anonymous"></script>
 *
 * 这里通过 next/script 在 App Router 下统一注入，Next.js 会自动把脚本插入到 <head>。
 * 为避免开发环境报错，只在生产环境加载。
 */
export function GoogleAdsense() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2256987655997953"
      crossOrigin="anonymous"
      strategy="beforeInteractive" // 尽量贴近官方要求：在 <head> 中尽早加载
    />
  );
}

