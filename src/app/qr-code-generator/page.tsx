'use client';
import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Download, Share2, Link2, Calendar, MapPin, Mail, MessageSquare, Wifi, User, Settings, Check, RefreshCw, X } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

// 内容类型定义
type ContentType = 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'calendar' | 'location';

// 形状类型定义
type DotShape = 'square' | 'circle' | 'rounded' | 'diamond';
type EyeShape = 'square' | 'circle' | 'rounded';

// QR码配置接口
interface QRCodeConfig {
  content: {
    type: ContentType;
    text?: string;
    wifi: {
      ssid: string;
      password: string;
      encryption: 'WPA' | 'WEP' | 'none';
    };
    vcard: {
      name: string;
      phone: string;
      email: string;
      company: string;
      title: string;
      website: string;
    };
    email: {
      to: string;
      subject: string;
      body: string;
    };
    sms: {
      number: string;
      message: string;
    };
    calendar: {
      title: string;
      start: string;
      end: string;
      location: string;
    };
    location: {
      latitude: string;
      longitude: string;
      address: string;
    };
  };
  style: {
    fgColor: string;
    bgColor: string;
    useGradient: boolean;
    gradientColors: string[];
    gradientDirection: 'horizontal' | 'vertical' | 'diagonal';
    margin: number;
    errorCorrection: 'L' | 'M' | 'Q' | 'H';
    dotShape: DotShape;
    eyeShape: EyeShape;
  };
  logo: {
    url: string | null;
    size: number;
  };
  border: {
    enabled: boolean;
    width: number;
    color: string;
    radius: number;
  };
  caption: {
    enabled: boolean;
    text: string;
    fontSize: number;
    color: string;
  };
  shortUrl: {
    useShortUrl: boolean;
    originalUrl: string;
    shortUrl: string;
    isLoading: boolean;
  };
  download: {
    format: 'png' | 'svg';
    size: number;
  };
}

// 错误边界组件，用于捕获二维码生成错误
class QRCodeErrorBoundary extends React.Component<
  { children: React.ReactNode; t: (key: string) => string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; t: (key: string) => string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('QR Code generation error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <div className="mb-4 text-red-500">
            <X size={48} />
          </div>
          <h4 className="text-lg font-semibold text-red-600 mb-2">{this.props.t('qrCodeGeneratorPage.contentTooLong')}</h4>
          <p className="text-gray-600 mb-4">{this.props.t('qrCodeGeneratorPage.cannotGenerate')}</p>
          <Button 
            variant="secondary" 
            onClick={() => this.setState({ hasError: false })}
          >
            {this.props.t('qrCodeGeneratorPage.retry')}
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

const QRCodeGenerator: React.FC = () => {
  const { t } = useI18n();
  // QR码最大内容长度限制（根据不同纠错级别，这里取保守的值1800字符以确保安全）
  const MAX_QR_CONTENT_LENGTH = 1800;
  // 单个字段的最大长度限制
  const MAX_FIELD_LENGTH = 1000;
  
  const [config, setConfig] = useState<QRCodeConfig>({
    content: {
      type: 'text',
      text: '',
      wifi: {
        ssid: '',
        password: '',
        encryption: 'WPA',
      },
      vcard: {
        name: '',
        phone: '',
        email: '',
        company: '',
        title: '',
        website: '',
      },
      email: {
        to: '',
        subject: '',
        body: '',
      },
      sms: {
        number: '',
        message: '',
      },
      calendar: {
        title: '',
        start: '',
        end: '',
        location: '',
      },
      location: {
        latitude: '',
        longitude: '',
        address: '',
      },
    },
    style: {
      fgColor: '#000000',
      bgColor: '#FFFFFF',
      useGradient: false,
      gradientColors: ['#000000', '#444444'],
      gradientDirection: 'horizontal',
      margin: 4,
      errorCorrection: 'M',
      dotShape: 'rounded',
      eyeShape: 'rounded',
    },
    logo: {
      url: null,
      size: 30,
    },
    border: {
      enabled: false,
      width: 10,
      color: '#FFFFFF',
      radius: 8,
    },
    caption: {
      enabled: false,
      text: '扫码关注我们',
      fontSize: 16,
      color: '#000000',
    },
    shortUrl: {
      useShortUrl: false,
      originalUrl: '',
      shortUrl: '',
      isLoading: false,
    },
    download: {
      format: 'png',
      size: 512,
    },
  });

  const qrCodeRef = useRef<HTMLCanvasElement>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showTruncationAlert, setShowTruncationAlert] = useState(false);
  const truncationAlertTimeout = useRef<NodeJS.Timeout>();

  // 显示截断提示
  const showTruncationMessage = () => {
    setShowTruncationAlert(true);
    
    // 清除之前的定时器
    if (truncationAlertTimeout.current) {
      clearTimeout(truncationAlertTimeout.current);
    }
    
    // 3秒后自动隐藏提示
    truncationAlertTimeout.current = setTimeout(() => {
      setShowTruncationAlert(false);
    }, 3000);
  };
  
  // 检查并截断内容
  const checkAndTruncate = (content: string, maxLength: number = MAX_QR_CONTENT_LENGTH): string => {
    if (content.length > maxLength) {
      showTruncationMessage();
      return content.substring(0, maxLength);
    }
    return content;
  };
  
  // 生成QR码内容
  useEffect(() => {
    const content = generateQRContent();
    const safeContent = checkAndTruncate(content);
    setGeneratedContent(safeContent);
    
    // 组件卸载时清除定时器
    return () => {
      if (truncationAlertTimeout.current) {
        clearTimeout(truncationAlertTimeout.current);
      }
    };
  }, [config]);

  const generateQRContent = (): string => {
    // 先生成原始内容
    let content = '';
    
    switch (config.content.type) {
      case 'text':
        if (config.content.text?.startsWith('http') && config.shortUrl.useShortUrl && config.shortUrl.shortUrl) {
          content = config.shortUrl.shortUrl;
        } else {
          content = config.content.text || '';
        }
        break;
      
      case 'wifi':
        const { ssid, password, encryption } = config.content.wifi;
        // 对WiFi字段中的特殊字符进行转义，特别是分号
        content = `WIFI:S:${ssid.replace(/;/g, '\\;')};T:${encryption};P:${password.replace(/;/g, '\\;')};H:false;;`;
        break;
      
      case 'vcard':
        const { name, phone, email, company, title, website } = config.content.vcard;
        // vCard格式需要特殊处理，某些特殊字符需要转义
        content = `BEGIN:VCARD\nVERSION:3.0\nN:${name.replace(/[\\,;]/g, '\\$&')}\nTEL:${phone.replace(/[\\,;]/g, '\\$&')}\nEMAIL:${email.replace(/[\\,;]/g, '\\$&')}\nORG:${company.replace(/[\\,;]/g, '\\$&')}\nTITLE:${title.replace(/[\\,;]/g, '\\$&')}\nURL:${website}\nEND:VCARD`;
        break;
      
      case 'email':
        const { to, subject, body } = config.content.email;
        // 对收件人地址也进行编码，确保特殊字符正确处理
        content = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        break;
      
      case 'sms':
        const { number, message } = config.content.sms;
        // 对于电话号码，特别是包含+号的国际号码，使用更兼容的格式
        // 保留原始格式但确保+号被正确处理
        const formattedNumber = number.replace(/\+/g, '%2B');
        content = `smsto:${formattedNumber}?body=${encodeURIComponent(message)}`;
        break;
      
      case 'calendar':
        const { title: eventTitle, start, end, location: eventLocation } = config.content.calendar;
        // iCalendar格式中特殊字符需要转义
        const escapeICal = (text: string) => text.replace(/[\\,;\n]/g, '\\$&');
        content = `BEGIN:VEVENT\nSUMMARY:${escapeICal(eventTitle)}\nDTSTART:${start.replace(/[-:]/g, '')}Z\nDTEND:${end.replace(/[-:]/g, '')}Z\nLOCATION:${escapeICal(eventLocation)}\nEND:VEVENT`;
        break;
      
      case 'location':
        const { latitude, longitude } = config.content.location;
        content = `geo:${latitude},${longitude}`;
        break;
      
      default:
        return '';
    }
    
    // 确保最终内容不超过限制
    return checkAndTruncate(content);
  };

  // 更新内容类型
  const updateContentType = (type: ContentType) => {
    setConfig(prev => ({ ...prev, content: { ...prev.content, type } }));
  };

  // 更新内容字段
  const updateContentField = (field: string, value: string) => {
    // 对所有内容字段都进行长度检查，防止超长内容
    let safeValue = checkAndTruncate(value, MAX_FIELD_LENGTH);
    
    setConfig(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: safeValue,
      },
    }));
  };

  // 更新嵌套内容字段
  const updateNestedContentField = (section: string, field: string, value: string) => {
    // 对所有嵌套字段都进行长度检查，防止超长内容
    let safeValue = checkAndTruncate(value, MAX_FIELD_LENGTH);
    
    setConfig(prev => {
      const contentSection = prev.content[section as keyof typeof prev.content];
      // 检查是否是对象类型
      if (typeof contentSection === 'object' && contentSection !== null) {
        return {
          ...prev,
          content: {
            ...prev.content,
            [section]: {
              ...contentSection,
              [field]: safeValue,
            },
          },
        };
      }
      // 非对象类型直接更新
      return prev;
    });
  };

  // 更新样式
  const updateStyle = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      style: {
        ...prev.style,
        [field]: value,
      },
    }));
  };

  // 实现二维码形状定制和边距设置
  const getQRCodeContainerStyle = () => {
    // 基础容器样式
    const styles: React.CSSProperties = {
      position: 'relative',
      display: 'inline-block',
      backgroundColor: config.style.bgColor,
      // 应用边距设置
      padding: `${config.style.margin}px`,
      // 确保容器能正确显示形状效果
      overflow: 'hidden',
    };
    
    return styles;
  };
  
  // 为QR码内容添加形状效果的样式
  const getQRCodeContentStyle = () => {
    const styles: React.CSSProperties = {};
    
    // 根据码点形状添加样式效果
    if (config.style.dotShape === 'circle') {
      // 对于圆形码点，我们需要特殊处理
      styles.filter = 'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"rounded\"%3E%3CfeGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2\" result=\"blur\"/%3E%3CfeThreshold in=\"blur\" threshold=\"0.5\" result=\"mask\"/%3E%3CfeComposite in=\"SourceGraphic\" in2=\"mask\" operator=\"in\"/%3E%3C/filter%3E%3C/svg%3E#rounded")';
    } else if (config.style.dotShape === 'rounded') {
      // 对于圆角码点，使用CSS border-radius
      styles.borderRadius = '25%';
    } else if (config.style.dotShape === 'diamond') {
      // 对于菱形码点，使用CSS变换
      styles.transform = 'rotate(45deg)';
      styles.transformOrigin = 'center';
    }
    
    return styles;
  };

  // 简化的选项函数，直接使用qrcode.react支持的属性
  const customizeQROptions = () => {
    return {
      // qrcode.react库直接支持margin属性
      margin: 0, // 我们使用容器的padding来控制边距，所以这里设为0
    };
  };

  // 更新短链接配置
  const updateShortUrl = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      shortUrl: {
        ...prev.shortUrl,
        [field]: value,
      },
    }));
  };

  // 生成短链接
  const generateShortUrl = async () => {
    const urlText = config.content.text;
    if (!urlText || !urlText.startsWith('http')) return;
    
    // 检查URL长度，避免过长的URL导致API请求失败
    if (urlText.length > 2000) {
      alert(t('qrCodeGeneratorPage.urlTooLong'));
      return;
    }
    
    setConfig(prev => ({
      ...prev,
      shortUrl: {
        ...prev.shortUrl,
        isLoading: true,
        originalUrl: urlText,
        error: null,
      },
    }));

    try {
      // 尝试 is.gd API
      const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(urlText)}`);
      const data = await response.json();
      
      if (data.shorturl) {
        setConfig(prev => ({
          ...prev,
          shortUrl: {
            ...prev.shortUrl,
            shortUrl: data.shorturl,
            isLoading: false,
          },
        }));
        return;
      }
      
      // 如果 is.gd 失败，尝试 tinyurl
      const tinyUrlResponse = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(urlText)}`);
      const shortUrl = await tinyUrlResponse.text();
      
      setConfig(prev => ({
        ...prev,
        shortUrl: {
          ...prev.shortUrl,
          shortUrl,
          isLoading: false,
        },
      }));
    } catch (error) {
      console.error('生成短链接失败:', error);
      setConfig(prev => ({
        ...prev,
        shortUrl: {
          ...prev.shortUrl,
          isLoading: false,
          error: '短链接生成失败，请稍后重试',
        },
      }));
      
      // 显示友好的错误提示而不是模拟链接
      alert(t('qrCodeGeneratorPage.shortUrlFailed'));
    }
  };

  // 处理Logo上传
  const handleLogoUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert(t('qrCodeGeneratorPage.uploadImageFile'));
      return;
    }
    
    if (file.size > 1024 * 1024) {
      alert(t('qrCodeGeneratorPage.imageSizeExceeded'));
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setConfig(prev => ({
        ...prev,
        logo: {
          ...prev.logo,
          url: e.target?.result as string,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  // 移除Logo
  const removeLogo = () => {
    setConfig(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        url: null,
      },
    }));
  };

  // 下载QR码
  const downloadQRCode = () => {
    const canvas = qrCodeRef.current;
    if (!canvas) return;
    
    if (config.download.format === 'png') {
      // 创建一个新的canvas用于添加边框和文字
      const newCanvas = document.createElement('canvas');
      const borderWidth = config.border.enabled ? config.border.width : 0;
      const totalWidth = canvas.width + borderWidth * 2;
      const totalHeight = canvas.height + borderWidth * 2 + (config.caption.enabled ? 50 : 0);
      
      newCanvas.width = totalWidth;
      newCanvas.height = totalHeight;
      
      const ctx = newCanvas.getContext('2d');
      if (!ctx) return;
      
      // 绘制背景
      ctx.fillStyle = config.border.enabled ? config.border.color : config.style.bgColor;
      ctx.fillRect(0, 0, totalWidth, totalHeight);
      
      // 绘制QR码
      ctx.drawImage(canvas, borderWidth, borderWidth);
      
      // 绘制说明文字
      if (config.caption.enabled) {
        ctx.fillStyle = config.caption.color;
        ctx.font = `${config.caption.fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(config.caption.text, totalWidth / 2, totalHeight - 15);
      }
      
      // 下载
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.png`;
      link.href = newCanvas.toDataURL('image/png');
      link.click();
    } else {
      // SVG格式下载
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const borderWidth = config.border.enabled ? config.border.width : 0;
      const totalWidth = 512 + borderWidth * 2;
      const totalHeight = 512 + borderWidth * 2 + (config.caption.enabled ? 50 : 0);
      
      svg.setAttribute('width', totalWidth.toString());
      svg.setAttribute('height', totalHeight.toString());
      
      // 背景
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('fill', config.border.enabled ? config.border.color : config.style.bgColor);
      svg.appendChild(rect);
      
      // 添加QR码图片
      const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      img.setAttribute('x', borderWidth.toString());
      img.setAttribute('y', borderWidth.toString());
      img.setAttribute('width', '512');
      img.setAttribute('height', '512');
      img.setAttribute('href', canvas.toDataURL('image/png'));
      svg.appendChild(img);
      
      // 添加说明文字
      if (config.caption.enabled) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', (totalWidth / 2).toString());
        text.setAttribute('y', (totalHeight - 15).toString());
        text.setAttribute('font-size', config.caption.fontSize.toString());
        text.setAttribute('fill', config.caption.color);
        text.setAttribute('text-anchor', 'middle');
        text.textContent = config.caption.text;
        svg.appendChild(text);
      }
      
      // 下载
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `qrcode-${Date.now()}.svg`;
      link.href = url;
      link.click();
      
      // 清理
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">{t('qrCodeGeneratorPage.title')}</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 配置面板 */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="content">{t('qrCodeGeneratorPage.tabContent')}</TabsTrigger>
                <TabsTrigger value="style">{t('qrCodeGeneratorPage.tabStyle')}</TabsTrigger>
                <TabsTrigger value="logo">{t('qrCodeGeneratorPage.tabLogo')}</TabsTrigger>
                <TabsTrigger value="download">{t('qrCodeGeneratorPage.tabDownload')}</TabsTrigger>
              </TabsList>
              
              {/* 内容设置 */}
              <TabsContent value="content" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.selectContentType')}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {[
                      { value: 'text', label: t('qrCodeGeneratorPage.textUrl'), icon: <Link2 size={18} /> },
                      { value: 'wifi', label: t('qrCodeGeneratorPage.wifi'), icon: <Wifi size={18} /> },
                      { value: 'vcard', label: t('qrCodeGeneratorPage.vcard'), icon: <User size={18} /> },
                      { value: 'email', label: t('qrCodeGeneratorPage.email'), icon: <Mail size={18} /> },
                      { value: 'sms', label: t('qrCodeGeneratorPage.sms'), icon: <MessageSquare size={18} /> },
                      { value: 'calendar', label: t('qrCodeGeneratorPage.calendar'), icon: <Calendar size={18} /> },
                      { value: 'location', label: t('qrCodeGeneratorPage.location'), icon: <MapPin size={18} /> },
                    ].map((item) => (
                      <Button
                        key={item.value}
                        variant={config.content.type === item.value ? 'default' : 'secondary'}
                        onClick={() => updateContentType(item.value as ContentType)}
                        className="flex flex-col items-center justify-center gap-2 h-24"
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* 文本/网址内容 */}
                {config.content.type === 'text' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text-content">{t('qrCodeGeneratorPage.inputTextUrl')}</Label>
                      <Input
                        id="text-content"
                        value={config.content.text || ''}
                        onChange={(e) => updateContentField('text', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.inputTextUrlPlaceholder')}
                      />
                    </div>
                    {config.content.text?.startsWith('http') && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            id="short-url-switch"
                            type="checkbox"
                            checked={config.shortUrl.useShortUrl}
                            onChange={(e) => updateShortUrl('useShortUrl', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Label htmlFor="short-url-switch">{t('qrCodeGeneratorPage.useShortUrl')}</Label>
                        </div>
                        <Button
                          onClick={generateShortUrl}
                          disabled={config.shortUrl.isLoading || !config.content.text}
                          size="sm"
                        >
                          {config.shortUrl.isLoading ? t('qrCodeGeneratorPage.generatingShortUrl') : t('qrCodeGeneratorPage.generateShortUrl')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Wi-Fi内容 */}
                {config.content.type === 'wifi' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="wifi-ssid">{t('qrCodeGeneratorPage.wifiSSID')}</Label>
                      <Input
                        id="wifi-ssid"
                        value={config.content.wifi.ssid}
                        onChange={(e) => updateNestedContentField('wifi', 'ssid', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.wifiSSIDPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wifi-password">{t('qrCodeGeneratorPage.wifiPassword')}</Label>
                      <Input
                        id="wifi-password"
                        value={config.content.wifi.password}
                        onChange={(e) => updateNestedContentField('wifi', 'password', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.wifiPasswordPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="wifi-encryption">{t('qrCodeGeneratorPage.wifiEncryption')}</Label>
                      <div className="custom-select-wrapper ml-2">
                        <select
                          id="wifi-encryption"
                          value={config.content.wifi.encryption}
                          onChange={(e) => updateNestedContentField('wifi', 'encryption', e.target.value as 'WPA' | 'WEP' | 'none')}
                          className="w-full h-9 px-3 py-2 text-sm bg-gray-50 text-gray-800 border border-gray-200 rounded-md transition-all hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:1.25rem] pr-9"
                        >
                          <option value="WPA">{t('qrCodeGeneratorPage.wifiWPA')}</option>
                          <option value="WEP">{t('qrCodeGeneratorPage.wifiWEP')}</option>
                          <option value="none">{t('qrCodeGeneratorPage.wifiNone')}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 电子名片内容 */}
                {config.content.type === 'vcard' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="vcard-name">{t('qrCodeGeneratorPage.vcardName')}</Label>
                      <Input
                        id="vcard-name"
                        value={config.content.vcard.name}
                        onChange={(e) => updateNestedContentField('vcard', 'name', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.vcardNamePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vcard-phone">{t('qrCodeGeneratorPage.vcardPhone')}</Label>
                      <Input
                        id="vcard-phone"
                        value={config.content.vcard.phone}
                        onChange={(e) => updateNestedContentField('vcard', 'phone', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.vcardPhonePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vcard-email">{t('qrCodeGeneratorPage.vcardEmail')}</Label>
                      <Input
                        id="vcard-email"
                        value={config.content.vcard.email}
                        onChange={(e) => updateNestedContentField('vcard', 'email', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.vcardEmailPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vcard-company">{t('qrCodeGeneratorPage.vcardCompany')}</Label>
                      <Input
                        id="vcard-company"
                        value={config.content.vcard.company}
                        onChange={(e) => updateNestedContentField('vcard', 'company', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.vcardCompanyPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vcard-title">{t('qrCodeGeneratorPage.vcardTitle')}</Label>
                      <Input
                        id="vcard-title"
                        value={config.content.vcard.title}
                        onChange={(e) => updateNestedContentField('vcard', 'title', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.vcardTitlePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vcard-website">{t('qrCodeGeneratorPage.vcardWebsite')}</Label>
                      <Input
                        id="vcard-website"
                        value={config.content.vcard.website}
                        onChange={(e) => updateNestedContentField('vcard', 'website', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.vcardWebsitePlaceholder')}
                      />
                    </div>
                  </div>
                )}
                
                {/* 邮件内容 */}
                {config.content.type === 'email' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-to">{t('qrCodeGeneratorPage.emailTo')}</Label>
                      <Input
                        id="email-to"
                        type="email"
                        value={config.content.email.to}
                        onChange={(e) => updateNestedContentField('email', 'to', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.emailToPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">{t('qrCodeGeneratorPage.emailSubject')}</Label>
                      <Input
                        id="email-subject"
                        value={config.content.email.subject}
                        onChange={(e) => updateNestedContentField('email', 'subject', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.emailSubjectPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-body">{t('qrCodeGeneratorPage.emailBody')}</Label>
                      <textarea
                        id="email-body"
                        value={config.content.email.body}
                        onChange={(e) => updateNestedContentField('email', 'body', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.emailBodyPlaceholder')}
                        className="min-h-24 resize-y w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {/* 短信内容 */}
                {config.content.type === 'sms' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sms-number">{t('qrCodeGeneratorPage.smsNumber')}</Label>
                      <Input
                        id="sms-number"
                        value={config.content.sms.number}
                        onChange={(e) => updateNestedContentField('sms', 'number', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.smsNumberPlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sms-message">{t('qrCodeGeneratorPage.smsMessage')}</Label>
                      <textarea
                        id="sms-message"
                        value={config.content.sms.message}
                        onChange={(e) => updateNestedContentField('sms', 'message', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.smsMessagePlaceholder')}
                        className="min-h-24 resize-y w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                )}
                
                {/* 日历内容 */}
                {config.content.type === 'calendar' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="calendar-title">{t('qrCodeGeneratorPage.calendarTitle')}</Label>
                      <Input
                        id="calendar-title"
                        value={config.content.calendar.title}
                        onChange={(e) => updateNestedContentField('calendar', 'title', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.calendarTitlePlaceholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calendar-start">{t('qrCodeGeneratorPage.calendarStart')}</Label>
                      <Input
                        id="calendar-start"
                        type="datetime-local"
                        value={config.content.calendar.start}
                        onChange={(e) => updateNestedContentField('calendar', 'start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calendar-end">{t('qrCodeGeneratorPage.calendarEnd')}</Label>
                      <Input
                        id="calendar-end"
                        type="datetime-local"
                        value={config.content.calendar.end}
                        onChange={(e) => updateNestedContentField('calendar', 'end', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calendar-location">{t('qrCodeGeneratorPage.calendarLocation')}</Label>
                      <Input
                        id="calendar-location"
                        value={config.content.calendar.location}
                        onChange={(e) => updateNestedContentField('calendar', 'location', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.calendarLocationPlaceholder')}
                      />
                    </div>
                  </div>
                )}
                
                {/* 位置内容 */}
                {config.content.type === 'location' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location-latitude">{t('qrCodeGeneratorPage.locationLatitude')}</Label>
                      <Input
                        id="location-latitude"
                        value={config.content.location.latitude}
                        onChange={(e) => updateNestedContentField('location', 'latitude', e.target.value)}
                        placeholder="예: 39.9042"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location-longitude">{t('qrCodeGeneratorPage.locationLongitude')}</Label>
                      <Input
                        id="location-longitude"
                        value={config.content.location.longitude}
                        onChange={(e) => updateNestedContentField('location', 'longitude', e.target.value)}
                        placeholder="예: 116.4074"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location-address">{t('qrCodeGeneratorPage.locationAddress')}</Label>
                      <Input
                        id="location-address"
                        value={config.content.location.address}
                        onChange={(e) => updateNestedContentField('location', 'address', e.target.value)}
                        placeholder={t('qrCodeGeneratorPage.locationAddressPlaceholder')}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* 样式设置 */}
              <TabsContent value="style" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.colorSettings')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          id="gradient-switch"
                          type="checkbox"
                          checked={config.style.useGradient}
                          onChange={(e) => updateStyle('useGradient', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="gradient-switch">{t('qrCodeGeneratorPage.useGradient')}</Label>
                      </div>
                    </div>
                    
                    {!config.style.useGradient && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fg-color">{t('qrCodeGeneratorPage.foregroundColor')}</Label>
                          <Input
                            id="fg-color"
                            type="color"
                            value={config.style.fgColor}
                            onChange={(e) => updateStyle('fgColor', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bg-color">{t('qrCodeGeneratorPage.backgroundColor')}</Label>
                          <Input
                            id="bg-color"
                            type="color"
                            value={config.style.bgColor}
                            onChange={(e) => updateStyle('bgColor', e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                    
                    {config.style.useGradient && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gradient-color-1">{t('qrCodeGeneratorPage.gradientColor1')}</Label>
                          <Input
                            id="gradient-color-1"
                            type="color"
                            value={config.style.gradientColors[0]}
                            onChange={(e) => updateStyle('gradientColors', [e.target.value, config.style.gradientColors[1]])}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gradient-color-2">{t('qrCodeGeneratorPage.gradientColor2')}</Label>
                          <Input
                            id="gradient-color-2"
                            type="color"
                            value={config.style.gradientColors[1]}
                            onChange={(e) => updateStyle('gradientColors', [config.style.gradientColors[0], e.target.value])}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label htmlFor="gradient-direction">{t('qrCodeGeneratorPage.gradientDirection')}</Label>
                          <div className="custom-select-wrapper">
                            <select
                              id="gradient-direction"
                              value={config.style.gradientDirection}
                              onChange={(e) => updateStyle('gradientDirection', e.target.value as 'horizontal' | 'vertical' | 'diagonal')}
                              className="w-full h-9 px-3 py-2 text-sm bg-gray-50 text-gray-800 border border-gray-200 rounded-md transition-all hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:1.25rem] pr-9"
                            >
                              <option value="horizontal">{t('qrCodeGeneratorPage.horizontal')}</option>
                              <option value="vertical">{t('qrCodeGeneratorPage.vertical')}</option>
                              <option value="diagonal">{t('qrCodeGeneratorPage.diagonal')}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.errorCorrectionLevel')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-x-6">
                      <Label htmlFor="error-correction">{t('qrCodeGeneratorPage.errorCorrection')}</Label>
                      <div className="custom-select-wrapper">
                        <select
                          id="error-correction"
                          value={config.style.errorCorrection}
                          onChange={(e) => updateStyle('errorCorrection', e.target.value as 'L' | 'M' | 'Q' | 'H')}
                          className="w-32 h-9 px-3 py-2 text-sm bg-gray-50 text-gray-800 border border-gray-200 rounded-md transition-all hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:1.25rem] pr-9"
                        >
                          <option value="L">{t('qrCodeGeneratorPage.errorCorrectionL')}</option>
                          <option value="M">{t('qrCodeGeneratorPage.errorCorrectionM')}</option>
                          <option value="Q">{t('qrCodeGeneratorPage.errorCorrectionQ')}</option>
                          <option value="H">{t('qrCodeGeneratorPage.errorCorrectionH')}</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('qrCodeGeneratorPage.errorCorrectionDesc')}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="margin-slider">{t('qrCodeGeneratorPage.margin')}</Label>
                    <span className="text-sm font-medium">{config.style.margin}px</span>
                  </div>
                  <Slider
                    id="margin-slider"
                    value={[config.style.margin]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={(value) => updateStyle('margin', value[0])}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.shapeCustomization')}</h3>
                  <div className="space-y-4">
                    <div className="space-y-4">
                          <Label htmlFor="dot-shape" className="mr-4">{t('qrCodeGeneratorPage.dotShape')}</Label>
                      <div className="custom-select-wrapper">
                        <select
                          id="dot-shape"
                          value={config.style.dotShape}
                          onChange={(e) => updateStyle('dotShape', e.target.value as DotShape)}
                          className="w-full h-9 px-3 py-2 text-sm bg-gray-50 text-gray-800 border border-gray-200 rounded-md transition-all hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:1.25rem] pr-9"
                        >
                          <option value="square">{t('qrCodeGeneratorPage.square')}</option>
                          <option value="rounded">{t('qrCodeGeneratorPage.rounded')}</option>
                        </select>
                      </div>
                    </div>
                    

                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.borderSettings')}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="border-switch"
                        type="checkbox"
                        checked={config.border.enabled}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          border: {
                            ...prev.border,
                            enabled: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="border-switch">{t('qrCodeGeneratorPage.addBorder')}</Label>
                    </div>
                  </div>
                  
                  {config.border.enabled && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="border-width">{t('qrCodeGeneratorPage.borderWidth')}</Label>
                        <span className="text-sm font-medium">{config.border.width}px</span>
                      </div>
                      <Slider
                        id="border-width"
                        value={[config.border.width]}
                        min={0}
                        max={50}
                        step={1}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          border: {
                            ...prev.border,
                            width: value[0]
                          }
                        }))}
                      />
                      
                      <div className="space-y-2">
                        <Label htmlFor="border-color">{t('qrCodeGeneratorPage.borderColor')}</Label>
                        <Input
                          id="border-color"
                          type="color"
                          value={config.border.color}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            border: {
                              ...prev.border,
                              color: e.target.value
                            }
                          }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="border-radius">{t('qrCodeGeneratorPage.borderRadius')}</Label>
                        <span className="text-sm font-medium">{config.border.radius}px</span>
                      </div>
                      <Slider
                        id="border-radius"
                        value={[config.border.radius]}
                        min={0}
                        max={20}
                        step={1}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          border: {
                            ...prev.border,
                            radius: value[0]
                          }
                        }))}
                      />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.captionSettings')}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <input
                        id="caption-switch"
                        type="checkbox"
                        checked={config.caption.enabled}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          caption: {
                            ...prev.caption,
                            enabled: e.target.checked
                          }
                        }))}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="caption-switch">{t('qrCodeGeneratorPage.enableCaption')}</Label>
                    </div>
                  </div>
                  
                  {config.caption.enabled && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="caption-text">{t('qrCodeGeneratorPage.captionText')}</Label>
                        <Input
                          id="caption-text"
                          value={config.caption.text}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            caption: {
                              ...prev.caption,
                              text: e.target.value
                            }
                          }))}
                          placeholder={t('qrCodeGeneratorPage.captionTextPlaceholder')}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="caption-font-size">{t('qrCodeGeneratorPage.captionFontSize')}</Label>
                        <span className="text-sm font-medium">{config.caption.fontSize}px</span>
                      </div>
                      <Slider
                        id="caption-font-size"
                        value={[config.caption.fontSize]}
                        min={8}
                        max={36}
                        step={1}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          caption: {
                            ...prev.caption,
                            fontSize: value[0]
                          }
                        }))}
                      />
                      
                      <div className="space-y-2">
                        <Label htmlFor="caption-color">{t('qrCodeGeneratorPage.captionTextColor')}</Label>
                        <Input
                          id="caption-color"
                          type="color"
                          value={config.caption.color}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            caption: {
                              ...prev.caption,
                              color: e.target.value
                            }
                          }))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Logo设置 */}
              <TabsContent value="logo" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.tabLogo')}</h3>
                  
                  {!config.logo.url ? (
                    <div className="space-y-2">
                      <Label htmlFor="logo-upload">{t('qrCodeGeneratorPage.logoUpload')}</Label>
                      <div className="flex space-x-2">
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleLogoUpload(Array.from(e.target.files));
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                      <p className="text-xs text-gray-500">{t('qrCodeGeneratorPage.logoUploadHint')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <img
                          src={config.logo.url}
                          alt="Logo"
                          className="max-w-32 max-h-32 object-contain"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="logo-size">{t('qrCodeGeneratorPage.logoSize')}</Label>
                        <span className="text-sm font-medium">{config.logo.size}%</span>
                      </div>
                      <Slider
                        id="logo-size"
                        value={[config.logo.size]}
                        min={10}
                        max={50}
                        step={1}
                        onValueChange={(value) => setConfig(prev => ({
                          ...prev,
                          logo: {
                            ...prev.logo,
                            size: value[0]
                          }
                        }))}
                      />
                      
                      <Button
                        variant="destructive"
                        onClick={removeLogo}
                        className="w-full"
                      >
                        {t('qrCodeGeneratorPage.removeLogo')}
                      </Button>
                    </div>
                  )}
                  
                  <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      <strong>{t('qrCodeGeneratorPage.logoHint')}：</strong> {t('qrCodeGeneratorPage.logoHintText')}
                    </p>
                    <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
                      <li>{t('qrCodeGeneratorPage.logoHint1')}</li>
                      <li>{t('qrCodeGeneratorPage.logoHint2')}</li>
                      <li>{t('qrCodeGeneratorPage.logoHint3')}</li>
                      <li>{t('qrCodeGeneratorPage.logoHint4')}</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              {/* 下载设置 */}
              <TabsContent value="download" className="space-y-6 pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('qrCodeGeneratorPage.tabDownload')}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label htmlFor="download-format" className="mr-4">{t('qrCodeGeneratorPage.downloadFormat')}</Label>
                          <div className="mt-3 custom-select-wrapper">
                        <select
                          id="download-format"
                          value={config.download.format}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            download: {
                              ...prev.download,
                              format: e.target.value as 'png' | 'svg'
                            }
                          }))}
                          className="w-full h-9 px-3 py-2 text-sm bg-gray-50 text-gray-800 border border-gray-200 rounded-md transition-all hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:1.25rem] pr-9"
                        >
                          <option value="png">{t('qrCodeGeneratorPage.downloadFormatPNG')}</option>
                          <option value="svg">{t('qrCodeGeneratorPage.downloadFormatSVG')}</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="download-size" className="mr-4">{t('qrCodeGeneratorPage.downloadSize')}</Label>
                          <div className="mt-3 custom-select-wrapper">
                        <select
                          id="download-size"
                          value={config.download.size}
                          onChange={(e) => setConfig(prev => ({
                            ...prev,
                            download: {
                              ...prev.download,
                              size: parseInt(e.target.value)
                            }
                          }))}
                          className="w-full h-9 px-3 py-2 text-sm bg-gray-50 text-gray-800 border border-gray-200 rounded-md transition-all hover:border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3e%3cpolyline points=%226 9 12 15 18 9%3e%3c/polyline%3e%3c/svg%3e')] bg-no-repeat bg-right bg-[length:1.25rem] pr-9"
                        >
                          <option value="256">256px</option>
                          <option value="512">512px</option>
                          <option value="1024">1024px</option>
                          <option value="2048">2048px</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <strong>{t('qrCodeGeneratorPage.downloadSuggestion')}：</strong>
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                      <li>{t('qrCodeGeneratorPage.downloadSuggestion1')}</li>
                      <li>{t('qrCodeGeneratorPage.downloadSuggestion2')}</li>
                      <li>{t('qrCodeGeneratorPage.downloadSuggestion3')}</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* 预览面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 截断提示 */}
            {showTruncationAlert && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm animate-fadeIn">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 text-sm text-yellow-700">
                  <p>内容超过最大长度限制，已自动截断。</p>
                </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-6 text-center">{t('qrCodeGeneratorPage.qrCodePreview')}</h3>
              
              <div className="flex justify-center mb-6">
                <QRCodeErrorBoundary t={t}>
                  <div style={{ 
                    backgroundColor: config.border.enabled ? config.border.color : 'white',
                    padding: config.border.enabled ? config.border.width : '16px',
                    borderRadius: config.border.enabled ? config.border.radius : '8px',
                    position: 'relative',
                    display: 'inline-block',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease'
                  }}>
                      {/* 应用边距的容器 */}
                      <div style={{
                        padding: `${config.style.margin}px`,
                        backgroundColor: config.style.bgColor,
                        display: 'inline-block',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {generatedContent && (
                          <div style={{
                            // 根据选择的形状应用不同的样式
                            display: 'inline-block',
                            ...(config.style.dotShape === 'rounded' && {
                              borderRadius: '10px',
                              overflow: 'hidden',
                              filter: 'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"rounded-corners\"%3E%3CfeGaussianBlur in=\"SourceGraphic\" stdDeviation=\"1.5\" result=\"blur\"/%3E%3CfeThreshold in=\"blur\" threshold=\"0.6\" result=\"mask\"/%3E%3CfeComposite in=\"SourceGraphic\" in2=\"mask\" operator=\"in\"/%3E%3C/filter%3E%3C/svg%3E#rounded-corners")'
                            }),
                            ...(config.style.dotShape === 'circle' && {
                              borderRadius: '50%',
                              overflow: 'hidden',
                              filter: 'url("data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"circle-filter\"%3E%3CfeGaussianBlur in=\"SourceGraphic\" stdDeviation=\"2\" result=\"blur\"/%3E%3CfeThreshold in=\"blur\" threshold=\"0.5\" result=\"mask\"/%3E%3CfeComposite in=\"SourceGraphic\" in2=\"mask\" operator=\"in\"/%3E%3C/filter%3E%3C/svg%3E#circle-filter")'
                            })
                          }}>
                            <QRCodeCanvas
                              ref={qrCodeRef}
                              value={generatedContent}
                              size={200}
                              fgColor={config.style.fgColor || '#000000'}
                              bgColor={config.style.bgColor || '#ffffff'}
                              level={config.style.errorCorrection || 'M'}
                              // margin 属性已被移除，使用容器 padding 控制边距
                            />
                          </div>
                        )}
                      </div>
                    
                    {/* Logo覆盖 */}
                    {config.logo.url && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: `${config.logo.size}%`,
                        height: `${config.logo.size}%`,
                        backgroundColor: config.style.bgColor,
                        borderRadius: '4px',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}>
                        <img
                          src={config.logo.url}
                          alt="Logo"
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )}
                  </div>
                </QRCodeErrorBoundary>
              </div>
              
              {/* 说明文字 */}
              {config.caption.enabled && (
                <div className="text-center mb-6">
                  <p style={{
                    fontSize: `${config.caption.fontSize}px`,
                    color: config.caption.color,
                    fontWeight: '500'
                  }}>
                    {checkAndTruncate(config.caption.text)}
                  </p>
                </div>
              )}
              
              <Button
                onClick={downloadQRCode}
                className="w-full flex items-center justify-center gap-2"
                disabled={!generatedContent}
              >
                <Download size={18} />
                {t('qrCodeGeneratorPage.downloadQRCode')}
              </Button>
              
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-medium text-gray-500">{t('qrCodeGeneratorPage.generatedContent')}</h4>
                <div className="p-3 bg-gray-50 rounded-md text-sm font-mono break-all">
                  {generatedContent || t('qrCodeGeneratorPage.generatedContentPlaceholder')}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">{t('qrCodeGeneratorPage.usageTips')}</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('qrCodeGeneratorPage.tip1')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('qrCodeGeneratorPage.tip2')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('qrCodeGeneratorPage.tip3')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('qrCodeGeneratorPage.tip4')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{t('qrCodeGeneratorPage.tip5')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;