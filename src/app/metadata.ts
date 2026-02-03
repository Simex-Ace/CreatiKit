import { Metadata } from 'next';


// 首页的metadata配置
export const homeMetadata: Metadata = {
  title: 'CreatiKit.io - 免费在线创意工具箱 | 20+实用工具',
  description: 'CreatiKit.io 提供20+免费在线创意工具：图片压缩、背景移除、3D模型预览、像素艺术生成、二维码生成、调色板、Markdown编辑器、白板工具、物理化学实验室等。无需注册，完全免费，所有处理在浏览器本地完成，保护您的隐私安全。',
  keywords: [
    '在线工具',
    '图片压缩',
    '图片处理',
    '3D预览',
    '背景移除',
    '像素艺术',
    '二维码生成',
    '调色板',
    'Markdown编辑器',
    '在线白板',
    '创意工具',
    '免费工具',
    '图片转像素',
    'GIF工具',
    '文本分析',
    '时间戳转换',
    '哈希计算',
    '物理实验室',
    '化学实验室',
    '生物沙盒',
    '在线钢琴',
    '数据可视化',
    '表情符号',
    '在线工具箱',
    '免费在线工具',
    '图片编辑工具',
    '设计工具',
    'SVG编辑器',
    'CSS动画',
    '音频可视化',
    '粒子特效',
    '前端工具',
  ],
  openGraph: {
    title: 'CreatiKit.io - 免费在线创意工具箱',
    description: '提供20+免费在线创意工具：图片压缩、背景移除、3D预览、像素艺术、二维码生成等。无需注册，完全免费。',
    url: 'https://creatikit.asia',
    siteName: 'CreatiKit.io',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CreatiKit.io - 免费在线创意工具箱',
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CreatiKit.io - 免费在线创意工具箱',
    description: '提供20+免费在线创意工具：图片压缩、背景移除、3D预览、像素艺术、二维码生成等。',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://creatikit.asia',
  },
};

// 各个页面的metadata配置
export const pageMetadata: Record<string, Metadata> = {
  '/compress': {
    title: '图片压缩工具 - 免费在线压缩JPG/PNG图片 | CreatiKit',
    description: '免费在线图片压缩工具，支持JPG、PNG格式，可批量压缩，保持画质的同时减小文件体积。无需上传到服务器，所有处理在浏览器本地完成，保护您的隐私。',
    keywords: ['图片压缩', 'JPG压缩', 'PNG压缩', '图片优化', '图片减小', '在线压缩', '免费压缩工具'],
  },
  '/background-remover': {
    title: '背景移除工具 - 一键去除图片背景 | CreatiKit',
    description: '免费在线背景移除工具，一键去除图片背景，支持自定义颜色选择和阈值调整，轻松创建透明背景图片。所有处理在浏览器本地完成。',
    keywords: ['背景移除', '去背景', '透明背景', '抠图', '图片处理', '背景去除工具'],
  },
  '/pixel-art-generator': {
    title: '像素艺术生成器 - 图片转像素风格 | CreatiKit',
    description: '免费在线像素艺术生成器，将普通图片转换为像素风格艺术，支持自定义像素大小、颜色数量和调色板选择。',
    keywords: ['像素艺术', '像素化', '图片转像素', '像素风格', '8bit艺术', '像素画'],
  },
  '/model-viewer': {
    title: '3D模型预览器 - 在线查看3D模型 | CreatiKit',
    description: '免费在线3D模型预览器，支持多种3D文件格式，可在线预览、旋转、缩放等交互操作。',
    keywords: ['3D预览', '3D模型', 'GLB预览', 'GLTF预览', '3D查看器', '在线3D'],
  },
  '/color-palette': {
    title: '调色板工具 - 专业在线配色工具 | CreatiKit',
    description: '专业在线调色板工具，支持颜色选择、配色方案生成、图片取色功能，帮助设计师快速找到完美的配色方案。',
    keywords: ['调色板', '配色工具', '颜色选择器', '取色器', '配色方案', '色彩搭配'],
  },
  '/qr-code-generator': {
    title: '二维码生成器 - 免费在线生成二维码 | CreatiKit',
    description: '免费在线二维码生成器，快速生成各类二维码，支持多种内容类型、样式定制和文件格式导出。',
    keywords: ['二维码生成', 'QR码生成', '二维码制作', '在线二维码', '二维码工具'],
  },
  '/markdown-editor': {
    title: 'Markdown编辑器 - 在线编辑和预览Markdown | CreatiKit',
    description: '免费在线Markdown编辑器，支持实时渲染和预览，可导出为HTML或PDF格式。',
    keywords: ['Markdown编辑器', '在线Markdown', 'Markdown预览', 'Markdown工具'],
  },
  '/whiteboard': {
    title: '在线白板 - 无限画布绘图工具 | CreatiKit',
    description: '免费在线白板工具，提供无限大的画布，支持画笔、橡皮擦、文本输入和形状绘制等基本功能。',
    keywords: ['在线白板', '绘图工具', '画板', '在线绘图', '白板工具'],
  },
  '/gif-tool': {
    title: 'GIF工具 - GIF分解和合成器 | CreatiKit',
    description: '免费GIF工具，可将GIF动图分解为单帧静态图片，或将多张图片合成为动态GIF，支持帧率调节。',
    keywords: ['GIF工具', 'GIF分解', 'GIF合成', 'GIF制作', '动图制作'],
  },
  '/text-analyzer': {
    title: 'SEO文本分析工具 - 关键词密度检测 | CreatiKit',
    description: '专业SEO文本分析工具，提供关键词密度检测、相关关键词建议、文本热力图和智能优化功能。',
    keywords: ['文本分析', 'SEO分析', '关键词密度', '文本优化', 'SEO工具'],
  },
  '/physics-lab': {
    title: '交互式物理实验室 - 2D物理模拟 | CreatiKit',
    description: '免费在线交互式2D物理实验室，模拟初中力学实验，自由创造、交互和观察符合物理规律的物体运动。',
    keywords: ['物理实验室', '物理模拟', '力学实验', '物理实验', '在线物理'],
  },
  '/chemistry-lab': {
    title: '交互式化学实验室 - 2D化学实验模拟 | CreatiKit',
    description: '免费在线交互式2D化学实验室，安全直观地学习和观察初中化学的核心反应现象，拖拽仪器、混合试剂进行虚拟实验。',
    keywords: ['化学实验室', '化学实验', '化学模拟', '虚拟实验', '在线化学'],
  },
  '/ecosystem-sandbox': {
    title: '生物沙盒模拟 - 生态系统模拟器 | CreatiKit',
    description: '高性能纯前端生态系统模拟，观察生物在沙盒中随机移动，支持添加、暂停和调整速度。',
    keywords: ['生物沙盒', '生态系统', '生物模拟', '生态模拟器', '生物实验'],
  },
  '/piano': {
    title: '在线电子钢琴 - 免费在线弹钢琴 | CreatiKit',
    description: '免费在线电子钢琴，使用电脑键盘或鼠标弹奏钢琴，体验真实的钢琴音色，支持一个完整八度的音符。',
    keywords: ['在线钢琴', '电子钢琴', '在线弹琴', '钢琴模拟器', '虚拟钢琴'],
  },
  '/data-to-chart': {
    title: '数据转图表 - CSV/JSON数据可视化 | CreatiKit',
    description: '免费在线数据可视化工具，输入CSV或JSON数据，通过简单配置将数据映射到图表轴，生成并导出柱状图、折线图或饼图。',
    keywords: ['数据可视化', '图表生成', '数据转图表', 'CSV转图表', 'JSON转图表'],
  },
  '/emoji-collection': {
    title: 'Emoji大全 - 表情符号集合 | CreatiKit',
    description: '免费Emoji大全，浏览、搜索和一键复制各种表情符号，支持收藏夹和最近使用功能。',
    keywords: ['Emoji', '表情符号', '表情大全', 'Emoji集合', '表情包'],
  },
  '/hash-calculator': {
    title: '哈希计算器 - MD5/SHA哈希值计算 | CreatiKit',
    description: '免费在线哈希计算器，计算文本或文件的MD5、SHA-1、SHA-256、SHA-512等多种哈希值，支持自定义算法选择。',
    keywords: ['哈希计算', 'MD5计算', 'SHA计算', '哈希值', '散列值'],
  },
  '/timestamp-converter': {
    title: '时间戳转换器 - Unix时间戳转换 | CreatiKit',
    description: '免费在线时间戳转换器，在标准日期时间和Unix时间戳之间进行转换，显示相对时间。',
    keywords: ['时间戳转换', 'Unix时间戳', '时间戳', '日期转换', '时间转换'],
  },
  '/weather-tool': {
    title: '天气预报工具 - 实时天气查询 | CreatiKit',
    description: '免费在线天气预报工具，实时获取当前位置天气，查看未来3天预报和空气质量，支持城市搜索功能。',
    keywords: ['天气预报', '天气查询', '实时天气', '天气工具', '在线天气'],
  },
  '/camera-gesture-drawing': {
    title: '隔空写字 - 手势控制空中书写 | CreatiKit',
    description: '使用手势控制进行空中书写，支持多种工具、缩放和消散效果，带来全新的交互体验。',
    keywords: ['隔空写字', '手势控制', '空中书写', '手势识别', '体感交互'],
  },
  '/svg-editor': {
    title: 'SVG编辑器 - 免费在线SVG路径编辑器 | CreatiKit',
    description: '专业免费在线SVG编辑器，支持路径绘制、形状创建、文本编辑、导入导出SVG文件，实时预览代码。',
    keywords: ['SVG编辑器', 'SVG编辑', 'SVG工具', '矢量图编辑', 'SVG路径', '在线SVG'],
  },
  '/css-animator': {
    title: 'CSS动画生成器 - 可视化创建CSS动画 | CreatiKit',
    description: '免费在线CSS动画生成器，可视化创建CSS动画，实时预览效果，支持多种动画类型和参数调整，导出代码直接使用。',
    keywords: ['CSS动画', '动画生成器', 'CSS动画工具', '动画制作', 'CSS keyframes', '动画编辑器'],
  },
  '/audio-visualizer': {
    title: '音频可视化工具 - 音乐频谱可视化 | CreatiKit',
    description: '免费在线音频可视化工具，上传音频文件实时显示频谱、波形、圆形频谱、粒子效果和瀑布图等多种可视化效果。',
    keywords: ['音频可视化', '频谱分析', '音频波形', '音乐可视化', '音频分析', '频谱图'],
  },
  '/particle-editor': {
    title: '粒子编辑器 - 粒子特效生成器 | CreatiKit',
    description: '免费在线粒子编辑器，创建炫酷的粒子特效，支持自定义粒子参数、形状、颜色和混合模式，导出配置和截图。',
    keywords: ['粒子特效', '粒子编辑器', '粒子系统', '特效生成', '粒子动画', '粒子工具'],
  },
};

