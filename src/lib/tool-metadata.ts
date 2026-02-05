import { Metadata } from 'next';
import type { Locale } from './i18n-routing';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://creatikit.asia';

/**
 * 工具页面的多语言元数据配置
 * 为每个工具提供独立的 SEO 元数据
 */

export interface ToolMetadataConfig {
  [key: string]: {
    [locale in Locale]: {
      title: string;
      description: string;
      keywords: string[];
    };
  };
}

// 所有工具的多语言元数据配置
export const toolMetadataConfig: ToolMetadataConfig = {
  '/compress': {
    'en': {
      title: 'Image Compressor - Free Online JPG/PNG Compression Tool | CreatiKit',
      description: 'Free online image compression tool supporting JPG and PNG formats. Batch compress images while maintaining quality and reducing file size. All processing done locally in your browser to protect your privacy.',
      keywords: ['image compression', 'JPG compress', 'PNG compress', 'image optimization', 'reduce image size', 'online compression', 'free compress tool', 'batch compression'],
    },
    'zh-CN': {
      title: '图片压缩工具 - 免费在线压缩JPG/PNG图片 | CreatiKit',
      description: '免费在线图片压缩工具，支持JPG、PNG格式，可批量压缩，保持画质的同时减小文件体积。无需上传到服务器，所有处理在浏览器本地完成，保护您的隐私。',
      keywords: ['图片压缩', 'JPG压缩', 'PNG压缩', '图片优化', '图片减小', '在线压缩', '免费压缩工具', '批量压缩'],
    },
    'ja-JP': {
      title: '画像圧縮ツール - 無料オンラインJPG/PNG圧縮 | CreatiKit',
      description: 'JPG、PNG形式をサポートする無料オンライン画像圧縮ツール。バッチ圧縮が可能で、画質を維持しながらファイルサイズを削減します。すべての処理はブラウザでローカルに実行され、プライバシーを保護します。',
      keywords: ['画像圧縮', 'JPG圧縮', 'PNG圧縮', '画像最適化', '画像サイズ削減', 'オンライン圧縮', '無料圧縮ツール', 'バッチ圧縮'],
    },
    'ko-KR': {
      title: '이미지 압축 도구 - 무료 온라인 JPG/PNG 압축 | CreatiKit',
      description: 'JPG 및 PNG 형식을 지원하는 무료 온라인 이미지 압축 도구. 품질을 유지하면서 파일 크기를 줄이는 배치 압축이 가능합니다. 모든 처리는 브라우저에서 로컬로 완료되어 개인정보를 보호합니다.',
      keywords: ['이미지 압축', 'JPG 압축', 'PNG 압축', '이미지 최적화', '이미지 크기 줄이기', '온라인 압축', '무료 압축 도구', '배치 압축'],
    },
  },
  '/background-remover': {
    'en': {
      title: 'Background Remover - Free Online Remove Background Tool | CreatiKit',
      description: 'Free online background removal tool. Remove image backgrounds with one click, support custom color selection and threshold adjustment. Easily create transparent background images. All processing done locally in your browser.',
      keywords: ['background removal', 'remove background', 'transparent background', 'image processing', 'background removal tool', 'online remove bg', 'cutout tool'],
    },
    'zh-CN': {
      title: '背景移除工具 - 一键去除图片背景 | CreatiKit',
      description: '免费在线背景移除工具，一键去除图片背景，支持自定义颜色选择和阈值调整，轻松创建透明背景图片。所有处理在浏览器本地完成，保护您的隐私安全。',
      keywords: ['背景移除', '去背景', '透明背景', '抠图', '图片处理', '背景去除工具', '在线抠图'],
    },
    'ja-JP': {
      title: '背景除去ツール - ワンクリックで背景を削除 | CreatiKit',
      description: '無料オンライン背景除去ツール。ワンクリックで画像の背景を削除し、カスタムカラー選択としきい値調整をサポート。透明背景画像を簡単に作成できます。すべての処理はブラウザでローカルに実行されます。',
      keywords: ['背景除去', '背景削除', '透明背景', '画像処理', '背景除去ツール', 'オンライン背景削除', '切り抜きツール'],
    },
    'ko-KR': {
      title: '배경 제거 도구 - 원클릭 배경 제거 | CreatiKit',
      description: '무료 온라인 배경 제거 도구. 원클릭으로 이미지 배경을 제거하고, 사용자 정의 색상 선택 및 임계값 조정을 지원합니다. 투명 배경 이미지를 쉽게 만들 수 있습니다. 모든 처리는 브라우저에서 로컬로 완료됩니다.',
      keywords: ['배경 제거', '배경 삭제', '투명 배경', '이미지 처리', '배경 제거 도구', '온라인 배경 제거', '잘라내기 도구'],
    },
  },
  '/pixel-art-generator': {
    'en': {
      title: 'Pixel Art Generator - Convert Image to Pixel Art Online | CreatiKit',
      description: 'Free online pixel art generator. Convert images to pixel art style with customizable pixel size, color count, and palette selection. Create retro 8-bit art easily.',
      keywords: ['pixel art', 'pixel art generator', 'image to pixel', '8bit art', 'pixel style', 'retro art', 'pixel converter'],
    },
    'zh-CN': {
      title: '像素艺术生成器 - 在线图片转像素艺术 | CreatiKit',
      description: '免费在线像素艺术生成器，将图片转换为像素风格艺术，支持自定义像素大小、颜色数量和调色板选择，轻松创建复古8bit艺术。',
      keywords: ['像素艺术', '像素艺术生成器', '图片转像素', '8bit艺术', '像素风格', '复古艺术', '像素转换'],
    },
    'ja-JP': {
      title: 'ピクセルアート生成器 - 画像をピクセルアートに変換 | CreatiKit',
      description: '無料オンラインピクセルアート生成器。画像をピクセルアートスタイルに変換し、カスタマイズ可能なピクセルサイズ、色数、パレット選択をサポート。レトロな8bitアートを簡単に作成できます。',
      keywords: ['ピクセルアート', 'ピクセルアート生成器', '画像をピクセル化', '8bitアート', 'ピクセルスタイル', 'レトロアート', 'ピクセル変換'],
    },
    'ko-KR': {
      title: '픽셀 아트 생성기 - 이미지를 픽셀 아트로 변환 | CreatiKit',
      description: '무료 온라인 픽셀 아트 생성기. 이미지를 픽셀 아트 스타일로 변환하고, 사용자 정의 픽셀 크기, 색상 수 및 팔레트 선택을 지원합니다. 레트로 8bit 아트를 쉽게 만들 수 있습니다.',
      keywords: ['픽셀 아트', '픽셀 아트 생성기', '이미지를 픽셀으로', '8bit 아트', '픽셀 스타일', '레트로 아트', '픽셀 변환'],
    },
  },
  '/model-viewer': {
    'en': {
      title: '3D Model Viewer - Online 3D Model Preview Tool | CreatiKit',
      description: 'Free online 3D model viewer supporting multiple 3D file formats. Preview 3D models online with rotation, zoom, and interactive operations. Supports GLB, GLTF formats.',
      keywords: ['3D preview', '3D model viewer', 'GLB viewer', 'GLTF viewer', '3D viewer', 'online 3D', '3D model preview'],
    },
    'zh-CN': {
      title: '3D模型预览器 - 在线查看3D模型 | CreatiKit',
      description: '免费在线3D模型预览器，支持多种3D文件格式，可在线预览、旋转、缩放等交互操作。支持GLB、GLTF格式。',
      keywords: ['3D预览', '3D模型', 'GLB预览', 'GLTF预览', '3D查看器', '在线3D'],
    },
    'ja-JP': {
      title: '3Dモデルビューア - オンライン3Dモデルプレビュー | CreatiKit',
      description: '複数の3Dファイル形式をサポートする無料オンライン3Dモデルビューア。回転、ズーム、インタラクティブ操作で3Dモデルをオンラインでプレビュー。GLB、GLTF形式をサポート。',
      keywords: ['3Dプレビュー', '3Dモデル', 'GLBビューア', 'GLTFビューア', '3Dビューア', 'オンライン3D'],
    },
    'ko-KR': {
      title: '3D 모델 뷰어 - 온라인 3D 모델 미리보기 | CreatiKit',
      description: '다양한 3D 파일 형식을 지원하는 무료 온라인 3D 모델 뷰어. 회전, 확대/축소 및 대화형 작업으로 3D 모델을 온라인에서 미리볼 수 있습니다. GLB, GLTF 형식을 지원합니다.',
      keywords: ['3D 미리보기', '3D 모델', 'GLB 뷰어', 'GLTF 뷰어', '3D 뷰어', '온라인 3D'],
    },
  },
  '/color-palette': {
    'en': {
      title: 'Color Palette Tool - Professional Online Color Picker | CreatiKit',
      description: 'Professional online color palette tool supporting color selection, color scheme generation, and image color extraction. Help designers quickly find perfect color combinations.',
      keywords: ['color palette', 'color picker', 'color scheme', 'color tool', 'color extraction', 'design colors', 'color combination'],
    },
    'zh-CN': {
      title: '调色板工具 - 专业在线配色工具 | CreatiKit',
      description: '专业在线调色板工具，支持颜色选择、配色方案生成、图片取色功能，帮助设计师快速找到完美的配色方案。',
      keywords: ['调色板', '配色工具', '颜色选择器', '取色器', '配色方案', '色彩搭配'],
    },
    'ja-JP': {
      title: 'カラーパレットツール - プロフェッショナルオンラインカラーピッカー | CreatiKit',
      description: 'カラー選択、配色スキーム生成、画像カラー抽出をサポートするプロフェッショナルオンラインカラーパレットツール。デザイナーが完璧な配色を素早く見つけるのを支援します。',
      keywords: ['カラーパレット', 'カラーピッカー', '配色スキーム', 'カラーツール', 'カラー抽出', 'デザインカラー', '配色'],
    },
    'ko-KR': {
      title: '색상 팔레트 도구 - 전문 온라인 색상 선택기 | CreatiKit',
      description: '색상 선택, 색상 스키마 생성 및 이미지 색상 추출을 지원하는 전문 온라인 색상 팔레트 도구. 디자이너가 완벽한 색상 조합을 빠르게 찾을 수 있도록 도와줍니다.',
      keywords: ['색상 팔레트', '색상 선택기', '색상 스키마', '색상 도구', '색상 추출', '디자인 색상', '색상 조합'],
    },
  },
  '/qr-code-generator': {
    'en': {
      title: 'QR Code Generator - Free Online QR Code Maker | CreatiKit',
      description: 'Free online QR code generator. Quickly generate various QR codes supporting multiple content types, style customization, and file format export.',
      keywords: ['QR code generator', 'QR code maker', 'QR code tool', 'online QR code', 'QR code creator', 'barcode generator'],
    },
    'zh-CN': {
      title: '二维码生成器 - 免费在线生成二维码 | CreatiKit',
      description: '免费在线二维码生成器，快速生成各类二维码，支持多种内容类型、样式定制和文件格式导出。',
      keywords: ['二维码生成', 'QR码生成', '二维码制作', '在线二维码', '二维码工具'],
    },
    'ja-JP': {
      title: 'QRコード生成器 - 無料オンラインQRコード作成 | CreatiKit',
      description: '無料オンラインQRコード生成器。複数のコンテンツタイプ、スタイルカスタマイズ、ファイル形式エクスポートをサポートする様々なQRコードを迅速に生成します。',
      keywords: ['QRコード生成', 'QRコード作成', 'QRコードツール', 'オンラインQRコード', 'QRコードクリエイター'],
    },
    'ko-KR': {
      title: 'QR 코드 생성기 - 무료 온라인 QR 코드 제작 | CreatiKit',
      description: '무료 온라인 QR 코드 생성기. 다양한 콘텐츠 유형, 스타일 사용자 정의 및 파일 형식 내보내기를 지원하는 다양한 QR 코드를 빠르게 생성합니다.',
      keywords: ['QR 코드 생성', 'QR 코드 제작', 'QR 코드 도구', '온라인 QR 코드', 'QR 코드 생성기'],
    },
  },
  '/markdown-editor': {
    'en': {
      title: 'Markdown Editor - Free Online Markdown Editor & Preview | CreatiKit',
      description: 'Free online Markdown editor with real-time rendering and preview. Export to HTML or PDF format. All processing done locally in your browser.',
      keywords: ['markdown editor', 'online markdown', 'markdown preview', 'markdown tool', 'markdown converter', 'markdown to html'],
    },
    'zh-CN': {
      title: 'Markdown编辑器 - 免费在线Markdown编辑和预览 | CreatiKit',
      description: '免费在线Markdown编辑器，支持实时渲染和预览，可导出为HTML或PDF格式。所有处理在浏览器本地完成。',
      keywords: ['Markdown编辑器', '在线Markdown', 'Markdown预览', 'Markdown工具', 'Markdown转换', 'Markdown转HTML'],
    },
    'ja-JP': {
      title: 'Markdownエディタ - 無料オンラインMarkdown編集・プレビュー | CreatiKit',
      description: 'リアルタイムレンダリングとプレビューをサポートする無料オンラインMarkdownエディタ。HTMLまたはPDF形式にエクスポート可能。すべての処理はブラウザでローカルに実行されます。',
      keywords: ['Markdownエディタ', 'オンラインMarkdown', 'Markdownプレビュー', 'Markdownツール', 'Markdown変換', 'MarkdownからHTML'],
    },
    'ko-KR': {
      title: 'Markdown 에디터 - 무료 온라인 Markdown 편집 및 미리보기 | CreatiKit',
      description: '실시간 렌더링 및 미리보기를 지원하는 무료 온라인 Markdown 에디터. HTML 또는 PDF 형식으로 내보낼 수 있습니다. 모든 처리는 브라우저에서 로컬로 완료됩니다.',
      keywords: ['Markdown 에디터', '온라인 Markdown', 'Markdown 미리보기', 'Markdown 도구', 'Markdown 변환', 'Markdown을 HTML로'],
    },
  },
  '/whiteboard': {
    'en': {
      title: 'Online Whiteboard - Free Drawing & Sketching Tool | CreatiKit',
      description: 'Free online whiteboard tool with infinite canvas. Support brush, eraser, text input, and shape drawing. Perfect for brainstorming and collaboration.',
      keywords: ['online whiteboard', 'drawing tool', 'sketching tool', 'canvas tool', 'whiteboard app', 'online drawing'],
    },
    'zh-CN': {
      title: '在线白板 - 免费绘图和草图工具 | CreatiKit',
      description: '免费在线白板工具，提供无限大的画布，支持画笔、橡皮擦、文本输入和形状绘制等基本功能。适合头脑风暴和协作。',
      keywords: ['在线白板', '绘图工具', '画板工具', '在线绘图', '白板工具', '协作白板'],
    },
    'ja-JP': {
      title: 'オンラインホワイトボード - 無料描画・スケッチツール | CreatiKit',
      description: '無限のキャンバスを提供する無料オンラインホワイトボードツール。ブラシ、消しゴム、テキスト入力、形状描画をサポート。ブレインストーミングやコラボレーションに最適。',
      keywords: ['オンラインホワイトボード', '描画ツール', 'スケッチツール', 'キャンバスツール', 'ホワイトボードアプリ', 'オンライン描画'],
    },
    'ko-KR': {
      title: '온라인 화이트보드 - 무료 그리기 및 스케치 도구 | CreatiKit',
      description: '무한 캔버스를 제공하는 무료 온라인 화이트보드 도구. 브러시, 지우개, 텍스트 입력 및 도형 그리기를 지원합니다. 브레인스토밍 및 협업에 완벽합니다.',
      keywords: ['온라인 화이트보드', '그리기 도구', '스케치 도구', '캔버스 도구', '화이트보드 앱', '온라인 그리기'],
    },
  },
  '/svg-editor': {
    'en': {
      title: 'SVG Editor - Free Online SVG Path Editor | CreatiKit',
      description: 'Professional free online SVG editor supporting path drawing, shape creation, text editing, SVG file import/export, and real-time code preview. All processing done locally.',
      keywords: ['SVG editor', 'SVG tool', 'vector graphics editor', 'SVG path', 'online SVG', 'SVG creator', 'vector graphics'],
    },
    'zh-CN': {
      title: 'SVG编辑器 - 免费在线SVG路径编辑器 | CreatiKit',
      description: '专业免费在线SVG编辑器，支持路径绘制、形状创建、文本编辑、导入导出SVG文件，实时预览代码。所有处理在浏览器本地完成，保护您的隐私。',
      keywords: ['SVG编辑器', 'SVG编辑', 'SVG工具', '矢量图编辑', 'SVG路径', '在线SVG', 'SVG制作', '矢量图形'],
    },
    'ja-JP': {
      title: 'SVGエディタ - 無料オンラインSVGパスエディタ | CreatiKit',
      description: 'パス描画、形状作成、テキスト編集、SVGファイルのインポート/エクスポート、リアルタイムコードプレビューをサポートするプロフェッショナル無料オンラインSVGエディタ。すべての処理はローカルで実行されます。',
      keywords: ['SVGエディタ', 'SVGツール', 'ベクターグラフィックエディタ', 'SVGパス', 'オンラインSVG', 'SVG作成', 'ベクターグラフィック'],
    },
    'ko-KR': {
      title: 'SVG 에디터 - 무료 온라인 SVG 경로 에디터 | CreatiKit',
      description: '경로 그리기, 도형 생성, 텍스트 편집, SVG 파일 가져오기/내보내기 및 실시간 코드 미리보기를 지원하는 전문 무료 온라인 SVG 에디터. 모든 처리는 로컬로 완료됩니다.',
      keywords: ['SVG 에디터', 'SVG 도구', '벡터 그래픽 에디터', 'SVG 경로', '온라인 SVG', 'SVG 생성기', '벡터 그래픽'],
    },
  },
  '/css-animator': {
    'en': {
      title: 'CSS Animator - Free Online CSS Animation Generator | CreatiKit',
      description: 'Free online CSS animation generator. Create beautiful CSS animations with keyframes, transitions, and transforms. Export CSS code directly.',
      keywords: ['CSS animation', 'CSS animator', 'animation generator', 'CSS keyframes', 'CSS transitions', 'animation tool'],
    },
    'zh-CN': {
      title: 'CSS动画生成器 - 免费在线CSS动画制作工具 | CreatiKit',
      description: '免费在线CSS动画生成器，使用关键帧、过渡和变换创建精美的CSS动画。直接导出CSS代码。',
      keywords: ['CSS动画', 'CSS动画生成器', '动画制作', 'CSS关键帧', 'CSS过渡', '动画工具'],
    },
    'ja-JP': {
      title: 'CSSアニメーター - 無料オンラインCSSアニメーション生成器 | CreatiKit',
      description: '無料オンラインCSSアニメーション生成器。キーフレーム、トランジション、トランスフォームを使用して美しいCSSアニメーションを作成。CSSコードを直接エクスポート。',
      keywords: ['CSSアニメーション', 'CSSアニメーター', 'アニメーション生成', 'CSSキーフレーム', 'CSSトランジション', 'アニメーションツール'],
    },
    'ko-KR': {
      title: 'CSS 애니메이터 - 무료 온라인 CSS 애니메이션 생성기 | CreatiKit',
      description: '무료 온라인 CSS 애니메이션 생성기. 키프레임, 트랜지션 및 변환을 사용하여 아름다운 CSS 애니메이션을 만듭니다. CSS 코드를 직접 내보냅니다.',
      keywords: ['CSS 애니메이션', 'CSS 애니메이터', '애니메이션 생성', 'CSS 키프레임', 'CSS 트랜지션', '애니메이션 도구'],
    },
  },
  '/audio-visualizer': {
    'en': {
      title: 'Audio Visualizer - Free Online Audio Spectrum Analyzer | CreatiKit',
      description: 'Free online audio visualizer and spectrum analyzer. Visualize audio waveforms, frequency spectrum, and create stunning audio visualizations.',
      keywords: ['audio visualizer', 'spectrum analyzer', 'audio waveform', 'frequency analyzer', 'audio visualization', 'sound visualizer'],
    },
    'zh-CN': {
      title: '音频可视化 - 免费在线音频频谱分析器 | CreatiKit',
      description: '免费在线音频可视化和频谱分析器。可视化音频波形、频谱，创建令人惊叹的音频可视化效果。',
      keywords: ['音频可视化', '频谱分析', '音频波形', '频率分析', '音频可视化工具', '声音可视化'],
    },
    'ja-JP': {
      title: 'オーディオビジュアライザー - 無料オンラインオーディオスペクトラムアナライザー | CreatiKit',
      description: '無料オンラインオーディオビジュアライザーとスペクトラムアナライザー。オーディオ波形、周波数スペクトラムを可視化し、素晴らしいオーディオビジュアライゼーションを作成。',
      keywords: ['オーディオビジュアライザー', 'スペクトラムアナライザー', 'オーディオ波形', '周波数アナライザー', 'オーディオ可視化', 'サウンドビジュアライザー'],
    },
    'ko-KR': {
      title: '오디오 비주얼라이저 - 무료 온라인 오디오 스펙트럼 분석기 | CreatiKit',
      description: '무료 온라인 오디오 비주얼라이저 및 스펙트럼 분석기. 오디오 파형, 주파수 스펙트럼을 시각화하고 멋진 오디오 비주얼라이제이션을 만듭니다.',
      keywords: ['오디오 비주얼라이저', '스펙트럼 분석기', '오디오 파형', '주파수 분석기', '오디오 시각화', '사운드 비주얼라이저'],
    },
  },
  '/particle-editor': {
    'en': {
      title: 'Particle Editor - Free Online Particle Effect Generator | CreatiKit',
      description: 'Free online particle editor and effect generator. Create stunning particle effects, animations, and visual effects with customizable parameters.',
      keywords: ['particle editor', 'particle effects', 'particle system', 'visual effects', 'animation effects', 'particle generator'],
    },
    'zh-CN': {
      title: '粒子编辑器 - 免费在线粒子特效生成器 | CreatiKit',
      description: '免费在线粒子编辑器和特效生成器。使用可自定义参数创建令人惊叹的粒子效果、动画和视觉效果。',
      keywords: ['粒子编辑器', '粒子特效', '粒子系统', '视觉效果', '动画特效', '粒子生成器'],
    },
    'ja-JP': {
      title: 'パーティクルエディタ - 無料オンラインパーティクルエフェクト生成器 | CreatiKit',
      description: '無料オンラインパーティクルエディタとエフェクト生成器。カスタマイズ可能なパラメータで素晴らしいパーティクルエフェクト、アニメーション、視覚効果を作成。',
      keywords: ['パーティクルエディタ', 'パーティクルエフェクト', 'パーティクルシステム', '視覚効果', 'アニメーションエフェクト', 'パーティクル生成器'],
    },
    'ko-KR': {
      title: '파티클 에디터 - 무료 온라인 파티클 효과 생성기 | CreatiKit',
      description: '무료 온라인 파티클 에디터 및 효과 생성기. 사용자 정의 가능한 매개변수로 멋진 파티클 효과, 애니메이션 및 시각 효과를 만듭니다.',
      keywords: ['파티클 에디터', '파티클 효과', '파티클 시스템', '시각 효과', '애니메이션 효과', '파티클 생성기'],
    },
  },
  '/gif-tool': {
    'en': {
      title: 'GIF Tool - Free Online GIF Splitter & Combiner | CreatiKit',
      description: 'Free online GIF tool for splitting and combining GIF files. Extract frames from GIFs, combine images into GIFs, and create animated GIFs easily.',
      keywords: ['GIF tool', 'GIF splitter', 'GIF combiner', 'GIF editor', 'animated GIF', 'GIF maker'],
    },
    'zh-CN': {
      title: 'GIF工具 - 免费在线GIF分解和合成器 | CreatiKit',
      description: '免费在线GIF工具，用于分解和合成GIF文件。从GIF中提取帧，将图片合成为GIF，轻松创建动画GIF。',
      keywords: ['GIF工具', 'GIF分解', 'GIF合成', 'GIF编辑', '动画GIF', 'GIF制作'],
    },
    'ja-JP': {
      title: 'GIFツール - 無料オンラインGIF分割・結合ツール | CreatiKit',
      description: 'GIFファイルの分割と結合のための無料オンラインGIFツール。GIFからフレームを抽出し、画像をGIFに結合して、アニメーションGIFを簡単に作成。',
      keywords: ['GIFツール', 'GIF分割', 'GIF結合', 'GIF編集', 'アニメーションGIF', 'GIF作成'],
    },
    'ko-KR': {
      title: 'GIF 도구 - 무료 온라인 GIF 분할 및 결합 도구 | CreatiKit',
      description: 'GIF 파일 분할 및 결합을 위한 무료 온라인 GIF 도구. GIF에서 프레임을 추출하고 이미지를 GIF로 결합하여 애니메이션 GIF를 쉽게 만듭니다.',
      keywords: ['GIF 도구', 'GIF 분할', 'GIF 결합', 'GIF 편집', '애니메이션 GIF', 'GIF 제작'],
    },
  },
  '/hash-calculator': {
    'en': {
      title: 'Hash Calculator - Free Online Hash Generator | CreatiKit',
      description: 'Free online hash calculator supporting MD5, SHA-1, SHA-256, SHA-512 and more. Generate hash values for text and files instantly.',
      keywords: ['hash calculator', 'MD5 calculator', 'SHA calculator', 'hash generator', 'hash tool', 'checksum calculator'],
    },
    'zh-CN': {
      title: '哈希计算器 - 免费在线哈希值生成器 | CreatiKit',
      description: '免费在线哈希计算器，支持MD5、SHA-1、SHA-256、SHA-512等多种算法。即时为文本和文件生成哈希值。',
      keywords: ['哈希计算', 'MD5计算', 'SHA计算', '哈希生成器', '哈希工具', '校验和计算'],
    },
    'ja-JP': {
      title: 'ハッシュ計算機 - 無料オンラインハッシュ生成器 | CreatiKit',
      description: 'MD5、SHA-1、SHA-256、SHA-512などをサポートする無料オンラインハッシュ計算機。テキストとファイルのハッシュ値を即座に生成。',
      keywords: ['ハッシュ計算', 'MD5計算', 'SHA計算', 'ハッシュ生成器', 'ハッシュツール', 'チェックサム計算'],
    },
    'ko-KR': {
      title: '해시 계산기 - 무료 온라인 해시 생성기 | CreatiKit',
      description: 'MD5, SHA-1, SHA-256, SHA-512 등을 지원하는 무료 온라인 해시 계산기. 텍스트 및 파일의 해시 값을 즉시 생성합니다.',
      keywords: ['해시 계산', 'MD5 계산', 'SHA 계산', '해시 생성기', '해시 도구', '체크섬 계산'],
    },
  },
  '/timestamp-converter': {
    'en': {
      title: 'Timestamp Converter - Free Online Unix Timestamp Tool | CreatiKit',
      description: 'Free online timestamp converter. Convert Unix timestamps to readable dates and vice versa. Support multiple timezones and formats.',
      keywords: ['timestamp converter', 'Unix timestamp', 'date converter', 'time converter', 'epoch converter', 'timestamp tool'],
    },
    'zh-CN': {
      title: '时间戳转换器 - 免费在线Unix时间戳工具 | CreatiKit',
      description: '免费在线时间戳转换器。将Unix时间戳转换为可读日期，反之亦然。支持多种时区和格式。',
      keywords: ['时间戳转换', 'Unix时间戳', '日期转换', '时间转换', '时间戳工具', '时间戳计算'],
    },
    'ja-JP': {
      title: 'タイムスタンプ変換器 - 無料オンラインUnixタイムスタンプツール | CreatiKit',
      description: '無料オンラインタイムスタンプ変換器。Unixタイムスタンプを読み取り可能な日付に変換、またはその逆。複数のタイムゾーンと形式をサポート。',
      keywords: ['タイムスタンプ変換', 'Unixタイムスタンプ', '日付変換', '時間変換', 'タイムスタンプツール', 'タイムスタンプ計算'],
    },
    'ko-KR': {
      title: '타임스탬프 변환기 - 무료 온라인 Unix 타임스탬프 도구 | CreatiKit',
      description: '무료 온라인 타임스탬프 변환기. Unix 타임스탬프를 읽을 수 있는 날짜로 변환하거나 그 반대로 변환합니다. 여러 시간대 및 형식을 지원합니다.',
      keywords: ['타임스탬프 변환', 'Unix 타임스탬프', '날짜 변환', '시간 변환', '타임스탬프 도구', '타임스탬프 계산'],
    },
  },
  '/text-analyzer': {
    'en': {
      title: 'Text Analyzer - Free Online SEO & Text Analysis Tool | CreatiKit',
      description: 'Free online text analyzer and SEO tool. Analyze keyword density, readability score, text statistics, and optimize your content for better SEO.',
      keywords: ['text analyzer', 'SEO analyzer', 'keyword density', 'readability score', 'text analysis', 'content optimization'],
    },
    'zh-CN': {
      title: '文本分析器 - 免费在线SEO和文本分析工具 | CreatiKit',
      description: '免费在线文本分析器和SEO工具。分析关键词密度、可读性评分、文本统计，优化您的内容以获得更好的SEO效果。',
      keywords: ['文本分析', 'SEO分析', '关键词密度', '可读性评分', '文本统计', '内容优化'],
    },
    'ja-JP': {
      title: 'テキストアナライザー - 無料オンラインSEO・テキスト分析ツール | CreatiKit',
      description: '無料オンラインテキストアナライザーとSEOツール。キーワード密度、可読性スコア、テキスト統計を分析し、より良いSEOのためにコンテンツを最適化。',
      keywords: ['テキスト分析', 'SEO分析', 'キーワード密度', '可読性スコア', 'テキスト統計', 'コンテンツ最適化'],
    },
    'ko-KR': {
      title: '텍스트 분석기 - 무료 온라인 SEO 및 텍스트 분석 도구 | CreatiKit',
      description: '무료 온라인 텍스트 분석기 및 SEO 도구. 키워드 밀도, 가독성 점수, 텍스트 통계를 분석하고 더 나은 SEO를 위해 콘텐츠를 최적화합니다.',
      keywords: ['텍스트 분석', 'SEO 분석', '키워드 밀도', '가독성 점수', '텍스트 통계', '콘텐츠 최적화'],
    },
  },
  '/code-tools': {
    'en': {
      title: 'Code Tools - Free Online Code Formatter & Minifier | CreatiKit',
      description: 'Free online code tools including code formatter, minifier, and transformer. Support JavaScript, TypeScript, HTML, CSS, Python, JSON, XML and more.',
      keywords: ['code formatter', 'code minifier', 'code tools', 'JavaScript formatter', 'code beautifier', 'code transformer'],
    },
    'zh-CN': {
      title: '代码工具 - 免费在线代码格式化和压缩工具 | CreatiKit',
      description: '免费在线代码工具，包括代码格式化、压缩和转换。支持JavaScript、TypeScript、HTML、CSS、Python、JSON、XML等多种语言。',
      keywords: ['代码格式化', '代码压缩', '代码工具', 'JavaScript格式化', '代码美化', '代码转换'],
    },
    'ja-JP': {
      title: 'コードツール - 無料オンラインコードフォーマッター・圧縮ツール | CreatiKit',
      description: 'コードフォーマッター、圧縮、変換を含む無料オンラインコードツール。JavaScript、TypeScript、HTML、CSS、Python、JSON、XMLなどをサポート。',
      keywords: ['コードフォーマッター', 'コード圧縮', 'コードツール', 'JavaScriptフォーマッター', 'コード美化', 'コード変換'],
    },
    'ko-KR': {
      title: '코드 도구 - 무료 온라인 코드 포맷터 및 압축 도구 | CreatiKit',
      description: '코드 포맷터, 압축 및 변환을 포함한 무료 온라인 코드 도구. JavaScript, TypeScript, HTML, CSS, Python, JSON, XML 등을 지원합니다.',
      keywords: ['코드 포맷터', '코드 압축', '코드 도구', 'JavaScript 포맷터', '코드 미화', '코드 변환'],
    },
  },
  '/weather-tool': {
    'en': {
      title: 'Weather Tool - Free Online Weather Forecast | CreatiKit',
      description: 'Free online weather tool providing accurate weather forecasts, current conditions, and weather information for any location worldwide.',
      keywords: ['weather forecast', 'weather tool', 'weather app', 'weather information', 'current weather', 'weather data'],
    },
    'zh-CN': {
      title: '天气预报工具 - 免费在线天气查询 | CreatiKit',
      description: '免费在线天气预报工具，提供准确的天气预报、当前天气状况和全球任何地点的天气信息。',
      keywords: ['天气预报', '天气工具', '天气查询', '天气信息', '当前天气', '天气数据'],
    },
    'ja-JP': {
      title: '天気ツール - 無料オンライン天気予報 | CreatiKit',
      description: '正確な天気予報、現在の天気状況、世界中のあらゆる場所の天気情報を提供する無料オンライン天気ツール。',
      keywords: ['天気予報', '天気ツール', '天気アプリ', '天気情報', '現在の天気', '天気データ'],
    },
    'ko-KR': {
      title: '날씨 도구 - 무료 온라인 날씨 예보 | CreatiKit',
      description: '정확한 날씨 예보, 현재 날씨 조건 및 전 세계 어느 위치의 날씨 정보를 제공하는 무료 온라인 날씨 도구.',
      keywords: ['날씨 예보', '날씨 도구', '날씨 앱', '날씨 정보', '현재 날씨', '날씨 데이터'],
    },
  },
  '/data-to-chart': {
    'en': {
      title: 'Data to Chart - Free Online Chart Generator | CreatiKit',
      description: 'Free online chart generator. Convert CSV data, JSON data, or manual input into beautiful charts and graphs. Support multiple chart types.',
      keywords: ['chart generator', 'data visualization', 'CSV to chart', 'graph generator', 'data charts', 'chart tool'],
    },
    'zh-CN': {
      title: '数据转图表 - 免费在线图表生成器 | CreatiKit',
      description: '免费在线图表生成器。将CSV数据、JSON数据或手动输入转换为精美的图表和图形。支持多种图表类型。',
      keywords: ['图表生成', '数据可视化', 'CSV转图表', '图表工具', '数据图表', '图表制作'],
    },
    'ja-JP': {
      title: 'データからチャート - 無料オンラインチャート生成器 | CreatiKit',
      description: '無料オンラインチャート生成器。CSVデータ、JSONデータ、または手動入力を美しいチャートやグラフに変換。複数のチャートタイプをサポート。',
      keywords: ['チャート生成', 'データ可視化', 'CSVからチャート', 'グラフ生成', 'データチャート', 'チャートツール'],
    },
    'ko-KR': {
      title: '데이터를 차트로 - 무료 온라인 차트 생성기 | CreatiKit',
      description: '무료 온라인 차트 생성기. CSV 데이터, JSON 데이터 또는 수동 입력을 아름다운 차트 및 그래프로 변환합니다. 여러 차트 유형을 지원합니다.',
      keywords: ['차트 생성', '데이터 시각화', 'CSV를 차트로', '그래프 생성', '데이터 차트', '차트 도구'],
    },
  },
  '/piano': {
    'en': {
      title: 'Online Piano - Free Virtual Piano Keyboard | CreatiKit',
      description: 'Free online piano and virtual keyboard. Play piano with your computer keyboard or mouse. Perfect for learning music and practicing piano.',
      keywords: ['online piano', 'virtual piano', 'piano keyboard', 'piano app', 'music practice', 'piano simulator'],
    },
    'zh-CN': {
      title: '在线钢琴 - 免费虚拟钢琴键盘 | CreatiKit',
      description: '免费在线钢琴和虚拟键盘。使用电脑键盘或鼠标弹奏钢琴。适合学习音乐和练习钢琴。',
      keywords: ['在线钢琴', '虚拟钢琴', '钢琴键盘', '钢琴应用', '音乐练习', '钢琴模拟器'],
    },
    'ja-JP': {
      title: 'オンラインピアノ - 無料仮想ピアノキーボード | CreatiKit',
      description: '無料オンラインピアノと仮想キーボード。コンピューターのキーボードやマウスでピアノを演奏。音楽学習やピアノ練習に最適。',
      keywords: ['オンラインピアノ', '仮想ピアノ', 'ピアノキーボード', 'ピアノアプリ', '音楽練習', 'ピアノシミュレーター'],
    },
    'ko-KR': {
      title: '온라인 피아노 - 무료 가상 피아노 키보드 | CreatiKit',
      description: '무료 온라인 피아노 및 가상 키보드. 컴퓨터 키보드 또는 마우스로 피아노를 연주합니다. 음악 학습 및 피아노 연습에 완벽합니다.',
      keywords: ['온라인 피아노', '가상 피아노', '피아노 키보드', '피아노 앱', '음악 연습', '피아노 시뮬레이터'],
    },
  },
  '/physics-lab': {
    'en': {
      title: 'Physics Lab - Free Online Physics Simulation | CreatiKit',
      description: 'Free online physics laboratory and simulation tool. Explore physics concepts through interactive experiments and simulations.',
      keywords: ['physics lab', 'physics simulation', 'physics experiments', 'interactive physics', 'physics tool', 'science simulation'],
    },
    'zh-CN': {
      title: '物理实验室 - 免费在线物理模拟 | CreatiKit',
      description: '免费在线物理实验室和模拟工具。通过交互式实验和模拟探索物理概念。',
      keywords: ['物理实验室', '物理模拟', '物理实验', '交互式物理', '物理工具', '科学模拟'],
    },
    'ja-JP': {
      title: '物理実験室 - 無料オンライン物理シミュレーション | CreatiKit',
      description: '無料オンライン物理実験室とシミュレーションツール。インタラクティブな実験とシミュレーションを通じて物理概念を探求。',
      keywords: ['物理実験室', '物理シミュレーション', '物理実験', 'インタラクティブ物理', '物理ツール', '科学シミュレーション'],
    },
    'ko-KR': {
      title: '물리 실험실 - 무료 온라인 물리 시뮬레이션 | CreatiKit',
      description: '무료 온라인 물리 실험실 및 시뮬레이션 도구. 대화형 실험 및 시뮬레이션을 통해 물리 개념을 탐구합니다.',
      keywords: ['물리 실험실', '물리 시뮬레이션', '물리 실험', '대화형 물리', '물리 도구', '과학 시뮬레이션'],
    },
  },
  '/chemistry-lab': {
    'en': {
      title: 'Chemistry Lab - Free Online Chemistry Simulation | CreatiKit',
      description: 'Free online chemistry laboratory and simulation tool. Safely explore chemical reactions, experiments, and chemistry concepts through interactive simulations.',
      keywords: ['chemistry lab', 'chemistry simulation', 'chemical reactions', 'chemistry experiments', 'interactive chemistry', 'science lab'],
    },
    'zh-CN': {
      title: '化学实验室 - 免费在线化学模拟 | CreatiKit',
      description: '免费在线化学实验室和模拟工具。通过交互式模拟安全地探索化学反应、实验和化学概念。',
      keywords: ['化学实验室', '化学模拟', '化学反应', '化学实验', '交互式化学', '科学实验室'],
    },
    'ja-JP': {
      title: '化学実験室 - 無料オンライン化学シミュレーション | CreatiKit',
      description: '無料オンライン化学実験室とシミュレーションツール。インタラクティブなシミュレーションを通じて化学反応、実験、化学概念を安全に探求。',
      keywords: ['化学実験室', '化学シミュレーション', '化学反応', '化学実験', 'インタラクティブ化学', '科学実験室'],
    },
    'ko-KR': {
      title: '화학 실험실 - 무료 온라인 화학 시뮬레이션 | CreatiKit',
      description: '무료 온라인 화학 실험실 및 시뮬레이션 도구. 대화형 시뮬레이션을 통해 화학 반응, 실험 및 화학 개념을 안전하게 탐구합니다.',
      keywords: ['화학 실험실', '화학 시뮬레이션', '화학 반응', '화학 실험', '대화형 화학', '과학 실험실'],
    },
  },
  '/ecosystem-sandbox': {
    'en': {
      title: 'Ecosystem Sandbox - Free Online Ecosystem Simulation | CreatiKit',
      description: 'Free online ecosystem sandbox and simulation tool. Observe organisms, ecosystems, and biological interactions in an interactive sandbox environment.',
      keywords: ['ecosystem simulation', 'biology sandbox', 'ecosystem tool', 'biological simulation', 'ecology tool', 'science simulation'],
    },
    'zh-CN': {
      title: '生物沙盒 - 免费在线生态系统模拟 | CreatiKit',
      description: '免费在线生物沙盒和模拟工具。在交互式沙盒环境中观察生物、生态系统和生物相互作用。',
      keywords: ['生态系统模拟', '生物沙盒', '生态系统工具', '生物模拟', '生态学工具', '科学模拟'],
    },
    'ja-JP': {
      title: '生態系サンドボックス - 無料オンライン生態系シミュレーション | CreatiKit',
      description: '無料オンライン生態系サンドボックスとシミュレーションツール。インタラクティブなサンドボックス環境で生物、生態系、生物学的相互作用を観察。',
      keywords: ['生態系シミュレーション', '生物学サンドボックス', '生態系ツール', '生物シミュレーション', '生態学ツール', '科学シミュレーション'],
    },
    'ko-KR': {
      title: '생태계 샌드박스 - 무료 온라인 생태계 시뮬레이션 | CreatiKit',
      description: '무료 온라인 생태계 샌드박스 및 시뮬레이션 도구. 대화형 샌드박스 환경에서 생물, 생태계 및 생물학적 상호작용을 관찰합니다.',
      keywords: ['생태계 시뮬레이션', '생물학 샌드박스', '생태계 도구', '생물 시뮬레이션', '생태학 도구', '과학 시뮬레이션'],
    },
  },
  '/emoji-collection': {
    'en': {
      title: 'Emoji Collection - Free Online Emoji Library | CreatiKit',
      description: 'Free online emoji collection and library. Browse, search, and copy emojis easily. Find the perfect emoji for your messages and content.',
      keywords: ['emoji collection', 'emoji library', 'emoji tool', 'emoji search', 'emoji picker', 'emoji database'],
    },
    'zh-CN': {
      title: 'Emoji大全 - 免费在线表情符号库 | CreatiKit',
      description: '免费在线表情符号集合和库。轻松浏览、搜索和复制表情符号。为您的消息和内容找到完美的表情符号。',
      keywords: ['表情符号', 'Emoji大全', '表情符号库', '表情符号搜索', '表情符号选择器', 'Emoji工具'],
    },
    'ja-JP': {
      title: '絵文字コレクション - 無料オンライン絵文字ライブラリ | CreatiKit',
      description: '無料オンライン絵文字コレクションとライブラリ。絵文字を簡単に閲覧、検索、コピー。メッセージやコンテンツに最適な絵文字を見つけます。',
      keywords: ['絵文字コレクション', '絵文字ライブラリ', '絵文字ツール', '絵文字検索', '絵文字ピッカー', '絵文字データベース'],
    },
    'ko-KR': {
      title: '이모지 컬렉션 - 무료 온라인 이모지 라이브러리 | CreatiKit',
      description: '무료 온라인 이모지 컬렉션 및 라이브러리. 이모지를 쉽게 탐색, 검색 및 복사합니다. 메시지 및 콘텐츠에 완벽한 이모지를 찾습니다.',
      keywords: ['이모지 컬렉션', '이모지 라이브러리', '이모지 도구', '이모지 검색', '이모지 선택기', '이모지 데이터베이스'],
    },
  },
  '/camera-gesture-drawing': {
    'en': {
      title: 'Camera Gesture Drawing - Free Online Air Drawing Tool | CreatiKit',
      description: 'Free online camera gesture drawing tool. Draw in the air using hand gestures captured by your webcam. Create art with motion and gestures.',
      keywords: ['gesture drawing', 'air drawing', 'camera drawing', 'motion drawing', 'gesture control', 'webcam drawing'],
    },
    'zh-CN': {
      title: '隔空写字 - 免费在线手势绘图工具 | CreatiKit',
      description: '免费在线摄像头手势绘图工具。使用网络摄像头捕捉的手势在空中绘制。通过动作和手势创作艺术。',
      keywords: ['隔空写字', '手势绘图', '摄像头绘图', '动作绘图', '手势控制', '手势识别'],
    },
    'ja-JP': {
      title: 'カメラジェスチャー描画 - 無料オンライン空中描画ツール | CreatiKit',
      description: '無料オンラインカメラジェスチャー描画ツール。ウェブカメラでキャプチャした手のジェスチャーを使用して空中に描画。動きとジェスチャーでアートを作成。',
      keywords: ['ジェスチャー描画', '空中描画', 'カメラ描画', 'モーション描画', 'ジェスチャー制御', 'ウェブカメラ描画'],
    },
    'ko-KR': {
      title: '카메라 제스처 그리기 - 무료 온라인 공중 그리기 도구 | CreatiKit',
      description: '무료 온라인 카메라 제스처 그리기 도구. 웹캠으로 캡처한 손 제스처를 사용하여 공중에 그립니다. 움직임과 제스처로 예술을 만듭니다.',
      keywords: ['제스처 그리기', '공중 그리기', '카메라 그리기', '모션 그리기', '제스처 제어', '웹캠 그리기'],
    },
  },
  // 其他工具可以逐步添加...
  // 注意：如果工具没有配置，会使用默认元数据
};

/**
 * 根据路径和语言获取工具元数据
 */
export function getToolMetadata(path: string, locale: Locale): Metadata {
  const config = toolMetadataConfig[path];
  if (!config) {
    // 如果没有配置，返回默认元数据
    return getDefaultToolMetadata(locale);
  }

  const localeConfig = config[locale] || config['en']; // 如果当前语言没有配置，使用英文
  const localizedPath = locale === 'en' ? path : `/${locale}${path}`;

  return {
    title: localeConfig.title,
    description: localeConfig.description,
    keywords: localeConfig.keywords,
    openGraph: {
      title: localeConfig.title,
      description: localeConfig.description,
      url: `${baseUrl}${localizedPath}`,
      siteName: 'CreatiKit.io',
      type: 'website',
      locale: locale === 'zh-CN' ? 'zh_CN' : locale === 'ja-JP' ? 'ja_JP' : locale === 'ko-KR' ? 'ko_KR' : 'en_US',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: localeConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: localeConfig.title,
      description: localeConfig.description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${baseUrl}${localizedPath}`,
      languages: {
        'zh-CN': `${baseUrl}/zh-CN${path}`,
        'en': `${baseUrl}/en${path}`,
        'ja-JP': `${baseUrl}/ja-JP${path}`,
        'ko-KR': `${baseUrl}/ko-KR${path}`,
        'x-default': `${baseUrl}/en${path}`,
      },
    },
  };
}

/**
 * 获取默认工具元数据（当工具没有配置时使用）
 */
function getDefaultToolMetadata(locale: Locale): Metadata {
  const defaultConfig = {
    'en': {
      title: 'Tool - CreatiKit',
      description: 'Free online creative tool on CreatiKit.io',
      keywords: ['online tool', 'free tool', 'creatikit'],
    },
    'zh-CN': {
      title: '工具 - CreatiKit',
      description: 'CreatiKit.io 上的免费在线创意工具',
      keywords: ['在线工具', '免费工具', 'creatikit'],
    },
    'ja-JP': {
      title: 'ツール - CreatiKit',
      description: 'CreatiKit.ioの無料オンラインツール',
      keywords: ['オンラインツール', '無料ツール', 'creatikit'],
    },
    'ko-KR': {
      title: '도구 - CreatiKit',
      description: 'CreatiKit.io의 무료 온라인 도구',
      keywords: ['온라인 도구', '무료 도구', 'creatikit'],
    },
  };

  const config = defaultConfig[locale] || defaultConfig['en'];
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
  };
}

