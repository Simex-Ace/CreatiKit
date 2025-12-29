// 工具配置映射
export const TOOLS_CONFIG: Record<string, { name: string; path: string }> = {
  '/chemistry-lab': { name: '交互式2D化学实验室', path: '/chemistry-lab' },
  '/compress': { name: '图片压缩工具', path: '/compress' },
  '/model-viewer': { name: '3D模型预览器', path: '/model-viewer' },
  '/ecosystem-sandbox': { name: '生物沙盒模拟', path: '/ecosystem-sandbox' },
  '/background-remover': { name: '魔法背景移除', path: '/background-remover' },
  '/camera-gesture-drawing': { name: '隔空写字', path: '/camera-gesture-drawing' },
  '/code-tools': { name: '代码工具', path: '/code-tools' },
  '/markdown-editor': { name: 'Markdown编辑器', path: '/markdown-editor' },
  '/color-palette': { name: '调色板工具', path: '/color-palette' },
  '/text-analyzer': { name: 'SEO分析与文本优化', path: '/text-analyzer' },
  '/qr-code-generator': { name: '二维码生成器', path: '/qr-code-generator' },
  '/emoji-collection': { name: 'Emoji大全', path: '/emoji-collection' },
  '/pixel-art-generator': { name: '像素艺术生成器', path: '/pixel-art-generator' },
  '/hash-calculator': { name: '哈希/散列值计算器', path: '/hash-calculator' },
  '/timestamp-converter': { name: 'Unix 时间戳转换器', path: '/timestamp-converter' },
  '/whiteboard': { name: '在线白板', path: '/whiteboard' },
  '/gif-tool': { name: 'GIF分解/合成器', path: '/gif-tool' },
  '/weather-tool': { name: '天气预报工具', path: '/weather-tool' },
  '/data-to-chart': { name: '数据转图表', path: '/data-to-chart' },
  '/piano': { name: '在线钢琴', path: '/piano' },
  '/physics-lab': { name: '物理实验室', path: '/physics-lab' },
};

export function getToolName(path: string): string {
  return TOOLS_CONFIG[path]?.name || path;
}

