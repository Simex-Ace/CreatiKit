import { NextRequest, NextResponse } from 'next/server';

/**
 * 检测用户地理位置并返回推荐的语言
 * 根据IP地址判断用户所在国家，返回对应的语言代码
 */
// 标记为动态路由，因为使用了 request.headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 获取客户端IP地址
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || request.ip || '';

    // 如果没有IP，返回默认语言（英文）
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return NextResponse.json({ 
        locale: 'en',
        country: 'unknown',
        detected: false 
      });
    }

    // 使用免费的IP地理位置API（ipapi.co）
    // 也可以使用其他服务如 ip-api.com, ipgeolocation.io 等
    const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'CreatiKit-Locale-Detector/1.0'
      }
    });

    if (!geoResponse.ok) {
      // API失败时返回默认语言
      return NextResponse.json({ 
        locale: 'en',
        country: 'unknown',
        detected: false 
      });
    }

    const geoData = await geoResponse.json();

    // 根据国家代码判断语言
    let locale: 'zh-CN' | 'en' | 'ja-JP' | 'ko-KR' = 'en';
    const countryCode = geoData.country_code || '';
    const country = geoData.country_name || 'unknown';

    // 中国 -> 中文
    if (countryCode === 'CN' || countryCode === 'TW' || countryCode === 'HK' || countryCode === 'MO') {
      locale = 'zh-CN';
    }
    // 日本 -> 日文
    else if (countryCode === 'JP') {
      locale = 'ja-JP';
    }
    // 韩国 -> 韩文
    else if (countryCode === 'KR') {
      locale = 'ko-KR';
    }
    // 其他 -> 英文
    else {
      locale = 'en';
    }

    return NextResponse.json({
      locale,
      country,
      countryCode,
      detected: true,
      ip: ip.substring(0, 7) + '***' // 部分隐藏IP保护隐私
    });

  } catch (error) {
    console.error('Locale detection error:', error);
    // 出错时返回默认语言
    return NextResponse.json({ 
      locale: 'en',
      country: 'unknown',
      detected: false 
    });
  }
}

