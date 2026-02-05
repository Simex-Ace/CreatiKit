import type { Locale } from './i18n-routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creatikit.asia';

/**
 * 工具页面的结构化数据配置（Schema.org SoftwareApplication）
 * 为每个工具提供独立的结构化数据
 */

export interface ToolStructuredDataConfig {
  name: {
    [locale in Locale]: string;
  };
  description: {
    [locale in Locale]: string;
  };
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    price: string;
    priceCurrency: string;
  };
  featureList?: {
    [locale in Locale]: string[];
  };
}

// 所有工具的结构化数据配置
export const toolStructuredDataConfig: Record<string, ToolStructuredDataConfig> = {
  '/compress': {
    name: {
      'en': 'Image Compressor',
      'zh-CN': '图片压缩工具',
      'ja-JP': '画像圧縮ツール',
      'ko-KR': '이미지 압축 도구',
    },
    description: {
      'en': 'Free online image compression tool supporting JPG and PNG formats. Batch compress images while maintaining quality and reducing file size.',
      'zh-CN': '免费在线图片压缩工具，支持JPG、PNG格式，可批量压缩，保持画质的同时减小文件体积。',
      'ja-JP': 'JPG、PNG形式をサポートする無料オンライン画像圧縮ツール。バッチ圧縮が可能で、画質を維持しながらファイルサイズを削減します。',
      'ko-KR': 'JPG 및 PNG 형식을 지원하는 무료 온라인 이미지 압축 도구. 품질을 유지하면서 파일 크기를 줄이는 배치 압축이 가능합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: {
      'en': ['Batch compression', 'JPG/PNG support', 'Quality preservation', 'Privacy protection', 'No upload required'],
      'zh-CN': ['批量压缩', 'JPG/PNG支持', '保持画质', '隐私保护', '无需上传'],
      'ja-JP': ['バッチ圧縮', 'JPG/PNGサポート', '画質維持', 'プライバシー保護', 'アップロード不要'],
      'ko-KR': ['배치 압축', 'JPG/PNG 지원', '품질 유지', '개인정보 보호', '업로드 불필요'],
    },
  },
  '/background-remover': {
    name: {
      'en': 'Background Remover',
      'zh-CN': '背景移除工具',
      'ja-JP': '背景除去ツール',
      'ko-KR': '배경 제거 도구',
    },
    description: {
      'en': 'Free online background removal tool. Remove image backgrounds with one click, support custom color selection and threshold adjustment.',
      'zh-CN': '免费在线背景移除工具，一键去除图片背景，支持自定义颜色选择和阈值调整，轻松创建透明背景图片。',
      'ja-JP': '無料オンライン背景除去ツール。ワンクリックで画像の背景を削除し、カスタムカラー選択としきい値調整をサポート。',
      'ko-KR': '무료 온라인 배경 제거 도구. 원클릭으로 이미지 배경을 제거하고, 사용자 정의 색상 선택 및 임계값 조정을 지원합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: {
      'en': ['One-click removal', 'Custom color selection', 'Threshold adjustment', 'Transparent background', 'Privacy protection'],
      'zh-CN': ['一键移除', '自定义颜色选择', '阈值调整', '透明背景', '隐私保护'],
      'ja-JP': ['ワンクリック削除', 'カスタムカラー選択', 'しきい値調整', '透明背景', 'プライバシー保護'],
      'ko-KR': ['원클릭 제거', '사용자 정의 색상 선택', '임계값 조정', '투명 배경', '개인정보 보호'],
    },
  },
  '/pixel-art-generator': {
    name: {
      'en': 'Pixel Art Generator',
      'zh-CN': '像素艺术生成器',
      'ja-JP': 'ピクセルアート生成器',
      'ko-KR': '픽셀 아트 생성기',
    },
    description: {
      'en': 'Free online pixel art generator. Convert images to pixel art style with customizable pixel size, color count, and palette selection.',
      'zh-CN': '免费在线像素艺术生成器，将图片转换为像素风格艺术，支持自定义像素大小、颜色数量和调色板选择。',
      'ja-JP': '無料オンラインピクセルアート生成器。画像をピクセルアートスタイルに変換し、カスタマイズ可能なピクセルサイズ、色数、パレット選択をサポート。',
      'ko-KR': '무료 온라인 픽셀 아트 생성기. 이미지를 픽셀 아트 스타일로 변환하고, 사용자 정의 픽셀 크기, 색상 수 및 팔레트 선택을 지원합니다.',
    },
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: {
      'en': ['Custom pixel size', 'Color count control', 'Palette selection', '8-bit style', 'Retro art'],
      'zh-CN': ['自定义像素大小', '颜色数量控制', '调色板选择', '8bit风格', '复古艺术'],
      'ja-JP': ['カスタムピクセルサイズ', '色数制御', 'パレット選択', '8bitスタイル', 'レトロアート'],
      'ko-KR': ['사용자 정의 픽셀 크기', '색상 수 제어', '팔레트 선택', '8bit 스타일', '레트로 아트'],
    },
  },
  '/model-viewer': {
    name: {
      'en': '3D Model Viewer',
      'zh-CN': '3D模型预览器',
      'ja-JP': '3Dモデルビューア',
      'ko-KR': '3D 모델 뷰어',
    },
    description: {
      'en': 'Free online 3D model viewer supporting multiple 3D file formats. Preview 3D models online with rotation, zoom, and interactive operations.',
      'zh-CN': '免费在线3D模型预览器，支持多种3D文件格式，可在线预览、旋转、缩放等交互操作。',
      'ja-JP': '複数の3Dファイル形式をサポートする無料オンライン3Dモデルビューア。回転、ズーム、インタラクティブ操作で3Dモデルをオンラインでプレビュー。',
      'ko-KR': '다양한 3D 파일 형식을 지원하는 무료 온라인 3D 모델 뷰어. 회전, 확대/축소 및 대화형 작업으로 3D 모델을 온라인에서 미리볼 수 있습니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: {
      'en': ['Multiple formats', 'GLB/GLTF support', 'Interactive rotation', 'Zoom control', 'Online preview'],
      'zh-CN': ['多种格式', 'GLB/GLTF支持', '交互旋转', '缩放控制', '在线预览'],
      'ja-JP': ['複数形式', 'GLB/GLTFサポート', 'インタラクティブ回転', 'ズーム制御', 'オンラインプレビュー'],
      'ko-KR': ['다양한 형식', 'GLB/GLTF 지원', '대화형 회전', '확대/축소 제어', '온라인 미리보기'],
    },
  },
  '/color-palette': {
    name: {
      'en': 'Color Palette Tool',
      'zh-CN': '调色板工具',
      'ja-JP': 'カラーパレットツール',
      'ko-KR': '색상 팔레트 도구',
    },
    description: {
      'en': 'Professional online color palette tool supporting color selection, color scheme generation, and image color extraction.',
      'zh-CN': '专业在线调色板工具，支持颜色选择、配色方案生成、图片取色功能，帮助设计师快速找到完美的配色方案。',
      'ja-JP': 'カラー選択、配色スキーム生成、画像カラー抽出をサポートするプロフェッショナルオンラインカラーパレットツール。',
      'ko-KR': '색상 선택, 색상 스키마 생성 및 이미지 색상 추출을 지원하는 전문 온라인 색상 팔레트 도구.',
    },
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: {
      'en': ['Color picker', 'Color scheme generation', 'Image color extraction', 'Professional tools', 'Design assistance'],
      'zh-CN': ['颜色选择器', '配色方案生成', '图片取色', '专业工具', '设计辅助'],
      'ja-JP': ['カラーピッカー', '配色スキーム生成', '画像カラー抽出', 'プロフェッショナルツール', 'デザイン支援'],
      'ko-KR': ['색상 선택기', '색상 스키마 생성', '이미지 색상 추출', '전문 도구', '디자인 지원'],
    },
  },
  '/qr-code-generator': {
    name: {
      'en': 'QR Code Generator',
      'zh-CN': '二维码生成器',
      'ja-JP': 'QRコード生成器',
      'ko-KR': 'QR 코드 생성기',
    },
    description: {
      'en': 'Free online QR code generator. Quickly generate various QR codes supporting multiple content types, style customization, and file format export.',
      'zh-CN': '免费在线二维码生成器，快速生成各类二维码，支持多种内容类型、样式定制和文件格式导出。',
      'ja-JP': '無料オンラインQRコード生成器。複数のコンテンツタイプ、スタイルカスタマイズ、ファイル形式エクスポートをサポートする様々なQRコードを迅速に生成します。',
      'ko-KR': '무료 온라인 QR 코드 생성기. 다양한 콘텐츠 유형, 스타일 사용자 정의 및 파일 형식 내보내기를 지원하는 다양한 QR 코드를 빠르게 생성합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'CNY',
    },
    featureList: {
      'en': ['Multiple content types', 'Style customization', 'File export', 'Quick generation', 'Free tool'],
      'zh-CN': ['多种内容类型', '样式定制', '文件导出', '快速生成', '免费工具'],
      'ja-JP': ['複数コンテンツタイプ', 'スタイルカスタマイズ', 'ファイルエクスポート', '迅速生成', '無料ツール'],
      'ko-KR': ['다양한 콘텐츠 유형', '스타일 사용자 정의', '파일 내보내기', '빠른 생성', '무료 도구'],
    },
  },
  '/markdown-editor': {
    name: {
      'en': 'Markdown Editor',
      'zh-CN': 'Markdown编辑器',
      'ja-JP': 'Markdownエディタ',
      'ko-KR': 'Markdown 에디터',
    },
    description: {
      'en': 'Free online Markdown editor with real-time rendering and preview. Export to HTML or PDF format.',
      'zh-CN': '免费在线Markdown编辑器，支持实时渲染和预览，可导出为HTML或PDF格式。',
      'ja-JP': 'リアルタイムレンダリングとプレビューをサポートする無料オンラインMarkdownエディタ。HTMLまたはPDF形式にエクスポート可能。',
      'ko-KR': '실시간 렌더링 및 미리보기를 지원하는 무료 온라인 Markdown 에디터. HTML 또는 PDF 형식으로 내보낼 수 있습니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Real-time preview', 'HTML export', 'PDF export', 'Syntax highlighting', 'Live rendering'],
      'zh-CN': ['实时预览', 'HTML导出', 'PDF导出', '语法高亮', '实时渲染'],
      'ja-JP': ['リアルタイムプレビュー', 'HTMLエクスポート', 'PDFエクスポート', '構文ハイライト', 'ライブレンダリング'],
      'ko-KR': ['실시간 미리보기', 'HTML 내보내기', 'PDF 내보내기', '구문 강조', '실시간 렌더링'],
    },
  },
  '/whiteboard': {
    name: {
      'en': 'Online Whiteboard',
      'zh-CN': '在线白板',
      'ja-JP': 'オンラインホワイトボード',
      'ko-KR': '온라인 화이트보드',
    },
    description: {
      'en': 'Free online whiteboard tool with infinite canvas. Support brush, eraser, text input, and shape drawing.',
      'zh-CN': '免费在线白板工具，提供无限大的画布，支持画笔、橡皮擦、文本输入和形状绘制。',
      'ja-JP': '無限のキャンバスを提供する無料オンラインホワイトボードツール。ブラシ、消しゴム、テキスト入力、形状描画をサポート。',
      'ko-KR': '무한 캔버스를 제공하는 무료 온라인 화이트보드 도구. 브러시, 지우개, 텍스트 입력 및 도형 그리기를 지원합니다.',
    },
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Infinite canvas', 'Brush tool', 'Eraser', 'Text input', 'Shape drawing'],
      'zh-CN': ['无限画布', '画笔工具', '橡皮擦', '文本输入', '形状绘制'],
      'ja-JP': ['無限キャンバス', 'ブラシツール', '消しゴム', 'テキスト入力', '形状描画'],
      'ko-KR': ['무한 캔버스', '브러시 도구', '지우개', '텍스트 입력', '도형 그리기'],
    },
  },
  '/svg-editor': {
    name: {
      'en': 'SVG Editor',
      'zh-CN': 'SVG编辑器',
      'ja-JP': 'SVGエディタ',
      'ko-KR': 'SVG 에디터',
    },
    description: {
      'en': 'Professional free online SVG editor supporting path drawing, shape creation, text editing, SVG file import/export.',
      'zh-CN': '专业免费在线SVG编辑器，支持路径绘制、形状创建、文本编辑、导入导出SVG文件。',
      'ja-JP': 'パス描画、形状作成、テキスト編集、SVGファイルのインポート/エクスポートをサポートするプロフェッショナル無料オンラインSVGエディタ。',
      'ko-KR': '경로 그리기, 도형 생성, 텍스트 편집, SVG 파일 가져오기/내보내기를 지원하는 전문 무료 온라인 SVG 에디터.',
    },
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Path drawing', 'Shape creation', 'Text editing', 'Import/Export', 'Real-time preview'],
      'zh-CN': ['路径绘制', '形状创建', '文本编辑', '导入导出', '实时预览'],
      'ja-JP': ['パス描画', '形状作成', 'テキスト編集', 'インポート/エクスポート', 'リアルタイムプレビュー'],
      'ko-KR': ['경로 그리기', '도형 생성', '텍스트 편집', '가져오기/내보내기', '실시간 미리보기'],
    },
  },
  '/css-animator': {
    name: {
      'en': 'CSS Animator',
      'zh-CN': 'CSS动画生成器',
      'ja-JP': 'CSSアニメーター',
      'ko-KR': 'CSS 애니메이터',
    },
    description: {
      'en': 'Free online CSS animation generator. Create beautiful CSS animations with keyframes, transitions, and transforms.',
      'zh-CN': '免费在线CSS动画生成器，使用关键帧、过渡和变换创建精美的CSS动画。',
      'ja-JP': '無料オンラインCSSアニメーション生成器。キーフレーム、トランジション、トランスフォームを使用して美しいCSSアニメーションを作成。',
      'ko-KR': '무료 온라인 CSS 애니메이션 생성기. 키프레임, 트랜지션 및 변환을 사용하여 아름다운 CSS 애니메이션을 만듭니다.',
    },
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Keyframe animation', 'CSS transitions', 'Transform effects', 'Code export', 'Live preview'],
      'zh-CN': ['关键帧动画', 'CSS过渡', '变换效果', '代码导出', '实时预览'],
      'ja-JP': ['キーフレームアニメーション', 'CSSトランジション', 'トランスフォーム効果', 'コードエクスポート', 'ライブプレビュー'],
      'ko-KR': ['키프레임 애니메이션', 'CSS 트랜지션', '변환 효과', '코드 내보내기', '실시간 미리보기'],
    },
  },
  '/audio-visualizer': {
    name: {
      'en': 'Audio Visualizer',
      'zh-CN': '音频可视化',
      'ja-JP': 'オーディオビジュアライザー',
      'ko-KR': '오디오 비주얼라이저',
    },
    description: {
      'en': 'Free online audio visualizer and spectrum analyzer. Visualize audio waveforms, frequency spectrum, and create stunning audio visualizations.',
      'zh-CN': '免费在线音频可视化和频谱分析器。可视化音频波形、频谱，创建令人惊叹的音频可视化效果。',
      'ja-JP': '無料オンラインオーディオビジュアライザーとスペクトラムアナライザー。オーディオ波形、周波数スペクトラムを可視化。',
      'ko-KR': '무료 온라인 오디오 비주얼라이저 및 스펙트럼 분석기. 오디오 파형, 주파수 스펙트럼을 시각화합니다.',
    },
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Waveform visualization', 'Spectrum analysis', 'Frequency analyzer', 'Real-time visualization', 'Audio analysis'],
      'zh-CN': ['波形可视化', '频谱分析', '频率分析', '实时可视化', '音频分析'],
      'ja-JP': ['波形可視化', 'スペクトラム分析', '周波数アナライザー', 'リアルタイム可視化', 'オーディオ分析'],
      'ko-KR': ['파형 시각화', '스펙트럼 분석', '주파수 분석기', '실시간 시각화', '오디오 분석'],
    },
  },
  '/particle-editor': {
    name: {
      'en': 'Particle Editor',
      'zh-CN': '粒子编辑器',
      'ja-JP': 'パーティクルエディタ',
      'ko-KR': '파티클 에디터',
    },
    description: {
      'en': 'Free online particle editor and effect generator. Create stunning particle effects, animations, and visual effects.',
      'zh-CN': '免费在线粒子编辑器和特效生成器。创建令人惊叹的粒子效果、动画和视觉效果。',
      'ja-JP': '無料オンラインパーティクルエディタとエフェクト生成器。素晴らしいパーティクルエフェクト、アニメーション、視覚効果を作成。',
      'ko-KR': '무료 온라인 파티클 에디터 및 효과 생성기. 멋진 파티클 효과, 애니메이션 및 시각 효과를 만듭니다.',
    },
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Particle effects', 'Customizable parameters', 'Animation effects', 'Visual effects', 'Real-time preview'],
      'zh-CN': ['粒子特效', '可自定义参数', '动画特效', '视觉效果', '实时预览'],
      'ja-JP': ['パーティクルエフェクト', 'カスタマイズ可能なパラメータ', 'アニメーションエフェクト', '視覚効果', 'リアルタイムプレビュー'],
      'ko-KR': ['파티클 효과', '사용자 정의 매개변수', '애니메이션 효과', '시각 효과', '실시간 미리보기'],
    },
  },
  '/gif-tool': {
    name: {
      'en': 'GIF Tool',
      'zh-CN': 'GIF工具',
      'ja-JP': 'GIFツール',
      'ko-KR': 'GIF 도구',
    },
    description: {
      'en': 'Free online GIF tool for splitting and combining GIF files. Extract frames from GIFs, combine images into GIFs.',
      'zh-CN': '免费在线GIF工具，用于分解和合成GIF文件。从GIF中提取帧，将图片合成为GIF。',
      'ja-JP': 'GIFファイルの分割と結合のための無料オンラインGIFツール。GIFからフレームを抽出し、画像をGIFに結合。',
      'ko-KR': 'GIF 파일 분할 및 결합을 위한 무료 온라인 GIF 도구. GIF에서 프레임을 추출하고 이미지를 GIF로 결합합니다.',
    },
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['GIF splitting', 'GIF combining', 'Frame extraction', 'Animated GIF creation', 'GIF editing'],
      'zh-CN': ['GIF分解', 'GIF合成', '帧提取', '动画GIF创建', 'GIF编辑'],
      'ja-JP': ['GIF分割', 'GIF結合', 'フレーム抽出', 'アニメーションGIF作成', 'GIF編集'],
      'ko-KR': ['GIF 분할', 'GIF 결합', '프레임 추출', '애니메이션 GIF 생성', 'GIF 편집'],
    },
  },
  '/hash-calculator': {
    name: {
      'en': 'Hash Calculator',
      'zh-CN': '哈希计算器',
      'ja-JP': 'ハッシュ計算機',
      'ko-KR': '해시 계산기',
    },
    description: {
      'en': 'Free online hash calculator supporting MD5, SHA-1, SHA-256, SHA-512 and more. Generate hash values instantly.',
      'zh-CN': '免费在线哈希计算器，支持MD5、SHA-1、SHA-256、SHA-512等多种算法。即时生成哈希值。',
      'ja-JP': 'MD5、SHA-1、SHA-256、SHA-512などをサポートする無料オンラインハッシュ計算機。ハッシュ値を即座に生成。',
      'ko-KR': 'MD5, SHA-1, SHA-256, SHA-512 등을 지원하는 무료 온라인 해시 계산기. 해시 값을 즉시 생성합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['MD5 hash', 'SHA-1 hash', 'SHA-256 hash', 'SHA-512 hash', 'Multiple algorithms'],
      'zh-CN': ['MD5哈希', 'SHA-1哈希', 'SHA-256哈希', 'SHA-512哈希', '多种算法'],
      'ja-JP': ['MD5ハッシュ', 'SHA-1ハッシュ', 'SHA-256ハッシュ', 'SHA-512ハッシュ', '複数アルゴリズム'],
      'ko-KR': ['MD5 해시', 'SHA-1 해시', 'SHA-256 해시', 'SHA-512 해시', '다양한 알고리즘'],
    },
  },
  '/timestamp-converter': {
    name: {
      'en': 'Timestamp Converter',
      'zh-CN': '时间戳转换器',
      'ja-JP': 'タイムスタンプ変換器',
      'ko-KR': '타임스탬프 변환기',
    },
    description: {
      'en': 'Free online timestamp converter. Convert Unix timestamps to readable dates and vice versa. Support multiple timezones.',
      'zh-CN': '免费在线时间戳转换器。将Unix时间戳转换为可读日期，反之亦然。支持多种时区。',
      'ja-JP': '無料オンラインタイムスタンプ変換器。Unixタイムスタンプを読み取り可能な日付に変換、またはその逆。複数のタイムゾーンをサポート。',
      'ko-KR': '무료 온라인 타임스탬프 변환기. Unix 타임스탬프를 읽을 수 있는 날짜로 변환하거나 그 반대로 변환합니다. 여러 시간대를 지원합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Unix timestamp', 'Date conversion', 'Timezone support', 'Multiple formats', 'Bidirectional conversion'],
      'zh-CN': ['Unix时间戳', '日期转换', '时区支持', '多种格式', '双向转换'],
      'ja-JP': ['Unixタイムスタンプ', '日付変換', 'タイムゾーンサポート', '複数形式', '双方向変換'],
      'ko-KR': ['Unix 타임스탬프', '날짜 변환', '시간대 지원', '다양한 형식', '양방향 변환'],
    },
  },
  '/text-analyzer': {
    name: {
      'en': 'Text Analyzer',
      'zh-CN': '文本分析器',
      'ja-JP': 'テキストアナライザー',
      'ko-KR': '텍스트 분석기',
    },
    description: {
      'en': 'Free online text analyzer and SEO tool. Analyze keyword density, readability score, text statistics, and optimize content.',
      'zh-CN': '免费在线文本分析器和SEO工具。分析关键词密度、可读性评分、文本统计，优化内容。',
      'ja-JP': '無料オンラインテキストアナライザーとSEOツール。キーワード密度、可読性スコア、テキスト統計を分析し、コンテンツを最適化。',
      'ko-KR': '무료 온라인 텍스트 분석기 및 SEO 도구. 키워드 밀도, 가독성 점수, 텍스트 통계를 분석하고 콘텐츠를 최적화합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Keyword density', 'Readability score', 'Text statistics', 'SEO analysis', 'Content optimization'],
      'zh-CN': ['关键词密度', '可读性评分', '文本统计', 'SEO分析', '内容优化'],
      'ja-JP': ['キーワード密度', '可読性スコア', 'テキスト統計', 'SEO分析', 'コンテンツ最適化'],
      'ko-KR': ['키워드 밀도', '가독성 점수', '텍스트 통계', 'SEO 분석', '콘텐츠 최적화'],
    },
  },
  '/code-tools': {
    name: {
      'en': 'Code Tools',
      'zh-CN': '代码工具',
      'ja-JP': 'コードツール',
      'ko-KR': '코드 도구',
    },
    description: {
      'en': 'Free online code tools including code formatter, minifier, and transformer. Support JavaScript, TypeScript, HTML, CSS, Python, JSON, XML and more.',
      'zh-CN': '免费在线代码工具，包括代码格式化、压缩和转换。支持JavaScript、TypeScript、HTML、CSS、Python、JSON、XML等多种语言。',
      'ja-JP': 'コードフォーマッター、圧縮、変換を含む無料オンラインコードツール。JavaScript、TypeScript、HTML、CSS、Python、JSON、XMLなどをサポート。',
      'ko-KR': '코드 포맷터, 압축 및 변환을 포함한 무료 온라인 코드 도구. JavaScript, TypeScript, HTML, CSS, Python, JSON, XML 등을 지원합니다.',
    },
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Code formatting', 'Code minification', 'Code transformation', 'Multiple languages', 'Syntax highlighting'],
      'zh-CN': ['代码格式化', '代码压缩', '代码转换', '多种语言', '语法高亮'],
      'ja-JP': ['コードフォーマット', 'コード圧縮', 'コード変換', '複数言語', '構文ハイライト'],
      'ko-KR': ['코드 포맷팅', '코드 압축', '코드 변환', '다양한 언어', '구문 강조'],
    },
  },
  '/weather-tool': {
    name: {
      'en': 'Weather Tool',
      'zh-CN': '天气预报工具',
      'ja-JP': '天気ツール',
      'ko-KR': '날씨 도구',
    },
    description: {
      'en': 'Free online weather tool providing accurate weather forecasts, current conditions, and weather information for any location worldwide.',
      'zh-CN': '免费在线天气预报工具，提供准确的天气预报、当前天气状况和全球任何地点的天气信息。',
      'ja-JP': '正確な天気予報、現在の天気状況、世界中のあらゆる場所の天気情報を提供する無料オンライン天気ツール。',
      'ko-KR': '정확한 날씨 예보, 현재 날씨 조건 및 전 세계 어느 위치의 날씨 정보를 제공하는 무료 온라인 날씨 도구.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Weather forecast', 'Current conditions', 'Global locations', 'Weather data', 'Real-time updates'],
      'zh-CN': ['天气预报', '当前天气', '全球位置', '天气数据', '实时更新'],
      'ja-JP': ['天気予報', '現在の天気', 'グローバル位置', '天気データ', 'リアルタイム更新'],
      'ko-KR': ['날씨 예보', '현재 날씨', '전 세계 위치', '날씨 데이터', '실시간 업데이트'],
    },
  },
  '/data-to-chart': {
    name: {
      'en': 'Data to Chart',
      'zh-CN': '数据转图表',
      'ja-JP': 'データからチャート',
      'ko-KR': '데이터를 차트로',
    },
    description: {
      'en': 'Free online chart generator. Convert CSV data, JSON data, or manual input into beautiful charts and graphs. Support multiple chart types.',
      'zh-CN': '免费在线图表生成器。将CSV数据、JSON数据或手动输入转换为精美的图表和图形。支持多种图表类型。',
      'ja-JP': '無料オンラインチャート生成器。CSVデータ、JSONデータ、または手動入力を美しいチャートやグラフに変換。複数のチャートタイプをサポート。',
      'ko-KR': '무료 온라인 차트 생성기. CSV 데이터, JSON 데이터 또는 수동 입력을 아름다운 차트 및 그래프로 변환합니다. 여러 차트 유형을 지원합니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['CSV import', 'JSON import', 'Multiple chart types', 'Data visualization', 'Export charts'],
      'zh-CN': ['CSV导入', 'JSON导入', '多种图表类型', '数据可视化', '导出图表'],
      'ja-JP': ['CSVインポート', 'JSONインポート', '複数チャートタイプ', 'データ可視化', 'チャートエクスポート'],
      'ko-KR': ['CSV 가져오기', 'JSON 가져오기', '다양한 차트 유형', '데이터 시각화', '차트 내보내기'],
    },
  },
  '/piano': {
    name: {
      'en': 'Online Piano',
      'zh-CN': '在线钢琴',
      'ja-JP': 'オンラインピアノ',
      'ko-KR': '온라인 피아노',
    },
    description: {
      'en': 'Free online piano and virtual keyboard. Play piano with your computer keyboard or mouse. Perfect for learning music and practicing piano.',
      'zh-CN': '免费在线钢琴和虚拟键盘。使用电脑键盘或鼠标弹奏钢琴。适合学习音乐和练习钢琴。',
      'ja-JP': '無料オンラインピアノと仮想キーボード。コンピューターのキーボードやマウスでピアノを演奏。音楽学習やピアノ練習に最適。',
      'ko-KR': '무료 온라인 피아노 및 가상 키보드. 컴퓨터 키보드 또는 마우스로 피아노를 연주합니다. 음악 학습 및 피아노 연습에 완벽합니다.',
    },
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Virtual keyboard', 'Computer keyboard support', 'Mouse control', 'Music learning', 'Piano practice'],
      'zh-CN': ['虚拟键盘', '电脑键盘支持', '鼠标控制', '音乐学习', '钢琴练习'],
      'ja-JP': ['仮想キーボード', 'コンピューターキーボードサポート', 'マウス制御', '音楽学習', 'ピアノ練習'],
      'ko-KR': ['가상 키보드', '컴퓨터 키보드 지원', '마우스 제어', '음악 학습', '피아노 연습'],
    },
  },
  '/physics-lab': {
    name: {
      'en': 'Physics Lab',
      'zh-CN': '物理实验室',
      'ja-JP': '物理実験室',
      'ko-KR': '물리 실험실',
    },
    description: {
      'en': 'Free online physics laboratory and simulation tool. Explore physics concepts through interactive experiments and simulations.',
      'zh-CN': '免费在线物理实验室和模拟工具。通过交互式实验和模拟探索物理概念。',
      'ja-JP': '無料オンライン物理実験室とシミュレーションツール。インタラクティブな実験とシミュレーションを通じて物理概念を探求。',
      'ko-KR': '무료 온라인 물리 실험실 및 시뮬레이션 도구. 대화형 실험 및 시뮬레이션을 통해 물리 개념을 탐구합니다.',
    },
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Physics simulation', 'Interactive experiments', 'Physics concepts', 'Educational tool', 'Science learning'],
      'zh-CN': ['物理模拟', '交互式实验', '物理概念', '教育工具', '科学学习'],
      'ja-JP': ['物理シミュレーション', 'インタラクティブ実験', '物理概念', '教育ツール', '科学学習'],
      'ko-KR': ['물리 시뮬레이션', '대화형 실험', '물리 개념', '교육 도구', '과학 학습'],
    },
  },
  '/chemistry-lab': {
    name: {
      'en': 'Chemistry Lab',
      'zh-CN': '化学实验室',
      'ja-JP': '化学実験室',
      'ko-KR': '화학 실험실',
    },
    description: {
      'en': 'Free online chemistry laboratory and simulation tool. Safely explore chemical reactions, experiments, and chemistry concepts through interactive simulations.',
      'zh-CN': '免费在线化学实验室和模拟工具。通过交互式模拟安全地探索化学反应、实验和化学概念。',
      'ja-JP': '無料オンライン化学実験室とシミュレーションツール。インタラクティブなシミュレーションを通じて化学反応、実験、化学概念を安全に探求。',
      'ko-KR': '무료 온라인 화학 실험실 및 시뮬레이션 도구. 대화형 시뮬레이션을 통해 화학 반응, 실험 및 화학 개념을 안전하게 탐구합니다.',
    },
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Chemical reactions', 'Interactive simulations', 'Chemistry experiments', 'Safe learning', 'Educational tool'],
      'zh-CN': ['化学反应', '交互式模拟', '化学实验', '安全学习', '教育工具'],
      'ja-JP': ['化学反応', 'インタラクティブシミュレーション', '化学実験', '安全学習', '教育ツール'],
      'ko-KR': ['화학 반응', '대화형 시뮬레이션', '화학 실험', '안전한 학습', '교육 도구'],
    },
  },
  '/ecosystem-sandbox': {
    name: {
      'en': 'Ecosystem Sandbox',
      'zh-CN': '生物沙盒',
      'ja-JP': '生態系サンドボックス',
      'ko-KR': '생태계 샌드박스',
    },
    description: {
      'en': 'Free online ecosystem sandbox and simulation tool. Observe organisms, ecosystems, and biological interactions in an interactive sandbox environment.',
      'zh-CN': '免费在线生物沙盒和模拟工具。在交互式沙盒环境中观察生物、生态系统和生物相互作用。',
      'ja-JP': '無料オンライン生態系サンドボックスとシミュレーションツール。インタラクティブなサンドボックス環境で生物、生態系、生物学的相互作用を観察。',
      'ko-KR': '무료 온라인 생태계 샌드박스 및 시뮬레이션 도구. 대화형 샌드박스 환경에서 생물, 생태계 및 생물학적 상호작용을 관찰합니다.',
    },
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Ecosystem simulation', 'Organism observation', 'Biological interactions', 'Sandbox environment', 'Science learning'],
      'zh-CN': ['生态系统模拟', '生物观察', '生物相互作用', '沙盒环境', '科学学习'],
      'ja-JP': ['生態系シミュレーション', '生物観察', '生物学的相互作用', 'サンドボックス環境', '科学学習'],
      'ko-KR': ['생태계 시뮬레이션', '생물 관찰', '생물학적 상호작용', '샌드박스 환경', '과학 학습'],
    },
  },
  '/emoji-collection': {
    name: {
      'en': 'Emoji Collection',
      'zh-CN': 'Emoji大全',
      'ja-JP': '絵文字コレクション',
      'ko-KR': '이모지 컬렉션',
    },
    description: {
      'en': 'Free online emoji collection and library. Browse, search, and copy emojis easily. Find the perfect emoji for your messages and content.',
      'zh-CN': '免费在线表情符号集合和库。轻松浏览、搜索和复制表情符号。为您的消息和内容找到完美的表情符号。',
      'ja-JP': '無料オンライン絵文字コレクションとライブラリ。絵文字を簡単に閲覧、検索、コピー。メッセージやコンテンツに最適な絵文字を見つけます。',
      'ko-KR': '무료 온라인 이모지 컬렉션 및 라이브러리. 이모지를 쉽게 탐색, 검색 및 복사합니다. 메시지 및 콘텐츠에 완벽한 이모지를 찾습니다.',
    },
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Emoji library', 'Emoji search', 'Easy copy', 'Category browsing', 'Unicode support'],
      'zh-CN': ['表情符号库', '表情符号搜索', '轻松复制', '分类浏览', 'Unicode支持'],
      'ja-JP': ['絵文字ライブラリ', '絵文字検索', '簡単コピー', 'カテゴリ閲覧', 'Unicodeサポート'],
      'ko-KR': ['이모지 라이브러리', '이모지 검색', '쉬운 복사', '카테고리 탐색', 'Unicode 지원'],
    },
  },
  '/camera-gesture-drawing': {
    name: {
      'en': 'Camera Gesture Drawing',
      'zh-CN': '隔空写字',
      'ja-JP': 'カメラジェスチャー描画',
      'ko-KR': '카메라 제스처 그리기',
    },
    description: {
      'en': 'Free online camera gesture drawing tool. Draw in the air using hand gestures captured by your webcam. Create art with motion and gestures.',
      'zh-CN': '免费在线摄像头手势绘图工具。使用网络摄像头捕捉的手势在空中绘制。通过动作和手势创作艺术。',
      'ja-JP': '無料オンラインカメラジェスチャー描画ツール。ウェブカメラでキャプチャした手のジェスチャーを使用して空中に描画。動きとジェスチャーでアートを作成。',
      'ko-KR': '무료 온라인 카메라 제스처 그리기 도구. 웹캠으로 캡처한 손 제스처를 사용하여 공중에 그립니다. 움직임과 제스처로 예술을 만듭니다.',
    },
    applicationCategory: 'EntertainmentApplication',
    operatingSystem: 'Web Browser',
    offers: { price: '0', priceCurrency: 'CNY' },
    featureList: {
      'en': ['Gesture recognition', 'Webcam support', 'Air drawing', 'Motion capture', 'Creative tool'],
      'zh-CN': ['手势识别', '摄像头支持', '空中绘图', '动作捕捉', '创意工具'],
      'ja-JP': ['ジェスチャー認識', 'ウェブカメラサポート', '空中描画', 'モーションキャプチャ', 'クリエイティブツール'],
      'ko-KR': ['제스처 인식', '웹캠 지원', '공중 그리기', '모션 캡처', '창의적 도구'],
    },
  },
};

/**
 * 根据路径和语言生成工具的结构化数据
 */
export function generateToolStructuredData(path: string, locale: Locale): object {
  const config = toolStructuredDataConfig[path];
  if (!config) {
    return {};
  }

  const localizedPath = locale === 'en' ? path : `/${locale}${path}`;
  const name = config.name[locale] || config.name['en'];
  const description = config.description[locale] || config.description['en'];
  const featureList = config.featureList?.[locale] || config.featureList?.['en'] || [];

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name,
    url: `${baseUrl}${localizedPath}`,
    description: description,
    applicationCategory: config.applicationCategory,
    operatingSystem: config.operatingSystem,
    offers: {
      '@type': 'Offer',
      price: config.offers.price,
      priceCurrency: config.offers.priceCurrency,
    },
    featureList: featureList.map((feature, index) => ({
      '@type': 'SoftwareFeature',
      name: feature,
      position: index + 1,
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '100',
    },
    provider: {
      '@type': 'Organization',
      name: 'CreatiKit',
      url: baseUrl,
    },
  };
}

